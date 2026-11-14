/**
 * Creates the Android upload keystore and android/keystore.properties.
 *
 * The password is generated locally, passed to keytool through an environment
 * variable (never a command-line argument, never printed), and written only to
 * android/keystore.properties which is gitignored.
 *
 *   node scripts/create-android-keystore.mjs
 *
 * Refuses to overwrite an existing keystore - losing the upload key means you
 * can no longer ship updates to an app already on Play.
 */
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const keytool = process.env.KEYTOOL_PATH;
if (!keytool || !fs.existsSync(keytool)) {
  console.error('Set KEYTOOL_PATH to the JDK keytool executable.');
  process.exit(1);
}

const keystoreDir = path.join(root, 'android', 'keystore');
const keystoreFile = path.join(keystoreDir, 'truediet-upload.jks');
const propsFile = path.join(root, 'android', 'keystore.properties');

if (fs.existsSync(keystoreFile)) {
  console.error(`Refusing to overwrite existing keystore: ${keystoreFile}`);
  process.exit(1);
}

fs.mkdirSync(keystoreDir, { recursive: true });

const alias = 'truediet';
const password = crypto.randomBytes(24).toString('base64url');

const result = spawnSync(
  keytool,
  [
    '-genkeypair',
    '-v',
    '-storetype', 'JKS',
    '-keystore', keystoreFile,
    '-alias', alias,
    '-keyalg', 'RSA',
    '-keysize', '2048',
    '-validity', '10000',
    '-dname', 'CN=True Diet, OU=Mobile, O=True Diet, L=New York, ST=NY, C=US',
    '-storepass:env', 'TD_KEYSTORE_PASS',
    '-keypass:env', 'TD_KEYSTORE_PASS',
  ],
  { env: { ...process.env, TD_KEYSTORE_PASS: password }, encoding: 'utf8' }
);

if (result.status !== 0) {
  console.error('keytool failed');
  console.error(result.stderr || result.stdout);
  process.exit(1);
}

const props = [
  '# Android release signing. GITIGNORED - never commit this file.',
  '# Losing this keystore or its password means no further updates to the',
  '# Play Store listing are possible. Back both up offline.',
  `storeFile=keystore/truediet-upload.jks`,
  `storePassword=${password}`,
  `keyAlias=${alias}`,
  `keyPassword=${password}`,
  '',
].join('\n');

fs.writeFileSync(propsFile, props, { mode: 0o600 });

console.log(`keystore:   ${path.relative(root, keystoreFile)}`);
console.log(`properties: ${path.relative(root, propsFile)} (gitignored)`);
console.log('password is stored in keystore.properties only - back it up now.');
