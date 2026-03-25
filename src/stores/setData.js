import { defineStore } from "pinia";

const useSetDataStore = defineStore("setData", {
  state: () => {
    return {
      // 主题类别
      themeType: "light",
      // 壁纸类别
      // 0 本地 / 1 必应 / 2 随机风景 / 3 随机动漫 / 4 自定义
      backgroundType: 3,
      backgroundCustom: "",
      // 壁纸遮罩
      showBackgroundGray: true,
      // 壁纸模糊
      backgroundBlur: 0,
      // 搜索引擎
      searchEngine: "google",
      lastSearchEngine: "google",
      customEngineUrl: "",
      // 搜索框收起
      smallInput: false,
      // 搜索框自动 focus
      autoFocus: false,
      // 搜索后搜索框自动失焦
      autoInputBlur: true,
      // 时间样式
      timeStyle: "one",
      // 显示农历
      showLunar: false,
      // 是否显秒
      showSeconds: false,
      // 是否显零
      showZeroTime: true,
      // 12 小时制
      use12HourFormat: false,
      // 一言显示
      showHitokoto: true,
      showHitokotoSource: true,
      hitokotoAsPlaceholder: false,
      // 一言句子类型
      hitokotoTypes: ["d"],
      // 是否显示搜索建议
      showSuggestions: true,
      // 搜索建议来源
      suggestionProvider: "google",
      // 跳转方式
      // open 新标签页 / href 当前页面
      urlJumpType: "href",
      // GitHub Gist 同步 Token
      githubToken: "",
      // GitHub Gist ID
      gistId: "",
      // 自动同步
      autoSync: false,
      // 是否已完成过同步（新设备保护）
      hasSynced: false,
      // 夜间自动暗色模式
      autoNightMode: false,
    };
  },
  actions: {
    setSearchEngine(value, custom = false) {
      // 储存上次
      if (this.searchEngine !== "custom") {
        this.lastSearchEngine = this.searchEngine;
      }
      // 设置新引擎
      if (custom) {
        this.customEngineUrl = value;
        this.searchEngine = "custom";
        return;
      }
      this.searchEngine = value;
    },
  },
  // 开启数据持久化
  persist: {
    key: "setData",
    storage: window.localStorage,
  },
});

export default useSetDataStore;
