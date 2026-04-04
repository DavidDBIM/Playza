import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import * as PoolService from './pool.service'

const router = Router()

router.get('/rooms', async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await PoolService.listWaitingRooms()
    res.json({ success: true, data: rooms })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0 } = req.body
    const data = await PoolService.createPoolRoom(req.user!.id, Number(stake))
    res.status(201).json({ success: true, data })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body
    if (!code) throw new Error('Room code is required')
    const data = await PoolService.joinPoolRoom(req.user!.id, code)
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.get('/room/:roomId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await PoolService.getRoom(req.params.roomId, req.user!.id)
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/shot', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, shot } = req.body
    if (!roomId || !shot) throw new Error('Room ID and shot data are required')
    const data = await PoolService.executeShot(roomId, req.user!.id, shot)
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/quickmatch', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0 } = req.body
    const data = await PoolService.findQuickMatch(req.user!.id, Number(stake))
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/resign', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.body
    if (!roomId) throw new Error('Room ID is required')
    const data = await PoolService.resignGame(roomId, req.user!.id)
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

export default router