import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import * as PoolService from './pool.service'

const router = Router()

router.get('/rooms', async (req, res) => {
  try {
    const rooms = await PoolService.listWaitingRooms()
    res.json({ success: true, data: rooms })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/create', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id
    const { stake = 0 } = req.body
    const result = await PoolService.createPoolRoom(userId, Number(stake))
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/join', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id
    const { code } = req.body
    if (!code) throw new Error('Room code is required')
    const result = await PoolService.joinPoolRoom(userId, code)
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.get('/room/:roomId', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id
    const room = await PoolService.getRoom(req.params.roomId, userId)
    res.json({ success: true, data: room })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/shot', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id
    const { roomId, shot } = req.body
    if (!roomId || !shot) throw new Error('Room ID and shot data are required')
    
    const result = await PoolService.executeShot(roomId, userId, shot)
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/quickmatch', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id
    const { stake = 0 } = req.body
    const result = await PoolService.findQuickMatch(userId, Number(stake))
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/resign', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id
    const { roomId } = req.body
    if (!roomId) throw new Error('Room ID is required')
    
    const result = await PoolService.resignGame(roomId, userId)
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
})

export default router