// Mekanisk räkning: vad händer om staten finansierar behoven i fliken Behov?
// Används både av fliken Behov (förifyllt med hela behovet) och av räknaren /fakta/bemanna-behoven/.
export type Mult = { bnp: number; u: number };
export type Post = { namn: string; heltidsarPerAr: number; instrument: string };
export type Indata = {
  poster: Post[]; mult: Record<string, { aktiv: Mult; passiv: Mult }>;
  bnp: number; lf: number; u: number; fr: number; ht: number; kr: number; elasticitet: [number, number];
};

export function bemanna(d: Indata, andel: number, rb: 'aktiv' | 'passiv') {
  let utgift = 0, dBnp = 0, du = 0;
  for (const p of d.poster) {
    const g = (andel * p.heltidsarPerAr * d.ht * d.kr) / 1e9; // miljarder kronor per år
    const m = d.mult[p.instrument][rb];
    utgift += g;
    dBnp += m.bnp * g;
    du += m.u * (g / d.bnp) * 100; // procentenheter
  }
  const raknadU = d.u + du;
  const nyU = Math.max(d.fr, raknadU);
  const forKort = Math.max(0, ((d.fr - raknadU) / 100) * d.lf); // personer som saknas
  const farreArbetslosa = ((d.u - nyU) / 100) * d.lf;
  const direkt = (utgift * 1e9) / d.kr / d.ht;
  const tillbakaHog = d.elasticitet[0] * dBnp;
  const tillbakaLag = d.elasticitet[1] * dBnp;
  return {
    utgift, dBnp, raknadU, nyU, forKort, farreArbetslosa, direkt,
    kvarOverFr: Math.max(0, ((nyU - d.fr) / 100) * d.lf),
    nettoMin: utgift - tillbakaHog, nettoMax: utgift - tillbakaLag,
    frigoraMdkr: (forKort * d.ht * d.kr) / 1e9,
  };
}
