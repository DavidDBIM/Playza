import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'

const WORD_BANK = [
  { word: 'CHAMPION', hint: 'A winner or title holder' },
  { word: 'PLAYZA', hint: 'Your favourite gaming platform' },
  { word: 'NIGERIA', hint: 'Giant of Africa' },
  { word: 'KEYBOARD', hint: 'You type with this' },
  { word: 'VICTORY', hint: 'What winners achieve' },
  { word: 'THUNDER', hint: 'Sound after lightning' },
  { word: 'DIAMOND', hint: 'Precious gemstone' },
  { word: 'WARRIOR', hint: 'A brave fighter' },
  { word: 'CAPTAIN', hint: 'Leader of a team' },
  { word: 'JOURNEY', hint: 'A long trip or quest' },
  { word: 'FORTUNE', hint: 'Wealth or good luck' },
  { word: 'PHANTOM', hint: 'A ghost or illusion' },
  { word: 'BRACKET', hint: 'Tournament structure' },
  { word: 'PRESTIGE', hint: 'High status or reputation' },
  { word: 'TRIUMPH', hint: 'A great victory' },
  { word: 'MONSTER', hint: 'A fearsome creature' },
  { word: 'KINGDOM', hint: 'Land ruled by a king' },
  { word: 'NETWORK', hint: 'Connected systems or people' },
  { word: 'QUANTUM', hint: 'Smallest unit of energy' },
  { word: 'LEGENDS', hint: 'Famous heroic figures' },
]

function scramble(word: string): string {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  const result = arr.join('')
  return result === word ? scramble(word) : result
}

function generateCode(): string {
  return 'WSC-' + crypto.randomBytes(3).toString('hex').toUpperCase()
}

function generateRounds(count = 5) {
  const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5).slice(0, count)
  return shuffled.map(w => ({ word: w.word, scrambled: scramble(w.word), hint: w.hint }))
}

const BOT_RESPONSE_TIMES = { easy: 8000, medium: 4000, hard: 1500 }

export async function createRoom(userId: string, stake: number, isBot = false, botDifficulty = 'medium') {
  const code = generateCode()
  const rounds = generateRounds(5)

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < stake) throw new Error('Insufficient balance')
    await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: stake })
    await supabaseAdmin.from('transactions').insert({ user_id: userId, type: 'game_entry', amount: stake, status: 'successful', reference: `PLZ-WSC-${code}` })
  }

  const { data, error } = await supabaseAdmin.from('wordscramble_rooms').insert({
    code, host_id: userId, stake, rounds: JSON.stringify(rounds),
    status: isBot ? 'active' : 'waiting',
    is_bot: isBot, bot_difficulty: isBot ? botDifficulty : null,
    guest_id: isBot ? 'bot' : null,
  }).select().single()

  if (error) throw error
  return { room_id: data.id, code, rounds, status: data.status, stake }
}

export async function joinRoom(userId: string, code: string) {
  const { data: room } = await supabaseAdmin.from('wordscramble_rooms').select('*').eq('code', code.toUpperCase()).single()
  if (!room) throw new Error('Room not found')
  if (room.status !== 'waiting') throw new Error('Room is no longer available')
  if (room.host_id === userId) throw new Error('You cannot join your own room')

  if (room.stake > 0) {
    const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < room.stake) throw new Error('Insufficient balance')
    await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: room.stake })
    await supabaseAdmin.from('transactions').insert({ user_id: userId, type: 'game_entry', amount: room.stake, status: 'successful', reference: `PLZ-WSC-JOIN-${room.id}` })
  }

  await supabaseAdmin.from('wordscramble_rooms').update({ guest_id: userId, status: 'active' }).eq('id', room.id)
  return { room_id: room.id, code: room.code, rounds: JSON.parse(room.rounds), stake: room.stake, status: 'active' }
}

export async function getRoom(roomId: string, userId: string) {
  const { data: room, error } = await supabaseAdmin
    .from('wordscramble_rooms')
    .select('id, code, status, rounds, stake, winner_id, is_bot, bot_difficulty, host_id, guest_id, created_at, host:users!host_id(id, username, avatar_url)')
    .eq('id', roomId).single()

  if (error) throw error
  if (!room) throw new Error('Room not found')
  if (room.host_id !== userId && room.guest_id !== userId && room.guest_id !== 'bot') throw new Error('Not in this room')

  const { data: scores } = await supabaseAdmin.from('wordscramble_scores').select('user_id, score, rounds_won').eq('room_id', roomId)

  let guestData = null
  if (room.guest_id && room.guest_id !== 'bot') {
    const { data: guest } = await supabaseAdmin.from('users').select('id, username, avatar_url').eq('id', room.guest_id).single()
    guestData = guest
  } else if (room.guest_id === 'bot') {
    guestData = { id: 'bot', username: `Playza Bot (${room.bot_difficulty})`, avatar_url: null }
  }

  return { ...room, rounds: JSON.parse(room.rounds), guest: guestData, scores: scores ?? [] }
}

export async function submitScore(roomId: string, userId: string, score: number, roundsWon: number) {
  const { data: room } = await supabaseAdmin.from('wordscramble_rooms').select('*').eq('id', roomId).single()
  if (!room) throw new Error('Room not found')
  if (room.status !== 'active') throw new Error('Game not active')

  const { data: existing } = await supabaseAdmin.from('wordscramble_scores').select('id').eq('room_id', roomId).eq('user_id', userId).single()
  if (existing) throw new Error('Score already submitted')

  await supabaseAdmin.from('wordscramble_scores').insert({ room_id: roomId, user_id: userId, score, rounds_won: roundsWon })

  const { data: scores } = await supabaseAdmin.from('wordscramble_scores').select('user_id, score, rounds_won').eq('room_id', roomId)
  const rounds = JSON.parse(room.rounds)
  const bothDone = room.is_bot ? scores && scores.length >= 1 : scores && scores.length >= 2

  if (bothDone) {
    let winnerId: string | null = null

    if (room.is_bot) {
      const botDiff = room.bot_difficulty || 'medium'
      const botSpeed = BOT_RESPONSE_TIMES[botDiff as keyof typeof BOT_RESPONSE_TIMES]
      const botScore = botDiff === 'easy' ? Math.floor(rounds.length * 0.4) : botDiff === 'medium' ? Math.floor(rounds.length * 0.65) : Math.floor(rounds.length * 0.85)
      const userScore = scores!.find(s => s.user_id === userId)
      winnerId = userScore && userScore.rounds_won > botScore ? userId : 'bot'
      await supabaseAdmin.from('wordscramble_scores').insert({ room_id: roomId, user_id: 'bot', score: botScore * 100, rounds_won: botScore })
    } else {
      const sorted = scores!.sort((a, b) => b.rounds_won - a.rounds_won)
      winnerId = sorted[0].rounds_won !== sorted[1].rounds_won ? sorted[0].user_id : null
    }

    await supabaseAdmin.from('wordscramble_rooms').update({ status: 'finished', winner_id: winnerId }).eq('id', roomId)

    if (winnerId && winnerId !== 'bot' && room.stake > 0) {
      const prize = room.stake * 2 * 0.9
      await supabaseAdmin.rpc('increment_wallet_balance', { p_user_id: winnerId, p_amount: prize })
      await supabaseAdmin.from('transactions').insert({ user_id: winnerId, type: 'winnings', amount: prize, status: 'successful', reference: `PLZ-WSC-WIN-${roomId}` })
    }

    return { finished: true, winner_id: winnerId }
  }

  return { finished: false, waiting_for_opponent: true }
}

export async function findQuickMatch(userId: string, stake: number) {
  const { data: waiting } = await supabaseAdmin
    .from('wordscramble_rooms')
    .select('id, code')
    .eq('status', 'waiting')
    .eq('stake', stake)
    .eq('is_bot', false)
    .neq('host_id', userId)
    .limit(1)
    .single()

  if (waiting) return joinRoom(userId, waiting.code)
  return createRoom(userId, stake)
}
