<template>
  <!-- 时钟 -->
  <div
    :class="[
      'date-time',
      status.siteStatus,
      status.mainBoxBig && status.siteStatus !== 'normal' && status.siteStatus !== 'focus'
        ? 'hidden'
        : null,
      set.timeStyle,
    ]"
    @click.stop
  >
    <div
      class="time"
      @click.stop="
        status.setSiteStatus(
          status.siteStatus !== 'normal' && status.siteStatus !== 'focus' ? 'normal' : 'box',
        )
      "
    >
      <span class="hour">{{ timeData.hour ?? "00" }}</span>
      <span class="separator" :key="set.showSeconds">:</span>
      <span class="minute">{{ timeData.minute ?? "00" }}</span>
      <Transition name="fade" mode="out-in">
        <span v-if="set.showSeconds" class="second">
          <span class="separator">:</span>
          <span class="second-num">{{ timeData.second ?? "00" }}</span>
        </span>
      </Transition>
      <template v-if="set.use12HourFormat">
        <span class="amPm">{{ timeData.amPm ?? "am" }}</span>
      </template>
    </div>
    <div class="date">
      <span class="month">{{ timeData.month ?? "0" }}</span>
      <span class="day">{{ timeData.day ?? "0" }}</span>
      <span class="weekday">{{ timeData.weekday ?? "星期八" }}</span>
      <template v-if="set.showLunar && timeData.lunar">
        <span class="lunar-sep">·</span>
        <span class="lunar">{{ timeData.lunar?.GanZhiYear }}年{{ timeData.lunar?.text }}</span>
      </template>
    </div>
    <div v-if="set.showHitokoto && !set.hitokotoAsPlaceholder" class="hitokoto" @click="refreshHitokoto" title="点击刷新">
      {{ status.hitokotoText || "加载中..." }}<span v-if="set.showHitokotoSource && status.hitokotoFrom" class="from"> —— {{ status.hitokotoFrom }}</span>
    </div>
  </div>
</template>

<script setup>
import { getCurrentTime } from "@/utils/timeTools";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { statusStore, setStore } from "@/stores";
import { getHitokoto } from "@/api";

const set = setStore();
const status = statusStore();

// 时间数据
const timeData = ref({});
const timeInterval = ref(null);

// 更新时间
const updateTimeData = () => {
  timeData.value = getCurrentTime(set.showZeroTime, set.use12HourFormat);
};

// 获取一言数据
const getHitokotoData = async () => {
  try {
    const result = await getHitokoto(set.hitokotoTypes || []);
    status.hitokotoText = result.hitokoto || "";
    // 拼接出处信息
    const parts = [result.from, result.from_who].filter(Boolean);
    status.hitokotoFrom = parts.length ? parts.join(" / ") : "";
  } catch (error) {
    console.error("一言获取失败：", error);
    status.hitokotoText = "世界上最遥远的距离，是你在电信，我在网通。";
    status.hitokotoFrom = "";
  }
};

// 刷新一言
const refreshHitokoto = () => {
  status.hitokotoText = "加载中...";
  status.hitokotoFrom = "";
  getHitokotoData();
};

// 监听配置发生改变
watch(
  () => [set.showZeroTime, set.use12HourFormat],
  () => {
    updateTimeData();
  },
);

onMounted(() => {
  // 时间
  updateTimeData();
  timeInterval.value = setInterval(updateTimeData, 1000);
  // 一言
  getHitokotoData();
});

onBeforeUnmount(() => {
  clearInterval(timeInterval.value);
});
</script>

<style lang="scss" scoped>
.date-time {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  transform: translateY(-140px);
  color: var(--main-text-color);
  animation: fade-time-in 0.6s cubic-bezier(0.21, 0.78, 0.36, 1);
  transition:
    transform 0.3s,
    opacity 0.5s,
    margin-bottom 0.3s;
  z-index: 1;
  .time {
    cursor: pointer;
    font-size: 3.5rem;
    margin: 6px 0px;
    text-shadow: var(--main-text-shadow);
    transition: transform 0.3s;
    .separator {
      opacity: 0.8;
      font-size: 3.2rem;
      display: inline-block;
      margin: 0 5px;
      transform: translateY(-4px);
      animation: separator-breathe 0.7s infinite alternate;
    }
    .amPm {
      font-size: 1rem;
      opacity: 0.6;
      margin-left: 6px;
    }
    &:hover {
      transform: scale(1.08);
    }
    &:active {
      transform: scale(1);
    }
  }
  .date {
    font-size: 1.15rem;
    opacity: 0.8;
    margin: 2px 0;
    text-shadow: var(--main-text-shadow);
    .month {
      &::after {
        margin: 0 4px;
        content: "月";
      }
    }
    .day {
      &::after {
        margin: 0 6px 0 4px;
        content: "日";
      }
    }
    .lunar-sep {
      margin: 0 6px;
      opacity: 0.5;
    }
    .lunar {
      font-size: 0.9rem;
      opacity: 0.7;
    }
  }
  .hitokoto {
    opacity: 0.7;
    font-size: 0.95rem;
    max-width: 680px;
    text-align: center;
    padding: 0 20px;
    margin-top: 2px;
    text-shadow: var(--main-text-shadow);
    cursor: pointer;
    line-height: 1.5;
    transition: opacity 0.3s;
    &:hover {
      opacity: 1;
    }
    .from {
      opacity: 0.65;
      font-size: 0.82rem;
    }
  }

  &.focus {
    transform: translateY(-180px);
    // transform: translateY(-24vh);
  }
  &.box,
  &.set {
    // transform: translateY(-220px);
    transform: translateY(-34vh);
    @media (max-width: 478px) {
      transform: translateY(-32vh);
    }
  }
  &.hidden {
    transform: translateY(-180px);
    opacity: 0;
  }
  &.two {
    padding-bottom: 60px;
    .time {
      display: flex;
      flex-direction: column;
      align-items: center;
      span {
        line-height: normal;
      }
      .separator,
      .second {
        display: none;
      }
      .hour {
        &::after {
          content: "/";
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
          opacity: 0.4;
          transform: rotate(50deg);
          margin: 12px 0;
        }
      }
    }
  }
}
</style>
