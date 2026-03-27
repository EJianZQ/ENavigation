<template>
  <!-- 捷径 -->
  <div class="shortcut__layout">
    <Transition name="fade" mode="out-in">
      <div v-if="shortcutData[0]" class="shortcut">
        <n-scrollbar class="scrollbar">
          <n-grid
            class="all-shortcut"
            responsive="screen"
            cols="2 s:3 m:4 l:5"
            :x-gap="10"
            :y-gap="10"
          >
            <n-grid-item
              v-for="(item, index) in shortcutData"
              :key="item.id"
              :class="['shortcut-item', dragIndex === index ? 'dragging' : '']"
              draggable="true"
              @dragstart="onDragStart(index, $event)"
              @dragover.prevent="onDragOver(index)"
              @dragend="onDragEnd"
              @contextmenu="shortCutContextmenu($event, item)"
              @click="shortCutJump(item.url)"
            >
              <div class="shortcut-icon">
                <img
                  v-if="getShortcutIconSrc(item.url)"
                  :src="getShortcutIconSrc(item.url)"
                  :alt="t('shortcuts.iconAlt', { name: item.name })"
                  loading="lazy"
                  @error="handleShortcutIconError(item.url)"
                />
                <SvgIcon v-else iconName="icon-link" />
              </div>
              <span class="name">{{ item.name }}</span>
            </n-grid-item>
            <n-grid-item
              class="shortcut-item"
              @contextmenu="
                (e) => {
                  e.preventDefault();
                }
              "
              @click="addShortcutModalOpen"
            >
              <SvgIcon iconName="icon-add" />
              <span class="name">{{ t("shortcuts.add") }}</span>
            </n-grid-item>
          </n-grid>
        </n-scrollbar>
      </div>
      <div v-else class="not-shortcut">
        <span class="tip">{{ t("shortcuts.empty") }}</span>
        <n-button strong secondary @click="addShortcutModalOpen">
          <template #icon>
            <SvgIcon iconName="icon-add" />
          </template>
          {{ t("shortcuts.add") }}
        </n-button>
      </div>
    </Transition>
  </div>
  <!-- 添加捷径 -->
  <n-modal
    preset="card"
    v-model:show="addShortcutModalShow"
    :title="addShortcutModalType ? t('shortcuts.editTitle') : t('shortcuts.addTitle')"
    :bordered="false"
    @mask-click="addShortcutClose"
  >
    <n-form
      ref="addShortcutRef"
      :rules="addShortcutRules"
      :model="addShortcutValue"
      :label-width="80"
    >
      <n-form-item :label="t('shortcuts.idLabel')" path="id">
        <n-input-number
          disabled
          :placeholder="t('shortcuts.idPlaceholder')"
          v-model:value="addShortcutValue.id"
          style="width: 100%"
          :show-button="false"
        />
      </n-form-item>
      <n-form-item :label="t('shortcuts.nameLabel')" path="name">
        <n-input
          clearable
          show-count
          maxlength="14"
          v-model:value="addShortcutValue.name"
          :placeholder="t('shortcuts.namePlaceholder')"
        />
      </n-form-item>
      <n-form-item :label="t('shortcuts.urlLabel')" path="url">
        <n-input
          clearable
          v-model:value="addShortcutValue.url"
          :placeholder="t('shortcuts.urlPlaceholder')"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button strong secondary @click="addShortcutClose"> {{ t("common.cancel") }} </n-button>
        <n-button strong secondary @click="addOrEditShortcuts">
          {{ addShortcutModalType ? t("common.edit") : t("common.add") }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
  <!-- 捷径右键菜单 -->
  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    size="large"
    :x="shortCutDropdownX"
    :y="shortCutDropdownY"
    :options="shortCutDropdownOptions"
    :show="shortCutDropdownShow"
    :on-clickoutside="
      () => {
        shortCutDropdownShow = false;
      }
    "
    @select="shortCutDropdownSelect"
  />
</template>

<script setup>
import { ref, nextTick, h, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  NButton,
  NScrollbar,
  NGrid,
  NGridItem,
  NSpace,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NDropdown,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { siteStore, setStore } from "@/stores";
import SvgIcon from "@/components/SvgIcon.vue";
import identifyInput from "@/utils/identifyInput";

const set = setStore();
const site = siteStore();
const { shortcutData } = storeToRefs(site);
const shortcutIconIndexMap = ref({});
const { t } = useI18n({ useScope: "global" });

// 拖拽状态
const dragIndex = ref(null);

const onDragStart = (index, event) => {
  dragIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
};

const onDragOver = (index) => {
  if (dragIndex.value === null || dragIndex.value === index) return;
  const items = shortcutData.value;
  const dragged = items.splice(dragIndex.value, 1)[0];
  items.splice(index, 0, dragged);
  dragIndex.value = index;
};

const onDragEnd = () => {
  dragIndex.value = null;
};

// 图标渲染
const renderIcon = (icon) => {
  return () => {
    return h(SvgIcon, { iconName: `icon-${icon}` }, null);
  };
};

const normalizeShortcutUrl = (url) => {
  if (!url) return null;
  return /^(https?:\/\/)/i.test(url) ? url : `https://${url}`;
};

const getShortcutUrlMeta = (url) => {
  try {
    const normalizedUrl = normalizeShortcutUrl(url);
    if (!normalizedUrl) return null;
    const parsedUrl = new URL(normalizedUrl);
    return {
      origin: parsedUrl.origin,
      hostname: parsedUrl.hostname,
      href: parsedUrl.href,
    };
  } catch {
    return null;
  }
};

const getShortcutIconCandidates = (url) => {
  const meta = getShortcutUrlMeta(url);
  if (!meta) return [];
  const candidates = [
    `${meta.origin}/favicon.ico`,
    `https://icons.duckduckgo.com/ip3/${meta.hostname}.ico`,
  ];
  return [...new Set(candidates)];
};

const getShortcutIconSrc = (url) => {
  const candidates = getShortcutIconCandidates(url);
  if (!candidates.length) return "";
  const currentIndex = shortcutIconIndexMap.value[url] ?? 0;
  return candidates[currentIndex] || "";
};

const handleShortcutIconError = (url) => {
  const candidates = getShortcutIconCandidates(url);
  const currentIndex = shortcutIconIndexMap.value[url] ?? 0;
  if (currentIndex < candidates.length - 1) {
    shortcutIconIndexMap.value[url] = currentIndex + 1;
  } else {
    shortcutIconIndexMap.value[url] = candidates.length;
  }
};

// 添加捷径数据
const addShortcutRef = ref(null);
const addShortcutModalShow = ref(false);
const addShortcutModalType = ref(false); // false 添加 / true 编辑
const addShortcutValue = ref({
  id: null,
  name: "",
  url: "",
});
const addShortcutRules = computed(() => ({
  id: {
    required: true,
    validator(rule, value) {
      if (typeof value !== "number") {
        return new Error(t("shortcuts.validation.idRequired"));
      }
      return true;
    },
    trigger: ["input", "blur"],
  },
  name: {
    required: true,
    validator(rule, value) {
      if (!value) {
        return new Error(t("shortcuts.validation.nameRequired"));
      }
      return true;
    },
    trigger: ["input", "blur"],
  },
  url: {
    required: true,
    validator(rule, value) {
      if (!value) {
        return new Error(t("shortcuts.validation.urlRequired"));
      } else if (identifyInput(value) !== "url") {
        return new Error(t("shortcuts.validation.urlInvalid"));
      }
      return true;
    },
    trigger: ["input", "blur"],
  },
}));

// 右键菜单数据
const shortCutDropdownX = ref(0);
const shortCutDropdownY = ref(0);
const shortCutDropdownShow = ref(false);
const shortCutDropdownOptions = computed(() => [
  {
    label: t("shortcuts.context.edit"),
    key: "edit",
    icon: renderIcon("edit"),
  },
  {
    label: t("shortcuts.context.delete"),
    key: "delete",
    icon: renderIcon("delete-1"),
  },
]);

// 关闭弹窗
const addShortcutClose = () => {
  addShortcutModalShow.value = false;
  addShortcutValue.value = {
    id: null,
    name: "",
    url: "",
  };
};

// 开启添加捷径
const addShortcutModalOpen = () => {
  // 生成 ID
  const shortcutMaxID = shortcutData.value.reduce((max, item) => {
    return item.id > max ? item.id : max;
  }, -1);
  // 生成表单数据
  addShortcutValue.value = {
    id: shortcutMaxID + 1,
    name: "",
    url: "",
  };
  addShortcutModalType.value = false;
  addShortcutModalShow.value = true;
};

// 添加或编辑捷径
const addOrEditShortcuts = () => {
  addShortcutRef.value?.validate((errors) => {
    if (errors) {
      $message.error(t("shortcuts.checkInput"));
      return false;
    }
    // 新增捷径
    if (!addShortcutModalType.value) {
      // 是否重复
      const isDuplicate = shortcutData.value?.some(
        (item) =>
          item.name === addShortcutValue.value.name || item.url === addShortcutValue.value.url,
      );
      if (isDuplicate) {
        $message.error(t("shortcuts.duplicate"));
        return false;
      }
      shortcutData.value.push({
        id: addShortcutValue.value.id,
        name: addShortcutValue.value.name,
        url: addShortcutValue.value.url,
      });
      $message.success(t("shortcuts.addSuccess"));
      addShortcutClose();
      return true;
    } else {
      // 编辑捷径
      const index = shortcutData.value.findIndex((item) => item.id === addShortcutValue.value.id);
      if (index === -1) {
        $message.error(t("shortcuts.notFound"));
        return false;
      }
      shortcutData.value[index].name = addShortcutValue.value.name;
      shortcutData.value[index].url = addShortcutValue.value.url;
      $message.success(t("shortcuts.editSuccess"));
      addShortcutClose();
      return true;
    }
  });
};

// 删除捷径
const delShortcuts = () => {
  const deleteId = addShortcutValue.value.id;
  if (typeof deleteId === "number") {
    const indexToRemove = shortcutData.value.findIndex((item) => item.id === deleteId);
    if (indexToRemove !== -1) {
      shortcutData.value.splice(indexToRemove, 1);
      // 将后续元素的 id 前移一位
      for (let i = indexToRemove; i < shortcutData.value.length; i++) {
        shortcutData.value[i].id = i;
      }
      $message.success(t("shortcuts.deleteSuccess"));
      return true;
    }
    $message.error(t("shortcuts.deleteFailed"));
  } else {
    $message.error(t("shortcuts.deleteFailed"));
  }
};

// 开启右键菜单
const shortCutContextmenu = (e, data) => {
  e.preventDefault();
  shortCutDropdownShow.value = false;
  // 写入弹窗数据
  const { id, name, url } = data;
  addShortcutValue.value = { id, name, url };
  nextTick().then(() => {
    shortCutDropdownShow.value = true;
    shortCutDropdownX.value = e.clientX;
    shortCutDropdownY.value = e.clientY;
  });
};

// 右键菜单点击
const shortCutDropdownSelect = (key) => {
  shortCutDropdownShow.value = false;
  switch (key) {
    case "edit":
      addShortcutModalType.value = true;
      addShortcutModalShow.value = true;
      break;
    case "delete":
      $dialog.warning({
        title: t("shortcuts.deleteDialogTitle"),
        content: t("shortcuts.deleteDialogContent", { name: addShortcutValue.value.name }),
        positiveText: t("common.delete"),
        negativeText: t("common.cancel"),
        onPositiveClick: () => {
          delShortcuts();
        },
      });
      break;
    default:
      break;
  }
};

// 捷径跳转
const shortCutJump = (url) => {
  const urlRegex = /^(https?:\/\/)/i;
  const urlFormat = urlRegex.test(url) ? url : `//${url}`;
  if (set.urlJumpType === "href") {
    window.location.href = urlFormat;
  } else if (set.urlJumpType === "open") {
    window.open(urlFormat, "_blank");
  }
};

</script>

<style lang="scss" scoped>
.shortcut__layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .shortcut {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .all-shortcut {
      padding: 20px;
      box-sizing: border-box;
      .shortcut-item {
        cursor: grab;
        height: 60px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background-color: var(--main-background-light-color);
        border-radius: 8px;
        font-size: 16px;
        transition:
          background-color 0.3s,
          box-shadow 0.3s,
          opacity 0.15s,
          transform 0.15s;
        .shortcut-icon {
          width: 20px;
          height: 20px;
          min-width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 18px;
            height: 18px;
            display: block;
            object-fit: contain;
            border-radius: 4px;
          }
          .i-icon {
            width: 1rem;
            font-size: 18px;
            opacity: 0.9;
          }
        }
        .name {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        &:hover {
          background-color: var(--main-background-hover-color);
          box-shadow: 0 0 0px 2px var(--main-background-hover-color);
        }
        &:active {
          box-shadow: none;
        }
        &.dragging {
          opacity: 0.4;
          transform: scale(0.95);
        }
      }
    }
  }
  .not-shortcut {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .tip {
      font-size: 24px;
      margin-bottom: 20px;
    }
  }
}
</style>
