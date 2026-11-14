# Backend and API verification

## 1. Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js + Hono |
| ORM | Drizzle |
| Database | PostgreSQL (Dokploy host `true-diet-bwnpem:5432`, database `TDDB`) |
| Auth | Better Auth 1.7.18 (`emailAndPassword` + Google), Expo plugin |
| Deploy | Dokploy, auto-deploy on push to `main` of the backend repo |
| Public URL | `https://api.true-diet.com` (Traefik in front) |

## 2. Live health check

```
GET https://api.true-diet.com/health

{"status":"ok","database":"connected","schema":"complete","tablesPresent":19,
 "emailVerificationEnabled":true,"emailVerificationEnvSet":true,
 "emailTransport":"smtp","emailSmtpConfigured":true,"googleSignInEnabled":true}
```

`/health` counts real tables rather than just pinging the connection, so a
missing table reports `degraded` instead of `ok`.

## 3. Endpoints

| Method | Path | Auth | Verified |
|---|---|---|---|
| GET | `/health` | none | live, 200 |
| POST/GET | `/api/auth/**` | Better Auth | live (14 checks) |
| GET | `/reset`, `/verify-email` | token in query | server-rendered pages |
| GET/POST | `/api/profile` | session | live: 401 anon, 200 with session |
| GET | `/api/content` | none (premium bodies gated) | live, 18 articles, bodies for non-premium |
| GET | `/api/content/:slug` | session for premium | live: premium → 401 |
| GET/POST | `/api/track/meals`, `/api/track/checkins`, `/api/track/weight` | session | route guards verified |
| GET | `/api/track/progress` | session | route guards verified |
| GET/POST | `/api/saved` | session | route guards verified |
| GET/POST | `/api/messages`, `/api/messages/:threadId` | session | route guards verified |
| POST | `/api/messages/:threadId/reply` | `x-dietitian-key` | staff-only |
| GET/POST | `/api/appointments` | session | route guards verified |
| GET | `/api/cal/slots`, `/api/cal/config` | session | Cal.com 9–5 ET schedule |
| POST | `/api/webhooks/calcom` | HMAC `X-Cal-Signature-256` | signature verified |
| GET | `/api/plans` | none | live, 3 plans |
| GET | `/api/subscription` | session | route guards verified |
| POST | `/api/subscription/checkout` | session | returns 503 by design (no payment provider) |
| GET | `/api/account/export` | session | member-scoped |
| DELETE | `/api/account` | session | cascade delete, used by the live test |
| POST | `/api/push/register` | session | EAS token required |

## 4. Database

19 tables, all expected tables present (`schema: complete`):

`user`, `account`, `session`, `verification`, `profile`, `content`,
`saved_items`, `message_threads`, `messages`, `plans`, `subscriptions`,
`entitlements`, `preferences`, `meal_logs`, `hunger_checkins`, `weight_entries`,
`push_tokens`, `appointments`, `registrations`.

Relationship rules:

- Every member-owned table references `user.id` with `ON DELETE CASCADE`
- `profile.user_id` is UNIQUE (one profile per member)
- `user.email` is UNIQUE
- `session.token` is UNIQUE; index on `session.user_id`
- `content.slug` is UNIQUE

No migration was required for the auth hardening. The latest existing
migration is `0013` (weight entries).

## 5. Production configuration (names only)

| Variable | Purpose | State |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection | set |
| `BETTER_AUTH_SECRET` | signing/encryption key | set |
| `BETTER_AUTH_URL` | `https://api.true-diet.com` | set |
| `TRUSTED_ORIGINS` | extra allowed origins | optional |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth | set (flag true) |
| `EMAIL_VERIFICATION_ENABLED` | send verification on sign-up | `true` |
| `EMAIL_TRANSPORT` | `smtp` or `json` | `smtp` |
| `SMTP_HOST/USER/PASS/PORT/SECURE`, `EMAIL_FROM` | Titan mail | set, handshake OK |
| `DIETITIAN_API_KEY` | `/staff` and reply endpoint | set |
| `CAL_API_KEY`, `CAL_EVENT_TYPE_ID_*`, `CAL_WEBHOOK_SECRET` | scheduling | set |
| `EXPO_ACCESS_TOKEN` | EAS push | **not set** — push delivery pending |

## 6. Application behaviour verified against production

- Content list returns 18 published articles with bodies for non-premium items
  and no premium body leak; premium detail returns 401 without entitlement.
- Plans return three services with `priceCents: null`, rendered as
  "Contact for pricing" rather than a fake price.
- Auth: 14/14 live checks (see `AUTH.md`).
- Unit tests: 32/32 (`npm test` in `server/`).
- Rate limiting: 10 failed sign-ins → HTTP 429 (verified live).

## 7. Deployment notes

- Backend deploys on push to `main`. Two deploys were made during this work
  (`311a6e7` health transport reporting, `ddaeb1b` auth hardening); each was
  followed by a health check and the live auth suite.
- No database reset, no destructive migration, no credential rotation.
- Rollback: revert the commit and push; Dokploy redeploys the previous image.
  No schema change means no data rollback is needed.
