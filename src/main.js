import { createApp, watch } from "vue";
// Pinia
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// IconFont
import SvgIcon from "@/components/SvgIcon.vue";
import { i18n, normalizeLocale, resolveInitialLocale, setAppLocale } from "@/i18n";
import { setStore, siteStore } from "@/stores";
import { normalizeShortcutData } from "@/utils/shortcutData";
import { normalizeTodoData } from "@/utils/todoData";
// 主组件
import App from "@/App.vue";
// 全局样式
import "@/style/global.scss";

const SHORTCUT_DATA_BACKUP_KEY = "shortcutDataBackup";
const TODO_DATA_BACKUP_KEY = "todoDataBackup";

// 根组件
const app = createApp(App);

// Pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(i18n);

const settings = setStore(pinia);
const initialLocale = normalizeLocale(settings.language || resolveInitialLocale());
if (settings.language !== initialLocale) {
  settings.language = initialLocale;
}

const site = siteStore(pinia);
const rawShortcutData = site.shortcutData;
const rawTodoData = site.todoData;

try {
  const normalizedShortcutData = normalizeShortcutData(rawShortcutData, {
    locale: initialLocale,
    strict: true,
  });
  if (JSON.stringify(rawShortcutData) !== JSON.stringify(normalizedShortcutData)) {
    site.shortcutData = normalizedShortcutData;
  }
} catch (error) {
  try {
    window.localStorage.setItem(
      SHORTCUT_DATA_BACKUP_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        reason: error instanceof Error ? error.message : String(error),
        data: rawShortcutData,
      }),
    );
  } catch {
    // Ignore backup persistence failures and continue with a safe fallback.
  }

  const fallbackShortcutData = normalizeShortcutData(rawShortcutData, {
    locale: initialLocale,
  });
  console.warn("Shortcut data migration fallback was used.", error);
  if (JSON.stringify(rawShortcutData) !== JSON.stringify(fallbackShortcutData)) {
    site.shortcutData = fallbackShortcutData;
  }
}

try {
  const normalizedTodoData = normalizeTodoData(rawTodoData, {
    strict: true,
  });
  if (JSON.stringify(rawTodoData) !== JSON.stringify(normalizedTodoData)) {
    site.todoData = normalizedTodoData;
  }
} catch (error) {
  try {
    window.localStorage.setItem(
      TODO_DATA_BACKUP_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        reason: error instanceof Error ? error.message : String(error),
        data: rawTodoData,
      }),
    );
  } catch {
    // Ignore backup persistence failures and continue with a safe fallback.
  }

  const fallbackTodoData = normalizeTodoData(rawTodoData);
  console.warn("Todo data migration fallback was used.", error);
  if (JSON.stringify(rawTodoData) !== JSON.stringify(fallbackTodoData)) {
    site.todoData = fallbackTodoData;
  }
}

watch(
  () => [settings.language, settings.pageTitle],
  ([language, pageTitle]) => {
    const normalizedLocale = normalizeLocale(language);
    if (settings.language !== normalizedLocale) {
      settings.language = normalizedLocale;
    }
    setAppLocale(normalizedLocale, pageTitle);
  },
  { immediate: true },
);

const asciiArt = [
  " _     _____  _   _  _____   ___  _____   __ _   _ ",
  "| |   |  _  || | | ||  ___|  |  \\/  | \\ \\ / /| \\ | |",
  "| |   | | | || | | || |__    | .  . |  \\ V / |  \\| |",
  "| |   | | | || | | ||  __|   | |\\/| |  /   \\ | . ` |",
  "| |___\\ \\_/ /\\ \\_/ /| |___   | |  | | / /^\\ \\| |\\  |",
  "\\_____/\\___/  \\___/ \\____/   \\_|  |_/ \\/   \\/\\_| \\_/"
].join("\n");
console.log(`%c${asciiArt}`, "color: #ff69b4; font-weight: bold;");

// 挂载
app.component("SvgIcon", SvgIcon);
app.mount("#app");
