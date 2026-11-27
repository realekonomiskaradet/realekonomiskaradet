// Hämtar export och import av varor och tjänster från SCB:s nationalräkenskaper
// och sparar i src/data/handel.json.
import { readFile, writeFile } from 'node:fs/promises';
import { hamta, idag } from './pxweb.mjs';

const URL_NR = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/NR/NR0103/NR0103E/NR0103ENS2010T01NA';
const UT = new URL('../src/data/handel.json', import.meta.url);

const rader = await hamta(URL_NR, { Anvandningstyp: ['EXVT', 'IMP'], ContentsCode: ['000000RQ'], Tid: { top: 40 } });
const ar = [...new Set(rader.map((r) => r.Tid))].sort()
  .filter((t) => Number(t) >= 2000)
  .map((t) => [Number(t), rader.find((r) => r.Tid === t && r.Anvandningstyp === 'EXVT')?.varde, rader.find((r) => r.Tid === t && r.Anvandningstyp === 'IMP')?.varde])
  .filter(([, e, i]) => e != null && i != null);
if (!ar.length) throw new Error('Inga år hittades');

const gammal = JSON.parse(await readFile(UT, 'utf8'));
await writeFile(UT, JSON.stringify({ ...gammal, hamtad: idag(), ar }, null, 2) + '\n');
const [a, e, i] = ar[ar.length - 1];
console.log(`Handel ${a}: nettoexport ${e - i} mnkr.`);
