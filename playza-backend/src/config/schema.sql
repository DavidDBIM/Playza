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

-- PSA POINTS
create table if not exists psa_points (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references users(id) on delete cascade,
  total_points integer default 0 not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PSA EVENT LOG
create table if not exists psa_events (
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

create trigger psa_points_updated_at before update on psa_points
  for each row execute function update_updated_at();

create trigger referrals_updated_at before update on referrals
  for each row execute function update_updated_at();

-- PSA increment function
create or replace function increment_psa_points(p_user_id uuid, p_points integer)
returns void as $$
  update psa_points set total_points = total_points + p_points where user_id = p_user_id;
$$ language sql;

-- RLS (backend uses service role key which bypasses RLS automatically)
alter table users enable row level security;
alter table wallets enable row level security;
alter table psa_points enable row level security;
alter table psa_events enable row level security;
alter table referrals enable row level security;
alter table referral_milestones enable row level security;
