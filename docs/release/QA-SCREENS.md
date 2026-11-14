# Screen-by-screen and functional verification

Method note: this matrix records **how** each screen was checked. Code paths
and live production endpoints were exercised; on-device visual confirmation is
listed separately in `RELEASE-CHECKLIST.md` because no signed build existed
when this was written.

Legend — **Data:** `API` live production endpoint, `Local` bundled/written
locally. **Check:** `code` = path read and traced, `live` = endpoint called
from this machine, `bundle` = present in the compiled production bundle.

## Onboarding (8)

| Screen | Route | Data | Check | Notes |
|---|---|---|---|---|
| Welcome | `Welcome` | Local | code, bundle | "HIPAA-Compliant · Evidence-Based Protocol" text intentionally unchanged |
| Goal | `Goal` | Local → profile | code | Writes onboarding context, persisted at account creation |
| Personal details | `PersonalDetails` | Local → profile | code | Validation blocks Continue until age/sex/height/weight exist |
| Allergies | `Allergies` | Local → profile | code | Free-text with add/remove |
| Dietary preferences | `DietaryPreferences` | Local → profile | code | Persisted as `jsonb` string array |
| Building profile | `BuildingProfile` | Local | code | Animated, auto-advances; not skippable by gesture |
| Create account | `AccountSetup` | API | code, live | Sign-up/sign-in/Google/reset/verification — 14/14 live checks |
| Nutrition profile | `NutritionProfile` | API | code | Hydrates saved profile when context is empty |

## Tabs (5)

| Screen | Data | Check | Notes |
|---|---|---|---|
| Home | API | code, bundle | Greeting, daily insight, tool grid, notification bell wired |
| Learn | API | code, live | 18 published articles from `/api/content`, topics + myths |
| Track | API | code, live | Meal log, check-ins, weekly progress from `/api/track/*` |
| Resources | API | code, live | Hub → guides, blog, webinars, classes, podcast |
| Profile | API | code | Account hub, saved content, membership, privacy |

## Learn / content (7)

| Screen | Data | Check | Notes |
|---|---|---|---|
| Topic | API | code, live | Article list per topic |
| Article | API | code, live | Body from detail endpoint; premium gated (401 without entitlement) |
| Myths | API | code, live | Claim list with evidence rating |
| Myth detail | API | code, live | Verdict + evidence body |
| Search | API | code, live | Debounced server search, empty state for no matches |
| Resources hub | API | code | Six entry points |
| Resource detail | API | code | Save action writes `saved_items` |

## Nutrition tools (3)

| Screen | Data | Check | Notes |
|---|---|---|---|
| Tools | Local | code | Index of the three tools below |
| Balanced meal | Local | code | Plate builder, no server write |
| Label reading | Local | code | Seven-step expandable framework |

## Tracking (5)

| Screen | Data | Check | Notes |
|---|---|---|---|
| Meal log | API | code, live | Save to `/api/track/meals`, keyboard-aware |
| Voice food log | Local STT | code, bundle | Model preloaded on open; live timer; web + native build |
| Hunger & fullness | API | code, live | 1–5 scales, optional note |
| Progress patterns | API | code, live | Weekly bars, recent check-ins, empty state |
| Recipes | Local | code | Recipe detail + save |

## Care and services (5)

| Screen | Data | Check | Notes |
|---|---|---|---|
| Ask dietitian | API | code, live | Writes thread/message; reply arrives in `MessageDetail` |
| Message thread | API | code, live | Registered route (was previously unreachable) |
| Telehealth | API (Cal.com) | code, live | Voice/video, 9–5 America/New_York, booker time zone detected |
| Appointment detail | API | code | Status, meeting link opens in browser |
| Packages / package detail | API | code, live | Three plans, `priceCents` null → "Contact for pricing" |

## Account (8)

| Screen | Data | Check | Notes |
|---|---|---|---|
| Nutrition profile settings | API | code, live | Edits persist via `POST /api/profile` |
| Settings | API | code | Notification/accessibility prefs, change password |
| Privacy & data | API | code, live | Consent, export, delete account (cascade verified by route) |
| Saved content | API | code, live | Empty state when nothing saved |
| Notifications | API | code | Server-backed list, empty state |
| Support | Local | code | Contact paths |
| Legal | Local | code | Terms/privacy/disclaimer text |
| Membership / checkout | API | code, live | Checkout returns 503 by design (see SECURITY-PRIVACY.md) |

## Deliberate product gaps (not bugs)

- Payments are not implemented. Checkout responds 503 and the UI says so.
- Cal.com webhook subscriber is not registered, so booking status changes made
  in the Cal dashboard do not sync back automatically.
- Push notifications require `EXPO_ACCESS_TOKEN` and a build installed from a
  store/EAS profile.
