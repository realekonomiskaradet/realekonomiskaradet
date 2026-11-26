// Hämtar arbetskraftsdata från SCB:s AKU och sparar i src/data/aku.json.
// Körs varje månad av GitHub Actions (.github/workflows/hamta-data.yml).
// Kan också köras för hand: node scripts/hamta-scb.mjs
import { writeFile } from 'node:fs/promises';

const URL = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/AM/AM0401/AM0401A/AKURLBefM';
const UT = new URL('../src/data/aku.json', import.meta.url);

// Säsongrensade och utjämnade värden (trend), 15–74 år, båda könen.
const fraga = {
  query: [
    { code: 'Arbetskraftstillh', selection: { filter: 'item', values: ['ALÖSP', 'IAKR', 'ALÖS'] } },
    { code: 'TypData', selection: { filter: 'item', values: ['TC_DATA'] } },
    { code: 'Kon', selection: { filter: 'item', values: ['1+2'] } },
    { code: 'Alder', selection: { filter: 'item', values: ['tot15-74'] } },
  ],
  response: { format: 'json' },
};

const svar = await fetch(URL, { method: 'POST', body: JSON.stringify(fraga) });
if (!svar.ok) throw new Error(`SCB svarade ${svar.status}`);
const json = await svar.json();

const serie = { ALÖSP: [], IAKR: [], ALÖS: [] };
for (const rad of json.data) {
  const [matt, , , , tid] = rad.key;
  const v = Number(rad.values[0]);
  if (Number.isFinite(v)) serie[matt].push([tid, v]);
}
for (const s of Object.values(serie)) s.sort((a, b) => a[0].localeCompare(b[0]));

const sista = (s) => s[s.length - 1];
const [period, arbetsloshet] = sista(serie.ALÖSP);
const lagsta = serie.ALÖSP.reduce((a, b) => (b[1] < a[1] ? b : a));
const forsta = serie.ALÖSP[0][0];

const data = {
  kalla: 'SCB, arbetskraftsundersökningarna (AKU), tabell AKURLBefM. Säsongrensade och utjämnade värden, 15–74 år.',
  hamtad: new Date().toISOString().slice(0, 10),
  period,
  arbetskraft: Math.round(sista(serie.IAKR)[1] * 1000),
  arbetslosa: Math.round(sista(serie.ALÖS)[1] * 1000),
  arbetsloshet,
  lagstaSedan: { fran: forsta, period: lagsta[0], varde: lagsta[1] },
  historik: serie.ALÖSP.slice(-60),
};

await writeFile(UT, JSON.stringify(data, null, 2) + '\n');
console.log(`Sparade ${period}: arbetslöshet ${arbetsloshet} %, arbetskraft ${data.arbetskraft}.`);
