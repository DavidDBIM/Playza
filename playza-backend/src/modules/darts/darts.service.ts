import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'
import { recordH2HRevenue } from '../gamesession/h2h.helper'

// System bot participant — same convention chess/ludo/soccer use so a
// bot-filled room can share the exact same status/winner_id/payout code
// paths as a real two-human match.
export const SYSTEM_BOT_ID = '00000000-0000-0000-0000-000000000bot'

const BOT_PERSONAS = [
  { username: 'DartsDre', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dart1' },
  { username: 'BullseyeBen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dart2' },
  { username: 'TripleTee', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dart3' },
  { username: 'CheckoutChidi', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dart4' },
  { username: 'OcheOyinbo', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dart5' },
]
function getRandomBot() {
  return BOT_PERSONAS[Math.floor(Math.random() * BOT_PERSONAS.length)]
}

function generateRoomCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

// ── Scoring geometry — the exact same math as the Solo Earn darts game's
// client-side scoreAt(), so a checkout there and a checkout here mean the
// same thing. Coordinates are normalized: dx/dy are fractions of the board
// radius (R = 1), which is why the client never needs to tell the server
// its screen size — it just sends where the dart landed relative to the
// board's own radius.
const SEGMENT_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
const RING = { innerBull: 0.045, outerBull: 0.11, tripleIn: 0.56, tripleOut: 0.64, doubleIn: 0.92, doubleOut: 1.0 }
const PAR_DARTS: Record<number, number> = { 101: 9, 201: 15, 301: 21, 401: 27, 501: 33 }
const MAX_TURNS = 20

interface ThrowResult {
  score: number
  label: string
  isDouble: boolean
  dx: number
  dy: number
}

function scoreAt(dx: number, dy: number): ThrowResult {
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist > RING.doubleOut) return { score: 0, label: 'MISS', isDouble: false, dx, dy }
  if (dist <= RING.innerBull) return { score: 50, label: 'BULLSEYE', isDouble: true, dx, dy }
  if (dist <= RING.outerBull) return { score: 25, label: 'OUTER BULL', isDouble: false, dx, dy }

  let angle = (Math.atan2(dx, -dy) * 180) / Math.PI
  if (angle < 0) angle += 360
  const idx = Math.floor(((angle + 9) % 360) / 18)
  const num = SEGMENT_ORDER[idx]

  if (dist >= RING.tripleIn && dist <= RING.tripleOut) return { score: num * 3, label: `TRIPLE ${num}`, isDouble: false, dx, dy }
  if (dist >= RING.doubleIn && dist <= RING.doubleOut) return { score: num * 2, label: `DOUBLE ${num}`, isDouble: true, dx, dy }
  return { score: num, label: `SINGLE ${num}`, isDouble: false, dx, dy }
}

interface GameState {
  hostScore: number
  guestScore: number
  turnStartScore: number
  turnDarts: ThrowResult[]
  turnNumber: number
  lastEvent: { by: string; label: string; score: number; busted: boolean; checkout: boolean; dx: number; dy: number } | null
}

function initialState(startingScore: number): GameState {
  return {
    hostScore: startingScore,
    guestScore: startingScore,
    turnStartScore: startingScore,
    turnDarts: [],
    turnNumber: 1,
    lastEvent: null,
  }
}

// Simple heuristic bot aim: go for the checkout double when it's on, the
// bullseye when the score is out of normal checkout range, otherwise the
// highest-value area of the board (triple 20) — then scatter around that
// intended point by a moderate, fixed skill radius. Not adaptive, but
// competent enough to be worth playing.
function botAimPoint(remaining: number): { dx: number; dy: number } {
  let targetAngleDeg = 0 // 0deg = top = segment 20's center
  let targetRadius = (RING.tripleIn + RING.tripleOut) / 2 // aim for triple-20 by default

  if (remaining <= 40 && remaining % 2 === 0 && remaining > 0) {
    // Go for the double of half the remaining score
    const doubleNum = remaining / 2
    const idx = SEGMENT_ORDER.indexOf(doubleNum)
    if (idx !== -1) {
      targetAngleDeg = idx * 18
      targetRadius = (RING.doubleIn + RING.doubleOut) / 2
    }
  } else if (remaining === 50) {
    targetRadius = RING.innerBull / 2
  }

  const skillDeviation = 0.09 // fixed moderate wobble, in normalized board units
  const jitterAngle = Math.random() * Math.PI * 2
  const jitterMag = Math.random() * skillDeviation
  const rad = (targetAngleDeg * Math.PI) / 180
  const baseX = targetRadius * Math.sin(rad)
  const baseY = -targetRadius * Math.cos(rad)
  return {
    dx: baseX + Math.cos(jitterAngle) * jitterMag,
    dy: baseY + Math.sin(jitterAngle) * jitterMag,
  }
}

export async function listWaitingRooms() {
  const { data, error } = await supabaseAdmin
    .from('darts_rooms')
    .select('id, code, stake, status, starting_score, host_id, created_at, host:users!host_id(username, avatar_url)')
    .eq('status', 'waiting')
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return data
}

export async function createDartsRoom(userId: string, stakeValue: number, startingScore: number = 301) {
  const code = generateRoomCode()
  const stake = Number(stakeValue)
  if (!PAR_DARTS[startingScore]) throw new Error('Invalid starting score')

  const { data, error } = await supabaseAdmin
    .from('darts_rooms')
    .insert({
      code,
      host_id: userId,
      stake,
      status: 'waiting',
      starting_score: startingScore,
      current_turn: null,
      game_state: initialState(startingScore),
    })
    .select()
    .single()

  if (error) throw error

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < stake) throw new Error('Insufficient balance to create this game')
  }

  return { room_code: code, room_id: data.id, stake, status: 'waiting' }
}

export async function joinDartsRoom(userId: string, code: string) {
  const { data: room, error } = await supabaseAdmin.from('darts_rooms').select('*').eq('code', code.toUpperCase()).single()
  if (error || !room) throw new Error('Room not found')
  if (room.status !== 'waiting') throw new Error('Room is no longer available')
  if (room.host_id === userId) throw new Error('You cannot join your own room')

  if (room.stake > 0) {
    const { data: hostWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', room.host_id).single()
    if (!hostWallet || hostWallet.balance < room.stake) throw new Error('Host no longer has sufficient balance')

    const { data: guestWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    if (!guestWallet || guestWallet.balance < room.stake) throw new Error('Insufficient balance to join this game')

    // Stakes move via adjust_wallet_balance — a pure balance change that
    // does NOT touch total_deposited/total_withdrawn, unlike
    // increment_/decrement_wallet_balance (those are for real Paystack
    // deposits/withdrawals only; see the note beside them in schema.sql).
    await supabaseAdmin.rpc('adjust_wallet_balance', { p_user_id: room.host_id, p_amount: -room.stake })
    const { data: hW } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', room.host_id).single()
    await supabaseAdmin.from('transactions').insert({
      user_id: room.host_id, type: 'game_entry', amount: room.stake, status: 'successful',
      reference: `PLZ-DARTS-HOST-${room.id}`, meta: { post_balance: hW?.balance || 0 },
    })

    await supabaseAdmin.rpc('adjust_wallet_balance', { p_user_id: userId, p_amount: -room.stake })
    const { data: gW } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    await supabaseAdmin.from('transactions').insert({
      user_id: userId, type: 'game_entry', amount: room.stake, status: 'successful',
      reference: `PLZ-DARTS-JOIN-${room.id}`, meta: { post_balance: gW?.balance || 0 },
    })
  }

  const { error: updateError } = await supabaseAdmin
    .from('darts_rooms')
    .update({
      guest_id: userId,
      status: 'active',
      current_turn: room.host_id, // host always throws first
      turn_started_at: new Date().toISOString(),
    })
    .eq('id', room.id)

  if (updateError) throw updateError

  return { room_id: room.id, code: room.code, stake: room.stake, status: 'active' }
}

export async function createBotRoom(userId: string, stakeValue: number, startingScore: number = 301) {
  const code = generateRoomCode()
  const stake = Number(stakeValue)
  if (!PAR_DARTS[startingScore]) throw new Error('Invalid starting score')

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < stake) throw new Error('Insufficient balance to create this game')
    await supabaseAdmin.rpc('adjust_wallet_balance', { p_user_id: userId, p_amount: -stake })
    const { data: w } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    await supabaseAdmin.from('transactions').insert({
      user_id: userId, type: 'game_entry', amount: stake, status: 'successful',
      reference: `PLZ-DARTS-BOT-${code}`, meta: { post_balance: w?.balance || 0 },
    })
  }

  const bot = getRandomBot()
  const { data, error } = await supabaseAdmin
    .from('darts_rooms')
    .insert({
      code,
      host_id: userId,
      guest_id: SYSTEM_BOT_ID,
      stake,
      status: 'active',
      starting_score: startingScore,
      current_turn: userId, // human throws first
      game_state: initialState(startingScore),
      turn_started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return { room_id: data.id, code: data.code, stake, status: 'active', bot_name: bot.username }
}

export async function findQuickMatch(userId: string, stakeValue: number, startingScore: number = 301) {
  const stake = Number(stakeValue)

  const { data: rooms } = await supabaseAdmin
    .from('darts_rooms')
    .select('id, code')
    .eq('status', 'waiting')
    .eq('stake', stake)
    .eq('starting_score', startingScore)
    .neq('host_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (rooms && rooms.length > 0) {
    try {
      return await joinDartsRoom(userId, rooms[0].code)
    } catch (e) {
      console.error('Darts quick match join failed:', e)
    }
  }

  return await createBotRoom(userId, stake, startingScore)
}

export async function getRoom(roomId: string, userId: string | null) {
  const { data: room, error } = await supabaseAdmin
    .from('darts_rooms')
    .select(`
      id, code, status, starting_score, current_turn, stake, winner_id, created_at, host_id, guest_id, game_state, turn_started_at,
      host:users!host_id(id, username, avatar_url),
      guest:users!guest_id(id, username, avatar_url)
    `)
    .eq('id', roomId)
    .single()

  if (error) throw error
  if (!room) throw new Error('Room not found')

  const isParticipant = room.host_id === userId || room.guest_id === userId
  if (!isParticipant) throw new Error('Unauthorized access')

  return room
}

async function handleDartsGameOver(roomId: string, winnerId: string | null, stake: number) {
  const { data: room, error: updateErr } = await supabaseAdmin
    .from('darts_rooms')
    .update({ status: 'finished', winner_id: winnerId })
    .eq('id', roomId)
    .eq('status', 'active')
    .select('host_id, guest_id')
    .single()

  if (updateErr) {
    if (updateErr.code !== 'PGRST116') console.error(`[Darts handleGameOver] Failed to update room ${roomId}:`, updateErr)
    return
  }
  if (!room) return

  if (stake > 0 && winnerId && winnerId !== SYSTEM_BOT_ID) {
    const totalPrize = stake * 2
    const { data: gameInfo } = await supabaseAdmin.from('games').select('platform_fee_percentage').eq('slug', 'darts').single()
    const feePercent = Number(gameInfo?.platform_fee_percentage || 10)
    const platformCut = totalPrize * (feePercent / 100)
    const winnerPrize = totalPrize - platformCut

    await supabaseAdmin.rpc('adjust_wallet_balance', { p_user_id: winnerId, p_amount: winnerPrize })
    const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', winnerId).single()
    await supabaseAdmin.from('transactions').insert({
      user_id: winnerId, type: 'winnings', amount: winnerPrize, status: 'successful',
      reference: `PLZ-DARTS-WIN-${roomId}`, meta: { post_balance: wallet?.balance || 0 },
    })

    await recordH2HRevenue('darts', platformCut)
  }

  const players = [room.host_id, room.guest_id].filter((id) => id && id !== SYSTEM_BOT_ID)
  for (const uid of players) {
    const isWinner = uid === winnerId
    await supabaseAdmin.from('game_history').insert({
      user_id: uid,
      game_name: 'Darts',
      status: isWinner ? 'win' : 'loss',
      winnings: isWinner ? stake * 1.8 : 0,
      played_at: new Date().toISOString(),
    })
  }
}

// Resolves a single dart against the room's current authoritative state.
// Shared by both the human's HTTP-submitted throw and the bot's simulated
// one, so there's exactly one place that implements the bust/checkout rules.
function resolveThrow(state: GameState, isHost: boolean, dx: number, dy: number) {
  const hit = scoreAt(dx, dy)
  const currentScore = isHost ? state.hostScore : state.guestScore
  const projected = currentScore - hit.score

  state.turnDarts.push(hit)

  let busted = false
  let checkout = false

  if (projected < 0 || projected === 1) {
    busted = true
    if (isHost) state.hostScore = state.turnStartScore
    else state.guestScore = state.turnStartScore
  } else if (projected === 0) {
    if (hit.isDouble) {
      checkout = true
      if (isHost) state.hostScore = 0
      else state.guestScore = 0
    } else {
      busted = true
      if (isHost) state.hostScore = state.turnStartScore
      else state.guestScore = state.turnStartScore
    }
  } else {
    if (isHost) state.hostScore = projected
    else state.guestScore = projected
  }

  state.lastEvent = { by: isHost ? 'host' : 'guest', label: hit.label, score: hit.score, busted, checkout, dx: hit.dx, dy: hit.dy }

  const turnOver = busted || checkout || state.turnDarts.length >= 3
  return { hit, busted, checkout, turnOver }
}

export async function submitThrow(roomId: string, userId: string, dx: number, dy: number) {
  const { data: room, error } = await supabaseAdmin.from('darts_rooms').select('*').eq('id', roomId).single()
  if (error || !room) throw new Error('Room not found')
  if (room.status !== 'active') throw new Error('Game is not active')
  if (room.current_turn !== userId) throw new Error('Not your turn')
  if (room.host_id !== userId && room.guest_id !== userId) throw new Error('Not a participant in this game')

  const isHost = room.host_id === userId
  const state: GameState = room.game_state

  const result = resolveThrow(state, isHost, dx, dy)

  // Checkout — game over immediately.
  if (result.checkout) {
    const winnerId = userId
    await supabaseAdmin.from('darts_rooms').update({ game_state: state }).eq('id', roomId)
    await handleDartsGameOver(roomId, winnerId, room.stake)
    return { ...(await getRoom(roomId, userId)) }
  }

  let nextTurn = room.current_turn
  if (result.turnOver) {
    // Hand the turn to the other player and reset the per-turn bookkeeping.
    nextTurn = isHost ? room.guest_id : room.host_id
    state.turnStartScore = isHost ? state.hostScore : state.guestScore
    state.turnDarts = []
    state.turnNumber += 1

    if (state.turnNumber > MAX_TURNS) {
      // Ran out of turns with nobody checking out — whoever reduced their
      // score the most (as a fraction of their own starting total) wins;
      // a genuine tie refunds both stakes minus the platform fee, same
      // spirit as chess's draw handling.
      const hostProgress = (room.starting_score - state.hostScore) / room.starting_score
      const guestProgress = (room.starting_score - state.guestScore) / room.starting_score
      await supabaseAdmin.from('darts_rooms').update({ game_state: state }).eq('id', roomId)

      if (Math.abs(hostProgress - guestProgress) < 0.001) {
        await supabaseAdmin.from('darts_rooms').update({ status: 'finished', winner_id: null }).eq('id', roomId).eq('status', 'active')
        if (room.stake > 0) {
          const { data: feeInfo } = await supabaseAdmin.from('games').select('platform_fee_percentage').eq('slug', 'darts').single()
          const feePercent = Number(feeInfo?.platform_fee_percentage || 10)
          const refund = room.stake * (1 - feePercent / 100)
          for (const uid of [room.host_id, room.guest_id]) {
            if (uid && uid !== SYSTEM_BOT_ID) {
              await supabaseAdmin.rpc('adjust_wallet_balance', { p_user_id: uid, p_amount: refund })
              await supabaseAdmin.from('transactions').insert({
                user_id: uid, type: 'bonus', amount: refund, status: 'successful',
                reference: `PLZ-DARTS-DRAW-${roomId}`, meta: { reason: 'Match draw refund' },
              })
            }
          }
        }
      } else {
        const winnerId = hostProgress > guestProgress ? room.host_id : room.guest_id
        await handleDartsGameOver(roomId, winnerId, room.stake)
      }
      return { ...(await getRoom(roomId, userId)) }
    }
  }

  await supabaseAdmin
    .from('darts_rooms')
    .update({ game_state: state, current_turn: nextTurn, turn_started_at: new Date().toISOString() })
    .eq('id', roomId)

  // If it's now the bot's turn, play its whole turn out immediately so the
  // human never has to wait on a background job — the bot throws up to 3
  // darts right here, reusing the exact same resolveThrow rules.
  if (nextTurn === SYSTEM_BOT_ID) {
    await playBotTurn(roomId)
  }

  return await getRoom(roomId, userId)
}

async function playBotTurn(roomId: string) {
  const { data: room } = await supabaseAdmin.from('darts_rooms').select('*').eq('id', roomId).single()
  if (!room || room.status !== 'active') return

  const state: GameState = room.game_state
  const isHostBot = room.host_id === SYSTEM_BOT_ID

  let turnOver = false
  let checkout = false
  while (!turnOver) {
    const remaining = isHostBot ? state.hostScore : state.guestScore
    const { dx, dy } = botAimPoint(remaining)
    const result = resolveThrow(state, isHostBot, dx, dy)
    turnOver = result.turnOver
    checkout = result.checkout
    if (checkout) break
  }

  if (checkout) {
    const winnerId = isHostBot ? room.host_id : room.guest_id
    await supabaseAdmin.from('darts_rooms').update({ game_state: state }).eq('id', roomId)
    await handleDartsGameOver(roomId, winnerId, room.stake)
    return
  }

  const nextTurn = isHostBot ? room.guest_id : room.host_id
  state.turnStartScore = isHostBot ? state.hostScore : state.guestScore
  state.turnDarts = []
  state.turnNumber += 1

  if (state.turnNumber > MAX_TURNS) {
    const hostProgress = (room.starting_score - state.hostScore) / room.starting_score
    const guestProgress = (room.starting_score - state.guestScore) / room.starting_score
    await supabaseAdmin.from('darts_rooms').update({ game_state: state }).eq('id', roomId)
    const winnerId = hostProgress === guestProgress ? null : hostProgress > guestProgress ? room.host_id : room.guest_id
    if (winnerId) await handleDartsGameOver(roomId, winnerId, room.stake)
    else await supabaseAdmin.from('darts_rooms').update({ status: 'finished', winner_id: null }).eq('id', roomId).eq('status', 'active')
    return
  }

  await supabaseAdmin
    .from('darts_rooms')
    .update({ game_state: state, current_turn: nextTurn, turn_started_at: new Date().toISOString() })
    .eq('id', roomId)
}

export async function resignGame(roomId: string, userId: string) {
  const { data: room } = await supabaseAdmin.from('darts_rooms').select('*').eq('id', roomId).single()
  if (!room || room.status !== 'active') throw new Error('Invalid game state')
  if (room.host_id !== userId && room.guest_id !== userId) throw new Error('Not a participant in this game')

  const winnerId = room.host_id === userId ? room.guest_id || SYSTEM_BOT_ID : room.host_id
  await handleDartsGameOver(roomId, winnerId, room.stake)
  return { winner_id: winnerId, message: 'Resigned' }
}

export async function cancelDartsRoom(roomId: string, userId: string) {
  const { data: room } = await supabaseAdmin.from('darts_rooms').select('*').eq('id', roomId).single()
  if (!room) throw new Error('Room not found')
  if (room.host_id !== userId) throw new Error('Unauthorized')
  if (room.status !== 'waiting') throw new Error('Cannot cancel active or finished game')
  await supabaseAdmin.from('darts_rooms').delete().eq('id', roomId)
}

// ── Abandoned-game safety net — same idea as chess's sweepAbandonedChessGames:
// if both players close the app mid-match, this finishes the game instead of
// leaving it (and its staked money) active forever. Darts has no per-move
// clock like chess, so this uses a simple absolute grace period since the
// current turn started.
const ABANDONED_GAME_GRACE_SECS = 10 * 60

export async function sweepAbandonedDartsGames() {
  const cutoff = new Date(Date.now() - ABANDONED_GAME_GRACE_SECS * 1000).toISOString()
  const { data: rooms, error } = await supabaseAdmin
    .from('darts_rooms')
    .select('id, host_id, guest_id, current_turn, stake, turn_started_at')
    .eq('status', 'active')
    .lt('turn_started_at', cutoff)

  if (error || !rooms) return
  for (const room of rooms) {
    const winnerId = room.current_turn === room.host_id ? room.guest_id || SYSTEM_BOT_ID : room.host_id
    await handleDartsGameOver(room.id, winnerId, room.stake)
  }
}