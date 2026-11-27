// Hjälpfunktioner för PxWeb-API:er (SCB och Konjunkturinstitutet).
const vanta = (ms) => new Promise((r) => setTimeout(r, ms));

// Hämtar en tabell. urval: { variabelkod: ['värde', ...] | { top: n } }.
// Variabelkoder kan anges med början av namnet, t.ex. 'Bransch' för 'Bransch (SNI 2007)'.
export async function hamta(url, urval) {
  await vanta(1000);
  const meta = await fetch(url);
  if (!meta.ok) throw new Error(`${url} svarade ${meta.status} (metadata)`);
  const variabler = (await meta.json()).variables.map((v) => v.code);
  const query = Object.entries(urval).map(([kod, val]) => {
    const code = variabler.find((v) => v === kod || v.startsWith(kod));
    if (!code) throw new Error(`Variabeln ${kod} finns inte i ${url}`);
    const selection = Array.isArray(val) ? { filter: 'item', values: val } : { filter: 'top', values: [String(val.top)] };
    return { code, selection };
  });
  await vanta(1000);
  const svar = await fetch(url, { method: 'POST', body: JSON.stringify({ query, response: { format: 'json' } }) });
  if (!svar.ok) throw new Error(`${url} svarade ${svar.status}`);
  const json = await svar.json();
  const koder = json.columns.filter((c) => c.type !== 'c').map((c) => c.code);
  return json.data.map((d) => {
    const rad = Object.fromEntries(koder.map((k, i) => [k, d.key[i]]));
    rad.varde = d.values[0] === '..' || d.values[0] === '' ? null : Number(d.values[0]);
    return rad;
  });
}

export const idag = () => new Date().toISOString().slice(0, 10);

// Sparar bara om siffrorna har ändrats, så att hämtningsdatumet inte ger en ny version varje vecka.
import { readFile, writeFile } from 'node:fs/promises';
export async function spara(fil, data) {
  let gammal = null;
  try { gammal = JSON.parse(await readFile(fil, 'utf8')); } catch {}
  const utan = (d) => JSON.stringify({ ...d, hamtad: undefined });
  if (gammal && utan(gammal) === utan(data)) { console.log(`Oförändrat: ${fil.pathname.split('/').pop()}`); return false; }
  await writeFile(fil, JSON.stringify(data, null, 2) + '\n');
  return true;
}
