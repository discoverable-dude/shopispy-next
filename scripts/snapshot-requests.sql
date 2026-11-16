-- Requests for a snapshot of a brand we do not list yet (/black-friday form).
-- Written only by the Next.js API route using the service role key; RLS is on
-- with no policies so anon/authenticated clients can never read or write it.

create table if not exists public.snapshot_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  domain          text not null,
  email           text not null,
  ip_hash         text,
  is_shopify      boolean,
  already_tracked boolean not null default false,
  store_id        uuid references public.stores(id) on delete set null,
  status          text not null default 'new',   -- new | added | not_shopify | tracked
  notes           text
);

create index if not exists snapshot_requests_ip_created_idx    on public.snapshot_requests (ip_hash, created_at desc);
create index if not exists snapshot_requests_email_created_idx on public.snapshot_requests (lower(email), created_at desc);
create index if not exists snapshot_requests_status_created_idx on public.snapshot_requests (status, created_at desc);

alter table public.snapshot_requests enable row level security;
