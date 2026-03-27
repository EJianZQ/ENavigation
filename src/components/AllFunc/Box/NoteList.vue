<template>
  <!-- 便签 -->
  <div class="note__layout">
    <Transition name="fade" mode="out-in">
      <!-- 便签列表 -->
      <div v-if="noteData.length" class="note__list">
        <!-- 搜索框 -->
        <div class="note__search">
          <n-input
            v-model:value="searchQuery"
            clearable
            :placeholder="t('notes.searchPlaceholder')"
            size="small"
          >
            <template #prefix>
              <SvgIcon iconName="icon-search" />
            </template>
          </n-input>
        </div>
        <n-scrollbar class="scrollbar">
          <n-grid
            v-if="filteredNotes.length || !searchQuery"
            class="note__cards"
            responsive="screen"
            cols="1 s:2 m:2 l:2"
            :x-gap="10"
            :y-gap="10"
          >
            <!-- 新建按钮 -->
            <n-grid-item v-if="!searchQuery" class="note__card add" @click="openEditor()">
              <SvgIcon iconName="icon-add" />
              <span class="label">{{ t("notes.addLabel") }}</span>
            </n-grid-item>
            <!-- 便签卡片 -->
            <n-grid-item
              v-for="item in filteredNotes"
              :key="item.id"
              :class="['note__card', item.pinned ? 'pinned' : '']"
              @click="openEditor(item)"
              @contextmenu="noteContextmenu($event, item)"
            >
              <div class="card-header">
                <span class="title" v-html="highlightText(item.title || t('notes.untitled'))"></span>
                <SvgIcon v-if="item.pinned" iconName="icon-confirm" class="pin-icon" />
              </div>
              <p class="content" v-html="highlightText(snippetText(item.content || t('notes.noContent')))"></p>
              <span class="time">{{ formatTime(item.updatedAt) }}</span>
            </n-grid-item>
          </n-grid>
          <!-- 搜索无结果 -->
          <div v-else class="note__no-result">
            <span>{{ t("notes.noResult") }}</span>
          </div>
        </n-scrollbar>
      </div>
      <!-- 空状态 -->
      <div v-else class="note__empty">
        <span class="tip">{{ t("notes.empty") }}</span>
        <n-button strong secondary @click="openEditor()">
          <template #icon>
            <SvgIcon iconName="icon-add" />
          </template>
          {{ t("notes.create") }}
        </n-button>
      </div>
    </Transition>
    <!-- 编辑弹窗 -->
    <n-modal
      preset="card"
      :title="isEditing ? t('notes.editTitle') : t('notes.createTitle')"
      v-model:show="editorShow"
      :bordered="false"
      @mask-click="saveAndClose"
    >
      <n-form :label-width="80">
        <n-form-item :label="t('notes.titleLabel')">
          <n-input
            clearable
            show-count
            maxlength="30"
            v-model:value="editorData.title"
            :placeholder="t('notes.titlePlaceholder')"
          />
        </n-form-item>
        <n-form-item :label="t('notes.contentLabel')">
          <n-input
            type="textarea"
            clearable
            show-count
            maxlength="2000"
            :rows="8"
            v-model:value="editorData.content"
            :placeholder="t('notes.contentPlaceholder')"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="space-between" align="center">
          <n-button
            v-if="isEditing"
            strong
            secondary
            @click="togglePin"
          >
            {{ editorData.pinned ? t("notes.unpin") : t("notes.pin") }}
          </n-button>
          <span v-else />
          <n-space>
            <n-button v-if="isEditing" strong secondary @click="deleteNote">
              {{ t("common.delete") }}
            </n-button>
            <n-button strong secondary @click="saveAndClose">
              {{ t("notes.save") }}
            </n-button>
          </n-space>
        </n-space>
      </template>
    </n-modal>
    <!-- 右键菜单 -->
    <n-dropdown
      placement="bottom-start"
      trigger="manual"
      size="large"
      :x="ctxX"
      :y="ctxY"
      :options="ctxOptions"
      :show="ctxShow"
      :on-clickoutside="() => { ctxShow = false; }"
      @select="ctxSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, h, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import {
  NScrollbar,
  NGrid,
  NGridItem,
  NButton,
  NSpace,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NDropdown,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { siteStore } from "@/stores";
import SvgIcon from "@/components/SvgIcon.vue";

const site = siteStore();
const { noteData } = storeToRefs(site);
const { t, locale } = useI18n({ useScope: "global" });

// 搜索
const searchQuery = ref("");

// 转义 HTML 特殊字符（防 XSS）
const escapeHtml = (str) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// 搜索词高亮
const highlightText = (text) => {
  const escaped = escapeHtml(text);
  const q = searchQuery.value?.trim();
  if (!q) return escaped;
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return escaped.replace(regex, '<mark class="hl">$1</mark>');
};

// 搜索时截取关键词附近片段
const snippetText = (text) => {
  const q = searchQuery.value?.trim().toLowerCase();
  if (!q || !text) return text;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  const snippetRadius = 50;
  const start = Math.max(0, idx - snippetRadius);
  const end = Math.min(text.length, idx + q.length + snippetRadius * 2);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
};

// 排序 + 过滤
const filteredNotes = computed(() => {
  const q = searchQuery.value?.trim().toLowerCase();
  let notes = [...noteData.value];
  if (q) {
    notes = notes.filter(
      (n) =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q),
    );
  }
  return notes.sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    return b.updatedAt - a.updatedAt;
  });
});

// 编辑器状态
const editorShow = ref(false);
const isEditing = ref(false);
const editorData = ref({ id: null, title: "", content: "", pinned: false });

// 右键菜单状态
const ctxShow = ref(false);
const ctxX = ref(0);
const ctxY = ref(0);
const ctxTarget = ref(null);

// 图标渲染
const renderIcon = (icon) => () => h(SvgIcon, { iconName: `icon-${icon}` });

const ctxOptions = computed(() => [
  { label: t("notes.context.edit"), key: "edit", icon: renderIcon("edit") },
  { label: t("notes.context.pinToggle"), key: "pin", icon: renderIcon("confirm") },
  { label: t("notes.context.delete"), key: "delete", icon: renderIcon("delete-1") },
]);

// 格式化时间
const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return new Intl.DateTimeFormat(locale.value, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
};

// 打开编辑器
const openEditor = (note) => {
  if (note) {
    isEditing.value = true;
    editorData.value = { ...note };
  } else {
    isEditing.value = false;
    editorData.value = { id: null, title: "", content: "", pinned: false };
  }
  editorShow.value = true;
};

defineExpose({
  openCreateNote: () => openEditor(),
});

// 保存并关闭
const saveAndClose = () => {
  const { id, title, content, pinned } = editorData.value;
  const now = Date.now();
  if (isEditing.value) {
    // 编辑现有
    const index = noteData.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      noteData.value[index] = { id, title, content, pinned, updatedAt: now, createdAt: noteData.value[index].createdAt };
    }
  } else {
    // 新建（内容为空则不保存）
    if (!title.trim() && !content.trim()) {
      editorShow.value = false;
      return;
    }
    const maxId = noteData.value.reduce((max, n) => Math.max(max, n.id), -1);
    noteData.value.push({
      id: maxId + 1,
      title,
      content,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  editorShow.value = false;
};

// 切换置顶
const togglePin = () => {
  editorData.value.pinned = !editorData.value.pinned;
  saveAndClose();
};

// 删除便签
const deleteNote = () => {
  $dialog.warning({
    title: t("notes.deleteDialogTitle"),
    content: t("notes.deleteDialogContent", {
      name: editorData.value.title || t("notes.untitled"),
    }),
    positiveText: t("common.delete"),
    negativeText: t("common.cancel"),
    onPositiveClick: () => {
      const index = noteData.value.findIndex((n) => n.id === editorData.value.id);
      if (index !== -1) noteData.value.splice(index, 1);
      editorShow.value = false;
    },
  });
};

// 右键菜单
const noteContextmenu = (e, note) => {
  e.preventDefault();
  ctxTarget.value = note;
  ctxShow.value = false;
  nextTick().then(() => {
    ctxShow.value = true;
    ctxX.value = e.clientX;
    ctxY.value = e.clientY;
  });
};

const ctxSelect = (key) => {
  ctxShow.value = false;
  const note = ctxTarget.value;
  if (!note) return;
  switch (key) {
    case "edit":
      openEditor(note);
      break;
    case "pin": {
      const index = noteData.value.findIndex((n) => n.id === note.id);
      if (index !== -1) noteData.value[index].pinned = !noteData.value[index].pinned;
      break;
    }
    case "delete":
      editorData.value = { ...note };
      deleteNote();
      break;
  }
};
</script>

<style lang="scss" scoped>
.note__layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .note__list {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .note__search {
      padding: 12px 20px 0;
      flex-shrink: 0;
      .i-icon {
        opacity: 0.4;
        font-size: 14px;
      }
    }
    .note__no-result {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      opacity: 0.5;
      font-size: 14px;
    }
    .scrollbar {
      flex: 1;
      min-height: 0;
    }
    .note__cards {
      padding: 20px;
      box-sizing: border-box;
      .note__card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        padding: 14px;
        border-radius: 8px;
        background-color: var(--main-background-light-color);
        transition: background-color 0.3s, box-shadow 0.3s;
        min-height: 80px;
        &:hover {
          background-color: var(--main-background-hover-color);
          box-shadow: 0 0 0px 2px var(--main-background-hover-color);
        }
        &:active {
          box-shadow: none;
        }
        &.add {
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 80px;
          font-size: 18px;
          opacity: 0.7;
          .label {
            font-size: 14px;
          }
          &:hover {
            opacity: 1;
          }
        }
        &.pinned {
          border-left: 3px solid var(--main-text-color);
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          .title {
            font-size: 15px;
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
          }
          .pin-icon {
            font-size: 14px;
            opacity: 0.6;
            margin-left: 6px;
          }
        }
        .content {
          font-size: 13px;
          opacity: 0.75;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          line-clamp: 3;
          -webkit-box-orient: vertical;
          line-height: 1.5;
          margin: 0;
          flex: 1;
        }
        :deep(.hl) {
          background-color: rgba(255, 200, 0, 0.35);
          color: inherit;
          border-radius: 2px;
          padding: 0 1px;
        }
        .time {
          font-size: 11px;
          opacity: 0.45;
          margin-top: 8px;
        }
      }
    }
  }
  .note__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    .tip {
      font-size: 18px;
      opacity: 0.5;
    }
  }
}
</style>
