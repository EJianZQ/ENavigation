import { defineStore } from "pinia";
import { getDefaultShortcuts } from "@/assets/defaultShortCut";
import { resolveInitialLocale } from "@/i18n";
import { normalizeShortcutData } from "@/utils/shortcutData";

const useSiteDataStore = defineStore("siteData", {
  state: () => {
    const initialLocale = resolveInitialLocale();
    return {
      // 捷径数据
      shortcutData: normalizeShortcutData(getDefaultShortcuts(initialLocale), {
        locale: initialLocale,
      }),
      // 待办数据
      todoData: [],
      // 便签数据
      noteData: [],
      // 搜索历史
      searchHistory: [],
    };
  },
  // 开启数据持久化
  persist: {
    key: "siteData",
    storage: window.localStorage,
  },
});

export default useSiteDataStore;
