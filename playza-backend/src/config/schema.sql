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
