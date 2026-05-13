import { supabaseAdmin } from '../../config/supabase'
import webpush from 'web-push'

// Configure Web Push
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:playzadevteam@gmail.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export async function logAdminAction(
  adminId: string,
  action: string,
  targetId: string | null = null,
  details: any = {},
  req?: any // Optional request object to extract IP/UA
) {
  const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || null;
  const userAgent = req?.headers?.['user-agent'] || null;

  const { error } = await supabaseAdmin.from('admin_logs').insert({
    admin_id: adminId,
    action,
    target_id: targetId,
    details: {
      ...details,
      userAgent
    },
    ip_address: ipAddress,
  });

  if (error) {
    console.error('Failed to log admin action:', error);
  }
}

export async function getDashboardMetrics() {
  const [
    { count: totalUsers },
    { count: activeUsers },
    { data: walletTotals },
    { count: pendingWithdrawals },
    { count: totalReferrals },
    { count: verifiedReferrals },
    { count: newUsersWeek },
    { count: verifiedUsers },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('is_email_verified', true),
    supabaseAdmin.from('wallets').select('balance, total_deposited, total_withdrawn'),
    supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'withdrawal').eq('status', 'pending'),
    supabaseAdmin.from('referrals').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('referrals').select('*', { count: 'exact', head: true }).neq('status', 'pending'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_email_verified', true),
  ])

  const totalDeposited = walletTotals?.reduce((sum, w) => sum + Number(w.total_deposited), 0) ?? 0
  const totalWithdrawn = walletTotals?.reduce((sum, w) => sum + Number(w.total_withdrawn), 0) ?? 0
  const platformReserve = walletTotals?.reduce((sum, w) => sum + Number(w.balance), 0) ?? 0

  return {
    total_users: totalUsers ?? 0,
    active_users: activeUsers ?? 0,
    total_deposited: totalDeposited,
    total_withdrawn: totalWithdrawn,
    platform_profit: totalDeposited - totalWithdrawn,
    platform_reserve: platformReserve,
    pending_withdrawals_count: pendingWithdrawals ?? 0,
    total_referrals: totalReferrals ?? 0,
    verified_referrals: verifiedReferrals ?? 0,
    referral_conversion_rate: totalReferrals
      ? ((verifiedReferrals ?? 0) / totalReferrals * 100).toFixed(1) + '%'
      : '0%',
    new_users_week: newUsersWeek ?? 0,
    verified_users: verifiedUsers ?? 0,
  }
}

export async function getAllUsersAdmin(page = 1, limit = 20, search = '', status = '', period = '') {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('users')
    .select(`
      id, username, email, phone, avatar_url,
      first_name, last_name, referral_code,
      is_email_verified, is_active, created_at,
      wallets(balance, total_deposited, total_withdrawn),
      pza_points(total_points)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  if (status === 'active') query = query.eq('is_active', true).eq('is_email_verified', true)
  if (status === 'inactive') query = query.eq('is_active', false)
  if (status === 'unverified') query = query.eq('is_email_verified', false)

  if (period && period !== 'all') {
    const now = new Date()
    // Reset to start of day for accurate filtering
    now.setHours(0, 0, 0, 0)
    
    if (period === 'today') {
      // already set to 00:00:00
    } else if (period === '7d') {
      now.setDate(now.getDate() - 7)
    } else if (period === '30d') {
      now.setDate(now.getDate() - 30)
    }
    
    const filterDate = now.toISOString()
    console.log(`[AdminService] Filtering users created >= ${filterDate} (Period: ${period})`)
    query = query.gte('created_at', filterDate)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    users: data,
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getAdminSingleUser(userId: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select(`
      id, username, email, phone, avatar_url,
      first_name, last_name, referral_code,
      is_email_verified, is_active, created_at,
      wallets(balance, total_deposited, total_withdrawn),
      pza_points(total_points)
    `)
    .eq('id', userId)
    .single()

  if (error) throw error
  if (!user) throw new Error('User not found')

  const { data: referrals, count: referralCount } = await supabaseAdmin
    .from('referrals')
    .select('id, status, created_at, users!referred_id(username)', { count: 'exact' })
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: pzaEvents } = await supabaseAdmin
    .from('pza_events')
    .select('id, event_type, points_awarded, created_at, details')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: gameHistory } = await supabaseAdmin
    .from('game_history')
    .select('id, game_name, status, winnings, played_at')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(20)

  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('id, type, amount, status, created_at, reference')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return {
    ...user,
    referrals: referrals ?? [],
    total_referrals: referralCount ?? 0,
    pza_history: pzaEvents ?? [],
    game_history: gameHistory ?? [],
    transactions: transactions ?? [],
  }
}

export async function updateUserStatus(userId: string, action: 'activate' | 'deactivate' | 'ban') {
  const updates: Record<string, boolean> = {
    activate: { is_active: true } as any,
    deactivate: { is_active: false } as any,
    ban: { is_active: false } as any,
  }[action] ?? {}

  const { error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)

  if (error) throw error
  return { message: `User ${action}d successfully` }
}

export async function getAllTransactionsAdmin(page = 1, limit = 20, type = '', status = '') {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('transactions')
    .select(`
      id, user_id, type, amount, status, reference, created_at,
      users(username, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (type) query = query.eq('type', type)
  if (status) query = query.eq('status', status)

  const { data, error, count } = await query

  if (error) throw error

  return {
    transactions: data,
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getTransactionByIdAdmin(id: string) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select(`
      id, user_id, type, amount, status, reference, created_at,
      users(username, email)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ────────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ────────────────────────────────────────────────────────────

async function ensureNotificationBucket() {
  const bucketId = 'notifications';
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = buckets?.some((b: any) => b.name === bucketId);
  
  if (!exists) {
    await supabaseAdmin.storage.createBucket(bucketId, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    });
  }
  return bucketId;
}

export async function uploadNotificationImage(base64Data: string): Promise<string> {
  const match = base64Data.match(/^data:(.+?);base64,(.+)$/);
  if (!match) return base64Data; // If not base64, assume it's already a URL

  const mimeType = match[1];
  const raw = match[2];
  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const filename = `${Date.now()}.${ext}`;
  const bucketId = await ensureNotificationBucket();

  const { error } = await supabaseAdmin.storage
    .from(bucketId)
    .upload(filename, Buffer.from(raw, 'base64'), {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabaseAdmin.storage.from(bucketId).getPublicUrl(filename);
  return data.publicUrl;
}

export async function sendNotification(payload: {
  title?: string;
  content?: string;
  image_url?: string;
  type: string;
  priority: string;
  audience: string;
  link_url?: string;
}) {
  let finalImageUrl = payload.image_url;

  // If the image is a base64 string from the upload button, upload it to Supabase
  if (payload.image_url?.startsWith('data:')) {
    finalImageUrl = await uploadNotificationImage(payload.image_url);
  }

  // 1. Save to database (only include columns that exist in the DB)
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert([
      {
        title: payload.title,
        content: payload.link_url ? `${payload.content || ''} [PLAYZA_LINK]${payload.link_url}` : payload.content,
        image_url: finalImageUrl,
        type: payload.type,
        priority: payload.priority,
        audience: payload.audience,
        status: 'sent',
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) throw error

  // 2. Trigger Push Delivery in background (if text is provided)
  if (payload.title || payload.content) {
    (async () => {
      try {
        const { data: subs } = await supabaseAdmin.from('push_tokens').select('token, id');
        if (!subs || subs.length === 0) return;

        const pushPayload = JSON.stringify({
          title: payload.title,
          body: payload.content,
          image: finalImageUrl,
          data: {
            url: payload.link_url || '/',
            type: payload.type
          }
        });

        const promises = subs.map(async (sub) => {
          try {
            // Some tokens might be old style strings, some new style JSON
            const subscription = sub.token.startsWith('{') ? JSON.parse(sub.token) : null;
            if (!subscription) return;

            await webpush.sendNotification(subscription, pushPayload);
          } catch (err: any) {
            // If subscription is expired or invalid, remove it
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabaseAdmin.from('push_tokens').delete().eq('id', sub.id);
            }
          }
        });

        await Promise.allSettled(promises);
      } catch (err) {
        console.error('Push broadcast error:', err);
      }
    })();
  }

  return data
}

export async function getNotificationsHistory(page = 1, limit = 20) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    notifications: data,
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  }
}

export async function deleteNotification(id: string) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

// ────────────────────────────────────────────────────────────
//  FEEDBACK
// ────────────────────────────────────────────────────────────

export async function getAllFeedbackAdmin(page = 1, limit = 20, type = '', status = '') {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('feedback')
    .select(`
      *,
      users:user_id (username, email, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (type && type !== 'All Types') {
    const typeValue = type.toLowerCase().replace(' ', '_');
    query = query.eq('type', typeValue);
  }
  
  if (status === 'resolved') query = query.eq('is_resolved', true)
  if (status === 'pending') query = query.eq('is_resolved', false)
  if (status === 'unread') query = query.eq('is_read', false)

  const { data, error, count } = await query

  if (error) throw error

  return {
    feedback: data,
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  }
}

export async function updateFeedbackStatusAdmin(id: string, updates: {
  is_read?: boolean;
  is_resolved?: boolean;
  admin_note?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('feedback')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFeedbackAdmin(id: string) {
  const { error } = await supabaseAdmin
    .from('feedback')
    .delete()
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

export async function getAdminLogs(page = 1, limit = 20) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabaseAdmin
    .from('admin_logs')
    .select(`
      *,
      admin:admin_id (username, email, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    logs: data,
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  }
}

/**
 * Unified H2H Match Fetching for Admin
 */
const H2H_TABLE_MAP: Record<string, string> = {
  'chess': 'chess_rooms',
  'ludo': 'ludo_rooms',
  '8-ball-pool': 'pool_rooms',
  'pool': 'pool_rooms',
  'speed-battle': 'speedbattle_rooms',
  'speedbattle': 'speedbattle_rooms',
  'wordscramble': 'wordscramble_rooms',
  'word-scramble': 'wordscramble_rooms',
};

export async function getH2HMatchesAdmin(slug: string, page = 1, limit = 20) {
  const table = H2H_TABLE_MAP[slug] || `${slug.replace(/-/g, '')}_rooms`;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Most H2H tables use UUIDs for guest_id, some use text. 
  // We'll try to join host/guest/winner info.
  const { data, error, count } = await supabaseAdmin
    .from(table)
    .select(`
      *,
      host:host_id (id, username, avatar_url),
      guest:guest_id (id, username, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    // Fallback for tables without proper foreign keys (e.g. speedbattle if it fails join)
    const { data: rawData, error: rawError, count: rawCount } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (rawError) throw rawError;

    // Manually hydrate user info if join failed
    const userIds = new Set<string>();
    rawData?.forEach((r: any) => {
      if (r.host_id) userIds.add(r.host_id);
      if (r.guest_id && r.guest_id.length > 20) userIds.add(r.guest_id); // Basic UUID check
    });

    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, username, avatar_url')
      .in('id', Array.from(userIds));

    const userMap = (users || []).reduce((acc: any, u: any) => {
      acc[u.id] = u;
      return acc;
    }, {});

    const hydratedData = rawData?.map((r: any) => ({
      ...r,
      host: userMap[r.host_id] || null,
      guest: userMap[r.guest_id] || null,
    }));

    return { matches: hydratedData, total: rawCount ?? 0, page, limit };
  }

  return {
    matches: data,
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  };
}

/**
 * Unified Solo Activity Fetching for Admin
 */
export async function getSoloActivityAdmin(
  slug: string, 
  viewMode: 'raw' | 'aggregated' = 'aggregated', 
  page = 1, 
  limit = 20
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (viewMode === 'aggregated') {
    // Group by user to see impact per player
    // Note: We use a raw RPC or complex query because Supabase .select().groupBy() is limited
    const { data, error } = await supabaseAdmin
      .from('soloearn_sessions')
      .select(`
        user_id,
        users:user_id (id, username, avatar_url),
        stake,
        payout,
        multiplier
      `)
      .eq('game_id', slug);

    if (error) throw error;

    // Manual aggregation (simpler than writing a complex SQL function for one-off admin task)
    const aggregation: Record<string, any> = {};
    data.forEach((row: any) => {
      const uid = row.user_id;
      if (!aggregation[uid]) {
        aggregation[uid] = {
          user: row.users,
          total_runs: 0,
          total_staked: 0,
          total_payout: 0,
          avg_multiplier: 0,
          multipliers: []
        };
      }
      aggregation[uid].total_runs++;
      aggregation[uid].total_staked += Number(row.stake);
      aggregation[uid].total_payout += Number(row.payout || 0);
      aggregation[uid].multipliers.push(Number(row.multiplier || 0));
    });

    const result = Object.values(aggregation).map(a => ({
      ...a,
      avg_multiplier: a.multipliers.reduce((s: number, m: number) => s + m, 0) / a.multipliers.length
    })).sort((a, b) => b.total_staked - a.total_staked);

    const paginated = result.slice(from, to + 1);

    return {
      activity: paginated,
      total: result.length,
      page,
      limit,
      total_pages: Math.ceil(result.length / limit)
    };
  } else {
    // Raw feed (chronological)
    const { data, error, count } = await supabaseAdmin
      .from('soloearn_sessions')
      .select(`
        *,
        user:user_id (id, username, avatar_url)
      `, { count: 'exact' })
      .eq('game_id', slug)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      activity: data,
      total: count ?? 0,
      page,
      limit,
      total_pages: Math.ceil((count ?? 0) / limit)
    };
  }
}




