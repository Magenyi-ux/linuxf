# Supabase, Offline Sync, and PostHog Implementation Report

## Delivery status

The PWA integration has been implemented and published to `Magenyi-ux/linuxf` on the `main` branch. The published revision is `1dc2811867005890290bdb6b629e4e33f2413164`, based on the latest question-bank revision that was already on GitHub. No `.env.local` file, Supabase key, PostHog key, password, service-role credential, or database secret was published.

The project’s active Vite build previously served an unrelated `client/` landing-page scaffold while the quiz application lived at the repository root. The published build now serves the actual quiz application, so the authentication, progress, and analytics code is attached to the product users will open.

## Implemented security model

The browser uses the Supabase publishable key only. Supabase Row Level Security is enabled on `profiles`, `user_progress`, `progress_events`, and `achievements`. Profile and progress reads are limited to the authenticated user. Achievement writes are limited to the authenticated user. The protected `record_progress_event` RPC assigns `auth.uid()` server-side, validates score and XP bounds, and aggregates only the authenticated user’s event.

The progress event UUID is an idempotency key. If a network retry repeats the same completion, the server ignores the duplicate event rather than awarding XP twice. The local queue removes an item only after the remote write succeeds. If the browser is offline, queued progress and achievements remain locally available for a later online flush.

The PWA service worker now caches only same-origin public assets. It does not cache Supabase responses, PostHog responses, or API responses that could contain user data. The obsolete unrestricted analytics endpoint was retired so arbitrary event payloads and email addresses are no longer stored in the former KV collector.

## Authentication

The application now supports email/password sign-up, email/password sign-in, Supabase session restoration, and Supabase sign-out. Supabase user metadata stores the display name at sign-up, and the project’s existing `profiles` table is populated for new users through a database trigger. Social providers are not enabled and can be added later without changing the user identity model.

## Offline progress and achievements

Quiz completion continues to award **10 XP per correct answer in the PWA only**. For signed-in users, every completion queues subject, exam type, year, questions attempted, questions correct, and XP earned. The queue flushes automatically on sign-in, initial online reconciliation, and network restoration. Remote progress totals and remote achievement keys are fetched after synchronisation and merged into local state.

The local queue uses an idempotency UUID for each write. It stores no question text, selected answer, explanation, password, or email address. Achievements are deduplicated locally and again by the Supabase unique constraint on `(user_id, achievement_key)`.

## PostHog analytics

PostHog is initialised from environment variables with autocapture, pageview capture, pageleave capture, and session recording disabled. The explicit event allowlist includes sign-in, sign-up, sign-out, quiz completion, achievement earned, sync completion, app session start, and selected feature usage. Quiz results are sent as score bands and aggregate counters rather than question-level data.

The analytics layer does not send passwords, email addresses, question text, selected answers, explanations, or queue contents. A live PostHog configuration check returned HTTP 200 using a non-personal verification identifier.

## Validation evidence

| Check | Result |
|---|---|
| `npm run check` | Passed with no TypeScript errors |
| `npm run build` | Passed; Vite and server bundles generated successfully |
| Local browser render | Passed; quiz home, navigation, and auth forms rendered |
| Supabase publishable-key check | Passed; project REST gateway returned HTTP 200 |
| Supabase table check | Passed; all three new REST endpoints returned HTTP 200 with anonymous RLS-filtered results |
| Anonymous RPC write check | Passed securely; RPC returned `not authenticated` |
| Supabase SQL migration | Passed in the authenticated SQL Editor |
| PostHog host/key check | Passed; `decide` endpoint returned HTTP 200 |
| GitHub publication | Passed; `main` points to commit `1dc2811867005890290bdb6b629e4e33f2413164` |

The production build reports a large JavaScript chunk warning because the existing question-bank assets are bundled through the local question loader. This is a performance warning, not a build failure; code splitting can be addressed separately if desired.

## Required deployment configuration

The four environment variables must be entered into the production hosting provider because `.env.local` is intentionally ignored and was not published:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
VITE_POSTHOG_KEY=your-posthog-project-key
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

The actual values should be entered directly in the host’s environment settings. The accompanying [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) file contains the dashboard configuration and security checklist.

## Remaining test

A real email/password sign-up and sign-in was not submitted during validation because no test account was provided and creating an external account is a user-controlled action. The application is ready for the user to create an account, confirm the email if Supabase email confirmation is enabled, complete a quiz, and observe the progress and achievement records in Supabase.

Account deletion is intentionally not implemented as a client-side destructive operation. A privileged server-side deletion workflow is required to remove an authentication user and all related records safely.
