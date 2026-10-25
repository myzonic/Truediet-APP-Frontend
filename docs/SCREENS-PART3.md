# True Diet — Part 3: Screens 39–50, Platform, and Completion Report

Continues `docs/SCREENS-PART1.md` and `docs/SCREENS-PART2.md`. This part documents
the account/auth, search, support, payment, messaging, and legal screens, then
covers the platform-wide mandates: API catalogue, database audit & migrations,
authentication, user-data isolation, AI/external integrations, subscription
architecture, RevenueCat / Apple IAP / Google Play Billing, payment verification,
notifications, privacy controls, testing, builds, deployment, and an honest
completion report.

Everything below was grounded in an inspection of the actual repository. Items
implemented in this change are marked **[done]**, everything else is **[specified]**
or **[blocked — needs client decision]**. No untested work is claimed complete.

---

## 0. Repository inspection (facts)

- App: Expo `~52.0.0`, RN `0.76.0`, React `18.3.1`, TypeScript `~5.3.3`.
- Auth: Better Auth `^1.7.7` (client) + `better-auth`/`@better-auth/expo` `^1.1.21`
  (server), session stored in `expo-secure-store`, scheme `truediet`.
- Backend: Hono + Drizzle + PostgreSQL (`server/`).
- **No test framework** (no jest/vitest), **no payments SDK**
  (no `react-native-purchases`/RevenueCat, no Stripe), **no push** library, **no
  analytics** in the project's own `package.json`.
- `app.json` is missing `icon`, `splash.image`, `android.package`,
  `ios.bundleIdentifier` → build/store blockers.
- No `.env`/`.env.example` in `server/`; `DATABASE_URL` is required at runtime.
- There is **no hardcoded price** anywhere in the codebase (verified) — good.

---

## Screens 39–50

Route names are from `src/navigation/types.ts`. `AuthScreen` and the generic
template live in `src/screens/extended/ExtendedScreens.tsx`.

### Screen 39 — Login (`Login`) — **[done, verified by type-check]**

- **Content (exact)**: eyebrow `WELCOME BACK`; title `Log in to True Diet.`;
  fields Email address + Password (min 8); CTA `Continue`; links `Forgot
  password?`, `Create an account`.
- **Behaviour**: calls `authClient.signIn.email({ email, password })`, then
  `refetchSession()` from `AuthContext`, then `goBack()`. Inline error text on
  failure. Loading disables the CTA.
- **API**: `POST /api/auth/sign-in/email` (Better Auth handler).
- **DB**: `user`, `session`, `account`.
- **Permissions**: public endpoint; issues an httpOnly session cookie.
- **States**: idle · submitting · error (invalid credentials / network).
- **Acceptance tests**: valid creds → session set + navigate back; invalid → error,
  no session; empty/invalid email → CTA effectively blocked by validation.

### Screen 40 — Password Recovery (`ForgotPassword` + `ResetConfirmation`) — **[done, verified]**

- **Content (exact)**: `RESET PASSWORD` / `Enter your email and we’ll send reset
  instructions.`; CTA `Send Reset Link`; confirmation `CHECK YOUR EMAIL` /
  `Your reset or verification confirmation will arrive shortly.`
- **Behaviour**: calls `authClient.requestPasswordReset({ email })` (falling back
  to `forgetPassword` on older clients), then navigates to `ResetConfirmation`.
- **API**: `POST /api/auth/request-password-reset` (Better Auth).
- **Blocked**: actually **sending email needs an email provider** (SMTP/Resend/
  Postmark) configured in `server/src/lib/auth.ts` (`emailAndPassword.sendResetPassword`).
  **[blocked — needs client decision on email provider + from-address]**.

### Screen 41 — Email Verification (`VerifyEmail` proposed) — **[specified / blocked]**

- No dedicated route today; verification is owned by Better Auth
  (`emailVerification`). Needs: `emailVerification.sendOnSignUp` + provider.
- **API**: `GET /api/auth/verify-email?token=…`.
- **Blocked**: email provider + product decision (required vs optional).

### Screen 42 — Reset/Verification Confirmation (`ResetConfirmation`) — **[done]**

- Static confirmation copy (above); `Return to Login` navigates to `Login`.

### Screen 43 — Global Search (`SearchScreen`) — **[done, verified]**

- **Behaviour**: debounced (300 ms) query against `GET /api/content?q=`; renders
  results; `No results found.` when empty; rows navigate to item route.
- **API**: `GET /api/content?q=&limit=` (public).
- **States**: idle (<2 chars) · loading · results · empty · error (falls back to
  no list).
- **Acceptance tests**: typing ≥2 chars returns matches; unknown term → empty copy.

### Screen 44 — Help & Support (`Support`) — **[specified]**

- **Content (exact)**: `HELP & SUPPORT` / `How can we help?` /
  `Find answers or contact the True Diet team for account and app support.`;
  items `Frequently asked questions`, `Contact True Diet`.
- **API (proposed)**: `GET /api/support/faq`; `POST /api/support/requests`.
- **Blocked**: support destination (email/inbox) decision.

### Screen 45 — Payment / Purchase Flow (`Checkout`) — **[scaffold done; provider blocked]**

- **Content (exact)**: `CHECKOUT` / `Complete your membership.` /
  `Payment will be handled by Stripe through a secure backend checkout session.`;
  CTA `Continue to Secure Checkout`.
- **Server [done]**: `GET /api/plans`, `GET /api/subscription`,
  `POST /api/subscription/checkout`, `POST /api/subscription/webhook`. Checkout
  returns **503 `payments_not_configured`** until `STRIPE_SECRET_KEY` (or
  `PAYMENTS_ENABLED=true`) is set; **no prices are hardcoded** — amounts come from
  the `plans` table populated from provider product IDs.
- **Blocked**: provider choice, secret keys, product IDs, and (mobile digital
  content) Apple/Google IAP (see Part-3 platform section). Do **not** ship an
  external payment link for digital subscriptions — app-store rule violation.

### Screen 46 — Appointment Details & Confirmation (`AppointmentDetail`, `Telehealth`) — **[specified]**

- **Content (exact)**: `APPOINTMENT` / `Your nutrition visit.` /
  `Review appointment time, visit type, status, and secure joining details once
  your scheduling API is connected.`; CTA `View Telehealth Details`.
- **API (proposed)**: `GET/POST /api/appointments`, `GET /api/dietitians/:id/availability`.
- **Blocked**: scheduling provider (Cal.com / Calendly / custom) + video (Daily/
  Twilio/Zoom) + Join-URL issuance rules.

### Screen 47 — Message Conversation Detail (`MessageDetail`) — **[backend done; screen specified]**

- **Content (exact)**: `SECURE MESSAGE` / `Conversation with your Dietitian.` /
  `Messages will appear here after a secure, access-controlled messaging backend
  is connected.`
- **Server [done]**: `GET /api/messages/threads`,
  `GET /api/messages/threads/:id`, `POST /api/messages` (owner-scoped, 1–2000 char).
- **Client [done]**: `src/lib/messages.ts`; **Ask the Dietitian** screen now posts
  to the API with error/loading states (`CoreFeatureScreens.tsx`).
- **Pending**: render thread history in `MessageDetail` (currently placeholder).

### Screen 48 — Webinar Registration Confirmation (`WebinarConfirmation`) — **[specified]**

- **Content (exact)**: `REGISTRATION CONFIRMED` / `You’re registered.` /
  `A confirmation and reminder will be sent when webinar notifications are
  connected.`; CTA `View Webinar Details`.
- **API (proposed)**: `POST /api/webinars/:id/register`.
- **Blocked**: reminder channel (email vs push) + join link policy.

### Screen 49 — Terms & Conditions (`Legal`) — **[specified]**

- **Content (exact)**: `LEGAL` / `Terms, privacy, and disclaimers.` /
  `Read True Diet’s Terms of Use, Privacy Policy, educational disclaimer, and
  data-processing information.`; items include `Terms of Use`.
- **Blocked**: **final legal copy from the client** (must not be invented).

### Screen 50 — Privacy Policy (`Legal` + `Privacy`) — **[specified]**

- **Content (exact)** `Privacy`: `PRIVACY & DATA` / `Your data, your control.` /
  `Review consent choices, request your data, and manage account deletion.
  Health-related data should only be processed through approved secure services.`
- **API (proposed)**: `POST /api/account/export`, `DELETE /api/account`.
- **Blocked**: legal copy, data-retention policy, and DPO/contact details.

---

## Platform

### API catalogue

**[done] — live today**

| Method | Path | Auth | Purpose |
| ------ | ---- | ---- | ------- |
| GET | `/health` | public | liveness + DB ping |
| POST/GET | `/api/auth/**` | public | Better Auth (sign-up/in/out, session, reset) |
| GET | `/api/profile` | session | current user + profile |
| POST | `/api/profile` | session | create/update profile |
| GET | `/api/content` | public | list content (`type`, `q`, `limit`) |
| GET | `/api/content/:slug` | public/session | detail; premium requires session |
| GET | `/api/saved` | session | saved items |
| POST | `/api/saved` | session | save (idempotent) |
| DELETE | `/api/saved/:contentId` | session | unsave |
| GET | `/api/messages/threads` | session | user's threads |
| GET | `/api/messages/threads/:id` | session | thread + messages (owner) |
| POST | `/api/messages` | session | create message |
| GET | `/api/plans` | public | plan catalogue (empty until configured) |
| GET | `/api/subscription` | session | access state + entitlements |
| POST | `/api/subscription/checkout` | session | 503 until provider configured |
| POST | `/api/subscription/webhook` | provider | 503 until configured |

**[specified] — not built**: appointments, availability, webinar registration,
notifications (+ devices), preferences, account export/delete, dietitian profile,
support requests, admin/back-office.

### Database audit & migrations

**[done]** via Drizzle (`server/src/db`):

- Migration `0000_greedy_tempest.sql` — `user`, `session`, `account`,
  `verification`, `profile`.
- Migration `0001_bright_speed_demon.sql` — `content`, `saved_items`
  (unique `user_id,content_id`).
- Migration `0002_useful_skreet.sql` — `message_threads`, `messages`, `plans`,
  `subscriptions` (unique `user_id`), `entitlements` (unique `user_id,key`).

Audit notes: every user-owned table uses `ON DELETE cascade` to `user`; the
Drizzle adapter schema in `server/src/lib/auth.ts` maps only
`user/session/account/verification` (correct — do not add app tables there).
Migrations run automatically on startup (`server/src/index.ts`) and via
`npm run db:migrate`.

### Authentication — **[done core; email/push blocked]**

- Better Auth with email/password (min 8). Session cookie sent as `Cookie` by
  `src/lib/api-client.ts` (`authClient.getCookie()`).
- `trustedOrigins` includes `exp://*` and `truediet://*`.
- **Blocked**: production **HTTPS base URL** (currently `http://localhost:3000`,
  dev only), email provider (verification/reset), social providers (Google keys),
  and rate-limiting/brute-force policy.

### Secure user-data isolation — **[done]**

- All `/api/**` (except public content/plans/health) authenticate via
  `auth.api.getSession({ headers })` and scope queries to `session.user.id`.
- Ownership mismatch returns **404** (not 403) to avoid enumeration.
- Health fields (goal, allergies, dietary preferences, message bodies) are
  sensitive: never logged, not included in analytics, HTTPS-only in production.

### AI & external integrations — **[specified / blocked]**

- **Ask the Dietitian**: real messaging backend done; RD replies require a staff
  role/back-office (proposed `role` on `user`).
- **Voice meal logging**: needs a speech-to-text provider (e.g. on-device or a
  vendor API). **[blocked — provider + consent + data-processing agreement]**.
- **Any AI summarisation/coaching**: must not fabricate nutrition data; requires
  a defined, disclaimered scope and a data-processing agreement. **[blocked]**.

### Subscription architecture — **[done scaffold]**

- `plans` (no prices committed), `subscriptions` (status: free/active/trialing/
  past_due/canceled), `entitlements` (per-user keys). Server is the source of
  truth; UI locks are cosmetic. `hasEntitlement` gating for premium content is
  the next server step (currently only session-gated).

### RevenueCat / Apple IAP / Google Play Billing — **[specified — needs decisions]**

- **Digital in-app content (Premium library, classes, saved libraries)** sold to
  a user inside the app **must** use Apple In-App Purchase and Google Play
  Billing per store policy. Recommended: **RevenueCat** to abstract both stores
  and unify entitlements.
- **Professional services** (1:1 RD visits, packages) may use Stripe/web checkout.
- Flow: client purchases → store → RevenueCat → **server webhook** updates
  `subscriptions`/`entitlements`. Receipts are **verified server-side**; never
  trust the client.
- **Blocked**: Apple/Google/RevenueCat account keys, product/subscription IDs,
  and the free/paid feature split sign-off.

### Payment verification — **[specified]**

- Stripe: verify `Stripe-Signature` on `/api/subscription/webhook`; derive status
  from events; store `providerSubscriptionId`.
- RevenueCat/IAP: validate the purchased entitlement via the provider REST API /
  webhook `Authorization` secret; map to `entitlements`.
- Idempotency via provider event IDs; audit-log every state change.

### Notifications — **[specified / blocked]**

- Proposed `devices` (`userId`, `expoPushToken` unique, `platform`) and
  `notifications` tables; Expo push service. **[blocked — Apple/Google push
  credentials + notification policy]**.

### Privacy controls — **[specified]**

- Consent, data export (`data_export_jobs`), and account deletion
  (`user.deleteUser`) with re-auth; cascade removes related rows; cancel active
  subscription before removal. **Blocked**: legal copy + retention policy.

### Automated & end-to-end tests — **[specified — none exist]**

- Proposed: **server** — `vitest` + `supertest` against a test DB (auth-scoped
  endpoints, ownership 404s, premium gating, message validation).
- **client** — `jest-expo` + `@testing-library/react-native`.
- **E2E** — Maestro flows: onboarding → account → save content → send message.
- Not added yet because adding a test harness is a project-wide change; will
  implement on request.

### iOS / Android builds — **[blocked]**

- Use EAS Build. **Blocked** until the client supplies: app icon + splash image,
  `android.package`, `ios.bundleIdentifier`, Apple/Google signing credentials,
  and store listings. `app.json` currently lacks all of these.

### Deployment documentation — **[done — see below]**

```text
# server/.env  (never commit)
DATABASE_URL=postgres://user:pass@host:5432/truediet
BETTER_AUTH_SECRET=<32+ byte random>      # required by Better Auth
BETTER_AUTH_URL=https://api.example.com   # production HTTPS base URL
TRUSTED_ORIGINS=https://app.example.com
PORT=3000
# Optional, enables features:
GOOGLE_CLIENT_ID=...            # social login
GOOGLE_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...           # payments (server-side only)
PAYMENTS_ENABLED=true

# app  (.env / EAS secrets)
EXPO_PUBLIC_AUTH_URL=https://api.example.com   # must be HTTPS in production
```

Deploy: build `server` (`npm run build`), run migrations on release
(`npm run db:migrate`), run `npm start` behind HTTPS. Point `EXPO_PUBLIC_AUTH_URL`
at the HTTPS API and add the domain to `trustedOrigins`. Update the mobile deep-link
scheme `truediet` in the auth config if it changes.

---

## Missing requirements & client decisions

1. Email provider + from-address (verification/reset) — **blocker for 40/41**.
2. Legal copy for Terms, Privacy Policy, disclaimers — **blocker for 49/50**.
3. Payments: provider choice, keys, product IDs, free/paid feature split;
   RevenueCat for IAP — **blocker for 45/48**.
4. Scheduling + video provider and join-link policy — **blocker for 46**.
5. Push credentials + notification policy — **blocker for 48/notifications**.
6. App icon, splash image, `android.package`, `ios.bundleIdentifier`, signing
   credentials, store listings — **blocker for builds**.
7. Production HTTPS API domain.
8. Speech-to-text provider + consent — **blocker for voice logging**.
9. Data-retention policy + DPO/support contact.
10. Decide whether premium content is store-IAP (yes, if in-app digital).

---

## Completion report (honest status)

**Verified in this change (type-checks pass: server clean; app `src` clean):**

- [done] DB migrations `0001`/`0002` for content, saved, messaging, plans,
  subscriptions, entitlements.
- [done] API: content, saved, messages, plans/subscription scaffold (no hardcoded
  prices; provider-gated).
- [done] Real Better Auth for Login / Create Account / Password Recovery
  (replaced the old "Supabase" mock); Search wired to content search; DM the
  dietitian posts to the backend; messaging/subscription client libs.
- [done] Verified seed of client-approved content copy; list screens +
  SavedContent server-driven with static fallback.

**Specified, not built:** appointments, availability, webinar registration,
notifications/devices, preferences, account export/delete, dietitian profile,
support, admin/back-office, premium entitlement enforcement, thread rendering in
`MessageDetail`, real `Article` renderer, tests, E2E, builds.

**Not verified / not claimed:** anything requiring provider keys, production
HTTPS, store credentials, or a running Postgres — none was exercised here.

### Recommended next increments (in order)

1. Entitlement enforcement + `GET /api/subscription` wired into premium screens.
2. Notifications + preferences backend.
3. Expand the test suite (route/integration tests with a test DB).
4. App config (icon/splash/identifiers) once assets/IDs are supplied.

---

## Addendum — increments completed after initial Part 3

**[done, verified] Message conversation rendering (Screen 47)**

- `src/screens/extended/ExtendedScreens.tsx` — `MessageDetail` now renders the
  real thread: loads the newest thread via `GET /api/messages/threads` +
  `GET /api/messages/threads/:id`, shows bubbles (`You` / `Dietitian`), and posts
  follow-ups via `POST /api/messages`. States: loading · empty · messages ·
  error. Uses the existing messaging backend (owner-scoped).

**[done, verified] First server test harness**

- `server/src/lib/validation.ts` — pure, DB-free helpers (`normalizeEmail`,
  `isValidEmail`, `parseLimit`, `validateMessageBody`). `messages` and `content`
  routes now use them (single source of truth for validation).
- `server/src/lib/validation.test.ts` — 9 unit tests via Node's built-in
  `node:test` runner (no new dependencies).
- `server/package.json` — `npm test` runs `tsx --test src/lib/validation.test.ts`.

**Verification run**: `npm test` → 9 passed / 0 failed. Type-checks: server
(`server/` tsconfig) clean; app `src/` clean (root config still reports only the
four pre-existing `server/` dynamic-import notices, which the server's own
tsconfig resolves).

**Still pending from the recommended list**: entitlement enforcement wiring,
notifications + preferences backend, route/integration tests against a test DB,
and store build config.
