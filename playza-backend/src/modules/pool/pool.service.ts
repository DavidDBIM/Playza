import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'
import { PoolPhysics } from './physics'
import { PoolRules, GameState, PlayerType } from './rules'
import { getPoolBotMove } from './bot'

const TABLE_WIDTH = 2540
const TABLE_HEIGHT = 1270

function generateRoomCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

interface PoolRoomData {
  id: string
  code: string
  host_id: string
  guest_id: string | null
  stake: number
  status: string
  game_state: GameState | null
  created_at: string
}

export async function listWaitingRooms() {
  const { data, error } = await supabaseAdmin
    .from('pool_rooms')
    .select(`
      id, code, stake, created_at, host_id,
      host:users!host_id(id, username, avatar_url)
    `)
    .eq('status', 'waiting')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data
}

export async function createPoolRoom(userId: string, stakeValue: number) {
  const code = generateRoomCode()
  const stake = Number(stakeValue)

  const initialState = PoolRules.createInitialState()

  const { data, error } = await supabaseAdmin
    .from('pool_rooms')
    .insert({
      code,
      host_id: userId,
      guest_id: null,
      stake,
      status: 'waiting',
      game_state: initialState,
    })
    .select()
    .single()

  if (error) throw error

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (!wallet || wallet.balance < stake) {
      await supabaseAdmin.from('pool_rooms').delete().eq('id', data.id)
      throw new Error('Insufficient balance to create this game')
    }

    await supabaseAdmin.rpc('decrement_wallet_balance', {
      p_user_id: userId,
      p_amount: stake,
    })

    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      type: 'game_entry',
      amount: stake,
      status: 'successful',
      reference: `PLZ-POOL-${data.id}`,
    })
  }

  return { room_code: code, room_id: data.id, stake, status: 'waiting' }
}

export async function joinPoolRoom(userId: string, code: string) {
  const { data: room, error } = await supabaseAdmin
    .from('pool_rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !room) throw new Error('Room not found')
  if (room.status !== 'waiting') throw new Error('Room is no longer available')
  if (room.host_id === userId) throw new Error('You cannot join your own room')

  if (room.stake > 0) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (!wallet || wallet.balance < room.stake)
      throw new Error('Insufficient balance to join this game')

    await supabaseAdmin.rpc('decrement_wallet_balance', {
      p_user_id: userId,
      p_amount: room.stake,
    })

    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      type: 'game_entry',
      amount: room.stake,
      status: 'successful',
      reference: `PLZ-POOL-JOIN-${room.id}-${userId}`,
    })
  }

  const initialState = PoolRules.createInitialState()

  const { error: updateError } = await supabaseAdmin
    .from('pool_rooms')
    .update({
      guest_id: userId,
      status: 'active',
      game_state: initialState,
    })
    .eq('id', room.id)

  if (updateError) throw updateError

  return {
    room_id: room.id,
    code: room.code,
    stake: room.stake,
    status: 'active',
    game_state: initialState,
  }
}

export async function getRoom(roomId: string, userId: string) {
  const { data: room, error } = await supabaseAdmin
    .from('pool_rooms')
    .select(
      `
      id, code, status, game_state, stake, winner_id, created_at, host_id, guest_id,
      host:users!host_id(id, username, avatar_url),
      guest:users!guest_id(id, username, avatar_url)
    `,
    )
    .eq('id', roomId)
    .single()

  if (error) throw error
  if (!room) throw new Error('Room not found')
  if (room.host_id !== userId && room.guest_id !== userId)
    throw new Error('Unauthorized access')

  return room
}

export async function executeShot(
  roomId: string,
  userId: string,
  shot: {
    angle: number
    power: number
    spin: { x: number; y: number }
  }
) {
  const { data: room, error } = await supabaseAdmin
    .from('pool_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (error || !room) throw new Error('Room not found')
  if (room.status !== 'active') throw new Error('Game over')

  const player = userId === room.host_id ? 'host' : 'guest'
  const gameState = room.game_state as GameState

  if (userId !== null && gameState.currentPlayer !== player) {
    throw new Error('Not your turn')
  }

  const { newState, pocketedBalls, foul, foulType } = PoolRules.processShot(
    gameState,
    shot,
    player as PlayerType
  )

  await supabaseAdmin
    .from('pool_rooms')
    .update({ game_state: newState })
    .eq('id', roomId)

  if (newState.status === 'finished') {
    await handleGameOver(roomId, newState.winner === 'host' ? room.host_id : room.guest_id, room.stake)
    return {
      game_state: newState,
      pocketed_balls: pocketedBalls,
      foul,
      foul_type: foulType,
      status: 'finished',
    }
  }

  // If it's a bot's turn, trigger bot move automatically
  if (newState.currentPlayer === 'guest' && room.guest_id === null && newState.status === 'active') {
    const botShot = getPoolBotMove(newState, 'guest', 'medium');
    if (botShot) {
      // Small delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      return await executeShot(roomId, null as any, botShot);
    }
  }

  return {
    game_state: newState,
    pocketed_balls: pocketedBalls,
    foul,
    foul_type: foulType,
    next_turn: newState.currentPlayer,
  }
}

export async function placeBall(
  roomId: string,
  userId: string,
  position: { x: number; y: number }
) {
  const { data: room, error } = await supabaseAdmin
    .from('pool_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (error || !room) throw new Error('Room not found')
  if (room.status !== 'active') throw new Error('Game over')

  const player = userId === room.host_id ? 'host' : 'guest'
  const gameState = room.game_state as GameState

  if (gameState.currentPlayer !== player) {
    throw new Error('Not your turn')
  }

  if (!gameState.ballInHand) {
    throw new Error('You do not have ball in hand')
  }

  const newState = PoolRules.placeBallInHand(gameState, position)

  await supabaseAdmin
    .from('pool_rooms')
    .update({ game_state: newState })
    .eq('id', roomId)

  return { game_state: newState }
}

export async function createBotRoom(userId: string, stakeValue: number) {
  const code = generateRoomCode()
  const stake = Number(stakeValue)

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (!wallet || wallet.balance < stake)
      throw new Error('Insufficient balance')

    await supabaseAdmin.rpc('decrement_wallet_balance', {
      p_user_id: userId,
      p_amount: stake,
    })
  }

  const initialState = PoolRules.createInitialState()

  const { data, error } = await supabaseAdmin
    .from('pool_rooms')
    .insert({
      code,
      host_id: userId,
      guest_id: null, // null means bot
      stake,
      status: 'active',
      game_state: initialState,
    })
    .select()
    .single()

  if (error) throw error

  return {
    room_id: data.id,
    code,
    stake,
    status: 'active',
    game_state: initialState,
  }
}

export async function findQuickMatch(userId: string, stakeValue: number) {
  const stake = Number(stakeValue)

  const { data: rooms, error: searchError } = await supabaseAdmin
    .from('pool_rooms')
    .select('id, code, stake, status, host_id')
    .eq('status', 'waiting')
    .eq('stake', stake)
    .neq('host_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (rooms && rooms.length > 0) {
    const room = rooms[0]
    try {
      return await joinPoolRoom(userId, room.code)
    } catch (e) {
      console.error('Quick Match join failed:', e)
    }
  }

  return await createPoolRoom(userId, stake)
}

export async function resignGame(roomId: string, userId: string) {
  const { data: room } = await supabaseAdmin
    .from('pool_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (!room || room.status !== 'active') throw new Error('Invalid game state')

  const winner = room.host_id === userId ? 'guest' : 'host'
  const winnerId = winner === 'host' ? room.host_id : room.guest_id
  await handleGameOver(roomId, winnerId, room.stake)

  return { winner_id: winnerId, message: 'Resigned' }
}

async function handleGameOver(roomId: string, winnerId: string | null, stake: number) {
  // 1. Update room status
  const { data: room } = await supabaseAdmin
    .from('pool_rooms')
    .update({ 
      status: 'finished', 
      winner_id: winnerId 
    })
    .eq('id', roomId)
    .select('host_id, guest_id')
    .single()

  if (!room) return

  // 2. Handle Prize & Transactions for Winner
  if (stake > 0 && winnerId) {
    const totalPrize = stake * 2
    const platformCut = totalPrize * 0.1
    const winnerPrize = totalPrize - platformCut

    await supabaseAdmin.rpc('increment_wallet_balance', {
      p_user_id: winnerId,
      p_amount: winnerPrize,
    })

    await supabaseAdmin.from('transactions').insert({
      user_id: winnerId,
      type: 'winnings',
      amount: winnerPrize,
      status: 'successful',
      reference: `PLZ-POOL-WIN-${roomId}`,
    })
  }

  // 3. Record Game History for both players
  const players = [room.host_id, room.guest_id].filter(id => id)
  
  for (const uid of players) {
    const isWinner = uid === winnerId
    const isDraw = winnerId === null
    
    await supabaseAdmin.from('game_history').insert({
      user_id: uid,
      game_name: '8-Ball Pool',
      status: isDraw ? 'draw' : (isWinner ? 'win' : 'loss'),
      winnings: isWinner ? (stake * 1.8) : (isDraw ? stake : 0),
      played_at: new Date().toISOString()
    })
  }

  // 4. If draw, return stakes to wallet
  if (stake > 0 && !winnerId) {
    for (const uid of [room.host_id, room.guest_id]) {
      if (uid) {
        await supabaseAdmin.rpc('increment_wallet_balance', {
          p_user_id: uid,
          p_amount: stake,
        })
      }
    }
  }
}