import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../config/supabase'

export interface AuthRequest extends Request {
  user?: { id: string; email: string }
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Regular users use playza_token; admin sessions use admin_token.
  // Check both so admin accounts (which are also regular users) work on user-facing routes too.
  let token: string | undefined = req.cookies?.playza_token || req.cookies?.admin_token;
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
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth] requireAuth failed:', debugInfo)
    }
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  req.user = { id: user.id, email: user.email! };
  next();
}

// Identifies the user if a valid token is present, but — unlike requireAuth —
// never rejects the request when one isn't. Used for routes that should work
// for anonymous visitors too (e.g. spectating a live tournament match)
// while still personalizing the response (board orientation, "YOU" labels,
// move permissions) for whoever's actually signed in.
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined = req.cookies?.playza_token || req.cookies?.admin_token;
  let user: any = null;

  if (token) {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data.user) user = data.user;
  }

  if (!user) {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const { data, error } = await supabaseAdmin.auth.getUser(header.split(" ")[1]);
      if (!error && data.user) user = data.user;
    }
  }

  if (user) req.user = { id: user.id, email: user.email! };
  next();
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined = req.cookies?.admin_token || req.cookies?.playza_token;
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
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth] requireAdmin failed:', debugInfo)
    }
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
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