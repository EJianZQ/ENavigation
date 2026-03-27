<template>
  <Provider>
    <!-- 壁纸 -->
    <Cover @loadComplete="loadComplete" />
    <!-- 主界面 -->
    <Transition name="fade" mode="out-in">
      <main
        v-if="status.imgLoadStatus"
        tabindex="0"
        id="main"
        :class="`main-${status.siteStatus}`"
        :style="{ pointerEvents: mainClickable ? 'auto' : 'none' }"
        @click="status.setSiteStatus('normal')"
        @contextmenu="mainContextmenu"
        @keydown="mainPressKeyboard"
      >
        <DateTime />
        <SearchInp @contextmenu.stop />
        <AllFunc @contextmenu.stop />
        <Transition name="fade">
          <FirstVisitGuide v-if="status.showHotkeyGuide" @dismiss="dismissHotkeyGuide" />
        </Transition>
        <Footer />
        <!-- 设置快捷入口 -->
        <Transition name="fade">
          <div
            v-show="status.siteStatus === 'normal' || status.siteStatus === 'focus'"
            class="settings-shortcut"
            :title="t('app.settingsShortcut')"
            @click.stop="status.setSiteStatus('set')"
          >
            <SvgIcon iconName="icon-setting" />
          </div>
        </Transition>
        <!-- 状态切换 -->
        <Transition name="fade">
          <div
            class="all-controls"
            v-show="status.siteStatus !== 'focus' && status.siteStatus !== 'normal'"
          >
            <div
              class="change-status"
              :title="status.mainBoxBig ? t('common.collapse') : t('common.expand')"
              @click.stop="status.setMainBoxBig(!status.mainBoxBig)"
            >
              <Transition name="fade" mode="out-in">
                <SvgIcon
                  :iconName="`icon-${status.mainBoxBig ? 'packup' : 'unfold'}`"
                  :key="status.mainBoxBig ? 'packup' : 'unfold'"
                />
              </Transition>
            </div>
            <div
              class="change-status"
              :title="status.siteStatus !== 'set' ? t('common.settings') : t('common.home')"
              @click.stop="status.setSiteStatus(status.siteStatus !== 'set' ? 'set' : 'normal')"
            >
              <Transition name="fade" mode="out-in">
                <SvgIcon
                  :iconName="`icon-${status.siteStatus !== 'set' ? 'setting' : 'home'}`"
                  :key="status.siteStatus !== 'set' ? 'setting' : 'home'"
                />
              </Transition>
            </div>
          </div>
        </Transition>
      </main>
      <div v-else id="loading">
        <img src="/icon/logo.png" alt="logo" class="logo" />
        <span class="tip">{{ t("site.loading") }}</span>
      </div>
    </Transition>
  </Provider>
</template>

<script setup>
import { onMounted, onBeforeUnmount, nextTick, watch, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { statusStore, setStore, siteStore } from "@/stores";
import { getGreeting, getNightModeDateKey } from "@/utils/timeTools";
import { uploadToGist } from "@/utils/gistSync";
import { buildSyncPayload } from "@/utils/syncData";
import Provider from "@/components/Provider.vue";
import Cover from "@/components/Cover.vue";
import DateTime from "@/components/DateTime.vue";
import SearchInp from "@/components/SearchInput/SearchInp.vue";
import AllFunc from "@/components/AllFunc/AllFunc.vue";
import FirstVisitGuide from "@/components/FirstVisitGuide.vue";
import Footer from "@/components/Footer.vue";

const set = setStore();
const status = statusStore();
const site = siteStore();
const mainClickable = ref(false);
const { t, locale } = useI18n({ useScope: "global" });
const greetingSeparator = computed(() => (locale.value === "en-US" ? ", " : "，"));

const showWelcomeMessage = () => {
  $message.info(`${getGreeting(locale.value)}${greetingSeparator.value}${t("site.welcomeText")}`, {
    showIcon: false,
    duration: 3000,
  });
};

const dismissHotkeyGuide = () => {
  status.setHasSeenHotkeyGuide(true);
  status.setShowHotkeyGuide(false);
  showWelcomeMessage();
};

// 自动同步（防抖 3 秒）
let autoSyncTimer = null;

const syncableData = computed(() => {
  return JSON.stringify(buildSyncPayload(set.$state, site));
});

watch(syncableData, () => {
  if (!set.autoSync || !set.githubToken || !set.gistId || !set.hasSynced) return;
  clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(async () => {
    try {
      const data = JSON.parse(syncableData.value);
      await uploadToGist(set.githubToken, set.gistId, data);
      $message.success(t("app.autoSyncSuccess"), { duration: 1500 });
    } catch (error) {
      console.error("自动同步失败：", error);
      $message.error(t("app.autoSyncFailed", { message: error.message }));
    }
  }, 3000);
});

// 鼠标右键
const mainContextmenu = (event) => {
  event.preventDefault();
  if (status.showHotkeyGuide) return;
  status.setSiteStatus("box");
};

// 加载完成事件
const loadComplete = () => {
  nextTick().then(() => {
    mainClickable.value = true;
    if (status.hasSeenHotkeyGuide) {
      showWelcomeMessage();
      return;
    }
    status.setShowHotkeyGuide(true);
  });
};

// 全局键盘事件
const mainPressKeyboard = (event) => {
  if (status.showHotkeyGuide) return;
  const keyCode = event.keyCode;
  // 回车
  if (keyCode === 13) {
    // focus 元素
    const mainInput = document.getElementById("main-input");
    status.setSiteStatus("focus");
    mainInput?.focus();
  }
};

// 全局快捷键
const globalKeyboard = (event) => {
  if (status.showHotkeyGuide) {
    if (event.key === "Escape") {
      event.preventDefault();
      dismissHotkeyGuide();
    }
    return;
  }
  // Ctrl+K / Cmd+K
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    const mainInput = document.getElementById("main-input");
    status.setSiteStatus("focus");
    mainInput?.focus();
  }
  // Ctrl+, / Cmd+, — 打开/关闭设置
  if ((event.ctrlKey || event.metaKey) && event.key === ",") {
    event.preventDefault();
    status.setSiteStatus(status.siteStatus === "set" ? "normal" : "set");
  }
  // Ctrl+B / Cmd+B — 打开/关闭功能盒子
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
    event.preventDefault();
    status.setSiteStatus(status.siteStatus === "box" ? "normal" : "box");
  }
  // Esc — 退出当前状态
  if (event.key === "Escape") {
    if (status.siteStatus === "set" || status.siteStatus === "box") {
      status.setSiteStatus("normal");
    }
  }
};

onMounted(() => {
  document.addEventListener("keydown", globalKeyboard);
});

// 根据主题类别更改
const changeThemeType = (val) => {
  const htmlElement = document.querySelector("html");
  const themeType = val === "light" ? "light" : "dark";
  htmlElement.setAttribute("theme", themeType);
};

// 夜间自动暗色模式（0:00 ~ 5:00）
let nightModeTimer = null;

const getEffectiveThemeType = () => {
  if (status.nightModeActive) {
    return status.tempThemeOverride || "dark";
  }
  return set.themeType;
};

const applyEffectiveTheme = () => {
  changeThemeType(getEffectiveThemeType());
};

const clearTempThemeOverride = () => {
  if (status.tempThemeOverride) status.setTempThemeOverride("");
  if (status.tempThemeOverrideNightKey) status.setTempThemeOverrideNightKey("");
};

const checkNightMode = () => {
  if (!set.autoNightMode) {
    if (status.nightModeActive) status.setNightModeActive(false);
    clearTempThemeOverride();
    applyEffectiveTheme();
    return;
  }
  const hour = new Date().getHours();
  const isNight = hour >= 0 && hour < 5;
  if (isNight) {
    if (!status.nightModeActive) status.setNightModeActive(true);
    const currentNightKey = getNightModeDateKey();
    if (
      status.tempThemeOverride &&
      status.tempThemeOverrideNightKey !== currentNightKey
    ) {
      clearTempThemeOverride();
    }
  } else {
    if (status.nightModeActive) status.setNightModeActive(false);
    clearTempThemeOverride();
  }
  applyEffectiveTheme();
};

// 监听主题相关变化
watch(
  () => [set.themeType, status.nightModeActive, status.tempThemeOverride],
  () => applyEffectiveTheme(),
);

// 监听自动夜间模式开关
watch(
  () => set.autoNightMode,
  () => checkNightMode(),
);

onMounted(() => {
  checkNightMode();
  nightModeTimer = setInterval(checkNightMode, 60000);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", globalKeyboard);
  if (autoSyncTimer) clearTimeout(autoSyncTimer);
  if (nightModeTimer) clearInterval(nightModeTimer);
});
</script>

<style lang="scss" scoped>
#main,
#loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &.main-normal,
  &.main-focus {
    .main-box {
      opacity: 0;
      margin-top: 0;
      transform: scale(0.35);
      pointer-events: none;
    }
  }
  &.main-box,
  &.main-set {
    .main-box {
      opacity: 1;
      margin-top: 20vh;
      transform: scale(1);
      visibility: visible;
      @media (max-width: 478px) {
        margin-top: 22vh;
      }
    }
    .search-input {
      :deep(.all) {
        opacity: 0;
        width: 0;
        visibility: hidden;
      }
    }
  }
  .all-controls {
    position: fixed;
    width: 100%;
    top: 0;
    padding: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    .change-status {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      padding: 8px;
      border-radius: 8px;
      color: var(--main-text-color);
      z-index: 1;
      transition:
        opacity 0.3s,
        background-color 0.3s,
        transform 0.3s;
      &:hover {
        backdrop-filter: blur(20px);
        background-color: var(--main-background-light-color);
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }
  .settings-shortcut {
    position: absolute;
    right: 16px;
    bottom: 14px;
    cursor: pointer;
    font-size: 18px;
    color: var(--main-text-color);
    opacity: 0.15;
    z-index: 1;
    transition: opacity 0.3s, transform 0.3s;
    &:hover {
      opacity: 0.8;
      transform: rotate(45deg);
    }
    &:active {
      transform: rotate(45deg) scale(0.9);
    }
  }
}
#loading {
  color: var(--main-text-color);
  .logo {
    width: 100px;
    height: 100px;
    margin-bottom: 24px;
    animation: logo-breathe 3s infinite alternate;
  }
  .tip {
    font-size: 20px;
  }
}
</style>
