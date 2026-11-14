/**
 * Verifies the sign-in brute-force limit is active on the live server.
 *
 * Sends repeated failed sign-ins for an address that does not exist and
 * expects HTTP 429 to appear well before 100 attempts. This is the only check
 * that proves the rateLimit config in lib/auth.ts reached production.
 *
 *   node scripts/auth-ratelimit.mjs
 *
 * Safe: it never guesses a real password and creates no account.
 */
import https from 'node:https';
import crypto from 'node:crypto';

const HOST = 'api.true-diet.com';
const ADDRESS = process.env.TRUEDIET_TEST_IP || '152.53.227.233';
const ORIGIN = 'http://localhost:8081';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request(
      {
        method: 'POST',
        host: ADDRESS,
        path,
        servername: HOST,
        family: 4,
        headers: {
          Host: HOST,
          Origin: ORIGIN,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        res.resume();
        res.on('end', () => resolve(res.statusCode));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const run = async () => {
  const email = `rl-${crypto.randomBytes(4).toString('hex')}@gmail.com`;
  const codes = [];
  for (let i = 0; i < 14; i += 1) {
    codes.push(await post('/api/auth/sign-in/email', { email, password: 'wrong-password-1' }));
  }
  console.log(`status codes: ${codes.join(', ')}`);
  const limited = codes.includes(429);
  console.log(limited ? 'PASS  rate limit enforced (429 returned)' : 'FAIL  no 429 - rate limit not active');
  process.exit(limited ? 0 : 1);
};

run().catch((e) => {
  console.error('probe failed:', e.message);
  process.exit(1);
});
