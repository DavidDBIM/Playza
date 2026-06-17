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

async function updateLeaderboard(tournamentId: string, io: SocketServer) {
  // Recompute rankings from quiz_answers and quiz_players
  const { data: aliveRows } = await supabaseAdmin
    .from('quiz_leaderboard')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('correct_answers', { ascending: false })
    .order('avg_time_ms', { ascending: true })

  const ranked = (aliveRows ?? []).map((row, i) => ({ ...row, rank: i + 1 }))

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

  await supabaseAdmin
    .from('quiz_players')
    .update({ status: 'eliminated', eliminated_at_round: round, eliminated_at_question: questionIndex })
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)

  await supabaseAdmin
    .from('quiz_leaderboard')
    .update({ status: 'eliminated', updated_at: new Date().toISOString() })
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

  // Get final leaderboard
  const { data: leaderboard } = await supabaseAdmin
    .from('quiz_leaderboard')
    .select('*, users!inner(username)')
    .eq('tournament_id', tournamentId)
    .order('rank', { ascending: true })
    .limit(10)

  const { data: tournament } = await supabaseAdmin
    .from('quiz_tournaments')
    .select('prize_pool')
    .eq('id', tournamentId)
    .single()

  const prizePool = tournament?.prize_pool ?? 0
  const winners = (leaderboard ?? []).filter(p => p.status !== 'eliminated').slice(0, 5)

  // Distribute prizes
  for (let i = 0; i < winners.length; i++) {
    const prize = Math.floor(prizePool * (PRIZE_SPLIT[i] ?? 0))
    if (prize <= 0) continue

    await supabaseAdmin.rpc('increment_wallet_balance', {
      p_user_id: winners[i].user_id,
      p_amount: prize,
    })

    await supabaseAdmin
      .from('quiz_players')
      .update({ status: 'winner', final_rank: i + 1, prize_won: prize })
      .eq('tournament_id', tournamentId)
      .eq('user_id', winners[i].user_id)

    await supabaseAdmin
      .from('quiz_leaderboard')
      .update({ status: 'winner', rank: i + 1 })
      .eq('tournament_id', tournamentId)
      .eq('user_id', winners[i].user_id)
  }

  await supabaseAdmin
    .from('quiz_tournaments')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', tournamentId)

  io.to(`quiz:${tournamentId}`).emit('quiz:game_over', {
    leaderboard: leaderboard?.slice(0, 10) ?? [],
    winners: winners.map((w, i) => ({
      rank: i + 1,
      username: w.username,
      prize: Math.floor(prizePool * (PRIZE_SPLIT[i] ?? 0)),
    })),
    prize_pool: prizePool,
  })

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
        socket.join(`quiz:${tournament_id}`)

        let game = games.get(tournament_id)
        let isNewGame = false
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
          isNewGame = true
        }

        game.socketToUser.set(socket.id, userId)
        game.userToSocket.set(userId, socket.id)

        // ── Recovery: if this socket created a brand-new in-memory game state
        // but the tournament is already 'active' in the DB (backend restarted
        // mid-game, e.g. Render free-tier sleep/wake), rebuild alive players
        // and round position from DB and resume sending questions — instead
        // of silently stalling at an empty lobby state forever.
        if (isNewGame) {
          const { data: tRow } = await supabaseAdmin
            .from('quiz_tournaments')
            .select('status, current_round, current_question')
            .eq('id', tournament_id)
            .single()

          if (tRow?.status === 'active') {
            const { data: aliveRows } = await supabaseAdmin
              .from('quiz_players')
              .select('user_id')
              .eq('tournament_id', tournament_id)
              .eq('status', 'alive')

            for (const p of (aliveRows ?? [])) game.alivePlayers.add(p.user_id)
            game.status = 'active'
            game.currentRound = tRow.current_round || 1
            game.currentQuestionIndex = tRow.current_question || 0

            console.log(`[QuizGateway] Recovered state for "${tournament_id}" — round ${game.currentRound}, q${game.currentQuestionIndex}, ${game.alivePlayers.size} alive`)

            // Re-send the current question fresh (full timer) since the
            // original timer was lost when memory was wiped.
            setTimeout(() => sendNextQuestion(tournament_id, quizNs as any, game!), 1000)
          }
        }

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

        // If game already active AND we have a live question in memory
        // (i.e. this wasn't a fresh recovery — recovery resends on its own
        // timer above), send current question state immediately.
        if (!isNewGame && game.status === 'active' && game.currentQuestion) {
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
      if (game.currentQuestion.answers.has(userId)) return // already answered

      const timeTakenMs = Date.now() - game.currentQuestion.startedAt
      const isCorrect = selected_option === game.currentQuestion.correctOption

      game.currentQuestion.answers.set(userId, { option: selected_option, timeTakenMs })

      // Persist to DB
      try {
        await supabaseAdmin.from('quiz_answers').upsert({
          tournament_id,
          question_id,
          user_id: userId,
          selected_option,
          is_correct: isCorrect,
          time_taken_ms: timeTakenMs,
        }, { onConflict: 'question_id,user_id' })
      } catch (_) {}

      socket.emit('quiz:answer_ack', { received: true, question_id })

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
          // Don't remove from alivePlayers — they're still in the game
          // They'll be auto-eliminated if they miss an answer
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
