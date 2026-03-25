<template>
  <n-tabs class="all-box" size="large" justify-content="space-evenly" animated>
    <n-tab-pane class="no-padding height--full" name="link" tab="捷径">
      <ShortCut />
    </n-tab-pane>
    <n-tab-pane class="no-padding" name="note" tab="便签">
      <NoteList />
    </n-tab-pane>
    <n-tab-pane class="no-padding" name="more" tab="待办">
      <TodoList />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { NTabs, NTabPane } from "naive-ui";
import ShortCut from "@/components/AllFunc/Box/ShortCut.vue";
import TodoList from "@/components/AllFunc/Box/TodoList.vue";
import NoteList from "@/components/AllFunc/Box/NoteList.vue";
</script>
<style>
.height--full {
  height: 100%;
}
</style>