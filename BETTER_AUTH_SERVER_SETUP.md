# Better Auth Backend Setup Guide (PostgreSQL)

This guide provides the exact server configuration to connect with the **True Diet** Expo React Native app.

---

## 1. Environment Variables (`.env`)

Add to your backend project's `.env`:

```env
# Port & URL
PORT=3000
BETTER_AUTH_URL=http://localhost:3000

# Secret (min 32 chars - generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your_super_secret_high_entropy_key_at_least_32_chars_long

# PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:password@localhost:5432/truediet_db

# Allowed Origins (Include Expo Scheme)
TRUSTED_ORIGINS=http://localhost:8081,exp://,truediet://
```

---

## 2. Server Instance (`auth.ts`)

Install dependencies in your backend:
```bash
npm install better-auth @better-auth/expo pg
npm install -D @types/pg
```

In `auth.ts` (using PostgreSQL via Pool or Drizzle/Prisma):

```typescript
import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:8081",
    "http://localhost:19006",
    "exp://*",
    "truediet://*",
  ],
  plugins: [
    expo(),
  ],
});
```

---

## 3. Database Migration & Tables

Run the Better Auth CLI to create required tables in PostgreSQL:

```bash
npx @better-auth/cli migrate
```
*(Or generate SQL schemas with `npx @better-auth/cli generate`)*

---

## 4. Route Handler Examples

### Express:
```typescript
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

const app = express();

app.all("/api/auth/*", toNodeHandler(auth));

app.listen(3000, () => {
  console.log("Better Auth server running at http://localhost:3000");
});
```

### Next.js App Router (`/app/api/auth/[...all]/route.ts`):
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Hono:
```typescript
import { Hono } from "hono";
import { auth } from "./auth";

const app = new Hono();
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
```

---

## 5. Testing with the Expo App

1. Update `.env` in this Expo project if testing on physical devices:
   - **iOS Simulator / Web**: `EXPO_PUBLIC_AUTH_URL=http://localhost:3000`
   - **Android Emulator**: `EXPO_PUBLIC_AUTH_URL=http://10.0.2.2:3000`
   - **Physical Phone**: `EXPO_PUBLIC_AUTH_URL=http://<YOUR_COMPUTER_LOCAL_IP>:3000`
2. Run Expo:
   ```bash
   npx expo start
   ```
