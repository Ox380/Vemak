import assert from 'node:assert/strict';
import http from 'node:http';
import { answerWithAiMentor } from './ai-mentor.mjs';

const listen = async (handler) => {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, endpoint: `http://127.0.0.1:${server.address().port}/v1/responses` };
};

const fallback = await answerWithAiMentor({ question: 'Kaip skaičiuojami taškai?', context: {} }, { apiKey: '' });
assert.equal(fallback.source, 'rules');
assert.match(fallback.answer, /strategijos taškai/i);

let captured;
const stub = await listen(async (req, res) => {
  captured = { method: req.method, authorization: req.headers.authorization, body: JSON.parse(await new Promise((resolve) => { let data = ''; req.on('data', (chunk) => data += chunk); req.on('end', () => resolve(data)); })) };
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'Tavo rezultatas sumažėjo dėl netikėtos išlaidos.' }] }] }));
});
try {
  const result = await answerWithAiMentor({ question: 'Kodėl sumažėjo rezultatas?', context: { nickname: 'PRIVATUS-VARDAS', reports: [{ week: 1, delta: -40, netWorth: 960, steps: [{ text: 'Netikėta išlaida', amount: -40 }] }] } }, { apiKey: 'test-key', endpoint: stub.endpoint });
  assert.equal(result.source, 'ai');
  assert.match(result.answer, /netikėtos išlaidos/i);
  assert.equal(captured.method, 'POST');
  assert.equal(captured.authorization, 'Bearer test-key');
  assert.equal(JSON.stringify(captured.body).includes('PRIVATUS-VARDAS'), false, 'personal identifiers are not sent to the AI provider');
  assert.match(captured.body.input[1].content[0].text, /netikėta išlaida/i);
  const broken = await answerWithAiMentor({ question: 'Ką reiškia rezervas?', context: {} }, { apiKey: 'test-key', endpoint: 'http://127.0.0.1:1/v1/responses', timeoutMs: 100 });
  assert.equal(broken.source, 'rules');
  assert.match(broken.answer, /rezerv/i);
} finally {
  await new Promise((resolve) => stub.server.close(resolve));
}

let compatibleRequest;
const compatible = await listen(async (req, res) => {
  compatibleRequest = JSON.parse(await new Promise((resolve) => { let data = ''; req.on('data', (chunk) => data += chunk); req.on('end', () => resolve(data)); }));
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ choices: [{ message: { content: 'Rezervas padeda padengti netikėtas išlaidas.' } }] }));
});
const previous = { key: process.env.NEXOS_API_KEY, model: process.env.NEXOS_MODEL, url: process.env.NEXOS_API_URL };
try {
  process.env.NEXOS_API_KEY = 'nexos-test-key';
  process.env.NEXOS_MODEL = 'Nexos modelis';
  process.env.NEXOS_API_URL = compatible.endpoint.replace('/v1/responses', '/v1/chat/completions');
  const result = await answerWithAiMentor({ question: 'Kam skirtas rezervas?', context: { reports: [{ week: 1, delta: -20, netWorth: 980, steps: [{ text: 'Netikėta išlaida', amount: -20 }] }] } });
  assert.equal(result.source, 'ai');
  assert.match(result.answer, /netikėtas išlaidas/i);
  assert.equal(compatibleRequest.model, 'Nexos modelis');
  assert.equal(compatibleRequest.messages[1].role, 'user');
  assert.match(compatibleRequest.messages[1].content, /netikėta išlaida/i);
} finally {
  for (const [name, value] of [['NEXOS_API_KEY', previous.key], ['NEXOS_MODEL', previous.model], ['NEXOS_API_URL', previous.url]]) {
    if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
  await new Promise((resolve) => compatible.server.close(resolve));
}
console.log('AI mentor: 4 checks passed');
