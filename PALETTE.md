# VEMAK · spalvų kodai ir atspalviai

Visos spalvos aprašytos viename faile: `app/public/theme.css`.
Kiekviena šeima turi **10 atspalvių** (50 – šviesiausias, 900 – tamsiausias).

Režimas keičiamas **tik vartotojui pasirinkus** mygtuką „Tema". Sistemos
nustatymas (`prefers-color-scheme`) dizaino nekeičia.

---

## 1. Spalvų šeimos

| Šeima | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Indigo** (pirminė) | `#eef2ff` | `#e0e7ff` | `#c7d2fe` | `#a5b4fc` | `#818cf8` | `#6366f1` | `#4f46e5` | `#4338ca` | `#3730a3` | `#312e81` |
| **Violet** | `#f5f3ff` | `#ede9fe` | `#ddd6fe` | `#c4b5fd` | `#a78bfa` | `#8b5cf6` | `#7c3aed` | `#6d28d9` | `#5b21b6` | `#4c1d95` |
| **Blue** | `#eff6ff` | `#dbeafe` | `#bfdbfe` | `#93c5fd` | `#60a5fa` | `#3b82f6` | `#2563eb` | `#1d4ed8` | `#1e40af` | `#1e3a8a` |
| **Cyan** | `#ecfeff` | `#cffafe` | `#a5f3fc` | `#67e8f9` | `#22d3ee` | `#06b6d4` | `#0891b2` | `#0e7490` | `#155e75` | `#164e63` |
| **Teal** | `#f0fdfa` | `#ccfbf1` | `#99f6e4` | `#5eead4` | `#2dd4bf` | `#14b8a6` | `#0d9488` | `#0f766e` | `#115e59` | `#134e4a` |
| **Emerald** | `#ecfdf5` | `#d1fae5` | `#a7f3d0` | `#6ee7b7` | `#34d399` | `#10b981` | `#059669` | `#047857` | `#065f46` | `#064e3b` |
| **Green** | `#ecfdf5` | `#d1fae5` | `#a7f3d0` | `#6ee7b7` | `#34d399` | `#10b981` | `#059669` | `#047857` | `#065f46` | `#064e3b` |
| **Amber** | `#fffbeb` | `#fef3c7` | `#fde68a` | `#fcd34d` | `#fbbf24` | `#f59e0b` | `#d97706` | `#b45309` | `#92400e` | `#78350f` |
| **Orange** | `#fff7ed` | `#ffedd5` | `#fed7aa` | `#fdba74` | `#fb923c` | `#f97316` | `#ea580c` | `#c2410c` | `#9a3412` | `#7c2d12` |
| **Rose** | `#fff1f2` | `#ffe4e6` | `#fecdd3` | `#fda4af` | `#fb7185` | `#f43f5e` | `#e11d48` | `#be123c` | `#9f1239` | `#881337` |
| **Slate** (neutrali) | `#f8fafc` | `#f1f5f9` | `#e2e8f0` | `#cbd5e1` | `#94a3b8` | `#5a6577` | `#475569` | `#334155` | `#1e293b` | `#0f172a` |

---

## 2. Režimai

### Šviesusis (`data-theme="light"`) — numatytasis
Baltas pagrindas, indigo pirminė, kelių spalvų akcentai.

| Paskirtis | Kintamasis | Reikšmė |
|---|---|---|
| Fonas | `--bg` | `--slate-50` |
| Paviršius | `--surface` | `#ffffff` |
| Tekstas | `--text` | `--slate-900` |
| Antrinis tekstas | `--text-2` | `--slate-700` |
| Akcentas | `--accent` | `--indigo-600` |
| Akcento tekstas | `--accent-text` | `--indigo-700` |
| Klaida | `--danger` | `--rose-700` |
| Įspėjimas | `--warn` | `--amber-700` |

### Tamsusis (`data-theme="dark"`) — žalia ir juoda
Juodas pagrindas su žaliu posvyriu, balta ir šviesiai žali tonai, ryški žalia akcentui.

| Paskirtis | Kintamasis | Reikšmė |
|---|---|---|
| Fonas | `--bg` | `#060907` |
| Paviršius | `--surface` | `#0d1410` |
| Antrasis paviršius | `--surface-2` | `#131c16` |
| Juosta (nav, footer) | `--band` | `#040705` |
| Tekstas | `--text` | `#eef7f1` |
| Antrinis tekstas | `--text-2` | `#b3c7ba` |
| Trečiasis tekstas | `--text-3` | `#8ba396` |
| Akcentas | `--accent` | `--green-500` `#10b981` |
| Tekstas ant akcento | `--accent-ink` | `#04140a` |
| Akcento tekstas | `--accent-text` | `--green-300` `#6ee7b7` |
| Klaida | `--danger` | `#fca5a5` |
| Įspėjimas | `--warn` | `#fcd34d` |

**Sekcijų spalvos tamsiame režime** — tik žalios šeimos atspalviai:

| Sekcija | Reikšmė |
|---|---|
| Demo | `--green-400` `#34d399` |
| Nauda | `--emerald-400` `#34d399` |
| Kodėl veikia | `--emerald-300` `#6ee7b7` |
| Planai | `#a3e635` |
| Prašymas | `--green-300` `#86efac` |

**Krepšeliai tamsiame režime:** Santaupos `#2dd4bf`, Investicijos `#34d399`, Verslas `#a3e635`, Rezervas `#6ee7b7`.

---

## 3. Sekcijų spalvos (landinge)

Kiekviena sekcija turi savo spalvą – tai ir yra „daug spalvų" principas.

| Sekcija | Kintamasis | Šviesi | Tamsi |
|---|---|---|---|
| Demo | `--c-hero` | indigo-600 | indigo-300 |
| Nauda | `--c-benefit` | teal-700 | teal-300 |
| Ritmas | `--c-benefit` | teal-700 | teal-300 |
| Kodėl veikia | `--c-why` | emerald-700 | emerald-300 |
| Planai | `--c-plans` | orange-700 | orange-300 |
| Prašymas | `--c-pilot` | rose-700 | rose-300 |

## 4. Pinigų krepšeliai

| Krepšelis | Kintamasis | Šviesi | Tamsi |
|---|---|---|---|
| Santaupos | `--b-sav` | teal-700 | teal-300 |
| Investicijos | `--b-inv` | indigo-600 | indigo-300 |
| Verslas | `--b-bus` | orange-700 | orange-300 |
| Rezervas | `--b-res` | emerald-700 | emerald-300 |

---

## 5. Miesto scena

Miesto SVG generuojamas vienu žaliu rinkiniu, o po to **perdažomas pagal temą**
(`retint()` faile `app/public/iso.js`):

- atspalvis perkeliamas į kitą spalvų rato vietą (platus išdėstymas → daugiaspalvis miestas),
- šviesumas suspaudžiamas į temos diapazoną,
- sodrumas pakoreguojamas pagal režimą.

## 6. Taisyklės

- **Fonas ir tekstas niekada nesutampa.** Kiekvienas tekstas privalo turėti
  skirtingą spalvą nei jo fonas. Tikrinama automatiškai: nuskaitomi apskaičiuoti
  `color` ir `background-color` porai ir apskaičiuojamas kontrasto santykis.
  Mažas tekstas ≥ 4,5:1, didelis ≥ 3:1. Auditas paleidžiamas abiem režimais ir
  visuose puslapiuose.

- **Kontrastas:** tekstas ≥ 4,5:1, didelis tekstas ≥ 3:1. Jei spalva naudojama
  kaip tekstas, imamas 700–800 atspalvis, ne 500–600.
- **Akcentas ant akcento:** `--accent-ink` nurodo, kokia spalva rašoma ant akcento.
- **Ne daugiau kaip 2 akcento spalvos viename ekrane**, išskyrus sąrašus, kur
  spalva žymi kategoriją.
- Spalva niekada nėra vienintelis informacijos nešėjas – prie jos visada yra
  tekstas arba ikona.
