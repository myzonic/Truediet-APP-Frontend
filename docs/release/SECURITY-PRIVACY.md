# Security, privacy and store declarations

## 1. Data the app collects

| Data | Where it is stored | Why |
|---|---|---|
| Name, email | PostgreSQL `user` | Account identity |
| Password (hash only) | PostgreSQL `account.password`, scrypt | Sign-in |
| Google account id + tokens | PostgreSQL `account` (provider `google`) | Google sign-in |
| Session token | PostgreSQL `session` + device SecureStore | Staying signed in |
| Age, sex, height, weight, goal | PostgreSQL `profile` | Nutrition personalisation |
| Allergies, dietary preferences | PostgreSQL `profile` (`jsonb`) | Safety-relevant personalisation |
| Meal notes, hunger/fullness ratings, weight entries | `meal_logs`, `hunger_checkins`, `weight_entries` | Tracking the member asked for |
| Messages to the dietitian | `message_threads`, `messages` | Care delivery |
| Appointment details | `appointments` (Cal.com booking id, meeting URL) | Telehealth |
| Push token | `push_tokens` | Notifications |
| Notification/consent choices | `preferences` | Member control |

Health-adjacent data (allergies, weight, hunger ratings, messages) is
personal data and, in aggregate, health data. Treat it accordingly.

## 2. Protection in place

| Control | Implementation |
|---|---|
| Transport | HTTPS only; release builds cannot fall back to HTTP (compile-time guard, asserted by `scripts/verify-release-bundle.mjs`) |
| At rest (device) | Session cookie in `expo-secure-store` (Keychain / Android Keystore-backed) |
| At rest (server) | PostgreSQL on the Dokploy host; credentials only in server env |
| Backup | Android `allowBackup="false"` — app data is not copied to Google Drive |
| AuthZ | Every `/api/*` route derives the user from `auth.api.getSession` and filters by `session.user.id`; no route accepts a user id from the client |
| Password reset | 1-hour single-use token; all sessions revoked on reset |
| Password change | Requires the current password; revokes other sessions |
| Brute force | 10 sign-ins/min/IP (verified live: 429 after 10) |
| Enumeration | Reset endpoint identical for known/unknown emails (verified live) |
| Account deletion | `DELETE /api/account`, cascades to every owned table |
| Data export | `GET /api/account/export` returns the member's own rows only |
| Logging | No password, token or message body is logged; `[email]` lines carry recipient + message id only |
| Secrets in bundle | None (verified by scanning the compiled Hermes bundle) |

## 3. Third parties (each needs a privacy-policy entry)

| Processor | Data | Notes |
|---|---|---|
| Hosting (Dokploy VPS) | All server data + database | Self-managed; no BAA signed |
| Hostinger Titan email | Email address, verification/reset links | Transactional only |
| Cal.com | Name, email, time zone, visit type, booking time | Scheduling source of truth |
| Google Identity | Email, name, profile image on Google sign-in | OAuth, server-side code exchange |
| Expo push service | Push token, notification text | Only after `EXPO_ACCESS_TOKEN` is set |

## 4. Permissions requested

| Permission | Reason shown to the user |
|---|---|
| `RECORD_AUDIO` | Voice meal note; microphone also required if a video visit joins a call |
| `CAMERA` | Video nutrition consultations |
| `POST_NOTIFICATIONS` | Message replies, appointment reminders |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Core networking |
| `MODIFY_AUDIO_SETTINGS`, `WAKE_LOCK`, `VIBRATE` | Playback and notification behaviour |

Removed from the release manifest because nothing uses them: overlay
(`SYSTEM_ALERT_WINDOW`), `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`,
Bluetooth set. Removing them avoids extra Play declarations and review
questions.

iOS usage strings already exist for microphone and camera, and
`ITSAppUsesNonExemptEncryption` is `false` (standard HTTPS only).

## 5. Store declarations to complete at submission

**Google Play → Data safety**
- Collects: name, email, health info, messages, app activity (meal logs)
- Encrypted in transit: yes
- Deletable by the user: yes (in-app, Privacy → Delete my account)
- Shared with third parties: Cal.com (scheduling), Google (sign-in), Expo
  (push) — declared as service providers
- Data used for advertising: no

**Apple → App Privacy**
- Linked to identity: contact info, health/fitness, user content (messages),
  identifiers
- Tracking: no
- Data deletion: in-app deletion available

## 6. HIPAA position — read before launch

The welcome screen displays **“HIPAA-Compliant · Evidence-Based Protocol”**.
Per the project instruction that text is unchanged. Shipping that claim
requires, at minimum:

1. Business Associate Agreements with every processor that can see protected
   health information (hosting, email, Cal.com, Expo, Google).
2. Documented access controls, audit logging and breach procedures.
3. A risk analysis and documented safeguards (Security Rule).
4. Workforce training and a named security officer.

None of those exist in this repository, and a technical review cannot create
them. Until they do, the claim is a legal and store-review risk. Options, in
order of preference:

1. Complete the BAAs and policy work, then keep the claim.
2. Change the text to something defensible such as
   “Evidence-Based Protocol · Secure by Design”.
3. Accept the risk explicitly in writing.

This is called out again in `RELEASE-CHECKLIST.md` because it is the single
biggest non-technical blocker in the project.

## 7. Residual technical risks

| Risk | Mitigation / status |
|---|---|
| Rate-limit counters are in-memory per instance | Acceptable for a single container; move to `database` storage if scaled out |
| No DMARC record on `true-diet.com` | Add `v=DMARC1; p=none; rua=mailto:dmarc@true-diet.com` |
| `verification` rows have no FK to `user` | Expire and are deleted on use; pre-existing design |
| Push token is device-scoped, not rotated on sign-out | Token is removed on account deletion via cascade; consider clearing on sign-out |
| Public health endpoint exposes config flags | Booleans only, no secrets |
