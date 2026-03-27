import { createApp, watch } from "vue";
// Pinia
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// IconFont
import SvgIcon from "@/components/SvgIcon.vue";
import { i18n, normalizeLocale, resolveInitialLocale, setAppLocale } from "@/i18n";
import { setStore } from "@/stores";
// 主组件
import App from "@/App.vue";
// 全局样式
import "@/style/global.scss";

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
