import { supabaseAdmin } from '../../config/supabase'
import { sendTournamentResultEmail } from '../../lib/tournamentResultEmail'

// ============================================================================
// CHESS TOURNAMENT — bracket/fixture foundation
//
// This module owns *pairing and progression logic only*. It never touches
// chess rules — every individual match is a normal chess_rooms row, played
// through the existing ChessArena.tsx / chess.js / react-chessboard stack
// exactly like H2H games. This file just decides who plays whom and when,
// and reads back winner_id to advance the bracket or standings table.
// ============================================================================

const ROUND_NAMES: Record<number, string> = {
  2: 'Final',
  4: 'Semifinal',
  8: 'Quarterfinal',
  16: 'Round of 16',
  32: 'Round of 32',
  64: 'Round of 64',
}

// ── Break between rounds ────────────────────────────────────────────────────
// Previously, the moment the last game of a round finished (or a draw needed
// a rematch), the next match was created *already active* — clock running,
// no warning, no break. Real tournaments (World Cup included) always have a
// scheduled gap between matches: time to see the result, breathe, and get a
// "your match starts soon" notice. This is that gap: the next pairing is
// recorded immediately (so the bracket/fixture list updates right away) but
// stays `status: 'scheduled'` with a future `scheduled_at`, and a cron job
// (see startScheduledFixtures below) is what actually creates the live
// chess_room once that time arrives — which is also what makes the existing
// 30-minute / 5-minute match reminder emails and push notifications
// (chessReminders.ts) actually have something to fire on; before this change
// nothing ever stayed in 'scheduled' long enough for them to trigger.
const ROUND_GAP_MINUTES = 20
// Gap between each internal round-robin round within a group stage — long
// enough for a game at this tournament's time control to realistically
// finish before a player's next group match kicks off.
const GROUP_ROUND_GAP_MINUTES = 45

// Circle-method round-robin scheduler: splits a group's pairings into
// internal "rounds" where every player appears in at most one match per
// round. This is what makes staggering kickoff times per player possible —
// without it, every match in the group would need to share one timestamp,
// which is what caused every one of a player's group matches to show the
// exact same "kicks off" time (a player can only play one game at a time).
function scheduleGroupRoundRobin<T>(players: T[]): [T, T][][] {
  const list: (T | null)[] = [...players]
  if (list.length % 2 !== 0) list.push(null) // bye slot for odd-sized groups
  const n = list.length
  const rounds: [T, T][][] = []

  for (let round = 0; round < n - 1; round++) {
    const pairs: [T, T][] = []
    for (let i = 0; i < n / 2; i++) {
      const p1 = list[i]
      const p2 = list[n - 1 - i]
      if (p1 !== null && p2 !== null) pairs.push([p1, p2])
    }
    rounds.push(pairs)
    // Rotate everyone except the fixed first slot
    list.splice(1, 0, list.pop() as T | null)
  }
  return rounds
}

function roundNameForPlayerCount(playersRemainingBeforeRound: number): string {
  return ROUND_NAMES[playersRemainingBeforeRound] ?? `Round of ${playersRemainingBeforeRound}`
}

function getInitialBoard(whiteTimeSecs: number, blackTimeSecs: number = whiteTimeSecs, incrementSecs: number = 5) {
  return {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    last_move: null,
    white_time: whiteTimeSecs,
    black_time: blackTimeSecs,
    increment_secs: incrementSecs,
    turn_started_at: new Date().toISOString(),
  }
}

// ── Seeding ─────────────────────────────────────────────────────────────────
// Simple, fair shuffle-based seeding. Could later be replaced with rating-
// based seeding once players have a chess rating, but random is the right
// default for a new competitive feature with no rating history yet.
function shufflePlayers<T>(players: T[]): T[] {
  const arr = [...players]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ── Create a single chess_rooms match for a fixture, both players pre-assigned ──
export async function createFixtureMatch(
  fixtureId: string,
  player1Id: string,
  player2Id: string,
  whiteTimeControlSecs: number,
  blackTimeControlSecs: number = whiteTimeControlSecs,
  incrementSecs: number = 5
) {
  const code = `TRN-${fixtureId.slice(0, 8).toUpperCase()}`

  const { data: room, error } = await supabaseAdmin
    .from('chess_rooms')
    .insert({
      code,
      host_id: player1Id,   // white
      guest_id: player2Id,  // black
      stake: 0,              // entry fee was already paid at tournament registration
      status: 'active',
      board_state: getInitialBoard(whiteTimeControlSecs, blackTimeControlSecs, incrementSecs),
      current_turn: player1Id,
    })
    .select()
    .single()

  if (error) throw error

  await supabaseAdmin
    .from('chess_tournament_fixtures')
    .update({ chess_room_id: room.id, status: 'active', scheduled_at: new Date().toISOString() })
    .eq('id', fixtureId)

  return room
}

// ── KNOCKOUT: generate Round 1 fixtures from registered players ─────────────
// ── Resolve a round once every fixture in it is decided — handles the case
// where a round is entirely byes (e.g. very few players relative to
// bracket_size) and therefore has zero real chess_rooms games. The normal
// completion hook only fires when a real game finishes, so without this a
// sparsely-registered bracket could sit stuck on round 1 forever. Cascades
// forward through any further all-bye rounds and finishes the tournament
// directly if a round collapses to a single winner.
async function resolveRoundOutcome(tournamentId: string, roundNumber: number, timeControlSecs: number): Promise<void> {
  const { data: roundFixtures } = await supabaseAdmin
    .from('chess_tournament_fixtures')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', roundNumber)

  const allDecided = (roundFixtures ?? []).every(f => f.winner_id || f.status === 'bye')
  if (!allDecided) return // a real match is still pending — the completion hook will take it from here

  const winners = (roundFixtures ?? [])
    .filter(f => f.winner_id)
    .sort((a, b) => a.bracket_position - b.bracket_position)
    .map(f => f.winner_id!)

  if (winners.length <= 1) {
    if (winners[0]) await finishChessTournament(tournamentId, winners[0])
    return
  }

  const nextRoundNumber = roundNumber + 1
  const roundName = roundNameForPlayerCount(winners.length)
  const scheduledAt = new Date(Date.now() + ROUND_GAP_MINUTES * 60 * 1000).toISOString()

  for (let i = 0; i < winners.length / 2; i++) {
    const p1 = winners[i * 2]
    const p2 = winners[i * 2 + 1]
    const isBye = !p2
    const { error } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .insert({
        tournament_id: tournamentId, round_number: nextRoundNumber, round_name: roundName,
        bracket_position: i, player1_id: p1, player2_id: p2 ?? null,
        is_bye: isBye, winner_id: isBye ? p1 : null, status: isBye ? 'bye' : 'scheduled',
        scheduled_at: isBye ? null : scheduledAt,
        scheduled_white_time_secs: isBye ? null : timeControlSecs,
        scheduled_black_time_secs: isBye ? null : timeControlSecs,
        scheduled_increment_secs: isBye ? null : 5,
      })
    if (error) throw error
  }

  await supabaseAdmin.from('chess_tournaments').update({ current_round: nextRoundNumber }).eq('id', tournamentId)

  // Keep cascading if this new round is also entirely byes — those resolve
  // instantly since there's no real game (and therefore nothing to schedule).
  await resolveRoundOutcome(tournamentId, nextRoundNumber, timeControlSecs)
}

export async function generateKnockoutRound1(tournamentId: string) {
  const { data: tournament } = await supabaseAdmin
    .from('chess_tournaments')
    .select('bracket_size, time_control_secs')
    .eq('id', tournamentId)
    .single()
  if (!tournament) throw new Error('Tournament not found')

  const { data: players } = await supabaseAdmin
    .from('chess_tournament_players')
    .select('user_id')
    .eq('tournament_id', tournamentId)
    .eq('status', 'registered')

  if (!players?.length) throw new Error('No registered players')

  const shuffled = shufflePlayers(players.map(p => p.user_id))
  const bracketSize = tournament.bracket_size

  // Pad with byes if fewer players registered than the bracket size —
  // padded slots automatically advance their paired opponent.
  while (shuffled.length < bracketSize) shuffled.push(null as any)

  const roundName = roundNameForPlayerCount(bracketSize)
  const fixtures: { id: string; player1_id: string | null; player2_id: string | null }[] = []
  // Announce the draw now, kick off after the same gap every later round
  // uses — a real bracket reveal → kickoff gap, like a World Cup draw,
  // instead of matches going live the instant pairings are decided.
  const scheduledAt = new Date(Date.now() + ROUND_GAP_MINUTES * 60 * 1000).toISOString()

  for (let i = 0; i < bracketSize / 2; i++) {
    const p1 = shuffled[i * 2]
    const p2 = shuffled[i * 2 + 1]
    const isBye = !p1 || !p2

    const { data: fixture, error } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .insert({
        tournament_id: tournamentId,
        round_number: 1,
        round_name: roundName,
        bracket_position: i,
        player1_id: p1,
        player2_id: p2,
        is_bye: isBye,
        winner_id: isBye ? (p1 ?? p2) : null,
        status: isBye ? 'bye' : 'scheduled',
        scheduled_at: isBye ? null : scheduledAt,
        scheduled_white_time_secs: isBye ? null : tournament.time_control_secs,
        scheduled_black_time_secs: isBye ? null : tournament.time_control_secs,
        scheduled_increment_secs: isBye ? null : 5,
      })
      .select()
      .single()

    if (error) throw error
    fixtures.push(fixture)
  }

  // Set alive status for all registered players
  await supabaseAdmin
    .from('chess_tournament_players')
    .update({ status: 'alive' })
    .eq('tournament_id', tournamentId)
    .eq('status', 'registered')

  // Matches are announced now (see scheduled_at above) and go live once
  // startScheduledFixtures picks them up at kickoff — no immediate start here.

  await supabaseAdmin
    .from('chess_tournaments')
    .update({ status: 'active', current_round: 1, started_at: new Date().toISOString() })
    .eq('id', tournamentId)

  // If round 1 turned out to be entirely byes (very few players relative to
  // bracket_size), cascade forward immediately rather than waiting for a
  // real-game completion event that will never come.
  await resolveRoundOutcome(tournamentId, 1, tournament.time_control_secs)

  return fixtures
}

// ── KNOCKOUT: called when a chess_rooms match finishes — advance the winner ──
export async function advanceKnockoutFixture(fixtureId: string, winnerId: string, loserId: string | null) {
  const { data: fixture } = await supabaseAdmin
    .from('chess_tournament_fixtures')
    .select('*')
    .eq('id', fixtureId)
    .single()
  if (!fixture) throw new Error('Fixture not found')

  await supabaseAdmin
    .from('chess_tournament_fixtures')
    .update({ winner_id: winnerId, status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', fixtureId)

  if (loserId) {
    await supabaseAdmin
      .from('chess_tournament_players')
      .update({ status: 'eliminated' })
      .eq('tournament_id', fixture.tournament_id)
      .eq('user_id', loserId)
  }

  // Check if every fixture in this round is now decided — if so, generate
  // the next round (or finish the tournament if this was the final).
  const { data: roundFixtures } = await supabaseAdmin
    .from('chess_tournament_fixtures')
    .select('*')
    .eq('tournament_id', fixture.tournament_id)
    .eq('round_number', fixture.round_number)

  const allDecided = (roundFixtures ?? []).every(f => f.winner_id || f.status === 'bye')
  if (!allDecided) return { advanced: false }

  const { data: tournament } = await supabaseAdmin
    .from('chess_tournaments')
    .select('time_control_secs')
    .eq('id', fixture.tournament_id)
    .single()

  // Delegate to the shared round-resolution helper rather than duplicating
  // this logic — it correctly filters out null winners from "double-bye"
  // fixtures (both slots empty in a sparse bracket) and cascades through
  // any further rounds that also turn out to be all-byes, finishing the
  // tournament directly if it collapses to a single winner. The duplicated
  // version that used to live here didn't do either, which could silently
  // stall a bracket on a garbage fixture.
  await resolveRoundOutcome(fixture.tournament_id, fixture.round_number, tournament?.time_control_secs ?? 600)

  return { advanced: true }
}

// ── KNOCKOUT: a drawn match doesn't eliminate anyone — knockout rounds need
// a decisive result. Rather than replaying at the same speed forever (which
// could in theory loop indefinitely if two players keep drawing), each
// replay shaves 60s off the time control — colors swapped each time for
// fairness — down to a 60s floor. If a game AT the floor also draws, the
// next game becomes an Armageddon decider: White gets the floor time,
// Black gets slightly less but wins outright if that game is also a draw,
// which guarantees a decisive result in one more game.
const ARMAGEDDON_WHITE_SECS = 60
const ARMAGEDDON_BLACK_SECS = 50

export async function replayDrawnFixture(fixtureId: string, player1Id: string, player2Id: string) {
  const { data: fixture } = await supabaseAdmin
    .from('chess_tournament_fixtures')
    .select('tournament_id, draw_count, is_armageddon')
    .eq('id', fixtureId)
    .single()
  if (!fixture) throw new Error('Fixture not found')

  // The Armageddon decider itself drew — armageddon_draw_winner_id already
  // handles that case in the game-over hook before this is ever called, so
  // reaching here with is_armageddon still true would be a logic error.
  // Guard against it defensively rather than looping forever.
  if (fixture.is_armageddon) {
    throw new Error('Armageddon decider already in progress for this fixture')
  }

  const { data: tournament } = await supabaseAdmin
    .from('chess_tournaments')
    .select('time_control_secs')
    .eq('id', fixture.tournament_id)
    .single()
  const baseTime = tournament?.time_control_secs ?? 600

  const priorDrawCount = fixture.draw_count ?? 0
  const newDrawCount = priorDrawCount + 1
  const timeOfGameThatJustDrew = Math.max(baseTime - 60 * priorDrawCount, 60)

  if (timeOfGameThatJustDrew <= 60) {
    // Already at the floor and drew again — settle it with Armageddon.
    // Randomize who gets White/Black draw-odds rather than always favoring
    // whoever happened to be player1 for this replay.
    const blackGetsDrawOdds = Math.random() < 0.5 ? player2Id : player1Id
    const whitePlayer = blackGetsDrawOdds === player1Id ? player2Id : player1Id
    const scheduledAt = new Date(Date.now() + ROUND_GAP_MINUTES * 60 * 1000).toISOString()

    await supabaseAdmin
      .from('chess_tournament_fixtures')
      .update({
        draw_count: newDrawCount, is_armageddon: true, armageddon_draw_winner_id: blackGetsDrawOdds,
        player1_id: whitePlayer, player2_id: blackGetsDrawOdds,
        status: 'scheduled', scheduled_at: scheduledAt, chess_room_id: null,
        scheduled_white_time_secs: ARMAGEDDON_WHITE_SECS,
        scheduled_black_time_secs: ARMAGEDDON_BLACK_SECS,
        scheduled_increment_secs: 0, // true sudden death — no increment
      })
      .eq('id', fixtureId)

    return
  }

  // Normal shrinking-time replay — swap colors for fairness.
  const nextTime = Math.max(baseTime - 60 * newDrawCount, 60)
  const scheduledAt = new Date(Date.now() + ROUND_GAP_MINUTES * 60 * 1000).toISOString()
  await supabaseAdmin
    .from('chess_tournament_fixtures')
    .update({
      draw_count: newDrawCount,
      player1_id: player2Id, player2_id: player1Id,
      status: 'scheduled', scheduled_at: scheduledAt, chess_room_id: null,
      scheduled_white_time_secs: nextTime,
      scheduled_black_time_secs: nextTime,
      scheduled_increment_secs: 5,
    })
    .eq('id', fixtureId)
}

// ── GROUP STAGE: assign players into groups and generate round-robin fixtures ──
// ── Start scheduled fixtures once their kickoff time arrives ────────────────
// Called every minute from runChessLifecycleJob (chessReminders.ts). Finds
// every fixture sitting in 'scheduled' whose scheduled_at has passed and
// actually creates the live chess_room for it — this is the other half of
// the round-gap change above; resolveRoundOutcome/replayDrawnFixture only
// *record* the pairing and a future kickoff time, this is what makes the
// match actually go live at that time.
export async function startScheduledFixtures() {
  const { data: due, error } = await supabaseAdmin
    .from('chess_tournament_fixtures')
    .select('id, player1_id, player2_id, scheduled_white_time_secs, scheduled_black_time_secs, scheduled_increment_secs')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())

  if (error) {
    console.error('[ChessTournament] startScheduledFixtures: failed to fetch due fixtures:', error.message)
    return
  }
  if (!due?.length) return

  for (const f of due) {
    if (!f.player1_id || !f.player2_id) continue // shouldn't happen for a non-bye scheduled fixture, but be defensive
    try {
      await createFixtureMatch(
        f.id, f.player1_id, f.player2_id,
        f.scheduled_white_time_secs ?? 600,
        f.scheduled_black_time_secs ?? f.scheduled_white_time_secs ?? 600,
        f.scheduled_increment_secs ?? 5
      )
    } catch (e: any) {
      console.error(`[ChessTournament] startScheduledFixtures: failed to start fixture ${f.id}:`, e.message)
    }
  }
}

export async function generateGroupStage(tournamentId: string) {
  const { data: tournament } = await supabaseAdmin
    .from('chess_tournaments')
    .select('group_count, time_control_secs, bracket_size')
    .eq('id', tournamentId)
    .single()
  if (!tournament) throw new Error('Tournament not found')

  const groupCount = tournament.group_count ?? 4
  const { data: players } = await supabaseAdmin
    .from('chess_tournament_players')
    .select('user_id, username')
    .eq('tournament_id', tournamentId)
    .eq('status', 'registered')

  if (!players?.length) throw new Error('No registered players')

  const shuffled = shufflePlayers(players)
  const groups: typeof shuffled[] = Array.from({ length: groupCount }, () => [])
  shuffled.forEach((p, i) => groups[i % groupCount].push(p))

  // Assign group numbers + create standings rows
  for (let g = 0; g < groups.length; g++) {
    for (const p of groups[g]) {
      await supabaseAdmin
        .from('chess_tournament_players')
        .update({ group_number: g + 1, status: 'alive' })
        .eq('tournament_id', tournamentId)
        .eq('user_id', p.user_id)

      await supabaseAdmin
        .from('chess_tournament_standings')
        .insert({
          tournament_id: tournamentId,
          group_number: g + 1,
          user_id: p.user_id,
          username: p.username,
        })
    }
  }

  // Round-robin fixtures within each group — every player plays every
  // other player in their group exactly once, scheduled via the circle
  // method so no single player has two matches at the same kickoff time.
  let bracketPosCounter = 0
  const allFixtures: any[] = []
  // Same reveal → kickoff gap as knockout Round 1 and every later round —
  // the group draw is announced now, the first internal round kicks off
  // after this gap, and each subsequent internal round is staggered
  // further out by GROUP_ROUND_GAP_MINUTES.
  const firstKickoff = Date.now() + ROUND_GAP_MINUTES * 60 * 1000

  for (let g = 0; g < groups.length; g++) {
    const groupPlayers = groups[g]
    const roundRobinRounds = scheduleGroupRoundRobin(groupPlayers)
    let matchNumberInGroup = 0

    for (let internalRound = 0; internalRound < roundRobinRounds.length; internalRound++) {
      const scheduledAt = new Date(firstKickoff + internalRound * GROUP_ROUND_GAP_MINUTES * 60 * 1000).toISOString()

      for (const [p1, p2] of roundRobinRounds[internalRound]) {
        matchNumberInGroup++
        const { data: fixture, error } = await supabaseAdmin
          .from('chess_tournament_fixtures')
          .insert({
            tournament_id: tournamentId,
            round_number: 1,
            round_name: `Group ${String.fromCharCode(65 + g)} — Match ${matchNumberInGroup}`,
            group_number: g + 1,
            bracket_position: bracketPosCounter++,
            player1_id: p1.user_id,
            player2_id: p2.user_id,
            status: 'scheduled',
            scheduled_at: scheduledAt,
            scheduled_white_time_secs: tournament.time_control_secs,
            scheduled_black_time_secs: tournament.time_control_secs,
            scheduled_increment_secs: 5,
          })
          .select()
          .single()

        if (error) throw error
        allFixtures.push(fixture)
      }
    }
  }

  // Matches are announced now (see firstKickoff above) and go live once
  // startScheduledFixtures picks them up at each internal round's kickoff.
  // Different players' matches within the same internal round can run in
  // parallel — but a single player's own matches are now staggered across
  // internal rounds instead of all sharing one timestamp.

  await supabaseAdmin
    .from('chess_tournaments')
    .update({ status: 'active', current_round: 1, started_at: new Date().toISOString() })
    .eq('id', tournamentId)

  return allFixtures
}

// ── GROUP STAGE: called when a group match finishes — update standings table ──
export async function recordGroupResult(
  fixtureId: string,
  winnerId: string | null, // null = draw
  player1Id: string,
  player2Id: string
) {
  const { data: fixture } = await supabaseAdmin
    .from('chess_tournament_fixtures')
    .select('tournament_id, group_number')
    .eq('id', fixtureId)
    .single()
  if (!fixture) throw new Error('Fixture not found')

  await supabaseAdmin
    .from('chess_tournament_fixtures')
    .update({ winner_id: winnerId, status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', fixtureId)

  for (const playerId of [player1Id, player2Id]) {
    const { data: standing } = await supabaseAdmin
      .from('chess_tournament_standings')
      .select('*')
      .eq('tournament_id', fixture.tournament_id)
      .eq('user_id', playerId)
      .single()
    if (!standing) continue

    const isWinner = winnerId === playerId
    const isDraw = winnerId === null
    const isLoser = !isWinner && !isDraw

    await supabaseAdmin
      .from('chess_tournament_standings')
      .update({
        played: standing.played + 1,
        won: standing.won + (isWinner ? 1 : 0),
        drawn: standing.drawn + (isDraw ? 1 : 0),
        lost: standing.lost + (isLoser ? 1 : 0),
        // Football-style scoring: win = 3 points, draw = 1 point, loss = 0 points
        points: standing.points + (isWinner ? 3 : isDraw ? 1 : 0),
        game_wins_margin: standing.game_wins_margin + (isWinner ? 1 : isLoser ? -1 : 0),
      })
      .eq('id', standing.id)
  }

  return checkGroupStageComplete(fixture.tournament_id)
}

// ── GROUP STAGE: check if all group matches are done, and if so, rank +
//    cut to the knockout phase using advance_per_group ──────────────────────
async function checkGroupStageComplete(tournamentId: string) {
  const { data: pending } = await supabaseAdmin
    .from('chess_tournament_fixtures')
    .select('id')
    .eq('tournament_id', tournamentId)
    .not('group_number', 'is', null)
    .in('status', ['pending', 'active', 'scheduled'])

  if (pending?.length) return { groupStageComplete: false }

  const { data: tournament } = await supabaseAdmin
    .from('chess_tournaments')
    .select('advance_per_group, time_control_secs')
    .eq('id', tournamentId)
    .single()
  if (!tournament) throw new Error('Tournament not found')

  const advancePerGroup = tournament.advance_per_group ?? 2

  const { data: allStandings } = await supabaseAdmin
    .from('chess_tournament_standings')
    .select('*')
    .eq('tournament_id', tournamentId)

  const byGroup: Record<number, typeof allStandings> = {}
  for (const s of allStandings ?? []) {
    byGroup[s.group_number] = byGroup[s.group_number] ?? []
    byGroup[s.group_number]!.push(s)
  }

  const advancingPlayers: string[] = []

  for (const groupNum of Object.keys(byGroup).map(Number).sort((a, b) => a - b)) {
    const sorted = (byGroup[groupNum] ?? []).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.game_wins_margin !== a.game_wins_margin) return b.game_wins_margin - a.game_wins_margin
      return Math.random() - 0.5
    })

    for (let i = 0; i < sorted.length; i++) {
      const rank = i + 1
      await supabaseAdmin
        .from('chess_tournament_standings')
        .update({ group_rank: rank, advanced: rank <= advancePerGroup })
        .eq('id', sorted[i].id)

      if (rank <= advancePerGroup) {
        advancingPlayers.push(sorted[i].user_id)
      } else {
        await supabaseAdmin
          .from('chess_tournament_players')
          .update({ status: 'eliminated' })
          .eq('tournament_id', tournamentId)
          .eq('user_id', sorted[i].user_id)
      }
    }
  }

  // Generate the knockout bracket from advancing players
  const shuffled = shufflePlayers(advancingPlayers)

  // Edge case: only one player advanced overall (tiny bracket / misconfigured
  // advance_per_group). There's no real match left to play, so a "bye final"
  // fixture would never get a chess_rooms game attached to it — meaning the
  // completion hook (which only fires when a real game finishes) would never
  // run, leaving the tournament stuck showing as active/live forever. Finish
  // it directly instead.
  if (shuffled.length <= 1) {
    const championId = shuffled[0]
    if (championId) await finishChessTournament(tournamentId, championId)
    return { groupStageComplete: true, tournamentComplete: true, championId: championId ?? null }
  }

  const roundName = roundNameForPlayerCount(shuffled.length)
  const nextRoundNumber = 2 // group stage was always round 1
  const scheduledAt = new Date(Date.now() + ROUND_GAP_MINUTES * 60 * 1000).toISOString()
  const fixtures: any[] = []

  for (let i = 0; i < shuffled.length / 2; i++) {
    const p1 = shuffled[i * 2]
    const p2 = shuffled[i * 2 + 1]
    const isBye = !p2

    const { data: fixture, error } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .insert({
        tournament_id: tournamentId,
        round_number: nextRoundNumber,
        round_name: roundName,
        bracket_position: i,
        player1_id: p1,
        player2_id: p2 ?? null,
        is_bye: isBye,
        winner_id: isBye ? p1 : null,
        status: isBye ? 'bye' : 'scheduled',
        scheduled_at: isBye ? null : scheduledAt,
        scheduled_white_time_secs: isBye ? null : tournament.time_control_secs,
        scheduled_black_time_secs: isBye ? null : tournament.time_control_secs,
        scheduled_increment_secs: isBye ? null : 5,
      })
      .select()
      .single()

    if (error) throw error
    fixtures.push(fixture)
  }

  await supabaseAdmin
    .from('chess_tournaments')
    .update({ current_round: nextRoundNumber })
    .eq('id', tournamentId)

  return { groupStageComplete: true, knockoutFixtures: fixtures }
}

// ── Finish the tournament: pay out prizes by final rank ──────────────────
export async function finishChessTournament(tournamentId: string, championId: string) {
  const { data: tournament } = await supabaseAdmin
    .from('chess_tournaments')
    .select('title, prize_pool, prize_distribution, platform_fee_percentage, consolation_pza, status')
    .eq('id', tournamentId)
    .single()
  if (!tournament) throw new Error('Tournament not found')

  // Idempotency guard — protects against double-payouts if this ever fires twice.
  if (tournament.status === 'completed') {
    return { championId, alreadyCompleted: true }
  }

  let rankAssignments: Record<string, number> = {}

  // All ranking/payout logic is best-effort — if any part of it throws, the
  // tournament must still flip to "completed" below rather than getting
  // stuck showing as active/live forever with a finished bracket.
  try {
    const distributablePool = Math.floor(tournament.prize_pool * (1 - (tournament.platform_fee_percentage ?? 10) / 100))
    const prizeDist: { rank: number; percentage: number }[] = tournament.prize_distribution?.length
      ? tournament.prize_distribution
      : [{ rank: 1, percentage: 60 }, { rank: 2, percentage: 25 }, { rank: 3, percentage: 15 }]

    // ── Determine final ranks from fixture elimination order ──────────────
    // Rank 1 = champion (passed in)
    // Rank 2 = finalist who lost the Final
    // Rank 3/4 = players who lost in Semifinal (split equally)
    // Rank 5-8 = players who lost in Quarterfinal, etc.
    const { data: allFixtures } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .select('round_number, player1_id, player2_id, winner_id, is_bye, status')
      .eq('tournament_id', tournamentId)
      .eq('status', 'completed')
      .is('group_number', null)         // exclude group stage — knockout fixtures have null group_number
      .order('round_number', { ascending: false })

    // Build a map: userId → the round they were eliminated in (higher = better rank)
    const eliminationRound: Record<string, number> = {}
    for (const f of (allFixtures ?? [])) {
      if (f.is_bye || !f.winner_id) continue
      const loser = f.player1_id === f.winner_id ? f.player2_id : f.player1_id
      if (loser && !eliminationRound[loser]) {
        eliminationRound[loser] = f.round_number
      }
    }

    // Get all players sorted by elimination round descending (later = better finish)
    const { data: players } = await supabaseAdmin
      .from('chess_tournament_players')
      .select('user_id, username, users!inner(email)')
      .eq('tournament_id', tournamentId)

    // Group-stage standings, needed to fairly order players who never made
    // it into the knockout phase at all (group+knockout tournaments only —
    // empty array for pure knockout, where this is a no-op).
    const { data: groupStandings } = await supabaseAdmin
      .from('chess_tournament_standings')
      .select('user_id, points, game_wins_margin')
      .eq('tournament_id', tournamentId)
    const standingByUser: Record<string, { points: number; game_wins_margin: number }> = {}
    for (const s of (groupStandings ?? [])) standingByUser[s.user_id] = s

    // Players who reached the knockout phase (they, or their eventual
    // eliminator, appear in a knockout fixture) vs. players eliminated
    // purely in the group stage and never played a knockout match at all.
    // These two pools must never be merged: previously, EVERY group-only
    // elimination defaulted to the same eliminationRound (0) as every other
    // one, so in a group+knockout tournament with a small knockout bracket
    // (e.g. only 2 players advance, meaning there's no separate semifinal
    // round), all of them got tied together into one giant group at
    // whatever rank came right after the finalist — often exactly rank 3.
    // With that many people sharing one rank, the per-person prize floored
    // to 0 and the entire tier was silently skipped — nobody got paid.
    const knockoutPlayerIds = new Set(Object.keys(eliminationRound))
    knockoutPlayerIds.add(championId)
    for (const f of (allFixtures ?? [])) {
      if (f.player1_id) knockoutPlayerIds.add(f.player1_id)
      if (f.player2_id) knockoutPlayerIds.add(f.player2_id)
    }

    const knockoutPlayers = (players ?? []).filter(p => knockoutPlayerIds.has(p.user_id))
    const groupOnlyPlayers = (players ?? []).filter(p => !knockoutPlayerIds.has(p.user_id))

    // Sort: champion first, then by elimination round desc — only among
    // players who actually reached the knockout phase.
    const sortedKnockoutPlayers = knockoutPlayers.sort((a, b) => {
      if (a.user_id === championId) return -1
      if (b.user_id === championId) return 1
      const ra = eliminationRound[a.user_id] ?? 0
      const rb = eliminationRound[b.user_id] ?? 0
      return rb - ra
    })

    // Group-only eliminations rank strictly below every knockout finisher,
    // ordered fairly by their own group performance instead of one flat tie.
    const sortedGroupOnlyPlayers = groupOnlyPlayers.sort((a, b) => {
      const sa = standingByUser[a.user_id], sb = standingByUser[b.user_id]
      if (!sa || !sb) return 0
      if (sb.points !== sa.points) return sb.points - sa.points
      return sb.game_wins_margin - sa.game_wins_margin
    })

    const sortedPlayers = [...sortedKnockoutPlayers, ...sortedGroupOnlyPlayers]

    // Assign final ranks
    let currentRank = 1
    let i = 0
    while (i < sortedKnockoutPlayers.length) {
      const player = sortedPlayers[i]
      if (player.user_id === championId) {
        rankAssignments[player.user_id] = 1
        i++
        currentRank = 2
        continue
      }
      // Group players eliminated in the same round — they share the same rank
      const sameRound = eliminationRound[player.user_id] ?? 0
      const groupEnd = sortedKnockoutPlayers.slice(i).findIndex(p => (eliminationRound[p.user_id] ?? 0) !== sameRound)
      const groupSize = groupEnd === -1 ? sortedKnockoutPlayers.length - i : groupEnd
      for (let j = i; j < i + groupSize; j++) {
        rankAssignments[sortedPlayers[j].user_id] = currentRank
      }
      currentRank += groupSize
      i += groupSize
    }
    // Group-only eliminations continue the rank sequence individually
    // (each their own distinct rank, ordered by group performance) rather
    // than sharing one rank between all of them.
    for (let k = 0; k < sortedGroupOnlyPlayers.length; k++) {
      rankAssignments[sortedGroupOnlyPlayers[k].user_id] = currentRank + k
    }

    // ── Pay prizes by rank ────────────────────────────────────────────────
    const prizesByUser: Record<string, number> = {}
    for (const tier of prizeDist) {
      const recipients = sortedPlayers.filter(p => rankAssignments[p.user_id] === tier.rank)
      if (!recipients.length) continue
      // Split prize equally among players sharing the same rank (e.g. 2 semifinalists)
      const totalPrize = Math.floor(distributablePool * tier.percentage / 100)
      const prizeEach = Math.floor(totalPrize / recipients.length)
      if (prizeEach <= 0) continue

      for (const recipient of recipients) {
        try {
          await supabaseAdmin.rpc('increment_wallet_balance', { p_user_id: recipient.user_id, p_amount: prizeEach })
          await supabaseAdmin.from('transactions').insert({
            user_id: recipient.user_id,
            type: 'chess_tournament_prize',
            amount: prizeEach,
            status: 'completed',
            reference: `CHESS-PRIZE-${tournamentId}-${recipient.user_id}-${Date.now()}`,
            meta: { tournament_id: tournamentId, rank: tier.rank },
          })
          await supabaseAdmin
            .from('chess_tournament_players')
            .update({
              status: tier.rank === 1 ? 'winner' : 'eliminated',
              final_rank: tier.rank,
              prize_won: prizeEach,
            })
            .eq('tournament_id', tournamentId)
            .eq('user_id', recipient.user_id)
          prizesByUser[recipient.user_id] = prizeEach
          console.log(`[ChessEnd] Rank ${tier.rank}: ${recipient.username} paid ${prizeEach} ZA`)
        } catch (err) {
          console.error(`[ChessEnd] Prize payment failed rank ${tier.rank} for ${recipient.user_id}:`, err)
        }
      }
    }

    // ── Update final_rank for all players even those without prizes ───────
    for (const p of sortedPlayers) {
      await supabaseAdmin
        .from('chess_tournament_players')
        .update({ final_rank: rankAssignments[p.user_id] ?? 99 })
        .eq('tournament_id', tournamentId)
        .eq('user_id', p.user_id)
        .is('final_rank', null)  // only update if not already set above
    }

    // ── Consolation PZA for everyone ───────────────────────────────────────
    const consolation = tournament.consolation_pza ?? 0
    if (consolation > 0) {
      for (const p of (players ?? [])) {
        try {
          await supabaseAdmin.from('pza_events').insert({
            user_id: p.user_id,
            event_type: 'chess_participation',
            points: consolation,
            reference: `CHESS-PZA-${tournamentId}-${p.user_id}`,
            meta: { tournament_id: tournamentId },
          })
          // maybeSingle (not single) — most participants have never
          // received PZA before and have no existing pza_points row yet.
          // .single() throws when zero rows match, which silently aborted
          // this whole block (event logged, but the actual points total
          // never updated) for exactly that common case.
          const { data: pzaRow } = await supabaseAdmin.from('pza_points').select('total_points').eq('user_id', p.user_id).maybeSingle()
          await supabaseAdmin.from('pza_points').upsert({
            user_id: p.user_id,
            total_points: (pzaRow?.total_points ?? 0) + consolation,
          }, { onConflict: 'user_id' })
        } catch (err) {
          console.error(`[ChessEnd] Consolation PZA failed for ${p.user_id} in tournament ${tournamentId}:`, err)
        }
      }
    }
    // ── Result emails — every registered player gets exactly one email:
    // a win email if they placed in the prizes, or a "here's your PZA
    // consolation reward" email otherwise. Previously nobody got emailed
    // at all when a tournament finished.
    for (const p of (players ?? []) as unknown as Array<{ user_id: string; username: string; users: { email: string } }>) {
      try {
        await sendTournamentResultEmail({
          to: p.users?.email,
          username: p.username,
          gameLabel: 'Chess',
          tournamentTitle: tournament.title ?? 'Chess Tournament',
          rank: rankAssignments[p.user_id] ?? null,
          prize: prizesByUser[p.user_id] ?? 0,
          consolationPza: consolation,
          tournamentUrl: `https://playza.games/chess-tournament/${tournamentId}`,
        })
      } catch (err) {
        console.error(`[ChessEnd] Result email failed for ${p.user_id}:`, err)
      }
    }
  } catch (err) {
    console.error(`[ChessEnd] Ranking/payout logic failed for tournament ${tournamentId} — tournament will still be marked completed:`, err)
  }

  // Always flip the tournament to completed here, whether or not the reward
  // logic above fully succeeded — a finished bracket must never stay stuck
  // showing as active/live.
  await supabaseAdmin
    .from('chess_tournaments')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', tournamentId)

  return { championId, rankAssignments }
}