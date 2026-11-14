# Responsive design and device compatibility

## What changed

**Safe areas (all 24 screens).** Every screen imported `SafeAreaView` from
`react-native`, which only applies insets on iOS — on Android it is a plain
`View`. With targetSdk 35 (required by Google Play) Android 15 draws the app
edge-to-edge, so content would have run under the status bar and gesture bar.
All screens now use `react-native-safe-area-context`, and `SafeAreaProvider`
wraps the app.

**Content column.** Every screen had a hard-coded `maxWidth: 412`
(a single phone's logical width). That is now `CONTENT_MAX_WIDTH` in
`src/theme/layout.ts`:

```ts
CONTENT_MAX_WIDTH = Math.min(560, windowWidth)
```

- 360–430 dp phones: full width, unchanged appearance
- 600 dp+ tablets and unfolded foldables: centred 560 dp column instead of an
  edge-to-edge line of text

**Tab bar.** Was `height: 60, paddingBottom: 0`, which ignored the home
indicator on iPhone and the gesture bar on Android. It now uses
`useSafeAreaInsets()`:

```ts
height: 60 + insets.bottom
paddingBottom: insets.bottom
```

and shares `TAB_BAR_MAX_WIDTH` so it lines up with the content column on
tablets.

**Keyboard.** The two form-heavy screens (`AccountSetup`, `MealLog`) and the
message thread already used `KeyboardAvoidingView` (iOS `padding`) plus
`keyboardShouldPersistTaps="handled"`; that behaviour is unchanged.

**Text and touch targets.** Body copy 14–15 pt with 20–22 line height, section
titles 17–18 pt, screen titles 30 pt. Icon-only back buttons were 42×42 with
`hitSlop`; they now also carry `accessibilityRole="button"` and
`accessibilityLabel="Go back"` for TalkBack/VoiceOver. Text inputs are 52 pt
tall (above the 48 dp Android minimum). The password field gained a 44×44 eye
toggle.

**Orientation.** `app.json` locks portrait. Nothing in the app depends on
landscape, so the 560 dp cap is the only breakpoint that matters.

**Dark mode.** `userInterfaceStyle: "light"` — the app is light-only by
design. `expo-system-ui` is not installed, so Android system bars follow the
device theme rather than the app background; a cosmetic mismatch at most.

## Device classes covered by the layout maths

| Class | Width (dp) | Column | Result |
|---|---|---|---|
| Small Android (e.g. 5") | 360 | 360 | Full width, 24 dp padding |
| iPhone SE | 375 | 375 | Full width |
| iPhone 14/15 | 390–393 | 390–393 | Full width |
| iPhone Pro Max | 430 | 430 | Full width |
| Android tablet | 600–800 | 560 | Centred column |
| iPad portrait | 768–834 | 560 | Centred column |
| iPad landscape | 1024–1194 | 560 | Centred column (portrait-locked) |

## Not verified

No physical device or emulator was available in this environment, so the
matrix above is derived from the layout rules rather than photographed. The
release checklist requires a pass on at least one small phone, one large phone
and one tablet before submission.
