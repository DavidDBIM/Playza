import { Router } from 'express'
import { requireAdmin, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'
import { ROUND_CONFIG } from './quiz.types'
import { adminStartTournament } from './quiz.gateway'
import type { Server as SocketServer } from 'socket.io'

let _io: SocketServer | null = null
export function setQuizAdminIo(io: SocketServer) { _io = io }

const router = Router()

// ── GET /admin/quiz/tournaments
router.get('/tournaments', requireAdmin, async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error

    const tournaments = data ?? []
    const ids = tournaments.map(t => t.id)

    if (ids.length === 0) return res.json({ success: true, data: [] })

    // Two queries instead of 2N queries
    const [{ data: players }, { data: questions }] = await Promise.all([
      supabaseAdmin.from('quiz_players').select('tournament_id').in('tournament_id', ids),
      supabaseAdmin.from('quiz_questions').select('tournament_id').in('tournament_id', ids),
    ])

    const playerCountMap: Record<string, number> = {}
    for (const row of (players ?? [])) {
      playerCountMap[row.tournament_id] = (playerCountMap[row.tournament_id] ?? 0) + 1
    }

    const questionCountMap: Record<string, number> = {}
    for (const row of (questions ?? [])) {
      questionCountMap[row.tournament_id] = (questionCountMap[row.tournament_id] ?? 0) + 1
    }

    const enriched = tournaments.map(t => ({
      ...t,
      player_count: playerCountMap[t.id] ?? 0,
      question_count: questionCountMap[t.id] ?? 0,
      max_players: t.max_players ?? null,
      prize_distribution: t.prize_distribution ?? null,
    }))

    res.json({ success: true, data: enriched })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── POST /admin/quiz/tournaments  — create
router.post('/tournaments', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, description, entry_fee, scheduled_at, max_players, prize_distribution, platform_fee_percentage, registration_end } = req.body
    if (!title) { res.status(400).json({ success: false, message: 'title is required' }); return }

    const { data, error } = await supabaseAdmin
      .from('quiz_tournaments')
      .insert({
        title,
        description: description ?? '',
        entry_fee: entry_fee ?? 0,
        prize_pool: 0,
        status: 'draft',
        scheduled_at: scheduled_at ?? null,
        registration_end: registration_end ?? null,
        created_by: req.user!.id,
        current_round: 0,
        current_question: 0,
        max_players: max_players ?? null,
        prize_distribution: prize_distribution ?? null,
        platform_fee_percentage: platform_fee_percentage ?? 10,
      })
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── PATCH /admin/quiz/tournaments/:id  — update status / settings
router.patch('/tournaments/:id', requireAdmin, async (req, res) => {
  try {
    const allowed = ['title', 'description', 'entry_fee', 'scheduled_at', 'registration_end', 'status', 'max_players', 'prize_distribution', 'platform_fee_percentage', 'cancelled_reason']
    const updates: Record<string, any> = {}
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k]
    }

    const { data, error } = await supabaseAdmin
      .from('quiz_tournaments')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── POST /admin/quiz/tournaments/:id/start  — open registration
router.post('/tournaments/:id/start', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const { data: tournament } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('*')
      .eq('id', id)
      .single()

    if (!tournament) { res.status(404).json({ success: false, message: 'Not found' }); return }
    if (!['draft'].includes(tournament.status)) {
      res.status(400).json({ success: false, message: `Cannot open registration for a tournament with status: ${tournament.status}` })
      return
    }

    const { count: qCount } = await supabaseAdmin
      .from('quiz_questions')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', id)

    if (!qCount || qCount < 5) {
      res.status(400).json({ success: false, message: 'Not enough questions. Add at least 5 questions before starting.' })
      return
    }

    const { error: updateErr } = await supabaseAdmin
      .from('quiz_tournaments')
      .update({ status: 'registration' })
      .eq('id', id)

    if (updateErr) {
      res.status(500).json({ success: false, message: `Database update failed: ${updateErr.message}` })
      return
    }

    res.json({ success: true, message: 'Registration opened! Players can now register.' })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── POST /admin/quiz/tournaments/:id/launch  — actually start game via socket
router.post('/tournaments/:id/launch', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!_io) {
      res.status(500).json({ success: false, message: 'Socket server not ready' })
      return
    }

    const { data: tournament } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('status')
      .eq('id', id)
      .single()

    if (!tournament) {
      res.status(404).json({ success: false, message: 'Tournament not found' })
      return
    }

    if (!['registration', 'lobby'].includes(tournament.status)) {
      res.status(400).json({ success: false, message: `Tournament must be in registration or lobby status to launch. Current: ${tournament.status}` })
      return
    }

    await supabaseAdmin
      .from('quiz_players')
      .update({ status: 'alive' })
      .eq('tournament_id', id)
      .eq('status', 'registered')

    await supabaseAdmin
      .from('quiz_tournaments')
      .update({ status: 'lobby' })
      .eq('id', id)

    await adminStartTournament(id, _io)

    res.json({ success: true, message: 'Game launched! First question broadcasting to all players now.' })
  } catch (err: any) {
    console.error('[Admin Quiz] Launch error:', err)
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── GET /admin/quiz/tournaments/:id/questions
router.get('/tournaments/:id/questions', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .eq('tournament_id', req.params.id)
      .order('round_number')
      .order('order_index')
    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── POST /admin/quiz/tournaments/:id/questions  — add single question
router.post('/tournaments/:id/questions', requireAdmin, async (req, res) => {
  try {
    const { round_number, question_text, option_a, option_b, option_c, option_d, correct_option, image_url } = req.body

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      res.status(400).json({ success: false, message: 'All fields are required' })
      return
    }

    const roundCfg = ROUND_CONFIG[round_number - 1]
    const { count } = await supabaseAdmin
      .from('quiz_questions')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', req.params.id)
      .eq('round_number', round_number)

    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .insert({
        tournament_id: req.params.id,
        round_number,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option: correct_option.toUpperCase(),
        difficulty: roundCfg?.difficulty ?? 'easy',
        time_limit_secs: roundCfg?.time_secs ?? 45,
        order_index: count ?? 0,
        image_url: image_url ?? null,
      })
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── POST /admin/quiz/tournaments/:id/questions/bulk
router.post('/tournaments/:id/questions/bulk', requireAdmin, async (req, res) => {
  try {
    const { questions } = req.body as {
      questions: Array<{
        round_number: number
        question_text: string
        option_a: string
        option_b: string
        option_c: string
        option_d: string
        correct_option: string
        image_url?: string | null
      }>
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ success: false, message: 'questions array is required' })
      return
    }

    await supabaseAdmin
      .from('quiz_questions')
      .delete()
      .eq('tournament_id', req.params.id)

    const roundCounts: Record<number, number> = {}

    const rows = questions.map((q) => {
      const r = q.round_number
      if (!roundCounts[r]) roundCounts[r] = 0
      const idx = roundCounts[r]++
      const roundCfg = ROUND_CONFIG[r - 1]

      return {
        tournament_id: req.params.id,
        round_number: r,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option.toUpperCase(),
        difficulty: roundCfg?.difficulty ?? 'easy',
        time_limit_secs: roundCfg?.time_secs ?? 45,
        order_index: idx,
        image_url: q.image_url ?? null,
      }
    })

    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .insert(rows)
      .select()

    if (error) throw error
    res.json({ success: true, data, message: `Imported ${data?.length ?? 0} questions` })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── DELETE /admin/quiz/tournaments/:id
router.delete('/tournaments/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const { data: tournament } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('status')
      .eq('id', id)
      .single()

    if (!tournament) {
      res.status(404).json({ success: false, message: 'Tournament not found' })
      return
    }

    if (!['cancelled', 'completed'].includes(tournament.status)) {
      res.status(400).json({ success: false, message: 'Only cancelled or completed tournaments can be deleted.' })
      return
    }

    await supabaseAdmin.from('quiz_leaderboard').delete().eq('tournament_id', id)
    await supabaseAdmin.from('quiz_players').delete().eq('tournament_id', id)
    await supabaseAdmin.from('quiz_questions').delete().eq('tournament_id', id)
    await supabaseAdmin.from('quiz_tournaments').delete().eq('id', id)

    res.json({ success: true, message: 'Tournament deleted successfully.' })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── DELETE /admin/quiz/questions/:id
router.delete('/questions/:id', requireAdmin, async (req, res) => {
  try {
    await supabaseAdmin.from('quiz_questions').delete().eq('id', req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── GET /admin/quiz/tournaments/:id/live
router.get('/tournaments/:id/live', requireAdmin, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('*')
      .eq('id', req.params.id)
      .single()

    const { data: leaderboard } = await supabaseAdmin
      .from('quiz_leaderboard')
      .select('*')
      .eq('tournament_id', req.params.id)
      .order('rank', { ascending: true })
      .limit(100)

    const { count: alive } = await supabaseAdmin
      .from('quiz_players')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', req.params.id)
      .eq('status', 'alive')

    const { count: eliminated } = await supabaseAdmin
      .from('quiz_players')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', req.params.id)
      .eq('status', 'eliminated')

    res.json({
      success: true,
      data: {
        tournament,
        leaderboard: leaderboard ?? [],
        stats: { alive: alive ?? 0, eliminated: eliminated ?? 0 },
      },
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── GET /admin/quiz/leaderboard/global  — all-time top players
router.get('/leaderboard/global', requireAdmin, async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_leaderboard')
      .select('username, avatar_url, correct_answers, avg_time_ms, status, tournament_id')
      .order('correct_answers', { ascending: false })
      .limit(100)

    if (error) throw error

    // Aggregate by username — sum correct answers, count wins
    const playerMap: Record<string, { username: string; avatar_url: string | null; correct_answers: number; total_wins: number; tournaments_played: number; status: string }> = {}

    for (const row of (data ?? [])) {
      const key = row.username ?? "Unknown"
      if (!playerMap[key]) {
        playerMap[key] = { username: key, avatar_url: row.avatar_url, correct_answers: 0, total_wins: 0, tournaments_played: 0, status: row.status ?? "—" }
      }
      playerMap[key].correct_answers += row.correct_answers ?? 0
      playerMap[key].tournaments_played += 1
      if (row.status === "winner") playerMap[key].total_wins += 1
    }

    const sorted = Object.values(playerMap).sort((a, b) => b.correct_answers - a.correct_answers)
    res.json({ success: true, data: sorted })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── GET /admin/quiz/tournaments/:id/leaderboard
router.get('/tournaments/:id/leaderboard', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_leaderboard')
      .select('*')
      .eq('tournament_id', req.params.id)
      .order('correct_answers', { ascending: false })
      .limit(100)

    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
