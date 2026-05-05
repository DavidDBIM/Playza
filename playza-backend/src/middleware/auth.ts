import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../config/supabase'

export interface AuthRequest extends Request {
  user?: { id: string; email: string }
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined = req.cookies?.admin_token;
  let user: any = null;
  let debugInfo = "None";

  // 1. Try Cookie
  if (token) {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data.user) {
      user = data.user;
    } else {
      debugInfo = `Cookie found but invalid: ${error?.message || "Unknown error"}`;
    }
  }

  // 2. Try Header Fallback
  if (!user) {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data.user) {
        user = data.user;
      } else {
        debugInfo = `Header found but invalid: ${error?.message || "Unknown error"}`;
      }
    } else if (!token) {
      debugInfo = "No cookie or authorization header provided";
    }
  }

  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token",
      debug: debugInfo 
    });
  }

  req.user = { id: user.id, email: user.email! };
  next();
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined = req.cookies?.admin_token;
  let user: any = null;
  let debugInfo = "None";

  // 1. Try Cookie
  if (token) {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data.user) {
      user = data.user;
    } else {
      debugInfo = `Cookie found but invalid: ${error?.message || "Unknown error"}`;
    }
  }

  // 2. Try Header Fallback
  if (!user) {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data.user) {
        user = data.user;
      } else {
        debugInfo = `Header found but invalid: ${error?.message || "Unknown error"}`;
      }
    } else if (!token) {
      debugInfo = "No cookie or authorization header provided";
    }
  }

  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token",
      debug: debugInfo
    });
  }

  // 3. Admin Role Check
  const { data: userProfile } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "superadmin")) {
    return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
  }

  req.user = { id: user.id, email: user.email! };
  next();
}

