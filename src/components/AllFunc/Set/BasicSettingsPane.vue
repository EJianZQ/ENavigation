<template>
  <n-scrollbar class="scrollbar">
    <n-h6 prefix="bar">{{ t("settings.groups.language") }}</n-h6>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("language.current.title") }}</span>
        <span class="tip">{{ t("language.current.tip") }}</span>
      </div>
      <n-select class="set" v-model:value="language" :options="languageOptions" />
    </n-card>

    <n-h6 prefix="bar">{{ t("settings.groups.themeWallpaper") }}</n-h6>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.themeType.title") }}</span>
        <span class="tip">{{ themeTypeTip }}</span>
      </div>
      <n-select class="set" v-model:value="themeTypeModel" :options="themeTypeOptions" />
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.autoNightMode.title") }}</span>
        <span class="tip">{{ t("settings.autoNightMode.tip") }}</span>
      </div>
      <n-switch v-model:value="autoNightMode" :round="false" />
    </n-card>
    <n-card
      class="set-item cover"
      :content-style="{ flexDirection: 'column', alignItems: 'flex-start' }"
    >
      <div class="desc">
        <div class="name">
          <span class="title">{{ t("settings.wallpaper.title") }}</span>
          <span class="tip">{{ t("settings.wallpaper.tip") }}</span>
        </div>
        <n-space>
          <Transition name="fade" mode="out-in">
            <n-button
              v-if="backgroundType !== 0"
              strong
              secondary
              @click="changeBackground(0, true)"
            >
              {{ t("common.restoreDefault") }}
            </n-button>
          </Transition>
          <n-button strong secondary @click="customCoverModal = true">
            <template v-if="backgroundType === 4" #icon>
              <SvgIcon iconName="icon-confirm" />
            </template>
            {{
              backgroundType === 4
                ? t("settings.wallpaper.customButtonEnabled")
                : t("settings.wallpaper.customButton")
            }}
          </n-button>
        </n-space>
      </div>
      <n-grid class="cover-selete" responsive="screen" cols="2 s:3 m:4 l:4" :x-gap="16" :y-gap="16">
        <n-grid-item
          v-for="item in backgroundTypeOptions"
          :key="item.value"
          :class="item.value === backgroundType ? 'item check' : 'item'"
          @click="changeBackground(item.value)"
        >
          <span class="name">{{ item.label }}</span>
        </n-grid-item>
      </n-grid>
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.wallpaper.grayTitle") }}</span>
        <span class="tip">{{ t("settings.wallpaper.grayTip") }}</span>
      </div>
      <n-switch v-model:value="showBackgroundGray" :round="false" />
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.wallpaper.blurTitle") }}</span>
        <span class="tip">{{ t("settings.wallpaper.blurTip") }}</span>
      </div>
      <n-slider
        class="set"
        v-model:value="backgroundBlur"
        :step="0.01"
        :min="0"
        :max="10"
        :tooltip="false"
      />
    </n-card>

    <n-h6 prefix="bar">{{ t("settings.groups.search") }}</n-h6>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.searchEngine.title") }}</span>
        <span class="tip">{{ t("settings.searchEngine.tip") }}</span>
      </div>
      <n-button strong secondary @click="openEngineSetting">
        {{ t("settings.searchEngine.adjust") }}
      </n-button>
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.searchSuggestions.title") }}</span>
        <span class="tip">{{ t("settings.searchSuggestions.tip") }}</span>
      </div>
      <n-switch v-model:value="showSuggestions" :round="false" />
    </n-card>
    <n-card v-if="showSuggestions" class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.suggestionProvider.title") }}</span>
        <span class="tip">{{ t("settings.suggestionProvider.tip") }}</span>
      </div>
      <n-select class="set" v-model:value="suggestionProvider" :options="suggestionProviderOptions" />
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.urlJumpType.title") }}</span>
        <span class="tip">{{ t("settings.urlJumpType.tip") }}</span>
      </div>
      <n-select class="set" v-model:value="urlJumpType" :options="urlJumpTypeOptions" />
    </n-card>
  </n-scrollbar>

  <n-modal
    preset="card"
    :title="t('settings.wallpaper.customTitle')"
    v-model:show="customCoverModal"
    :bordered="false"
  >
    <n-form>
      <n-form-item :label="t('settings.wallpaper.customUrlLabel')">
        <n-input
          clearable
          type="text"
          v-model:value="customCoverUrl"
          :placeholder="t('settings.wallpaper.customUrlPlaceholder')"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button strong secondary @click="customCoverModal = false">
          {{ t("common.cancel") }}
        </n-button>
        <n-button strong secondary @click="setCustomCover">
          {{ t("common.confirm") }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  NH6,
  NSpace,
  NCard,
  NSwitch,
  NSelect,
  NScrollbar,
  NButton,
  NGrid,
  NGridItem,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSlider,
} from "naive-ui";
import { storeToRefs } from "pinia";
import SvgIcon from "@/components/SvgIcon.vue";
import { setStore, statusStore } from "@/stores";
import identifyInput from "@/utils/identifyInput";
import { getNightModeDateKey } from "@/utils/timeTools";

const set = setStore();
const status = statusStore();
const { t } = useI18n({ useScope: "global" });
const {
  language,
  themeType,
  backgroundType,
  backgroundCustom,
  showBackgroundGray,
  backgroundBlur,
  showSuggestions,
  suggestionProvider,
  urlJumpType,
  autoNightMode,
} = storeToRefs(set);

const customCoverModal = ref(false);
const customCoverUrl = ref("");

const backgroundTypeValueMap = {
  0: "settings.wallpaper.types.local",
  1: "settings.wallpaper.types.bing",
  2: "settings.wallpaper.types.landscape",
  3: "settings.wallpaper.types.anime",
};

const languageOptions = computed(() => [
  { label: t("language.options.zh-CN"), value: "zh-CN" },
  { label: t("language.options.zh-TW"), value: "zh-TW" },
  { label: t("language.options.en-US"), value: "en-US" },
]);

const themeTypeOptions = computed(() => [
  { label: t("settings.themeType.options.light"), value: "light" },
  { label: t("settings.themeType.options.dark"), value: "dark" },
]);

const backgroundTypeOptions = computed(() => [
  { label: t("settings.wallpaper.types.local"), value: 0 },
  { label: t("settings.wallpaper.types.bing"), value: 1 },
  { label: t("settings.wallpaper.types.landscape"), value: 2 },
  { label: t("settings.wallpaper.types.anime"), value: 3 },
]);

const suggestionProviderOptions = computed(() => [
  { label: t("search.suggestionProviders.google"), value: "google" },
  { label: t("search.suggestionProviders.bing"), value: "bing" },
  { label: t("search.suggestionProviders.baidu"), value: "baidu" },
]);

const urlJumpTypeOptions = computed(() => [
  { label: t("search.jumpTypes.open"), value: "open" },
  { label: t("search.jumpTypes.href"), value: "href" },
]);

const themeTypeModel = computed({
  get() {
    if (status.nightModeActive) {
      return status.tempThemeOverride || "dark";
    }
    return themeType.value;
  },
  set(value) {
    if (status.nightModeActive) {
      if (value === "dark") {
        status.setTempThemeOverride("");
        status.setTempThemeOverrideNightKey("");
      } else {
        status.setTempThemeOverride(value);
        status.setTempThemeOverrideNightKey(getNightModeDateKey());
      }
      return;
    }
    themeType.value = value;
  },
});

const themeTypeTip = computed(() => {
  if (!status.nightModeActive) return t("settings.themeType.tip");
  if (status.tempThemeOverride) return t("settings.themeType.autoNightActiveOverride");
  return t("settings.themeType.autoNightActiveDefault");
});

const openEngineSetting = () => {
  status.setSiteStatus("focus");
  status.setEngineChangeStatus(true);
};

const changeBackground = (type, reset = false) => {
  if (reset) {
    $dialog.warning({
      title: t("settings.wallpaper.restoreTitle"),
      content: t("settings.wallpaper.restoreContent"),
      positiveText: t("common.restoreDefault"),
      negativeText: t("common.cancel"),
      onPositiveClick: () => {
        backgroundType.value = 0;
        $message.info(t("settings.wallpaper.restoredMessage"));
      },
    });
    return;
  }

  backgroundType.value = type;
  $message.success(
    t("settings.wallpaper.switchedMessage", {
      name: t(backgroundTypeValueMap[type] || "settings.wallpaper.types.local"),
    }),
  );
};

const setCustomCover = () => {
  if (identifyInput(customCoverUrl.value) === "url") {
    backgroundType.value = 4;
    backgroundCustom.value = customCoverUrl.value;
    customCoverModal.value = false;
    $message.success(t("settings.wallpaper.customEnabled"));
  } else {
    $message.error(t("settings.wallpaper.customInvalid"));
  }
};

watch(
  () => backgroundCustom.value,
  (value) => {
    if (!customCoverModal.value) {
      customCoverUrl.value = value || "";
    }
  },
  { immediate: true },
);

watch(
  customCoverModal,
  (visible) => {
    if (visible) {
      customCoverUrl.value = backgroundCustom.value || "";
    }
  }
);
</script>
