// Räknar om behoven i src/data/behov.json till heltidsår under en tioårsperiod.
import b from '../data/behov.json';
import mot from '../data/motsvarar.json';
import aku from '../data/aku.json';
import glapp from '../data/glapp.json';

export const AR = 10;
export const kr = mot.metod.krPerTimme;
export const ht = b.heltidsar;
export const fr = glapp.jamforelser.find((j: any) => j.standard)!.varde as number;
// Personer över friktionsnivån och förlorade heltidsår på tio år.
export const gap = aku.arbetskraft * ((aku.arbetsloshet - fr) / 100);
export const gapTioAr = gap * AR;
const timPerEnhet: Record<string, number> = Object.fromEntries(mot.enheter.map((e: any) => [e.id, e.timmar]));
export const timmarPerLgh = timPerEnhet.lgh;

export const poster = b.poster.map((p: any) => {
  // Heltidsår för en gång (engang) eller för ett år (per år).
  const ett = p.personer ?? (p.mdkr ? (p.mdkr * 1e9) / kr : p.antal * timPerEnhet[p.enhet]) / ht;
  // Personalbehov som växer till en nivå år 2033: räknas som en jämn ökning, i snitt halva nivån över tio år.
  const tioAr = p.typ === 'engang' ? ett : p.personer ? (ett * AR) / 2 : ett * AR;
  return { ...p, ett, tioAr };
});
export const summaTioAr = poster.reduce((s, p) => s + p.tioAr, 0);
export const andra = b.andraUppskattningar;
export const utanSiffra = b.utanSiffra.map((u: any) => ({ ...u, tioAr: u.mdkrPerAr ? (u.mdkrPerAr * 1e9 / kr / ht) * AR : 0 }));
export const summaInklUpp = summaTioAr + utanSiffra.reduce((s: number, u: any) => s + u.tioAr, 0);

// Indata till räknaren "Bemanna behoven". Alla poster kommer med, även de uppskattade (klimat och pensioner).
import m from '../data/multiplikatorer.json';
import handel from '../data/handel.json';
import type { Indata } from './bemanna';
// Samma ordning som staplarna i fliken Behov. Okända poster hamnar först.
const ORDNING = ['bost', 'vard', 'fors', 'va', 'jvg', 'vag'];
export function indata(): Indata {
  const lista = [
    ...[...poster].sort((a: any, b: any) => ORDNING.indexOf(a.id) - ORDNING.indexOf(b.id)).map((p: any) => ({ id: p.id, namn: p.kort, heltidsarPerAr: p.tioAr / AR, instrument: p.instrument })),
    ...utanSiffra.filter((u: any) => u.tioAr).map((u: any) => ({ id: u.namn, namn: u.namn, heltidsarPerAr: u.tioAr / AR, instrument: u.instrument, uppskattad: true })),
  ];
  const mult: Indata['mult'] = Object.fromEntries([...m.instrument, m.transfereringar, m.forsvar].map((i: any) => [i.id, { aktiv: i.aktiv, passiv: i.passiv }]));
  const [, ex, im] = handel.ar[handel.ar.length - 1];
  const { text, kalla, url, ...importandel } = m.importandel;
  return {
    poster: lista, mult, importandel: importandel as Record<string, number>,
    bnp: m.bnpMnkr / 1000, lf: aku.arbetskraft, u: aku.arbetsloshet, fr, ht, kr,
    elasticitet: [m.budgetelasticitet.hog, m.budgetelasticitet.lag],
    nettoexport: (ex - im) / 1000,
  };
}
// Hela behovet utan de uppskattade posterna.
export const andelarFull = (d: Indata) => d.poster.map((p) => (p.uppskattad ? 0 : 1));
