// Mekanisk räkning: vad händer om staten finansierar behoven i fliken Behov?
// Används både av fliken Behov (förifyllt med hela behovet) och av räknaren /fakta/bemanna-behoven/.
export type Mult = { bnp: number; u: number };
export type Post = { id: string; namn: string; heltidsarPerAr: number; instrument: string; uppskattad?: boolean };
export type Indata = {
  poster: Post[]; mult: Record<string, { aktiv: Mult; passiv: Mult }>; importandel: Record<string, number>;
  bnp: number; lf: number; u: number; fr: number; ht: number; kr: number; elasticitet: [number, number];
  nettoexport: number;
};
export type Ovrigt = { mdkr: number; instrument: string };

// andelar: hur stor del av varje behov som genomförs, i samma ordning som d.poster (1 = hela behovet).
export function bemanna(d: Indata, andelar: number[], rb: 'aktiv' | 'passiv', ovrigt: Ovrigt = { mdkr: 0, instrument: 'kons' }) {
  let utgift = 0, dBnp = 0, du = 0, imp = 0;
  const per: number[] = []; // miljarder kronor per år, per post
  const duPer: number[] = []; // procentenheter, per post (övrigt sist)
  const lagg = (g: number, instrument: string) => {
    const m = d.mult[instrument][rb];
    utgift += g;
    dBnp += m.bnp * g;
    const x = m.u * (g / d.bnp) * 100; // procentenheter
    du += x;
    duPer.push(x);
    imp += g * (d.importandel[instrument] ?? 0) / 100;
  };
  d.poster.forEach((p, i) => {
    const g = ((andelar[i] ?? 0) * p.heltidsarPerAr * d.ht * d.kr) / 1e9;
    per.push(g);
    lagg(g, p.instrument);
  });
  lagg(Math.max(0, ovrigt.mdkr), ovrigt.instrument);
  const raknadU = d.u + du;
  const nyU = Math.max(d.fr, raknadU);
  const forKort = Math.max(0, ((d.fr - raknadU) / 100) * d.lf); // personer som saknas
  const farreArbetslosa = ((d.u - nyU) / 100) * d.lf;
  const direkt = (utgift * 1e9) / d.kr / d.ht;
  const tillbakaHog = d.elasticitet[0] * dBnp;
  const tillbakaLag = d.elasticitet[1] * dBnp;
  return {
    utgift, dBnp, raknadU, nyU, forKort, farreArbetslosa, direkt, per, duPer,
    // Hur stor del av de lediga (över friktionsnivån) som behövs, enligt multiplikatorerna. Över 1 = arbetskraften räcker inte.
    bankAndel: (d.u - raknadU) / (d.u - d.fr),
    kvarOverFr: Math.max(0, ((nyU - d.fr) / 100) * d.lf),
    nettoMin: utgift - tillbakaHog, nettoMax: utgift - tillbakaLag,
    frigoraMdkr: (forKort * d.ht * d.kr) / 1e9,
    import: imp,
  };
}
