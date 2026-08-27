// Pelin sisäinen muutosloki, pelaajan kielellä (sama malli kuin Jako-projektissa:
// mekanismi jaetaan, data on oma). Tämä EI ole CHANGELOG.md:n kopio: tekninen
// muutosloki asuu siellä, tässä kerrotaan vain se mikä näkyy pelaajalle, ja miksi.
// Uusin merkintä taulukon alkuun julkaisun yhteydessä. Vain suomeksi.
export interface ChangelogEntry {
  /** Versio, sama kuin versioleimassa. */
  readonly version: string;
  /** Julkaisupäivä muodossa p.k.vvvv. */
  readonly date: string;
  readonly items: readonly string[];
}

export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    version: "0.18.0",
    date: "28.8.2026",
    items: [
      "Peli sai tämän muutoslokin. Löydät sen jatkossa Tietoja-näkymästä versionumeron vierestä. Vanhat merkinnät on koottu tähän jälkikäteen julkaisuhistoriasta.",
    ],
  },
  {
    version: "0.17.0",
    date: "16.8.2026",
    items: [
      "Sääntöihin tuli sanasto: 24 termiä kolmessa ryhmässä (tulokortti, vuoro, kombot). Termi näkyy sääntötekstissä katkoviivalla alleviivattuna, ja napautus avaa selityksen suoraan rivin alle. Sääntöjen lopussa on lisäksi koko sanasto listana.",
    ],
  },
  {
    version: "0.16.0",
    date: "16.7.2026",
    items: [
      "Superjatsi on nyt yksinpeli. Saman laitteen vuoropeli poistui, koska yksi kuuden nopan peli kestää 20-25 minuuttia eikä monen pelaajan peli tullut loppuun pelatuksi. Pelaat omaa tulostasi ja ennätyksiäsi vastaan.",
      "Uusi Tietoja-näkymä (ℹ-nappi): pelin esittely, palautelinkki ja ohje pelin asentamiseen aloitusnäytölle. Versionumero näkyy nyt aloitusnäytöllä ja Tietoja-näkymässä.",
    ],
  },
  {
    version: "0.15.0",
    date: "12.7.2026",
    items: [
      "Pystyasennossa puhelimella koko peli mahtuu nyt näytölle ilman vieritystä: nopat, tulokortti ja Heitä-nappi näkyvät kerralla.",
    ],
  },
  {
    version: "0.14.0",
    date: "7.7.2026",
    items: [
      "Pelin päätyttyä Pelaa uudelleen aloittaa heti uuden pelin samalla noppamäärällä. Rinnalle tuli Valikkoon-nappi, josta pääsee vaihtamaan nimen ja noppamäärän.",
      "Tulokortin selitteet toimivat nyt myös kosketusnäytöllä: sarakeotsikkoa tai rivin nimeä napauttamalla aukeaa selite, joka aiemmin näkyi vain hiirellä.",
      "Heitä-napin vahinkotuplanapautus ei enää kuluta kahta heittoa.",
    ],
  },
  {
    version: "0.10.0-0.13.0",
    date: "6.-7.7.2026",
    items: [
      "Uusi ääniteema Torvi & kantele, valittavissa asetuksista kun äänet ovat päällä. Äänet tulevat oikeista soittimista: aidosta kanteleesta ja käyrätorvesta.",
      "Asetuksiin tuli Kokeile ääniä -paneeli, jossa jokaista pelin ääntä voi kuunnella etukäteen.",
      "Kapealla näytöllä aloitusnäyttö ehdottaa viittä noppaa, koska kuusi ahtautuu pienelle ruudulle. Oma valintasi voittaa ehdotuksen aina.",
    ],
  },
  {
    version: "0.9.0",
    date: "5.7.2026",
    items: [
      "Peli sai äänet. Ne ovat oletuksena pois päältä ja kytketään asetuksista (⚙): heitto, lukitus, kirjaus ja merkkihetket kuten yläbonuksen varmistuminen ja voitto kuuluvat kukin omalla äänellään.",
      "Aloitusnäyttö muistaa nyt myös noppamäärävalintasi.",
    ],
  },
  {
    version: "0.8.0",
    date: "5.7.2026",
    items: [
      "Ennätysten rinnalle tuli keskiarvoseuranta: jokainen aloitettu peli lasketaan mukaan, ja Ennätykset-näkymä näyttää koko historian keskiarvon sekä viimeisten 20 pelin suunnan. Top 10 mittaa huippuja, keskiarvo tasaisuutta.",
    ],
  },
  {
    version: "0.6.0-0.7.0",
    date: "4.7.2026",
    items: [
      "Erinomainen heitto juhlitaan tähtimyrskyllä. Rajat on mitattu niin, ettei myrskyä tule jatkuvasti: näyttävin efekti osuu noin kuudesti pelissä.",
      "Yläsumma- ja Bonus-riveille tuli selitteet, jotka kertovat bonusehdon ja tahtiluvun merkityksen.",
      "Peliä voi pelata kokonaan näppäimistöllä: tulokortin ruudut ovat valittavissa sarkaimella ja kirjattavissa Enterillä.",
    ],
  },
  {
    version: "0.5.0",
    date: "4.7.2026",
    items: [
      "Nimi palasi: peli on taas Superjatsi.",
      "Täyssuoran pisteet nousivat 21:stä 25:een ja kuuden nopan yläbonus 50:stä 100:aan. Kuuden nopan täyssuora on niin harvinainen, että se palkitaan nyt erikseen.",
      "Kombojen nimillä ja sarakeotsikoilla on selitteet, heitetyt nopat laskeutuvat pöytään pienellä animaatiolla, ja ennätysnäkymässä 5 ja 6 nopan listat ovat omilla välilehdillään.",
      "Ruutu saa pienen tähden, kun tarjolla on kategorian suurin mahdollinen pistemäärä.",
    ],
  },
  {
    version: "0.4.0-0.4.2",
    date: "2.7.2026",
    items: [
      "Nopat saivat jalometallisävyt: mitä suurempi silmäluku, sitä kullanhohtoisempi noppa.",
      "Kuuden nopan peliin tuli kaksi uutta kombosta: Huvila (kaksi eri kolmikkoa) ja Torni (nelikkö ja pari), molemmista pisteinä kaikkien noppien summa.",
      "ALAS- ja YLÖS-sarakkeissa nuoli näyttää seuraavan täytettävän rivin jo ennen heittoa.",
      "Pelin voi asentaa puhelimeen tai koneelle sovellukseksi, ja se toimii asennettuna myös ilman verkkoa.",
      "Pelin päätyttyä tuloksesta voi ladata kuvan jaettavaksi.",
      "Korjaus: peli ei voi enää jumittua tilanteeseen, jossa ei ole yhtään laillista siirtoa. Avoimen rivin saa aina polttaa.",
    ],
  },
  {
    version: "0.2.0-0.3.0",
    date: "10.6.2026",
    items: [
      "Ennätyslista: kymmenen parasta tulosta tallentuvat selaimeesi, 5 ja 6 nopan pelit erikseen. Mitään ei lähetetä verkkoon.",
      "Aloitusnäyttö muistaa nimesi seuraavalla kerralla.",
    ],
  },
  {
    version: "0.1.0",
    date: "5.6.2026",
    items: [
      "Ensimmäinen julkaisu: 5 nopan jatsi ja 6 nopan Superjatsi, kolme sarakemuotoa (I/II/III, ALAS, YLÖS), kaksivaiheinen kirjaus ja kesken jääneen pelin palautus.",
    ],
  },
];
