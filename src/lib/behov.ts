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
export const utanSiffra = b.utanSiffra;
