import { supabaseAdmin } from '../../config/supabase'

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

function roundNameForPlayerCount(playersRemainingBeforeRound: number): string {
  return ROUND_NAMES[playersRemainingBeforeRound] ?? `Round of ${playersRemainingBeforeRound}`
}

function getInitialBoard(timeControlSecs: number) {
  return {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    last_move: null,
    white_time: timeControlSecs,
    black_time: timeControlSecs,
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
async function createFixtureMatch(
  fixtureId: string,
  player1Id: string,
  player2Id: string,
  timeControlSecs: number
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
      board_state: getInitialBoard(timeControlSecs),
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
        status: isBye ? 'bye' : 'pending',
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

  // Start all non-bye matches immediately
  for (const f of fixtures) {
    if (f.player1_id && f.player2_id) {
      await createFixtureMatch(f.id, f.player1_id, f.player2_id, tournament.time_control_secs)
    }
  }

  await supabaseAdmin
    .from('chess_tournaments')
    .update({ status: 'active', current_round: 1, started_at: new Date().toISOString() })
    .eq('id', tournamentId)

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

  const winners = (roundFixtures ?? [])
    .sort((a, b) => a.bracket_position - b.bracket_position)
    .map(f => f.winner_id!)

  if (winners.length === 1) {
    // Tournament is over — the single remaining winner takes the title.
    return { advanced: false, tournamentComplete: true, championId: winners[0] }
  }

  const { data: tournament } = await supabaseAdmin
    .from('chess_tournaments')
    .select('time_control_secs')
    .eq('id', fixture.tournament_id)
    .single()

  const nextRoundNumber = fixture.round_number + 1
  const roundName = roundNameForPlayerCount(winners.length)
  const nextFixtures: { id: string; player1_id: string | null; player2_id: string | null }[] = []

  for (let i = 0; i < winners.length / 2; i++) {
    const p1 = winners[i * 2]
    const p2 = winners[i * 2 + 1]

    const { data: nf, error } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .insert({
        tournament_id: fixture.tournament_id,
        round_number: nextRoundNumber,
        round_name: roundName,
        bracket_position: i,
        player1_id: p1,
        player2_id: p2 ?? null,
        is_bye: !p2,
        winner_id: !p2 ? p1 : null,
        status: !p2 ? 'bye' : 'pending',
      })
      .select()
      .single()

    if (error) throw error
    nextFixtures.push(nf)
  }

  for (const f of nextFixtures) {
    if (f.player1_id && f.player2_id) {
      await createFixtureMatch(f.id, f.player1_id, f.player2_id, tournament?.time_control_secs ?? 600)
    }
  }

  await supabaseAdmin
    .from('chess_tournaments')
    .update({ current_round: nextRoundNumber })
    .eq('id', fixture.tournament_id)

  return { advanced: true, nextRoundNumber, fixtures: nextFixtures }
}

// ── GROUP STAGE: assign players into groups and generate round-robin fixtures ──
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
  // other player in their group exactly once.
  let bracketPosCounter = 0
  const allFixtures: any[] = []

  for (let g = 0; g < groups.length; g++) {
    const groupPlayers = groups[g]
    for (let i = 0; i < groupPlayers.length; i++) {
      for (let j = i + 1; j < groupPlayers.length; j++) {
        const { data: fixture, error } = await supabaseAdmin
          .from('chess_tournament_fixtures')
          .insert({
            tournament_id: tournamentId,
            round_number: 1,
            round_name: `Group ${String.fromCharCode(65 + g)} — Match ${allFixtures.filter(f => f.group_number === g + 1).length + 1}`,
            group_number: g + 1,
            bracket_position: bracketPosCounter++,
            player1_id: groupPlayers[i].user_id,
            player2_id: groupPlayers[j].user_id,
            status: 'pending',
          })
          .select()
          .single()

        if (error) throw error
        allFixtures.push(fixture)
      }
    }
  }

  // Start every group-stage match immediately — all matches in the group
  // stage can run in parallel, unlike knockout rounds which gate on
  // each other.
  for (const f of allFixtures) {
    await createFixtureMatch(f.id, f.player1_id, f.player2_id, tournament.time_control_secs)
  }

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
        points: standing.points + (isWinner ? 1 : isDraw ? 0.5 : 0),
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
  const roundName = roundNameForPlayerCount(shuffled.length)
  const nextRoundNumber = 2 // group stage was always round 1
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
        status: isBye ? 'bye' : 'pending',
      })
      .select()
      .single()

    if (error) throw error
    fixtures.push(fixture)
  }

  for (const f of fixtures) {
    if (f.player1_id && f.player2_id) {
      await createFixtureMatch(f.id, f.player1_id, f.player2_id, tournament.time_control_secs)
    }
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
    .select('prize_pool, prize_distribution, platform_fee_percentage, consolation_pza')
    .eq('id', tournamentId)
    .single()
  if (!tournament) throw new Error('Tournament not found')

  await supabaseAdmin
    .from('chess_tournament_players')
    .update({ status: 'winner', final_rank: 1 })
    .eq('tournament_id', tournamentId)
    .eq('user_id', championId)

  const distributablePool = Math.floor(tournament.prize_pool * (1 - (tournament.platform_fee_percentage ?? 10) / 100))
  const prizeDist = tournament.prize_distribution?.length
    ? tournament.prize_distribution
    : [{ rank: 1, percentage: 60 }, { rank: 2, percentage: 25 }, { rank: 3, percentage: 15 }]

  // Rank 1 = champion. Ranks 2+ are derived from elimination round —
  // players eliminated in the final round (losing finalists) = rank 2,
  // semifinal losers = rank 3/4 (split), etc. For now we pay rank 1
  // (champion) directly; runner-up/semifinalist payout uses the same
  // fixture-elimination-round data already stored per player.
  for (const tier of prizeDist) {
    if (tier.rank === 1) {
      const prize = Math.floor(distributablePool * tier.percentage / 100)
      if (prize > 0) {
        await supabaseAdmin.rpc('increment_wallet_balance', { p_user_id: championId, p_amount: prize })
        await supabaseAdmin.from('transactions').insert({
          user_id: championId,
          type: 'chess_tournament_prize',
          amount: prize,
          status: 'completed',
          reference: `CHESS-PRIZE-${tournamentId}-${championId}-${Date.now()}`,
          meta: { tournament_id: tournamentId, rank: 1 },
        })
        await supabaseAdmin
          .from('chess_tournament_players')
          .update({ prize_won: prize })
          .eq('tournament_id', tournamentId)
          .eq('user_id', championId)
      }
    }
  }

  await supabaseAdmin
    .from('chess_tournaments')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', tournamentId)

  return { championId }
}
