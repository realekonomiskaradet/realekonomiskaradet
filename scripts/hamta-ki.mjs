// Hämtar begränsande faktorer och kapacitetsutnyttjande från KI:s Konjunkturbarometer
// och sparar i src/data/kapacitet.json. Körs av GitHub Actions (.github/workflows/hamta-data.yml).
import { readFile } from 'node:fs/promises';
import { hamta, idag, spara } from './pxweb.mjs';

const BAS = 'https://statistik.konj.se/PxWeb/api/v1/sv/KonjBar';
const UT = new URL('../src/data/kapacitet.json', import.meta.url);
const SERIE = 'O'; // Ej säsongrensat: andel företag i procent.

const sektorer = [
  { namn: 'Tillverkningsindustri', tabell: 'ftgkvartal/Barindq.px', bransch: 'BTVI',
    fragor: { efterfragan: '1292', arbetskraft: '1294', material: '1293', finansiering: '1295', inga: '1291', kapacitetsutnyttjande: '104' } },
  { namn: 'Byggverksamhet', tabell: 'ftgmanad/Barboam.px', bransch: 'BBYG',
    fragor: { efterfragan: '1082', arbetskraft: '1084', material: '1083', finansiering: '1086', inga: '1081' } },
  { namn: 'Tjänstesektorn', tabell: 'ftgkvartal/Bartjaq.px', bransch: 'BTJA',
    fragor: { efterfragan: '1162', arbetskraft: '1163', material: '1164', finansiering: '1165', inga: '1161', resursutnyttjande: '109' } },
];

const ut = [];
for (const s of sektorer) {
  const rader = await hamta(`${BAS}/${s.tabell}`, { Bransch: [s.bransch], 'Fråga': Object.values(s.fragor), Serie: [SERIE], Period: { top: 6 } });
  const perioder = [...new Set(rader.map((r) => r.Period))].sort().reverse();
  // Senaste period där alla frågor har ett värde.
  const period = perioder.find((p) => Object.values(s.fragor).every((f) => rader.some((r) => r.Period === p && r['Fråga'] === f && r.varde !== null)));
  if (!period) throw new Error(`Inga kompletta värden för ${s.namn}`);
  const post = { namn: s.namn, period };
  for (const [namn, f] of Object.entries(s.fragor)) post[namn] = rader.find((r) => r.Period === period && r['Fråga'] === f).varde;
  ut.push(post);
}

const tot = await hamta(`${BAS}/ftgkvartal/Bartotq.px`, { Bransch: ['BTOT'], 'Fråga': ['oeft2', 'brip'], Serie: [SERIE], Period: { top: 40 } });
const serie = (f) => tot.filter((r) => r['Fråga'] === f && r.varde !== null && r.Period >= '2022Q1').map((r) => [r.Period, r.varde]).sort((a, b) => a[0].localeCompare(b[0]));

const gammal = JSON.parse(await readFile(UT, 'utf8'));
const data = { kalla: gammal.kalla, hamtad: idag(), sektorer: ut, naringslivet: { efterfragan: serie('oeft2'), bristArbetskraft: serie('brip') } };
await spara(UT, data);
console.log('KI:', ut.map((s) => `${s.namn} ${s.period}: efterfrågan ${s.efterfragan} %`).join('; '));
