# Authentication: audit, changes and verification

Status legend: **Verified** = executed against the live production API on
2026-11-14 with the result shown. **Pending** = needs a signed device build or
an external account.

---

## 1. Architecture audit

```
Expo app (React Native 0.76)
  authClient  (@better-auth/expo)         src/lib/auth-client.ts
    baseURL   = EXPO_PUBLIC_AUTH_URL | https://api.true-diet.com (release)
    storage   = expo-secure-store         session cookie at rest
  AuthContext                            src/context/AuthContext.tsx
    getSession() on launch + on foreground return
  apiFetch  (cookie re-attached)          src/lib/api-client.ts

HTTPS  https://api.true-diet.com
  Hono  /api/auth/**  -> betterAuth.handler
  Hono  /api/**       -> session guard per route (auth.api.getSession)
  Drizzle ORM
  PostgreSQL (Dokploy, 19 tables)
```

Findings that shaped the work:

| # | Finding | Impact | Action |
|---|---|---|---|
| 1 | Rate limiting relied on Better Auth's defaults, which only apply in production | A staging deploy had no brute-force protection | Explicit `rateLimit` rules (see §2) |
| 2 | Client IP was taken from a default header while the API sits behind Traefik | All members could share one limit bucket | `advanced.ipAddress.ipAddressHeaders = ["x-forwarded-for"]` |
| 3 | Any thrown error in `getSession` cleared the session | Opening the app offline looked like being signed out | Cached identity + keep state on network failure |
| 4 | App always started on the welcome screen | Stored sessions existed but the UI ignored them | `RootNavigator` picks `Main` when a session exists |
| 5 | `saveProfile` always sent `isAssessmentComplete: Boolean(goal)` | A returning member's completed assessment could be reset to false by signing in | Only sent when an assessment was actually collected |
| 6 | Google button was only rendered in sign-in mode | No Google registration path | Rendered in both modes |
| 7 | No password change anywhere in the app | Members could not rotate a password | Settings → Account → Change password |
| 8 | No password visibility control | Typing a long password blind on mobile | Eye toggle with accessible label |

Kept as-is deliberately: Better Auth (no replacement), the PostgreSQL schema,
email/password as the primary method, Google as optional.

---

## 2. Backend changes — `server/src/lib/auth.ts`

```ts
emailAndPassword: { minPasswordLength: 8, maxPasswordLength: 128, ... }

session: { expiresIn: 7d, updateAge: 1d }

account: { accountLinking: { enabled: true, trustedProviders: ["google"] } }

rateLimit: {
  enabled: true, window: 60, max: 100,
  customRules: {
    "/sign-in/email":            { window: 60,  max: 10 },
    "/sign-up/email":            { window: 60,  max: 5  },
    "/sign-in/social":           { window: 60,  max: 15 },
    "/request-password-reset":   { window: 300, max: 5  },
    "/send-verification-email":  { window: 300, max: 5  },
    "/reset-password":           { window: 300, max: 10 },
    "/change-password":          { window: 300, max: 10 },
    "/delete-user":              { window: 300, max: 5  },
  },
}

advanced: {
  useSecureCookies: BETTER_AUTH_URL.startsWith("https://"),
  ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
}
```

`useSecureCookies` is derived from the base URL rather than `NODE_ENV`, because
a container that does not export `NODE_ENV` would silently lose the Secure
flag on cookies.

Account linking policy: only Google may link implicitly, and Better Auth's
`requireLocalEmailVerified` default (true) means the pre-existing local account
must have a verified email. That blocks the takeover path where an attacker
pre-registers an unverified account at a victim's address.

No schema change, no migration, no data reset.

---

## 3. Frontend changes

| File | Change |
|---|---|
| `src/context/AuthContext.tsx` | Offline-tolerant session restore, cached identity in SecureStore, foreground re-check (≤1/5 min), explicit `isAuthenticated` |
| `src/navigation/RootNavigator.tsx` | Entry point chosen once after the session check; spinner instead of a flash of onboarding |
| `src/screens/AccountSetupScreen.tsx` | Password visibility toggle, Google in both modes, "sign in instead" for a duplicate email, skip writing an empty assessment |
| `src/lib/profile.ts` | Omit `isAssessmentComplete` when no assessment was collected |
| `src/screens/profile/ProfileScreens.tsx` | Change-password panel (`changePassword` + `revokeOtherSessions`) |

Session storage: Better Auth Expo client writes the session cookie to
`expo-secure-store` (iOS Keychain / Android Keystore-backed storage). The app
never writes a token to AsyncStorage; only the non-sensitive cached identity
(id, name, email) is kept there for offline launch.

---

## 4. Email and password — Verified

Script: `scripts/auth-e2e.mjs` (real HTTPS requests to production).

| Check | Result |
|---|---|
| Unauthenticated `GET /api/profile` | 401 |
| Sign-up creates a user | 200 + user id |
| Session issued after sign-up | session present |
| Authenticated `GET /api/profile` | 200 |
| Duplicate email rejected | 422 |
| Wrong password rejected | 401 |
| Correct password signs in | 200 |
| Session restored after sign-in | session present |
| Password reset request accepted | 200 |
| Reset for unknown email indistinguishable | same status as known email |
| Sign-out | 200, session cleared on the next read |
| Test account deleted (`DELETE /api/account`) | 200 |

14/14 checks passed against the deployed backend.

Password hashing: Better Auth's default scrypt, stored in `account.password`.
No plain-text password path exists, and the column is never selected by any
app route.

---

## 5. Google Sign-In

Configured and enabled in production (`/health` → `googleSignInEnabled: true`,
callback `https://api.true-diet.com/api/auth/callback/google`).

Flow: `authClient.signIn.social({ provider: "google" })` → the Expo plugin
opens the provider page via the backend's expo-authorization-proxy → the
authorization code is exchanged **server-side** with the client secret → the
session cookie comes back to SecureStore.

Verified: the flow is reachable and the button renders (health flag true).
**Pending:** a completed Google round-trip on a signed device build. The
existing Google OAuth client and callback are unchanged.

Token verification: because the client never receives or forwards a Google ID
token, there is nothing for the app to trust. Issuer, audience, signature and
expiry are validated by Google during the server-side code exchange.

---

## 6. Database — no migration required

Existing better-auth tables are used unchanged:

| Table | Key constraints |
|---|---|
| `user` | `email` UNIQUE, `id` text PK |
| `account` | `user_id` FK → `user.id` ON DELETE CASCADE, `provider_id`, `password` |
| `session` | `token` UNIQUE, `user_id` FK → CASCADE, index on `user_id` |
| `verification` | token/expiry rows, deleted on use |
| `profile` | `user_id` UNIQUE + FK CASCADE |

`/health` reports `schema: complete`, 19/19 tables. No migration was added for
this work, so there is nothing to roll back.

Known caveat (pre-existing, unchanged): `verification` has no FK to `user`, so
verification rows are not removed by the cascade. They expire and are deleted
on use.

---

## 7. Session persistence

| Requirement | Status |
|---|---|
| Session persisted in SecureStore | Yes — Expo plugin storage |
| Restored after app restart | Yes — `RootNavigator` opens `Main` when a session exists |
| Survives a temporary network loss | Yes — cached identity, previous state kept |
| Refreshed while active | Yes — `updateAge` 1 day server-side; foreground check |
| Revoked session noticed | Yes — foreground re-check, and any 401 clears state |
| Cleared on sign-out | Yes — server sign-out + SecureStore delete |
| Auth screens protected | Yes — API routes 401 without a session; `Main` only entered with a user |

**Pending:** on-device confirmation of the above (needs the signed APK).

---

## 8. Security review

| Area | Finding |
|---|---|
| Transport | HTTPS only; release build cannot fall back to `http://localhost:3000` (compile-time `__DEV__` guard), asserted by `scripts/verify-release-bundle.mjs` |
| Secrets in bundle | None found: no DB URL, SMTP password, staff key or Stripe secret in the production bundle |
| Password storage | scrypt via Better Auth, never logged, never returned by any route |
| Reset tokens | 1 hour TTL, single use, stored in `verification` |
| Session revocation | Password reset revokes sessions; password change revokes other sessions |
| Enumeration | Reset endpoint returns the same status for known and unknown emails; sign-up reveals existence by design (standard UX trade-off) |
| Brute force | 10 sign-ins/min/IP, 5 sign-ups/min/IP — verified live (429 after 10) |
| CSRF | Better Auth origin checks + explicit CORS allow-list with `credentials: true` only for allowed origins |
| Logging | `[email]` lines contain the recipient and message id only — no token, no link, no credentials |
| Mobile storage | Session cookie in SecureStore; Android `allowBackup="false"` so app data is not copied to Google Drive |
| Oversharing | Profile export/delete are session-scoped; every route filters by `session.user.id` |

Residual risks to accept consciously:

- `GET /health` exposes configuration booleans (no secrets).
- Rate-limit storage is in-memory, so limits are per instance and reset on deploy.
- Google account linking requires a locally verified email; members who never
  verify cannot link Google to an existing password account (they can still
  sign in with Google if they registered that way).

---

## 9. Android release testing

**Pending** — requires the signed APK from `docs/release/ANDROID-BUILD.md`.
Planned matrix: sign-up, verification email, sign-in, kill/reopen persistence,
sign-out, Google, offline launch, wrong password, password change, account
deletion.

One Android-specific point already handled: with targetSdk 35 the system bars
overlay the window, so the auth screens use `react-native-safe-area-context`
rather than React Native's iOS-only `SafeAreaView`.

---

## 10. iOS configuration

- Bundle id: `com.truediet.truedietwelcome`
- Google: the web OAuth client is used because the flow runs in
  `ASWebAuthenticationSession`; no native Google SDK is required. If a native
  Google SDK is added later, an iOS OAuth client with the same bundle id must
  be created.
- Keychain: `expo-secure-store` uses the iOS Keychain; sessions survive app
  restarts and are removed on uninstall.
- Not verified on device — no macOS/Xcode available in this environment.

---

## 11. Modified files

Backend (`myzonic/Truediet-APP-Backend`):
- `src/lib/auth.ts`

Frontend (`myzonic/Truediet-APP-Frontend`):
- `src/context/AuthContext.tsx`
- `src/navigation/RootNavigator.tsx`
- `src/screens/AccountSetupScreen.tsx`
- `src/screens/profile/ProfileScreens.tsx`
- `src/lib/profile.ts`
- `scripts/auth-e2e.mjs` (new)
- `scripts/auth-ratelimit.mjs` (new)

---

## 12. Remaining deployment requirements

1. `EMAIL_VERIFICATION_ENABLED=true` is live; verification is optional at
   sign-in by design so unverified historical accounts keep working.
2. `TRUSTED_ORIGINS` should list any additional web origin that will call the
   API (the mobile scheme `truediet://` is already trusted).
3. `BETTER_AUTH_URL` must remain `https://api.true-diet.com`, otherwise
   Secure cookies and emailed links silently point elsewhere.
4. Publish a DMARC record (`v=DMARC1; p=none; rua=mailto:dmarc@true-diet.com`)
   to improve inbox placement for verification and reset mail.
5. On device: complete the §9 matrix on the signed APK.
