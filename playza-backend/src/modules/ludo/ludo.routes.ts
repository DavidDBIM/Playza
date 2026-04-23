import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import * as ludoService from './ludo.service'

const router = Router()

router.post('/bot', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0 } = req.body
    const data = await ludoService.createBotRoom(req.user!.id, Number(stake))
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0 } = req.body
    const data = await ludoService.createLudoRoom(req.user!.id, Number(stake))
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/quick', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0 } = req.body
    const data = await ludoService.findQuickMatch(req.user!.id, Number(stake))
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/waiting', async (req: AuthRequest, res: Response) => {
  try {
    const data = await ludoService.listWaitingRooms()
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body
    if (!code) { res.status(400).json({ success: false, message: 'Room code required' }); return }
    const data = await ludoService.joinLudoRoom(req.user!.id, code)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/room/:roomId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await ludoService.getRoom(req.params.roomId, req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/room/:roomId/roll', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await ludoService.rollDice(req.params.roomId, req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/room/:roomId/move', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { pieceId } = req.body
    const data = await ludoService.makeMove(req.params.roomId, req.user!.id, pieceId)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/room/:roomId/resign', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await ludoService.resignGame(req.params.roomId, req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/room/:roomId/cancel', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ludoService.cancelLudoRoom(req.params.roomId, req.user!.id)
    res.json({ success: true, message: 'Room cancelled' })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
