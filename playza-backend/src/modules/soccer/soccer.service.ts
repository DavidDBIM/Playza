import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'

const SYSTEM_BOT_ID = '00000000-0000-0000-0000-000000000001'

function generateRoomCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

async function handleGameOver(roomId: string, winnerId: string | null, stake: number) {
  await supabaseAdmin
    .from('soccer_rooms')
    .update({ status: 'finished', winner_id: winnerId })
    .eq('id', roomId)

  if (stake > 0 && winnerId && winnerId !== SYSTEM_BOT_ID) {
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
      reference: `PLZ-SOCCER-WIN-${roomId}`,
    })
  }
}

// ── Room operations ─────────────────────────────────────────────────────────

export async function listWaitingRooms() {
  const { data, error } = await supabaseAdmin
    .from('soccer_rooms')
    .select(`id, code, stake, created_at, host_id, game_mode, team0_name, team0_color,
      host:users!host_id(id, username, avatar_url)`)
    .eq('status', 'waiting')
    .eq('is_bot', false)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}

export async function createSoccerRoom(
  userId: string,
  stakeValue: number,
  meta: { gameMode?: string; team0Name?: string; team0Color?: string } = {}
) {
  const code = generateRoomCode()
  const stake = Number(stakeValue)

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < stake) throw new Error('Insufficient wallet balance')
    await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: stake })
    await supabaseAdmin.from('transactions').insert({
      user_id: userId, type: 'stake', amount: stake,
      status: 'successful', reference: `PLZ-SOCCER-STAKE-${code}`,
    })
  }

  const { data, error } = await supabaseAdmin
    .from('soccer_rooms')
    .insert({
      code, host_id: userId, stake,
      status: 'waiting', is_bot: false,
      game_mode: meta.gameMode || 'timed',
      team0_name: meta.team0Name || null,
      team0_color: meta.team0Color || null,
    })
    .select(`*, host:users!host_id(id, username, avatar_url)`)
    .single()
  if (error) throw error
  return data
}

export async function joinSoccerRoom(
  userId: string,
  code: string,
  meta: { team1Name?: string; team1Color?: string } = {}
) {
  const { data: room, error: fetchErr } = await supabaseAdmin
    .from('soccer_rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 'waiting')
    .single()
  if (fetchErr || !room) throw new Error('Room not found or already started')
  if (room.host_id === userId) throw new Error('Cannot join your own room')

  const stake = Number(room.stake)
  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < stake) throw new Error('Insufficient wallet balance')
    await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: stake })
    await supabaseAdmin.from('transactions').insert({
      user_id: userId, type: 'stake', amount: stake,
      status: 'successful', reference: `PLZ-SOCCER-STAKE-${code}`,
    })
  }

  const { data, error } = await supabaseAdmin
    .from('soccer_rooms')
    .update({
      guest_id: userId, status: 'active',
      team1_name: meta.team1Name || null,
      team1_color: meta.team1Color || null,
    })
    .eq('id', room.id)
    .select(`*, host:users!host_id(id, username, avatar_url), guest:users!guest_id(id, username, avatar_url)`)
    .single()
  if (error) throw error
  return data
}

export async function getSoccerRoom(roomId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('soccer_rooms')
    .select(`*, host:users!host_id(id, username, avatar_url), guest:users!guest_id(id, username, avatar_url)`)
    .eq('id', roomId)
    .single()
  if (error) throw error
  if (data.host_id !== userId && data.guest_id !== userId) throw new Error('Not a participant')
  return data
}

export async function createBotRoom(
  userId: string,
  stakeValue: number,
  difficulty: string = 'medium',
  gameMode: string = 'timed'
) {
  const code = generateRoomCode()
  const stake = Number(stakeValue)

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < stake) throw new Error('Insufficient wallet balance')
    await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: stake })
  }

  const { data, error } = await supabaseAdmin
    .from('soccer_rooms')
    .insert({
      code, host_id: userId, guest_id: SYSTEM_BOT_ID,
      stake, status: 'active', is_bot: true,
      bot_difficulty: difficulty, game_mode: gameMode,
    })
    .select(`*, host:users!host_id(id, username, avatar_url)`)
    .single()
  if (error) throw error
  return data
}

export async function findQuickMatch(userId: string, stakeValue: number) {
  const stake = Number(stakeValue)

  // Try to find an existing waiting room with same stake
  const { data: rooms } = await supabaseAdmin
    .from('soccer_rooms')
    .select('*')
    .eq('status', 'waiting')
    .eq('stake', stake)
    .eq('is_bot', false)
    .neq('host_id', userId)
    .limit(1)

  if (rooms && rooms.length > 0) {
    return joinSoccerRoom(userId, rooms[0].code)
  }
  // No match found — create a new room
  return createSoccerRoom(userId, stake)
}

export async function updateGameState(roomId: string, userId: string, gameState: any) {
  const { data: room } = await supabaseAdmin
    .from('soccer_rooms')
    .select('host_id, guest_id')
    .eq('id', roomId)
    .single()
  if (!room || (room.host_id !== userId && room.guest_id !== userId)) throw new Error('Not authorised')

  const { data, error } = await supabaseAdmin
    .from('soccer_rooms')
    .update({ game_state: gameState })
    .eq('id', roomId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function finishSoccerGame(roomId: string, userId: string, winnerId: string | null) {
  const { data: room } = await supabaseAdmin
    .from('soccer_rooms')
    .select('*')
    .eq('id', roomId)
    .single()
  if (!room) throw new Error('Room not found')
  if (room.host_id !== userId && room.guest_id !== userId) throw new Error('Not authorised')
  if (room.status === 'finished') return room // Already finished

  await handleGameOver(roomId, winnerId, room.stake)
  return { ...room, status: 'finished', winner_id: winnerId }
}

// ── Tournament operations ───────────────────────────────────────────────────

export async function createTournament(
  userId: string,
  params: { name: string; size: number; stake: number; difficulty: string }
) {
  const { name, size, stake, difficulty } = params

  if (![4, 8, 16, 32].includes(size)) throw new Error('Invalid tournament size')

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin
      .from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < stake) throw new Error('Insufficient wallet balance')
    await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: stake })
  }

  const { data, error } = await supabaseAdmin
    .from('soccer_tournaments')
    .insert({
      name, size, stake, difficulty,
      host_id: userId,
      participants: [userId],
      status: 'waiting',
      bracket: null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function joinTournament(tournamentId: string, userId: string) {
  const { data: t } = await supabaseAdmin
    .from('soccer_tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single()
  if (!t) throw new Error('Tournament not found')
  if (t.status !== 'waiting') throw new Error('Tournament already started')
  if (t.participants.includes(userId)) throw new Error('Already joined')
  if (t.participants.length >= t.size) throw new Error('Tournament is full')

  const participants = [...t.participants, userId]
  const { data, error } = await supabaseAdmin
    .from('soccer_tournaments')
    .update({ participants, status: participants.length === t.size ? 'active' : 'waiting' })
    .eq('id', tournamentId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTournament(tournamentId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('soccer_tournaments')
    .select(`*, host:users!host_id(id, username, avatar_url)`)
    .eq('id', tournamentId)
    .single()
  if (error) throw error
  return data
}

export async function getActiveTournaments(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('soccer_tournaments')
    .select(`id, name, size, stake, difficulty, status, participants, created_at, host:users!host_id(id, username, avatar_url)`)
    .in('status', ['waiting', 'active'])
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}
