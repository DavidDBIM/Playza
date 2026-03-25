import { Router } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { getAllUsers, getSingleUser, updateUser, deactivateUser } from './users.service'

const router = Router()

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const data = await getAllUsers(page, limit)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await getSingleUser(req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await getSingleUser(req.params.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.patch('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { first_name, last_name, phone, avatar_url } = req.body
    const data = await updateUser(req.user!.id, { first_name, last_name, phone, avatar_url })
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.patch('/:id/deactivate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await deactivateUser(req.params.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
