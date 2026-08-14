import en from "../../messages/en.json";
import ru from "../../messages/ru.json";
import zh from "../../messages/zh.json";

export const messagesByLocale = {
  en,
  ru,
  zh,
} as const;

export function getMessagesForLocale(locale: string) {
  if (locale === "en" || locale === "zh" || locale === "ru") {
    return messagesByLocale[locale];
  }
  return messagesByLocale.ru;
}
