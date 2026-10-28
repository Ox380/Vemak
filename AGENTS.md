# AGENTS.md — ParkSense LT

## Projekto paskirtis

**Projekto pavadinimas:** ParkSense LT

**Tikslas:** sukurti DI programėlę, kuri padėtų Lietuvos vairuotojams suprasti automobilių stovėjimo taisykles ir priimti atsargesnius, informacija pagrįstus sprendimus.

**Pirmosios versijos teritorija:** Vilnius.

Programėlė turi būti informacinė pagalbinė priemonė, o ne oficialus teisės aktų ar kelio ženklų aiškinimo pakaitalas. Kai kyla abejonių, naudotojas turi būti skatinamas patikrinti vietoje esančius ženklus, papildomas lenteles ir oficialius šaltinius.

## Pagrindinės funkcijos

1. Atpažinti kelio ženklus iš naudotojo pateiktų nuotraukų.
2. Paaiškinti stovėjimo apribojimus paprasta ir taisyklinga lietuvių kalba.
3. Įvertinti, ar stovėti galima, pagal:
   - vietą;
   - laiką ir savaitės dieną;
   - kelio ženklus bei papildomas lenteles;
   - automobilio tipą ir kitus reikšmingus požymius.
4. Ateityje rodyti parkavimo zonas ir kainas.
5. Aiškiai įspėti, kai turimos informacijos nepakanka patikimam atsakymui.

## Agento darbo taisyklės

- Bendrauk taisyklinga, aiškia ir naudotojui suprantama lietuvių kalba.
- Padėk projektą kurti žingsnis po žingsnio: pirmiausia įgyvendink būtiną funkcionalumą, o vėliau siūlyk patobulinimus.
- Siūlyk paprastus, praktiškai įgyvendinamus sprendimus, vengdamas perteklinio sudėtingumo.
- Prieš keisdamas svarbią architektūrą, produkto elgseną, duomenų modelį, teisinę interpretaciją ar kitą reikšmingą projekto sprendimą, pateik pasiūlymą ir gauk projekto savininko leidimą.
- Nedaryk prielaidų, kad neaiškus produkto reikalavimas yra patvirtintas sprendimas. Neaiškumus pažymėk ir pasiūlyk artimiausią praktinį žingsnį.
- Atlikęs pakeitimus, paaiškink, kas pakeista, ir patikrink rezultatą tinkamais testais ar kitais verifikavimo būdais.

## Teisinis ir faktinis tikslumas

- Remkis galiojančiomis oficialiomis Lietuvos kelių eismo taisyklėmis (KET), oficialiais kelio ženklų aprašais ir kitais patikimais oficialiais Lietuvos institucijų šaltiniais.
- Nenaudok nepatikrintų tinklaraščių, forumų ar atsitiktinių paieškos rezultatų kaip vienintelio taisyklės pagrindo.
- Neišgalvok parkavimo taisyklių, ženklų reikšmių, zonų, išimčių ar kainų.
- Kiekvienai svarbiai taisyklei ar kainai, kuri patenka į naudotojui rodomą atsakymą, numatyk šaltinį ir jo patikrinimo datą.
- Parkavimo zonos ir kainos turi būti rodomos tik tada, kai jos gautos iš patikimo, aktualaus ir aiškiai nurodyto šaltinio. Jei šaltinis nepatikimas, pasenęs arba nepasiekiamas, kainos nerodyk kaip fakto.
- Jei nuotrauka, vieta, laikas, automobilio tipas, ženklas, papildoma lentelė ar kitas kontekstas neaiškus, nespėliok. Aiškiai nurodyk, ko trūksta ir ką naudotojas turi patikrinti.
- DI išvada turi būti pateikiama su pasitikėjimo lygiu arba aiškiu neapibrėžtumo įspėjimu. Žemas pasitikėjimas nėra pagrindas kategoriškai teigti, kad stovėti galima.
- Atsakymai neturi būti formuluojami taip, kad naudotojas juos suprastų kaip garantiją, jog bauda negresia.

## Rekomenduojama atsakymo logika

1. Nurodyti, kokie faktai buvo nustatyti iš nuotraukos, vietos ir naudotojo duomenų.
2. Paaiškinti atpažinto ženklo ar apribojimo reikšmę paprasta lietuvių kalba.
3. Atskirai pateikti išvadą apie stovėjimo galimybę ir jos sąlygas.
4. Nurodyti taikytą oficialų šaltinį.
5. Jei trūksta informacijos, vietoje kategoriškos išvados pateikti įspėjimą ir konkretų patikrinimo sąrašą.

## Duomenų ir funkcijų prioritetai

### Pirmoji versija (Vilnius)

- Kelio ženklų atpažinimas iš nuotraukos.
- Stovėjimo apribojimų paaiškinimas.
- Vietos ir laiko konteksto įvertinimas.
- Automobilio tipo įvertinimas, kai jis keičia taisyklės taikymą.
- Neužtikrintumo ir trūkstamos informacijos pranešimai.
- Oficialiems šaltiniams priskiriami atsakymai ir jų atnaujinimo data.

### Vėlesni etapai

- Vilniaus parkavimo zonų atvaizdavimas.
- Aktualios parkavimo kainos ir jų galiojimo sąlygos.
- Didesnė Lietuvos miestų aprėptis.
- Naudotojo pateiktų neaiškių situacijų grįžtamasis ryšys ir kokybės gerinimas.

Vėlesni etapai neturi būti laikomi įsipareigojimais, kol jie nepatvirtinti projekto savininko.

## Siūloma projekto struktūra

```text
 di-talentu-projektas/
 ├── AGENTS.md
 ├── README.md
 ├── CHANGELOG.md
 ├── CONTRIBUTING.md
 ├── LICENSE
 ├── docs/
 │   ├── README.md
 │   ├── architektura.md
 │   ├── produkto-aprasas.md
 │   ├── naudotojo-scenarijai.md
 │   ├── sprendimu-registras.md
 │   ├── teisiniai-saltiniai.md
 │   ├── duomenu-saltiniai.md
 │   ├── saugumas-ir-privatumas.md
 │   └── testavimo-strategija.md
 ├── data/
 │   ├── README.md
 │   ├── raw/              # Neapdoroti duomenys; pagal poreikį ignoruojami Git'e
 │   ├── processed/        # Paruošti naudoti duomenys
 │   └── sources/          # Šaltinių metaduomenys ir atnaujinimo informacija
 ├── app/                  # Programėlės kodas
 │   ├── README.md
 │   ├── api/
 │   ├── frontend/
 │   ├── domain/
 │   └── services/
 ├── models/               # DI modeliai, konfigūracija ir modelių dokumentacija
 │   └── README.md
 ├── prompts/              # Sisteminiai ir funkcijų promptai
 │   ├── README.md
 │   └── versijos/
 ├── tests/
 │   ├── README.md
 │   ├── unit/
 │   ├── integration/
 │   ├── evaluation/       # Ženklų atpažinimo ir atsakymų kokybės vertinimas
 │   └── fixtures/
 ├── scripts/              # Duomenų, šaltinių ir kūrimo pagalbiniai scenarijai
 ├── config/
 │   ├── README.md
 │   └── example.*
 └── .gitignore
```

## Markdown failų paskirtis

- `AGENTS.md` — šiame faile aprašytos agento elgesio, faktinio tikslumo ir projekto darbo taisyklės.
- `README.md` — trumpas projekto pristatymas, paleidimas ir pagrindinis naudojimas.
- `docs/produkto-aprasas.md` — patvirtintas pirmosios versijos funkcionalumas ir ribos.
- `docs/naudotojo-scenarijai.md` — konkretūs naudotojo scenarijai, įskaitant neaiškios situacijos scenarijų.
- `docs/architektura.md` — sistemos komponentai, duomenų srautai ir integracijos.
- `docs/teisiniai-saltiniai.md` — naudojami oficialūs KET ir kiti teisiniai šaltiniai, nuorodos, versijos bei patikrinimo datos.
- `docs/duomenu-saltiniai.md` — ženklų, Vilniaus zonų ir kainų duomenų šaltiniai, jų patikimumas bei atnaujinimo tvarka.
- `docs/sprendimu-registras.md` — svarbūs patvirtinti projekto sprendimai ir jų motyvai.
- `docs/saugumas-ir-privatumas.md` — nuotraukų, vietos duomenų ir kitų naudotojo duomenų tvarkymas.
- `docs/testavimo-strategija.md` — testavimo lygiai, ribiniai atvejai ir vertinimo kriterijai.
- `CHANGELOG.md` — naudotojui reikšmingų pakeitimų istorija.
- `CONTRIBUTING.md` — darbo su projektu ir pakeitimų pateikimo taisyklės.
- Kiekvienas svarbesnis katalogas gali turėti savo `README.md`, kuriame trumpai aprašoma jo paskirtis, įvestys, išvestys ir paleidimas.

## Priėmimo kriterijai atsakymams

Atsakymas laikomas tinkamu, jei jis:

- parašytas taisyklinga ir suprantama lietuvių kalba;
- atskiria nustatytus faktus nuo DI interpretacijos;
- neperžengia turimos informacijos ribų;
- nurodo oficialų šaltinį, kai atsakymas grindžiamas taisykle ar kaina;
- aiškiai išvardija trūkstamą informaciją, kai patikimos išvados pateikti negalima;
- nepateikia išgalvotų taisyklių, kainų ar garantijų.
