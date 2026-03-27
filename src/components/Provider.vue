<template>
  <!-- 全局配置组件 -->
  <n-config-provider
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
    :theme="darkTheme"
    :theme-overrides="themeOverrides"
    abstract
    inline-theme-disabled
  >
    <n-dialog-provider>
      <n-message-provider :max="1">
        <slot />
        <NaiveProviderContent />
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup>
import { computed, defineComponent, h } from "vue";
import { useI18n } from "vue-i18n";
import {
  zhCN,
  zhTW,
  enUS,
  dateZhCN,
  dateZhTW,
  dateEnUS,
  darkTheme,
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  useDialog,
  useMessage,
} from "naive-ui";

const { locale } = useI18n({ useScope: "global" });

// 全局主题
const themeOverrides = {
  common: {
    fontFamily: "'HarmonyOS_Regular', sans-serif",
    primaryColor: "#ffffff",
    primaryColorHover: "#ffffff70",
    primaryColorSuppl: "#ffffff30",
    primaryColorPressed: "#ffffff30",
  },
};

const naiveLocaleMap = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  "en-US": enUS,
};

const naiveDateLocaleMap = {
  "zh-CN": dateZhCN,
  "zh-TW": dateZhTW,
  "en-US": dateEnUS,
};

const naiveLocale = computed(() => naiveLocaleMap[locale.value] || zhCN);
const naiveDateLocale = computed(() => naiveDateLocaleMap[locale.value] || dateZhCN);

// 挂载 Naive 组件
const setupNaiveTools = () => {
  // 信息
  window.$message = useMessage();
  // 对话框
  window.$dialog = useDialog();
};

// Naive 功能组件
const NaiveProviderContent = defineComponent({
  setup() {
    setupNaiveTools();
  },
  render() {
    return h("div", { className: "main-tools" });
  },
});
</script>
