# Idėjų dienoraštis

Šio failo paskirtis – kaupti projekto idėjas, pastebėjimus, galimus patobulinimus ir klausimus tolesniam svarstymui.

## „ParkSense LT“ idėjos išklausinėjimo sesijos santrauka

**Sesijos formatas:** 9 klausimų startuolio idėjos išgryninimo pokalbis.

**Projekto stadija:** ankstyva idėja, planuojamas pirmasis Vilniaus MVP.

### 1. Sprendžiama problema

Vairuotojas konkrečioje vietoje ne visada supranta, ar gali teisėtai pastatyti automobilį. Situaciją apsunkina kelių ženklų, papildomų lentelių, parkavimo zonų ir išimčių derinys. Dėl neaiškumo vairuotojai gali:

- rizikuoti gauti baudą;
- gaišti laiką ieškodami kitos stovėjimo vietos;
- patys ieškoti informacijos keliuose skirtinguose šaltiniuose;
- neteisingai suprasti vietines parkavimo taisykles.

„ParkSense LT“ turėtų padėti greitai suprasti konkrečią situaciją: ar stovėti leidžiama, draudžiama, ar trūksta informacijos patikimai išvadai.

### 2. Tiksliniai naudotojai

Pagrindinė auditorija – automobilių vairuotojai, tačiau pirmiausia verta orientuotis į šias grupes:

- naujus vairuotojus;
- didmiesčių gyventojus;
- miestų svečius ir žmones, važiuojančius į nepažįstamas vietas;
- kurjerius;
- elektromobilių vairuotojus;
- vairuotojus, kuriems svarbus greitas atsakymas dėl konkrečios stovėjimo vietos.

**Pradinė rinka:** Vilnius, nes mieste yra skirtingų parkavimo zonų, sudėtingų ženklų derinių ir įvairių apribojimų. Ateityje numatoma plėtra į Kauną, Klaipėdą ir kitus Lietuvos miestus.

### 3. Pagrindinis naudojimo scenarijus

1. Vairuotojas atvyksta į nepažįstamą vietą, pavyzdžiui, Vilniaus senamiestį.
2. Randa laisvą stovėjimo vietą, bet nėra tikras dėl taisyklių.
3. Nufotografuoja kelio ženklus ir papildomas lenteles.
4. Patvirtina buvimo vietą ir nurodo planuojamą stovėjimo laiką, pavyzdžiui, dvi valandas.
5. DI atpažįsta matomus ženklus ir įvertina vietos, laiko, parkavimo zonos bei taisyklių informaciją.
6. Programa pateikia vieną iš trijų aiškių būsenų:
   - stovėti leidžiama;
   - stovėti draudžiama;
   - trūksta informacijos patikimai išvadai.
7. Jei stovėjimas mokamas, programa pateikia zoną ir kainą tik tada, kai turi patikimus ir aktualius duomenis.
8. Jei situacija neaiški, programa nurodo, kokios papildomos nuotraukos ar vietos informacijos trūksta.

**Naudojimo tikslas:** visą procesą atlikti paprastai ir, jei duomenų pakanka, greičiau nei per vieną minutę.

### 4. Vertės pasiūlymas ir išskirtinumas

„ParkSense LT“ vertės pasiūlymas – Lietuvos vairuotojui vienoje vietoje greitai ir paprastai paaiškinti kelio ženklus, parkavimo apribojimus, zoną bei galimą kainą.

Pagrindiniai numatomi išskirtinumai:

- DI naudojimas kelio ženklams ir papildomoms lentelėms atpažinti;
- paprasta lietuvių kalba pateikiamas paaiškinimas;
- vienoje vietoje sujungiama nuotrauka, vieta, laikas ir parkavimo informacija;
- pritaikymas Lietuvos KET ir Lietuvos miestų parkavimo sistemoms;
- ne tik atsakymas, bet ir trumpas paaiškinimas, kodėl padaryta išvada;
- aiškus įspėjimas, kai duomenų nepakanka arba šaltiniai nesutampa.

**Svarbi hipotezė, kurią dar reikia patikrinti:** ar vairuotojai dėl tokio patogumo rinksis specializuotą programėlę, o ne tiesiog naudosis ženklais, žemėlapiais, parkavimo programėlėmis ar oficialiais šaltiniais.

### 5. Pirmosios versijos (MVP) funkcijos

Patvirtintos trys pagrindinės funkcijos:

1. **Kelio ženklų atpažinimas naudojant DI** – nuotraukoje atpažinti kelio ženklus, papildomas lenteles ir, kiek įmanoma, kelio ženklinimą; paaiškinti jų reikšmę.
2. **Parkavimo galimybės įvertinimas** – pagal ženklus, vietą, laiką, galiojančias taisykles ir automobilio tipą pateikti būseną: leidžiama, draudžiama arba trūksta informacijos.
3. **Parkavimo zonų ir kainų informacija** – parodyti, ar vieta yra mokamoje zonoje, zonos pavadinimą ir planuojamo stovėjimo kainą, tik naudojant patikrintus duomenis.

**MVP ribos:** nemėginti iš karto aprėpti visos Lietuvos, visų leidimų tipų ar alternatyvių vietų paieškos. Pirmiausia patikrinti vieną aiškiai apibrėžtą Vilniaus naudojimo scenarijų.

### 6. Informacijos tikslumo strategija

Prioritetiniai šaltiniai:

- oficialios Lietuvos kelių eismo taisyklės;
- oficialūs savivaldybių šaltiniai;
- Vilniaus miesto JUDU informacija;
- oficialūs parkavimo zonų ir kainų duomenys.

Numatyta:

- parkavimo zonų ir kainų pasikeitimus tikrinti bent kartą per dieną;
- KET ir savivaldybių taisyklių pakeitimus sekti pagal oficialius pranešimus;
- prie atsakymo rodyti paskutinio atnaujinimo datą ir naudotus šaltinius;
- šaltiniams nesutapus arba duomenims pasenus, nerodyti kategoriško atsakymo;
- tokioje situacijoje rekomenduoti vadovautis vietoje esančiais ženklais ir oficialiomis taisyklėmis.

**Būtina patikslinti prieš kūrimą:** kas bus atsakingas už duomenų šaltinių stebėseną, kaip bus fiksuojamos jų versijos, kokia bus pasenusių duomenų galiojimo politika ir kada sistema privalės atsisakyti pateikti leidžiančią išvadą.

### 7. Galimas pajamų modelis

Siūlomas modelis – nemokama pagrindinė versija ir mokamos papildomos funkcijos.

**Nemokamai:**

- kelio ženklų atpažinimas;
- parkavimo taisyklių paaiškinimas;
- bazinis atsakymas apie stovėjimo galimybę.

**Galimai mokamai:**

- neribota nuotraukų analizė;
- parkavimo laiko priminimai;
- alternatyvių stovėjimo vietų paieška;
- papildomos funkcijos dažnai vairuojantiems žmonėms.

Pradinė svarstoma kaina – **2,99 Eur per mėnesį**, tačiau tai tik hipotezė, kurią reikia patikrinti su naudotojais. Ateityje galimas bendradarbiavimas su automobilių nuomos įmonėmis, parkavimo aikštelių operatoriais ar savivaldybėmis.

**Principas:** mokamos funkcijos negali pabloginti saugumo informacijos ar DI atsakymų patikimumo. Reklama neturėtų trukdyti vairuotojui greitai priimti sprendimą.

### 8. Didžiausios rizikos

#### Techninės rizikos

- klaidingas arba nepakankamai tikslus kelio ženklų atpažinimas;
- prastos kokybės, neryškios ar neišsamios nuotraukos;
- netiksli GPS vieta;
- neveikiantis interneto ryšys;
- nepasiekiami išoriniai duomenų šaltiniai;
- sudėtingas kelių ženklų, papildomų lentelių ir ženklinimo derinys.

#### Teisinės ir atsakomybės rizikos

- vairuotojas gali gauti baudą dėl klaidingo arba pasenusio atsakymo;
- vien įspėjimas apie DI ribotumus nebūtinai panaikina atsakomybės riziką;
- neaiškus atsakomybės pasiskirstymas tarp programėlės, duomenų tiekėjo ir naudotojo;
- asmens duomenų, nuotraukų ir vietos informacijos apsaugos reikalavimai.

#### Duomenų rizikos

- pasikeitusios KET, zonos, kainos ar leidimų sąlygos;
- skirtingų oficialių šaltinių neatitikimai;
- neaiški duomenų atnaujinimo data arba šaltinio nepasiekiamumas.

#### Verslo rizikos

- žmonės gali naudotis programa retai, nes parkavimo klausimas kyla ne kiekvieną dieną;
- naudotojai gali nenorėti mokėti 2,99 Eur per mėnesį;
- rinkoje jau gali būti pakankamai patogių žemėlapių ar parkavimo sprendimų;
- sudėtinga išlaikyti tikslumą plečiantis iš Vilniaus į kitus miestus.

#### Pasitikėjimo rizika

Vienas akivaizdžiai klaidingas leidžiantis atsakymas gali pakenkti naudotojų pasitikėjimui. Saugiau pateikti neaiškumo įspėjimą nei spėti.

### 9. Patvirtinti sėkmės rodikliai ir bandymas

Pirmam bandymui numatyta:

- sukurti paprastą veikiantį MVP;
- nemokamai išbandyti jį su 50–100 Vilniaus vairuotojų;
- įtraukti naujų vairuotojų, studentų, miesto gyventojų ir žmonių, važinėjančių į nepažįstamas vietas;
- vertinti naudojimo paprastumą, ženklų atpažinimo tikslumą ir atsakymo naudą;
- atsakymų tikslumą tikrinti pagal iš anksto ekspertų patikrintas parkavimo situacijas, o ne vien pagal naudotojų nuomonę.

Pradiniai tikslai:

- bent 50 žmonių išbando programėlę;
- bent 80 proc. naudotojų nurodo, kad programėlė buvo naudinga;
- bent 30 proc. naudotojų per mėnesį sugrįžta;
- bent 70 proc. rekomenduotų programėlę draugams;
- bent 10 proc. susidomėtų mokamomis papildomomis funkcijomis.

Papildomai reikalinga trumpa apklausa apie trūkstamas funkcijas, neaiškius atsakymus ir pasitikėjimą programa.

### 10. Idėjos įvertinimas

#### Stiprybės

- Sprendžiama aiški ir reali problema, galinti sukelti finansinių nuostolių bei stresą.
- Naudotojui siūloma konkreti nauda: greitas atsakymas vienoje vietoje.
- Vilnius yra tinkama ribota pradinė rinka su pakankamai sudėtingu parkavimo kontekstu.
- Idėja orientuota ne tik į atsakymą, bet ir į paaiškinimą, todėl gali būti suprantamesnė naujiems vairuotojams.
- Atsakingai pripažįstama, kad DI gali klysti ir kad svarbus neapibrėžtumo rodymas.
- Numatyti ekspertų patikrinti testiniai scenarijai ir konkretūs MVP bandymo rodikliai.
- Nemokamas pagrindinis planas mažina pirmąją išbandymo kliūtį.

#### Silpnybės ir neišspręsti klausimai

- Neaišku, ar naudotojai norės fotografuoti ženklus, jei atsakymą gali rasti naudodamiesi kitais sprendimais.
- Pagrindinė vertė priklauso nuo labai aukšto teisinio ir duomenų tikslumo lygio.
- Vairuotojui gali būti sunku nufotografuoti visus ženklus, lenteles ir ženklinimą vienu kadru.
- Kainų ir zonų duomenų atnaujinimas gali būti techniškai bei organizaciškai sudėtingas.
- Programėlės atsakymo patikimumą sunku apibrėžti vienu procentu, nes klaidos skirtingose situacijose turi nevienodą žalą.
- „Visi vairuotojai“ yra per plati pradinė auditorija; MVP reikėtų rinktis vieną svarbiausią segmentą.
- Prenumeratos vertė gali būti per maža retai programėlę naudojantiems vairuotojams.
- Teisinės atsakomybės ir duomenų apsaugos klausimai turi būti išspręsti prieš viešą paleidimą.

### 11. Siūlomi patobulinimai

1. **Susiaurinti pirmąjį segmentą.** Pradėti nuo Vilniaus svečių ir naujų vairuotojų, kuriems dažniausiai kyla taisyklių supratimo problema.
2. **Sukurti saugumo ribas.** Jei neaiškus bent vienas esminis ženklas, papildoma lentelė, vieta ar galiojimo laikas, sistema turi grąžinti „trūksta informacijos“, o ne spėti.
3. **Įdiegti kelių nuotraukų scenarijų.** Leisti fotografuoti pagrindinį ženklą, papildomą lentelę ir platesnį vietos vaizdą atskirai.
4. **Rodyti faktų ir išvados atskyrimą.** Atsakyme atskirai pateikti, kas matoma nuotraukoje, kokie duomenys gauti iš šaltinių ir kokia išvada padaryta.
5. **Kainas ir zonas pirmiausia laikyti antriniu MVP sluoksniu.** Jei nėra patikimos oficialios integracijos, verčiau rodyti „nepavyko patvirtinti“ nei preliminarią kainą kaip faktą.
6. **Sukurti ekspertinių atvejų rinkinį.** Prieš testuojant su naudotojais paruošti įvairius Vilniaus scenarijus: aiškiai leidžiamą, aiškiai draudžiamą, mokamą, riboto laiko, su išimtimi ir nepakankamos informacijos atvejį.
7. **Vertinti ne tik bendrą tikslumą.** Atskirai matuoti klaidingai leidžiančių atsakymų skaičių, nes jie pavojingesni už atsargius „nežinau“ atsakymus.
8. **Patikrinti naudojimo dažnį prieš renkantis prenumeratą.** Išbandyti vienkartinį paketą, dienos leidimą arba ribotą analizės kreditų modelį, jei mėnesinė prenumerata retai naudojantiems vairuotojams neatrodytų patraukli.
9. **Atlikti konkurencinį naudotojo testą.** Palyginti, kiek laiko užtrunka gauti atsakymą su „ParkSense LT“ ir su dabartiniais oficialiais bei komerciniais sprendimais.
10. **Prieš viešą paleidimą atlikti teisinę ir privatumo peržiūrą.** Aiškiai aprašyti duomenų tvarkymą, atsakymo ribas, šaltinių aktualumą ir naudotojo pareigą vadovautis vietoje esančiais ženklais.

### 12. Rekomenduojamas artimiausias planas

1. Apibrėžti vieną MVP naudotojo segmentą ir vieną pagrindinį Vilniaus scenarijų.
2. Surinkti 30–50 ekspertų patikrintų parkavimo situacijų su nuotraukomis, vieta, laiku, taisykle ir teisinga išvada.
3. Aprašyti, kokiais oficialiais šaltiniais remsis kiekvienas duomenų tipas.
4. Sukurti minimalią naudotojo eigą: nuotrauka → vieta → laikas → trijų būsenų atsakymas → šaltinis ir įspėjimas.
5. Prieš naudotojų testą išmatuoti atpažinimo ir išvadų tikslumą ekspertiniame rinkinyje.
6. Išbandyti su 50–100 Vilniaus vairuotojų ir rinkti tiek kiekybinius rodiklius, tiek konkrečius klaidų pavyzdžius.
7. Tik po bandymo spręsti dėl kainodaros, papildomų funkcijų ir plėtros į kitus miestus.

## Galutinė mentoriaus išvada

„ParkSense LT“ turi aiškią naudotojo problemą ir prasmingą vertės pasiūlymą, ypač Vilniaus svečiams, naujiems vairuotojams ir žmonėms, susiduriantiems su nepažįstamais parkavimo ženklais. Didžiausias pranašumas būtų ne vien DI nuotraukos atpažinimas, o patikimas Lietuvos taisyklių, vietos, laiko ir aiškaus paaiškinimo sujungimas viename atsakyme.

Didžiausia silpnybė – programa gali būti vertinga tik tada, kai jos atsakymai yra pakankamai tikslūs ir atsargūs. Todėl pirmasis tikslas neturėtų būti kuo daugiau funkcijų ar miestų, o patikimas siauro scenarijaus įgyvendinimas Vilniuje. Ypač svarbu sumažinti klaidingai leidžiančių atsakymų skaičių, o ne bet kokia kaina siekti aukšto bendro DI tikslumo.

Rekomendacija: tęsti projektą kaip kontroliuojamą Vilniaus MVP eksperimentą, pirmiausia įrodant tris dalykus – kad naudotojai nori tokio atsakymo, kad ekspertų patikrintuose scenarijuose išvada yra patikima ir kad bent dalis naudotojų mato pakankamą vertę mokamoms papildomoms funkcijoms.
