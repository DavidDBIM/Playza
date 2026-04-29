import { Response, NextFunction } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { AuthRequest } from './auth'

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
    return
  }

  const { data: profile, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', req.user.id)
    .single()

  if (error || !profile) {
    res.status(403).json({ success: false, message: 'Access denied' })
    return
  }

  if (profile.role !== 'admin' && profile.role !== 'superadmin') {
    res.status(403).json({ success: false, message: 'Admin privileges required' })
    return
  }

  next()
}

export async function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
    return
  }

  const { data: profile, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', req.user.id)
    .single()

  if (error || !profile) {
    res.status(403).json({ success: false, message: 'Access denied' })
    return
  }

  if (profile.role !== 'superadmin') {
    res.status(403).json({ success: false, message: 'SuperAdmin privileges required' })
    return
  }

  next()
}
