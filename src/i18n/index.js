import { createI18n } from "vue-i18n";
import zhCN from "@/i18n/messages/zh-CN";
import zhTW from "@/i18n/messages/zh-TW";
import enUS from "@/i18n/messages/en-US";

export const SUPPORTED_LOCALES = ["zh-CN", "zh-TW", "en-US"];

export const messages = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  "en-US": enUS,
};

const getPersistedLanguage = () => {
  try {
    const raw = window.localStorage.getItem("setData");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.language || "";
  } catch {
    return "";
  }
};

export const normalizeLocale = (locale = "") => {
  const normalized = String(locale).trim().toLowerCase();
  if (!normalized) return "zh-CN";
  if (
    normalized.startsWith("zh-tw") ||
    normalized.startsWith("zh-hk") ||
    normalized.startsWith("zh-mo")
  ) {
    return "zh-TW";
  }
  if (normalized.startsWith("zh")) {
    return "zh-CN";
  }
  if (normalized.startsWith("en")) {
    return "en-US";
  }
  return "zh-CN";
};

export const resolveInitialLocale = () => {
  const persisted = getPersistedLanguage();
  if (SUPPORTED_LOCALES.includes(persisted)) {
    return persisted;
  }
  return normalizeLocale(navigator.language || navigator.languages?.[0] || "");
};

export const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: "zh-CN",
  globalInjection: true,
  messages,
});

const getMessageByPath = (key, locale) => {
  return key
    .split(".")
    .reduce(
      (result, segment) => (result && segment in result ? result[segment] : undefined),
      messages[locale],
    );
};

const interpolateMessage = (message, params = {}) => {
  if (typeof message !== "string") {
    return String(message);
  }
  return message.replace(/\{(\w+)\}/g, (_, token) => params[token] ?? `{${token}}`);
};

const getSiteBrand = () => import.meta.env.VITE_SITE_TITLE || "ENavigation";
const getAuthor = () => import.meta.env.VITE_SITE_ANTHOR || "";

const updateMetaTag = (selector, content) => {
  const tag = document.querySelector(selector);
  if (tag) tag.setAttribute("content", content);
};

export const getDefaultDocumentTitle = (locale) => {
  const currentLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "zh-CN";
  const titleTemplate =
    getMessageByPath("site.meta.title", currentLocale) ??
    getMessageByPath("site.meta.title", "zh-CN") ??
    "{brand}";
  return interpolateMessage(titleTemplate, { brand: getSiteBrand() });
};

export const resolveDocumentTitle = (locale, customPageTitle = "") => {
  const normalizedTitle = String(customPageTitle || "").trim();
  return normalizedTitle || getDefaultDocumentTitle(locale);
};

export const applyDocumentLocale = (locale, customPageTitle = "") => {
  const currentLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "zh-CN";
  const title = resolveDocumentTitle(currentLocale, customPageTitle);
  const description = messages[currentLocale].site.meta.description;

  document.documentElement.setAttribute("lang", currentLocale);
  document.title = title;
  updateMetaTag('meta[name="description"]', description);
  updateMetaTag('meta[name="apple-mobile-web-app-title"]', title);
  updateMetaTag('meta[name="author"]', getAuthor());
};

export const setAppLocale = (locale, customPageTitle = "") => {
  const nextLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "zh-CN";
  i18n.global.locale.value = nextLocale;
  applyDocumentLocale(nextLocale, customPageTitle);
  return nextLocale;
};

export const getCurrentLocale = () => i18n.global.locale.value;

export const translate = (key, params = {}, locale = getCurrentLocale()) => {
  const nextLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "zh-CN";
  const rawMessage =
    getMessageByPath(key, nextLocale) ?? getMessageByPath(key, "zh-CN") ?? i18n.global.t(key, params);

  return interpolateMessage(rawMessage, params);
};
