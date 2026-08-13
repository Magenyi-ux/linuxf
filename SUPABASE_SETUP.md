# Examply PWA: Supabase and PostHog setup

This PWA uses Supabase for email/password authentication and user-owned progress synchronisation. It uses PostHog for explicit, privacy-minimised product analytics. The browser receives only the Supabase anon/publishable key and the PostHog project key; the Supabase `service_role` key, database password, and JWT secret must never be placed in the repository or browser environment.

## 1. Apply the database schema

Open the Supabase project’s **SQL Editor**, create a new query, and run the complete contents of [`supabase/schema.sql`](./supabase/schema.sql). The migration uses the project’s existing `profiles` table and creates `user_progress`, `progress_events`, and `achievements`. It enables Row Level Security on all four tables, creates the new-user profile trigger, and installs the idempotent `record_progress_event` RPC.

The RPC is important because a quiz completion can be recorded more than once by a retrying client. Its event UUID is the idempotency key. A duplicate event is ignored, while a first-time event updates the aggregate `user_progress` row. The local queue removes an item only after Supabase acknowledges the write.

## 2. Enable email/password authentication

In **Authentication → Providers**, enable the Email provider. Keep email confirmation enabled for production unless there is a specific reason to disable it. In **Authentication → URL Configuration**, set the production Site URL and add the local development URL used by the team, such as `http://localhost:3000`, to the allowed redirect URLs.

The application currently supports email/password sign-in and sign-up only. The schema does not prevent adding a social provider later because user identity is based on Supabase’s UUID rather than an email address.

## 3. Configure local development

Copy the redacted variable names from `.env.example` into the ignored `.env.local` file. Populate the values locally with the Supabase project URL, Supabase anon/publishable key, PostHog project key, and PostHog host. `.env.local` is covered by the repository’s `*.local` ignore rule and must not be uploaded.

For the production deployment, add the same four `VITE_` variables in the hosting provider’s environment settings. Do not place the values in a committed source file, HTML file, question-bank JSON file, or SQL migration.

## 4. Review the security boundary

The application’s browser client uses Supabase’s anon/publishable key. RLS policies restrict profile, progress, event, and achievement reads to `auth.uid() = user_id` (or the profile’s own `id`). The protected `profiles.role` field has no browser update policy, so a user cannot promote their own account through a table update. Achievement writes are restricted to the authenticated user, and progress writes go through the authenticated RPC.

The service worker caches only same-origin public assets. It does not cache external Supabase or PostHog responses and does not cache `/api/` responses that could contain user data.

## 5. Analytics behaviour

PostHog is configured with autocapture, pageview capture, pageleave capture, and session recording disabled. The app explicitly sends a small set of events: sign-in, sign-up, sign-out, quiz completion, achievement earned, sync completion, app session start, and selected feature usage. Quiz completion analytics use score bands rather than answer-level data. The app does not send passwords, email addresses, question text, selected answers, explanations, or local queue contents.

## 6. Validation commands

From the repository root, run:

```bash
npm run check
npm run build
```

The local preview should open on the configured Vite port. The authentication form can be reached through **Sign In**. A real account should be used for an end-to-end Supabase test; the code does not require or embed a test password.

## 7. Current limitation

Account deletion is deliberately not implemented as a client-side destructive operation. Supabase user deletion requires a privileged server-side workflow or an approved administrative process. The current profile action displays a transparent notice rather than falsely claiming to delete the remote account.
