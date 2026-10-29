---
name: VEMAK
description: Finansinio raštingumo žaidimas klasėms ir asmeniniam naudojimui
colors:
  navy: "#0f1e3d"
  navy-2: "#16294f"
  ink: "#17243f"
  muted: "#5f7191"
  bg: "#f4f7fc"
  card: "#ffffff"
  line: "#e3eaf5"
  line-soft: "#eef3fa"
  teal: "#12b48c"
  teal-d: "#067456"
  teal-l: "#e3f8f1"
  blue: "#3b82f6"
  blue-d: "#1d4ed8"
  purple: "#7c5cff"
  amber: "#f5a524"
  red: "#ef5b4d"
  red-d: "#c0392b"
typography:
  display:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.05rem, 5.2vw, 3.4rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.6rem, 3.6vw, 2.35rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.01em"
rounded:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "26px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "38px"
  section: "72px"
  section-mobile: "48px"
  wrap: "1120px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.card}"
    rounded: "{rounded.pill}"
    padding: "13px 22px"
    size: "min-height 48px"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    padding: "13px 22px"
    size: "min-height 48px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "22px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 13px"
  chip:
    backgroundColor: "{colors.teal-l}"
    textColor: "{colors.teal-d}"
    rounded: "{rounded.pill}"
    padding: "4px 11px"
  tab-active:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.card}"
    rounded: "{rounded.pill}"
    padding: "9px 15px"
---

# Design System: VEMAK

## Overview

**Creative North Star: "Rami klasės lenta"**

VEMAK atrodo kaip tvarkinga klasės lenta, o ne kaip banko programa. Paviršius šviesus ir orus, informacija sudėliota ramiai, o vienintelis garsus elementas yra žalias akcentas, kuris pasirodo tik ten, kur vartotojas turi ką nors daryti. Puslapis neturi fotografijų, išorinių šriftų ar dekoratyvinių iliustracijų: vienintelė iliustracija yra procedūriškai nupieštas izometrinis miestas, kuris auga kartu su mokinio pažanga, ir jis yra informacija, ne puošmena.

Sistema remiasi trimis tonais — šviesiu fonu, baltomis kortelėmis ir tamsiu navy tekstu — ir vienu prasmingu akcentu. Gilumas perteikiamas šešėlių skalė, kuri niekada nėra juoda: visi šešėliai dažyti navy atspalviu, todėl paviršius atrodo šiltas, o ne „plastikinis“. Kampų spinduliai dideli ir nuoseklūs, kraštinės plonos, o visi sąveikos elementai turi aiškias būsenas.

Mokytojo ir mokinio ekranai yra **Operate** režimo: tankesni, tylesni, su nusistovėjusiais šablonais. Pagrindinis puslapis ir planų sekcija yra **Persuade**: drąsesni, bet vis dar toje pačioje spalvų ir formų kalboje.

**Key Characteristics:**
- Šviesus fonas `#f4f7fc`, baltos kortelės, navy tekstas — jokių tamsių blokų, išskyrus hero.
- Vienas žalias akcentas, naudojamas taupiai.
- Procedūrinė grafika: jokių išorinių paveikslų, šriftų ar CDN.
- Visi simboliai nubrėžti SVG — jokių emoji ar unikodo glifų kaip ikonų.
- Didelis, bet nuoseklus kampų apvalinimas ir plonos 1px kraštinės.

## Colors

Rami šviesi paletė su vienu žaliu akcentu ir navy tekstu; spalva žymi veiksmą arba būseną, niekada nelinkama dekoratyviai.

### Primary
- **Brand teal** (`#12b48c`, gradientas `linear-gradient(135deg,#14c79a,#0ea5b7)`): pagrindiniai mygtukai, aktyvūs elementai, XP juosta, akcento taškas prie antraščių. Naudojama retai — žr. Rarity Rule.
- **Teal text** (`#067456`): ta pati šeima, bet tamsinta iki WCAG AA. Visa žalio atspalvio **tekstas** naudoja šią reikšmę, o ne `#12b48c`.

### Secondary
- **Blue** (`#3b82f6`, tamsi `#1d4ed8`, šviesi `#e7f0ff`): informaciniai pranešimai, privatumo pastabos, nuorodos.
- **Purple** (`#7c5cff`): antroji auditorijos akcento spalva (asmeninė versija, antroji naudos kortelė).

### Tertiary
- **Amber** (`#f5a524`, tekstui `#8a5a00`): žingsnių žymos, įspėjimai, trečioji naudos kortelė.
- **Red** (`#ef5b4d`, tamsi `#c0392b`): nuostolis, skola, klaida. Niekada nenaudojamas kaip akcentas.

### Neutral
- **Navy** (`#0f1e3d`): visos antraštės ir tamsiausias paviršius (hero gradientas `linear-gradient(155deg,#0b1730 0%,#15315f 52%,#0f766e 135%)`).
- **Ink** (`#17243f`): pagrindinis tekstas.
- **Muted** (`#5f7191`): antrinis tekstas, paaiškinimai. 4,93:1 ant balto.
- **Bg** (`#f4f7fc`): puslapio fonas.
- **Card** (`#ffffff`): kortelių ir formų paviršius.
- **Line** (`#e3eaf5`) ir **Line soft** (`#eef3fa`): kraštinės ir skirtukai.

### Named Rules
**The Rarity Rule.** Žalias akcentas užima mažiau nei 10 % bet kurio ekrano. Jis pasirodo tik ten, kur vartotojas turi ką nors daryti arba kur vyksta pažanga. Jo retumas yra prasmė.

**The AA Rule.** Kiekviena teksto spalva turi viršyti WCAG AA (4,5:1 normaliam, 3:1 dideliam tekstui). Kai žalio atspalvio reikia tekstui, imama `#067456` (5,77:1), niekada `#12b48c`.

## Typography

**Display Font:** system-ui (su `-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`)
**Body Font:** ta pati šeima
**Label/Mono Font:** nėra atskiro — duomenų skaičiai naudoja `font-variant-numeric: tabular-nums`

**Character:** Viena sistemos šeima, nes produktas turi veikti mokyklos kompiuteryje be tinklo. Charakterį kuria ne šriftas, o svoris, dydžio žingsniai ir neigiamas tarpas tarp raidžių.

### Hierarchy
- **Display** (800, `clamp(2.05rem,5.2vw,3.4rem)`, 1.2, `-0.03em`): hero antraštė, vienintelė tokio dydžio.
- **Headline** (800, `clamp(1.6rem,3.6vw,2.35rem)`, 1.2, `-0.03em`): sekcijų antraštės.
- **Title** (800, `1.1rem`–`1.25rem`, 1.2, `-0.02em`): kortelių antraštės.
- **Body** (400–650, `15.5px`, 1.6): pagrindinis tekstas; matuoklė laikoma apie 65–75 simbolių.
- **Label** (800–900, `.78rem`, `.01em`): žymos ir būsenos.

### Named Rules
**The One Voice Rule.** Nėra antros šeimos ir nėra dekoratyvinio šrifto. Skirtumą tarp lygių kuria svoris ir dydis, ne šeima.

**The Heading-Only Rule.** Antraštė kalba pati. Virš jos nėra „kicker“ ar „eyebrow“ etiketės — nei didžiosiomis raidėmis, nei su tarpais tarp raidžių.

## Layout

Turinys centruojamas `.wrap` konteineriu: `max-width:1120px`, `padding:0 20px` (`14px` telefonuose). Sekcijos turi `72px` vertikalius tarpus, telefonuose `48px`. Hero: `padding:26px 0 76px`. Tarpai tarp elementų — `8/12/20/38px` žingsniais; didesnis tarpas virš antraštės nei po jos.

Tinkleliai naudoja `repeat(auto-fit, minmax(...))` ir lūžta natūraliai: naudos kortelės nuo `290px`, planai nuo `268px`, savaitės ritmas nuo `180px`. Pagrindiniai lūžio taškai: `860px` (hero dviejų stulpelių išdėstymas virsta vienu), `760px` (navigacija ir sekcijų tarpai), `620px`, `560px`.

Hero dešinėje yra izometrinis miestas (`iso.js`), piešiamas SVG į `800×750` viewBox. Miestas užima 97,5 % drobės pločio ir 91 % aukščio, todėl kortelė atrodo pilna, ne tuščia.

## Elevation & Depth

Sistema naudoja šešėlius, bet visada **su poslinkiu ir suliejimu** — nė vieno nulinio poslinkio švytėjimo. Visi šešėliai dažyti navy (`rgba(15,30,61,…)`), niekada gryna juoda. Paviršiai ramybės būsenoje yra plokšti; šešėlis pasirodo kaip atsakas į būseną (hover, pakėlimas, fokusas).

### Shadow Vocabulary
- **Ramybė** (`0 1px 2px rgba(15,30,61,.05), 0 1px 3px rgba(15,30,61,.04)`): smulkūs elementai, žymos, įvesties laukai.
- **Kortelė** (`0 2px 6px rgba(15,30,61,.05), 0 8px 20px rgba(15,30,61,.06)`): numatytoji kortelė.
- **Pakelta** (`0 12px 34px rgba(15,30,61,.12), 0 4px 10px rgba(15,30,61,.05)`): hero miesto kortelė, planų kortelės, dialogai.
- **Brand** (`0 8px 22px rgba(18,180,140,.30)`): tik pagrindinis mygtukas.

### Named Rules
**The Offset Rule.** Šešėlis visada turi poslinkį ir suliejimą. Nulinio poslinkio spalvotas švytėjimas yra dekoracija, ne gilumas, ir sistemoje neleidžiamas.

## Shapes

Formos kalba apvali ir nuosekli: spinduliai `8px` (maži valdikliai), `12px` (įvestys), `16px` (vidutinės kortelės), `20px` (kortelės), `26px` (dideli konteineriai, planai), `999px` (mygtukai, žymos, perjungikliai). Kraštinės plonos — `1px` `#e3eaf5`, aktyvios būsenos `1.5px`.

Kortelės su dekoratyviais radialiniais švytėjimais naudoja `overflow:hidden`, kad švytėjimas būtų nukirptas pagal kampą. Izometrinis miestas yra vienintelė sudėtinga geometrija — rombas, apskritimai ir daugiakampiai, visi nupiešti kodu.

## Components

### Buttons
- **Shape:** pilnas apvalinimas (`999px`), `min-height:48px`, `padding:13px 22px`, 750 svoris.
- **Primary:** brand gradientas, baltas tekstas, brand šešėlis.
- **Hover / Focus:** `translateY(-2px)`, didesnis šešėlis, `saturate(1.06)`; fokuso žiedas `0 0 0 4px rgba(18,180,140,.14)`.
- **Secondary (`.alt`):** baltas fonas, navy tekstas, `1.5px` kraštinė.
- **Dark (`.dark`):** navy gradientas — naudojamas ten, kur žalio akcento jau per daug.
- **Disabled:** `opacity:.5`, be transformacijos ir šešėlio.

### Chips
- **Style:** `--teal-l` fonas, `--teal-d` tekstas, `.78rem`, 800 svoris, `1px` permatoma kraštinė.
- **Variantai:** `.amber` (žingsniai), `.blue` (informacija), `.red` (įspėjimas).

### Cards / Containers
- **Corner Style:** `20px` (`--r-lg`), dideli konteineriai `26px`.
- **Background:** `#fff`; hero miesto kortelė — šviesiai mėlyna `#dbeafe`.
- **Shadow Strategy:** žr. Elevation — ramybėje `--sh-2`, hover `--sh-3`.
- **Border:** `1px solid #e3eaf5`. Storos spalvotos kraštinės ant apvalintų kortelių nenaudojamos.
- **Internal Padding:** `22px` (`17px` telefonuose).

### Inputs / Fields
- **Style:** `1.5px` kraštinė `#e3eaf5`, baltas fonas, `12px` spindulys, `12px 13px` tarpas.
- **Focus:** kraštinė `--teal` ir žiedas `0 0 0 4px rgba(18,180,140,.14)`.
- **Error:** `.err` tekstas raudonas; laukas nežymimas spalva vien.

### Navigation
- **Style:** permatoma juosta hero viršuje, baltas logotipas, šviesūs nuorodos (`#e8f0fb`), 650 svoris; CTA — pagrindinis mygtukas.
- **Mobile:** `flex-wrap:wrap`, `10px 14px` tarpai, `42px` aukščio mygtukai.

### City (signature)
Procedūriškai pieštas izometrinis miestas (`app/public/iso.js`). 15×15 kvartalų, du bulvarai, 26 pastatai, arena, parkas, prekyvietė. Sluoksniavimas skaičiuojamas pagal priekinį kampą (`gx + w + gy + d`), todėl nieko nereikia dėlioti ranka. Visi „organiški“ pasirinkimai (žolės atspalvis, langų šviesa) imami iš sėklos, tad scena visada ta pati ir ją galima lyginti tarp versijų. Miestas keičiasi pagal žaidimo būseną: `mood: 'up'` įjungia šiltą dangų ir apšviestus langus, `mood: 'down'` — lietų ir tamsius debesis.

## Do's and Don'ts

### Do:
- **Do** naudok `--teal-d` (`#067456`) visam žalio atspalvio tekstui — jis praeina AA, o `--teal` ne.
- **Do** brėžk ikonas kaip SVG vienodu 1,8–2px brūkšniu, `stroke="currentColor"`, kad paveldėtų spalvą.
- **Do** dėk didesnį tarpą virš antraštės nei po jos, ir laikykis `8/12/20/38px` žingsnių.
- **Do** duok šešėliui poslinkį ir suliejimą, dažytą navy atspalviu.
- **Do** atskirk korteles plona `1px` kraštine ir šešėliu, o akcentą rodyk mažu spalvotu elementu (pvz., tašku prie antraštės).

### Don't:
- **Don't** naudok emoji ar unikodo glifų (✓, 🔒, 💡) kaip ikonų sistemos — jie priklauso nuo įrenginio šrifto.
- **Don't** dėk „kicker“ ar „eyebrow“ etiketės virš antraštės — antraštė kalba pati.
- **Don't** dėk storos spalvotos kraštinės (pvz., `border-top:5px`) ant apvalintos kortelės.
- **Don't** naudok nulinio poslinkio spalvoto švytėjimo (`box-shadow:0 0 12px …`) kaip gilumo.
- **Don't** naudok dviejų ašių tinklelio fono ar „glass“ suliejimo kaip dekoracijos.
- **Don't** krauk išorinių šriftų, paveikslų ar CDN — produktas turi veikti mokyklos kompiuteryje be tinklo.
- **Don't** rašyk finansinių patarimų tonu; mentoriaus tekstas visada pažymimas kaip mokomoji pagalba.
