// Kielikerros. `T` on elävä näkymä aktiiviseen localeen: komponentit lukevat
// `T.avain` renderöidessään, joten kielen vaihto ja uudelleenrenderöinti riittää
// (sj-app rakentaa DOM:n uusiksi joka renderissä, ei sivun latausta).
//
// Malli on Jakon `src/shared/i18n.jsx`:n moduulitason tr()/getLang(), portattuna
// ilman Reactia (porttaa-ominaisuus-skill: mekanismi jaetaan, data ei). Pois jäi
// se mikä oli 23 kielen taakkaa eikä kielituen ydintä: hook, lazy-chunkit,
// slaavilaiset monikot ja ajonaikainen avainvertailu. Pariteetin tekee tsc, koska
// jokainen locale on tyyppiä `Strings` (= suomen muoto).
//
// Kielet ja tallennus ovat domainissa (prefs.ts › LANGS, LangPrefs); nimet ja
// tunnistus ovat täällä, koska ne ovat UI-asiaa.
import { LANGS, type Lang } from "../domain/prefs";
import { fi, type Strings } from "./locales/fi";
import { sv } from "./locales/sv";

export type { Strings };
export { LANGS, type Lang };

const LOCALES: Record<Lang, Strings> = { fi, sv };

/** Kielen oma nimi valitsimiin. Ei käännetä: valitsija ei vielä osaa kohdekieltä. */
export const LANG_NAMES: Record<Lang, string> = { fi: "Suomi", sv: "Svenska" };

let current: Lang = "fi";

export function getLang(): Lang {
  return current;
}

/** Vaihtaa aktiivisen kielen ja päivittää dokumentin lang-attribuutin
 *  (ruudunlukija, tavutus). Kutsuja renderöi itse uudelleen. */
export function setLang(lang: Lang): void {
  current = lang;
  if (typeof document !== "undefined") document.documentElement.lang = lang;
}

export const isLang = (x: unknown): x is Lang => LANGS.includes(x as Lang);

/** Selaimen kieli → tuettu kieli. Vain ruotsin etuliite tunnistetaan; kaikki muu
 *  putoaa suomeen, koska suomi on totuuden lähde eikä englantia ole. */
export function detectLang(navLang: string | undefined): Lang {
  return /^sv/i.test(navLang ?? "") ? "sv" : "fi";
}

/** Alkukieli: URL-parametri voittaa tallennetun valinnan, tallennettu selaimen.
 *  Parametria ei tallenneta (Jakon linjaus): jaetulla linkillä avattu kieli ei saa
 *  jäädä vierailijan pysyväksi valinnaksi. */
export function resolveInitialLang(
  urlParam: string | null,
  saved: Lang | null,
  navLang: string | undefined,
): Lang {
  if (isLang(urlParam)) return urlParam;
  if (saved) return saved;
  return detectLang(navLang);
}

/** Aktiivisen kielen tekstit. Proxy hakee jokaisen luvun sen hetken kielestä;
 *  puuttuva arvo putoaa suomeen (tyyppi estää puutteen buildissa, tämä on
 *  ajonaikainen vyö). */
export const T: Strings = new Proxy(fi, {
  get(_target, key) {
    const k = key as keyof Strings;
    return LOCALES[current][k] ?? fi[k];
  },
});
