# True Diet — Screen Specifications, Part 2 (Screens 19–38)

Continues `docs/SCREENS-PART1.md` and `docs/AUDIT.md`. This part covers the
post-onboarding experience: content, professional services, membership, account,
privacy & data.

It documents the screens as they exist today (verified, client-approved copy) and
specifies the server contracts, DB models, permissions, subscription rules,
states and acceptance tests required to make them production-ready. No existing
week-1 code is rebuilt; every screen reuses existing routes
(`src/navigation/types.ts`) and the current screen components.

---

## Conventions used in this document

- **Route / file** — the registered route name and implementing file. `ExtendedScreen`
  is the generic template renderer at `src/screens/extended/ExtendedScreens.tsx`.
- **Copy** — exact, client-approved strings currently rendered. Do not paraphrase.
- **API** — proposed contracts. Prefix `/api`. All responses are JSON. All
  authenticated endpoints verify the Better Auth session server-side via
  `auth.api.getSession({ headers })` and scope every query to `session.user.id`.
- **Auth** — `A` = session required; `P` = public (no health data).
- **Premium** — `Free` / `Premium`. Premium gating is enforced **on the server**
  (never by hiding UI alone).
- **Health data** — any field that could identify or describe a user's health
  (goal, allergies, dietary preferences, messages, appointments, meal logs).
  These are `sensitive`: always access-controlled, never logged in plaintext,
  never returned to another user.

### Standard error envelope

```json
{ "error": "machine_code", "message": "Human readable", "details": {} }
```

| HTTP | code               | meaning                              |
| ---- | ------------------ | ------------------------------------ |
| 400  | `invalid_request`  | schema/validation failure            |
| 401  | `unauthorized`     | missing/expired session              |
| 403  | `forbidden`        | authenticated but not allowed        |
| 403  | `premium_required` | paid content without entitlement     |
| 404  | `not_found`        | resource missing or not owned        |
| 409  | `conflict`         | duplicate (e.g. slot taken)          |
| 429  | `rate_limited`     | throttled                            |
| 500  | `server_error`     | unexpected                           |

### Shared response types (appendix A)

```ts
type ContentType = 'article'|'resource'|'webinar'|'class'|'podcast'|'myth'|'topic';
type ContentSummary = {
  id: string; slug: string; type: ContentType; title: string;
  subtitle: string; category?: string; isPremium: boolean;
  durationMinutes?: number; publishedAt: string; route: string;
};
type ContentDetail = ContentSummary & {
  body: string;           // markdown
  mediaUrl?: string;      // podcast/audio or video
  relatedIds: string[];
};
type Page<T> = { items: T[]; nextCursor: string | null };
```

### Navigation map for this part

| #  | Spec name                      | Route                        | Impl |
| -- | ------------------------------ | ---------------------------- | ---- |
| 19 | Ask the Dietitian              | `Dietitian`                  | `CoreFeatureScreens.tsx` |
| 20 | Appointment Booking            | `Telehealth`                 | `CoreFeatureScreens.tsx` |
| 21 | Maureen's Professional Profile | `MaureenProfile`             | `ExtendedScreen` |
| 22 | Blog Listing                   | `Blog`                       | `ExtendedScreen` |
| 23 | Blog Article                   | `Article`                    | `main/PlaceholderScreens.tsx` (`TrackScreen`) |
| 24 | Resource Library               | `Resources` / `ResourceDetail` | `ExtendedScreen` + tab |
| 25 | Webinar Listing                | `Webinars`                   | `ExtendedScreen` |
| 26 | Webinar Details                | `WebinarDetail`              | `ExtendedScreen` |
| 27 | Classes and Programs           | `RecordedClasses`            | `ExtendedScreen` |
| 28 | Podcast Listing                | `Podcast`                    | `ExtendedScreen` |
| 29 | Podcast Episode Details        | `PodcastDetail`              | `ExtendedScreen` |
| 30 | Membership Plans               | `Packages` / `PackageDetail` | `ExtendedScreen` |
| 31 | Premium Content                | `FreePremium`                | `ExtendedScreen` |
| 32 | Subscription Management        | `Subscription`               | `ExtendedScreen` |
| 33 | Saved Content                  | `SavedContent`               | `ExtendedScreen` |
| 34 | Notifications                  | `Notifications`              | `ExtendedScreen` |
| 35 | User Profile                   | `Profile`                    | `ExtendedScreen` + tab |
| 36 | Nutrition Profile              | `NutritionProfileSettings`   | `ExtendedScreen` |
| 37 | Settings                       | `Settings`                   | `ExtendedScreen` |
| 38 | Privacy & Health Data Controls | `Privacy`                    | `ExtendedScreen` |

Also registered and referenced from these screens but specified elsewhere /
placeholder: `SearchScreen`, `Support`, `Legal`, `Checkout`, `WebinarConfirmation`,
`AppointmentDetail`, `MessageDetail`, `PackageDetail`, `ResourceDetail`,
`Myths`, `MythDetail`, `Topic`.

---

## Screen 19 — Ask the Dietitian

- **Route / file**: `Dietitian` → `src/screens/main/CoreFeatureScreens.tsx:11`.
- **Content (exact)**:
  - Eyebrow: `ASK THE DIETITIAN`
  - Title: `Guidance with context.`
  - Copy: `Send a non-urgent nutrition education question to your Registered Dietitian.`
  - Secure box: `Secure messaging` / `For education and support—not urgent or emergency care.`
  - Field label: `Your question`; placeholder: `What would you like to understand?`
  - Sent state: `Message saved for secure delivery.`
  - Button: `Send Secure Message` (disabled until non-empty).
- **Interactions**: type → enable button → press → optimistic "sent" state, clear
  input. Today it is local-only (no network).
- **Navigation**: back to previous; nothing else today.
- **API**:
  - `POST /api/messages` **A**. Request `{ body: string (1..2000) }`.
    Response 201 `{ message: { id, body, createdAt, authorUserId } }`.
  - `GET /api/messages/threads` **A** → `{ threads: Thread[] }`.
  - `GET /api/messages/threads/:id` **A** → `{ thread, messages: Message[] }`.
- **DB** (`message_threads`, `messages`): thread scoped to `userId`; message rows
  reference thread; `authorType` = `user|dietitian`.
- **Permissions**: user may only read/write their own thread. Dietitian replies
  are created by staff/back-office role only (`role='dietitian'`).
- **Subscription**: free.
- **States**: idle · sending (spinner in button) · sent · error (inline, retry).
  Empty input keeps button disabled. Rate limit 10 msg/min → 429.
- **Acceptance tests**:
  1. Empty input → button disabled, no request.
  2. Valid input → 201, sent state, input cleared.
  3. 401 when session expired → prompt re-login.
  4. User A cannot fetch user B thread (`GET /threads/:id` → 404).
  5. `body` > 2000 chars → 400 `invalid_request`.

---

## Screen 20 — Appointment Booking

- **Route / file**: `Telehealth` → `CoreFeatureScreens.tsx:12`.
- **Content (exact)**:
  - Eyebrow: `TELEHEALTH`
  - Title: `Book a nutrition visit.`
  - Copy: `Choose a time to meet virtually with your Registered Dietitian for personalized education and support.`
  - Visit box: `Virtual nutrition consultation` / `45 minutes · secure video visit`
  - Label: `Available times`
  - Slots: `Tue · 10:00 AM`, `Wed · 2:30 PM`, `Thu · 11:00 AM`
  - Note: `Appointment availability will sync with your scheduling platform when connected.`
  - Button: `Request Appointment`.
- **Interactions**: select slot (single-select) → enable CTA → request → success
  (navigate `AppointmentDetail`) or alert. Today: `Alert`.
- **Navigation**: `AppointmentDetail` (registered).
- **API**:
  - `GET /api/dietitians/:dietitianId/availability?from&to` **A** →
    `{ slots: { id, start, end, kind:'video' }[] }`.
  - `POST /api/appointments` **A** `{ slotId, reason?, timezone }` →
    201 `{ appointment: { id, start, status:'requested', joinUrl? } }`.
  - `GET /api/appointments` **A** → `{ appointments: Appointment[] }`.
- **DB**: `availability_slots` (unique `start`), `appointments`
  (`userId`, `slotId`, `status`, `externalRef`).
- **Permissions**: books only for self; slot must be open.
- **Subscription**: free to request; some plans may include a credit count.
- **States**: loading slots (skeleton) · empty (no availability) · selecting ·
  requesting · confirmed · error. Double-booking → 409 `conflict`.
- **Acceptance tests**:
  1. No slot selected → CTA disabled.
  2. Book open slot → 201 + `AppointmentDetail`.
  3. Book taken slot → 409, slot refreshed.
  4. `/availability` unauthenticated → 401.
  5. User sees only own `GET /api/appointments`.

---

## Screen 21 — Maureen's Professional Profile

- **Route / file**: `MaureenProfile` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `YOUR DIETITIAN`
  - Title: `Meet Maureen.`
  - Copy: `A Registered Dietitian with more than 23 years of experience helping people understand nutrition without fear, confusion, or unnecessary restriction.`
  - Items: `Credentials & expertise` / `Registered Dietitian · Medical Nutrition Therapy`;
    `My philosophy` / `Real Nutrition. Real Science. Real Results.`
- **Interactions**: rows are informational today (no route).
- **Navigation**: back.
- **API**: `GET /api/dietitians/:id` **P** → `{ id, name, credentials, bio, philosophy }`.
  Editable by staff only (`PUT /api/admin/dietitians/:id`).
- **DB**: `dietitians`.
- **Permissions**: read-only public/professional info; no user health data.
- **Subscription**: free.
- **States**: loading · loaded · error (fallback to embedded copy).
- **Acceptance tests**:
  1. Renders verified copy offline (static fallback).
  2. Server copy renders when available; creds never fabricated client-side.
  3. Editing endpoint rejects non-staff (403).

---

## Screen 22 — Blog Listing

- **Route / file**: `Blog` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `BLOG & ARTICLES`
  - Title: `Current nutrition, clearly explained.`
  - Copy: `Research context, practical education, and thoughtful answers to nutrition questions.`
  - Items: `What "healthy" eating actually means` / `Evidence-based article · 6 min` →
    Article; `How to evaluate a nutrition claim` / `Nutrition Truth · 5 min` → MythDetail;
    `Protein: context over hype` / `Evidence-based article · 7 min` → Article.
- **Interactions**: tap row → open Article/Myth; search filter applies when on
  `SearchScreen`.
- **Navigation**: `Article`, `Myths`, `MythDetail`.
- **API**: `GET /api/content?type=article&q=&limit=&cursor=` **P** →
  `Page<ContentSummary>`.
- **DB**: `content` (`type='article'`).
- **Permissions**: free articles public; premium articles returned as summaries
  with `isPremium:true` (body gated on detail).
- **Subscription**: listing free; premium articles require entitlement on open.
- **States**: loading (list skeleton) · empty (no articles) · error (retry) ·
  offline fallback to embedded copy.
- **Acceptance tests**:
  1. Lists server articles; each row shows title + subtitle + duration.
  2. Tapping an article opens detail with correct `articleId`.
  3. Premium item shows Premium badge; opening without entitlement → blocked.
  4. Search query filters list (server `q`).
  5. Network failure → static copy still renders (no blank screen).

---

## Screen 23 — Blog Article

- **Route / file**: `Article` → `main/PlaceholderScreens.tsx` (`TrackScreen` factory).
  Currently a placeholder; Part 1 Screen 12 "Article Detail".
- **Content**: placeholder copy — `Track` / `Practical check-ins, meal logging, and
  progress tools are coming next.` (must be replaced with the real article view).
- **Proposed real screen**: header image/eyebrow, title, author + read time,
  markdown body, save action, related articles.
- **Navigation**: from Blog; back.
- **API**:
  - `GET /api/content/:slug` **P (free) / A+P (premium)** → `{ item: ContentDetail }`.
  - `POST /api/saved` **A** `{ contentId }` to save.
- **DB**: `content`, `saved_items`.
- **Permissions**: premium body requires entitlement → else 403 `premium_required`.
- **Subscription**: free and premium variants.
- **States**: loading · loaded · premium-locked (upgrade CTA) · not found → 404 ·
  error.
- **Acceptance tests**:
  1. Free article body renders as markdown.
  2. Premium article without entitlement → lock screen + upgrade CTA, **no body
     bytes** returned.
  3. Save → appears in Saved Content.
  4. Unknown slug → friendly not-found.
  5. Body is sanitized (no raw HTML/script execution).

---

## Screen 24 — Resource Library

- **Route / file**: `Resources` → `ExtendedScreen` (also a tab) and
  `ResourceDetail` → `ExtendedScreen`.
- **Content (exact)** — `Resources`:
  - Eyebrow: `RESOURCES`
  - Title: `Practical guidance to return to.`
  - Copy: `Evidence-based guides, tools, and learning resources for everyday nutrition decisions.`
  - Items: `Label Reading Framework` / `A calm, step-by-step guide` → ResourceDetail;
    `Mindful Eating Guide` / `Notice hunger, fullness, and satisfaction` → ResourceDetail;
    `7-Day Anti-Inflammatory Reset` / `Educational, flexible foundations` → ResourceDetail;
    `Blog & Articles` / `Current evidence-based education` → Blog;
    `Webinars & Classes` / `Live and recorded lessons` → Webinars;
    `True Diet Podcast` / `Nutrition conversations with context` → Podcast.
- **Content (exact)** — `ResourceDetail`:
  - Eyebrow: `RESOURCE`
  - Title: `A practical nutrition guide.`
  - Copy: `Use this evidence-based resource at your own pace. It is designed to help you build understanding, not follow rigid food rules.`
  - CTA: `Save Resource`.
- **Interactions**: tap → detail; `Save Resource` → save + confirmation.
- **Navigation**: `ResourceDetail`, `Blog`, `Webinars`, `Podcast`.
- **API**: `GET /api/content?type=resource` **P**; `GET /api/content/:slug`;
  `POST /api/saved` **A**.
- **DB**: `content`, `saved_items`.
- **Permissions**: guides free; some may be premium (flag `isPremium`).
- **Subscription**: mixed; gated on detail when premium.
- **States**: loading · empty · error · saved-confirmation.
- **Acceptance tests**:
  1. Cross-links navigate to Blog/Webinars/Podcast.
  2. `Save Resource` idempotent (double tap → one row).
  3. Saved resource appears in Saved Content.
  4. Premium guide locks correctly.

---

## Screen 25 — Webinar Listing

- **Route / file**: `Webinars` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `WEBINARS & CLASSES`
  - Title: `Learn with Maureen.`
  - Copy: `Join a live class or choose a recorded lesson when it fits your schedule.`
  - Items: `Live: Nutrition Labels Without Fear` / `Thursday · 6:00 PM` → WebinarDetail;
    `Recorded: Building Balanced Meals` / `Watch anytime` → RecordedClasses.
- **Interactions**: tap → detail / recorded list.
- **Navigation**: `WebinarDetail`, `RecordedClasses`.
- **API**: `GET /api/content?type=webinar&status=upcoming` **P**.
- **DB**: `content` (`type='webinar'`, `startsAt`, `registrationOpen`).
- **Permissions**: listing free.
- **Subscription**: live webinars may be Premium (flag).
- **States**: loading · empty (none scheduled) · error.
- **Acceptance tests**:
  1. Upcoming webinars ordered by `startsAt`.
  2. Past webinars excluded from upcoming list.
  3. Row shows date/time from server, not hard-coded.

---

## Screen 26 — Webinar Details

- **Route / file**: `WebinarDetail` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `LIVE WEBINAR`
  - Title: `Nutrition Labels Without Fear.`
  - Copy: `A practical class on reading nutrition labels with context. Includes time for educational questions.`
  - CTA: `Register for Webinar` → `WebinarConfirmation`.
- **Interactions**: register → confirmation screen.
- **Navigation**: `WebinarConfirmation` (registered).
- **API**:
  - `GET /api/content/:slug` **P** → detail (with `startsAt`, `joinsUrl` only when
    registered).
  - `POST /api/webinars/:id/register` **A** → 201 `{ registration, joinUrl? }`.
- **DB**: `content`, `webinar_registrations`.
- **Permissions**: register for self; join URL only for registrants.
- **Subscription**: Premium webinars require entitlement before registering.
- **States**: loading · open · registered (shows join link + reminder) · full (409)
  · premium-locked · error.
- **Acceptance tests**:
  1. Register → `WebinarConfirmation`, row persisted.
  2. Duplicate register → idempotent or 409.
  3. Join URL absent until registered.
  4. Premium webinar without entitlement → blocked server-side.

---

## Screen 27 — Classes and Programs

- **Route / file**: `RecordedClasses` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `RECORDED CLASSES`
  - Title: `Keep learning on your time.`
  - Copy: `Replay practical, evidence-based lessons whenever you need them.`
  - Items: `Building Balanced Meals` / `42 min · Recorded class` → WebinarDetail;
    `Nutrition Myths: How to Think Clearly` / `35 min · Recorded class` → WebinarDetail.
- **Interactions**: tap → class detail/player.
- **Navigation**: `WebinarDetail`.
- **API**: `GET /api/content?type=class` **P/A** (medium URLs gated).
- **DB**: `content` (`type='class'`, `durationMinutes`, `mediaUrl`).
- **Permissions**: playback URL only for entitled users.
- **Subscription**: recorded classes are Premium.
- **States**: loading · empty · premium-locked · error.
- **Acceptance tests**:
  1. Free user sees titles but media URL withheld (403 on playback endpoint).
  2. Premium user can play.
  3. Duration displayed from server.

---

## Screen 28 — Podcast Listing

- **Route / file**: `Podcast` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `TRUE DIET PODCAST`
  - Title: `Nutrition conversations with context.`
  - Copy: `Listen to practical, science-informed conversations about food and wellbeing.`
  - Items: `Episode 12: Why nutrition trends feel convincing` / `28 min · Nutrition Truth` → PodcastDetail;
    `Episode 11: Finding a flexible meal rhythm` / `31 min · Practical nutrition` → PodcastDetail.
- **Interactions**: tap → episode detail.
- **Navigation**: `PodcastDetail`.
- **API**: `GET /api/content?type=podcast` **P**.
- **DB**: `content` (`type='podcast'`, `episodeNumber`, `mediaUrl`, `listenUrl`).
- **Permissions**: public.
- **Subscription**: free.
- **States**: loading · empty · error.
- **Acceptance tests**:
  1. Episodes sorted by `episodeNumber` desc.
  2. Open → correct episode.
  3. Listen link opens external player.

---

## Screen 29 — Podcast Episode Details

- **Route / file**: `PodcastDetail` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `PODCAST EPISODE`
  - Title: `A calmer way to think about food.`
  - Copy: `Episode notes, useful takeaways, related resources, and a link to listen on your preferred podcast platform.`
  - CTA: `Open Listen Link`.
- **Interactions**: open listen link (external); related resources navigate.
- **Navigation**: external `Linking.openURL(listenUrl)`; `ResourceDetail`.
- **API**: `GET /api/content/:slug` **P** → detail with `listenUrl`, `mediaUrl`,
  `relatedIds`.
- **DB**: `content`, `saved_items`.
- **Permissions**: public.
- **Subscription**: free.
- **States**: loading · loaded · error.
- **Acceptance tests**:
  1. `Open Listen Link` opens `listenUrl` (validated `https:` only).
  2. Related resources deep-link correctly.
  3. Missing `listenUrl` → CTA hidden.

---

## Screen 30 — Membership Plans

- **Route / file**: `Packages` → `ExtendedScreen`; `PackageDetail` → `ExtendedScreen`.
- **Content (exact)** — `Packages`:
  - Eyebrow: `SERVICES`
  - Title: `Support that meets you where you are.`
  - Copy: `Explore nutrition education, one-to-one support, and flexible ways to work with Maureen.`
  - Items: `Nutrition Foundations` / `Education package` → PackageDetail;
    `One-to-One Nutrition Support` / `Personalized RD guidance` → PackageDetail;
    `True Diet Premium` / `Expanded learning and tools` → FreePremium.
- **Content (exact)** — `PackageDetail`:
  - Eyebrow: `SERVICE DETAIL`
  - Title: `Nutrition support with context.`
  - Copy: `Learn what is included, who this service is for, and how to take the next step.`
  - CTA: `View Booking Options` → `Telehealth`.
- **Interactions**: view services/prices; book → Telehealth; premium → FreePremium.
- **Navigation**: `PackageDetail`, `FreePremium`, `Telehealth`.
- **API**:
  - `GET /api/plans` **P** → `{ plans: Plan[] }`.
  - `GET /api/plans/:id` **P**; `GET /api/services` **P**.
- **DB**: `plans` (`id, code, name, priceCents, currency, interval, features[]`),
  `services`.
- **Permissions**: public read; prices authoritative server-side (client never
  computes price).
- **Subscription**: entry point to paid plans.
- **States**: loading · loaded · error.
- **Acceptance tests**:
  1. Prices match server exactly.
  2. Selecting a plan → Checkout with `planId` (never amount from client).
  3. `View Booking Options` → Telehealth.

---

## Screen 31 — Premium Content

- **Route / file**: `FreePremium` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `MEMBERSHIP`
  - Title: `Choose your level of support.`
  - Copy: `Start with trusted education for free, then upgrade when you want expanded tools and experiences.`
  - Items: `Free` / `Learning hub, selected resources, basic tracking`;
    `Premium` / `Expanded content, classes, saved libraries, and more`.
  - CTA: `Explore Membership` → `Checkout`.
- **Interactions**: compare tiers; upgrade → Checkout.
- **Navigation**: `Checkout`.
- **API**: `GET /api/plans` **P**; `GET /api/subscription` **A** (current tier).
- **DB**: `plans`, `subscriptions`, `entitlements`.
- **Permissions**: shows current tier when signed in.
- **Subscription**: this screen defines the tier boundary; enforcement is server-side.
- **States**: loading · logged-out (CTA → login) · logged-in · error.
- **Acceptance tests**:
  1. Logged-out CTA routes to login/onboarding.
  2. Current tier reflected from `/api/subscription`.
  3. Feature lists are static verified copy (not hard-sold claims).

---

## Screen 32 — Subscription Management

- **Route / file**: `Subscription` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `MEMBERSHIP`
  - Title: `Manage your membership.`
  - Copy: `View your current access, renewal information, and available upgrade options.`
  - CTA: `Manage Subscription`.
- **Interactions**: open Stripe billing portal; view renew date/status.
- **Navigation**: external billing portal (`Linking.openURL`).
- **API**:
  - `GET /api/subscription` **A** → `{ plan, status, renewsAt, cancelAtPeriodEnd, entitlements }`.
  - `POST /api/subscription/portal` **A** → `{ url }` (Stripe billing portal).
  - `POST /api/subscription/checkout` **A** `{ planId }` → `{ url }`.
- **DB**: `subscriptions` (`userId, planId, status, stripeCustomerId,
  stripeSubscriptionId, currentPeriodEnd`), `entitlements`.
- **Permissions**: user sees only own subscription; Stripe keys server-side only.
- **Subscription**: source of truth for entitlement checks everywhere else.
- **States**: loading · free plan (show upgrade) · active · past_due (action
  required) · canceled (access-until date) · error.
- **Acceptance tests**:
  1. Free user sees upgrade CTA; no portal call.
  2. Active user → portal URL opens.
  3. `past_due` shows billing action.
  4. Entitlement checks elsewhere reflect status changes within one session.

---

## Screen 33 — Saved Content

- **Route / file**: `SavedContent` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `SAVED CONTENT`
  - Title: `Your library.`
  - Copy: `Keep recipes, articles, resources, classes, and episodes you want to revisit.`
  - Empty item: `No saved content yet` / `Tap the save action on any article, recipe, or resource.`
- **Interactions**: list saved items; tap → open; swipe/remove → unsave.
- **Navigation**: item `route` (Article/ResourceDetail/etc.).
- **API**:
  - `GET /api/saved` **A** → `Page<ContentSummary>`.
  - `DELETE /api/saved/:contentId` **A** → `{ saved:false }`.
- **DB**: `saved_items` (`userId`, `contentId`, unique pair).
- **Permissions**: own saves only; unsave restricted to owner.
- **Subscription**: free (Premium users can save premium items they can access).
- **States**: loading · empty (exact empty copy) · list · error.
- **Acceptance tests**:
  1. Empty state shows exact copy.
  2. Save from any detail → appears here.
  3. Remove → disappears; re-open detail shows unsaved.
  4. User A never sees user B saves.

---

## Screen 34 — Notifications

- **Route / file**: `Notifications` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `NOTIFICATIONS`
  - Title: `Stay in the loop.`
  - Copy: `Messages, appointments, webinar reminders, and new educational content will appear here.`
  - Empty item: `No new notifications` / `You are all caught up.`
- **Interactions**: tap → deep link to source; mark read; mark all read.
- **Navigation**: message/appointment/webinar/content routes.
- **API**:
  - `GET /api/notifications` **A** → `{ items: Notification[], unread: number }`.
  - `POST /api/notifications/:id/read` **A**; `POST /api/notifications/read-all` **A**.
  - Device push: `POST /api/devices` **A** `{ expoPushToken, platform }`.
- **DB**: `notifications` (`userId, type, title, body, deeplink, readAt`),
  `devices`.
- **Permissions**: own notifications only.
- **Subscription**: free.
- **States**: loading · empty (exact copy) · list (unread badge) · error.
- **Acceptance tests**:
  1. Empty → exact empty copy.
  2. Unread count badge matches server.
  3. Mark-all clears unread.
  4. Deep link navigates to correct screen.
  5. Push token stored per device, unique.

---

## Screen 35 — User Profile

- **Route / file**: `Profile` → `ExtendedScreen` (also a tab).
- **Content (exact)**:
  - Eyebrow: `PROFILE`
  - Title: `Your True Diet account.`
  - Copy: `Manage your account, personalized nutrition information, saved content, and app preferences.`
  - Items (route): `Nutrition Profile` → NutritionProfileSettings;
    `Saved Content` → SavedContent; `Settings` → Settings;
    `Privacy & Data Controls` → Privacy; `Meet Maureen` → MaureenProfile;
    `Packages & Services` → Packages.
- **Interactions**: hub navigation; signed-in header shows name/email.
- **Navigation**: the six routes above.
- **API**: `GET /api/profile` **A** (existing); `GET /api/subscription` **A**.
- **DB**: `user`, `profile`, `subscriptions`.
- **Permissions**: own account only.
- **Subscription**: displays current tier badge.
- **States**: loading · signed-in · signed-out (redirect on tap of account rows).
- **Acceptance tests**:
  1. Header shows session name/email.
  2. Each row routes correctly.
  3. Tier badge matches `/api/subscription`.
  4. Signed-out access → login.

---

## Screen 36 — Nutrition Profile

- **Route / file**: `NutritionProfileSettings` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `NUTRITION PROFILE`
  - Title: `Personalization you control.`
  - Copy: `Update goals, dietary preferences, and allergy or intolerance considerations when your needs change.`
  - CTA: `Edit Personalization`.
- **Interactions**: view current values; edit → onboarding-style editors
  (Goal/Allergies/DietaryPreferences) or inline form; save.
- **Navigation**: reuse onboarding screens or open an edit flow.
- **API**:
  - `GET /api/profile` **A** (existing) → `{ user, profile }`.
  - `POST /api/profile` **A** (existing) — partial update allowed.
- **DB**: `profile` (**sensitive health data**).
- **Permissions**: own profile only; server scopes by `session.user.id`.
- **Subscription**: free.
- **States**: loading · loaded · saving · saved · validation error (e.g. age
  range) · error.
- **Acceptance tests**:
  1. Shows values from `/api/profile` (not stale local cache).
  2. Edit persists; re-open reflects change.
  3. Invalid input → inline validation, no write.
  4. Another user cannot read/write this profile.
  5. Values never logged in plaintext.

---

## Screen 37 — Settings

- **Route / file**: `Settings` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `SETTINGS`
  - Title: `Make True Diet work for you.`
  - Copy: `Manage notification preferences, accessibility options, and account settings.`
  - Items: `Notification preferences` / `Choose what you want to hear about` →
    Notifications; `Help & Support` / `Contact True Diet` → Support;
    `Legal` / `Terms, Privacy Policy, and Disclaimers` → Legal.
- **Interactions**: toggles for notifications/accessibility; navigation.
- **Navigation**: `Notifications`, `Support`, `Legal`.
- **API**:
  - `GET /api/preferences` **A** → `{ notifications:{...}, accessibility:{...} }`.
  - `PUT /api/preferences` **A** (partial).
- **DB**: `preferences` (`userId, notifications jsonb, accessibility jsonb`).
- **Permissions**: own preferences only.
- **Subscription**: free.
- **States**: loading · loaded · saving (optimistic toggle w/ rollback) · error.
- **Acceptance tests**:
  1. Toggle persists across relaunch.
  2. Save failure rolls back the toggle and shows error.
  3. Rows navigate correctly.

---

## Screen 38 — Privacy & Health Data Controls

- **Route / file**: `Privacy` → `ExtendedScreen`.
- **Content (exact)**:
  - Eyebrow: `PRIVACY & DATA`
  - Title: `Your data, your control.`
  - Copy: `Review consent choices, request your data, and manage account deletion. Health-related data should only be processed through approved secure services.`
  - Items: `Export my data` / `Available once your account backend is connected`;
    `Delete my account` / `Requires identity verification and a backend workflow`.
- **Interactions**: export (request → download when ready); delete (multi-step
  confirm + re-auth).
- **Navigation**: back; possibly `Legal`.
- **API**:
  - `POST /api/account/export` **A** → `{ jobId }`;
    `GET /api/account/export/:jobId` **A** → `{ status, url? }`.
  - `DELETE /api/account` **A** `{ confirm: string }` → 202; hard-delete via
    `user.deleteUser`.
- **DB**: `user`, `profile`, `saved_items`, `messages`, `appointments`,
  `subscriptions`, `notifications` (all `onDelete: cascade`); `data_export_jobs`,
  `audit_logs`.
- **Permissions**: own account only; deletion requires fresh re-authentication.
- **Subscription**: deleting account cancels active subscription (server, via
  Stripe) before/with data removal.
- **States**: idle · exporting (job pending → ready) · deleting (confirm modal) ·
  deleted (signed out) · error.
- **Acceptance tests**:
  1. Export request creates a job; download link is short-lived and authenticated.
  2. Delete requires explicit confirm + re-auth; wrong confirm → 400.
  3. After delete, session invalidated; cascade removes related rows.
  4. Active subscription is canceled server-side before account removal.
  5. Audit log records export/delete events (no health payloads).

---

## Appendix B — Proposed DB models (beyond existing `user/profile`)

```ts
content(id uuid pk, slug text unique, type text, title text, subtitle text,
        category text, body text, mediaUrl text, listenUrl text, durationMinutes int,
        episodeNumber int, startsAt timestamptz, isPremium boolean default false,
        publishedAt timestamptz default now(), createdAt, updatedAt)

saved_items(id uuid pk, userId text fk->user cascade, contentId uuid fk->content cascade,
            createdAt timestamptz, unique(userId, contentId))

message_threads(id uuid pk, userId text fk->user cascade, dietitianId text,
                status text, lastMessageAt timestamptz, createdAt)
messages(id uuid pk, threadId uuid fk->message_threads cascade, authorType text,
         body text, createdAt)

dietitians(id uuid pk, name text, credentials text, bio text, philosophy text)
availability_slots(id uuid pk, dietitianId uuid fk->dietitians, start timestamptz unique,
                   end timestamptz, kind text)
appointments(id uuid pk, userId text fk->user cascade, slotId uuid fk->availability_slots,
             status text, externalRef text, joinUrl text, createdAt)

plans(id uuid pk, code text unique, name text, priceCents int, currency text,
      interval text, features jsonb)
subscriptions(id uuid pk, userId text fk->user cascade unique, planId uuid fk->plans,
              status text, stripeCustomerId text, stripeSubscriptionId text,
              currentPeriodEnd timestamptz, cancelAtPeriodEnd boolean, createdAt, updatedAt)
entitlements(id uuid pk, userId text fk->user cascade, key text, unique(userId,key))

webinar_registrations(id uuid pk, userId text fk->user cascade, contentId uuid fk->content,
                      joinUrl text, createdAt, unique(userId, contentId))

notifications(id uuid pk, userId text fk->user cascade, type text, title text, body text,
              deeplink text, readAt timestamptz, createdAt)
devices(id uuid pk, userId text fk->user cascade, expoPushToken text unique, platform text)

preferences(id uuid pk, userId text fk->user cascade unique, notifications jsonb,
            accessibility jsonb, updatedAt)

data_export_jobs(id uuid pk, userId text fk->user cascade, status text, url text,
                 expiresAt timestamptz, createdAt)
audit_logs(id uuid pk, userId text fk->user cascade, action text, metadata jsonb, createdAt)
```

## Appendix C — Subscription / entitlement rules

- **Free**: content listings, free articles/resources, podcast, profile, saved
  (free items), notifications, settings, privacy.
- **Premium**: premium articles, recorded classes, some live webinars, expanded
  resource library, premium saves.
- Enforcement: a single server helper `hasEntitlement(userId, key)`; premium
  detail/playback endpoints return `403 premium_required` and **no payload**
  when absent. UI lock screens are cosmetic only.
- Source of truth: `subscriptions.status` (`active`/`trialing` → entitled;
  `past_due`/`canceled` → not, except `cancelAtPeriodEnd` retains access until
  `currentPeriodEnd`).

## Appendix D — Security & health-data handling

- All `/api/**` (except explicitly public content/plans/health) require a session.
- Every query is scoped to `session.user.id`; ownership mismatch returns 404 (not
  403) to avoid resource enumeration.
- Health fields (goal, allergies, dietary preferences, message bodies,
  appointments) are treated as sensitive: not written to application logs,
  excluded from analytics, and only sent over HTTPS in production.
- Auth base URL stays `http://localhost:3000` for development only; production
  **must** use HTTPS before store submission.
- Rate limiting and audit logging on messaging, appointments, export and delete.

## Appendix E — Implementation status (this change)

Implemented now (server + client wiring):

- DB: `content`, `saved_items` (+ migration).
- API: `GET /api/content`, `GET /api/content/:slug`, `GET /api/saved`,
  `POST /api/saved`, `DELETE /api/saved/:contentId`.
- Seed: verified copy for blog/resources/webinars/classes/podcast inserted on
  startup (idempotent).
- Client: `src/lib/content.ts`; `ExtendedScreen` fetches content for the list
  screens `Blog`, `Resources`, `Webinars`, `RecordedClasses`, `Podcast` and saved
  items for `SavedContent`, **falling back to the embedded copy** if the API is
  unreachable or returns nothing so no screen ever blanks. Detail templates
  (`ResourceDetail`, `WebinarDetail`, `PodcastDetail`, `Article`) continue to
  render their embedded copy until per-slug detail wiring lands.

Still to build (specified above, not yet coded): messaging, appointments,
notifications, preferences, plans/subscription/entitlements, webinars
registration, account export/delete, and the real Article renderer.
