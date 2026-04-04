import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabase'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { awardPZA, PZAEvent } from '../../lib/pzaEngine'

const router = Router()

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const { data: points } = await supabaseAdmin
      .from('pza_points')
      .select('total_points')
      .eq('user_id', userId)
      .single()

    const { data: events } = await supabaseAdmin
      .from('pza_events')
      .select('event_type, points_awarded, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: streak } = await supabaseAdmin
      .from('user_streaks')
      .select('streak_days, last_claimed_at, streak_reward_claimed_today')
      .eq('user_id', userId)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const lastClaimed = streak?.last_claimed_at?.split('T')[0]
    const canClaimToday = !streak?.streak_reward_claimed_today || lastClaimed !== today

    const { data: claimedTasks } = await supabaseAdmin
      .from('claimed_tasks')
      .select('task_id, claimed_at')
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false })

    res.json({
      success: true,
      data: {
        total_points: points?.total_points ?? 0,
        recent_events: events ?? [],
        streak_days: streak?.streak_days ?? 0,
        can_claim_streak_today: canClaimToday,
        claimed_tasks: claimedTasks ?? [],
      },
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/streak/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const today = new Date().toISOString().split('T')[0]

    const { data: streak } = await supabaseAdmin
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (streak) {
      const lastClaimed = streak.last_claimed_at?.split('T')[0]
      if (lastClaimed === today) {
        res.status(400).json({ success: false, message: 'Already claimed today' })
        return
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const newStreak = lastClaimed === yesterdayStr ? streak.streak_days + 1 : 1

      await supabaseAdmin
        .from('user_streaks')
        .update({
          streak_days: newStreak,
          last_claimed_at: new Date().toISOString(),
          streak_reward_claimed_today: true,
        })
        .eq('user_id', userId)

      const bonusPoints = newStreak >= 30 ? 500 : newStreak >= 21 ? 250 : newStreak >= 14 ? 150 : newStreak >= 7 ? 80 : newStreak >= 3 ? 30 : 10
      await awardPZA(userId, 'STREAK_3_GAMES')

      res.json({ success: true, data: { streak_days: newStreak, points_awarded: bonusPoints } })
    } else {
      await supabaseAdmin.from('user_streaks').insert({
        user_id: userId,
        streak_days: 1,
        last_claimed_at: new Date().toISOString(),
        streak_reward_claimed_today: true,
      })

      await awardPZA(userId, 'STREAK_3_GAMES')
      res.json({ success: true, data: { streak_days: 1, points_awarded: 10 } })
    }
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/task/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { task_id, points } = req.body

    if (!task_id || !points) {
      res.status(400).json({ success: false, message: 'task_id and points required' })
      return
    }

    const { data: existing } = await supabaseAdmin
      .from('claimed_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('task_id', task_id)
      .single()

    if (existing) {
      res.status(400).json({ success: false, message: 'Task already claimed' })
      return
    }

    await supabaseAdmin.from('claimed_tasks').insert({
      user_id: userId,
      task_id,
      points_awarded: points,
    })

    await supabaseAdmin.rpc('increment_pza_points', {
      p_user_id: userId,
      p_points: points,
    })

    await supabaseAdmin.from('pza_events').insert({
      user_id: userId,
      event_type: task_id,
      points_awarded: points,
    })

    res.json({ success: true, data: { task_id, points_awarded: points } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
