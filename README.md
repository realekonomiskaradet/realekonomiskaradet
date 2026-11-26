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
| Arbetskraft, arbetslöshet, jämförelsenivåer | `src/data/glapp.json` |
| "Vad motsvarar det?" (timmar per enhet) | `src/data/motsvarar.json` |
| Måtten i resursmonitorn | `src/data/matt.json` |

Siffrorna i `glapp.json` är exempelvärden. De ska ersättas av automatisk hämtning från SCB och KI.

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
