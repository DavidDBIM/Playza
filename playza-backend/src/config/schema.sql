-- Run this entire file in Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- USERS
create table if not exists users (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text unique not null,
  phone text,
  first_name text,
  last_name text,
  avatar_url text,
  referral_code text unique not null,
  referred_by uuid references users(id) on delete set null,
  role text default 'user' check (role in ('user', 'admin', 'superadmin')),
  is_email_verified boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- WALLETS
create table if not exists wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references users(id) on delete cascade,
  balance numeric(12, 2) default 0.00 not null,
  total_deposited numeric(12, 2) default 0.00,
  total_withdrawn numeric(12, 2) default 0.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PZA POINTS
create table if not exists pza_points (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references users(id) on delete cascade,
  total_points integer default 0 not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PZA EVENT LOG
create table if not exists pza_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  event_type text not null,
  points_awarded integer not null,
  meta jsonb default '{}',
  created_at timestamptz default now()
);

-- REFERRALS
create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references users(id) on delete cascade,
  referred_id uuid not null references users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'email_verified', 'rewarded')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(referrer_id, referred_id)
);

-- REFERRAL MILESTONES
create table if not exists referral_milestones (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  milestone integer not null,
  rewarded_at timestamptz default now(),
  unique(user_id, milestone)
);

-- Auto update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on users
  for each row execute function update_updated_at();

create trigger wallets_updated_at before update on wallets
  for each row execute function update_updated_at();

create trigger pza_points_updated_at before update on pza_points
  for each row execute function update_updated_at();

create trigger referrals_updated_at before update on referrals
  for each row execute function update_updated_at();

-- PZA increment function
create or replace function increment_pza_points(p_user_id uuid, p_points integer)
returns void as $$
  update pza_points set total_points = total_points + p_points where user_id = p_user_id;
$$ language sql;

-- RLS (backend uses service role key which bypasses RLS automatically)
alter table users enable row level security;
alter table wallets enable row level security;
alter table pza_points enable row level security;
alter table pza_events enable row level security;
alter table referrals enable row level security;
alter table referral_milestones enable row level security;

-- TRANSACTIONS (run this if not already created)
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('deposit', 'withdrawal', 'game_entry', 'winnings', 'bonus')),
  amount numeric(12, 2) not null,
  status text default 'pending' check (status in ('pending', 'successful', 'failed')),
  reference text unique,
  meta jsonb default '{}',
  created_at timestamptz default now()
);


-- CHESS ROOMS
create table if not exists chess_rooms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  host_id uuid not null references users(id) on delete cascade,
  guest_id uuid references users(id) on delete set null,
  stake numeric(12, 2) default 0,
  status text default 'waiting' check (status in ('waiting', 'active', 'finished', 'abandoned')),
  board_state jsonb default null,
  current_turn uuid references users(id) on delete set null,
  winner_id uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger chess_rooms_updated_at before update on chess_rooms
  for each row execute function update_updated_at();

alter table chess_rooms enable row level security;

-- Wallet increment/decrement functions
create or replace function increment_wallet_balance(p_user_id uuid, p_amount numeric)
returns void as $$
  update wallets
  set balance = balance + p_amount,
      total_deposited = total_deposited + p_amount,
      updated_at = now()
  where user_id = p_user_id;
$$ language sql;

create or replace function decrement_wallet_balance(p_user_id uuid, p_amount numeric)
returns void as $$
  update wallets
  set balance = balance - p_amount,
      total_withdrawn = total_withdrawn + p_amount,
      updated_at = now()
  where user_id = p_user_id;
$$ language sql;


-- SPEED BATTLE
create table if not exists speedbattle_rooms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  host_id uuid not null references users(id) on delete cascade,
  guest_id text,
  stake numeric(12,2) default 0,
  paragraph text not null,
  status text default 'waiting' check (status in ('waiting','active','finished')),
  is_bot boolean default false,
  bot_difficulty text default 'medium',
  winner_id text,
  created_at timestamptz default now()
);

create table if not exists speedbattle_results (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references speedbattle_rooms(id) on delete cascade,
  user_id text not null,
  wpm integer not null,
  accuracy numeric(5,2) not null,
  finished_at timestamptz default now(),
  unique(room_id, user_id)
);

alter table speedbattle_rooms enable row level security;
alter table speedbattle_results enable row level security;

-- WORD SCRAMBLE
create table if not exists wordscramble_rooms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  host_id uuid not null references users(id) on delete cascade,
  guest_id text,
  stake numeric(12,2) default 0,
  rounds jsonb not null,
  status text default 'waiting' check (status in ('waiting','active','finished')),
  is_bot boolean default false,
  bot_difficulty text default 'medium',
  winner_id text,
  created_at timestamptz default now()
);

create table if not exists wordscramble_scores (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references wordscramble_rooms(id) on delete cascade,
  user_id text not null,
  score integer not null,
  rounds_won integer not null,
  created_at timestamptz default now(),
  unique(room_id, user_id)
);

alter table wordscramble_rooms enable row level security;
alter table wordscramble_scores enable row level security;

-- 8 BALL POOL
create table if not exists pool_rooms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  host_id uuid not null references users(id) on delete cascade,
  guest_id uuid references users(id) on delete set null,
  stake numeric(12, 2) default 0,
  status text default 'waiting' check (status in ('waiting', 'active', 'finished', 'abandoned')),
  game_state jsonb default null,
  winner_id uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger pool_rooms_updated_at before update on pool_rooms
  for each row execute function update_updated_at();

alter table pool_rooms enable row level security;


-- USER STREAKS
create table if not exists user_streaks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references users(id) on delete cascade,
  streak_days integer default 0,
  last_claimed_at timestamptz,
  streak_reward_claimed_today boolean default false,
  updated_at timestamptz default now()
);

alter table user_streaks enable row level security;

-- CLAIMED TASKS
create table if not exists claimed_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  task_id text not null,
  points_awarded integer not null,
  claimed_at timestamptz default now(),
  unique(user_id, task_id)
);

alter table claimed_tasks enable row level security;

-- LUDO ROOMS
create table if not exists ludo_rooms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  host_id uuid not null references users(id) on delete cascade,
  guest_id uuid references users(id) on delete set null,
  stake numeric(12, 2) default 0,
  status text default 'waiting' check (status in ('waiting', 'active', 'finished', 'abandoned')),
  board_state jsonb default null,
  current_turn uuid references users(id) on delete set null,
  winner_id uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger ludo_rooms_updated_at before update on ludo_rooms
  for each row execute function update_updated_at();

alter table ludo_rooms enable row level security;

-- NOTIFICATIONS
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  title text, -- Optional for Banners
  content text, -- Optional for Banners
  image_url text,
  type text not null default 'System Update',
  priority text not null default 'High',
  audience text not null default 'All Players',
  status text not null default 'sent',
  created_at timestamptz default now()
);

alter table notifications enable row level security;

-- PUSH TOKENS (For Web Push Notifications)
create table if not exists push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  token text not null unique,
  device_type text, -- 'web', 'ios', 'android'
  created_at timestamptz default now()
);

alter table push_tokens enable row level security;

-- FEEDBACK
create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  type text not null,
  title text not null,
  message text not null,
  game_name text,
  is_read boolean default false,
  is_resolved boolean default false,
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger feedback_updated_at before update on feedback
  for each row execute function update_updated_at();

alter table feedback enable row level security;

-- FEEDBACK POLICIES
create policy "Users can insert their own feedback" on feedback
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own feedback" on feedback
  for select using (auth.uid() = user_id);

-- ADMIN LOGS
create table if not exists admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references users(id),
  action text not null,
  target_id text,
  details jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

alter table admin_logs enable row level security;

-- ADMIN MFA CODES
create table if not exists admin_mfa_codes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

alter table admin_mfa_codes enable row level security;

-- SOLOEARN SESSIONS
create table if not exists soloearn_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  game_id text not null,
  stake numeric(12, 2) not null,
  multiplier numeric(4, 2) default null,
  payout numeric(12, 2) default null,
  status text default 'in_progress' check (status in ('in_progress', 'completed', 'terminated')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger soloearn_sessions_updated_at before update on soloearn_sessions
  for each row execute function update_updated_at();

alter table soloearn_sessions enable row level security;

-- GAME TOURNAMENTS & SESSIONS
create table if not exists games (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  category text,
  thumbnail_url text,
  iframe_url text,
  difficulty text,
  mode text,
  duration_seconds integer default 300,
  platform_fee_percentage numeric default 10,
  how_to_play jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  capabilities jsonb default null
);


create table if not exists game_sessions (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid references games(id) on delete cascade,
  title text,
  type text, -- 'tournament', 'daily'
  entry_fee numeric default 0,
  max_players integer default 100,
  winners_count integer default 1,
  start_time timestamptz,
  end_time timestamptz,
  status text default 'upcoming', -- 'upcoming', 'active', 'calculating', 'completed'
  pool_amount numeric default 0,
  created_at timestamptz default now()
);

create table if not exists game_leaderboard (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references game_sessions(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  best_score integer default 0,
  attempts integer default 0,
  status text default 'playing', -- 'playing', 'finished'
  payout_amount numeric default 0,
  payout_status text default 'pending', -- 'pending', 'paid'
  updated_at timestamptz default now(),
  unique(session_id, user_id)
);

alter table games enable row level security;
alter table game_sessions enable row level security;
alter table game_leaderboard enable row level security;

-- PLAY ROUNDS (For Anti-Cheat Handshake)
create table if not exists play_rounds (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references game_sessions(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  start_time timestamptz default now(),
  status text default 'active', -- 'active', 'submitted', 'expired'
  created_at timestamptz default now()
);

alter table play_rounds enable row level security;

-- GAME HISTORY (General match results for Profile tab)
create table if not exists game_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  game_name text not null,
  score integer default 0,
  position text, -- e.g. '#1', '#24', 'Winner'
  winnings numeric default 0,
  status text check (status in ('win', 'loss', 'draw')),
  played_at timestamptz default now()
);

alter table game_history enable row level security;



