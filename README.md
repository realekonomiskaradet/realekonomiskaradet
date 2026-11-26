# Realekonomiska rådet

Källkod för realekonomiskaradet.se. Byggd med [Astro](https://astro.build) som en statisk sajt: inga servrar och ingen databas.

## Så skriver du en text

Texterna är vanliga textfiler i Markdown. Du kan redigera dem direkt på GitHub: öppna filen, klicka på pennan, skriv och klicka på **Commit changes**.

| Vad | Fil |
|---|---|
| Stegen "Varifrån kommer arbetslösheten?" | `src/innehall/arbetsloshet-steg.md` |
| "Så betalar staten" | `src/innehall/sa-betalar-staten.md` |
| Om RER | `src/pages/om.md` |
| Förslag i policylabbet | `src/pages/policylab/*.md` |

Ett nytt förslag i policylabbet: kopiera en befintlig fil i `src/pages/policylab/`, byt namn och ändra uppgifterna överst (`titel`, `ingress`, `status`, `ordning`). Förslaget dyker då upp i listan automatiskt.

Markdown i korthet:

- `### Rubrik` ger en mellanrubrik.
- `*kursiv*` och `**fet**`.
- `[länktext](https://adress)` ger en länk.
- En tom rad mellan stycken.

## Siffror och antaganden

| Vad | Fil |
|---|---|
| Arbetskraft och arbetslöshet (hämtas automatiskt från SCB varje månad) | `src/data/aku.json` |
| Jämförelsenivåer (KI, lägsta sedan 1970, friktion) | `src/data/glapp.json` |
| "Vad motsvarar det?" (timmar per enhet, källor och metod) | `src/data/motsvarar.json` |
| Måtten i resursmonitorn | `src/data/matt.json` |

`aku.json` uppdateras den 25:e varje månad av GitHub Actions (`.github/workflows/hamta-data.yml`). Hämtningen kan också startas för hand under fliken **Actions** på GitHub: välj "Hämta data från SCB" och klicka på **Run workflow**.

KI:s jämviktsskattning i `glapp.json` förs in för hand efter varje Konjunkturläge (mars, juni, september, december). Ange sida i fältet `kalla`.

## Struktur

- `src/pages/` – en fil per sida. Adressen följer filnamnet.
- `src/layouts/` – sidhuvud, meny och sidfot.
- `src/components/` – glappräknaren, simulatorn och betalningsschemat.
- `src/styles/global.css` – utseendet.
- `public/` – filer som publiceras som de är, till exempel favoritikonen.

## Köra lokalt (frivilligt)

Kräver Node.js 22 eller senare.

```
npm install
npm run dev
```

Öppna sedan http://localhost:4321.

## Publicering

Sajten byggs med `npm run build`, och resultatet hamnar i mappen `dist/`. Cloudflare Pages eller Netlify kan bygga och publicera automatiskt vid varje ändring på huvudgrenen.

## Skriva en ny analys

Skapa en fil i `src/pages/analys/`, till exempel `2027-02-riksbanken.md`. Filnamnet blir adressen. Börja filen så här:

```
---
layout: ../../layouts/Analys.astro
titel: Riksbanken höjer räntan trots att arbetslösheten är 8,6 procent
ingress: En eller två meningar som sammanfattar texten.
datum: 2027-02-12
ramverk: [5, 7]
---

Texten skrivs här, med ### för mellanrubriker.
```

- `ramverk` anger vilka punkter i Ramverket texten bygger på. Raden kan tas bort.
- För en debattartikel i en tidning, lägg till `publicerad: Dagens Nyheter` och `externLank: https://...`. Då länkar listan till tidningen.
- Lägg till `utkast: true` för att spara en text utan att den syns i listan.

## Lägga till en faktasida

Faktasidorna ligger i `src/pages/fakta/`. Listan på `/fakta/` finns överst i `src/pages/fakta/index.astro`. Ändra status till `Klar` och lägg till `url` när sidan finns.
