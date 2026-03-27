<template>
  <n-scrollbar class="scrollbar">
    <n-h6 prefix="bar">{{ t("settings.groups.cloudSync") }}</n-h6>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.cloudSync.tokenTitle") }}</span>
        <span class="tip">{{ t("settings.cloudSync.tokenTip") }}</span>
      </div>
      <n-input
        class="set"
        type="password"
        show-password-on="click"
        clearable
        v-model:value="githubToken"
        :placeholder="t('settings.cloudSync.tokenPlaceholder')"
      />
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.cloudSync.gistIdTitle") }}</span>
        <span class="tip">{{ t("settings.cloudSync.gistIdTip") }}</span>
      </div>
      <n-input
        class="set"
        clearable
        v-model:value="gistId"
        :placeholder="t('settings.cloudSync.gistIdPlaceholder')"
      />
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.cloudSync.uploadTitle") }}</span>
        <span class="tip">{{ t("settings.cloudSync.uploadTip") }}</span>
      </div>
      <n-button
        strong
        secondary
        :loading="syncUploading"
        :disabled="!githubToken"
        @click="syncUpload"
      >
        {{ t("common.upload") }}
      </n-button>
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.cloudSync.downloadTitle") }}</span>
        <span class="tip">{{ t("settings.cloudSync.downloadTip") }}</span>
      </div>
      <n-button strong secondary :loading="syncDownloading" @click="syncDownload">
        {{ t("common.download") }}
      </n-button>
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.cloudSync.autoSyncTitle") }}</span>
        <span class="tip">{{ t("settings.cloudSync.autoSyncTip") }}</span>
      </div>
      <n-switch v-model:value="autoSync" :round="false" />
    </n-card>

    <n-h6 prefix="bar">{{ t("settings.groups.reset") }}</n-h6>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.reset.title") }}</span>
        <span class="tip">{{ t("settings.reset.tip") }}</span>
      </div>
      <n-button strong secondary @click="resetSite">{{ t("common.reset") }}</n-button>
    </n-card>
  </n-scrollbar>

  <n-modal
    v-model:show="syncCompareModal"
    preset="card"
    :title="t('settings.cloudSync.compareTitle')"
    class="custom-modal"
  >
    <div v-if="cloudDataCache" class="sync-compare">
      <n-alert
        :title="t('settings.cloudSync.overwriteWarningTitle')"
        type="warning"
        style="margin-bottom: 16px"
      >
        {{ t("settings.cloudSync.overwriteWarningContent") }}
      </n-alert>

      <n-h6 prefix="bar">{{ t("settings.cloudSync.featureStats") }}</n-h6>
      <n-table :single-line="false" size="small" style="margin-bottom: 16px">
        <thead>
          <tr>
            <th>{{ t("settings.cloudSync.feature") }}</th>
            <th>{{ t("settings.cloudSync.localCount") }}</th>
            <th>{{ t("settings.cloudSync.cloudCount") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ t("settings.cloudSync.shortcuts") }}</td>
            <td>{{ site.shortcutData?.length || 0 }}</td>
            <td :class="{ changed: (site.shortcutData?.length || 0) !== (cloudDataCache.shortcutData?.length || 0) }">
              {{ cloudDataCache.shortcutData?.length || 0 }}
            </td>
          </tr>
          <tr>
            <td>{{ t("settings.cloudSync.notes") }}</td>
            <td>{{ site.noteData?.length || 0 }}</td>
            <td :class="{ changed: (site.noteData?.length || 0) !== (cloudDataCache.noteData?.length || 0) }">
              {{ cloudDataCache.noteData?.length || 0 }}
            </td>
          </tr>
          <tr>
            <td>{{ t("settings.cloudSync.todos") }}</td>
            <td>{{ site.todoData?.length || 0 }}</td>
            <td :class="{ changed: (site.todoData?.length || 0) !== (cloudDataCache.todoData?.length || 0) }">
              {{ cloudDataCache.todoData?.length || 0 }}
            </td>
          </tr>
        </tbody>
      </n-table>

      <n-h6 prefix="bar">{{ t("settings.cloudSync.diffSettings") }}</n-h6>
      <template v-if="changedSettingsList.length > 0">
        <n-table :single-line="false" size="small">
          <thead>
            <tr>
              <th>{{ t("settings.cloudSync.settingName") }}</th>
              <th>{{ t("settings.cloudSync.localValue") }}</th>
              <th>{{ t("settings.cloudSync.cloudValue") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in changedSettingsList" :key="item.key">
              <td>{{ item.label || item.key }}</td>
              <td style="opacity: 0.7">{{ item.localValue }}</td>
              <td class="changed">{{ item.cloudValue }}</td>
            </tr>
          </tbody>
        </n-table>
      </template>
      <n-alert v-else type="info" :show-icon="false" style="text-align: center">
        {{ t("settings.cloudSync.noDiff") }}
      </n-alert>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px">
        <n-button secondary @click="syncCompareModal = false">{{ t("common.cancel") }}</n-button>
        <n-button
          type="error"
          color="#d03050"
          text-color="#ffffff"
          :disabled="syncConfirmCountdown > 0"
          @click="confirmSyncDownload"
        >
          {{
            syncConfirmCountdown > 0
              ? t("settings.cloudSync.reviewCountdown", { seconds: syncConfirmCountdown })
              : t("settings.cloudSync.confirmOverwrite")
          }}
        </n-button>
      </div>
    </div>
    <div v-else style="text-align: center; padding: 40px">
      <n-spin size="large" />
    </div>
  </n-modal>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  NH6,
  NCard,
  NSwitch,
  NScrollbar,
  NButton,
  NInput,
  NModal,
  NTable,
  NAlert,
  NSpin,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { setStore, siteStore } from "@/stores";
import { uploadToGist, downloadFromGist } from "@/utils/gistSync";
import { buildSyncPayload, shouldSkipSyncSetting } from "@/utils/syncData";

const set = setStore();
const site = siteStore();
const { t } = useI18n({ useScope: "global" });
const { githubToken, gistId, autoSync } = storeToRefs(set);

const syncCompareModal = ref(false);
const cloudDataCache = ref(null);
const syncConfirmCountdown = ref(5);
const syncUploading = ref(false);
const syncDownloading = ref(false);
let countdownTimer = null;

const settingLabelKeys = {
  language: "language.current.title",
  pageTitle: "settings.page.title",
  themeType: "settings.themeType.title",
  backgroundType: "settings.wallpaper.title",
  backgroundCustom: "settings.wallpaper.customTitle",
  showBackgroundGray: "settings.wallpaper.grayTitle",
  backgroundBlur: "settings.wallpaper.blurTitle",
  searchEngine: "settings.searchEngine.title",
  lastSearchEngine: "settings.searchEngine.title",
  customEngineUrl: "search.customEngine.modalTitle",
  smallInput: "settings.searchInput.autoCollapseTitle",
  autoFocus: "settings.searchInput.autoFocusTitle",
  autoInputBlur: "settings.searchInput.autoBlurTitle",
  timeStyle: "settings.time.styleTitle",
  showLunar: "settings.time.showLunarTitle",
  showSeconds: "settings.time.showSecondsTitle",
  showZeroTime: "settings.time.showZeroTitle",
  use12HourFormat: "settings.time.use12HourFormatTitle",
  showHitokoto: "settings.hitokoto.title",
  showHitokotoSource: "settings.hitokoto.sourceTitle",
  hitokotoAsPlaceholder: "settings.hitokoto.placeholderTitle",
  hitokotoTypes: "settings.hitokoto.typesTitle",
  showSuggestions: "settings.searchSuggestions.title",
  suggestionProvider: "settings.suggestionProvider.title",
  urlJumpType: "settings.urlJumpType.title",
  autoNightMode: "settings.autoNightMode.title",
};

const backgroundTypeValueMap = {
  0: "settings.wallpaper.types.local",
  1: "settings.wallpaper.types.bing",
  2: "settings.wallpaper.types.landscape",
  3: "settings.wallpaper.types.anime",
  4: "settings.wallpaper.types.custom",
};

const formatSettingValue = (key, value) => {
  if (typeof value === "boolean") return value ? t("common.enabled") : t("common.disabled");
  if (key === "language") return t(`language.options.${value}`);
  if (key === "pageTitle") return value ? String(value) : t("settings.page.useDefaultValue");
  if (key === "themeType") return t(`settings.themeType.options.${value}`);
  if (key === "backgroundType") return t(backgroundTypeValueMap[value] || "settings.wallpaper.types.custom");
  if (["searchEngine", "lastSearchEngine"].includes(key)) return t(`search.engines.${value}`);
  if (key === "suggestionProvider") return t(`search.suggestionProviders.${value}`);
  if (key === "urlJumpType") return t(`search.jumpTypes.${value}`);
  if (key === "timeStyle") return t(`settings.time.styles.${value}`);
  if (key === "hitokotoTypes") {
    if (!Array.isArray(value) || value.length === 0) return t("settings.valueFormat.allRandom");
    return value.map((item) => t(`settings.hitokoto.types.${item}`)).join(", ");
  }
  if (["backgroundCustom", "customEngineUrl"].includes(key)) return value ? String(value) : t("common.empty");
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

const changedSettingsList = computed(() => {
  const diffs = [];
  if (!cloudDataCache.value?.settings) return diffs;

  for (const [key, cloudValue] of Object.entries(cloudDataCache.value.settings)) {
    if (shouldSkipSyncSetting(key) || !(key in set.$state)) continue;
    const localValue = set.$state[key];
    if (JSON.stringify(localValue) !== JSON.stringify(cloudValue)) {
      diffs.push({
        key,
        label: settingLabelKeys[key] ? t(settingLabelKeys[key]) : key,
        localValue: formatSettingValue(key, localValue),
        cloudValue: formatSettingValue(key, cloudValue),
      });
    }
  }

  return diffs;
});

const clearCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

const validateSyncConfig = () => {
  if (!githubToken.value) {
    $message.warning(t("settings.cloudSync.validateToken"));
    return false;
  }
  if (!gistId.value) {
    $message.warning(t("settings.cloudSync.validateGistId"));
    return false;
  }
  return true;
};

const doUpload = async () => {
  syncUploading.value = true;
  try {
    await uploadToGist(githubToken.value, gistId.value, buildSyncPayload(set.$state, site));
    set.hasSynced = true;
    $message.success(t("settings.cloudSync.uploadSuccess"));
  } catch (error) {
    console.error("云同步上传失败：", error);
    $message.error(t("settings.cloudSync.uploadFailed", { message: error.message }));
  } finally {
    syncUploading.value = false;
  }
};

const syncUpload = () => {
  if (!validateSyncConfig()) return;
  if (!set.hasSynced) {
    $dialog.warning({
      title: t("settings.cloudSync.newDeviceTitle"),
      content: t("settings.cloudSync.newDeviceContent"),
      positiveText: t("settings.cloudSync.forceUpload"),
      negativeText: t("common.cancel"),
      onPositiveClick: doUpload,
    });
    return;
  }
  doUpload();
};

const syncDownload = async () => {
  if (!validateSyncConfig()) return;

  syncDownloading.value = true;
  syncCompareModal.value = true;
  cloudDataCache.value = null;
  syncConfirmCountdown.value = 5;
  clearCountdown();

  try {
    cloudDataCache.value = await downloadFromGist(githubToken.value, gistId.value);
    countdownTimer = setInterval(() => {
      if (syncConfirmCountdown.value > 0) {
        syncConfirmCountdown.value -= 1;
      } else {
        clearCountdown();
      }
    }, 1000);
  } catch (error) {
    console.error("云同步下载失败：", error);
    $message.error(t("settings.cloudSync.downloadFailed", { message: error.message }));
    syncCompareModal.value = false;
  } finally {
    syncDownloading.value = false;
  }
};

const confirmSyncDownload = () => {
  const data = cloudDataCache.value;
  if (!data) return;

  try {
    if (data.todoData) site.todoData = data.todoData;
    if (data.noteData) site.noteData = data.noteData;
    if (data.shortcutData) site.shortcutData = data.shortcutData;
    if (data.searchHistory) site.searchHistory = data.searchHistory;
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        if (!shouldSkipSyncSetting(key) && key in set.$state) {
          set.$state[key] = value;
        }
      }
    }
    set.hasSynced = true;
    syncCompareModal.value = false;
    $message.success(t("settings.cloudSync.overwriteSuccess"));
  } catch (error) {
    console.error("数据覆盖失败：", error);
    $message.error(t("settings.cloudSync.overwriteFailed"));
  }
};

const resetSite = () => {
  $dialog.warning({
    title: t("settings.reset.dialogTitle"),
    content: t("settings.reset.dialogContent"),
    positiveText: t("common.reset"),
    negativeText: t("common.cancel"),
    onPositiveClick: () => {
      localStorage.clear();
      $message.info(t("settings.reset.success"));
      setTimeout(() => window.location.reload(), 1000);
    },
  });
};

watch(syncCompareModal, (show) => {
  if (!show) clearCountdown();
});

onBeforeUnmount(() => {
  clearCountdown();
});
</script>
