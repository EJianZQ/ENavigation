import { defineStore } from "pinia";
import defaultShortCut from "@/assets/defaultShortCut";

const useSiteDataStore = defineStore("siteData", {
  state: () => {
    return {
      // 捷径数据
      shortcutData: defaultShortCut,
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
