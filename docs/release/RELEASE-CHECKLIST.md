# Release checklist

Status meanings: **Done** = executed and verified · **Pending** = work remains
· **Blocked** = needs something outside this environment · **Risk** = a
deliberate decision with a known downside.

## A. Application

| Item | Status | Evidence |
|---|---|---|
| Every route registered and reachable | Done | Navigation target scan: 0 unregistered `navigate()` targets |
| Dead button fixed (`View my conversation`) | Done | `MessageDetail` route added |
| Corrupted characters in UI text | Done | 17 mojibake sequences repaired; scan now 0 |
| Placeholder copy removed from member-facing screens | Done | No "once X is connected" strings remain in shipped screens |
| Sample library items labelled | Done | `SAMPLE_PREVIEW_NOTICE` shown when fallbacks are used |
| Icon-only buttons labelled for screen readers | Done | 11 back buttons + notification bell |
| TypeScript clean | Done | `tsc --noEmit` frontend and backend |
| Production JS bundle builds | Done | Android + iOS Hermes bundles exported |
| No dev URL or secret in bundle | Done | `scripts/verify-release-bundle.mjs` |

## B. Authentication

| Item | Status | Evidence |
|---|---|---|
| Email/password sign-up, sign-in, sign-out | Done | 14/14 live checks |
| Email verification + resend | Done | Live reset/verification endpoints 200; mail delivered |
| Password reset (1 h single-use token) | Done | Live request accepted, page rendered by server |
| Password change | Done | Settings → Account panel (`changePassword`, revokes other sessions) |
| Duplicate email handling | Done | 422 + "sign in instead" affordance |
| Rate limiting / brute force | Done | Live: 429 after 10 failed sign-ins |
| Account enumeration | Done | Reset identical for known/unknown email |
| Session persistence | Done | SecureStore + restore on launch + offline tolerance |
| Google sign-in | Pending | Configured and enabled; needs a device round-trip |
| Account linking policy | Done | Explicit: Google only, requires locally verified email |

## C. Android

| Item | Status | Evidence |
|---|---|---|
| Native project generated (`expo prebuild`) | Done | `android/` committed |
| Package / version code / version name | Done | `com.truediet.truedietwelcome`, code 1, name 1.0.0 |
| Target SDK for Play (35) | Done | `gradle.properties` 35/35 |
| Launcher + store icons | Done | Generated from brand logo into `mipmap-*` |
| Permissions trimmed | Done | No overlay / external storage / Bluetooth |
| Release keystore | Done | `android/keystore/truediet-upload.jks` (gitignored) |
| Signed release APK | Done | `android/app/build/outputs/apk/release/app-release.apk`, 151.1 MB, signed `CN=True Diet` |
| Signed release AAB | Done | `app-release.aab`, 75.9 MB, `jarsigner -verify` → `jar verified`, signed `CN=True Diet` |
| Release bundle has no dev URL / secret | Done | Extracted `index.android.bundle` from the APK: 0 hits for `localhost:3000`, `10.0.2.2`, `192.168.`; 1 hit for `https://api.true-diet.com` |
| Install + auth on a real device | Pending | No device attached to this environment (`adb devices` empty) |
| Play Console listing, data safety, screenshots | Pending | Requires the Play account |

## D. iOS

| Item | Status | Evidence |
|---|---|---|
| Bundle id, build number, privacy strings | Done | `app.json` |
| Icons and launch screen | Done | Same generated assets |
| Archive / TestFlight | Blocked | Needs macOS + Xcode + Apple Developer account |
| iOS auth round-trip | Blocked | Same |

## E. Compliance and business

| Item | Status | Note |
|---|---|---|
| In-app account deletion | Done | `DELETE /api/account`, cascades |
| Data export | Done | `/api/account/export` |
| Privacy policy / terms URLs | Pending | Text exists in-app; Play and App Store Connect need public URLs |
| HIPAA claim on Welcome screen | Risk | Claim retained per instruction; BAAs and policy work do not exist. See `SECURITY-PRIVACY.md` §6 |
| Payments / purchase path | Risk | Deliberate choice to keep as-is. No IAP provider, checkout 503. Apple 3.1.1 and Play Payments policy may reject digital-content sales without store billing |
| DMARC record | Pending | SPF and DKIM present; DMARC absent |
| Cal.com webhook subscriber | Pending | Not registered in the Cal dashboard, so booking changes do not sync back |
| EAS push token | Pending | `EXPO_ACCESS_TOKEN` not set in Dokploy |

## F. Before you submit

1. Produce and install the signed APK; run the auth + layout matrix on at
   least one small phone, one large phone and one tablet.
2. Generate the AAB and upload it to Play internal testing.
3. Publish the privacy policy and terms at public HTTPS URLs.
4. Decide the HIPAA wording (see the three options in `SECURITY-PRIVACY.md`).
5. Decide the payments position before submitting, not after rejection.
6. Add DMARC and register the Cal.com webhook.
7. For iOS: archive on a Mac with the Apple Developer account, then TestFlight.
