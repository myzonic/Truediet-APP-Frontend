# Push notifications

## 1. What this system does

Push is driven entirely by real backend events. There is no sample-data
notification, no external messaging vendor, and no extra service: the app uses
`expo-notifications` and the backend calls Expo's push API directly.

```
event (route)  →  sendPushToUser(userId, {category, title, body, data, dedupeKey})
                     ├─ preference check (preferences.notifications)
                     ├─ active device tokens (push_tokens.is_active)
                     ├─ dedupe ledger (notification_log unique key)
                     ├─ Expo /push/send in batches of 100, retry 429/5xx (max 3)
                     ├─ tickets → deactivate DeviceNotRegistered tokens
                     └─ receipts (+5 min sweep) → deactivate, mark checked
```

## 2. Files

**Backend** (`server/`)

| File | Change |
|---|---|
| `src/lib/push.ts` | Rewritten: preferences, batching, retries, tickets, receipts, sweeper, 24 h appointment reminders |
| `src/routes/push.ts` | Device metadata, reactivation, sign-out endpoint, history endpoint |
| `src/routes/preferences.ts` | Added `tracking`, `media`, `security` keys + defaults |
| `src/routes/appointments.ts` | Confirmed / rescheduled / cancelled pushes |
| `src/routes/messages.ts` | Dietitian reply now carries `category: "messages"` |
| `src/index.ts` | Starts the receipt/reminder worker; health expects 20 tables |
| `src/db/schema.ts` | `push_tokens` columns + `notification_log` table |
| `src/db/migrations/0014_push_notifications.sql` | Idempotent migration |
| `src/db/migrations/meta/_journal.json` | Journal entry 14 |

**App** (`src/`)

| File | Change |
|---|---|
| `src/lib/notifications.ts` | Rewritten: permission explainer flow, 6 Android channels, stable device id, token rotation, unregister on sign-out, tap-target resolver |
| `App.tsx` | Notification tap routing (foreground/background) and cold-start handling |
| `src/context/AuthContext.tsx` | Unregisters the device before signing out |
| `src/navigation/ref.ts` | Typed navigation ref |
| `src/screens/utility/UtilityScreens.tsx` | Real permission state, registered-device count, history list |
| `src/screens/profile/ProfileScreens.tsx` | Seven category toggles; security is always on |

No new npm dependencies. `expo-notifications ~0.29.14`, `expo-device`, and
`expo-constants` were already present and are the SDK 52–compatible versions.

## 3. Database

Migration `0014` (runs at boot, idempotent):

- `push_tokens`: `device_id`, `is_active`, `updated_at`, `last_seen_at`,
  `last_success_at`, `last_error`, index on `(user_id, is_active)`
- `notification_log`: `id`, `user_id` (FK cascade), `category`, `title`,
  `body`, `data`, `dedupe_key`, `deliveries`, `tickets`, `receipt_checked_at`,
  `created_at`; unique index on `(user_id, dedupe_key)`; index on
  `(user_id, created_at)`

Verified in production: `/health` → `schema: "complete"`, `tablesPresent: 20`.

## 4. API

| Method | Path | Purpose | Verified |
|---|---|---|---|
| POST | `/api/push-tokens` | Register/refresh `{token, platform, deviceId}` | live 201 |
| GET | `/api/push-tokens` | This member's devices | live |
| DELETE | `/api/push-tokens/:token` | Unregister one device | live |
| POST | `/api/push-tokens/sign-out` | Remove by `deviceId` or `token` | code |
| GET | `/api/push-tokens/history` | Last 50 notifications | live |
| GET | `/api/preferences` | Notification categories | live |
| PUT | `/api/preferences` | Update categories | live |

All go through the Better Auth session middleware. A token already owned by
another account returns **409** and is never reassigned (verified live).

## 5. Categories and triggers

| Category | Trigger | Status |
|---|---|---|
| `messages` | Dietitian replies via `/staff` | **Live** |
| `appointments` | Booking confirmed | **Live** (real booking id only) |
| `appointments` | Rescheduled (same booking, new slot) | **Live** |
| `appointments` | Cancelled (PATCH `status: cancelled`, or DELETE) | **Live** |
| `appointments` | 24 h reminder | **Live** (5-minute worker) |
| `webinars` | Registration / upcoming session | Not wired — no scheduled-session source in the DB |
| `content` / `media` | New article, myth, podcast, recipe | Not wired — there is no publish/admin endpoint to hook |
| `tracking` | Daily logging nudge | Not wired — no timezone stored per member, so a "daily" push would fire at the wrong hour |
| `security` | Password change / email verification | Email already covers these; push would duplicate. The category exists and is always on |

Notifications are never based on fabricated content. A category without a real
backend event stays silent.

## 6. Preferences

Stored in `preferences.notifications` (jsonb): `push`, `messages`,
`appointments`, `webinars`, `content`, `tracking`, `media`, `security`.

- The master `push` switch wins over every category.
- `security` cannot be disabled; the service returns `true` for it even if the
  stored value is false.
- Defaults: messages/appointments/webinars/security on; content/tracking/media
  off.
- Enforced server-side before any token is read (verified live).

## 7. Android configuration

| Item | Status |
|---|---|
| `POST_NOTIFICATIONS` permission | Declared |
| Channels | `messages` (MAX), `appointments` (HIGH), `content`, `tracking`, `security`, `default` — created at app start |
| Sound / vibration / light | Default sound, vibration pattern, `#64A826` light |
| Icons | Launcher icon used; no separate small icon asset |
| `google-services.json` | **MISSING** |
| Google Services Gradle plugin | **NOT APPLIED** |

Because the local Gradle build has no Firebase config, Android **cannot**
obtain an FCM push token yet. `getExpoPushTokenAsync` fails and the app reports
it in the Notifications screen instead of pretending success.

To fix, one of:

1. Firebase console → add Android app `com.truediet.truedietwelcome` → download
   `google-services.json` → place at `android/app/google-services.json`.
2. `npx eas credentials` → Android → download the FCM credentials that the
   earlier EAS build used.

Then rebuild. No code change is needed.

## 8. iOS configuration

- `expo-notifications` is configured; permission strings are not required for
  push (only for microphone/camera, which exist).
- Delivery needs an **APNs key** uploaded to EAS for the project
  (`36b5446e-e719-4daa-bd44-aaa7632ec9b9`).
- Not tested: no macOS/Xcode or iOS device in this environment.

## 9. Credentials

| Credential | Needed for | State |
|---|---|---|
| EAS project id `36b5446e-…` | token minting | present in `app.json` |
| `google-services.json` (FCM) | Android delivery | **missing** |
| APNs key (EAS) | iOS delivery | unverified |
| `EXPO_ACCESS_TOKEN` | only if push security is enabled on the Expo project | not set; not required by default |

`EXPO_ACCESS_TOKEN` is optional: the code sends an `Authorization` header when
it is present but works without it unless the Expo project enables enhanced
push security.

## 10. Test results

**Backend API — 15/15 live checks** against production (`scripts/push-e2e.mjs`):
session required, invalid token rejected, invalid platform rejected, valid
registration, idempotent repeat, active listing, history isolation, tracking
and media preference persistence, security stays enabled, cross-account
ownership rejected (409), unregistration, account cleanup.

**Android delivery — blocked**, not passed. The signed build lacks FCM
configuration, so a real push cannot arrive until `google-services.json` is
added and the app rebuilt. No claim of delivered notifications is made.

**Foreground / background / terminated handling, tap navigation** — the code
paths exist and compile, but they cannot be exercised without a delivered
push. Marked untested.

**iOS** — untested.

## 11. Security notes

- Notification bodies never contain meal contents, weight, lab values or
  message text beyond the dietitian's own reply preview (truncated to 140
  characters).
- A device token cannot be claimed by another account (409, verified).
- Tokens are deleted on sign-out, not just deactivated, so a shared phone does
  not keep receiving the previous member's notifications.
- `DeviceNotRegistered` deactivates the token at both ticket and receipt stage.
- Logs never include a token, an email address or a message body.
- The backend never trusts a client-supplied user id; the owner comes from the
  session.

## 12. Remaining work

1. Add `google-services.json` and rebuild (Android delivery).
2. Upload the APNs key to EAS (iOS delivery).
3. Optional: store a member timezone if daily tracking reminders are wanted.
4. Optional: add these triggers once their sources exist — webinar sessions,
   content publishing, podcast/recipe publishing, unread-message reminders.
