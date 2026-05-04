import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../config/supabase'

export interface AuthRequest extends Request {
  user?: { id: string; email: string }
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined = req.cookies?.admin_token;
  
  if (!token) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
    return
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
    return
  }

  req.user = { id: data.user.id, email: data.user.email! }
  next()
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined = req.cookies?.admin_token;
  
  if (!token) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
    return
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
    return
  }

  // Check role - assuming it's in user_metadata or we fetch from users table
  const { data: userProfile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'superadmin')) {
    res.status(403).json({ success: false, message: 'Forbidden: Admin access required' })
    return
  }

  req.user = { id: data.user.id, email: data.user.email! }
  next()
}

