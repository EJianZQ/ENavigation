<template>
  <n-tabs class="all-box" size="large" justify-content="space-evenly" animated v-model:value="boxActiveTab">
    <n-tab-pane class="no-padding height--full" name="shortcuts" :tab="t('allBox.shortcuts')">
      <ShortCut ref="shortcutRef" />
    </n-tab-pane>
    <n-tab-pane class="no-padding" name="notes" :tab="t('allBox.notes')">
      <NoteList ref="noteRef" />
    </n-tab-pane>
    <n-tab-pane class="no-padding" name="todos" :tab="t('allBox.todos')">
      <TodoList ref="todoRef" />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NTabs, NTabPane } from "naive-ui";
import { storeToRefs } from "pinia";
import { statusStore } from "@/stores";
import ShortCut from "@/components/AllFunc/Box/ShortCut.vue";
import TodoList from "@/components/AllFunc/Box/TodoList.vue";
import NoteList from "@/components/AllFunc/Box/NoteList.vue";

const { t } = useI18n({ useScope: "global" });
const status = statusStore();
const { boxActiveTab } = storeToRefs(status);
const shortcutRef = ref(null);
const noteRef = ref(null);
const todoRef = ref(null);

const runPendingBoxAction = async (action, activeTab) => {
  if (!action) return;
  await nextTick();
  if (action === "createShortcut" && activeTab === "shortcuts") {
    shortcutRef.value?.openCreateShortcut();
    status.setPendingBoxAction("");
  }
  if (action === "createNote" && activeTab === "notes") {
    noteRef.value?.openCreateNote();
    status.setPendingBoxAction("");
  }
  if (action === "focusTodoInput" && activeTab === "todos") {
    todoRef.value?.focusTodoInput();
    status.setPendingBoxAction("");
  }
};

watch(
  () => [status.pendingBoxAction, boxActiveTab.value],
  ([action, activeTab]) => {
    runPendingBoxAction(action, activeTab);
  },
  { immediate: true },
);
</script>
<style>
.height--full {
  height: 100%;
}
</style>
