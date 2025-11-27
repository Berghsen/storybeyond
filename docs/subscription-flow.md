# Subscription Flow Overview

This document explains how the Story Beyond subscription system works end-to-end so you can maintain or extend it quickly.

## Plans & Limits

- **Free** – 1 story, 1 video upload, 500 MB storage
- **Pro** – default paid tier (unlimited stories, high limits)
- **Premium** – optional high-touch tier

Limits live in `src/lib/subscriptionPlans.ts` and are consumed by both the API routes and the React subscription context.

## Data Model

Supabase tables added in `supabase/setup.sql`:

- `subscriptions` – canonical plan info per user (`plan`, `status`, `stripe_customer_id`, `storage_used_mb`, etc.)
- `coupons` – optional Stripe coupon metadata for voucher codes (service role only, no RLS policies)
- `stripe_webhook_events` – append-only log used to debug Stripe webhook delivery (service role only)
- `auth.users → public.subscriptions` trigger – guarantees a `subscriptions` row exists for every account so Stripe checkout metadata always finds a destination.

RLS allows users to read/update their own subscription rows while Stripe webhooks rely on the service-role client.

## Frontend Flow

1. **Landing CTA** (`Get Started`) → `/signup` (free account, no card).
2. **Dashboard** shows usage badges, locked states, and directs Free users to upgrade.
3. **Upgrade triggers**:
   - Dashboard banner/locked overlay
   - Sidebar link `Account`
   - `/settings/account` page renders `UpgradePanel` (plan cards + voucher input). Free plan is positioned strictly as a “test drive”—recipients and the delivery workflow are disabled until a paid plan is active.
4. `UpgradePanel` calls `/api/create-checkout-session` which redirects the browser to Stripe Checkout.
5. Success/cancel routes (`/subscription/success`, `/subscription/cancel`) confirm the state and nudge back to dashboard or the account page.

## Backend Flow

### Checkout

- `POST /api/create-checkout-session`
  - Ensures a `subscriptions` row exists.
  - Creates/fetches Stripe customer.
  - Optionally attaches a coupon (validated through the service-role client).
  - Returns the Checkout Session URL with metadata `{ userId, plan }`.

- `POST /api/create-portal-session`
  - Opens Stripe Billing Portal for existing paid users (returns to `/settings/account`).

### Webhooks

- `POST /api/stripe/webhook`
  - Validates with `STRIPE_WEBHOOK_SECRET`.
  - Persists every incoming event JSON into `stripe_webhook_events` for auditability/replays (service-role client only).
  - Handles `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
  - Updates Supabase `subscriptions` with the latest plan, status, period end, and Stripe IDs.

### Subscription reads & limits

- `GET /api/subscription` → returns plan, status, usage counts, and limit thresholds.
- `POST /api/subscription/storage`
  - Called before/after uploads (see `uploadToStorage`) to enforce storage caps.
  - `checkOnly: true` ensures uploads beyond the quota fail early.
- `POST /api/stories`
  - Centralized creation endpoint that checks story/video counts before inserting.

All protected API routes use `@supabase/auth-helpers-nextjs` to identify the currently authenticated user.

## Usage Tracking

- `uploadToStorage` reserves storage via `/api/subscription/storage` (check + commit) for any memory-related assets. Profile/recipient uploads pass `countTowardsQuota: false`.
- Dashboard pull + `useSubscription` context display the current usage to the user.

## Stripe Environment Variables

Set the following in `.env.local`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://localhost:3000
SUPABASE_SERVICE_KEY=...
```

## Manual Test Checklist

- Free user creates an account and lands in dashboard with Free limits shown.
- Attempting a second story/video shows locked messaging and disables creation.
- Recipients page and the story-recipient selector both show a locked overlay until the user upgrades.
- Dashboard upgrade CTAs route to `/settings/account`.
- Starting checkout opens Stripe; cancel returns to `/subscription/cancel`.
- Successful payment hits `/subscription/success`, Stripe webhook marks the user as `pro`/`premium`, and the dashboard unlocks features immediately after refresh.
- Voucher code field accepts valid codes and errors on invalid ones.
- Locked sections (scheduled stories, etc.) show `LockedFeatureOverlay` until plan upgrades.


