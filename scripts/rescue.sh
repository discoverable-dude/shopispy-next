#!/usr/bin/env bash
# Rescue the wedged ShopiSpy Supabase project by dumping its data and
# restoring onto a fresh Supabase project.
#
# Status: DUMP completed 2026-04-18 (~39 MB in ~/shopispy-rescue/).
#         Skip to step 4 to restore onto a new project.
#
# Prereqs before running the RESTORE half:
#   - New empty Supabase project (Pro tier recommended), same region (eu-west-2)
#   - DB password you set on the new project
#   - Personal Access Token from supabase.com/dashboard/account/tokens
#     (only needed for `supabase functions deploy`)

set -euo pipefail

OLD_REF="${OLD_REF:-fihtvgywpihxdsmkhswn}"
OLD_REGION="${OLD_REGION:-eu-west-2}"
DUMP_DIR="${DUMP_DIR:-$HOME/shopispy-rescue}"
REPO_OLD="${REPO_OLD:-$HOME/shopify-product-spy}"

export PATH="/opt/homebrew/opt/libpq/bin:$PATH"

log()   { printf "\n\033[1;34m==> %s\033[0m\n" "$*"; }
warn()  { printf "\n\033[1;33m!! %s\033[0m\n" "$*"; }
ok()    { printf "\033[32m✓\033[0m %s\n" "$*"; }
pause() { read -r -p "$(printf '\033[1m↵ press enter to continue, ctrl-c to abort\033[0m ')" _; }

DUMP_FILES=(
  "01-public-pre-data.sql"
  "02-public-data.sql"
  "03-public-post-data.sql"
  "04-auth-users.sql"
  "05-auth-identities.sql"
  "06-storage-data.sql"
)

# ── Prereqs ──────────────────────────────────────────────────────────────────
log "Checking prerequisites"
command -v brew     >/dev/null || { echo "Install Homebrew first: https://brew.sh"; exit 1; }
command -v supabase >/dev/null || brew install supabase/tap/supabase
command -v pg_dump  >/dev/null || { brew install libpq && brew link --force libpq; }
command -v psql     >/dev/null || { echo "psql missing — check /opt/homebrew/opt/libpq/bin is on PATH"; exit 1; }
ok "supabase $(supabase --version 2>/dev/null), $(psql --version)"

# ── Step 1–3: DUMP (skip if already done) ───────────────────────────────────
ALL_PRESENT=true
for f in "${DUMP_FILES[@]}"; do
  [ -f "$DUMP_DIR/$f" ] || ALL_PRESENT=false
done

if $ALL_PRESENT; then
  ok "Existing dump found in $DUMP_DIR — skipping dump phase"
  log "Dump files:"
  ls -la "$DUMP_DIR" | grep -E '\.sql$' | awk '{printf "  %s  %s\n", $5, $NF}'
else
  log "Dumping OLD project $OLD_REF (region $OLD_REGION)"
  mkdir -p "$DUMP_DIR"; chmod 700 "$DUMP_DIR"

  read -r -s -p "OLD DB password: " OLD_DB_PASS; echo
  export PGPASSWORD="$OLD_DB_PASS"
  export PGHOST="aws-0-$OLD_REGION.pooler.supabase.com"
  export PGPORT=5432
  export PGUSER="postgres.$OLD_REF"
  export PGDATABASE=postgres
  export PGSSLMODE=require

  psql -c 'select 1' >/dev/null || { warn "Connection failed — wrong password or region"; exit 1; }

  pg_dump --section=pre-data  --no-owner --no-privileges --schema=public -f "$DUMP_DIR/01-public-pre-data.sql"
  pg_dump --section=data      --no-owner --no-privileges --schema=public -f "$DUMP_DIR/02-public-data.sql"
  pg_dump --section=post-data --no-owner --no-privileges --schema=public -f "$DUMP_DIR/03-public-post-data.sql"
  pg_dump --data-only --no-owner --no-privileges --table=auth.users      -f "$DUMP_DIR/04-auth-users.sql"
  pg_dump --data-only --no-owner --no-privileges --table=auth.identities -f "$DUMP_DIR/05-auth-identities.sql"
  pg_dump --data-only --no-owner --no-privileges --table=storage.buckets --table=storage.objects -f "$DUMP_DIR/06-storage-data.sql"

  chmod 600 "$DUMP_DIR"/*.sql
  unset PGPASSWORD PGHOST PGPORT PGUSER PGDATABASE PGSSLMODE
  ok "Dump complete"
fi

pause

# ── Step 4: NEW project connection ──────────────────────────────────────────
log "Set up restore target"
read -r -p "NEW project ref: " NEW_REF
read -r -p "NEW region (default $OLD_REGION): " NEW_REGION
NEW_REGION="${NEW_REGION:-$OLD_REGION}"
read -r -s -p "NEW DB password: " NEW_DB_PASS; echo

export PGPASSWORD="$NEW_DB_PASS"
export PGHOST="aws-0-$NEW_REGION.pooler.supabase.com"
export PGPORT=5432
export PGUSER="postgres.$NEW_REF"
export PGDATABASE=postgres
export PGSSLMODE=require

log "Testing NEW DB connection"
psql -c 'select 1' >/dev/null || { warn "Connection failed — check region/password"; exit 1; }
ok "Connected to new project"

# Safety: refuse to overwrite a non-empty database
TBL_COUNT=$(psql -tA -c "select count(*) from information_schema.tables where table_schema='public'")
if [ "$TBL_COUNT" -gt 0 ]; then
  warn "New project's public schema already has $TBL_COUNT tables. Aborting."
  warn "Drop them first if you really want to overwrite."
  exit 1
fi
ok "New public schema is empty"

# ── Step 5: RESTORE ─────────────────────────────────────────────────────────
log "Restoring public schema (pre-data)"
psql -v ON_ERROR_STOP=1 -f "$DUMP_DIR/01-public-pre-data.sql"

log "Restoring public data"
psql --single-transaction -v ON_ERROR_STOP=1 -f "$DUMP_DIR/02-public-data.sql"

log "Restoring public post-data (indexes, constraints, triggers)"
psql -v ON_ERROR_STOP=1 -f "$DUMP_DIR/03-public-post-data.sql"

log "Restoring auth.users"
# ON CONFLICT DO NOTHING in case the new project already seeded any system users
psql -v ON_ERROR_STOP=1 -f "$DUMP_DIR/04-auth-users.sql"

log "Restoring auth.identities"
psql -v ON_ERROR_STOP=1 -f "$DUMP_DIR/05-auth-identities.sql"

log "Restoring storage metadata (buckets + objects table)"
psql -v ON_ERROR_STOP=1 -f "$DUMP_DIR/06-storage-data.sql"
ok "Database restored"

# ── Step 6: Functions ───────────────────────────────────────────────────────
log "Redeploying edge functions from old repo"
cd "$REPO_OLD"
if ! supabase projects list >/dev/null 2>&1; then
  warn "Supabase CLI not logged in — run: supabase login --token <PAT>"
  warn "Then rerun this script; the restore above is already done."
  exit 0
fi
supabase link --project-ref "$NEW_REF"
for fn in supabase/functions/*/; do
  name=$(basename "$fn")
  [ "$name" = "_shared" ] && continue
  log "  → $name"
  supabase functions deploy "$name" --project-ref "$NEW_REF"
done
ok "Functions deployed"

# ── Step 7: Parity ──────────────────────────────────────────────────────────
log "Row-count parity (new project should match the dump values below)"
for tbl in stores products product_variants product_images product_fetches product_alerts profiles subscribers; do
  N=$(psql -tA -c "select count(*) from public.$tbl" 2>/dev/null || echo ERR)
  printf "  %-20s  new=%s\n" "$tbl" "$N"
done
echo "  expected from dump: stores=20 products=12658 product_variants=12954 product_images=10147"
echo "                      product_fetches=44 product_alerts=2 profiles=47 subscribers=44"
echo "                      auth.users=48 auth.identities=49"

unset PGPASSWORD PGHOST PGPORT PGUSER PGDATABASE PGSSLMODE

cat <<EOF

──────────────────────────────────────────────────────────────────────────────
DB + functions migrated. Manual steps remaining:

1. Update Vercel env vars (Preview + Production) from NEW project's
   Settings → API page:
     NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
     SUPABASE_SERVICE_ROLE_KEY

2. Set edge function secrets on the NEW project (they don't come across):
     supabase secrets set --project-ref $NEW_REF \\
       STRIPE_SECRET_KEY=...  STRIPE_WEBHOOK_SECRET=... \\
       RESEND_API_KEY=...     SLACK_WEBHOOK_URL=...

3. Auth redirect URLs on the NEW project:
     Authentication → URL Configuration
       Site URL:      https://shopi-spy.com
       Redirect URLs: https://shopi-spy.com/**, https://*.vercel.app/**

4. Re-add Google OAuth client ID + secret under Authentication → Providers.

5. Point Stripe webhook at https://shopi-spy.com/api/stripe/webhook and
   update STRIPE_WEBHOOK_SECRET in Vercel from the new endpoint.

6. After 7 clean days: delete the old project, then:
     shred -u $DUMP_DIR/*.sql   (or on macOS: rm -P $DUMP_DIR/*.sql)
──────────────────────────────────────────────────────────────────────────────
EOF
