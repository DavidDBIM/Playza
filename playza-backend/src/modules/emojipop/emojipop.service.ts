import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'

const BOT_STANDARDS = {
  easy: { minScore: 1200, maxScore: 2200 },
  medium: { minScore: 2800, maxScore: 4800 },
  hard: { minScore: 5500, maxScore: 8500 }
}

const BOT_PERSONAS = [
  { username: 'KwameMaster', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b1' },
  { username: 'Chioma_Moves', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b2' },
  { username: 'EmekaCheck', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b3' },
  { username: 'Aisha_Queen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b4' },
  { username: 'TundeTactics', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b5' },
  { username: 'ZainabPlays', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b6' },
  { username: 'Nia_Strategist', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b7' },
  { username: 'Kenzo_AI', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b8' },
  { username: 'YukiMate', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b9' },
  { username: 'Hiroshi_X', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b10' },
  { username: 'Mei_Lin_Chess', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b11' },
  { username: 'Wei_Master', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b12' },
  { username: 'Chen_G', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b13' },
  { username: 'Sakura_Pawn', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b14' },
  { username: 'Jin_Woo', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b15' },
  { username: 'Arjun_King', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b16' },
  { username: 'Priya_Play', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b17' },
  { username: 'Ravi_Knight', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b18' },
  { username: 'Deepak_Pro', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b19' },
  { username: 'Aditi_Rook', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b20' },
  { username: 'John_Smith_99', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b21' },
  { username: 'Sarah_Connor', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b22' },
  { username: 'Mike_Checkmate', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b23' },
  { username: 'Emily_Bishop', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b24' },
  { username: 'David_Castle', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b25' },
  { username: 'Jessica_Win', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b26' },
  { username: 'James_Bond_007', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b27' },
  { username: 'Maria_Garcia', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b28' },
  { username: 'Carlos_Mate', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b29' },
  { username: 'Ana_Silva', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b30' },
  { username: 'Luis_Pro', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b31' },
  { username: 'Elena_V', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b32' },
  { username: 'Diego_Armando', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b33' },
  { username: 'Isabella_Queen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b34' },
  { username: 'Mateo_King', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b35' },
  { username: 'Sofia_Mate', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b36' },
  { username: 'Lucas_X', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b37' },
  { username: 'Mia_G', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b38' },
  { username: 'Oliver_Twist', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b39' },
  { username: 'Emma_Watson', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b40' },
  { username: 'Noah_Ark', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b41' },
  { username: 'Ava_Max', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b42' },
  { username: 'William_Tell', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b43' },
  { username: 'Sophia_Loren', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b44' },
  { username: 'James_Cameron', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b45' },
  { username: 'Charlotte_Web', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b46' },
  { username: 'Benjamin_Button', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b47' },
  { username: 'Amelia_Earhart', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b48' },
  { username: 'Elijah_Wood', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b49' },
  { username: 'Harper_Lee', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b50' },
  { username: 'Kofi_Annan', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b51' },
  { username: 'Fatima_B', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b52' },
  { username: 'Idris_E', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b53' },
  { username: 'Ngozi_O', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b54' },
  { username: 'Tariq_St', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b55' },
  { username: 'Amira_H', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b56' },
  { username: 'Zane_M', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b57' },
  { username: 'Aaliyah_D', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b58' },
  { username: 'Jamal_W', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b59' },
  { username: 'Keisha_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b60' },
  { username: 'Satoshi_N', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b61' },
  { username: 'Miko_Y', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b62' },
  { username: 'Kenji_S', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b63' },
  { username: 'Yuna_K', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b64' },
  { username: 'Ryu_Street', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b65' },
  { username: 'Chun_Li', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b66' },
  { username: 'Jackie_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b67' },
  { username: 'Bruce_L', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b68' },
  { username: 'Jet_L', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b69' },
  { username: 'Donnie_Y', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b70' },
  { username: 'Magnus_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b71' },
  { username: 'Hikaru_N', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b72' },
  { username: 'Garry_K', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b73' },
  { username: 'Anatoly_K', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b74' },
  { username: 'Bobby_F', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b75' },
  { username: 'Mikhail_T', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b76' },
  { username: 'Jose_R', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b77' },
  { username: 'Emanuel_L', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b78' },
  { username: 'Wilhelm_S', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b79' },
  { username: 'Paul_M', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b80' },
  { username: 'Judit_P', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b81' },
  { username: 'Hou_Y', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b82' },
  { username: 'Maia_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b83' },
  { username: 'Nona_G', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b84' },
  { username: 'Vera_M', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b85' },
  { username: 'Xie_J', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b86' },
  { username: 'Alexandra_K', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b87' },
  { username: 'Anna_M', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b88' },
  { username: 'Mariya_M', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b89' },
  { username: 'Elisabeth_P', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b90' },
  { username: 'Kateryna_L', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b91' },
  { username: 'Nana_D', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b92' },
  { username: 'Pia_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b93' },
  { username: 'Zhu_C', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b94' },
  { username: 'Antoaneta_S', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b95' },
  { username: 'Humpy_K', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b96' },
  { username: 'Ju_W', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b97' },
  { username: 'Tan_Z', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b98' },
  { username: 'Lei_T', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b99' },
  { username: 'Aleksandra_G', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=b100' },
]

function generateCode(): string {
  return 'EMP-' + crypto.randomBytes(3).toString('hex').toUpperCase()
}

export async function createRoom(userId: string, stake: number, isBot = false, botDifficulty = 'medium') {
  const code = generateCode()

  let finalDifficulty = botDifficulty;

  if (isBot) {
    // Determine active bot names to avoid collisions
    const { data: activeBotRooms } = await supabaseAdmin
      .from('emojipop_rooms')
      .select('bot_difficulty')
      .eq('is_bot', true)
      .eq('status', 'active')

    const usedUsernames = new Set(
      activeBotRooms?.map(r => {
        const parts = (r.bot_difficulty || '').split('|')
        return parts[1]
      }).filter(Boolean)
    )

    const availableBots = BOT_PERSONAS.filter(b => !usedUsernames.has(b.username))
    const botPersona = availableBots.length > 0 
      ? availableBots[Math.floor(Math.random() * availableBots.length)] 
      : BOT_PERSONAS[Math.floor(Math.random() * BOT_PERSONAS.length)]

    // Serialize as difficulty|bot_username|bot_avatar_url
    finalDifficulty = `${botDifficulty}|${botPersona.username}|${botPersona.avatar_url}`
  }

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
    bot_difficulty: finalDifficulty,
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
    const parts = (room.bot_difficulty || 'medium').split('|')
    const botName = parts[1] || `PLAYZA Bot (${parts[0] || 'medium'})`
    const botAvatar = parts[2] || null
    guestData = { id: 'bot', username: botName, avatar_url: botAvatar }
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
      const difficultyPart = (room.bot_difficulty || 'medium').split('|')[0]
      const botSpeed = BOT_STANDARDS[difficultyPart as keyof typeof BOT_STANDARDS] || BOT_STANDARDS.medium
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

  // Fallback to bot match creation (automatically pairing with the computer)
  return createRoom(userId, stake, true)
}
