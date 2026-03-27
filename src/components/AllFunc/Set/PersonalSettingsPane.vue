<template>
  <n-scrollbar class="scrollbar">
    <n-h6 prefix="bar">{{ t("settings.groups.page") }}</n-h6>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.page.title") }}</span>
        <span class="tip">{{ t("settings.page.tip") }}</span>
      </div>
      <n-input
        class="set"
        clearable
        v-model:value="pageTitle"
        :placeholder="defaultPageTitle"
      />
    </n-card>

    <n-h6 prefix="bar">{{ t("settings.groups.hitokoto") }}</n-h6>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.hitokoto.title") }}</span>
        <span class="tip">{{ t("settings.hitokoto.tip") }}</span>
      </div>
      <n-switch v-model:value="showHitokoto" :round="false" />
    </n-card>
    <n-card v-if="showHitokoto" class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.hitokoto.sourceTitle") }}</span>
        <span class="tip">{{ t("settings.hitokoto.sourceTip") }}</span>
      </div>
      <n-switch v-model:value="showHitokotoSource" :round="false" />
    </n-card>
    <n-card v-if="showHitokoto" class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.hitokoto.placeholderTitle") }}</span>
        <span class="tip">{{ t("settings.hitokoto.placeholderTip") }}</span>
      </div>
      <n-switch v-model:value="hitokotoAsPlaceholder" :round="false" />
    </n-card>
    <n-card
      v-if="showHitokoto"
      class="set-item"
      :content-style="{ flexDirection: 'column', alignItems: 'flex-start' }"
    >
      <div class="name" style="margin-bottom: 10px">
        <span class="title">{{ t("settings.hitokoto.typesTitle") }}</span>
        <span class="tip">{{ t("settings.hitokoto.typesTip") }}</span>
      </div>
      <n-checkbox-group v-model:value="hitokotoTypes" class="hitokoto-types">
        <n-grid cols="3 s:4 m:4 l:4" :x-gap="8" :y-gap="8" responsive="screen">
          <n-grid-item v-for="item in hitokotoTypeOptions" :key="item.value">
            <n-checkbox :value="item.value" :label="item.label" />
          </n-grid-item>
        </n-grid>
      </n-checkbox-group>
    </n-card>

    <n-h6 prefix="bar">{{ t("settings.groups.time") }}</n-h6>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.time.styleTitle") }}</span>
        <span class="tip">{{ t("settings.time.styleTip") }}</span>
      </div>
      <n-select class="set" v-model:value="timeStyle" :options="timeStyleOptions" />
    </n-card>
    <n-card v-if="timeStyle === 'one'" class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.time.showSecondsTitle") }}</span>
        <span class="tip">{{ t("settings.time.showSecondsTip") }}</span>
      </div>
      <n-switch v-model:value="showSeconds" :round="false" />
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.time.showZeroTitle") }}</span>
        <span class="tip">{{ t("settings.time.showZeroTip") }}</span>
      </div>
      <n-switch v-model:value="showZeroTime" :round="false" />
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.time.showLunarTitle") }}</span>
      </div>
      <n-switch v-model:value="showLunar" :round="false" />
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.time.use12HourFormatTitle") }}</span>
      </div>
      <n-switch v-model:value="use12HourFormat" :round="false" />
    </n-card>

    <n-h6 prefix="bar">{{ t("settings.groups.searchInput") }}</n-h6>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.searchInput.autoCollapseTitle") }}</span>
        <span class="tip">{{ t("settings.searchInput.autoCollapseTip") }}</span>
      </div>
      <n-switch v-model:value="smallInput" :round="false" />
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.searchInput.autoFocusTitle") }}</span>
        <span class="tip">{{ t("settings.searchInput.autoFocusTip") }}</span>
      </div>
      <n-switch v-model:value="autoFocus" :round="false" />
    </n-card>
    <n-card class="set-item">
      <div class="name">
        <span class="title">{{ t("settings.searchInput.autoBlurTitle") }}</span>
        <span class="tip">{{ t("settings.searchInput.autoBlurTip") }}</span>
      </div>
      <n-switch v-model:value="autoInputBlur" :round="false" />
    </n-card>
  </n-scrollbar>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  NH6,
  NCard,
  NSwitch,
  NSelect,
  NInput,
  NScrollbar,
  NGrid,
  NGridItem,
  NCheckboxGroup,
  NCheckbox,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { setStore } from "@/stores";
import { getDefaultDocumentTitle } from "@/i18n";

const set = setStore();
const { t, locale } = useI18n({ useScope: "global" });
const {
  smallInput,
  autoFocus,
  autoInputBlur,
  pageTitle,
  showLunar,
  showHitokoto,
  showHitokotoSource,
  hitokotoAsPlaceholder,
  hitokotoTypes,
  showSeconds,
  showZeroTime,
  use12HourFormat,
  timeStyle,
} = storeToRefs(set);

const defaultPageTitle = computed(() => getDefaultDocumentTitle(locale.value));

const hitokotoTypeOptions = computed(() =>
  ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"].map((value) => ({
    label: t(`settings.hitokoto.types.${value}`),
    value,
  })),
);

const timeStyleOptions = computed(() => [
  { label: t("settings.time.styles.one"), value: "one" },
  { label: t("settings.time.styles.two"), value: "two" },
]);
</script>
