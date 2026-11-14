# Android release build (native Gradle)

No Android Studio and no EAS build are used. Everything below runs from a
Windows shell.

## 1. Toolchain installed for this build

| Component | Version | Location |
|---|---|---|
| JDK | Temurin 17.0.21+9 | `F:\tools\jdk17\jdk-17.0.21+9` |
| Android cmdline-tools | 11076708 (13.0) | `F:\Android\Sdk\cmdline-tools\latest` |
| Android platform | `android-35` | `F:\Android\Sdk\platforms\android-35` |
| Build tools | 35.0.0 | `F:\Android\Sdk\build-tools\35.0.0` |
| Platform tools | latest | `F:\Android\Sdk\platform-tools` |
| Gradle | 8.10.2 (wrapper) | downloaded to `F:\gradle-home` |
| Gradle user home | `F:\gradle-home` | keeps ~2 GB of caches off `C:` |

`C:` has under 1 GB free on this machine, which is why the SDK, Gradle cache
and the working copy live on `F:`.

## 2. Environment for every build

```powershell
$env:JAVA_HOME       = "F:\tools\jdk17\jdk-17.0.21+9"
$env:ANDROID_HOME    = "F:\Android\Sdk"
$env:ANDROID_SDK_ROOT = "F:\Android\Sdk"
$env:GRADLE_USER_HOME = "F:\gradle-home"
```

`android/local.properties` also contains `sdk.dir=F:\\Android\\Sdk` and is
gitignored, so local builds do not depend on the environment variables.

## 3. Signing

`android/keystore.properties` (gitignored, created by
`scripts/create-android-keystore.mjs`) points at
`android/keystore/truediet-upload.jks`.

`android/app/build.gradle` reads it when present and falls back to the debug
keystore when absent, so a fresh clone still builds.

> Back up `truediet-upload.jks` **and** `keystore.properties` offline. If the
> upload key is lost, Google Play will not accept further updates to an
> existing listing (you would need Play App Signing key reset).

## 4. Commands

```powershell
cd android
.\gradlew.bat assembleRelease     # APK
.\gradlew.bat bundleRelease       # AAB
```

Outputs:

```
android/app/build/outputs/apk/release/app-release.apk
android/app/build/outputs/bundle/release/app-release.aab
```

## 5. Versioning

| Field | Value | Where |
|---|---|---|
| applicationId | `com.truediet.truedietwelcome` | `app.json` → `android.package` |
| versionName | `1.0.0` | `app.json` → `expo.version` |
| versionCode | `1` | `app.json` → `android.versionCode` |
| compileSdk / targetSdk | 35 / 35 | `expo-build-properties` → `gradle.properties` |
| minSdk | 24 | RN 0.76 default |

Every Play upload needs a higher `versionCode`. Change it in `app.json` and
re-run `npx expo prebuild -p android` (or edit `android/app/build.gradle`)
before the next submission.

## 6. What the release build contains

- Hermes bytecode bundle produced by `expo export:embed` — no Metro server,
  no `localhost` URL (asserted by `scripts/verify-release-bundle.mjs`)
- Production API `https://api.truediet...` — see the guard in
  `src/lib/api-client.ts` / `auth-client.ts`
- Launcher icons generated from `assets/truediet-logo.png`
- Permissions: INTERNET, ACCESS_NETWORK_STATE, RECORD_AUDIO, CAMERA,
  MODIFY_AUDIO_SETTINGS, POST_NOTIFICATIONS, WAKE_LOCK, VIBRATE

## 7. Build result

```
BUILD SUCCESSFUL in 1h 53s
1231 actionable tasks: 1231 executed
```

| Artefact | Path | Size |
|---|---|---|
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` | 151.1 MB |
| SHA-256 | `58CB9B50ED56A8836351E96BFFB4EA5E25BE276BABA69A1CC983683F3AD1E93B` | — |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` | 75.9 MB |
| AAB signature | `jarsigner -verify` → `jar verified`, signed `CN=True Diet` | — |

Published copies (gitignored, ready to hand to the store):

```
deliverables/TrueDiet-1.0.0-release.apk     151.1 MB  sha256 58cb9b50…d1e93b
deliverables/TrueDiet-1.0.0-release.aab      75.9 MB  sha256 dcabed92…95aa0
deliverables/SHA256SUMS.txt
```

`bundleRelease` completed in 3m 53s (incremental after the APK build).

Verified with `aapt2 dump badging` and `apksigner verify --print-certs`:

| Property | Value |
|---|---|
| package | `com.truediet.truedietwelcome` |
| versionCode / versionName | `1` / `1.0.0` |
| compileSdk / targetSdk / minSdk | 35 / 35 / 24 |
| application-label | `True Diet` |
| Signer | `CN=True Diet, OU=Mobile, O=True Diet, L=New York, ST=NY, C=US` |
| Certificate SHA-256 | `0c2e06cc9462b60be2cda93a278d4cdcb986a8234f3a2158c8571a3f8f0ab6e3` |

The APK is 151 MB because it contains every ABI plus the on-device speech
model support libraries. The AAB is what Play serves; Play splits it per
device, so an actual install downloads far less.

Permissions in the built APK:

- Declared by this app: `INTERNET`, `ACCESS_NETWORK_STATE`, `RECORD_AUDIO`,
  `CAMERA`, `MODIFY_AUDIO_SETTINGS`, `POST_NOTIFICATIONS`, `WAKE_LOCK`,
  `VIBRATE`
- Added by libraries: notification badge permissions (Samsung/HTC/Sony/Huawei/
  Oppo launchers), `RECEIVE_BOOT_COMPLETED`, `ACCESS_WIFI_STATE`,
  `C2DM_RECEIVE` (FCM), `USE_BIOMETRIC`/`USE_FINGERPRINT` (SecureStore)
- Confirmed **absent**: `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`,
  `WRITE_EXTERNAL_STORAGE`, Bluetooth set

The overlay permission removal worked — it does not appear in the built
manifest even though a dependency declares it.

