/**
 * End-to-end authentication test against a live server.
 *
 * Uses Node's https client with an explicit address override, because the
 * local ISP resolver is unreliable for api.true-diet.com. Cookies are kept in
 * memory exactly the way the mobile client holds its session.
 *
 *   node scripts/auth-e2e.mjs                 # read-only + one throwaway account
 *   node scripts/auth-e2e.mjs --email a@b.com # use a specific test address
 *
 * The throwaway account is DELETED at the end with DELETE /api/account, which
 * cascades to every table. Nothing else in production is touched.
 */
import https from 'node:https';
import crypto from 'node:crypto';

const HOST = 'api.true-diet.com';
const ADDRESS = process.env.TRUEDIET_TEST_IP || '152.53.227.233';
const ORIGIN = 'http://localhost:8081';

const jar = new Map();
const results = [];

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const headers = {
      Host: HOST,
      Origin: ORIGIN,
      Accept: 'application/json',
    };
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (jar.size) {
      headers.Cookie = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
    }

    const req = https.request(
      {
        method,
        // Connect to the known address but keep the real TLS server name and
        // Host header, so certificate validation and routing stay correct.
        host: ADDRESS,
        path,
        servername: HOST,
        headers,
        family: 4,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          for (const raw of res.headers['set-cookie'] || []) {
            const [pair] = raw.split(';');
            const idx = pair.indexOf('=');
            const name = pair.slice(0, idx);
            const value = pair.slice(idx + 1);
            if (value === '' || /max-age=0/i.test(raw)) jar.delete(name);
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

function check(name, condition, detail) {
  results.push({ name, pass: Boolean(condition), detail });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${condition ? '' : `  <- ${detail}`}`);
}

const run = async () => {
  const suffix = crypto.randomBytes(4).toString('hex');
  const email =
    process.argv.find((a) => a.startsWith('--email='))?.split('=')[1] ||
    `myzonic1+qa.${suffix}@gmail.com`;
  const password = `Qa!${crypto.randomBytes(6).toString('hex')}`;

  console.log(`target ${HOST} (${ADDRESS}), test account ${email}\n`);

  // 1. Unauthenticated access is rejected.
  const anonProfile = await request('GET', '/api/profile');
  check('unauthenticated profile is 401', anonProfile.status === 401, anonProfile.status);

  // 2. Sign up.
  const signUp = await request('POST', '/api/auth/sign-up/email', { name: 'QA Auth', email, password });
  check('sign-up succeeds', signUp.status === 200 || signUp.status === 201, `${signUp.status} ${JSON.stringify(signUp.json)}`);
  check('sign-up returns a user id', Boolean(signUp.json?.user?.id), JSON.stringify(signUp.json)?.slice(0, 160));

  // 3. Session is issued and readable.
  const session1 = await request('GET', '/api/auth/get-session');
  check('session established after sign-up', Boolean(session1.json?.session), JSON.stringify(session1.json)?.slice(0, 160));

  // 4. Authenticated profile access works.
  const profile = await request('GET', '/api/profile');
  check('authenticated profile is 200', profile.status === 200, profile.status);

  // 5. Duplicate email is rejected without creating a second account.
  const dup = await request('POST', '/api/auth/sign-up/email', { name: 'QA Auth', email, password });
  check('duplicate sign-up rejected', dup.status === 422 || dup.status === 400, dup.status);

  // 6. Wrong password is rejected.
  await request('POST', '/api/auth/sign-out', {});
  const badLogin = await request('POST', '/api/auth/sign-in/email', { email, password: 'definitely-wrong-1' });
  check('wrong password rejected', badLogin.status === 401, `${badLogin.status} ${JSON.stringify(badLogin.json)}`);

  // 7. Correct password signs in and restores a session.
  const login = await request('POST', '/api/auth/sign-in/email', { email, password });
  check('correct password signs in', login.status === 200, `${login.status} ${JSON.stringify(login.json)?.slice(0, 160)}`);
  const session2 = await request('GET', '/api/auth/get-session');
  check('session restored after sign-in', Boolean(session2.json?.session), JSON.stringify(session2.json)?.slice(0, 160));

  // 8. Password reset request is accepted (email is configured in production).
  const reset = await request('POST', '/api/auth/request-password-reset', { email, redirectTo: '/reset' });
  check('password reset request accepted', reset.status === 200, `${reset.status} ${JSON.stringify(reset.json)}`);

  // 8b. The same request for an address with no account must look identical,
  // otherwise the endpoint becomes an account-enumeration oracle.
  const resetUnknown = await request('POST', '/api/auth/request-password-reset', {
    email: `no-such-account-${suffix}@gmail.com`,
    redirectTo: '/reset',
  });
  check(
    'unknown email reset is indistinguishable',
    resetUnknown.status === reset.status,
    `known=${reset.status} unknown=${resetUnknown.status}`
  );

  // 9. Sign out clears the session server-side.
  const out = await request('POST', '/api/auth/sign-out', {});
  check('sign-out succeeds', out.status === 200, out.status);
  const after = await request('GET', '/api/auth/get-session');
  check('session cleared after sign-out', !after.json?.session, JSON.stringify(after.json)?.slice(0, 120));

  // 10. Clean up: sign back in, then delete the throwaway account.
  const relogin = await request('POST', '/api/auth/sign-in/email', { email, password });
  if (relogin.status === 200) {
    const del = await request('DELETE', '/api/account');
    check('test account deleted', del.status === 200, `${del.status} ${JSON.stringify(del.json)}`);
  } else {
    check('test account deleted', false, 'could not sign back in to delete');
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
};

run().catch((err) => {
  console.error('request failed:', err.message);
  process.exit(1);
});
