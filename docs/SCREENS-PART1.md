# True Diet — Screen Specifications: PART 1 (Screens 1–18)

Audited against the actual codebase. No app code modified. Where a proposed screen does not
exist, it is flagged — no content invented. Exact copy is quoted from source.

## 0. Proposed list -> actual codebase mapping

| # | Proposed name | Actual route | Component / file | Status |
|---|---|---|---|---|
| 1 | Welcome | `Welcome` | `screens/WelcomeScreen.tsx` | real |
| 2 | Nutrition Goals | `Goal` | `screens/GoalScreen.tsx` | real |
| 3 | Personal Details | `PersonalDetails` | `screens/PersonalDetailsScreen.tsx` | real |
| 4 | Allergies | `Allergies` | `screens/AllergiesScreen.tsx` | real |
| 5 | Dietary Preferences | `DietaryPreferences` | `screens/DietaryPreferencesScreen.tsx` | real |
| 6 | Profile Processing | `BuildingProfile` | `screens/BuildingProfileScreen.tsx` | real |
| 7 | Profile Ready | — | — | MISSING |
| 8 | Create Account | `AccountSetup` | `screens/AccountSetupScreen.tsx` | real |
| 9 | Assessment Results | `NutritionProfile` | `screens/NutritionProfileScreen.tsx` | real (title differs) |
| 10 | Home Dashboard | `Home` | `screens/home/HomeScreen.tsx` | real |
| 11 | Education Hub | `Learn` | `screens/learn/LearnScreen.tsx` | real |
| 12 | Article Detail | `Article` | `screens/main/PlaceholderScreens.tsx` | placeholder only |
| 13 | Resource Detail | `ResourceDetail` | `screens/extended/ExtendedScreens.tsx` | template |
| 14 | Recipe Discovery | `Recipes` | `screens/core/CoreFeatureScreens.tsx` | real (hardcoded) |
| 15 | Recipe Details | `RecipeDetail` | `screens/core/CoreFeatureScreens.tsx` | real (params) |
| 16 | Food Diary | `Track` + `MealLog` | `screens/track/TrackScreen.tsx`, `screens/track/MealLogScreen.tsx` | real (data hardcoded) |
| 17 | Voice Food Log | `VoiceFoodLog` | `screens/core/CoreFeatureScreens.tsx` | real (mock STT) |
| 18 | Progress Dashboard | `ProgressPatterns` | `screens/track/ProgressPatternsScreen.tsx` | real (data hardcoded) |

**Resolve before coding:** Screen 7 does not exist; Screen 12 is a stub; Screen 9's title is
"A clearer path starts here." not "Assessment Results"; Screen 16 is named "Track"/"Meal Log".

**Shared onboarding primitives:** `components/OnboardingLayout.tsx`, `components/OptionCard.tsx`.
Onboarding state is in-memory only (`context/OnboardingContext.tsx`).

---

## Screen 1 — Welcome
**Route / file:** `Welcome` · `src/screens/WelcomeScreen.tsx` · real.

**Exact content**
- Trust pill: `HIPAA-Compliant · Evidence-Based Protocol`
- Badge: `CLINICAL DIETETICS STANDARD`
- Logo: `assets/truediet-logo.png`
- Title: `Real Nutrition.` / `Real Science.` / `Real Results.` (final line orange)
- Body: "Cut through nutrition confusion with evidence-based guidance, practical tools, and personalized support from a Registered Dietitian."
- Feature grid: `Trusted Guidance`, `Expert Education`, `Track & Improve`, `Personalized Support`

**UI components:** `SafeAreaView, View, Image, Pressable, Text`; icons `ShieldCheck, BookOpen,
ChartNoAxesColumnIncreasing, UserRoundCheck`.

**Buttons / navigation**
| Control | Current | Required |
|---|---|---|
| `Get Started` | `navigate('Goal')` | -> `Goal` (keep) |
| `I Already Have an Account` | `navigate('Goal')` | -> `AccountSetup` sign-in (fix) |

**State / validation:** none. **API / DB:** none.
**Security / privacy:** HIPAA text retained (client decision; unchanged).
**Error states:** none.
**Acceptance tests:** cold start renders; both CTAs route correctly; layout holds small/large
devices; no font/logo crash.

---

## Screen 2 — Nutrition Goals (assessment step 1)
**Route / file:** `Goal` · `GoalScreen.tsx` · real.

**Exact content:** Title `What brings you to True Diet?` · Subtitle "Choose the nutrition goal
that feels most relevant right now."
**Options (single-select):** Eat Healthier · Manage My Weight · Improve Energy · Manage a Health
Condition · Understand Nutrition Better · Improve Fitness & Performance

**UI:** `OnboardingLayout step={1}` + `OptionCard` list.
**Buttons / navigation:** Back -> `goBack`; `Continue` (disabled until chosen) -> `PersonalDetails`.
**State:** `OnboardingContext.data.goal`. **Validation:** `continueDisabled = !data.goal`.
**API contract (required):** contribute `goal` to `POST /api/profile`. **DB:** `profile.goal`.
**Error states:** n/a (local).
**Acceptance tests:** Continue disabled until selection; value persists in context; shown on
Screen 9; back returns to Welcome.

---

## Screen 3 — Personal Details (step 2)
**Route / file:** `PersonalDetails` · `PersonalDetailsScreen.tsx` · real.

**Exact content:** Title `Tell us a little about you` · Subtitle "These details help make your
nutrition guidance more relevant."
**Fields:** `Age` (number-pad, "Enter your age"); `Sex` (Female/Male/Prefer not to say);
`Height` (`e.g. 5'7"`); `Weight` (decimal-pad, `e.g. 150 lb`).
**Validation:** `valid = age.trim() && sex && height.trim() && weight.trim()` — no range/unit checks.
**Buttons / navigation:** Back -> `Goal`; `Continue` (disabled unless valid) -> `Allergies`.
**State:** `age/sex/height/weight` in context.
**API (required):** `POST /api/profile { age, sex, height, weight }`.
**DB:** `profile.age/sex/height/weight`.
**Security / privacy:** body metrics (PHI) — consent + encryption-at-rest; no logging.
**Error states:** none today; add invalid-input messaging.
**Acceptance tests:** all fields required; correct keyboards; rejects non-numeric age; unit
normalization once specified; persists.

---

## Screen 4 — Allergies (step 3)
**Route / file:** `Allergies` · `AllergiesScreen.tsx` · real.

**Exact content:** Title `Any food allergies or intolerances?` · Subtitle "Select anything you
need to avoid so we can personalize your guidance."
**Options (multi):** None · Dairy · Gluten / Wheat · Peanuts · Tree Nuts · Eggs · Soy · Fish ·
Shellfish · Sesame · Other
**Logic:** `None` sets `['None']`; other selections remove `None`; toggle on/off.
**Buttons / navigation:** Back -> `PersonalDetails`; Continue (disabled if empty) -> `DietaryPreferences`.
**API (required):** `POST /api/profile { allergies }`. **DB:** `profile.allergies` (jsonb).
**Compliance:** never label content "allergy-safe" without validated ingredient data.
**Acceptance tests:** None mutually exclusive; empty blocked; selections persist; later filter recipes.

---

## Screen 5 — Dietary Preferences (step 4)
**Route / file:** `DietaryPreferences` · `DietaryPreferencesScreen.tsx` · real.

**Exact content:** Title `Do you follow a particular eating style?` · Subtitle "Choose any
preferences that apply. You can update these later."
**Options (multi):** No Specific Preference · Vegetarian · Vegan · Pescatarian · Mediterranean
Style · Plant Forward · Low-carb · High-protein · Gluten-free · Dairy-free · Halal · Kosher · Other
**Button:** label `Build My Profile` -> `BuildingProfile`; Back -> `Allergies`.
**API (required):** `POST /api/profile { dietaryPreferences }`. **DB:** `profile.dietaryPreferences`.
**Acceptance tests:** None mutually exclusive; label correct; proceeds.

---

## Screen 6 — Profile Processing
**Route / file:** `BuildingProfile` · `BuildingProfileScreen.tsx` · real (gesture disabled).

**Exact content:** Logo · Title `Building your nutrition profile` · Copy "We're organizing your
answers to personalize your True Diet experience." · checklist: Nutrition goals · Personal
details · Food allergies & intolerances · Dietary preferences.
**Behavior:** `Animated.timing` 1800ms -> `setTimeout 350ms` -> `navigation.replace('AccountSetup')`.
**Findings:** progress is cosmetic; no backend write; no timer cleanup.
**API (required):** perform real profile save here (or on Screen 8 success) with retry-on-failure.
**Error states (required):** save failure -> retry, not silent advance.
**Acceptance tests:** advances once; no double-nav; failure path retries; partial answers resumable.

---

## Screen 7 — Profile Ready — DOES NOT EXIST
No route, component, or content exists. Current flow: `BuildingProfile -> AccountSetup -> NutritionProfile`.
**Do not fabricate.** Confirm with product: (1) build a new screen; (2) merge/rename with Screen 9;
(3) drop from scope. No code should assume it exists until decided.

---

## Screen 8 — Create Account
**Route / file:** `AccountSetup` · `AccountSetupScreen.tsx` · real.

**Exact content:** Tabs `Create Account` / `Sign In`; eyebrow `CREATE YOUR ACCOUNT` /
`WELCOME BACK`; titles `Save your personalized plan.` / `Access your True Diet profile.`; copy
"Create your secure True Diet account to keep your learning, preferences, and progress in one
place." / "Log in with your existing account to sync your nutrition goals."; fields Full name
(signup), Email address, Password (minimum 8 characters); trust box "Your authentication
credentials and personal data are safely encrypted and secured."; benefits: "Save your
personalized nutrition profile" / "Keep your learning and tools together" / "Update your
preferences any time"; primary `Continue to My Profile` / `Sign In & Continue`; `Skip for now`.
**Validation:** `ready = email.includes('@') && password.length >= 8 && (!signup || name.trim().length > 1)`.
**Buttons / behavior**
| Control | Behavior |
|---|---|
| Continue (signup) | `authClient.signUp.email({name,email,password})` -> `refetchSession()` -> `NutritionProfile` |
| Continue (signin) | `authClient.signIn.email({email,password})` -> `NutritionProfile` |
| `Skip for now` | -> `NutritionProfile` (no account) |
**State:** `mode, name, email, password, loading, errorMessage`; `AuthContext.refetchSession`.
**API:** `POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email` (Better Auth).
**DB:** `user`, `account`, `session`; required add: create `profile` row.
**Security:** base URL is `http://localhost:3000` (kept for dev; must be HTTPS pre-release);
no client secrets; generic errors (avoid account enumeration).
**Error states:** inline error box + Alert for sign-up / sign-in / connection.
**Acceptance tests:** signup/signin work; duplicate email handled; invalid creds messaged; skip
lands on Screen 9; session persists after restart; network failure handled.

---

## Screen 9 — Assessment Results (actual title: "A clearer path starts here.")
**Route / file:** `NutritionProfile` · `NutritionProfileScreen.tsx` · real (gesture disabled).

**Exact content:** eyebrow `PERSONALIZED EDUCATION` · title `A clearer path starts here.` · copy
"Your profile guides the education and practical tools True Diet highlights for you." · rows
`Your focus` / `Dietary preferences` / `Allergy considerations` (fallback "Not selected") ·
`Recommended to explore`: Understanding food labels · Evidence behind nutrition claims · Mindful
eating tools · notice "True Diet provides education, not diagnosis or medical nutrition therapy."
· button `Go to Home`.
**Findings:** reads only from context (not `GET /api/profile`); recommended rows are `Pressable`
with no navigation.
**Buttons / navigation:** `Go to Home` -> `getParent('Root')?.replace('Main')`.
**API (required):** `GET /api/profile` to populate (returning users).
**Security / privacy:** disclaimer present (keep); no PHI in logs.
**Acceptance tests:** values from profile; recommended rows navigate; home transition works;
disclaimer visible; signed-in user sees saved data.

---

## Screen 10 — Home Dashboard
**Route / file:** `Home` · `screens/home/HomeScreen.tsx` · real.

**Exact content**
- Header: logo + greeting `Good morning`; bell button (not wired).
- Focus card: eyebrow `YOUR NUTRITION FOCUS`; title `{data.goal || 'Understand nutrition better'}`;
  copy "Your recommendations are personalized around the goals and preferences you selected.";
  inline `View your plan` (no handler).
- Section `Today's Insight` action `See all` -> `Learn`.
- Insight card: `NUTRITION BASICS`; "What Does a Balanced Meal Actually Look Like?"; copy "A
  balanced meal is not about perfection. Learn how foods work together to support energy and
  wellbeing."; `5 min read`; `Read ->` -> `Learn`.
- Section `Quick Tools` grid (each -> `navigation.getParent()?.navigate(...)`):
  - Balanced Meal / "Build your plate" -> `BalancedMeal`
  - Label Reading / "Understand labels" -> `LabelReading`
  - Hunger Scale / "Check in" -> `HungerFullness`
  - Myths & Facts / "Check evidence" -> `Myths`
  - Recipes / "Flexible meal ideas" -> `Recipes`
  - Ask Dietitian / "Secure support" -> `Dietitian`
  - Telehealth / "Book a visit" -> `Telehealth`

**API (required):** `GET /api/profile` + content (`GET /api/home`).
**Error / loading / empty:** none today -> add.
**Acceptance tests:** greeting real; bell opens Notifications; View your plan opens plan; tools
navigate; goal reflects profile.

---

## Screen 11 — Education Hub
**Route / file:** `Learn` · `screens/learn/LearnScreen.tsx` · real.

**Exact content:** eyebrow `LEARN` · title `Understand nutrition.` · copy "Clear, practical
nutrition education built around evidence — not trends or food rules." · search "Search nutrition
topics" (no handler) · section `Explore Topics` with 6 categories: Nutrition Basics / Calories &
Energy Balance / Macronutrients / Food Labels / Myths & Misinformation / Peptides & Supplements
(cards have no `onPress`) · banner `MYTHS & FACTS` "Heard a nutrition claim you're not sure
about?" -> `Myths`.
**API (required):** `GET /api/content/categories`, `GET /api/content?q=`. **DB:** content tables.
**Acceptance tests:** categories navigate to a list; search executes; banner opens Myths;
loading/empty/error states.

---

## Screen 12 — Article Detail — PLACEHOLDER ONLY
**Route / file:** `Article` -> `main/PlaceholderScreens.tsx` `TrackScreen` factory.
**Current:** renders title `Track` and copy "Practical check-ins, meal logging, and progress tools
are coming next." — wrong content; ignores article id; `Blog` items link here.
**No article body exists — do not invent.** Build reader via `GET /api/content/articles/:id`
(title, body, author, read time, last reviewed, related, save).
**DB (required):** `content`, `saved_items`.
**Acceptance tests:** open from Education Hub/Blog; real article renders; save/unsave persists;
loading/empty/error; health-content disclaimer.

---

## Screen 13 — Resource Detail
**Route / file:** `ResourceDetail` · `ExtendedScreens.tsx` (template).

**Exact content:** eyebrow `RESOURCE` · title `A practical nutrition guide.` · copy "Use this
evidence-based resource at your own pace. It is designed to help you build understanding, not
follow rigid food rules." · CTA `Save Resource` -> "Coming soon" alert.
**API (required):** `GET /api/resources/:id`, `POST /api/saved`. **DB:** content, `saved_items`.
**Acceptance tests:** real resource content; save persists; back works.

---

## Screen 14 — Recipe Discovery
**Route / file:** `Recipes` · `core/CoreFeatureScreens.tsx` · real (hardcoded).

**Exact content:** eyebrow `RECIPES` · title `Food ideas with flexibility.` · copy "Practical
recipes built around balance, variety, preferences and real life." · 3 recipes:
"Mediterranean Grain Bowl" (25 min · Plant-forward), "Salmon & Colorful Veg Plate" (30 min ·
High protein), "Overnight Oats with Fruit" (5 min · Breakfast) -> `RecipeDetail`.
**API (required):** `GET /api/recipes` (filtered by prefs/allergies). **DB:** `recipes`, `recipe_tags`.
**Compliance:** no allergy-safe labels without ingredient validation.
**Acceptance tests:** list from API; filters respect preferences; empty/loading/error states.

---

## Screen 15 — Recipe Details
**Route / file:** `RecipeDetail` · `core/CoreFeatureScreens.tsx` · real (params).

**Exact content:** title/meta/description from params · `Why it works` · `Simple structure`
(4 steps) · `Save Recipe` -> Alert only.
**API (required):** `GET /api/recipes/:id`; `POST /api/saved`. **DB:** `recipes`,
`recipe_ingredients`, `saved_items`.
**Acceptance tests:** full data renders; save persists; serving adjust (if in scope); allergy warnings.

---

## Screen 16 — Food Diary (actual: `Track` tab + `MealLog`)
**Files:** `screens/track/TrackScreen.tsx` (day view), `screens/track/MealLogScreen.tsx` (entry).

**Track — exact content:** eyebrow `TRACK` · title `Your day at a glance.` · copy "Notice patterns
in your eating, hunger and energy without turning nutrition into a numbers game." · hardcoded
stats (3 Meals / 2 Check-ins / Good Energy / 4/5 Awareness) · rows Breakfast/Lunch/Dinner/Snack ·
`Log a Meal` -> `MealLog` · `Voice Food Log` -> `VoiceFoodLog` · `Hunger & Fullness` ->
`HungerFullness` · `Progress & Patterns` -> `ProgressPatterns`.
**MealLog — exact content:** eyebrow `MEAL LOG` · title `What did you eat?` · copy "Record what
you ate without assigning foods a good or bad label." · Meal chips · `Food / Meal` textarea ·
`Add a meal photo` (no handler/permission) · Notes · `Add Hunger & Fullness Check-In` ->
`HungerFullness` · `Save Meal` -> Alert, no persistence.
**API (required):** `GET /api/logs?date=`, `POST/PATCH/DELETE /api/logs`. **DB:** `food_logs`, `check_ins`.
**Security / privacy:** food/health data private; scoped by user id.
**Error states:** loading/empty/error/offline (add).
**Acceptance tests:** create/edit/delete entries; photo attach with permission; day totals correct;
persists after restart; offline queue.

---

## Screen 17 — Voice Food Log
**Route / file:** `VoiceFoodLog` · `core/CoreFeatureScreens.tsx` · real (mock STT).

**Exact content:** eyebrow `VOICE FOOD LOG` · title `Tell us about your meal.` · copy "Speak
naturally. True Diet turns your words into a private meal note without scoring or judging food."
· mic button (`Tap to start recording` / `Tap to finish`) · `MEAL NOTE` area · note "Voice
transcription will be connected to a secure speech-to-text API before launch." · `Save Meal Note`
-> Alert.
**Findings:** transcript hardcoded on stop; no mic; no review/correction step.
**Compliance (brief §4.E):** must not silently save uncertain interpretations as verified data ->
require review/confirm + correction.
**API (required):** STT provider -> `POST /api/logs` after confirmation; mic permission strings.
**Acceptance tests:** permission prompt; transcription path; user corrects before save; no save
without confirmation.

---

## Screen 18 — Progress Dashboard
**Route / file:** `ProgressPatterns` · `screens/track/ProgressPatternsScreen.tsx` · real (data hardcoded).

**Exact content:** eyebrow `YOUR PROGRESS` · title `Notice the patterns.` · copy "Progress isn't
about perfect days. Look at what is happening across your week." · hardcoded stats (18 Meals
logged / 12 Check-ins / 5 Learning days) · `This Week` bar chart (M–S) · insight "You've been
checking in more consistently this week." / "Keep observing what helps you feel satisfied and
energized." · disclaimer "True Diet patterns are educational observations and are not medical
diagnoses."
**API (required):** `GET /api/progress?range=`. **DB:** aggregates from `food_logs`, `check_ins`.
**Compliance:** never fabricate progress or compute unsupported clinical metrics.
**Acceptance tests:** real aggregates; empty state; date filter; disclaimer visible.

---

## Cross-group findings (Part 1)

1. Persistence gap: onboarding (Screens 2–5) writes only to memory; `POST/GET /api/profile`
   never called. Screen 9 shows empty for returning users.
2. Screen 7 missing, Screen 12 placeholder — resolve naming/scope before coding.
3. Returning-user CTA on Screen 1 misroutes to `Goal`.
4. Validation gaps: email format, age range, height/weight units.
5. Stubs/mocks: MealLog save, VoiceFoodLog transcript, Recipe/Resource saves, Home bell & "View
   your plan", Learn search & category taps.
6. All tracking/progress data hardcoded — no logs API/DB.
7. Auth base URL `http://localhost:3000` (kept for development).
