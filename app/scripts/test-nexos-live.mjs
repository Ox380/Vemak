#!/usr/bin/env node
// Live Nexos.ai smoke test. Never prints the API key.
import { answerWithAiMentor } from '../server/ai-mentor.mjs';

const hasKey = typeof process.env.NEXOS_API_KEY === 'string' && process.env.NEXOS_API_KEY.trim() !== '';
if (!hasKey) {
  console.error('FAIL: NEXOS_API_KEY is not loaded in this process.');
  process.exit(2);
}

console.log(`model=${process.env.NEXOS_MODEL || '(missing)'}`);
console.log(`endpoint=${process.env.NEXOS_API_URL || 'https://api.nexos.ai/v1/chat/completions'}`);
console.log('sending_live_request=true');

const result = await answerWithAiMentor({
  question: 'Ką reiškia rezervas šiame žaidime?',
  context: {
    reports: [{
      week: 1,
      delta: 25,
      netWorth: 1025,
      steps: [{ text: 'Rezervas apsaugo nuo netikėtų išlaidų', amount: 25 }],
    }],
  },
});

console.log(`source=${result.source}`);
console.log(`answer=${result.answer}`);
if (result.source !== 'ai') {
  console.error('FAIL: the request fell back to rules; Nexos did not return an AI answer.');
  process.exit(3);
}
console.log('PASS: live Nexos request succeeded.');
