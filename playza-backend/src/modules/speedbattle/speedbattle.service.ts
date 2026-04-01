import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'

const PARAGRAPHS = [
  "The quick brown fox jumps over the lazy dog near the riverbank at dawn.",
  "Playza is a platform where skill meets competition and champions are made.",
  "Nigeria is the giant of Africa with over two hundred million people.",
  "Technology is changing the world faster than anyone could have imagined.",
  "Champions are not born they are built through hard work and dedication.",
  "The internet has connected billions of people across the globe today.",
  "Gaming is now one of the fastest growing industries in the entire world.",
  "Practice every single day and you will improve beyond your own expectations.",
  "Speed and accuracy are the two pillars of every great typing champion.",
  "The future belongs to those who believe in the beauty of their dreams.",
]

const BOT_SPEEDS = {
  easy: { wpm: 25, accuracy: 0.92 },
  medium: { wpm: 45, accuracy: 0.96 },
  hard: { wpm: 70, accuracy: 0.99 },
}

function generateCode(): string {
  return 'SPD-' + crypto.randomBytes(3).toString('hex').toUpperCase()
}

function getRandomParagraph(): string {
  return PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]
}

export async function createRoom(userId: string, stake: number, isBot = false, botDifficulty = 'medium') {
  const code = generateCode()
  const paragraph = getRandomParagraph()

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < stake) throw new Error('Insufficient balance')
    await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: stake })
    await supabaseAdmin.from('transactions').insert({ user_id: userId, type: 'game_entry', amount: stake, status: 'successful', reference: `PLZ-SPD-${code}` })
  }

  const { data, error } = await supabaseAdmin.from('speedbattle_rooms').insert({
    code, host_id: userId, stake, paragraph, status: isBot ? 'active' : 'waiting',
    is_bot: isBot, bot_difficulty: isBot ? botDifficulty : null,
    guest_id: isBot ? 'bot' : null,
  }).select().single()

  if (error) throw error
  return { room_id: data.id, code, paragraph, status: data.status, stake }
}

export async function joinRoom(userId: string, code: string) {
  const { data: room } = await supabaseAdmin.from('speedbattle_rooms').select('*').eq('code', code.toUpperCase()).single()
  if (!room) throw new Error('Room not found')
  if (room.status !== 'waiting') throw new Error('Room is no longer available')
  if (room.host_id === userId) throw new Error('You cannot join your own room')

  if (room.stake > 0) {
    const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < room.stake) throw new Error('Insufficient balance')
    await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: room.stake })
    await supabaseAdmin.from('transactions').insert({ user_id: userId, type: 'game_entry', amount: room.stake, status: 'successful', reference: `PLZ-SPD-JOIN-${room.id}` })
  }

  await supabaseAdmin.from('speedbattle_rooms').update({ guest_id: userId, status: 'active' }).eq('id', room.id)
  return { room_id: room.id, code: room.code, paragraph: room.paragraph, stake: room.stake, status: 'active' }
}

export async function getRoom(roomId: string, userId: string) {
  const { data: room, error } = await supabaseAdmin
    .from('speedbattle_rooms')
    .select(`id, code, status, paragraph, stake, winner_id, is_bot, bot_difficulty, host_id, guest_id, created_at,
      host:users!host_id(id, username, avatar_url),
      host_result:speedbattle_results!room_id(wpm, accuracy, finished_at, user_id)`)
    .eq('id', roomId).single()

  if (error) throw error
  if (!room) throw new Error('Room not found')
  if (room.host_id !== userId && room.guest_id !== userId && room.guest_id !== 'bot') throw new Error('Not in this room')

  const { data: results } = await supabaseAdmin.from('speedbattle_results').select('user_id, wpm, accuracy, finished_at').eq('room_id', roomId)

  let guestData = null
  if (room.guest_id && room.guest_id !== 'bot') {
    const { data: guest } = await supabaseAdmin.from('users').select('id, username, avatar_url').eq('id', room.guest_id).single()
    guestData = guest
  } else if (room.guest_id === 'bot') {
    guestData = { id: 'bot', username: `Playza Bot (${room.bot_difficulty})`, avatar_url: null }
  }

  return { ...room, guest: guestData, results: results ?? [] }
}

export async function submitResult(roomId: string, userId: string, wpm: number, accuracy: number) {
  const { data: room } = await supabaseAdmin.from('speedbattle_rooms').select('*').eq('id', roomId).single()
  if (!room) throw new Error('Room not found')
  if (room.status !== 'active') throw new Error('Game not active')
  if (room.host_id !== userId && room.guest_id !== userId) throw new Error('Not in this room')

  const { data: existing } = await supabaseAdmin.from('speedbattle_results').select('id').eq('room_id', roomId).eq('user_id', userId).single()
  if (existing) throw new Error('Result already submitted')

  await supabaseAdmin.from('speedbattle_results').insert({ room_id: roomId, user_id: userId, wpm, accuracy, finished_at: new Date().toISOString() })

  const { data: results } = await supabaseAdmin.from('speedbattle_results').select('user_id, wpm, accuracy').eq('room_id', roomId)

  const bothDone = room.is_bot ? results && results.length >= 1 : results && results.length >= 2

  if (bothDone) {
    let winnerId: string | null = null

    if (room.is_bot) {
      const botSpeed = BOT_SPEEDS[room.bot_difficulty as keyof typeof BOT_SPEEDS] || BOT_SPEEDS.medium
      const botWpm = botSpeed.wpm + Math.floor(Math.random() * 10 - 5)
      const userResult = results!.find(r => r.user_id === userId)
      winnerId = userResult && userResult.wpm > botWpm ? userId : 'bot'

      await supabaseAdmin.from('speedbattle_results').insert({ room_id: roomId, user_id: 'bot', wpm: botWpm, accuracy: botSpeed.accuracy, finished_at: new Date().toISOString() })
    } else {
      const sorted = results!.sort((a, b) => b.wpm - a.wpm)
      winnerId = sorted[0].wpm !== sorted[1].wpm ? sorted[0].user_id : null
    }

    await supabaseAdmin.from('speedbattle_rooms').update({ status: 'finished', winner_id: winnerId }).eq('id', roomId)

    if (winnerId && winnerId !== 'bot' && room.stake > 0) {
      const prize = room.stake * 2 * 0.9
      await supabaseAdmin.rpc('increment_wallet_balance', { p_user_id: winnerId, p_amount: prize })
      await supabaseAdmin.from('transactions').insert({ user_id: winnerId, type: 'winnings', amount: prize, status: 'successful', reference: `PLZ-SPD-WIN-${roomId}` })
    }

    return { finished: true, winner_id: winnerId }
  }

  return { finished: false, waiting_for_opponent: true }
}

export async function findQuickMatch(userId: string, stake: number) {
  const { data: waiting } = await supabaseAdmin
    .from('speedbattle_rooms')
    .select('id, code')
    .eq('status', 'waiting')
    .eq('stake', stake)
    .eq('is_bot', false)
    .neq('host_id', userId)
    .limit(1)
    .single()

  if (waiting) {
    return joinRoom(userId, waiting.code)
  }

  return createRoom(userId, stake)
}
