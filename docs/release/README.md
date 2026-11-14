# TrueDiet production release

This folder holds the release artefacts for the TrueDiet app. Every statement
here is either **Verified** (a command was run, a file exists, or a live
endpoint answered) or explicitly marked **Pending** / **Blocked**. Nothing is
marked verified from inspection alone.

| Document | Covers |
|---|---|
| `AUTH.md` | Authentication architecture, changes, live test results, security review |
| `PUSH.md` | Push notification system, API results, Android/iOS credential status |
| `QA-SCREENS.md` | Screen-by-screen and functional verification |
| `RESPONSIVE.md` | Device classes, safe areas, tablet layout |
| `ANDROID-BUILD.md` | Native Gradle build, signing, artefacts |
| `BACKEND.md` | API, database and production configuration |
| `SECURITY-PRIVACY.md` | Data handling, store declarations, compliance limits |
| `RELEASE-CHECKLIST.md` | What is done, what is outstanding |

## Environment of record

| Item | Value |
|---|---|
| Frontend repo | `myzonic/Truediet-APP-Frontend` |
| Backend repo | `myzonic/Truediet-APP-Backend` |
| API | `https://api.true-diet.com` |
| Expo SDK | 52 (`expo ~52.0.0`) |
| React Native | 0.76.0 |
| React | 18.3.1 |
| Android package | `com.truediet.truedietwelcome` |
| iOS bundle id | `com.truediet.truedietwelcome` |
| Android compile/target SDK | 35 / 35 |
| Min SDK | 24 (Android 7.0) |
| Kotlin | 1.9.25 |
| JS engine | Hermes |
| New architecture | disabled (matches the tested dev client) |

## Build host

Windows 11, JDK 17 (Temurin 17.0.21) and the Android SDK command-line tools
installed on `F:` because `C:` has no free space for a Gradle build. No Android
Studio is used, and no EAS build is used for Android.
