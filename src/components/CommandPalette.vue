<template>
  <div class="command-overlay" @click.self="dismissPalette" @contextmenu.prevent.stop>
    <div
      ref="panelRef"
      class="command-panel"
      tabindex="0"
      @click.stop
      @contextmenu.prevent.stop
    >
      <div class="command-header">
        <span class="command-tag">ENavigation</span>
        <div class="command-input-wrap">
          <SvgIcon iconName="icon-search" />
          <input
            ref="inputRef"
            v-model="query"
            class="command-input"
            type="text"
            :placeholder="t('commandPalette.placeholder')"
          />
          <span class="command-close">{{ t("commandPalette.escBadge") }}</span>
        </div>
      </div>

      <div ref="scrollRef" class="command-scroll">
        <div v-if="filteredCommands.length" class="command-list">
          <button
            v-for="(command, index) in filteredCommands"
            :key="command.id"
            type="button"
            class="command-item"
            :class="{ active: index === selectedIndex }"
            :data-command-index="index"
            @mousedown.prevent
            @click="selectAndExecute(index, command)"
          >
            <span class="command-group">{{ command.groupLabel }}</span>
            <strong>{{ command.title }}</strong>
          </button>
        </div>
        <div v-else class="command-empty">
          <strong>{{ t("commandPalette.emptyTitle") }}</strong>
          <p>{{ t("commandPalette.emptyDescription") }}</p>
        </div>
      </div>

      <div class="command-footer">
        <span>{{ t("commandPalette.footerHint") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { setStore, statusStore } from "@/stores";
import SvgIcon from "@/components/SvgIcon.vue";
import {
  BOX_PENDING_ACTIONS,
  BOX_TAB_NAMES,
  applyThemeTypeSelection,
  createCommandPaletteCommands,
} from "@/utils/commandPalette";

const set = setStore();
const status = statusStore();
const { t, tm } = useI18n({ useScope: "global" });
const panelRef = ref(null);
const inputRef = ref(null);
const scrollRef = ref(null);
const query = ref("");
const selectedIndex = ref(0);

const focusSearchInput = () => {
  nextTick(() => {
    document.getElementById("main-input")?.focus();
  });
};

const restoreAfterDismiss = (nextStatus) => {
  if (nextStatus === "focus") {
    focusSearchInput();
  }
};

const dismissPalette = () => {
  const nextStatus = status.closeCommandPalette();
  restoreAfterDismiss(nextStatus);
};

const openSearch = () => {
  status.closeCommandPalette("focus", "");
  focusSearchInput();
};

const openSettings = () => {
  status.closeCommandPalette("set");
};

const openBox = () => {
  status.closeCommandPalette("box");
};

const goHome = () => {
  status.closeCommandPalette("normal");
};

const openCreateShortcut = () => {
  status.setBoxActiveTab(BOX_TAB_NAMES.shortcuts);
  status.setPendingBoxAction(BOX_PENDING_ACTIONS.createShortcut);
  status.closeCommandPalette("box");
};

const openCreateNote = () => {
  status.setBoxActiveTab(BOX_TAB_NAMES.notes);
  status.setPendingBoxAction(BOX_PENDING_ACTIONS.createNote);
  status.closeCommandPalette("box");
};

const openCreateTodo = () => {
  status.setBoxActiveTab(BOX_TAB_NAMES.todos);
  status.setPendingBoxAction(BOX_PENDING_ACTIONS.focusTodoInput);
  status.closeCommandPalette("box");
};

const switchLanguage = (language) => {
  set.language = language;
  const nextStatus = status.closeCommandPalette();
  restoreAfterDismiss(nextStatus);
};

const switchTheme = (themeType) => {
  applyThemeTypeSelection(themeType, set, status);
  const nextStatus = status.closeCommandPalette();
  restoreAfterDismiss(nextStatus);
};

const toggleAutoNightMode = () => {
  set.autoNightMode = !set.autoNightMode;
  const nextStatus = status.closeCommandPalette();
  restoreAfterDismiss(nextStatus);
};

const switchWallpaper = (type) => {
  set.backgroundType = type;
  $message.success(
    t("settings.wallpaper.switchedMessage", {
      name: t(`settings.wallpaper.types.${type === 0 ? "local" : type === 1 ? "bing" : type === 2 ? "landscape" : "anime"}`),
    }),
    { duration: 1500 },
  );
  const nextStatus = status.closeCommandPalette();
  restoreAfterDismiss(nextStatus);
};

const commands = computed(() =>
  createCommandPaletteCommands({
    t,
    tm,
    set,
    status,
    openSearch,
    openSettings,
    openBox,
    goHome,
    openCreateShortcut,
    openCreateNote,
    openCreateTodo,
    switchLanguage,
    switchTheme,
    toggleAutoNightMode,
    switchWallpaper,
  }),
);

const filteredCommands = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  if (!keyword) return commands.value;
  const parts = keyword.split(/\s+/).filter(Boolean);
  return commands.value.filter((command) => {
    const searchable = [command.groupLabel, command.title, ...command.keywords].join(" ").toLowerCase();
    return parts.every((part) => searchable.includes(part));
  });
});

const scrollActiveCommandIntoView = () => {
  nextTick(() => {
    const target = scrollRef.value?.querySelector(`[data-command-index="${selectedIndex.value}"]`);
    target?.scrollIntoView({ block: "nearest" });
  });
};

const moveSelection = (delta) => {
  if (!filteredCommands.value.length) {
    selectedIndex.value = -1;
    return;
  }
  const maxIndex = filteredCommands.value.length - 1;
  if (selectedIndex.value < 0) {
    selectedIndex.value = 0;
  } else {
    selectedIndex.value = selectedIndex.value + delta;
    if (selectedIndex.value > maxIndex) selectedIndex.value = 0;
    if (selectedIndex.value < 0) selectedIndex.value = maxIndex;
  }
  scrollActiveCommandIntoView();
};

const executeCommand = (command) => {
  if (!command) return;
  command.run();
};

const selectAndExecute = (index, command) => {
  selectedIndex.value = index;
  executeCommand(command);
};

const handlePaletteKeydown = (event) => {
  if (status.siteStatus !== "command" || event.isComposing) return;
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "p") {
    event.preventDefault();
    dismissPalette();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    dismissPalette();
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveSelection(1);
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveSelection(-1);
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    if (selectedIndex.value < 0) return;
    executeCommand(filteredCommands.value[selectedIndex.value]);
  }
};

watch(
  filteredCommands,
  (items) => {
    selectedIndex.value = items.length ? 0 : -1;
    scrollActiveCommandIntoView();
  },
  { immediate: true },
);

onMounted(() => {
  document.addEventListener("keydown", handlePaletteKeydown);
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handlePaletteKeydown);
});
</script>

<style lang="scss" scoped>
.command-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 10vh 24px 24px;
  background: rgba(10, 14, 23, 0.38);
  backdrop-filter: blur(14px);
  z-index: 11;
}

.command-panel {
  width: min(760px, 100%);
  max-height: min(calc(100dvh - 60px), 720px);
  display: flex;
  flex-direction: column;
  color: var(--main-text-color);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.08)),
    var(--main-background-color);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  outline: none;
}

.command-header {
  padding: 24px 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.command-tag {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background-color: var(--main-background-light-color);
}

.command-input-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  min-height: 58px;
  border-radius: 18px;
  background-color: var(--main-background-light-color);

  .i-icon {
    font-size: 18px;
    opacity: 0.72;
  }
}

.command-input {
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: none;
  font-size: 16px;
  color: var(--main-text-color);

  &::placeholder {
    color: var(--main-text-color);
    opacity: 0.48;
  }
}

.command-close {
  flex-shrink: 0;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.05em;
  color: var(--main-text-hover-color);
  background-color: var(--main-background-hover-color);
}

.command-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
}

.command-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.command-item {
  cursor: pointer;
  width: 100%;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  border: none;
  border-radius: 16px;
  text-align: left;
  color: inherit;
  background-color: var(--main-background-light-color);
  transition:
    background-color 0.2s,
    transform 0.15s,
    box-shadow 0.2s;

  &:hover,
  &.active {
    background-color: var(--main-background-hover-color);
    box-shadow: 0 0 0 2px var(--main-background-hover-color);
  }

  &:active {
    transform: scale(0.985);
  }

  strong {
    font-size: 15px;
    line-height: 1.5;
  }
}

.command-group {
  font-size: 12px;
  letter-spacing: 0.04em;
  opacity: 0.62;
}

.command-empty {
  padding: 48px 24px;
  text-align: center;

  strong {
    display: block;
    margin-bottom: 8px;
    font-size: 16px;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    opacity: 0.68;
  }
}

.command-footer {
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 13px;
  opacity: 0.68;
}

@media (max-width: 640px) {
  .command-overlay {
    padding: 18px;
  }

  .command-panel {
    max-height: calc(100dvh - 36px);
    border-radius: 20px;
  }

  .command-header {
    padding: 20px 18px 16px;
  }

  .command-list {
    padding: 12px;
  }

  .command-footer {
    padding: 14px 18px 18px;
  }
}
</style>
