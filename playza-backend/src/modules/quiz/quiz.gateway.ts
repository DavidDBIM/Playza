import { Server as SocketServer, Socket } from 'socket.io'
import { supabaseAdmin } from '../../config/supabase'
import { ROUND_CONFIG, PRIZE_SPLIT } from './quiz.types'

// ─── In-memory game state (fast, no DB round-trips during live play) ──────────

interface QuestionState {
  questionId: string
  questionText: string
  imageUrl: string | null
  options: { A: string; B: string; C: string; D: string }
  correctOption: string
  timeLimitMs: number
  startedAt: number
  answers: Map<string, { option: string; timeTakenMs: number }>
  timerHandle: ReturnType<typeof setTimeout> | null
}

interface GameState {
  tournamentId: string
  status: 'lobby' | 'active' | 'completed'
  currentRound: number
  currentQuestionIndex: number
  alivePlayers: Set<string>        // user IDs
  socketToUser: Map<string, string> // socketId → userId
  userToSocket: Map<string, string> // userId → socketId
  questions: Record<number, any[]>  // round → questions array
  currentQuestion: QuestionState | null
  lobbyCountdown: ReturnType<typeof setTimeout> | null
}

const games = new Map<string, GameState>()

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loadQuestions(tournamentId: string): Promise<Record<number, any[]>> {
  const { data } = await supabaseAdmin
    .from('quiz_questions')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('order_index')

  const byRound: Record<number, any[]> = {}
  for (const q of data ?? []) {
    if (!byRound[q.round_number]) byRound[q.round_number] = []
    byRound[q.round_number].push(q)
  }
  return byRound
}

// ─── New scoring: rank by rounds_survived → correct_answers → speed_score → speed_ms → random ──
async function updateLeaderboard(tournamentId: string, io: SocketServer) {
  const { data: rows } = await supabaseAdmin
    .from('quiz_leaderboard')
    .select('*')
    .eq('tournament_id', tournamentId)

  if (!rows?.length) return

  // Sort by our ranking formula
  const sorted = [...rows].sort((a, b) => {
    if ((b.rounds_survived ?? 0) !== (a.rounds_survived ?? 0))
      return (b.rounds_survived ?? 0) - (a.rounds_survived ?? 0)
    if ((b.correct_answers ?? 0) !== (a.correct_answers ?? 0))
      return (b.correct_answers ?? 0) - (a.correct_answers ?? 0)
    if ((b.speed_score ?? 0) !== (a.speed_score ?? 0))
      return (b.speed_score ?? 0) - (a.speed_score ?? 0)
    if ((b.speed_ms ?? 0) !== (a.speed_ms ?? 0))
      return (b.speed_ms ?? 0) - (a.speed_ms ?? 0)
    return Math.random() - 0.5 // random tiebreak (virtually never reached)
  })

  const ranked = sorted.map((row, i) => ({ ...row, rank: i + 1 }))

  // Batch update ranks
  for (const row of ranked) {
    await supabaseAdmin
      .from('quiz_leaderboard')
      .update({ rank: row.rank, updated_at: new Date().toISOString() })
      .eq('tournament_id', tournamentId)
      .eq('user_id', row.user_id)
  }

  io.to(`quiz:${tournamentId}`).emit('quiz:leaderboard_update', { leaderboard: ranked.slice(0, 50) })
}

async function eliminatePlayer(
  tournamentId: string,
  userId: string,
  round: number,
  questionIndex: number,
  io: SocketServer,
  game: GameState
) {
  game.alivePlayers.delete(userId)

  // rounds_survived = rounds fully completed before elimination
  // e.g. eliminated on Round 3 Q1 = survived 2 full rounds
  const roundsSurvived = round - 1

  await supabaseAdmin
    .from('quiz_players')
    .update({ status: 'eliminated', eliminated_at_round: round, eliminated_at_question: questionIndex })
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)

  await supabaseAdmin
    .from('quiz_leaderboard')
    .update({
      status: 'eliminated',
      rounds_survived: roundsSurvived,
      updated_at: new Date().toISOString(),
    })
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)

  const socketId = game.userToSocket.get(userId)
  if (socketId) {
    io.to(socketId).emit('quiz:eliminated', {
      round,
      message: "Wrong answer — you've been eliminated!",
      alive_count: game.alivePlayers.size,
    })
  }
}

async function endTournament(tournamentId: string, io: SocketServer, game: GameState) {
  game.status = 'completed'

  try {
    // ── 1. Update rounds_survived for still-alive players (they survived all rounds) ──
    const totalRounds = Object.keys(game.questions).length
    for (const userId of game.alivePlayers) {
      await supabaseAdmin
        .from('quiz_leaderboard')
        .update({ rounds_survived: totalRounds, status: 'alive', updated_at: new Date().toISOString() })
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
    }

    // ── 2. Run final ranking ──────────────────────────────────────────────────
    const { data: allRows } = await supabaseAdmin
      .from('quiz_leaderboard')
      .select('*')
      .eq('tournament_id', tournamentId)

    if (!allRows?.length) return

    const sorted = [...allRows].sort((a, b) => {
      if ((b.rounds_survived ?? 0) !== (a.rounds_survived ?? 0))
        return (b.rounds_survived ?? 0) - (a.rounds_survived ?? 0)
      if ((b.correct_answers ?? 0) !== (a.correct_answers ?? 0))
        return (b.correct_answers ?? 0) - (a.correct_answers ?? 0)
      if ((b.speed_score ?? 0) !== (a.speed_score ?? 0))
        return (b.speed_score ?? 0) - (a.speed_score ?? 0)
      if ((b.speed_ms ?? 0) !== (a.speed_ms ?? 0))
        return (b.speed_ms ?? 0) - (a.speed_ms ?? 0)
      return Math.random() - 0.5
    })

    const ranked = sorted.map((row, i) => ({ ...row, rank: i + 1 }))

    // ── 3. Load tournament config ────────────────────────────────────────────
    const { data: tournament } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('prize_pool, prize_distribution, platform_fee_percentage, consolation_pza')
      .eq('id', tournamentId)
      .single()

    const prizePool       = tournament?.prize_pool ?? 0
    const feePct          = tournament?.platform_fee_percentage ?? 10
    const consolationPza  = tournament?.consolation_pza ?? 0
    const distributablePool = Math.floor(prizePool * (1 - feePct / 100))

    // Use admin-configured prize_distribution, fallback to default split
    const prizeDist: { rank: number; percentage: number }[] =
      tournament?.prize_distribution?.length
        ? tournament.prize_distribution
        : [
            { rank: 1, percentage: 60 },
            { rank: 2, percentage: 25 },
            { rank: 3, percentage: 15 },
          ]

    // ── 4. Pay prizes based on final rank ───────────────────────────────────
    const prizeWinners: { rank: number; username: string; prize: number }[] = []

    for (const tier of prizeDist) {
      const recipient = ranked.find(r => r.rank === tier.rank)
      if (!recipient) continue

      const prize = Math.floor(distributablePool * tier.percentage / 100)
      if (prize <= 0) continue

      try {
        await supabaseAdmin.rpc('increment_wallet_balance', {
          p_user_id: recipient.user_id,
          p_amount: prize,
        })

        await supabaseAdmin.from('transactions').insert({
          user_id: recipient.user_id,
          type: 'quiz_prize',
          amount: prize,
          status: 'completed',
          reference: `QUIZ-PRIZE-${tournamentId}-${recipient.user_id}-${Date.now()}`,
          meta: { tournament_id: tournamentId, rank: tier.rank, prize_pool: prizePool },
        })

        await supabaseAdmin
          .from('quiz_players')
          .update({ status: 'winner', final_rank: tier.rank, prize_won: prize })
          .eq('tournament_id', tournamentId)
          .eq('user_id', recipient.user_id)

        await supabaseAdmin
          .from('quiz_leaderboard')
          .update({ status: 'winner', rank: tier.rank, final_rank: tier.rank })
          .eq('tournament_id', tournamentId)
          .eq('user_id', recipient.user_id)

        prizeWinners.push({ rank: tier.rank, username: recipient.username ?? 'Player', prize })
        console.log(`[QuizEnd] Rank ${tier.rank} prize: ${prize} ZA → ${recipient.username}`)
      } catch (err) {
        console.error(`[QuizEnd] Prize payment failed for rank ${tier.rank}:`, err)
      }
    }

    // Update all final ranks in leaderboard
    for (const row of ranked) {
      await supabaseAdmin
        .from('quiz_leaderboard')
        .update({ rank: row.rank, final_rank: row.rank, updated_at: new Date().toISOString() })
        .eq('tournament_id', tournamentId)
        .eq('user_id', row.user_id)
    }

    // ── 5. Consolation PZA — give to ALL registered players ─────────────────
    if (consolationPza > 0) {
      const { data: allPlayers } = await supabaseAdmin
        .from('quiz_players')
        .select('user_id')
        .eq('tournament_id', tournamentId)

      for (const p of (allPlayers ?? [])) {
        try {
          await supabaseAdmin.from('pza_events').insert({
            user_id: p.user_id,
            event_type: 'quiz_participation',
            points: consolationPza,
            reference: `QUIZ-PZA-${tournamentId}-${p.user_id}`,
            meta: { tournament_id: tournamentId },
          })

          // Update total pza_points balance
          const { data: pzaRow } = await supabaseAdmin
            .from('pza_points')
            .select('total_points')
            .eq('user_id', p.user_id)
            .single()

          await supabaseAdmin
            .from('pza_points')
            .upsert({
              user_id: p.user_id,
              total_points: (pzaRow?.total_points ?? 0) + consolationPza,
            }, { onConflict: 'user_id' })
        } catch (err) {
          console.error(`[QuizEnd] Consolation PZA failed for ${p.user_id}:`, err)
        }
      }
      console.log(`[QuizEnd] Consolation ${consolationPza} PZA sent to ${allPlayers?.length ?? 0} players`)
    }

    // ── 6. Mark tournament completed ─────────────────────────────────────────
    await supabaseAdmin
      .from('quiz_tournaments')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', tournamentId)

    // ── 7. Broadcast game over ────────────────────────────────────────────────
    io.to(`quiz:${tournamentId}`).emit('quiz:game_over', {
      leaderboard: ranked.slice(0, 10),
      winners: prizeWinners,
      prize_pool: prizePool,
      distributable_pool: distributablePool,
      consolation_pza: consolationPza,
    })

    console.log(`[QuizEnd] Tournament ${tournamentId} completed. Winners: ${prizeWinners.length}`)
  } catch (err) {
    console.error('[QuizEnd] endTournament error:', err)
  }

  games.delete(tournamentId)
}

async function revealAndAdvance(tournamentId: string, io: SocketServer, game: GameState) {
  const q = game.currentQuestion
  if (!q) return

  if (q.timerHandle) clearTimeout(q.timerHandle)
  q.timerHandle = null

  const roundCfg = ROUND_CONFIG[game.currentRound - 1]
  const questions = game.questions[game.currentRound] ?? []

  // Eliminate players who didn't answer or answered wrong
  const eliminatedThisQ: string[] = []
  for (const userId of [...game.alivePlayers]) {
    const answer = q.answers.get(userId)
    if (!answer || answer.option !== q.correctOption) {
      eliminatedThisQ.push(userId)
      await eliminatePlayer(tournamentId, userId, game.currentRound, game.currentQuestionIndex, io, game)
    } else {
      // Update leaderboard stats
      const totalAnswered = await supabaseAdmin
        .from('quiz_answers')
        .select('time_taken_ms')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .eq('is_correct', true)

      const times = totalAnswered.data?.map(r => r.time_taken_ms ?? 0) ?? []
      const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0

      await supabaseAdmin
        .from('quiz_leaderboard')
        .update({
          correct_answers: (totalAnswered.data?.length ?? 0),
          avg_time_ms: avg,
          updated_at: new Date().toISOString(),
        })
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
    }
  }

  // Broadcast reveal
  io.to(`quiz:${tournamentId}`).emit('quiz:reveal', {
    correct_option: q.correctOption,
    eliminated_count: eliminatedThisQ.length,
    alive_count: game.alivePlayers.size,
    round: game.currentRound,
    question_index: game.currentQuestionIndex,
  })

  await updateLeaderboard(tournamentId, io)

  // Check if everyone eliminated
  if (game.alivePlayers.size === 0) {
    setTimeout(() => endTournament(tournamentId, io, game), 3000)
    return
  }

  const nextQIndex = game.currentQuestionIndex + 1

  // All questions in this round done?
  if (nextQIndex >= questions.length) {
    const nextRound = game.currentRound + 1

    if (nextRound > 5) {
      // Game over
      setTimeout(() => endTournament(tournamentId, io, game), 4000)
      return
    }

    // Round summary pause
    io.to(`quiz:${tournamentId}`).emit('quiz:round_summary', {
      round_completed: game.currentRound,
      round_name: roundCfg?.name ?? `Round ${game.currentRound}`,
      survivors: game.alivePlayers.size,
      eliminated_this_round: eliminatedThisQ.length,
      next_round: nextRound,
      next_round_name: ROUND_CONFIG[nextRound - 1]?.name ?? `Round ${nextRound}`,
    })

    game.currentRound = nextRound
    game.currentQuestionIndex = 0

    await supabaseAdmin
      .from('quiz_tournaments')
      .update({ current_round: nextRound, current_question: 0 })
      .eq('id', tournamentId)

    setTimeout(() => sendNextQuestion(tournamentId, io, game), 8000)
  } else {
    game.currentQuestionIndex = nextQIndex

    await supabaseAdmin
      .from('quiz_tournaments')
      .update({ current_question: nextQIndex })
      .eq('id', tournamentId)

    setTimeout(() => sendNextQuestion(tournamentId, io, game), 3000)
  }
}

async function sendNextQuestion(tournamentId: string, io: SocketServer, game: GameState) {
  const questions = game.questions[game.currentRound] ?? []
  const q = questions[game.currentQuestionIndex]

  if (!q) {
    await endTournament(tournamentId, io, game)
    return
  }

  const roundCfg = ROUND_CONFIG[game.currentRound - 1]
  const timeLimitMs = (roundCfg?.time_secs ?? 30) * 1000

  game.currentQuestion = {
    questionId: q.id,
    questionText: q.question_text,
    imageUrl: q.image_url ?? null,
    options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
    correctOption: q.correct_option,
    timeLimitMs,
    startedAt: Date.now(),
    answers: new Map(),
    timerHandle: null,
  }

  io.to(`quiz:${tournamentId}`).emit('quiz:question_start', {
    question_id: q.id,
    round: game.currentRound,
    round_name: roundCfg?.name,
    question_index: game.currentQuestionIndex,
    total_questions: questions.length,
    question_text: q.question_text,
    image_url: q.image_url ?? null,
    options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
    time_limit_ms: timeLimitMs,
    alive_count: game.alivePlayers.size,
    difficulty: q.difficulty,
  })

  // Auto-reveal when timer expires
  game.currentQuestion.timerHandle = setTimeout(
    () => revealAndAdvance(tournamentId, io, game),
    timeLimitMs + 500
  )
}

// ─── Socket gateway setup ─────────────────────────────────────────────────────

export function setupQuizGateway(io: SocketServer) {
  const quizNs = io.of('/quiz')

  quizNs.on('connection', (socket: Socket) => {
    const userId = socket.handshake.auth.userId as string | undefined
    if (!userId) { socket.disconnect(true); return }

    // ── JOIN LOBBY ────────────────────────────────────────────────────────────
    socket.on('quiz:join', async ({ tournament_id }: { tournament_id: string }) => {
      try {
        // Join the room immediately (synchronous) before any async DB work
        socket.join(`quiz:${tournament_id}`)

        let game = games.get(tournament_id)
        if (!game) {
          const questions = await loadQuestions(tournament_id)
          game = {
            tournamentId: tournament_id,
            status: 'lobby',
            currentRound: 1,
            currentQuestionIndex: 0,
            alivePlayers: new Set(),
            socketToUser: new Map(),
            userToSocket: new Map(),
            questions,
            currentQuestion: null,
            lobbyCountdown: null,
          }
          games.set(tournament_id, game)
        }

        game.socketToUser.set(socket.id, userId)
        game.userToSocket.set(userId, socket.id)

        // Count registered players from DB for the lobby counter
        const { count } = await supabaseAdmin
          .from('quiz_players')
          .select('id', { count: 'exact', head: true })
          .eq('tournament_id', tournament_id)
          .in('status', ['registered', 'alive'])

        // Always emit lobby_update — this is what unlocks chat on the client
        quizNs.to(`quiz:${tournament_id}`).emit('quiz:lobby_update', {
          player_count: count ?? 0,
          status: game.status,
        })

        // Send current leaderboard on join
        const { data: lb } = await supabaseAdmin
          .from('quiz_leaderboard')
          .select('rank, user_id, username, avatar_url, correct_answers, avg_time_ms, status')
          .eq('tournament_id', tournament_id)
          .order('rank', { ascending: true })
          .limit(50)

        socket.emit('quiz:leaderboard_update', { leaderboard: lb ?? [] })

        // Load last 50 chat messages so history persists across refreshes
        const { data: chatHistory } = await supabaseAdmin
          .from('quiz_lobby_chat')
          .select('user_id, username, avatar_url, message, created_at')
          .eq('tournament_id', tournament_id)
          .order('created_at', { ascending: true })
          .limit(50)

        if (chatHistory?.length) {
          socket.emit('quiz:chat_history', chatHistory.map(m => ({
            user_id: m.user_id,
            username: m.username,
            avatar_url: m.avatar_url,
            message: m.message,
            ts: new Date(m.created_at).getTime(),
          })))
        }

        // If game already active, send current question state
        if (game.status === 'active' && game.currentQuestion) {
          const elapsed = Date.now() - game.currentQuestion.startedAt
          const remaining = Math.max(0, game.currentQuestion.timeLimitMs - elapsed)
          const roundCfg = ROUND_CONFIG[game.currentRound - 1]
          const questions = game.questions[game.currentRound] ?? []
          socket.emit('quiz:question_start', {
            question_id: game.currentQuestion.questionId,
            round: game.currentRound,
            round_name: roundCfg?.name,
            question_index: game.currentQuestionIndex,
            total_questions: questions.length,
            question_text: game.currentQuestion.questionText,
            image_url: game.currentQuestion.imageUrl,
            options: game.currentQuestion.options,
            time_limit_ms: remaining,
            alive_count: game.alivePlayers.size,
          })
        }
      } catch (err) {
        console.error('[QuizGateway] quiz:join error:', err)
        // Even on error, emit lobby_update so client unblocks chat
        socket.emit('quiz:lobby_update', { player_count: 0, status: 'lobby' })
      }
    })

    // ── SUBMIT ANSWER ─────────────────────────────────────────────────────────
    socket.on('quiz:answer', async ({
      tournament_id,
      question_id,
      selected_option,
    }: { tournament_id: string; question_id: string; selected_option: string }) => {
      const game = games.get(tournament_id)
      if (!game || game.status !== 'active') return
      if (!game.alivePlayers.has(userId)) return
      if (!game.currentQuestion || game.currentQuestion.questionId !== question_id) return
      if (game.currentQuestion.answers.has(userId)) return

      const now = Date.now()
      const timeTakenMs = now - game.currentQuestion.startedAt
      const timeRemainingMs = Math.max(0, game.currentQuestion.timeLimitMs - timeTakenMs)
      const timeRemainingSecs = Math.floor(timeRemainingMs / 1000)
      const isCorrect = selected_option === game.currentQuestion.correctOption

      game.currentQuestion.answers.set(userId, { option: selected_option, timeTakenMs })

      // Persist answer with speed data
      try {
        await supabaseAdmin.from('quiz_answers').upsert({
          tournament_id,
          question_id,
          user_id: userId,
          selected_option,
          is_correct: isCorrect,
          time_taken_ms: timeTakenMs,
          time_remaining_secs: timeRemainingSecs,
          time_remaining_ms: timeRemainingMs,
        }, { onConflict: 'question_id,user_id' })
      } catch (_) {}

      // Update leaderboard speed score — only from Q2 (index >= 1) to avoid Q1 nerves penalty
      // Speed score = seconds remaining on the timer when they answered
      if (isCorrect && game.currentQuestionIndex >= 1) {
        try {
          const { data: lb } = await supabaseAdmin
            .from('quiz_leaderboard')
            .select('correct_answers, speed_score, speed_ms')
            .eq('tournament_id', tournament_id)
            .eq('user_id', userId)
            .single()

          if (lb) {
            await supabaseAdmin
              .from('quiz_leaderboard')
              .update({
                correct_answers: (lb.correct_answers ?? 0) + 1,
                speed_score: (lb.speed_score ?? 0) + timeRemainingSecs,
                speed_ms: (lb.speed_ms ?? 0) + timeRemainingMs,
                avg_time_ms: timeTakenMs,
                updated_at: new Date().toISOString(),
              })
              .eq('tournament_id', tournament_id)
              .eq('user_id', userId)
          }
        } catch (_) {}
      } else if (isCorrect) {
        // Q1 — count correct answers but no speed score
        try {
          const { data: lb } = await supabaseAdmin
            .from('quiz_leaderboard')
            .select('correct_answers')
            .eq('tournament_id', tournament_id)
            .eq('user_id', userId)
            .single()

          if (lb) {
            await supabaseAdmin
              .from('quiz_leaderboard')
              .update({
                correct_answers: (lb.correct_answers ?? 0) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq('tournament_id', tournament_id)
              .eq('user_id', userId)
          }
        } catch (_) {}
      }

      socket.emit('quiz:answer_ack', { received: true, question_id, is_correct: isCorrect, time_remaining_secs: timeRemainingSecs })

      // If ALL alive players answered, reveal early
      if (game.currentQuestion.answers.size >= game.alivePlayers.size) {
        revealAndAdvance(tournament_id, quizNs as any, game)
      }
    })

    // ── DISCONNECT ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      games.forEach((game) => {
        if (game.socketToUser.get(socket.id) === userId) {
          game.socketToUser.delete(socket.id)
          game.userToSocket.delete(userId)
        }
      })
    })

    // ── LOBBY CHAT ────────────────────────────────────────────────────────────
    socket.on('quiz:chat', async ({ tournament_id, message, username, avatar_url }: {
      tournament_id: string; message: string; username: string; avatar_url?: string
    }) => {
      if (!message?.trim() || message.length > 200) return

      const trimmed = message.trim()
      const ts = Date.now()

      // Save to DB so messages persist across refreshes
      try {
        await supabaseAdmin.from('quiz_lobby_chat').insert({
          tournament_id,
          user_id: userId,
          username,
          avatar_url: avatar_url ?? null,
          message: trimmed,
        })
      } catch (err) {
        console.error('[QuizGateway] Failed to save chat message:', err)
      }

      // Broadcast to everyone in the room including sender
      quizNs.to(`quiz:${tournament_id}`).emit('quiz:chat_message', {
        user_id: userId,
        username,
        avatar_url: avatar_url ?? null,
        message: trimmed,
        ts,
      })
    })

    // ── LOBBY REACTIONS ───────────────────────────────────────────────────────
    socket.on('quiz:react', ({ tournament_id, emoji, username }: {
      tournament_id: string; emoji: string; username: string
    }) => {
      const ALLOWED = ['🔥', '💪', '👑', '😤', '🎯', '⚡', '🚀', '😂']
      if (!ALLOWED.includes(emoji)) return
      quizNs.to(`quiz:${tournament_id}`).emit('quiz:reaction', {
        user_id: userId,
        username,
        emoji,
        ts: Date.now(),
      })
    })
  })
}

// ─── Admin controls (called from admin routes) ────────────────────────────────

export async function adminStartTournament(tournamentId: string, io: SocketServer) {
  let game = games.get(tournamentId)
  if (!game) {
    const questions = await loadQuestions(tournamentId)
    game = {
      tournamentId,
      status: 'lobby',
      currentRound: 1,
      currentQuestionIndex: 0,
      alivePlayers: new Set(),
      socketToUser: new Map(),
      userToSocket: new Map(),
      questions,
      currentQuestion: null,
      lobbyCountdown: null,
    }
    games.set(tournamentId, game)
  }

  // Load all registered/alive players into memory
  // Players have status='registered' before launch, 'alive' after
  const { data: players } = await supabaseAdmin
    .from('quiz_players')
    .select('user_id')
    .eq('tournament_id', tournamentId)
    .in('status', ['registered', 'alive'])

  for (const p of players ?? []) game.alivePlayers.add(p.user_id)

  game.status = 'active'

  await supabaseAdmin
    .from('quiz_tournaments')
    .update({ status: 'active', started_at: new Date().toISOString(), current_round: 1 })
    .eq('id', tournamentId)

  const ns = io.of('/quiz')
  ns.to(`quiz:${tournamentId}`).emit('quiz:game_start', {
    tournament_id: tournamentId,
    total_rounds: 5,
    alive_count: game.alivePlayers.size,
  })

  setTimeout(() => sendNextQuestion(tournamentId, ns as any, game!), 3000)
}

export function getGameState(tournamentId: string) {
  return games.get(tournamentId)
}
