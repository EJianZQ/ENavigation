import { defineStore } from "pinia";

const useStatusDataStore = defineStore("statusData", {
  state: () => {
    return {
      // 壁纸状态
      imgLoadStatus: false,
      // 站点状态
      // normal 正常 / focus 搜索 / box 盒子 / set 设置
      siteStatus: "normal",
      // 切换搜索引擎
      engineChangeStatus: false,
      // 搜索框文本
      searchInputValue: "",
      // 盒子大小
      mainBoxBig: false,
      // 首次打开热键引导是否显示
      showHotkeyGuide: false,
      // 是否已经看过首次打开热键引导
      hasSeenHotkeyGuide: false,
      // 夜间自动暗色当前是否生效
      nightModeActive: false,
      // 夜间自动暗色时的临时主题覆盖
      tempThemeOverride: "",
      // 临时主题覆盖所属的夜晚标识
      tempThemeOverrideNightKey: "",
      // 一言数据 (供其他组件共享，比如搜索框placeholder)
      hitokotoText: "",
      hitokotoFrom: "",
    };
  },
  getters: {},
  actions: {
    setImgLoadStatus(value) {
      this.imgLoadStatus = value;
    },
    setSiteStatus(value, alsoChange = true) {
      this.siteStatus = value;
      if (value !== "focus") this.searchInputValue = "";
      if (alsoChange) this.engineChangeStatus = false;
    },
    setEngineChangeStatus(value) {
      this.engineChangeStatus = value;
    },
    setSearchInputValue(value) {
      this.searchInputValue = value;
    },
    setMainBoxBig(value) {
      this.mainBoxBig = value;
    },
    setShowHotkeyGuide(value) {
      this.showHotkeyGuide = value;
    },
    setHasSeenHotkeyGuide(value) {
      this.hasSeenHotkeyGuide = value;
    },
    setNightModeActive(value) {
      this.nightModeActive = value;
    },
    setTempThemeOverride(value) {
      this.tempThemeOverride = value;
    },
    setTempThemeOverrideNightKey(value) {
      this.tempThemeOverrideNightKey = value;
    },
  },
  // 开启数据持久化
  persist: {
    key: "statusData",
    storage: window.localStorage,
    paths: ["mainBoxBig", "hasSeenHotkeyGuide", "tempThemeOverride", "tempThemeOverrideNightKey"],
  },
});

export default useStatusDataStore;
