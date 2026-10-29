#!/usr/bin/env node
// Safe Nexos diagnostic. Never prints the API key or authorization header.
const key = process.env.NEXOS_API_KEY?.trim();
const model = process.env.NEXOS_MODEL?.trim();
const endpoint = process.env.NEXOS_API_URL?.trim() || 'https://api.nexos.ai/v1/chat/completions';

if (!key) {
  console.error('FAIL: NEXOS_API_KEY is missing from this process.');
  process.exit(2);
}
if (!model) {
  console.error('FAIL: NEXOS_MODEL is missing from this process.');
  process.exit(2);
}

const payload = {
  model,
  max_completion_tokens: 80,
  messages: [
    { role: 'system', content: 'Answer briefly in Lithuanian.' },
    { role: 'user', content: 'Vienu sakiniu paaiškink, kam skirtas rezervas finansiniame žaidime.' },
  ],
  n: 1,
  store: false,
};

console.log(`model=${model}`);
console.log(`endpoint=${endpoint}`);
console.log('authorization_header=present (value hidden)');

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 20_000);
try {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  const text = await response.text();
  // Prevent accidental credential disclosure if a provider echoes request data.
  const safe = text
    .replaceAll(key, '[REDACTED_KEY]')
    .replace(/Bearer\s+[^\s"'}]+/gi, 'Bearer [REDACTED]')
    .slice(0, 1200);
  console.log(`http_status=${response.status}`);
  console.log(`content_type=${response.headers.get('content-type') || '(none)'}`);
  console.log(`response=${safe}`);
  if (!response.ok) process.exit(3);
} catch (error) {
  console.log(`error=${error.name}: ${error.message}`);
  process.exit(4);
} finally {
  clearTimeout(timer);
}
