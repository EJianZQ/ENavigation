<template>
  <n-tabs class="all-box" size="large" justify-content="space-evenly" animated>
    <n-tab-pane class="no-padding height--full" name="link" :tab="t('allBox.shortcuts')">
      <ShortCut />
    </n-tab-pane>
    <n-tab-pane class="no-padding" name="note" :tab="t('allBox.notes')">
      <NoteList />
    </n-tab-pane>
    <n-tab-pane class="no-padding" name="more" :tab="t('allBox.todos')">
      <TodoList />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { NTabs, NTabPane } from "naive-ui";
import ShortCut from "@/components/AllFunc/Box/ShortCut.vue";
import TodoList from "@/components/AllFunc/Box/TodoList.vue";
import NoteList from "@/components/AllFunc/Box/NoteList.vue";

const { t } = useI18n({ useScope: "global" });
</script>
<style>
.height--full {
  height: 100%;
}
</style>
