import { supabaseAdmin as supabase } from '../../config/supabase'

export async function getAllGames() {
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error

  // Enhance games with unique player counts
  const gamesWithStats = await Promise.all(games.map(async (game) => {
    // Get unique players across all sessions for this game
    const { data: leaderboardData, error: lErr } = await supabase
      .from('game_leaderboard')
      .select('user_id')
      .in('session_id', (
        await supabase.from('game_sessions').select('id').eq('game_id', game.id)
      ).data?.map(s => s.id) || [])

    const uniquePlayers = new Set(leaderboardData?.map(l => l.user_id)).size;

    return {
      ...game,
      unique_players: uniquePlayers
    }
  }))

  return gamesWithStats
}

export async function retireGame(gameId: string, status: boolean) {
  const { data, error } = await supabase
    .from('games')
    .update({ is_active: status })
    .eq('id', gameId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createGameWithSessions(gameData: any, sessions: any[]) {
  // 1. Create the Game
  const { data: game, error: gameErr } = await supabase
    .from('games')
    .insert({
      title: gameData.title,
      slug: gameData.slug,
      category: gameData.category,
      thumbnail_url: gameData.thumbnailUrl,
      iframe_url: gameData.iframeUrl,
      difficulty: gameData.difficulty,
      mode: gameData.mode,
      duration_seconds: gameData.durationInSeconds,
      platform_fee_percentage: gameData.platformFeePercentage,
      how_to_play: gameData.howToPlay,
      is_active: gameData.isActive
    })
    .select()
    .single()

  if (gameErr) throw gameErr

  // 2. Create associated Sessions if any
  if (sessions && sessions.length > 0) {
    const sessionsToInsert = sessions.map(s => ({
      game_id: game.id,
      title: s.title,
      type: s.type,
      entry_fee: s.entryFee,
      max_players: s.maxPlayers,
      winners_count: s.winnersCount,
      start_time: s.startTime,
      end_time: s.endTime,
      status: 'upcoming'
    }))

    const { error: sessErr } = await supabase
      .from('game_sessions')
      .insert(sessionsToInsert)

    if (sessErr) throw sessErr
  }

  return game
}

export async function updateSessionStatus(sessionId: string, status: string) {
  const { data, error } = await supabase
    .from('game_sessions')
    .update({ status })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return { success: true, session: data }
}

export async function getActiveSession(gameSlug: string) {
  // First find the game
  const { data: game, error: gameErr } = await supabase
    .from('games')
    .select('id')
    .eq('slug', gameSlug)
    .single()

  if (gameErr || !game) return null

  const now = new Date().toISOString()

  // -- AUTOMATIC TRANSITION --
  // Look for upcoming sessions that should have started and flip them to active
  const { data: shouldBeActive } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('game_id', game.id)
    .eq('status', 'upcoming')
    .lte('start_time', now)
    .gte('end_time', now)
  
  if (shouldBeActive && shouldBeActive.length > 0) {
    await supabase
      .from('game_sessions')
      .update({ status: 'active' })
      .in('id', shouldBeActive.map(s => s.id))
  }

  // Find active session
  const { data: session, error: sessErr } = await supabase
    .from('game_sessions')
    .select('*, games(*)')
    .eq('game_id', game.id)
    .lte('start_time', now)
    .gte('end_time', now)
    .eq('status', 'active')
    .single()

  if (sessErr) return null
  return session
}

export async function joinSession(userId: string, sessionId: string) {
  // 1. Get session details
  const { data: session, error: sessErr } = await supabase
    .from('game_sessions')
    .select('entry_fee, status, end_time')
    .eq('id', sessionId)
    .single()

  if (sessErr || !session) throw new Error("Session not found")
  
  // -- 10-MINUTE ENTRY LOCK --
  const now = new Date()
  const endTime = new Date(session.end_time)
  const entryDeadline = new Date(endTime.getTime() - 10 * 60 * 1000) // 10 mins before end

  if (now > entryDeadline) {
    throw new Error("Entries for this session are now closed (Closed 10 mins before end)")
  }

  if (session.status !== 'active' && session.status !== 'upcoming') {
    throw new Error("Session is not available for joining")
  }

  // 2. Check if already joined
  const { data: existing } = await supabase
    .from('game_leaderboard')
    .select('id')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single()

  if (existing) return { success: true, message: "Already joined" }

  // 3. Handle Wallet Deduction
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (!wallet || wallet.balance < session.entry_fee) {
    throw new Error("Insufficient funds to join tournament")
  }

  // 4. Update wallet and create entry (Transactionally)
  await supabase.rpc('decrement_wallet_balance', {
    p_user_id: userId,
    p_amount: session.entry_fee
  })
  
  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'game_entry',
    amount: session.entry_fee,
    status: 'successful',
    meta: { session_id: sessionId }
  })

  // 5. Update session pool
  const { data: currentSession } = await supabase.from('game_sessions').select('pool_amount').eq('id', sessionId).single()
  await supabase.from('game_sessions').update({ 
    pool_amount: (Number(currentSession?.pool_amount || 0) + session.entry_fee)
  }).eq('id', sessionId)

  // 6. Create leaderboard entry with round_start_time for anti-cheat
  const { data: entry, error: entErr } = await supabase
    .from('game_leaderboard')
    .insert({
      session_id: sessionId,
      user_id: userId,
      best_score: 0,
      attempts: 0,
      status: 'playing',
      updated_at: now.toISOString() // This will act as our "last play" marker
    })
    .select()
    .single()

  if (entErr) throw entErr

  return { success: true, entry }
}

export async function startRound(userId: string, sessionId: string) {
  const now = new Date()

  // 1. Verify session is active and user has joined
  const { data: entry } = await supabase
    .from('game_leaderboard')
    .select('id')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single()

  if (!entry) throw new Error("Join the session before starting a round")

  // 2. Create a play round record
  const { data: round, error } = await supabase
    .from('play_rounds')
    .insert({
      session_id: sessionId,
      user_id: userId,
      status: 'active',
      start_time: now.toISOString()
    })
    .select()
    .single()

  if (error) throw error

  return { success: true, roundId: round.id }
}

export async function submitSessionScore(userId: string, sessionId: string, score: number, roundId?: string) {
  const now = new Date()

  // 1. Get session and entry details
  const { data: session } = await supabase.from('game_sessions').select('end_time, status').eq('id', sessionId).single()
  const { data: entry } = await supabase
    .from('game_leaderboard')
    .select('*, users(username, avatar_url)')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single()


  if (!session || !entry) throw new Error("Invalid session or entry")

  // -- TOURNAMENT CLOSED CHECK --
  if (now > new Date(session.end_time)) {
    throw new Error("Tournament has ended. Score not accepted.")
  }

  // -- ROUND HANDSHAKE CHECK --
  if (!roundId) {
    throw new Error("Missing round validation token")
  }

  const { data: round } = await supabase
    .from('play_rounds')
    .select('*')
    .eq('id', roundId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!round) {
    throw new Error("Invalid or expired round token")
  }

  // -- ANTI-CHEAT: VELOCITY VALIDATION --
  const roundStartTime = new Date(round.start_time).getTime()
  const elapsedSeconds = (now.getTime() - roundStartTime) / 1000

  // Refined Logic: Sliding Puzzle pro solves in ~30s. If score > 500 in < 10s, reject.
  if (score > 500 && elapsedSeconds < 10) {
    throw new Error("Suspiciously fast score submission. Score rejected.")
  }

  // 2. Update score if higher
  let newBest = entry.best_score
  if (score > entry.best_score) {
    newBest = score
    await supabase
      .from('game_leaderboard')
      .update({
        best_score: score,
        attempts: entry.attempts + 1,
        updated_at: now.toISOString()
      })
      .eq('id', entry.id)
  } else {
    await supabase
      .from('game_leaderboard')
      .update({
        attempts: entry.attempts + 1,
        updated_at: now.toISOString()
      })
      .eq('id', entry.id)
  }

  // 3. Mark round as submitted
  await supabase.from('play_rounds').update({ status: 'submitted' }).eq('id', roundId)

  // 4. Trigger Realtime Broadcast for Live Leaderboard
  await supabase.channel(`session_${sessionId}`).send({
    type: 'broadcast',
    event: 'LEADERBOARD_UPDATE',
    payload: { 
      userId, 
      username: entry.users?.username,
      avatarUrl: entry.users?.avatar_url,
      newScore: newBest,
      isHighScore: score > entry.best_score
    }
  })


  // 5. Get new rank
  const { count } = await supabase
    .from('game_leaderboard')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .gt('best_score', newBest)

  return { success: true, rank: (count || 0) + 1 }
}


/**
 * Payout disbursement logic for Top 5 winners
 */
export async function finalizeSessionAndPayout(sessionId: string) {
  // 1. Get session details and winners
  const { data: session } = await supabase.from('game_sessions').select('*, games(platform_fee_percentage)').eq('id', sessionId).single()
  if (!session || session.status === 'completed') return { success: false, message: "Invalid session status" }

  // 2. Get Top 5 players by best_score
  const { data: winners } = await supabase
    .from('game_leaderboard')
    .select('*, users(username)')
    .eq('session_id', sessionId)
    .gt('best_score', 0)
    .order('best_score', { ascending: false })
    .limit(5)

  if (!winners || winners.length === 0) {
    await supabase.from('game_sessions').update({ status: 'completed' }).eq('id', sessionId)
    return { success: true, message: "No participants to payout" }
  }

  // 3. Calculate Net Prize Pool
  const grossPool = Number(session.pool_amount)
  const feePercent = Number(session.games.platform_fee_percentage || 10)
  const netPool = grossPool * (1 - feePercent / 100)

  // 4. Payout Distribution Curve (Top 5)
  // 1st: 40%, 2nd: 25%, 3rd: 15%, 4th: 10%, 5th: 10% (Simple distribution)
  const distribution = [0.4, 0.25, 0.15, 0.1, 0.1]

  for (let i = 0; i < winners.length; i++) {
    const winner = winners[i]
    const share = distribution[i] || 0
    const payoutAmount = parseFloat((netPool * share).toFixed(2))

    if (payoutAmount > 0) {
      // Update User Wallet
      await supabase.rpc('increment_wallet_balance', {
        p_user_id: winner.user_id,
        p_amount: payoutAmount
      })

      // Log Transaction
      await supabase.from('transactions').insert({
        user_id: winner.user_id,
        type: 'winnings',
        amount: payoutAmount,
        status: 'successful',
        meta: { session_id: sessionId, rank: i + 1, score: winner.best_score }
      })

      // Update leaderboard status
      await supabase.from('game_leaderboard').update({
        payout_amount: payoutAmount,
        payout_status: 'paid',
        status: 'finished'
      }).eq('id', winner.id)

      // --- SYNC TO USER HISTORY (WIN) ---
      await supabase.from('game_history').insert({
        user_id: winner.user_id,
        game_name: session.title || session.games.title,
        score: winner.best_score,
        position: `#${i + 1}`,
        winnings: payoutAmount,
        status: 'win',
        played_at: session.end_time
      })
    }
  }

  // 5. Mark non-winners as 'finished' and sync history
  const { data: others } = await supabase
    .from('game_leaderboard')
    .select('*')
    .eq('session_id', sessionId)
    .is('payout_status', 'pending')

  if (others && others.length > 0) {
    for (const player of others) {
      // Find their actual rank (inefficient but okay for Top 100)
      const { count } = await supabase
        .from('game_leaderboard')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .gt('best_score', player.best_score)
      
      const rank = (count || 0) + 1

      await supabase.from('game_history').insert({
        user_id: player.user_id,
        game_name: session.title || session.games.title,
        score: player.best_score,
        position: `#${rank}`,
        winnings: 0,
        status: 'loss',
        played_at: session.end_time
      })
    }
    
    await supabase.from('game_leaderboard').update({ status: 'finished' }).eq('session_id', sessionId).is('payout_status', 'pending')
  }

  // 6. Mark session as completed
  await supabase.from('game_sessions').update({ status: 'completed' }).eq('id', sessionId)

  return { success: true, winnersCount: winners.length }
}


export async function getSessionLeaderboard(sessionId: string) {

  const { data, error } = await supabase
    .from('game_leaderboard')
    .select(`
      id,
      best_score,
      attempts,
      updated_at,
      user_id,
      users (
        username,
        avatar_url
      )
    `)
    .eq('session_id', sessionId)
    .order('best_score', { ascending: false })
    .limit(100)

  if (error) throw error
  return { success: true, leaderboard: data }
}

export async function getUserSessionStats(userId: string, sessionId: string) {
  const { data: entry, error } = await supabase
    .from('game_leaderboard')
    .select(`
      *,
      session:game_sessions (
        title,
        pool_amount,
        winners_count
      )
    `)
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // Ignore "not found"
  
  // Calculate rank
  let rank = null
  if (entry) {
    const { count } = await supabase
      .from('game_leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .gt('best_score', entry.best_score)
    
    rank = (count || 0) + 1
  }

  return { success: true, stats: entry, rank }
}

export async function getGameSessions(gameId: string) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('game_id', gameId)
    .order('start_time', { ascending: false })

  if (error) throw error
  return { success: true, sessions: data }
}

export async function getSessionDetails(sessionId: string) {
  const now = new Date().toISOString()

  // -- AUTOMATIC TRANSITION --
  // If viewing an upcoming session that should be live, flip it
  await supabase
    .from('game_sessions')
    .update({ status: 'active' })
    .eq('id', sessionId)
    .eq('status', 'upcoming')
    .lte('start_time', now)
    .gte('end_time', now)

  const { data: session, error: sError } = await supabase
    .from('game_sessions')
    .select('*, games(*)')
    .eq('id', sessionId)
    .single()

  if (sError) throw sError

  const { data: roster, error: rError } = await supabase
    .from('game_leaderboard')
    .select('*, users(username, avatar_url, phone)')
    .eq('session_id', sessionId)
    .order('best_score', { ascending: false })

  if (rError) throw rError

  // Financial Breakdown for Admin
  const gross = Number(session.pool_amount || 0);
  const platformFeePercentage = Number(session.games?.platform_fee_percentage || 10);
  const platformFee = gross * (platformFeePercentage / 100);
  const netPrizePool = gross - platformFee;

  return { 
    success: true, 
    session, 
    roster,
    financials: {
      gross,
      platformFee,
      netPrizePool,
      platformFeePercentage
    }
  }
}





