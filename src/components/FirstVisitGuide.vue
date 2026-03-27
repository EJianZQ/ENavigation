<template>
  <div class="guide-overlay" @click.self="$emit('dismiss')" @contextmenu.prevent.stop>
    <div
      ref="panelRef"
      class="guide-panel"
      tabindex="0"
      @click.stop
      @contextmenu.prevent.stop
      @keydown.esc.prevent="$emit('dismiss')"
    >
      <div class="guide-header">
        <span class="guide-tag">ENavigation</span>
        <h2>{{ t("guide.title") }}</h2>
        <p>{{ t("guide.subtitle") }}</p>
      </div>

      <div class="guide-scroll">
        <div class="guide-grid">
          <section class="guide-section">
            <div class="guide-list">
              <article v-for="item in hotkeyItems" :key="item.title" class="guide-item">
                <span class="guide-combo">{{ item.combo }}</span>
                <div class="guide-copy">
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.description }}</p>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>

      <div class="guide-footer">
        <span class="guide-hint">{{ t("guide.escHint") }}</span>
        <n-button strong secondary @click="$emit('dismiss')">
          {{ t("guide.dismiss") }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { NButton } from "naive-ui";

defineEmits(["dismiss"]);

const { t } = useI18n({ useScope: "global" });
const panelRef = ref(null);

const hotkeyItems = computed(() => [
  {
    combo: "Ctrl + K / Cmd + K",
    title: t("guide.hotkeys.search.title"),
    description: t("guide.hotkeys.search.description"),
  },
  {
    combo: "Ctrl + , / Cmd + ,",
    title: t("guide.hotkeys.settings.title"),
    description: t("guide.hotkeys.settings.description"),
  },
  {
    combo: "Ctrl + B / Cmd + B",
    title: t("guide.hotkeys.box.title"),
    description: t("guide.hotkeys.box.description"),
  },
  {
    combo: "Ctrl + Shift + P / Cmd + Shift + P",
    title: t("guide.hotkeys.command.title"),
    description: t("guide.hotkeys.command.description"),
  },
  {
    combo: "Esc",
    title: t("guide.hotkeys.escape.title"),
    description: t("guide.hotkeys.escape.description"),
  },
  {
    combo: "Enter",
    title: t("guide.hotkeys.enter.title"),
    description: t("guide.hotkeys.enter.description"),
  },
  {
    combo: "↑ / ↓",
    title: t("guide.hotkeys.navigate.title"),
    description: t("guide.hotkeys.navigate.description"),
  },
]);

onMounted(() => {
  nextTick(() => {
    panelRef.value?.focus();
  });
});
</script>

<style lang="scss" scoped>
.guide-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(10, 14, 23, 0.52);
  backdrop-filter: blur(18px);
  z-index: 12;
}

.guide-panel {
  width: min(960px, 100%);
  max-height: min(calc(100dvh - 48px), 860px);
  display: flex;
  flex-direction: column;
  color: var(--main-text-color);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.08)),
    var(--main-background-color);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  outline: none;
}

.guide-header {
  padding: 28px 28px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  h2 {
    margin: 12px 0 10px;
    font-size: clamp(1.75rem, 4vw, 2.45rem);
    line-height: 1.12;
  }

  p {
    margin: 0;
    opacity: 0.76;
    line-height: 1.7;
  }
}

.guide-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background-color: var(--main-background-light-color);
}

.guide-scroll {
  flex: 1 1 auto;
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

.guide-grid {
  padding: 24px 28px;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guide-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background-color: var(--main-background-light-color);
}

.guide-combo {
  flex-shrink: 0;
  min-width: 148px;
  padding: 8px 12px;
  border-radius: 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--main-text-hover-color);
  background-color: var(--main-background-hover-color);

  @media (max-width: 540px) {
    min-width: 118px;
  }
}

.guide-copy {
  strong {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    opacity: 0.76;
  }
}

.guide-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 28px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 620px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.guide-hint {
  font-size: 13px;
  opacity: 0.64;
}
</style>
