<template>
  <!-- 待办 -->
  <div class="todo__layout">
    <!-- 输入区 -->
    <div class="todo__input">
      <input
        class="input"
        type="text"
        placeholder="添加新的待办事项..."
        v-model="newTodoText"
        @keydown.enter.stop="addTodo"
      />
      <div class="add-btn" title="添加" @click="addTodo">
        <SvgIcon iconName="icon-add" />
      </div>
    </div>
    <!-- 列表 -->
    <Transition name="fade" mode="out-in">
      <div v-if="todoData.length" class="todo__list">
        <n-scrollbar class="scrollbar">
          <div class="todo__items">
            <div
              v-for="(item, index) in todoData"
              :key="item.id"
              :class="[
                'todo__item',
                item.done ? 'done' : '',
                dragIndex === index ? 'dragging' : '',
                dropTargetIndex === index ? 'drop-target' : '',
              ]"
              draggable="true"
              @dragstart="onDragStart(index, $event)"
              @dragover.prevent="onDragOver(index)"
              @dragend="onDragEnd"
            >
              <div class="left" @click="toggleTodo(item.id)">
                <SvgIcon :iconName="item.done ? 'icon-confirm' : 'icon-packup'" />
                <span class="text">{{ item.text }}</span>
              </div>
              <div class="right">
                <div class="action" title="删除" @click="deleteTodo(item.id)">
                  <SvgIcon iconName="icon-delete-1" />
                </div>
              </div>
            </div>
          </div>
        </n-scrollbar>
      </div>
      <div v-else class="todo__empty">
        <span class="tip">暂无待办事项</span>
      </div>
    </Transition>
    <!-- 底部统计 -->
    <div v-if="todoData.length" class="todo__footer">
      <span class="count">
        {{ doneCount }} / {{ todoData.length }} 已完成
      </span>
      <div v-if="doneCount > 0" class="clear" @click="clearDone">清除已完成</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { NScrollbar } from "naive-ui";
import { storeToRefs } from "pinia";
import { siteStore } from "@/stores";
import SvgIcon from "@/components/SvgIcon.vue";

const site = siteStore();
const { todoData } = storeToRefs(site);

// 新待办输入
const newTodoText = ref("");

// 拖拽状态
const dragIndex = ref(null);
const dropTargetIndex = ref(null);

// 已完成数量
const doneCount = computed(() => {
  return todoData.value.filter((item) => item.done).length;
});

// 添加待办
const addTodo = () => {
  const text = newTodoText.value.trim();
  if (!text) {
    $message.info("请输入待办内容", { duration: 1500 });
    return;
  }
  const maxId = todoData.value.reduce((max, item) => Math.max(max, item.id), -1);
  todoData.value.push({
    id: maxId + 1,
    text,
    done: false,
  });
  newTodoText.value = "";
};

// 切换完成状态
const toggleTodo = (id) => {
  const item = todoData.value.find((t) => t.id === id);
  if (item) {
    item.done = !item.done;
    // 稳定排序：已完成沉底，未完成内部保持拖拽顺序
    todoData.value.sort((a, b) => a.done - b.done);
  }
};

// 删除待办
const deleteTodo = (id) => {
  const index = todoData.value.findIndex((t) => t.id === id);
  if (index !== -1) todoData.value.splice(index, 1);
};

// 清除已完成
const clearDone = () => {
  $dialog.warning({
    title: "清除已完成",
    content: "确认清除所有已完成的待办事项？",
    positiveText: "清除",
    negativeText: "取消",
    onPositiveClick: () => {
      todoData.value = todoData.value.filter((item) => !item.done);
    },
  });
};

// 拖拽开始
const onDragStart = (index, event) => {
  dragIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
};

// 拖拽经过
const onDragOver = (index) => {
  if (dragIndex.value === null || dragIndex.value === index) {
    dropTargetIndex.value = null;
    return;
  }
  dropTargetIndex.value = index;
  // 执行交换
  const items = todoData.value;
  const dragged = items.splice(dragIndex.value, 1)[0];
  items.splice(index, 0, dragged);
  dragIndex.value = index;
};

// 拖拽结束
const onDragEnd = () => {
  dragIndex.value = null;
  dropTargetIndex.value = null;
};
</script>

<style lang="scss" scoped>
.todo__layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .todo__input {
    display: flex;
    align-items: center;
    padding: 0 20px 12px;
    gap: 8px;
    .input {
      flex: 1;
      height: 38px;
      padding: 0 14px;
      border: none;
      outline: none;
      border-radius: 8px;
      font-size: 14px;
      color: var(--main-text-color);
      background-color: var(--main-background-light-color);
      transition: background-color 0.3s;
      &::placeholder {
        color: var(--main-text-color);
        opacity: 0.5;
      }
      &:focus {
        background-color: var(--main-background-hover-color);
      }
    }
    .add-btn {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 8px;
      font-size: 18px;
      background-color: var(--main-background-light-color);
      transition: background-color 0.3s, transform 0.15s;
      &:hover {
        background-color: var(--main-background-hover-color);
      }
      &:active {
        transform: scale(0.92);
      }
    }
  }
  .todo__list {
    flex: 1;
    overflow: hidden;
    .todo__items {
      padding: 0 20px;
      .todo__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        margin-bottom: 8px;
        border-radius: 8px;
        cursor: grab;
        background-color: var(--main-background-light-color);
        transition: background-color 0.3s, opacity 0.3s, transform 0.15s;
        .left {
          cursor: pointer;
          display: flex;
          align-items: center;
          flex: 1;
          gap: 10px;
          min-width: 0;
          .i-icon {
            font-size: 16px;
            min-width: 16px;
            opacity: 0.6;
          }
          .text {
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: opacity 0.3s;
          }
        }
        .right {
          display: flex;
          align-items: center;
          gap: 4px;
          .action {
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.2s, background-color 0.2s;
            &:hover {
              background-color: var(--main-background-hover-color);
            }
          }
        }
        &:hover .right .action {
          opacity: 0.8;
        }
        &.dragging {
          opacity: 0.4;
          transform: scale(0.97);
        }
        &.done {
          opacity: 0.5;
          .left .i-icon {
            opacity: 1;
          }
          .left .text {
            text-decoration: line-through;
            opacity: 0.6;
          }
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
  .todo__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    .tip {
      font-size: 18px;
      opacity: 0.5;
    }
  }
  .todo__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    font-size: 13px;
    opacity: 0.7;
    .count {
      opacity: 0.8;
    }
    .clear {
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 6px;
      transition: background-color 0.2s, opacity 0.2s;
      &:hover {
        opacity: 1;
        background-color: var(--main-background-light-color);
      }
    }
  }
}
</style>

