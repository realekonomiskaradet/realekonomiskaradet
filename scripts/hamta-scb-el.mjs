// Hämtar elproduktion, export och import från SCB och sparar i src/data/el.json.
import { readFile } from 'node:fs/promises';
import { hamta, idag, spara } from './pxweb.mjs';

const SCB = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/EN';
const UT = new URL('../src/data/el.json', import.meta.url);
const FRAN = 2019;

// Produktion = total tillförsel (netto) minus import, per år.
const prod = await hamta(`${SCB}/EN0105/EN0105A/ElProdAr`, { Prodslag: ['Tot', 'Imp'], ContentsCode: ['EN0105A4'], Tid: { top: 15 } });
// Export och import per månad, summeras till hela år.
const handel = await hamta(`${SCB}/EN0108/EN0108A/ElimpexpM`, { Land: ['totexp', 'totimp'], ContentsCode: ['000005J8'], Tid: { top: 180 } });

const ar = [];
for (const tid of [...new Set(prod.map((r) => r.Tid))].sort()) {
  const a = Number(tid);
  if (a < FRAN) continue;
  const tot = prod.find((r) => r.Tid === tid && r.Prodslag === 'Tot')?.varde;
  const imp = prod.find((r) => r.Tid === tid && r.Prodslag === 'Imp')?.varde;
  const man = handel.filter((r) => r.Tid.startsWith(`${tid}M`) && r.varde !== null);
  if (tot == null || imp == null || man.filter((r) => r.Land === 'totexp').length < 12) continue;
  const summa = (land) => Math.round(man.filter((r) => r.Land === land).reduce((s, r) => s + r.varde, 0));
  ar.push({ ar: a, produktion: Math.round(tot - imp), export: summa('totexp'), import: summa('totimp') });
}
if (!ar.length) throw new Error('Inga hela år hittades');

const gammal = JSON.parse(await readFile(UT, 'utf8'));
await spara(UT, { ...gammal, hamtad: idag(), ar });
const s = ar[ar.length - 1];
console.log(`El ${s.ar}: produktion ${s.produktion} GWh, nettoexport ${s.export - s.import} GWh.`);
