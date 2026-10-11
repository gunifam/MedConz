import { en, type UIKey } from "./en";
import { ha } from "./ha";
import { yo } from "./yo";
import { ig } from "./ig";

export type Lang = "en" | "ha" | "yo" | "ig";
export const LANGS: Lang[] = ["en", "ha", "yo", "ig"];

const DICTS: Record<Lang, Record<UIKey, string>> = { en, ha, yo, ig };

export function t(lang: string, key: UIKey): string {
  const dict = (DICTS as Record<string, Record<UIKey, string>>)[lang] ?? en;
  return dict[key] ?? en[key];
}
export type { UIKey };
