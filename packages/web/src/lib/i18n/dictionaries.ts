import "server-only";
import type { Locale } from "./locales";
import type enDictionary from "./dictionaries/en.json";

export type Dictionary = typeof enDictionary;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => dictionaries[locale]();
