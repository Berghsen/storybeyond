## StoryBeyond (Next.js + Supabase)

StoryBeyond is a Next.js 14 application that helps storytellers draft, store, and share memories. It relies on Supabase for auth/data/storage and Stripe for paid subscriptions.

### Quick start
1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env.local` in the project root (see _Environment_ below).
3. Start the dev server
   ```bash
   npm run dev
   ```

### Environment

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_KEY=service-role-key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase setup
Run the SQL in `supabase/setup.sql` inside the Supabase SQL editor **before** booting the app. The script:

- Enables the `pgcrypto` extension for `gen_random_uuid`.
- Creates all application tables (`stories`, `recipients`, `story_recipients`, `profiles`).
- Adds the billing primitives needed for Stripe (`subscriptions`, `coupons`, `stripe_webhook_events`).
- Enables row-level security and policies so users only see their own rows.
- Installs a trigger that auto-creates a `subscriptions` row whenever a new `auth.users` record is inserted (prevents Stripe checkout from writing to a missing row).

Also create a public storage bucket named `story-images` for uploaded media.

### Stripe & billing
1. Configure the required environment variables (see above).
2. In Stripe, create the Premium recurring price and copy its price ID into `STRIPE_PREMIUM_MONTHLY_PRICE_ID`.
3. Add your webhook endpoint (`https://<domain>/api/stripe/webhook`) and paste the secret into `STRIPE_WEBHOOK_SECRET`.
4. Optionally seed `public.coupons` with voucher codes via the Supabase SQL editor; only the service-role client can access this table.
5. Use `stripe listen --forward-to localhost:3000/api/stripe/webhook` while developing. Every event is mirrored into the `stripe_webhook_events` table for debugging/replay.

### Storage
Uploads land in `story-images/stories/<uuid>.<ext>` and count toward the user’s plan quota via `/api/subscription/storage`.

### Key routes
- `/login`, `/signup`
- `/dashboard` (protected home)
- `/story/new`, `/story/[id]/edit`
- `/settings/account`, `/subscription/success`, `/subscription/cancel`

### Deployment
1. Import the repo into Vercel.
2. Framework preset: **Next.js**.
3. Build command: `npm run build`
4. Output directory: `.next`
5. Supply all environment variables from the _Environment_ section.

