import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'

const BOT_STANDARDS = {
  easy: { minScore: 1200, maxScore: 2200 },
  medium: { minScore: 2800, maxScore: 4800 },
  hard: { minScore: 5500, maxScore: 8500 }
}

function generateCode(): string {
  return 'EMP-' + crypto.randomBytes(3).toString('hex').toUpperCase()
}

export async function createRoom(userId: string, stake: number, isBot = false, botDifficulty = 'medium') {
  const code = generateCode()

  if (stake > 0) {
    const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < stake) throw new Error('Insufficient balance to join H2H')
    
    await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: stake })
    const { data: updatedWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single();
    
    await supabaseAdmin.from('transactions').insert({ 
      user_id: userId, 
      type: 'game_entry', 
      amount: stake, 
      status: 'successful', 
      reference: `PLZ-EMP-${code}`,
      meta: { post_balance: updatedWallet?.balance || 0 }
    })
  }

  const { data, error } = await supabaseAdmin.from('emojipop_rooms').insert({
    code, 
    host_id: userId, 
    stake, 
    status: isBot ? 'active' : 'waiting',
    is_bot: isBot, 
    bot_difficulty: isBot ? botDifficulty : null,
    guest_id: isBot ? 'bot' : null,
  }).select().single()

  if (error) throw error
  return { room_id: data.id, code, status: data.status, stake }
}

export async function joinRoom(userId: string, code: string) {
  const { data: room } = await supabaseAdmin.from('emojipop_rooms').select('*').eq('code', code.toUpperCase()).single()
  if (!room) throw new Error('Room not found')
  if (room.status !== 'waiting') throw new Error('Room is no longer available')
  if (room.host_id === userId) throw new Error('You cannot join your own room')

  if (room.stake > 0) {
    const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
    if (!wallet || wallet.balance < room.stake) throw new Error('Insufficient balance to join this game')
    
    await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: room.stake })
    const { data: updatedWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single();
    
    await supabaseAdmin.from('transactions').insert({ 
      user_id: userId, 
      type: 'game_entry', 
      amount: room.stake, 
      status: 'successful', 
      reference: `PLZ-EMP-JOIN-${room.id}`,
      meta: { post_balance: updatedWallet?.balance || 0 }
    })
  }

  await supabaseAdmin.from('emojipop_rooms').update({ guest_id: userId, status: 'active' }).eq('id', room.id)
  return { room_id: room.id, code: room.code, stake: room.stake, status: 'active' }
}

export async function getRoom(roomId: string, userId: string) {
  const { data: room, error } = await supabaseAdmin
    .from('emojipop_rooms')
    .select(`
      id, code, status, stake, winner_id, is_bot, bot_difficulty, host_id, guest_id, created_at,
      host:users!host_id(id, username, avatar_url)
    `)
    .eq('id', roomId).single()

  if (error) throw error
  if (!room) throw new Error('Room not found')
  if (room.host_id !== userId && room.guest_id !== userId && room.guest_id !== 'bot') throw new Error('Not in this room')

  const { data: results } = await supabaseAdmin.from('emojipop_results').select('user_id, score, finished_at').eq('room_id', roomId)

  let guestData = null
  if (room.guest_id && room.guest_id !== 'bot') {
    const { data: guest } = await supabaseAdmin.from('users').select('id, username, avatar_url').eq('id', room.guest_id).single()
    guestData = guest
  } else if (room.guest_id === 'bot') {
    guestData = { id: 'bot', username: `Playza Bot (${room.bot_difficulty})`, avatar_url: null }
  }

  return { ...room, guest: guestData, results: results ?? [] }
}

export async function submitResult(roomId: string, userId: string, score: number) {
  // 1. Fetch active room
  const { data: room } = await supabaseAdmin.from('emojipop_rooms').select('*').eq('id', roomId).single()
  if (!room) throw new Error('Room not found')
  if (room.status !== 'active') throw new Error('Game not active')
  if (room.host_id !== userId && room.guest_id !== userId) throw new Error('Not in this room')

  // 2. Anti-cheat score validation
  if (score < 0 || score > 15000) {
    throw new Error('Invalid score pattern detected. Flagged for anti-cheat verification.')
  }

  // 3. Prevent double submissions
  const { data: existing } = await supabaseAdmin.from('emojipop_results').select('id').eq('room_id', roomId).eq('user_id', userId).single()
  if (existing) throw new Error('Result already submitted')

  // 4. Save result
  await supabaseAdmin.from('emojipop_results').insert({ room_id: roomId, user_id: userId, score, finished_at: new Date().toISOString() })

  const { data: results } = await supabaseAdmin.from('emojipop_results').select('user_id, score').eq('room_id', roomId)

  const bothDone = room.is_bot ? results && results.length >= 1 : results && results.length >= 2

  if (bothDone) {
    let winnerId: string | null = null

    // 5. Bot Simulation logic
    if (room.is_bot) {
      const botSpeed = BOT_STANDARDS[room.bot_difficulty as keyof typeof BOT_STANDARDS] || BOT_STANDARDS.medium
      const botScore = botSpeed.minScore + Math.floor(Math.random() * (botSpeed.maxScore - botSpeed.minScore))
      const userResult = results!.find(r => r.user_id === userId)
      
      winnerId = userResult && userResult.score > botScore ? userId : 'bot'

      await supabaseAdmin.from('emojipop_results').insert({ 
        room_id: roomId, 
        user_id: 'bot', 
        score: botScore, 
        finished_at: new Date().toISOString() 
      })
    } else {
      // Human vs Human comparison
      const sorted = results!.sort((a, b) => b.score - a.score)
      winnerId = sorted[0].score !== sorted[1].score ? sorted[0].user_id : null
    }

    // 6. Conclude Room Status
    await supabaseAdmin.from('emojipop_rooms').update({ status: 'finished', winner_id: winnerId }).eq('id', roomId)

    // 7. Wallet Payout logic for Winner
    if (winnerId && winnerId !== 'bot' && room.stake > 0) {
      const prize = room.stake * 2 * 0.9 // 10% platform fee
      await supabaseAdmin.rpc('increment_wallet_balance', { p_user_id: winnerId, p_amount: prize })
      const { data: updatedWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', winnerId).single();
      
      await supabaseAdmin.from('transactions').insert({ 
        user_id: winnerId, 
        type: 'winnings', 
        amount: prize, 
        status: 'successful', 
        reference: `PLZ-EMP-WIN-${roomId}`,
        meta: { post_balance: updatedWallet?.balance || 0 }
      })
    } else if (!winnerId && room.stake > 0) {
      // 8. Handle draw refund payouts (90% refund after 10% fee)
      const refund = room.stake * 0.9
      const players = [room.host_id, room.guest_id].filter(id => id && id !== 'bot')
      for (const uid of players) {
        await supabaseAdmin.rpc('increment_wallet_balance', { p_user_id: uid, p_amount: refund })
        const { data: updatedWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', uid).single();
        
        await supabaseAdmin.from('transactions').insert({ 
          user_id: uid, 
          type: 'bonus', 
          amount: refund, 
          status: 'successful', 
          reference: `PLZ-EMP-DRAW-${roomId}`, 
          meta: { reason: 'Game draw refund (90%)', post_balance: updatedWallet?.balance || 0 } 
        })
      }
    }

    // 9. Record general Game History stats
    const allPlayers = [room.host_id, room.guest_id].filter(id => id && id !== 'bot')
    for (const uid of allPlayers) {
      const isWinner = uid === winnerId
      const isDraw = winnerId === null
      
      await supabaseAdmin.from('game_history').insert({
        user_id: uid,
        game_name: 'Emoji Pop Duel',
        status: isDraw ? 'draw' : (isWinner ? 'win' : 'loss'),
        winnings: isWinner ? (room.stake * 1.8) : (isDraw ? room.stake : 0),
        played_at: new Date().toISOString()
      })
    }

    return { finished: true, winner_id: winnerId }
  }

  return { finished: false, waiting_for_opponent: true }
}

export async function findQuickMatch(userId: string, stake: number) {
  // Try to find a human waiting match
  const { data: waiting } = await supabaseAdmin
    .from('emojipop_rooms')
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

  // Fallback to bot match creation
  return createRoom(userId, stake)
}
