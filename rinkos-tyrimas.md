# Rinkos tyrimas

Šio failo paskirtis – kaupti informaciją apie parkavimo sprendimų rinką, naudotojų poreikius, konkurentus ir galimas projekto vystymo kryptis.

## Tyrimo santrauka

Lietuvoje jau veikia stipri parkavimo **apmokėjimo ir valdymo** sprendimų grupė: JUDU, UNIPARK, ParkMan ir carOne. Šios programėlės padeda rasti zoną ar aikštelę, pradėti ir sustabdyti parkavimą, mokėti bei gauti priminimus. [JUDU](https://judu.lt/programele/), [UNIPARK](https://unipark.lt/unipark-programele), [ParkMan](https://www.parkman.io/lt/parkavimo-programele), [carOne](https://www.carone.app/lt)

Užsienyje jau yra tiesioginių DI parkavimo ženklų aiškinimo sprendimų, ypač **Parky.AI** ir **PicPark**. Todėl „ParkSense LT“ negalėtų būti pristatoma kaip pirmoji pasaulyje tokio tipo programėlė. Pagrįstesnis išskirtinumas būtų Lietuvos rinkai pritaikytas sprendimas, jungiantis nuotrauką, vietą, laiką, KET, Vilniaus parkavimo zonas ir aiškų neapibrėžtumo įspėjimą. [Parky.AI](https://parky.ai/), [PicPark](https://picpark.app/)

Viešuose šaltiniuose neradau įrodymo apie Lietuvoje veikiančią vartotojams skirtą programėlę, kuri iš parkavimo ženklų nuotraukos pateiktų teisinį stovėjimo įvertinimą lietuviškai. Tačiau Lietuvoje egzistuoja susiję DI sprendimai: AKYS demonstruoja lietuviškų kelio ženklų atpažinimą ir klasifikavimą, o UNIPARK „Parkomatic“ naudoja DI parkavimo aikštelių kontrolei. Tai nėra tas pats, kas „ParkSense LT“ planuojamas vairuotojo konsultantas. [AKYS](https://akys.ai/demo/sign-detection), [UNIPARK Parkomatic](https://unipark.lt/parkomatic/)

## 1. Lietuvoje veikiantys parkavimo sprendimai

### JUDU

JUDU yra Vilniaus miesto judumo ir parkavimo sprendimas. Oficialiai nurodoma, kad programėlėje galima aktyvuoti ir sustabdyti parkavimą, gauti priminimus, rasti artimiausią parkavimo vietą ir mokėti už parkavimą; programėlė taip pat integruoja viešojo transporto paslaugas. [JUDU programėlė](https://judu.lt/programele/)

JUDU nurodo, kad už parkavimą galima mokėti programėle, SMS žinute, parkomatuose ir partnerių programėlėmis, tarp jų UNIPARK, ParkMan, carOne ir Mobilly. [JUDU mokėjimo būdai](https://judu.lt/vairuotojams/mokejimo-budai/)

JUDU oficialiame puslapyje skelbiamos Vilniaus parkavimo zonos, jų ribos, apmokestinimo laikas, tarifai ir gyventojų leidimų informacija. [Parkavimo zonos Vilniuje](https://judu.lt/vairuotojams/parkavimosi-zonos-vilniuje/)

**Pagrindinė JUDU stiprybė:** oficialus Vilniaus parkavimo informacijos ir mokėjimo kanalas.

**Viešai patikrinta spraga, kuri aktuali „ParkSense LT“:** JUDU aprašuose neradau funkcijos, kuri iš naudotojo nuotraukos atpažintų kelio ženklų derinį ir paprasta kalba paaiškintų, ar konkrečioje vietoje teisėtai stovėti galima. Tai yra funkcijos nebuvimas peržiūrėtuose aprašuose, o ne įrodymas, kad jos nėra visose programėlės versijose.

### UNIPARK

UNIPARK skelbia veikianti Lietuvoje ir kitose šalyse. Įmonė nurodo daugiau kaip 250 aikštelių ir zonų, daugiau kaip 600 elektromobilių įkrovimo stotelių ir galimybę mokėti visose Lietuvos miestų zonose; šiuos skaičius pateikia pati įmonė, todėl jie gali keistis. [UNIPARK programėlė](https://unipark.lt/unipark-programele)

Pagrindinės funkcijos:

- zonos ar aikštelės parinkimas pagal įrenginio vietą;
- parkavimo pradėjimas ir sustabdymas;
- automatinis parkavimo sustabdymas;
- priminimai apie aktyvų parkavimą ir pajudėjimą iš vietos;
- parkavimas uždarose ir atvirose aikštelėse;
- elektromobilių įkrovimo vietų paieška, rezervacija ir apmokėjimas;
- kai kuriose situacijose – integracija su „Android Auto“ ir „Apple CarPlay“.

[UNIPARK funkcijų aprašas](https://unipark.lt/unipark-programele)

**Pagrindinė UNIPARK stiprybė:** platus parkavimo ir mokėjimo tinklas bei automatizavimas.

**Viešai patikrinta spraga, kuri aktuali „ParkSense LT“:** peržiūrėtame oficialiame apraše neradau vartotojo kelio ženklų nuotraukos interpretavimo ir KET paaiškinimo funkcijos.

### ParkMan

ParkMan programėlė naudoja telefono GPS, kad parodytų netoliese esančias parkavimo galimybes. Naudotojas gali pasirinkti stovėjimo laiką, mokėjimo būdą ir transporto priemonę, taip pat pratęsti arba sustabdyti parkavimą bei gauti priminimus. [ParkMan](https://www.parkman.io/lt/parkavimo-programele)

**Pagrindinė ParkMan stiprybė:** paprastas parkavimo valdymas ir mokėjimas, įskaitant verslo paskyrų scenarijus.

**Viešai patikrinta spraga, kuri aktuali „ParkSense LT“:** oficialiame apraše neradau kelio ženklų nuotraukų atpažinimo, KET taisyklių interpretavimo ar Lietuvos vietos apribojimų paaiškinimo pagal nuotrauką.

### carOne

carOne save pristato kaip platesnę programėlę vairuotojo poreikiams. Joje galima pasirinkti parkavimo zoną ir už ją atsiskaityti, gauti priminimus, taip pat naudotis draudimo, automobilio dokumentų, techninės priežiūros ir pagalbos kelyje funkcijomis. [carOne](https://www.carone.app/lt)

**Pagrindinė carOne stiprybė:** automobiliui skirtų paslaugų sujungimas vienoje programėlėje.

**Viešai patikrinta spraga, kuri aktuali „ParkSense LT“:** peržiūrėtame puslapyje neradau kelio ženklų vaizdinio atpažinimo ir konkrečios stovėjimo situacijos teisinio paaiškinimo.

## 2. DI sprendimai Lietuvoje

### AKYS

AKYS viešai demonstruoja lietuviškų kelio ženklų atpažinimo sprendimą. Puslapyje nurodoma, kad modelis klasifikuoja 292 lietuviškų ženklų klases ir gali susieti aptiktus ženklus su GPS bei mobiliųjų žemėlapių duomenimis. [AKYS lietuviškų kelio ženklų atpažinimo demonstracija](https://akys.ai/demo/sign-detection)

Tai rodo, kad Lietuvoje egzistuoja su lietuviškų ženklų atpažinimu susijusi technologinė kompetencija. Tačiau viešai pateiktas AKYS sprendimas aprašomas kaip mobiliojo žemėlapiavimo, ženklų inventorizacijos ir aptikimo demonstracija, o ne kaip vartotojams skirta programėlė, kuri paaiškina parkavimo teisėtumą pagal konkrečią nuotrauką ir vietą.

### UNIPARK „Parkomatic“

„Parkomatic“ yra DI naudojanti parkavimo aikštelių kontrolės sistema. UNIPARK nurodo, kad išmaniosios kameros kontroliuoja stovėjimą, o DI apdoroja duomenis; sistema skirta aikštelių valdytojams, o ne vairuotojui, kuris nori suprasti kelio ženklą. [UNIPARK „Parkomatic“](https://unipark.lt/parkomatic/)

### Tyrimo išvada dėl Lietuvos vartotojams skirtų DI programėlių

Peržiūrėtuose viešuose šaltiniuose nerasta patikimo įrodymo apie Lietuvoje veikiančią vartotojams skirtą programėlę, kuri:

1. priimtų parkavimo ženklų nuotrauką;
2. atpažintų Lietuvos ženklų ir papildomų lentelių derinį;
3. susietų jį su vieta, laiku, zona ir KET;
4. lietuviškai pateiktų būseną „leidžiama“, „draudžiama“ arba „trūksta informacijos“.

Tai yra riboto viešai atlikto tyrimo išvada, o ne absoliutus rinkos nebuvimo įrodymas. Prieš teigiant, kad konkurentų nėra, reikėtų papildomai patikrinti programėlių parduotuves, Lietuvos startuolių katalogus, viešuosius pirkimus ir uždarus ar ankstyvos stadijos produktus.

## 3. Užsienio sprendimai

### Parky.AI

Parky.AI yra tiesioginis „ParkSense LT“ funkcinis analogas. Oficialiai nurodoma, kad naudotojas gali fotografuoti vieną arba kelis ženklus, o sistema sujungia matomas taisykles ir pateikia „Yes“, „No“ arba „Not sure“ išvadą su paaiškinimu. Parky.AI skelbia palaikanti 85 ženklų kalbas, tačiau taip pat įspėja, kad už kadro ribų esantys vietos ženklai ar sąlygos gali pakeisti rezultatą. [Parky.AI](https://parky.ai/)

Parky.AI taip pat skelbia vidinio 544 nuotraukų bandymo rezultatus: 96 proc. scenarijų su dviem taisyklėmis ir 93 proc. scenarijų su trimis ar daugiau taisyklių. Tai yra pačios įmonės nurodomo vidinio etalono rezultatai, todėl jų negalima tiesiogiai prilyginti nepriklausomam Lietuvos KET tikslumo vertinimui. [Parky.AI tikslumo aprašas](https://parky.ai/accuracy/)

**Parky.AI funkcijos:**

- kelių ženklų analizė;
- rodyklių, datų, laiko ir leidimų interpretavimas;
- atsakymas „taip“, „ne“ arba „neaišku“;
- paaiškinimas naudotojo kalba;
- 85 kalbų ženklų palaikymas pagal produkto aprašą;
- nuotraukų nelaikymas pagal produkto teiginį;
- prieinamumas „iPhone“ ir „Android“ pagal oficialų puslapį.

**Parky.AI apribojimai:** sistema interpretuoja matomus ženklus, bet negarantuoja, kad įvertino nematomus ženklus, kelio ženklinimą, laikinus pranešimus ar visas vietos taisykles. Tai svarbi pamoka „ParkSense LT“ saugumo dizainui.

### PicPark

PicPark reklamuojamas kaip DI parkavimo ženklų skaitytuvas. Oficialiai nurodoma, kad jis analizuoja simbolius, tekstą, laiko intervalus ir leidimų taisykles, pateikia atsakymą, kiek laiko galima stovėti, ir gali nustatyti priminimą. PicPark taip pat nurodo, kad nuotraukos apdorojamos laikinai ir neišsaugomos, o parkavimo istorija lieka įrenginyje. [PicPark](https://picpark.app/)

**PicPark funkcijos:**

- ženklo fotografavimas arba nuotraukos pasirinkimas iš įrenginio;
- tekstų, simbolių, laiko intervalų ir leidimų taisyklių analizė;
- aiškus atsakymas, ar galima stovėti ir kiek laiko;
- priminimas bei „Lock Screen“ atgalinis skaičiavimas;
- kelių kalbų ir tarptautinių ženklų palaikymas pagal produkto aprašą;
- naudojimas be paskyros pagal produkto aprašą;
- nuotraukų neįrašymas pagal produkto aprašą.

PicPark viešai nurodo „iPhone“ palaikymą ir rašo, kad „Android“ versija dar kuriama. Tai gali keistis, todėl platformos būklę reikia tikrinti prieš lyginant produktus. [PicPark](https://picpark.app/)

**PicPark apribojimai:** viešas aprašas orientuotas į ženklo interpretavimą, o ne į Lietuvos KET, Vilniaus zonų, savivaldybės kainų ar geografiškai susieto oficialaus šaltinio tikrinimą. Todėl jis nėra tiesioginis visos „ParkSense LT“ koncepcijos pakaitalas, bet yra tiesioginis nuotraukos analizės funkcijos konkurentas.

## 4. Konkurentų palyginimo lentelė

| Sprendimas | Rinka / paskirtis | Nuotraukos DI analizė | Parkavimo mokėjimas ir valdymas | Vietos / zonų informacija | Lietuviškas KET kontekstas | Aiškus neaiškumo atsakymas | Šaltinis |
|---|---|---:|---:|---:|---:|---:|---|
| JUDU | Vilnius; miesto judumas ir parkavimas | Viešai nepatvirtinta | Taip | Taip, Vilniaus zonos ir aikštelės | Oficialus Vilniaus parkavimo kontekstas, bet ne nuotraukos aiškinimas | Neaptikta apraše | [JUDU](https://judu.lt/programele/) |
| UNIPARK | Lietuva ir kitos šalys; zonos, aikštelės, EV | Viešai nepatvirtinta kaip ženklų skaitytuvas | Taip | Taip, zonos ir aikštelės pagal vietą | Ne kaip DI KET konsultantas | Neaptikta apraše | [UNIPARK](https://unipark.lt/unipark-programele) |
| ParkMan | Keli miestai; mokėjimas | Viešai nepatvirtinta | Taip | Netolimos parkavimo parinktys pagal GPS | Viešai nepatvirtinta | Priminimai, bet ne taisyklių neaiškumo būsena | [ParkMan](https://www.parkman.io/lt/parkavimo-programele) |
| carOne | Lietuva; vairuotojo paslaugos | Viešai nepatvirtinta | Taip | Parkavimo zonos | Viešai nepatvirtinta | Priminimai apie paslaugas | [carOne](https://www.carone.app/lt) |
| Parky.AI | Tarptautinė; ženklų aiškinimas | Taip | Ne kaip pagrindinė funkcija | Ne Lietuvos oficialių zonų sistema | Ne; pasaulinis / vietinis ženklų aiškinimas | Taip: „Yes / No / Not sure“ | [Parky.AI](https://parky.ai/) |
| PicPark | Tarptautinė; ženklų aiškinimas | Taip | Ne kaip pagrindinė funkcija | Viešai nepatvirtinta vietos zonų integracija | Ne; bendras tarptautinis sprendimas | Taip: aiškus atsakymas ir laikmatis | [PicPark](https://picpark.app/) |
| AKYS | Lietuva; mobilus žemėlapiavimas ir ženklų inventorizacija | Taip, ženklų aptikimas / klasifikavimas | Ne vartotojų mokėjimui | GPS susiejimas inventorizacijai | Lietuviškų ženklų katalogas pagal demonstraciją | Ne parkavimo konsultantas | [AKYS](https://akys.ai/demo/sign-detection) |
| ParkSense LT | Planuojama; Vilnius | Planuojama | Galima ateityje arba per integraciją | Planuojama pagal Vilniaus oficialius šaltinius | Tikslinis pranašumas: Lietuvos KET + vietos duomenys | Privaloma būsena „trūksta informacijos“ | Ši ataskaita |

**Lentelės metodinė pastaba:** „Viešai nepatvirtinta“ reiškia, kad peržiūrėtuose oficialiuose viešuose aprašuose funkcija nebuvo rasta. Tai nėra garantija, kad funkcija neegzistuoja kitoje programėlės versijoje, uždarame modulyje ar neindeksuotame puslapyje.

## 5. Kokios funkcijos konkurentams trūksta?

Žemiau pateikiamos ne absoliučios spragos, o funkcijos, kurių neradau peržiūrėtuose oficialiuose aprašuose:

- viename procese sujungtas ženklo vaizdas, GPS vieta, data, laikas, automobilio tipas ir Vilniaus zonos duomenys;
- lietuviškas paaiškinimas, paremtas konkrečia Lietuvos KET nuostata;
- kelių šaltinių sutikrinimas prieš pateikiant išvadą;
- aiški „trūksta informacijos“ būsena, kai nematyti papildomos lentelės, galiojimo krypties ar kelio ženklinimo;
- vietoje esančio ženklo palyginimas su oficialiu zonos ir kainos šaltiniu;
- matomų faktų, šaltinių ir DI išvados atskyrimas;
- istorija, kada konkretus zonos ar kainos duomuo buvo atnaujintas;
- Lietuvos miestams pritaikytas privatumo ir atsakomybės paaiškinimas.

Svarbu: užsienio konkurentai jau rodo, kad „nuotrauka → aiškus atsakymas“ nėra savaime nauja idėja. Todėl „ParkSense LT“ neturėtų konkuruoti vien DI ženklo skaitymo funkcija.

## 6. Kuo „ParkSense LT“ galėtų išsiskirti Lietuvoje?

### Patikrintas rinkos faktas

Lietuvoje veikiantys pagrindiniai viešai aprašyti sprendimai daugiausia orientuoti į parkavimo **suradimą, aktyvavimą, mokėjimą, pratęsimą ir priminimus**, o Parky.AI ir PicPark orientuoti į tarptautinį parkavimo ženklų aiškinimą. [JUDU](https://judu.lt/programele/), [UNIPARK](https://unipark.lt/unipark-programele), [ParkMan](https://www.parkman.io/lt/parkavimo-programele), [Parky.AI](https://parky.ai/), [PicPark](https://picpark.app/)

### Verslo hipotezės, kurias reikia patikrinti

„ParkSense LT“ galėtų išsiskirti šiais deriniais:

1. **Lietuvos lokalizacija:** ne tik išversti atsakymą, bet naudoti Lietuvos KET, lietuviškų ženklų klases ir Vilniaus vietos taisykles.
2. **Sprendimas prieš mokėjimą:** padėti suprasti, ar vietoje apskritai galima stovėti, prieš siūlant aktyvuoti mokėjimą.
3. **Paaiškinimas, ne vien rezultatas:** rodyti, kokį ženklą, lentelę, ženklinimą, laiką ir oficialų šaltinį sistema panaudojo.
4. **Saugus neapibrėžtumas:** geriau grąžinti „trūksta informacijos“, nei klaidingai leisti stovėti.
5. **Oficialių šaltinių sluoksnis:** rodyti duomenų atnaujinimo datą ir perspėti, kai šaltiniai nesutampa.
6. **Integracinė pozicija:** nebandyti iš karto pakeisti JUDU ar UNIPARK mokėjimo funkcijų; pradžioje būti taisyklių paaiškinimo sluoksniu virš jų arba veikti greta jų.

Tai yra produkto hipotezės, o ne patvirtintas rinkos pranašumas. Jas reikia patikrinti naudotojų testais ir palyginimu su esamomis programėlėmis.

## 7. Reikalingi oficialūs duomenų šaltiniai

### 7.1. Kelių eismo taisyklės ir kelio ženklai

- **KET galiojanti suvestinė redakcija:** Lietuvos Respublikos Vyriausybės patvirtintos Kelių eismo taisyklės e-Seime. Reikalinga ženklų, sustojimo, stovėjimo, išimčių ir kitų eismo taisyklių logikai. [KET e-Seime](https://e-seimas.lrs.lt/portal/legalAct/lt/TAD/TAIS.203613/asr)
- **Kelio ženklų įrengimo ir vertikaliojo ženklinimo taisyklės:** reikalingos ženklų įrengimo, galiojimo ir papildomų lentelių interpretacijai. [Taisyklės e-Seime](https://e-seimas.lrs.lt/portal/legalAct/lt/TAD/TAIS.418378)
- **Kelių horizontaliojo ženklinimo taisyklės:** reikalingos linijų, stovėjimo vietų ir kitų kelio dangos ženklų interpretacijai. [Taisyklės e-Seime](https://e-seimas.lrs.lt/portal/legalAct/lt/TAD/TAIS.418377)

### 7.2. Vilniaus parkavimo zonos, kainos ir leidimai

- **JUDU parkavimo zonų puslapis:** zonų ribos, tarifai, apmokestinimo laikas, baltosios zonos ir gyventojų leidimų informacija. [JUDU parkavimo zonos](https://judu.lt/vairuotojams/parkavimosi-zonos-vilniuje/)
- **JUDU mokėjimo būdai ir taisyklės:** mokėjimo kanalai, partneriai, vietinės rinkliavos ir leidimų informacija. [JUDU mokėjimo būdai](https://judu.lt/vairuotojams/mokejimo-budai/)
- **JUDU programėlės ir paslaugų aprašai:** praktinės parkavimo aktyvavimo, sustabdymo, zonos pasirinkimo ir priminimų sąlygos. [JUDU programėlė](https://judu.lt/programele/)
- **Vilniaus miesto interaktyvūs žemėlapiai:** oficialus miesto žemėlapių portalas, galintis būti papildomu geografiniu kontekstu ir duomenų šaltiniu, jei konkreti parkavimo informacija ten pateikiama struktūruotai. [Vilniaus miesto žemėlapiai](https://maps.vilnius.lt/)
- **Vilniaus miesto savivaldybės sprendimai ir teisės aktai:** būtini, kai keičiasi vietinė rinkliava, zonų ribos, tarifai ar leidimų sąlygos. Programėlė turi saugoti konkretaus teisės akto versiją ir įsigaliojimo datą.

### 7.3. Duomenų naudojimo reikalavimai

Kiekvienam naudotojui rodomam teisiniam ar kainos faktui reikėtų saugoti:

- šaltinio pavadinimą ir URL;
- šaltinio leidėją;
- duomenų versiją arba teisės akto redakciją;
- paskutinio patikrinimo ir atnaujinimo laiką;
- teritoriją, kuriai duomuo taikomas;
- galiojimo pradžią ir, jei žinoma, pabaigą;
- duomenų pasitikėjimo būseną: patvirtinta, pasenusi, nesutampa arba nepasiekiama.

Jei oficialūs šaltiniai nesutampa arba nėra pasiekiami, programa neturėtų rodyti kainos ar leidimo kaip patvirtinto fakto. Tokiu atveju turi būti rodomas aiškus perspėjimas ir rekomendacija vadovautis vietoje esančiais ženklais.

## 8. Rekomendacijos „ParkSense LT“ kūrimui

1. **Nepradėti nuo mokėjimo funkcijos.** JUDU, UNIPARK, ParkMan ir carOne jau sprendžia mokėjimo bei parkavimo valdymo uždavinį. Pirmajame etape „ParkSense LT“ turėtų spręsti supratimo ir taisyklių interpretavimo problemą.
2. **Susiaurinti MVP iki Vilniaus ir kelių tipinių situacijų.** Pavyzdžiui: Senamiesčio ženklų derinys, mokama zona su laiko apribojimu, elektromobilio įkrovimo vieta ir neaiški nuotrauka.
3. **Pirmiausia kurti sprendimų medį, tik tada DI atsakymą.** DI turėtų atpažinti objektus ir ištraukti faktus, o taisyklių logika ir leidimo / draudimo išvada turėtų būti tikrinama struktūruotomis taisyklėmis bei oficialiais duomenimis.
4. **Privalomai įtraukti „trūksta informacijos“.** Jei neaiškus bent vienas esminis ženklas, lentelė, kryptis, laikas ar vieta, sistema neturi spėti.
5. **Leisti pateikti kelias nuotraukas.** Viena nuotrauka gali neparodyti ženklo galiojimo krypties, visos lentelės ar kelio ženklinimo.
6. **Vertinti klaidų kainą, ne tik bendrą tikslumą.** Atskirai matuoti klaidingai leidžiančias išvadas; jos pavojingesnės už atsargų atsakymą „nežinau“.
7. **Atlikti aklą palyginimą su konkurentais.** Toms pačioms Vilniaus situacijoms palyginti JUDU / UNIPARK informacijos paieškos laiką su „ParkSense LT“ prototipo laiku.
8. **Tikslinti mokėjimo modelį po naudojimo dažnio tyrimo.** Parkavimo taisyklių klausimas gali būti epizodinis, todėl prieš nustatant mėnesinę prenumeratą reikėtų išbandyti nemokamą naudojimą, vienkartinius kreditus ar dienos paketą.
9. **Atlikti nepriklausomą teisinę ir privatumo peržiūrą.** Ypač svarbu nuotraukų, valstybinių numerių, vietos duomenų, atsakomybės ir oficialių šaltinių naudojimo klausimai.
10. **Nenaudoti nepatikrintų „unikalumo“ teiginių.** Komunikacijoje teigti ne „pirmoji tokia programėlė“, o „Lietuvos KET ir Vilniaus parkavimo informacijai pritaikytas DI paaiškinimo sluoksnis“, kol rinkos pranašumas neįrodytas.

## Galutinės išvados

- **Rinka nėra tuščia.** Lietuvoje yra brandžių parkavimo mokėjimo ir valdymo programėlių, o užsienyje jau veikia DI parkavimo ženklų aiškintuvai.
- **Tiesioginis laisvas tarpas galėtų būti lokalizacija.** Vertę gali sudaryti ne pats vaizdo atpažinimas, o jo sujungimas su Lietuvos KET, Vilniaus zonų duomenimis, oficialiais šaltiniais ir saugiu neapibrėžtumu.
- **Svarbiausia konkurencinė rizika – Parky.AI ir PicPark.** Jie jau įrodo, kad nuotraukos analizės patirtis yra įgyvendinama ir naudotojams suprantama.
- **Svarbiausia produkto rizika – klaidingai leidžianti išvada.** Reikia orientuotis į patikimumą, šaltinių versijavimą ir atsisakymą atsakyti, kai informacijos nepakanka.
- **Pirmasis testas turėtų tikrinti ne „ar DI atpažįsta ženklą“, o ar Vilniaus vairuotojas greičiau ir saugiau priima sprendimą nei naudodamasis esamais šaltiniais.**

## Šaltiniai

1. [JUDU programėlė](https://judu.lt/programele/)
2. [JUDU mokėjimo būdai](https://judu.lt/vairuotojams/mokejimo-budai/)
3. [JUDU parkavimo zonos Vilniuje](https://judu.lt/vairuotojams/parkavimosi-zonos-vilniuje/)
4. [UNIPARK programėlė](https://unipark.lt/unipark-programele)
5. [ParkMan parkavimo programėlė](https://www.parkman.io/lt/parkavimo-programele)
6. [carOne](https://www.carone.app/lt)
7. [Parky.AI](https://parky.ai/)
8. [Parky.AI tikslumo aprašas](https://parky.ai/accuracy/)
9. [PicPark](https://picpark.app/)
10. [AKYS lietuviškų kelio ženklų atpažinimo demonstracija](https://akys.ai/demo/sign-detection)
11. [UNIPARK „Parkomatic“](https://unipark.lt/parkomatic/)
12. [Kelių eismo taisyklės – e-Seimas](https://e-seimas.lrs.lt/portal/legalAct/lt/TAD/TAIS.203613/asr)
13. [Kelio ženklų įrengimo ir vertikaliojo ženklinimo taisyklės – e-Seimas](https://e-seimas.lrs.lt/portal/legalAct/lt/TAD/TAIS.418378)
14. [Kelių horizontaliojo ženklinimo taisyklės – e-Seimas](https://e-seimas.lrs.lt/portal/legalAct/lt/TAD/TAIS.418377)
15. [Vilniaus miesto interaktyvūs žemėlapiai](https://maps.vilnius.lt/)
