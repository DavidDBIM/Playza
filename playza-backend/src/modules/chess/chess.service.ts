import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'

function generateRoomCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

export async function createChessRoom(userId: string, stake: number) {
  const code = generateRoomCode()

  const { data, error } = await supabaseAdmin
    .from('chess_rooms')
    .insert({
      code,
      host_id: userId,
      stake,
      status: 'waiting',
      board_state: null,
      current_turn: null,
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

    if (!wallet || wallet.balance < stake) throw new Error('Insufficient balance to create this game')

    await supabaseAdmin.rpc('decrement_wallet_balance', {
      p_user_id: userId,
      p_amount: stake,
    })

    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      type: 'game_entry',
      amount: stake,
      status: 'successful',
      reference: `PLZ-CHESS-${data.id}`,
    })
  }

  return { room_code: code, room_id: data.id, stake, status: 'waiting' }
}

export async function joinChessRoom(userId: string, code: string) {
  const { data: room, error } = await supabaseAdmin
    .from('chess_rooms')
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

    if (!wallet || wallet.balance < room.stake) throw new Error('Insufficient balance to join this game')

    await supabaseAdmin.rpc('decrement_wallet_balance', {
      p_user_id: userId,
      p_amount: room.stake,
    })

    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      type: 'game_entry',
      amount: room.stake,
      status: 'successful',
      reference: `PLZ-CHESS-JOIN-${room.id}-${userId}`,
    })
  }

  const initialBoard = getInitialBoard()

  const { error: updateError } = await supabaseAdmin
    .from('chess_rooms')
    .update({
      guest_id: userId,
      status: 'active',
      board_state: initialBoard,
      current_turn: room.host_id,
    })
    .eq('id', room.id)

  if (updateError) throw updateError

  return { room_id: room.id, code: room.code, stake: room.stake, status: 'active', board_state: initialBoard }
}

export async function getRoom(roomId: string, userId: string) {
  const { data: room, error } = await supabaseAdmin
    .from('chess_rooms')
    .select(`
      id, code, status, board_state, current_turn, stake, winner_id, created_at, host_id, guest_id,
      host:users!host_id(id, username, avatar_url),
      guest:users!guest_id(id, username, avatar_url)
    `)
    .eq('id', roomId)
    .single()

  if (error) throw error
  if (!room) throw new Error('Room not found')
  if (room.host_id !== userId && room.guest_id !== userId) throw new Error('You are not in this room')

  return room
}

export async function makeMove(roomId: string, userId: string, move: { from: string; to: string; promotion?: string }) {
  const { data: room, error } = await supabaseAdmin
    .from('chess_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (error || !room) throw new Error('Room not found')
  if (room.status !== 'active') throw new Error('Game is not active')
  if (room.current_turn !== userId) throw new Error('Not your turn')
  if (room.host_id !== userId && room.guest_id !== userId) throw new Error('You are not in this room')

  const nextTurn = room.current_turn === room.host_id ? room.guest_id : room.host_id

  const { error: updateError } = await supabaseAdmin
    .from('chess_rooms')
    .update({
      board_state: { ...room.board_state, last_move: move },
      current_turn: nextTurn,
    })
    .eq('id', roomId)

  if (updateError) throw updateError

  return { move, next_turn: nextTurn }
}

export async function resignGame(roomId: string, userId: string) {
  const { data: room } = await supabaseAdmin
    .from('chess_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (!room) throw new Error('Room not found')
  if (room.status !== 'active') throw new Error('Game is not active')

  const winnerId = room.host_id === userId ? room.guest_id : room.host_id

  await supabaseAdmin
    .from('chess_rooms')
    .update({ status: 'finished', winner_id: winnerId })
    .eq('id', roomId)

  if (room.stake > 0) {
    const totalPrize = room.stake * 2
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
      reference: `PLZ-CHESS-WIN-${roomId}`,
    })
  }

  return { winner_id: winnerId, message: 'Game over' }
}

function getInitialBoard() {
  return {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    last_move: null,
  }
}
