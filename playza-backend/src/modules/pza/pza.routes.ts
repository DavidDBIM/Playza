import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabase'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { awardPZA, PZAEvent } from '../../lib/pzaEngine'

const router = Router()

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  GET /pza/me
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    const now = new Date().getTime()
    const lastClaimed = streak?.last_claimed_at ? new Date(streak.last_claimed_at).getTime() : 0
    const diffMs = now - lastClaimed

    const canClaimToday = !streak?.streak_reward_claimed_today || diffMs >= 24 * 60 * 60 * 1000

    let activeStreak = streak?.streak_days ?? 0
    if (lastClaimed && diffMs >= 48 * 60 * 60 * 1000) activeStreak = 0

    const { data: claimedTasks } = await supabaseAdmin
      .from('claimed_tasks')
      .select('task_id, claimed_at')
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false })

    // Spin: how many spins used today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: spinsToday } = await supabaseAdmin
      .from('spin_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('spun_at', todayStart.toISOString())

    const DAILY_SPIN_LIMIT = 3
    const spinsLeft = Math.max(0, DAILY_SPIN_LIMIT - (spinsToday ?? 0))

    res.json({
      success: true,
      data: {
        total_points: points?.total_points ?? 0,
        recent_events: events ?? [],
        streak_days: activeStreak,
        last_claimed_at: streak?.last_claimed_at ?? null,
        can_claim_streak_today: canClaimToday,
        claimed_tasks: claimedTasks ?? [],
        spins_left_today: spinsLeft,
      },
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  POST /pza/streak/claim
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/streak/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const { data: streak } = await supabaseAdmin
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (streak) {
      const now = new Date()
      const lastClaimedTime = streak.last_claimed_at ? new Date(streak.last_claimed_at).getTime() : 0
      const diffMs = now.getTime() - lastClaimedTime

      if (streak.streak_reward_claimed_today && diffMs < 24 * 60 * 60 * 1000) {
        res.status(400).json({ success: false, message: 'Please wait 24 hours between claims' })
        return
      }

      const newStreak = (streak.last_claimed_at && diffMs < 48 * 60 * 60 * 1000) ? streak.streak_days + 1 : 1

      await supabaseAdmin
        .from('user_streaks')
        .update({ streak_days: newStreak, last_claimed_at: new Date().toISOString(), streak_reward_claimed_today: true })
        .eq('user_id', userId)

      let eventType: PZAEvent = 'DAILY_STREAK_CLAIM'
      if (newStreak === 30) eventType = 'STREAK_30_GAMES'
      else if (newStreak === 21) eventType = 'STREAK_21_GAMES'
      else if (newStreak === 14) eventType = 'STREAK_14_GAMES'
      else if (newStreak === 7) eventType = 'STREAK_7_GAMES'
      else if (newStreak === 3) eventType = 'STREAK_3_GAMES'

      const pointsAwarded = await awardPZA(userId, eventType)
      res.json({ success: true, data: { streak_days: newStreak, points_awarded: pointsAwarded } })
    } else {
      await supabaseAdmin.from('user_streaks').insert({
        user_id: userId, streak_days: 1, last_claimed_at: new Date().toISOString(), streak_reward_claimed_today: true,
      })
      const pointsAwarded = await awardPZA(userId, 'DAILY_STREAK_CLAIM')
      res.json({ success: true, data: { streak_days: 1, points_awarded: pointsAwarded } })
    }
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  POST /pza/task/claim
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/task/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { task_id } = req.body

    if (!task_id) {
      res.status(400).json({ success: false, message: 'task_id is required' })
      return
    }

    const { data: existing } = await supabaseAdmin
      .from('claimed_tasks').select('id').eq('user_id', userId).eq('task_id', task_id).single()

    if (existing) {
      res.status(400).json({ success: false, message: 'Task already claimed' })
      return
    }

    const points = await awardPZA(userId, task_id as PZAEvent)
    await supabaseAdmin.from('claimed_tasks').insert({ user_id: userId, task_id, points_awarded: points })
    res.json({ success: true, data: { task_id, points_awarded: points } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  POST /pza/spin  â€” costs 30 PZA, max 3/day
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SPIN_COST = 30
const DAILY_SPIN_LIMIT = 3

// Segment indices MUST match frontend SEGMENTS array exactly (index 0 = MISS/0 PZA)
const SPIN_SEGMENTS = [
  { label: '0 PZA',    points: 0,    weight: 9  }, // index 0 â€” MISS
  { label: '10 PZA',   points: 10,   weight: 28 }, // index 1
  { label: '25 PZA',   points: 25,   weight: 25 }, // index 2
  { label: '50 PZA',   points: 50,   weight: 20 }, // index 3
  { label: '75 PZA',   points: 75,   weight: 12 }, // index 4
  { label: '100 PZA',  points: 100,  weight: 8  }, // index 5
  { label: '200 PZA',  points: 200,  weight: 5  }, // index 6
  { label: '500 PZA',  points: 500,  weight: 2  }, // index 7
  { label: '1000 PZA', points: 1000, weight: 1  }, // index 8
]
const TOTAL_WEIGHT = SPIN_SEGMENTS.reduce((s, seg) => s + seg.weight, 0)

function pickReward() {
  let rand = Math.random() * TOTAL_WEIGHT
  for (let i = 0; i < SPIN_SEGMENTS.length; i++) {
    rand -= SPIN_SEGMENTS[i].weight
    if (rand <= 0) return { ...SPIN_SEGMENTS[i], segmentIndex: i }
  }
  return { ...SPIN_SEGMENTS[0], segmentIndex: 0 } // fallback: MISS
}

router.post('/spin', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    // Check daily limit
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: spinsToday } = await supabaseAdmin
      .from('spin_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('spun_at', todayStart.toISOString())

    if ((spinsToday ?? 0) >= DAILY_SPIN_LIMIT) {
      res.status(400).json({ success: false, message: 'Daily spin limit reached. Come back tomorrow!' })
      return
    }

    // Check balance
    const { data: pzaRow } = await supabaseAdmin
      .from('pza_points').select('total_points').eq('user_id', userId).single()

    const currentPoints = pzaRow?.total_points ?? 0
    if (currentPoints < SPIN_COST) {
      res.status(400).json({
        success: false,
        message: `You need at least ${SPIN_COST} PZA to spin. You have ${currentPoints} PZA.`,
      })
      return
    }

    // Deduct cost
    await supabaseAdmin.rpc('increment_pza_points', { p_user_id: userId, p_points: -SPIN_COST })
    await supabaseAdmin.from('pza_events').insert({
      user_id: userId, event_type: 'SPIN_COST', points_awarded: -SPIN_COST, meta: { action: 'spin_wheel_cost' },
    })

    // Pick and award reward
    const reward = pickReward()
    await supabaseAdmin.rpc('increment_pza_points', { p_user_id: userId, p_points: reward.points })
    await supabaseAdmin.from('pza_events').insert({
      user_id: userId, event_type: 'SPIN_REWARD', points_awarded: reward.points,
      meta: { label: reward.label, segment_index: reward.segmentIndex },
    })

    // Log spin
    await supabaseAdmin.from('spin_history').insert({
      user_id: userId, points_won: reward.points, points_spent: SPIN_COST, segment_label: reward.label,
    })

    const { data: updated } = await supabaseAdmin
      .from('pza_points').select('total_points').eq('user_id', userId).single()

    const spinsLeft = Math.max(0, DAILY_SPIN_LIMIT - ((spinsToday ?? 0) + 1))

    res.json({
      success: true,
      data: {
        points_won: reward.points,
        points_spent: SPIN_COST,
        segment_index: reward.segmentIndex,
        label: reward.label,
        new_balance: updated?.total_points ?? 0,
        spins_left_today: spinsLeft,
      },
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  POST /pza/ambassador/apply
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/ambassador/apply', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { full_name, email, phone, qualification_type, platforms, follower_count, social_handles, content_niche, motivation } = req.body

    if (!full_name || !email || !qualification_type || !motivation) {
      res.status(400).json({ success: false, message: 'Missing required fields' })
      return
    }

    const { data: existing } = await supabaseAdmin
      .from('ambassador_applications').select('id, status').eq('user_id', userId).single()

    if (existing) {
      res.status(400).json({ success: false, message: `You already have an application (${existing.status}).` })
      return
    }

    // Validate based on qualification type
    if (qualification_type === 'gold_badge') {
      const { data: pzaRow } = await supabaseAdmin
        .from('pza_points').select('total_points').eq('user_id', userId).single()
      if ((pzaRow?.total_points ?? 0) < 25000) {
        res.status(400).json({ success: false, message: 'Gold badge requires 25,000+ PZA points.' })
        return
      }
    }

    if (qualification_type === 'referral_100') {
      const { count } = await supabaseAdmin
        .from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_id', userId)
      if ((count ?? 0) < 100) {
        res.status(400).json({ success: false, message: `This route requires 100+ referrals. You have ${count ?? 0}.` })
        return
      }
    }

    const { data: app, error } = await supabaseAdmin
      .from('ambassador_applications')
      .insert({ user_id: userId, full_name, email, phone: phone ?? null, qualification_type, platforms: platforms ?? null, follower_count: follower_count ?? null, social_handles: social_handles ?? null, content_niche: content_niche ?? null, motivation, status: 'pending' })
      .select().single()

    if (error) throw error

    res.json({
      success: true,
      data: { application_id: app.id, status: 'pending', message: 'Application submitted! We will review within 3-5 business days.' },
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  GET /pza/ambassador/status
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/ambassador/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { data } = await supabaseAdmin
      .from('ambassador_applications')
      .select('id, status, created_at, reviewed_at, admin_note')
      .eq('user_id', userId)
      .single()
    res.json({ success: true, data: data ?? null })
  } catch {
    res.json({ success: true, data: null })
  }
})

export default router
