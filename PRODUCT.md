# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Statinis HTML / CSS / JavaScript (`app/public/`) ir be jokių priklausomybių veikiantis Node serveris (`app/server.mjs`, Node >= 20). Duomenys saugomi viename JSON faile (`app/data/db.json`). Jokių išorinių šriftų, paveikslų ar CDN — miesto scena piešiama procedūriškai SVG (`iso.js`), kad veiktų mokyklos kompiuteryje be diegimo.

## Users

**Pagrindinis: mokytojas, vedantis finansinio raštingumo pamoką 8–12 klasėje.** Jis turi vieną pamoką per savaitę ir nori, kad mokiniai dirbtų patys, o ne klausytųsi paskaitos. Jam reikia: paruošto 6 savaičių scenarijaus, klasės kodo, kuriuo mokiniai prisijungtų per minutę, realaus laiko skydelio (kas užrakino strategiją, kam sekasi sunkiau) ir ataskaitos, kurią galėtų parodyti mokyklos vadovybei.

**Mokinys (8–12 klasė).** Žaidžia telefone ar mokyklos kompiuteryje, be el. pašto ir be tikro vardo — tik slapyvardis. Kiekvieną savaitę: pamato įvykį, pasirenka kryptį, paskirsto virtualius pinigus, užrakina strategiją ir penktadienį sužino, ką jo sprendimas davė. Darbas: išbandyti finansinius sprendimus neprarandant tikrų pinigų.

**Asmeninis vartotojas (antrinis, diegiamas dabar).** Žaidžia vienas, be klasės kodo ir be mokytojo, savo tempu. Jam reikia to paties sezono ir paaiškinimų, bet be klasės funkcijų.

## Product Purpose

VEMAK yra 6 savaičių finansinio raštingumo žaidimas, kuriame mokiniai valdo virtualų biudžetą, verslą ir investicijas. Produktas egzistuoja todėl, kad finansinio raštingumo mokymas klasėje paprastai apsiriboja teorija, o mokiniai neturi saugios vietos klysti.

Sėkmė: **klasė, kuri užbaigia visą sezoną**. Tai pagrindinis piloto rodiklis. Žinių pokytis (testas prieš ir po) ir mokytojų pakartotinis naudojimas — papildomi rodikliai, bet ne sprendimo kriterijus.

## Positioning

Skirtingai nuo finansinio raštingumo pamokų ir nuo investavimo simuliatorių, VEMAK sujungia tris dalykus, kurių kaimyninis produktas negalėtų nukopijuoti vienu ėjimu:

1. **Vienodos sąlygos visai klasei.** Visi mokiniai patiria tuos pačius įvykius ir tas pačias kainas, todėl rezultatus galima lyginti, o nusirašinėjimas naudos neduoda.
2. **Pasekmė, o ne pažymys.** Po kiekvieno nuostolio ar prieaugio mokinys gauna įvykių seką žingsnis po žingsnio ir mentoriaus paaiškinimą, o po bankroto — antrą galimybę, o ne „žaidimas baigtas“.
3. **Reitingas vertina strategiją, ne tik laimėjimą.** Strategijos taškai skiriasi nuo grynosios vertės eurais: rizikingas viso kapitalo statymas gali laimėti vieną savaitę, bet reitinge laimi subalansuota strategija.

## Operating Context

- Vienas sezonas — **6 savaitės**, po vieną 15–25 min. veiklą per savaitę. Telpa į pamoką arba namų darbą.
- Mokytojas kuria klasę, gauna 6 simbolių kodą, paleidžia sezoną ir kiekvieną savaitę atskleidžia rezultatus bei atidaro kitą savaitę.
- Mokiniai jungiasi per klasės kodą; slapyvardis unikalus klasėje, el. pašto nereikia.
- Savaitės ritmas: įvykis (pirmadienis) → sprendimas → pinigų paskirstymas į santaupas, investicijas, verslą ir rezervą → strategijos užrakinimas (ketvirtadienis) → rezultatai ir mentoriaus patarimai (penktadienis).
- Sezono temos: biudžetas, taupymas, rizika, investavimas, biudžetas, taupymas.
- Investicijos skirstomos į penkias turto rūšis: ETF, technologijos, žalioji energija, NT fondai (REIT), auksas.
- Prieiga: bet kuri naršyklė, jokio diegimo. Naudojama telefone, planšetėje ir mokyklos kompiuteryje.
- Kaina: **9,99 € už asmeninį sezoną**, **149 € už klasę per sezoną**. Mokėjimas dar neprijungtas — puslapis priima rezervacijas ir susisiekia el. paštu.

## Capabilities and Constraints

Patvirtintos funkcijos: mokytojo paskyra ir prisijungimas; klasių kūrimas su kodu; sezono valdymas (pradžia, savaitės atskleidimas, kita savaitė); mokytojo skydelis su klasės statistika; ataskaitos PDF ir CSV; pamokų planai; testas prieš ir po sezono; mokinio žaidimas su savaitės sprendimais, paskirstymo slankikliais, strategijos užrakinimu, lyderių lentele, mentoriaus paaiškinimais ir miesto vaizdu, kuris auga su pažanga; anoniminė 5 savaičių demo versija pagrindiniame puslapyje; auditorijos perjungiklis (Mokyklai / Asmeniui) ir planų sekcija.

Apribojimai ir taisyklės, kurių negalima pažeisti:

- **Tik virtualūs pinigai.** Jokių mokėjimų, brokerio, prekybos ar prizų žaidime.
- **Jokių mokinių asmens duomenų.** Nerenkamas el. paštas ar tikras vardas; mentorius nemato asmens duomenų; mokytojas klasės duomenis gali ištrinti vienu paspaudimu.
- **Mentorius yra taisyklėmis grįstas.** Patarimus ir skaičius sudaro taisyklės, ne kalba paremtas modelis, todėl jie nėra „haliucinacijos“. Tai mokomoji pagalba, **ne finansinė ar investavimo rekomendacija** — ši formuluotė turi likti visur, kur rodomi patarimai.
- **Neapibrėžta:** atitikimas Bendrosioms programoms konkrečių pasiekimų lygmenyje dar nepatvirtintas; to netvirtiname.
- Sezonas yra 6 savaičių; pagrindiniame puslapyje esantis demo — 5 savaičių ir yra atskiras produktas, ne sezono kopija.

## Brand Commitments

- Pavadinimas: **VEMAK**. Logotipas — „V“ plytelė ir VEMAK užrašas (`app/public/icon.svg`, `.logo`).
- Kalba: lietuvių, taisyklingais linksniais („į santaupas“, ne „į santaupas“). Tonas — aiškus, be moralizavimo, be kaltės jausmo.
- Jokių emoji produkto grafikoje ar miesto scenoje: simboliai piešiami figūromis, kad veiktų ir be emoji šrifto.
- Jokių išorinių šriftų, paveikslų ar CDN — visa grafika procedūrinė.

## Evidence on Hand

- Veikiantis produktas: mokytojo ir mokinio srautai, sezono variklis (`app/public/engine.js`), turinys (`app/public/content.js`), 30 API testų ir 20 variklio testų.
- Realūs duomenys `app/data/db.json`: registruoti mokytojai, klasės, mokiniai, sezonų įrašai.
- Pavyzdinė medžiaga puslapyje: 5 savaičių anoniminis demo su lyderių lentele ir „Pamoka“ bloku.
- **Ko nėra ir ko negalima išgalvoti:** klientų atsiliepimų, mokyklų logotipų, naudojimo skaičių, tyrimų, sertifikatų, pedagogų ar mokslo institucijų patvirtinimų, žiniasklaidos publikacijų. Kol jų nėra, jokiame puslapyje jie neturi atsirasti.

## Product Principles

1. **Pasekmė moko geriau už paaiškinimą.** Kiekvienas sprendimas turi grąžinti suprantamą pasekmę per vieną žingsnį, o ne bendrą patarimą.
2. **Klysti turi būti saugu.** Antra galimybė, nurašyta skola ir atstatytas turtas yra produkto dalis, ne nuolaida.
3. **Visai klasei vienodos sąlygos.** Bet kokia funkcija, kuri sugadintų rezultatų palyginamumą, yra netinkama.
4. **Mokytojo laikas yra brangiausias išteklius.** Kiekviena funkcija turi mažinti mokytojo pasiruošimo laiką, ne jį didinti.
5. **Tik tai, ką galima parodyti.** Jokių išgalvotų skaičių, atsiliepimų ar pažadų, kurių produktas negali įrodyti.

## Accessibility & Inclusion

- Produktas naudojamas mokyklos kompiuteriuose ir telefonuose, tad turi veikti be diegimo, be išorinių šaltinių ir su silpnu ryšiu.
- Teksto kontrastas turi atitikti WCAG AA (4,5:1 normaliam tekstui) — tai jau pažeista žalio akcento spalvos atveju ir turi būti sutvarkyta.
- Sąsaja turi likti naudojama klaviatūra ir telefone; tiksliniai elementai ne mažesni kaip 44×44 px.
