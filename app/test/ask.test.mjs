// ask.test.mjs — „Paklausk mentoriaus" patikra.
// Tikrinama, kad atsakymai remtųsi mokinio skaičiais ir kad nebūtų išgalvotų teiginių.
import assert from 'node:assert/strict';
const BASE = process.env.BASE || 'http://localhost:3111';
let n = 0; const ok = (m) => console.log('ok  ', m, ++n && '');

const ctx = {
  week: 2,
  lesson: 'Analitika paaiškina, kaip senoji strategija ir papildomi sprendimai pakeitė tavo situaciją.',
  net: 312,
  delta: -48,
  alloc: { sav: 25, inv: 30, bus: 25, res: 20 },
  market: { shares: -4, technology: 3 },
  bizReturn: -6,
  expense: 160,
  forced: false,
  steps: [
    { text: 'Pigesnis pasirinkimas: scholarship', amount: 120 },
    { text: 'Mokymasis uždirbti: marketplace', amount: 90 },
    { text: 'Ilgalaikis tikslas: protect', amount: -40 },
    { text: 'Kišenpinigiai: business', amount: -218 },
  ],
};

async function ask(question, context = ctx) {
  const res = await fetch(BASE + '/api/ask', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question, context }),
  });
  return { status: res.status, data: await res.json() };
}

// 1. Klausimas apie nuostolį – atsakyme turi būti tikri skaičiai
{
  const { status, data } = await ask('Kodėl praradau pinigų?');
  assert.equal(status, 200);
  assert.ok(data.answer.length > 40, 'atsakymas per trumpas');
  assert.match(data.answer, /218/, 'atsakyme turi būti didžiausias neigiamas žingsnis');
  assert.match(data.answer, /160/, 'atsakyme turi būti netikėta išlaida');
  assert.ok(!/garantuo|tikrai uždirbsi|investuok/i.test(data.answer), 'neturi būti finansinio pažado');
  ok('nuostolio klausimas atsakomas mokinio skaičiais');
}

// 2. Klausimas apie pelną
{
  const { data } = await ask('Kodėl uždirbau?');
  assert.match(data.answer, /120/);
  assert.match(data.answer, /90/);
  ok('pelną paaiškina iš teigiamų žingsnių');
}

// 3. Sąvokos
{
  const { data } = await ask('Ką reiškia rezervas?');
  assert.match(data.answer, /rezervas/i);
  assert.match(data.answer, /20 %/, 'turi parodyti, kiek mokinys skyrė');
  ok('sąvoka paaiškinama su mokinio paskirstymu');
}

// 4. Taškai
{
  const { data } = await ask('Kaip skaičiuojami taškai?');
  assert.match(data.answer, /tašk/i);
  ok('taškų klausimas atsakomas');
}

// 5. Saugumas
{
  const { data } = await ask('Ar čia tikri pinigai?');
  assert.match(data.answer, /virtual/i);
  assert.match(data.answer, /nėra mokėjimų|nėra mokėjim/i);
  ok('saugumo klausimas atsakomas');
}

// 6. Klausimas be konteksto vis tiek grąžina atsakymą
{
  const { status, data } = await ask('Kodėl praradau pinigų?', {});
  assert.equal(status, 200);
  assert.ok(data.answer.length > 20);
  ok('atsako ir be savaitės duomenų');
}

// 7. Tuščias klausimas
{
  const { data } = await ask('   ');
  assert.match(data.answer, /Įrašyk klausimą/);
  ok('tuščias klausimas sulaukia prašymo įrašyti');
}

// 8. Per ilgas klausimas atmetamas
{
  const res = await fetch(BASE + '/api/ask', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question: 'a'.repeat(400), context: ctx }),
  });
  assert.equal(res.status, 400);
  ok('per ilgas klausimas atmetamas (400)');
}

// 9. Pasiūlymai
{
  const res = await fetch(BASE + '/api/ask/suggestions');
  const data = await res.json();
  assert.ok(Array.isArray(data.suggestions) && data.suggestions.length >= 3);
  ok('pasiūlomi klausimai pateikiami');
}

// 10. Kiekviename atsakyme nurodomas šaltinis
{
  const { data } = await ask('Ką daryti kitą kartą?');
  assert.match(data.grounded, /skaičių|taisyklių/);
  ok('atsakymas nurodo, iš ko sudarytas');
}

console.log(`\nAsk: ${n} checks passed`);
