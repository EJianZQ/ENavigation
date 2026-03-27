<template>
  <div class="all-set">
    <n-tabs class="set" size="large" justify-content="space-evenly" animated>
      <n-tab-pane name="main" :tab="t('settings.basic')">
        <BasicSettingsPane />
      </n-tab-pane>
      <n-tab-pane name="personalization" :tab="t('settings.personalization')">
        <PersonalSettingsPane />
      </n-tab-pane>
      <n-tab-pane name="other" :tab="t('settings.other')">
        <OtherSettingsPane />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { NTabs, NTabPane } from "naive-ui";
import BasicSettingsPane from "@/components/AllFunc/Set/BasicSettingsPane.vue";
import PersonalSettingsPane from "@/components/AllFunc/Set/PersonalSettingsPane.vue";
import OtherSettingsPane from "@/components/AllFunc/Set/OtherSettingsPane.vue";

const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss">
.cover-selete {
  margin-top: 12px;
  .item {
    cursor: pointer;
    position: relative;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background-color: var(--main-background-light-color);
    transition:
      background-color 0.3s,
      box-shadow 0.3s;
    &.check {
      background-color: var(--main-background-hover-color);
      &::before {
        content: "";
        position: absolute;
        border-radius: 12px;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 2px solid var(--main-background-hover-color);
        transition: opacity 0.3s;
      }
    }
    &:hover {
      background-color: var(--main-background-hover-color);
      box-shadow: 0 0 0px 2px var(--main-background-hover-color);
      &::before {
        opacity: 0;
      }
    }
    &:active {
      box-shadow: none;
    }
  }
}

.custom-modal {
  width: 90%;
  max-width: 600px;
  .sync-compare {
    table {
      width: 100%;
      text-align: left;
      td.changed {
        color: var(--n-text-color-pressed, #18a058);
        font-weight: bold;
      }
    }
  }
}
</style>
