// Hämtar bytesbalansen per år från SCB:s betalningsbalansstatistik
// och sparar i src/data/bytesbalans.json.
import { hamta, idag, spara } from './pxweb.mjs';

const URL_BOP = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/FM/FM0001/FM0001A/FM0001BetBalAr';
const UT = new URL('../src/data/bytesbalans.json', import.meta.url);

// Läs metadata och leta upp posten för bytesbalansen och måttet i miljoner kronor.
const meta = await (await fetch(URL_BOP)).json();
for (const v of meta.variables) console.log(v.code, '|', v.text, '|', v.values.slice(0, 12).map((x, i) => `${x}=${v.valueTexts[i]}`).join('; '));
const tid = meta.variables.find((v) => v.time || /^Tid$/i.test(v.code));
const urval = { [tid.code]: { top: 30 } };
for (const v of meta.variables) {
  if (v === tid) continue;
  const i = v.valueTexts.findIndex((t) => /^bytesbalans/i.test(t.trim()));
  const j = v.valueTexts.findIndex((t) => /netto|saldo/i.test(t));
  const k = v.valueTexts.findIndex((t) => /mnkr|miljoner kronor/i.test(t));
  const val = i >= 0 ? v.values[i] : j >= 0 ? v.values[j] : k >= 0 ? v.values[k] : v.values[0];
  urval[v.code] = [val];
  console.log('Väljer', v.code, '=', val, v.valueTexts[v.values.indexOf(val)]);
}
const rader = await hamta(URL_BOP, urval);
const ar = rader.filter((r) => r.varde != null).map((r) => [Number(r[tid.code].slice(0, 4)), r.varde]).sort((a, b) => a[0] - b[0]);
if (!ar.length) throw new Error('Inga år hittades');
console.log(ar.slice(-5));
await spara(UT, {
  kalla: 'SCB, betalningsbalansen, tabell FM0001BetBalAr. Bytesbalansens saldo (bytesbalans, netto), miljarder kronor, löpande priser.',
  hamtad: idag(),
  ar,
});
