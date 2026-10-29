import { askAnswer } from './ask.mjs';

const DEFAULT_MODEL = 'gpt-4.1-mini';
const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/responses';
const MAX_QUESTION = 240;
const MAX_HISTORY = 6;
const MAX_STEPS = 16;
const euro = (n) => `${Number(n) < 0 ? '−' : ''}${Math.abs(Math.round(Number(n) || 0)).toLocaleString('lt-LT')} €`;

function safeGameSummary(context = {}) {
  const reports = Array.isArray(context.reports) ? context.reports.slice(-MAX_HISTORY) : [];
  return reports.map((report) => {
    const steps = (Array.isArray(report?.steps) ? report.steps : []).slice(0, MAX_STEPS)
      .map((step) => `${String(step?.text || 'Žingsnis').slice(0, 100)}: ${euro(step?.amount)}`);
    return `Savaitė ${Math.max(0, Math.min(6, Number(report?.week) || 0))}: pokytis ${euro(report?.delta)}, grynoji vertė ${euro(report?.netWorth)}. Žingsniai: ${steps.join('; ') || 'nenurodyti'}.`;
  }).join('\n') || 'Ankstesnių savaitės rezultatų nepateikta.';
}

export async function answerWithAiMentor(input = {}, options = {}) {
  const question = String(input.question || '').trim().slice(0, MAX_QUESTION);
  const context = input.context && typeof input.context === 'object' ? input.context : {};
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  const fallback = () => {
    const reports = Array.isArray(context.reports) ? context.reports : [];
    return { ...askAnswer({ question, context: reports.at(-1) || context }), source: 'rules' };
  };
  if (!question || typeof apiKey !== 'string' || !apiKey.trim()) return fallback();

  const endpoint = options.endpoint || process.env.OPENAI_API_URL || DEFAULT_ENDPOINT;
  const model = options.model || process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 12_000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        max_output_tokens: 260,
        input: [
          { role: 'system', content: [{ type: 'input_text', text: 'Tu esi VEMAK mokomasis mentorius lietuvių kalba, skirtas mokyklinio amžiaus žaidėjams. Paaiškink žaidimo taisykles ir tik pateiktus skaičius. Niekada nesugalvok trūkstamų faktų, neprognozuok garantuoto pelno, neprašyk asmens duomenų ir neteik investavimo ar finansinių rekomendacijų. Jei trūksta duomenų, aiškiai pasakyk, kad nežinai. Atsakyk šiltai, paprastai, 2–5 sakiniais. Visi skaičiai yra virtualūs žaidimo eurai.' }] },
          { role: 'user', content: [{ type: 'input_text', text: `Žaidėjo klausimas: ${question}\nŽaidimo rezultatų santrauka:\n${safeGameSummary(context)}` }] },
        ],
      }),
    });
    if (!response.ok) return fallback();
    const data = await response.json();
    const outputText = typeof data.output_text === 'string' ? data.output_text : (data.output || [])
      .flatMap((item) => item.content || [])
      .filter((part) => part.type === 'output_text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join(' ');
    const answer = String(outputText || '').trim().slice(0, 1800);
    if (!answer) return fallback();
    return { answer, grounded: 'AI mentorius atsako pagal pateiktus žaidimo rezultatus. Tai mokomasis paaiškinimas, ne finansinė rekomendacija.', source: 'ai' };
  } catch {
    return fallback();
  } finally {
    clearTimeout(timer);
  }
}
