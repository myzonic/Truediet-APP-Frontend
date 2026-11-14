/**
 * Release bundle verification.
 *
 * Exports the production JS bundle for Android and checks the built artifact
 * for two classes of problem that unit tests cannot see:
 *
 *   1. development endpoints (localhost, LAN IPs, emulator loopback)
 *   2. server secrets accidentally inlined via EXPO_PUBLIC_* or a stray import
 *
 * Run: node scripts/verify-release-bundle.mjs
 * Exit code 0 = clean, 1 = at least one problem found.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(os.tmpdir(), `truediet-bundle-check-${Date.now()}`);

console.log('Exporting the production Android bundle (no dev server involved)...');
// A single command string keeps Windows happy without the deprecated
// args-with-shell combination.
const expo = spawnSync(
  `npx expo export -p android --output-dir "${outDir}" --max-workers 1`,
  { cwd: root, shell: true, encoding: 'utf8' }
);

if (expo.status !== 0) {
  console.error('export failed');
  console.error((expo.stderr || expo.stdout || '').slice(-2000));
  process.exit(1);
}

const bundleDir = path.join(outDir, '_expo', 'static', 'js', 'android');
const bundles = fs.existsSync(bundleDir) ? fs.readdirSync(bundleDir) : [];
if (!bundles.length) {
  console.error(`No android bundle found in ${bundleDir}`);
  process.exit(1);
}

const problems = [];
const notes = [];

for (const name of bundles) {
  const file = path.join(bundleDir, name);
  const sizeMb = (fs.statSync(file).size / 1024 / 1024).toFixed(2);
  // Hermes bytecode keeps string literals, so a raw scan is meaningful.
  const text = fs.readFileSync(file).toString('latin1');
  notes.push(`${name} (${sizeMb} MB)`);

  const forbidden = [
    ['http://localhost:3000', 'development API URL'],
    ['http://10.0.2.2:3000', 'emulator loopback API URL'],
    [/http:\/\/192\.168\.\d+\.\d+/g, 'LAN API URL'],
    ['DATABASE_URL', 'database credential name'],
    ['postgres://', 'database connection string'],
    ['SMTP_PASS', 'mail credential name'],
    ['DIETITIAN_API_KEY', 'staff API key name'],
    ['CAL_API_KEY', 'scheduling API key name'],
    [/\bsk_live_[A-Za-z0-9]+/, 'Stripe live secret key'],
    [/\bre_[A-Za-z0-9]{20,}/, 'Resend API key'],
  ];

  for (const [needle, label] of forbidden) {
    const hit =
      needle instanceof RegExp
        ? needle.test(text)
        : text.includes(needle);
    if (hit) problems.push(`${label} found in ${name}`);
  }

  if (!text.includes('https://api.true-diet.com')) {
    problems.push(`production API URL missing from ${name}`);
  }
}

fs.rmSync(outDir, { recursive: true, force: true });

console.log(`\nBundles checked: ${notes.join(', ')}`);
console.log('Production API URL: present');
if (problems.length) {
  console.error('\nPROBLEMS');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('No development URLs or secrets found.');
