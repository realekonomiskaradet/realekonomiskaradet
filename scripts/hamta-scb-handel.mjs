// Hämtar export och import av varor och tjänster från SCB:s nationalräkenskaper
// och sparar i src/data/handel.json.
import { readFile } from 'node:fs/promises';
import { hamta, idag, spara } from './pxweb.mjs';

const URL_NR = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/NR/NR0103/NR0103E/NR0103ENS2010T01NA';
const UT = new URL('../src/data/handel.json', import.meta.url);

const rader = await hamta(URL_NR, { Anvandningstyp: ['EXVT', 'IMP', 'BNPM'], ContentsCode: ['000000RQ'], Tid: { top: 40 } });
const ar = [...new Set(rader.map((r) => r.Tid))].sort()
  .filter((t) => Number(t) >= 2000)
  .map((t) => [Number(t), rader.find((r) => r.Tid === t && r.Anvandningstyp === 'EXVT')?.varde, rader.find((r) => r.Tid === t && r.Anvandningstyp === 'IMP')?.varde])
  .filter(([, e, i]) => e != null && i != null);
if (!ar.length) throw new Error('Inga år hittades');

const gammal = JSON.parse(await readFile(UT, 'utf8'));
await spara(UT, { ...gammal, hamtad: idag(), ar });
const [a, e, i] = ar[ar.length - 1];
console.log(`Handel ${a}: nettoexport ${e - i} mnkr.`);

// BNP till marknadspris för räknaren "Om staten använder mer".
const MULT = new URL('../src/data/multiplikatorer.json', import.meta.url);
const bnp = rader.filter((r) => r.Anvandningstyp === 'BNPM' && r.varde != null).sort((x, y) => x.Tid.localeCompare(y.Tid)).pop();
if (bnp) {
  const m = JSON.parse(await readFile(MULT, 'utf8'));
  await spara(MULT, { ...m, bnpMnkr: bnp.varde, bnpAr: Number(bnp.Tid) });
  console.log(`BNP ${bnp.Tid}: ${bnp.varde} mnkr.`);
}
