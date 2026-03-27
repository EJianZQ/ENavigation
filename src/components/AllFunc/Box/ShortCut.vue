<template>
  <div class="shortcut__layout">
    <div v-if="hasGroups" class="shortcut-toolbar">
      <n-button strong secondary @click="openGroupModal()">
        <template #icon>
          <SvgIcon iconName="icon-add" />
        </template>
        {{ t("shortcuts.group.add") }}
      </n-button>
    </div>

    <Transition name="fade" mode="out-in">
      <div v-if="hasGroups" class="shortcut-scroll">
        <section v-if="pinnedGroups.length" class="shortcut-section">
          <div class="section-title">{{ t("shortcuts.sections.pinned") }}</div>
          <div class="group-list">
            <article
              v-for="group in pinnedGroups"
              :key="group.id"
              :class="['shortcut-group', draggingGroup.id === group.id ? 'dragging' : '']"
            >
              <div
                class="group-header"
                draggable="true"
                @dragstart="onGroupDragStart(group, $event)"
                @dragover.prevent="onGroupDragOver(group)"
                @dragend="onGroupDragEnd"
              >
                <div class="group-meta">
                  <strong>{{ group.name }}</strong>
                  <span class="group-count">
                    {{ t("shortcuts.group.count", { count: group.shortcuts.length }) }}
                  </span>
                </div>
                <div class="group-actions" @mousedown.stop @click.stop>
                  <button
                    class="group-action-btn"
                    type="button"
                    draggable="false"
                    @click.stop="openCreateShortcut(group.id)"
                  >
                    <SvgIcon iconName="icon-add" />
                  </button>
                  <n-dropdown
                    trigger="click"
                    placement="bottom-end"
                    :options="createGroupDropdownOptions(group)"
                    @select="(key) => handleGroupActionSelect(key, group)"
                  >
                    <button class="group-action-btn more" type="button" draggable="false">
                      ...
                    </button>
                  </n-dropdown>
                </div>
              </div>

              <div
                v-if="!group.shortcuts.length"
                class="group-empty"
                @dragover.prevent="onShortcutDropToGroupEnd(group.id)"
              >
                {{ t("shortcuts.group.empty") }}
              </div>

              <div class="shortcut-grid">
                <button
                  v-for="(item, index) in group.shortcuts"
                  :key="item.id"
                  type="button"
                  :class="[
                    'shortcut-item',
                    draggingShortcut.groupId === group.id && draggingShortcut.index === index
                      ? 'dragging'
                      : '',
                  ]"
                  draggable="true"
                  @dragstart="onShortcutDragStart(group.id, index, $event)"
                  @dragover.prevent="onShortcutDragOver(group.id, index)"
                  @dragend="onShortcutDragEnd"
                  @contextmenu="openShortcutContextmenu($event, group.id, item)"
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
                  <span :class="['name', getShortcutNameClass(item.name)]">{{ item.name }}</span>
                </button>
                <button
                  type="button"
                  class="shortcut-item add-card"
                  @contextmenu.prevent.stop
                  @dragover.prevent="onShortcutDropToGroupEnd(group.id)"
                  @click="openCreateShortcut(group.id)"
                >
                  <SvgIcon iconName="icon-add" />
                  <span class="name">{{ t("shortcuts.group.addShortcut") }}</span>
                </button>
              </div>
            </article>
          </div>
        </section>

        <section v-if="regularGroups.length" class="shortcut-section">
          <div class="section-title">{{ t("shortcuts.sections.regular") }}</div>
          <div class="group-list">
            <article
              v-for="group in regularGroups"
              :key="group.id"
              :class="['shortcut-group', draggingGroup.id === group.id ? 'dragging' : '']"
            >
              <div
                class="group-header"
                draggable="true"
                @dragstart="onGroupDragStart(group, $event)"
                @dragover.prevent="onGroupDragOver(group)"
                @dragend="onGroupDragEnd"
              >
                <div class="group-meta">
                  <strong>{{ group.name }}</strong>
                  <span class="group-count">
                    {{ t("shortcuts.group.count", { count: group.shortcuts.length }) }}
                  </span>
                </div>
                <div class="group-actions" @mousedown.stop @click.stop>
                  <button
                    class="group-action-btn"
                    type="button"
                    draggable="false"
                    @click.stop="openCreateShortcut(group.id)"
                  >
                    <SvgIcon iconName="icon-add" />
                  </button>
                  <n-dropdown
                    trigger="click"
                    placement="bottom-end"
                    :options="createGroupDropdownOptions(group)"
                    @select="(key) => handleGroupActionSelect(key, group)"
                  >
                    <button class="group-action-btn more" type="button" draggable="false">
                      ...
                    </button>
                  </n-dropdown>
                </div>
              </div>

              <div
                v-if="!group.shortcuts.length"
                class="group-empty"
                @dragover.prevent="onShortcutDropToGroupEnd(group.id)"
              >
                {{ t("shortcuts.group.empty") }}
              </div>

              <div class="shortcut-grid">
                <button
                  v-for="(item, index) in group.shortcuts"
                  :key="item.id"
                  type="button"
                  :class="[
                    'shortcut-item',
                    draggingShortcut.groupId === group.id && draggingShortcut.index === index
                      ? 'dragging'
                      : '',
                  ]"
                  draggable="true"
                  @dragstart="onShortcutDragStart(group.id, index, $event)"
                  @dragover.prevent="onShortcutDragOver(group.id, index)"
                  @dragend="onShortcutDragEnd"
                  @contextmenu="openShortcutContextmenu($event, group.id, item)"
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
                  <span :class="['name', getShortcutNameClass(item.name)]">{{ item.name }}</span>
                </button>
                <button
                  type="button"
                  class="shortcut-item add-card"
                  @contextmenu.prevent.stop
                  @dragover.prevent="onShortcutDropToGroupEnd(group.id)"
                  @click="openCreateShortcut(group.id)"
                >
                  <SvgIcon iconName="icon-add" />
                  <span class="name">{{ t("shortcuts.group.addShortcut") }}</span>
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div v-else class="not-shortcut">
        <span class="tip">{{ t("shortcuts.emptyGroups") }}</span>
        <n-button strong secondary @click="openGroupModal()">
          <template #icon>
            <SvgIcon iconName="icon-add" />
          </template>
          {{ t("shortcuts.group.add") }}
        </n-button>
      </div>
    </Transition>
  </div>

  <n-modal
    preset="card"
    v-model:show="shortcutModalShow"
    :title="isEditingShortcut ? t('shortcuts.editTitle') : t('shortcuts.addTitle')"
    :bordered="false"
    @mask-click="closeShortcutModal"
  >
    <n-form
      ref="shortcutFormRef"
      :rules="shortcutFormRules"
      :model="shortcutFormValue"
      :label-width="80"
    >
      <n-form-item :label="t('shortcuts.idLabel')" path="id">
        <n-input-number
          disabled
          :placeholder="t('shortcuts.idPlaceholder')"
          v-model:value="shortcutFormValue.id"
          style="width: 100%"
          :show-button="false"
        />
      </n-form-item>
      <n-form-item :label="t('shortcuts.groupLabel')" path="groupId">
        <n-select
          v-model:value="shortcutFormValue.groupId"
          :options="groupSelectOptions"
          :placeholder="t('shortcuts.groupPlaceholder')"
        />
      </n-form-item>
      <n-form-item :label="t('shortcuts.nameLabel')" path="name">
        <n-input
          clearable
          show-count
          maxlength="14"
          v-model:value="shortcutFormValue.name"
          :placeholder="t('shortcuts.namePlaceholder')"
        />
      </n-form-item>
      <n-form-item :label="t('shortcuts.urlLabel')" path="url">
        <n-input
          clearable
          v-model:value="shortcutFormValue.url"
          :placeholder="t('shortcuts.urlPlaceholder')"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button strong secondary @click="closeShortcutModal">
          {{ t("common.cancel") }}
        </n-button>
        <n-button strong secondary @click="saveShortcut">
          {{ isEditingShortcut ? t("common.edit") : t("common.add") }}
        </n-button>
      </n-space>
    </template>
  </n-modal>

  <n-modal
    preset="card"
    v-model:show="groupModalShow"
    :title="isEditingGroup ? t('shortcuts.group.editTitle') : t('shortcuts.group.addTitle')"
    :bordered="false"
    @mask-click="closeGroupModal"
  >
    <n-form ref="groupFormRef" :rules="groupFormRules" :model="groupFormValue" :label-width="90">
      <n-form-item :label="t('shortcuts.group.nameLabel')" path="name">
        <n-input
          clearable
          show-count
          maxlength="20"
          v-model:value="groupFormValue.name"
          :placeholder="t('shortcuts.group.namePlaceholder')"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button strong secondary @click="closeGroupModal">
          {{ t("common.cancel") }}
        </n-button>
        <n-button strong secondary @click="saveGroup">
          {{ isEditingGroup ? t("common.edit") : t("common.add") }}
        </n-button>
      </n-space>
    </template>
  </n-modal>

  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    size="large"
    :x="shortcutDropdownX"
    :y="shortcutDropdownY"
    :options="shortcutDropdownOptions"
    :show="shortcutDropdownShow"
    :on-clickoutside="
      () => {
        shortcutDropdownShow = false;
      }
    "
    @select="handleShortcutDropdownSelect"
  />
</template>

<script setup>
import { computed, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  NButton,
  NSpace,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NDropdown,
  NSelect,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { siteStore, setStore } from "@/stores";
import SvgIcon from "@/components/SvgIcon.vue";
import identifyInput from "@/utils/identifyInput";
import {
  getFlatShortcutItems,
  getNextShortcutGroupId,
  getNextShortcutItemId,
} from "@/utils/shortcutData";

const set = setStore();
const site = siteStore();
const { shortcutData } = storeToRefs(site);
const { t } = useI18n({ useScope: "global" });

const shortcutIconIndexMap = ref({});
const draggingGroup = ref({ id: null, pinned: null });
const draggingShortcut = ref({ groupId: null, index: null });

const shortcutFormRef = ref(null);
const shortcutModalShow = ref(false);
const isEditingShortcut = ref(false);
const shortcutFormValue = ref({
  id: null,
  groupId: null,
  name: "",
  url: "",
});

const groupFormRef = ref(null);
const groupModalShow = ref(false);
const isEditingGroup = ref(false);
const groupFormValue = ref({
  id: null,
  name: "",
});

const shortcutDropdownX = ref(0);
const shortcutDropdownY = ref(0);
const shortcutDropdownShow = ref(false);
const shortcutContext = ref(null);

const hasGroups = computed(() => shortcutData.value.length > 0);
const pinnedGroups = computed(() => shortcutData.value.filter((group) => group.pinned));
const regularGroups = computed(() => shortcutData.value.filter((group) => !group.pinned));
const groupSelectOptions = computed(() =>
  shortcutData.value.map((group) => ({
    label: group.name,
    value: group.id,
  })),
);

const shortcutFormRules = computed(() => ({
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
  groupId: {
    required: true,
    validator(rule, value) {
      if (typeof value !== "number") {
        return new Error(t("shortcuts.validation.groupRequired"));
      }
      return true;
    },
    trigger: ["change", "blur"],
  },
  name: {
    required: true,
    validator(rule, value) {
      if (!String(value || "").trim()) {
        return new Error(t("shortcuts.validation.nameRequired"));
      }
      return true;
    },
    trigger: ["input", "blur"],
  },
  url: {
    required: true,
    validator(rule, value) {
      const normalizedValue = String(value || "").trim();
      if (!normalizedValue) {
        return new Error(t("shortcuts.validation.urlRequired"));
      }
      if (identifyInput(normalizedValue) !== "url") {
        return new Error(t("shortcuts.validation.urlInvalid"));
      }
      return true;
    },
    trigger: ["input", "blur"],
  },
}));

const groupFormRules = computed(() => ({
  name: {
    required: true,
    validator(rule, value) {
      if (!String(value || "").trim()) {
        return new Error(t("shortcuts.group.validation.nameRequired"));
      }
      return true;
    },
    trigger: ["input", "blur"],
  },
}));

const shortcutDropdownOptions = computed(() => [
  {
    label: t("shortcuts.context.edit"),
    key: "edit",
  },
  {
    label: t("shortcuts.context.delete"),
    key: "delete",
  },
]);

const replaceShortcutGroups = (groups) => {
  shortcutData.value = groups;
};

const getDefaultTargetGroupId = (preferredGroupId = null) => {
  if (typeof preferredGroupId === "number") {
    const matchedGroup = shortcutData.value.find((group) => group.id === preferredGroupId);
    if (matchedGroup) return matchedGroup.id;
  }
  return shortcutData.value[0]?.id ?? null;
};

const findGroupById = (groupId) => {
  return shortcutData.value.find((group) => group.id === groupId) || null;
};

const findShortcutLocation = (shortcutId) => {
  for (let groupIndex = 0; groupIndex < shortcutData.value.length; groupIndex += 1) {
    const group = shortcutData.value[groupIndex];
    const shortcutIndex = group.shortcuts.findIndex((item) => item.id === shortcutId);
    if (shortcutIndex !== -1) {
      return {
        group,
        groupIndex,
        shortcutIndex,
        item: group.shortcuts[shortcutIndex],
      };
    }
  }
  return null;
};

const closeShortcutModal = () => {
  shortcutModalShow.value = false;
  shortcutFormValue.value = {
    id: null,
    groupId: null,
    name: "",
    url: "",
  };
};

const closeGroupModal = () => {
  groupModalShow.value = false;
  groupFormValue.value = {
    id: null,
    name: "",
  };
};

const openGroupModal = (group = null) => {
  if (group) {
    isEditingGroup.value = true;
    groupFormValue.value = {
      id: group.id,
      name: group.name,
    };
  } else {
    isEditingGroup.value = false;
    groupFormValue.value = {
      id: getNextShortcutGroupId(shortcutData.value),
      name: "",
    };
  }
  groupModalShow.value = true;
};

const openEditShortcut = (groupId, item) => {
  isEditingShortcut.value = true;
  shortcutFormValue.value = {
    id: item.id,
    groupId,
    name: item.name,
    url: item.url,
  };
  shortcutModalShow.value = true;
};

const openCreateShortcut = (preferredGroupId = null) => {
  if (!shortcutData.value.length) {
    $message.info(t("shortcuts.createGroupFirst"));
    openGroupModal();
    return false;
  }
  isEditingShortcut.value = false;
  shortcutFormValue.value = {
    id: getNextShortcutItemId(shortcutData.value),
    groupId: getDefaultTargetGroupId(preferredGroupId),
    name: "",
    url: "",
  };
  shortcutModalShow.value = true;
  return true;
};

defineExpose({
  openCreateShortcut,
});

const saveGroup = () => {
  groupFormRef.value?.validate((errors) => {
    if (errors) return false;

    const nextName = String(groupFormValue.value.name || "").trim();
    if (!isEditingGroup.value) {
      replaceShortcutGroups([
        ...shortcutData.value,
        {
          id: groupFormValue.value.id,
          name: nextName,
          pinned: false,
          shortcuts: [],
        },
      ]);
      $message.success(t("shortcuts.group.addSuccess"));
      closeGroupModal();
      return true;
    }

    const targetGroup = findGroupById(groupFormValue.value.id);
    if (!targetGroup) return false;
    replaceShortcutGroups(
      shortcutData.value.map((group) =>
        group.id === groupFormValue.value.id ? { ...group, name: nextName } : group,
      ),
    );
    $message.success(t("shortcuts.group.editSuccess"));
    closeGroupModal();
    return true;
  });
};

const hasDuplicateShortcut = (value) => {
  const nextName = String(value.name || "").trim();
  const nextUrl = String(value.url || "").trim();
  return getFlatShortcutItems(shortcutData.value).some(
    (item) => item.id !== value.id && (item.name === nextName || item.url === nextUrl),
  );
};

const saveShortcut = () => {
  shortcutFormRef.value?.validate((errors) => {
    if (errors) {
      $message.error(t("shortcuts.checkInput"));
      return false;
    }

    const nextValue = {
      ...shortcutFormValue.value,
      name: String(shortcutFormValue.value.name || "").trim(),
      url: String(shortcutFormValue.value.url || "").trim(),
    };

    if (!findGroupById(nextValue.groupId)) {
      $message.error(t("shortcuts.createGroupFirst"));
      return false;
    }

    if (hasDuplicateShortcut(nextValue)) {
      $message.error(t("shortcuts.duplicate"));
      return false;
    }

    if (!isEditingShortcut.value) {
      replaceShortcutGroups(
        shortcutData.value.map((group) =>
          group.id === nextValue.groupId
            ? {
                ...group,
                shortcuts: [
                  ...group.shortcuts,
                  {
                    id: nextValue.id,
                    name: nextValue.name,
                    url: nextValue.url,
                  },
                ],
              }
            : group,
        ),
      );
      $message.success(t("shortcuts.addSuccess"));
      closeShortcutModal();
      return true;
    }

    const location = findShortcutLocation(nextValue.id);
    if (!location) {
      $message.error(t("shortcuts.notFound"));
      return false;
    }

    const updatedShortcut = {
      id: nextValue.id,
      name: nextValue.name,
      url: nextValue.url,
    };

    if (location.group.id === nextValue.groupId) {
      replaceShortcutGroups(
        shortcutData.value.map((group) =>
          group.id === nextValue.groupId
            ? {
                ...group,
                shortcuts: group.shortcuts.map((item) =>
                  item.id === nextValue.id ? updatedShortcut : item,
                ),
              }
            : group,
        ),
      );
    } else {
      const nextGroups = shortcutData.value.map((group) => {
        if (group.id === location.group.id) {
          return {
            ...group,
            shortcuts: group.shortcuts.filter((item) => item.id !== nextValue.id),
          };
        }
        if (group.id === nextValue.groupId) {
          return {
            ...group,
            shortcuts: [...group.shortcuts, updatedShortcut],
          };
        }
        return group;
      });
      replaceShortcutGroups(nextGroups);
    }

    $message.success(t("shortcuts.editSuccess"));
    closeShortcutModal();
    return true;
  });
};

const deleteShortcut = () => {
  if (!shortcutContext.value) {
    $message.error(t("shortcuts.deleteFailed"));
    return false;
  }
  const location = findShortcutLocation(shortcutContext.value.id);
  if (!location) {
    $message.error(t("shortcuts.deleteFailed"));
    return false;
  }

  replaceShortcutGroups(
    shortcutData.value.map((group) =>
      group.id === location.group.id
        ? {
            ...group,
            shortcuts: group.shortcuts.filter((item) => item.id !== location.item.id),
          }
        : group,
    ),
  );
  $message.success(t("shortcuts.deleteSuccess"));
  return true;
};

const createGroupDropdownOptions = (group) => [
  {
    label: t("shortcuts.group.actions.edit"),
    key: "edit",
  },
  {
    label: t(group.pinned ? "shortcuts.group.actions.unpin" : "shortcuts.group.actions.pin"),
    key: group.pinned ? "unpin" : "pin",
  },
  {
    label: t("shortcuts.group.actions.delete"),
    key: "delete",
  },
];

const toggleGroupPinned = (group, targetPinned) => {
  const remainingGroups = shortcutData.value.filter((item) => item.id !== group.id);
  const nextGroup = { ...group, pinned: targetPinned };

  if (targetPinned) {
    const nextGroups = [...remainingGroups];
    const pinnedCount = nextGroups.filter((item) => item.pinned).length;
    nextGroups.splice(pinnedCount, 0, nextGroup);
    replaceShortcutGroups(nextGroups);
    return;
  }

  replaceShortcutGroups([...remainingGroups, nextGroup]);
};

const confirmDeleteGroup = (group) => {
  const shortcutCount = group.shortcuts.length;
  $dialog.warning({
    title: t("shortcuts.group.deleteDialogTitle"),
    content:
      shortcutCount > 0
        ? t("shortcuts.group.deleteDialogContentFilled", {
            name: group.name,
            count: shortcutCount,
          })
        : t("shortcuts.group.deleteDialogContentEmpty", { name: group.name }),
    positiveText: t("common.delete"),
    negativeText: t("common.cancel"),
    positiveButtonProps:
      shortcutCount > 0
        ? {
            style: {
              "--n-color": "#d03050",
              "--n-color-hover": "#de576d",
              "--n-color-pressed": "#b32644",
              "--n-color-focus": "#de576d",
              "--n-text-color": "#ffffff",
              "--n-text-color-hover": "#ffffff",
              "--n-text-color-pressed": "#ffffff",
              "--n-text-color-focus": "#ffffff",
            },
          }
        : undefined,
    onPositiveClick: () => {
      replaceShortcutGroups(shortcutData.value.filter((item) => item.id !== group.id));
      $message.success(t("shortcuts.group.deleteSuccess"));
    },
  });
};

const handleGroupActionSelect = (key, group) => {
  switch (key) {
    case "edit":
      openGroupModal(group);
      break;
    case "pin":
    case "unpin":
      toggleGroupPinned(group, key === "pin");
      break;
    case "delete":
      confirmDeleteGroup(group);
      break;
    default:
      break;
  }
};

const rebuildGroupSection = (pinned, reorderedSection) => {
  const pinnedSection = pinned
    ? reorderedSection
    : shortcutData.value.filter((group) => group.pinned);
  const regularSection = pinned
    ? shortcutData.value.filter((group) => !group.pinned)
    : reorderedSection;
  replaceShortcutGroups([...pinnedSection, ...regularSection]);
};

const onGroupDragStart = (group, event) => {
  draggingGroup.value = {
    id: group.id,
    pinned: group.pinned,
  };
  event.dataTransfer.effectAllowed = "move";
};

const onGroupDragOver = (targetGroup) => {
  if (
    draggingGroup.value.id === null ||
    draggingGroup.value.pinned !== targetGroup.pinned ||
    draggingGroup.value.id === targetGroup.id
  ) {
    return;
  }

  const sectionGroups = shortcutData.value.filter((group) => group.pinned === targetGroup.pinned);
  const fromIndex = sectionGroups.findIndex((group) => group.id === draggingGroup.value.id);
  const toIndex = sectionGroups.findIndex((group) => group.id === targetGroup.id);
  if (fromIndex === -1 || toIndex === -1) return;

  const nextSection = [...sectionGroups];
  const [draggedGroup] = nextSection.splice(fromIndex, 1);
  nextSection.splice(toIndex, 0, draggedGroup);
  rebuildGroupSection(targetGroup.pinned, nextSection);
  draggingGroup.value.id = targetGroup.id;
};

const onGroupDragEnd = () => {
  draggingGroup.value = {
    id: null,
    pinned: null,
  };
};

const onShortcutDragStart = (groupId, index, event) => {
  draggingShortcut.value = {
    groupId,
    index,
  };
  event.dataTransfer.effectAllowed = "move";
};

const moveShortcutToTarget = (sourceGroupId, sourceIndex, targetGroupId, targetIndex) => {
  const sourceGroupIndex = shortcutData.value.findIndex((group) => group.id === sourceGroupId);
  const targetGroupIndex = shortcutData.value.findIndex((group) => group.id === targetGroupId);
  if (sourceGroupIndex === -1 || targetGroupIndex === -1) return false;

  const sourceShortcuts = [...shortcutData.value[sourceGroupIndex].shortcuts];
  const targetShortcuts =
    sourceGroupId === targetGroupId
      ? sourceShortcuts
      : [...shortcutData.value[targetGroupIndex].shortcuts];
  const [draggedItem] = sourceShortcuts.splice(sourceIndex, 1);
  if (!draggedItem) return false;

  targetShortcuts.splice(targetIndex, 0, draggedItem);

  replaceShortcutGroups(
    shortcutData.value.map((group, currentIndex) => {
      if (sourceGroupId === targetGroupId && currentIndex === sourceGroupIndex) {
        return { ...group, shortcuts: sourceShortcuts };
      }
      if (currentIndex === sourceGroupIndex) {
        return { ...group, shortcuts: sourceShortcuts };
      }
      if (currentIndex === targetGroupIndex) {
        return { ...group, shortcuts: targetShortcuts };
      }
      return group;
    }),
  );
  return true;
};

const onShortcutDragOver = (groupId, index) => {
  if (draggingShortcut.value.groupId === null) {
    return;
  }
  if (
    draggingShortcut.value.groupId === groupId &&
    draggingShortcut.value.index === index
  ) {
    return;
  }

  const moved = moveShortcutToTarget(
    draggingShortcut.value.groupId,
    draggingShortcut.value.index,
    groupId,
    index,
  );
  if (!moved) return;

  draggingShortcut.value.groupId = groupId;
  draggingShortcut.value.index = index;
};

const onShortcutDropToGroupEnd = (groupId) => {
  if (draggingShortcut.value.groupId === null) return;

  const targetGroup = findGroupById(groupId);
  if (!targetGroup) return;
  const sourceGroupId = draggingShortcut.value.groupId;
  const targetIndex = targetGroup.shortcuts.length;

  const moved = moveShortcutToTarget(
    sourceGroupId,
    draggingShortcut.value.index,
    groupId,
    targetIndex,
  );
  if (!moved) return;

  draggingShortcut.value.groupId = groupId;
  draggingShortcut.value.index =
    sourceGroupId === groupId ? Math.max(targetIndex - 1, 0) : targetIndex;
};

const onShortcutDragEnd = () => {
  draggingShortcut.value = {
    groupId: null,
    index: null,
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
    };
  } catch {
    return null;
  }
};

const getShortcutIconCandidates = (url) => {
  const meta = getShortcutUrlMeta(url);
  if (!meta) return [];
  return [
    `${meta.origin}/favicon.ico`,
    `https://icons.duckduckgo.com/ip3/${meta.hostname}.ico`,
  ];
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

const openShortcutContextmenu = (event, groupId, item) => {
  event.preventDefault();
  shortcutDropdownShow.value = false;
  shortcutContext.value = { groupId, ...item };
  nextTick().then(() => {
    shortcutDropdownShow.value = true;
    shortcutDropdownX.value = event.clientX;
    shortcutDropdownY.value = event.clientY;
  });
};

const handleShortcutDropdownSelect = (key) => {
  shortcutDropdownShow.value = false;
  if (!shortcutContext.value) return;

  if (key === "edit") {
    openEditShortcut(shortcutContext.value.groupId, shortcutContext.value);
    return;
  }

  if (key === "delete") {
    $dialog.warning({
      title: t("shortcuts.deleteDialogTitle"),
      content: t("shortcuts.deleteDialogContent", {
        name: shortcutContext.value.name,
      }),
      positiveText: t("common.delete"),
      negativeText: t("common.cancel"),
      onPositiveClick: () => {
        deleteShortcut();
      },
    });
  }
};

const getShortcutNameClass = (name) => {
  const textLength = Array.from(String(name || "").trim()).length;
  return textLength > 7 ? "name--compact" : "";
};

const shortCutJump = (url) => {
  const urlFormat = /^(https?:\/\/)/i.test(url) ? url : `//${url}`;
  if (set.urlJumpType === "href") {
    window.location.href = urlFormat;
    return;
  }
  if (set.urlJumpType === "open") {
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
}

.shortcut-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0 20px 12px;
}

.shortcut-scroll {
  flex: 1;
  min-height: 0;
  padding: 0 20px 20px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
}

.shortcut-section + .shortcut-section {
  margin-top: 18px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 13px;
  letter-spacing: 0.04em;
  opacity: 0.6;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.shortcut-group {
  position: relative;
  padding: 14px;
  border-radius: 14px;
  background-color: var(--main-background-light-color);
  transition:
    background-color 0.3s,
    border-color 0.3s,
    opacity 0.2s,
    transform 0.2s;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    box-shadow:
      0 10px 28px rgba(0, 0, 0, 0.08),
      inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    transition: opacity 0.28s ease;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.16);
  }

  &:hover::after {
    opacity: 1;
  }

  &.dragging {
    opacity: 0.45;
    transform: scale(0.985);
  }
}

.group-header {
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.group-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 16px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.group-count {
  font-size: 12px;
  opacity: 0.6;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-action-btn {
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  color: inherit;
  background-color: transparent;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  &.more {
    font-size: 14px;
    letter-spacing: 0.08em;
  }
}

.group-empty {
  margin-top: 12px;
  font-size: 13px;
  opacity: 0.58;
}

.shortcut-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: 10px;
}

.shortcut-item {
  position: relative;
  cursor: pointer;
  min-height: 68px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  border-radius: 10px;
  color: inherit;
  background-color: rgba(255, 255, 255, 0.08);
  transition:
    background-color 0.2s,
    opacity 0.15s,
    transform 0.15s;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.07),
      inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    transition: opacity 0.24s ease;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.11);
    transform: translateY(-1px);
  }

  &:hover::after {
    opacity: 1;
  }

  &:active {
    transform: translateY(0) scale(0.985);
  }

  &.dragging {
    opacity: 0.35;
    transform: scale(0.95);
  }

  &.add-card {
    opacity: 0.78;
  }
}

.shortcut-icon {
  width: 24px;
  height: 24px;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 22px;
    height: 22px;
    display: block;
    object-fit: contain;
    border-radius: 4px;
  }

  .i-icon {
    width: 1rem;
    font-size: 21px;
    opacity: 0.9;
  }
}

.name {
  min-width: 0;
  font-size: 15px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.name--compact {
    font-size: 13px;
  }
}

.not-shortcut {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;

  .tip {
    font-size: 22px;
    text-align: center;
  }
}
</style>
