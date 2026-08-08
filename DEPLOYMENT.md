# ShopiSpy Next — Deployment & Cutover

This repo replaces the original Vite/React app at `shopi-spy.com` (repo: `discoverable-dude/shopify-product-spy`). Both apps share the same Supabase project, so cutover is primarily a **frontend swap** — data, auth, and Stripe customers all carry over.

---

## 0. Before you touch Vercel: settle the crons

The original app's data pipeline depended on the Supabase `scheduled-scrape` edge function. Where that function is *triggered from* is not in git — find it before going live.

1. Open Supabase Dashboard → **Database → Extensions** and confirm `pg_cron` is enabled.
2. Open **Database → Cron Jobs**. Look for a job that hits `functions/v1/scheduled-scrape`.
3. Decide:
   - **Keep pg_cron, skip Vercel cron** — remove the `scheduled-scrape` entry from `vercel.json`.
   - **Move to Vercel cron** — disable the pg_cron job (`SELECT cron.unschedule('<job-name>')`), keep `vercel.json` as-is.
   - **Both** — safe (edge function is idempotent) but doubles Shopify `/products.json` requests across 600+ stores. Not recommended.

The Vercel Hobby plan allows 2 cron jobs; the current `vercel.json` uses both slots. If you add a third cron later, you'll need Pro.

---

## 1. Vercel project setup

```bash
# From repo root, first time only:
vercel link
```

In Vercel Dashboard → **Settings → Environment Variables**, add every key from `.env.example` for **Preview + Production**:

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Same Supabase project as the live app |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Never expose |
| `STRIPE_SECRET_KEY` | Server | Test key for Preview, live key for Prod |
| `STRIPE_WEBHOOK_SECRET` | Server | Different per environment (one webhook per domain) |
| `CRON_SECRET` | Server | `openssl rand -hex 32` |
| `ADMIN_SETUP_KEY` | Server | One-time bootstrap; rotate after first use |
| `NEXT_PUBLIC_SITE_URL` | All | `https://shopi-spy.com` for Prod |

---

## 2. First deploy (preview)

```bash
vercel deploy              # preview URL, e.g. https://shopispy-next-<hash>.vercel.app
```

Do **not** promote to production yet.

---

## 3. Smoke test the preview

```bash
BASE_URL=https://<preview-url>.vercel.app \
CRON_SECRET=<your-cron-secret> \
node scripts/smoke.mjs
```

The script hits `/api/health`, both cron routes with the right auth, and a public brand page (expects SSR HTML containing `Shopify Store Tracker | ShopiSpy`).

Manual flows still needed:
- Signup + Google OAuth (use a throwaway Gmail)
- Stripe Checkout → the Stripe test card `4242 4242 4242 4242`
- Confirm `stripe trigger checkout.session.completed` fires and the webhook updates Supabase
- Trigger a price alert end-to-end (subscribe to a product, hit the monitor-alerts cron, confirm email + Slack)

---

## 4. Cutover to `shopi-spy.com`

Do these **in order**, in one sitting:

### a. Stripe
1. Stripe Dashboard → Webhooks → **Add endpoint** → `https://shopi-spy.com/api/stripe/webhook`
2. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
3. Copy the signing secret into Vercel's `STRIPE_WEBHOOK_SECRET` (Prod scope)
4. Leave the old webhook active for 48h as fallback

### b. Supabase Auth
Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://shopi-spy.com`
- **Redirect URLs** (additive, don't remove existing until after step 6):
  - `https://shopi-spy.com/**`
  - `https://*.vercel.app/**` (for ongoing previews)
  - Current redirects from the old app (keep temporarily)

### c. Vercel domain
1. Vercel Dashboard → **Domains → Add** → `shopi-spy.com`
2. Vercel gives you an A record or CNAME — update DNS with your registrar
3. Wait for SSL to provision (a few minutes)

### d. Promote
```bash
vercel promote <preview-deployment-id>   # or: vercel --prod
```

### e. Verify
- Visit `https://shopi-spy.com` — should serve the Next.js build (view source: look for `_next/static` paths)
- `curl https://shopi-spy.com/api/health` → `"status": "healthy"`
- Sign in with an existing user — confirms Supabase auth still works
- Trigger a Stripe test event — confirms the new webhook receives it

---

## 5. 48-hour watch

- Monitor Vercel logs for `[CRON]` lines at 02:00 and 08:00 UTC
- Watch Stripe Dashboard for any webhook retries (indicates prod URL misconfig)
- Check Supabase `product_fetches` table daily to confirm fresh rows

---

## 6. Rollback plan

If anything fundamental breaks:

1. **DNS flip**: change the A/CNAME for `shopi-spy.com` back to the original Lovable deploy. Propagation is minutes.
2. **Stripe**: disable the new webhook endpoint in the Stripe dashboard; the old one is still active.
3. **Supabase**: no action needed — both apps read/write the same project.
4. **Vercel**: leave the deployment up for diagnosis; don't delete.

Data written while the new app was live (products, alerts, Stripe events) stays intact because Supabase is shared.

---

## 7. Deprecate the old app (after 7 clean days)

1. Archive `discoverable-dude/shopify-product-spy` on GitHub (Settings → Archive)
2. In Lovable, disable the deployment
3. Remove the old Stripe webhook
4. Remove the now-stale Supabase redirect URLs
5. Keep the Supabase project — it's still the backend
