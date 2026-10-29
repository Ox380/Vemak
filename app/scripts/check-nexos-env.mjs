#!/usr/bin/env node
// Safe Nexos environment diagnostic. Never prints secret values.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const names = ['NEXOS_API_KEY', 'NEXOS_MODEL', 'NEXOS_API_URL'];
const maskStatus = (value) => {
  if (value === undefined) return 'missing';
  if (value.trim() === '') return 'present-but-empty';
  return `loaded (${value.length} characters)`;
};

function envFileStatus(file) {
  if (!fs.existsSync(file)) return { exists: false, keys: {} };
  const keys = {};
  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, raw] = match;
    const value = raw.replace(/^['"]|['"]$/g, '').trim();
    if (names.includes(key)) keys[key] = value === '' ? 'present-but-empty' : 'present';
  }
  return { exists: true, keys };
}

console.log(`working_directory=${root}`);
console.log(`process.NEXOS_API_KEY=${maskStatus(process.env.NEXOS_API_KEY)}`);
console.log(`process.NEXOS_MODEL=${process.env.NEXOS_MODEL || 'missing'}`);
console.log(`process.NEXOS_API_URL=${process.env.NEXOS_API_URL || 'default: https://api.nexos.ai/v1/chat/completions'}`);

for (const name of ['.env', '.env.local', '.env.production']) {
  const file = path.join(root, name);
  const status = envFileStatus(file);
  console.log(`${name}=${status.exists ? 'exists' : 'missing'}`);
  for (const key of names) {
    if (status.keys[key]) console.log(`${name}.${key}=${status.keys[key]}`);
  }
}

const loaded = typeof process.env.NEXOS_API_KEY === 'string' && process.env.NEXOS_API_KEY.trim() !== '';
if (loaded) {
  console.log('diagnosis=API key is available to this process; live requests can authenticate.');
  process.exit(0);
}

const localKey = ['.env', '.env.local', '.env.production']
  .map((name) => envFileStatus(path.join(root, name)).keys.NEXOS_API_KEY)
  .find(Boolean);
if (localKey === 'present') {
  console.log('diagnosis=API key exists in a local env file but is not loaded into this Node process. Start the server with an environment loader or inject the variable in the hosting app settings.');
} else if (localKey === 'present-but-empty') {
  console.log('diagnosis=an env file contains an empty NEXOS_API_KEY. Add the key through the hosting Environment settings; do not commit it.');
} else {
  console.log('diagnosis=API key is not available to this process and was not found in local env files. The hosting app has not injected it into this runtime.');
}
process.exit(2);
