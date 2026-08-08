-- ShopiSpy — allow public (anon) read of the two tables the public brand/
-- industry/market pages need for "last updated" + "latest change".
-- brandStats.ts reads product_fetches + product_changes with the anon key;
-- without these policies they return empty. Safe to re-run.

alter table public.product_fetches enable row level security;
alter table public.product_changes enable row level security;

drop policy if exists "Anonymous can read product fetches" on public.product_fetches;
create policy "Anonymous can read product fetches"
  on public.product_fetches for select to anon using (true);

drop policy if exists "Anonymous can read product changes" on public.product_changes;
create policy "Anonymous can read product changes"
  on public.product_changes for select to anon using (true);

-- verify
select tablename, policyname from pg_policies
where schemaname = 'public' and tablename in ('product_fetches','product_changes')
order by tablename, policyname;
