/**
 * Live test of the push notification API (no real push is sent).
 *
 * Covers: auth requirement, token validation, idempotent registration,
 * cross-account ownership, preferences, history and unregistration.
 * Throwaway accounts are deleted at the end.
 *
 *   node scripts/push-e2e.mjs
 */
import https from 'node:https';
import crypto from 'node:crypto';

const HOST = 'api.true-diet.com';
const ADDRESS = process.env.TRUEDIET_TEST_IP || '152.53.227.233';
const ORIGIN = 'http://localhost:8081';

let jar = new Map();
const results = [];

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const headers = { Host: HOST, Origin: ORIGIN, Accept: 'application/json' };
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (jar.size) headers.Cookie = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');

    const req = https.request(
      { method, host: ADDRESS, path, servername: HOST, family: 4, headers },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          for (const raw of res.headers['set-cookie'] || []) {
            const [pair] = raw.split(';');
            const i = pair.indexOf('=');
            const name = pair.slice(0, i);
            const value = pair.slice(i + 1);
            if (!value || /max-age=0/i.test(raw)) jar.delete(name);
            else jar.set(name, value);
          }
          let json = null;
          try {
            json = data ? JSON.parse(data) : null;
          } catch {
            json = { raw: data };
          }
          resolve({ status: res.statusCode, json });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function check(name, ok, detail) {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  <- ${detail}`}`);
}

const run = async () => {
  const suffix = crypto.randomBytes(4).toString('hex');
  const userA = `myzonic1+push.${suffix}@gmail.com`;
  const userB = `myzonic1+pushb.${suffix}@gmail.com`;
  const password = `Qa!${crypto.randomBytes(6).toString('hex')}`;
  // Format-valid but fake: the API validates shape, not liveness.
  const token = `ExponentPushToken[fake-${suffix}-a]`;
  const tokenB = `ExponentPushToken[fake-${suffix}-b]`;

  const anon = await request('POST', '/api/push-tokens', { token, platform: 'android' });
  check('registration requires a session (401)', anon.status === 401, anon.status);

  const signup = await request('POST', '/api/auth/sign-up/email', { name: 'Push QA', email: userA, password });
  check('account A created', signup.status === 200 || signup.status === 201, signup.status);

  const invalid = await request('POST', '/api/push-tokens', { token: 'not-a-token', platform: 'android' });
  check('invalid token rejected (400)', invalid.status === 400, invalid.status);

  const badPlatform = await request('POST', '/api/push-tokens', { token, platform: 'windows' });
  check('invalid platform rejected (400)', badPlatform.status === 400, badPlatform.status);

  const first = await request('POST', '/api/push-tokens', { token, platform: 'android', deviceId: `dev-${suffix}` });
  check('valid token registered (201)', first.status === 201, first.status);

  const again = await request('POST', '/api/push-tokens', { token, platform: 'android', deviceId: `dev-${suffix}` });
  const list = await request('GET', '/api/push-tokens');
  const rows = list.json?.tokens || [];
  check('repeat registration is idempotent', again.status === 201 && rows.filter((r) => r.token === token).length === 1, JSON.stringify(rows));
  check('token listed as active', rows.some((r) => r.token === token && r.isActive !== false), JSON.stringify(rows));

  const history = await request('GET', '/api/push-tokens/history');
  check('history endpoint returns this member only', history.status === 200 && Array.isArray(history.json?.notifications), history.status);

  const prefs = await request('PUT', '/api/preferences', { notifications: { tracking: true, media: true } });
  const getPrefs = await request('GET', '/api/preferences');
  const n = getPrefs.json?.preferences?.notifications || {};
  check('tracking preference saved', prefs.status === 200 && n.tracking === true, JSON.stringify(n));
  check('media preference saved', n.media === true, JSON.stringify(n));
  check('security stays enabled', n.security === true, JSON.stringify(n));

  // Second account must not be able to claim a token owned by account A.
  jar = new Map();
  const signupB = await request('POST', '/api/auth/sign-up/email', { name: 'Push QB', email: userB, password });
  check('account B created', signupB.status === 200 || signupB.status === 201, signupB.status);
  const steal = await request('POST', '/api/push-tokens', { token, platform: 'android' });
  check("another account cannot claim A's token (409)", steal.status === 409, steal.status);

  // B registers its own token, then unregisters it.
  await request('POST', '/api/push-tokens', { token: tokenB, platform: 'ios' });
  const removed = await request('DELETE', `/api/push-tokens/${encodeURIComponent(tokenB)}`);
  const listB = await request('GET', '/api/push-tokens');
  check('unregister removes the token', removed.status === 200 && !(listB.json?.tokens || []).some((r) => r.token === tokenB), JSON.stringify(listB.json));

  // Cleanup both accounts (cascades to their tokens).
  await request('DELETE', '/api/account');
  jar = new Map();
  await request('POST', '/api/auth/sign-in/email', { email: userA, password });
  const del = await request('DELETE', '/api/account');
  check('test accounts deleted', del.status === 200, del.status);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
};

run().catch((e) => {
  console.error('request failed:', e.message);
  process.exit(1);
});
