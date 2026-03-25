<template>
  <div class="all-set">
    <n-tabs class="set" size="large" justify-content="space-evenly" animated>
      <n-tab-pane name="main" tab="基础设置">
        <n-scrollbar class="scrollbar">
          <n-h6 prefix="bar"> 主题与壁纸 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">主题类别</span>
              <span class="tip">{{ themeTypeTip }}</span>
            </div>
            <n-select class="set" v-model:value="themeTypeModel" :options="themeTypeOptions" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">夜间自动暗色</span>
              <span class="tip">每天 0:00 ~ 5:00 自动切换暗色模式</span>
            </div>
            <n-switch v-model:value="autoNightMode" :round="false" />
          </n-card>
          <n-card
            class="set-item cover"
            :content-style="{
              flexDirection: 'column',
              alignItems: 'flex-start',
            }"
          >
            <div class="desc">
              <div class="name">
                <span class="title">壁纸偏好</span>
                <span class="tip"> 除默认以外的其他选项可能会导致页面载入缓慢 </span>
              </div>
              <n-space>
                <Transition name="fade" mode="out-in">
                  <n-button
                    v-if="backgroundType !== 0"
                    strong
                    secondary
                    @click="changeBackground(0, true)"
                  >
                    恢复默认
                  </n-button>
                </Transition>
                <n-button strong secondary @click="customCoverModal = true">
                  <template v-if="backgroundType === 4" #icon>
                    <SvgIcon iconName="icon-confirm" />
                  </template>
                  {{ backgroundType === 4 ? "已开启自定义" : "自定义" }}
                </n-button>
              </n-space>
            </div>
            <n-grid
              class="cover-selete"
              responsive="screen"
              cols="2 s:3 m:4 l:4"
              :x-gap="16"
              :y-gap="16"
            >
              <n-grid-item
                v-for="(item, index) in backgroundTypeArr"
                :key="index"
                :class="index === backgroundType ? 'item check' : 'item'"
                @click="changeBackground(index)"
              >
                <span class="name" v-html="item.name" />
              </n-grid-item>
            </n-grid>
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">壁纸遮罩</span>
              <span class="tip">壁纸周围是否显示暗色遮罩</span>
            </div>
            <n-switch v-model:value="showBackgroundGray" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">壁纸模糊</span>
              <span class="tip">调整壁纸高斯模糊的程度</span>
            </div>
            <n-slider
              class="set"
              v-model:value="backgroundBlur"
              :step="0.01"
              :min="0"
              :max="10"
              :tooltip="false"
            />
          </n-card>
          <n-h6 prefix="bar"> 搜索 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">搜索引擎</span>
              <span class="tip">切换或自定义搜索引擎</span>
            </div>
            <n-button
              strong
              secondary
              @click="
                () => {
                  status.setSiteStatus('focus');
                  status.setEngineChangeStatus(true);
                }
              "
            >
              前往调整
            </n-button>
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">搜索建议</span>
              <span class="tip">是否显示搜索建议</span>
            </div>
            <n-switch v-model:value="showSuggestions" :round="false" />
          </n-card>
          <n-card v-if="showSuggestions" class="set-item">
            <div class="name">
              <span class="title">建议联想来源</span>
              <span class="tip">联想词支持：Google / Bing / 百度</span>
            </div>
            <n-select class="set" v-model:value="suggestionProvider" :options="suggestionProviderOptions" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">跳转方式</span>
              <span class="tip">全站链接跳转方式</span>
            </div>
            <n-select class="set" v-model:value="urlJumpType" :options="urlJumpTypeOptions" />
          </n-card>
        </n-scrollbar>
      </n-tab-pane>
      <n-tab-pane name="personalization" tab="个性调整">
        <n-scrollbar class="scrollbar">

          <n-h6 prefix="bar"> 一言 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">一言显示</span>
              <span class="tip">是否在首页时间下方展示一言</span>
            </div>
            <n-switch v-model:value="showHitokoto" :round="false" />
          </n-card>
          <n-card v-if="showHitokoto" class="set-item">
            <div class="name">
              <span class="title">显示出处</span>
              <span class="tip">是否显示一言的来源和作者</span>
            </div>
            <n-switch v-model:value="showHitokotoSource" :round="false" />
          </n-card>
          <n-card v-if="showHitokoto" class="set-item">
            <div class="name">
              <span class="title">占位显示</span>
              <span class="tip">将一言显示在主搜索框的占位符中</span>
            </div>
            <n-switch v-model:value="hitokotoAsPlaceholder" :round="false" />
          </n-card>
          <n-card v-if="showHitokoto" class="set-item" :content-style="{ flexDirection: 'column', alignItems: 'flex-start' }">
            <div class="name" style="margin-bottom: 10px">
              <span class="title">句子类型</span>
              <span class="tip">可多选，不选则随机全部类型</span>
            </div>
            <n-checkbox-group v-model:value="hitokotoTypes" class="hitokoto-types">
              <n-grid cols="3 s:4 m:4 l:4" :x-gap="8" :y-gap="8" responsive="screen">
                <n-grid-item v-for="item in hitokotoTypeOptions" :key="item.value">
                  <n-checkbox :value="item.value" :label="item.label" />
                </n-grid-item>
              </n-grid>
            </n-checkbox-group>
          </n-card>
          <n-h6 prefix="bar"> 时间 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">时钟样式</span>
              <span class="tip">选择一种时钟样式</span>
            </div>
            <n-select class="set" v-model:value="timeStyle" :options="timeStyleOptions" />
          </n-card>
          <n-card v-if="timeStyle === 'one'" class="set-item">
            <div class="name">
              <span class="title">时间显秒</span>
              <span class="tip">是否在分钟后面显示秒数</span>
            </div>
            <n-switch v-model:value="showSeconds" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">时钟显零</span>
              <span class="tip">是否在时钟小于 10 时补 0</span>
            </div>
            <n-switch v-model:value="showZeroTime" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">显示农历</span>
            </div>
            <n-switch v-model:value="showLunar" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">12 小时制</span>
            </div>
            <n-switch v-model:value="use12HourFormat" :round="false" />
          </n-card>
          <n-h6 prefix="bar"> 搜索框 </n-h6>

          <n-card class="set-item">
            <div class="name">
              <span class="title">自动收缩</span>
              <span class="tip">是否在非搜索状态时收起搜索框</span>
            </div>
            <n-switch v-model:value="smallInput" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">自动聚焦</span>
              <span class="tip">打开网站时自动聚焦搜索框</span>
            </div>
            <n-switch v-model:value="autoFocus" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">自动失焦</span>
              <span class="tip">跳转搜索后搜索框自动失焦</span>
            </div>
            <n-switch v-model:value="autoInputBlur" :round="false" />
          </n-card>
        </n-scrollbar>
      </n-tab-pane>
      <n-tab-pane name="other" tab="其他设置">
        <n-scrollbar class="scrollbar">
          <n-h6 prefix="bar"> 云同步 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">GitHub Token</span>
              <span class="tip">用于 Gist 云同步的 Personal Access Token</span>
            </div>
            <n-input
              class="set"
              type="password"
              show-password-on="click"
              clearable
              v-model:value="githubToken"
              placeholder="输入 Token"
            />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">Gist ID</span>
              <span class="tip">GitHub Gist 的 ID（URL 最后一段）</span>
            </div>
            <n-input
              class="set"
              clearable
              v-model:value="gistId"
              placeholder="输入 Gist ID"
            />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">上传到云端</span>
              <span class="tip">将捷径、待办、便签数据上传到 Gist</span>
            </div>
            <n-button
              strong
              secondary
              :loading="syncUploading"
              :disabled="!githubToken"
              @click="syncUpload"
            >
              上传
            </n-button>
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">从云端下载</span>
              <span class="tip">从 Gist 下载数据覆盖本地</span>
            </div>
            <n-button
              strong
              secondary
              :loading="syncDownloading"
              @click="syncDownload"
            >
              下载
            </n-button>
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">自动同步</span>
              <span class="tip">数据变更时自动上传到云端</span>
            </div>
            <n-switch v-model:value="autoSync" :round="false" />
          </n-card>
          <n-h6 prefix="bar"> 重置 </n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">站点重置</span>
              <span class="tip">若站点显示异常或出现问题时可尝试此操作</span>
            </div>
            <n-button strong secondary @click="resetSite"> 重置 </n-button>
          </n-card>
        </n-scrollbar>
      </n-tab-pane>
    </n-tabs>
    <!-- 自定义壁纸 -->
    <n-modal preset="card" title="自定义壁纸" v-model:show="customCoverModal" :bordered="false">
      <n-form>
        <n-form-item label="自定义壁纸链接">
          <n-input
            clearable
            type="text"
            v-model:value="customCoverUrl"
            placeholder="请输入自定义壁纸链接"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button strong secondary @click="customCoverModal = false"> 取消 </n-button>
          <n-button strong secondary @click="setCustomCover"> 确认 </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 云同步数据对比窗口 -->
    <n-modal v-model:show="syncCompareModal" preset="card" title="云端数据下载对比" class="custom-modal">
      <div v-if="cloudDataCache" class="sync-compare">
        <n-alert title="确认覆盖本地数据？" type="warning" style="margin-bottom: 16px">
          此操作不可逆转！以下为本地与云端的数据差异明细
        </n-alert>

        <n-h6 prefix="bar">快捷功能数据统计</n-h6>
        <n-table :single-line="false" size="small" style="margin-bottom: 16px">
          <thead>
            <tr>
              <th>功能</th>
              <th>本地数量</th>
              <th>云端数量</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>捷径</td>
              <td>{{ site.shortcutData?.length || 0 }}</td>
              <td :class="{ changed: (site.shortcutData?.length || 0) !== (cloudDataCache.shortcutData?.length || 0) }">
                {{ cloudDataCache.shortcutData?.length || 0 }}
              </td>
            </tr>
            <tr>
              <td>便签</td>
              <td>{{ site.noteData?.length || 0 }}</td>
              <td :class="{ changed: (site.noteData?.length || 0) !== (cloudDataCache.noteData?.length || 0) }">
                {{ cloudDataCache.noteData?.length || 0 }}
              </td>
            </tr>
            <tr>
              <td>待办</td>
              <td>{{ site.todoData?.length || 0 }}</td>
              <td :class="{ changed: (site.todoData?.length || 0) !== (cloudDataCache.todoData?.length || 0) }">
                {{ cloudDataCache.todoData?.length || 0 }}
              </td>
            </tr>
          </tbody>
        </n-table>

        <n-h6 prefix="bar">差异设置项明细</n-h6>
        <template v-if="changedSettingsList.length > 0">
          <n-table :single-line="false" size="small">
            <thead>
              <tr>
                <th>设置项</th>
                <th>本地当前值</th>
                <th>云端将覆盖为</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in changedSettingsList" :key="item.key">
                <td>{{ item.label || item.key }}</td>
                <td style="opacity: 0.7">{{ item.localValue }}</td>
                <td class="changed">{{ item.cloudValue }}</td>
              </tr>
            </tbody>
          </n-table>
        </template>
        <n-alert v-else type="info" :show-icon="false" style="text-align: center">
          本地与云端设置项完全一致，无需覆盖
        </n-alert>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px">
          <n-button secondary @click="syncCompareModal = false">取消</n-button>
          <n-button 
            type="error" 
            color="#d03050" 
            text-color="#ffffff" 
            :disabled="syncConfirmCountdown > 0"
            @click="confirmSyncDownload"
          >
            {{ syncConfirmCountdown > 0 ? `请仔细核对 (${syncConfirmCountdown}s)` : "确认使用云端数据覆盖" }}
          </n-button>
        </div>
      </div>
      <div v-else style="text-align: center; padding: 40px">
        <n-spin size="large" />
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import {
  NH6,
  NTabs,
  NTabPane,
  NSpace,
  NCard,
  NSwitch,
  NSelect,
  NScrollbar,
  NButton,
  NGrid,
  NGridItem,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSlider,
  NCheckboxGroup,
  NCheckbox,
  NTable,
  NAlert,
  NSpin,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { setStore, statusStore, siteStore } from "@/stores";
import identifyInput from "@/utils/identifyInput";
import { getNightModeDateKey } from "@/utils/timeTools";
import { uploadToGist, downloadFromGist } from "@/utils/gistSync";
import { buildSyncPayload, shouldSkipSyncSetting } from "@/utils/syncData";

const set = setStore();
const status = statusStore();
const site = siteStore();
const {
  themeType,
  backgroundType,
  backgroundCustom,
  showBackgroundGray,
  backgroundBlur,
  smallInput,
  autoFocus,
  autoInputBlur,
  showLunar,
  showHitokoto,
  showHitokotoSource,
  hitokotoAsPlaceholder,
  hitokotoTypes,
  showSeconds,
  showZeroTime,
  use12HourFormat,
  showSuggestions,
  suggestionProvider,
  urlJumpType,
  timeStyle,
  githubToken,
  gistId,
  autoSync,
  autoNightMode,
} = storeToRefs(set);

// 云同步对比模态框
const syncCompareModal = ref(false);
const cloudDataCache = ref(null);
const syncConfirmCountdown = ref(5);
let countdownTimer = null;

// 设置项的中文名称映射
const settingLabels = {
  themeType: "主题类别",
  backgroundType: "壁纸类别",
  backgroundCustom: "自定义壁纸",
  showBackgroundGray: "壁纸遮罩",
  backgroundBlur: "壁纸模糊度",
  searchEngine: "搜索引擎",
  lastSearchEngine: "上次搜索引擎",
  customEngineUrl: "自定义搜索引擎",
  smallInput: "搜索框收起",
  autoFocus: "搜索框自启聚焦",
  autoInputBlur: "搜索后失焦",
  timeStyle: "时钟样式",
  showLunar: "显示农历",
  showSeconds: "时间显秒",
  showZeroTime: "时钟补零",
  use12HourFormat: "12小时制",
  showHitokoto: "一言显示",
  showHitokotoSource: "一言出处显示",
  hitokotoAsPlaceholder: "一言占位显示",
  hitokotoTypes: "一言句子类型",
  showSuggestions: "搜索建议",
  suggestionProvider: "搜索建议来源",
  urlJumpType: "跳转方式",
  autoNightMode: "夜间自动暗色",
};

// 一言分类映射字典
const hitokotoTypeMap = {
  a: "动画",
  b: "漫画",
  c: "游戏",
  d: "文学",
  e: "原创",
  f: "来自网络",
  g: "其他",
  h: "影视",
  i: "诗词",
  j: "网易云",
  k: "哲学",
  l: "抖机灵",
};

// 值转换辅助函数
const formatSettingValue = (key, val) => {
  // 处理 boolean 类型
  if (typeof val === "boolean") {
    return val ? "启用" : "关闭";
  }
  // 处理搜索引擎和建议源
  if (["searchEngine", "lastSearchEngine", "suggestionProvider"].includes(key)) {
    const engineMap = {
      google: "谷歌",
      bing: "Bing",
      baidu: "百度",
      custom: "自定义",
    };
    return engineMap[val] || val;
  }
  // 处理一言类型
  if (key === "hitokotoTypes") {
    if (!Array.isArray(val) || val.length === 0) return "随机全类型";
    return val.map((t) => hitokotoTypeMap[t] || t).join(", ");
  }
  return String(val);
};

// 计算不一样设置项的明细列表
const changedSettingsList = computed(() => {
  const diffs = [];
  if (!cloudDataCache.value || !cloudDataCache.value.settings) return diffs;

  for (const [key, cloudVal] of Object.entries(cloudDataCache.value.settings)) {
    if (shouldSkipSyncSetting(key) || !(key in set.$state)) continue;

    const localVal = set.$state[key];
    // 简单对比值（数组转字符串对比）
    const cloudStr = JSON.stringify(cloudVal);
    const localStr = JSON.stringify(localVal);

    if (cloudStr !== localStr) {
      diffs.push({
        key,
        label: settingLabels[key] || key,
        localValue: formatSettingValue(key, localVal),
        cloudValue: formatSettingValue(key, cloudVal),
      });
    }
  }
  return diffs;
});

const customCoverModal = ref(false);
const customCoverUrl = ref("");
const syncUploading = ref(false);
const syncDownloading = ref(false);

const themeTypeModel = computed({
  get() {
    if (status.nightModeActive) {
      return status.tempThemeOverride || "dark";
    }
    return themeType.value;
  },
  set(val) {
    if (status.nightModeActive) {
      if (val === "dark") {
        status.setTempThemeOverride("");
        status.setTempThemeOverrideNightKey("");
      } else {
        status.setTempThemeOverride(val);
        status.setTempThemeOverrideNightKey(getNightModeDateKey());
      }
      return;
    }
    themeType.value = val;
  },
});

const themeTypeTip = computed(() => {
  if (!status.nightModeActive) return "切换全站主题类别";
  if (status.tempThemeOverride) {
    return "当前为夜间自动暗色时段，已临时切换为浅色，同一晚刷新仍保留，次日晚间自动恢复默认深色";
  }
  return "当前为夜间自动暗色时段，默认使用深色，可临时切换为浅色，仅本晚生效";
});

// 校验同步配置
const validateSyncConfig = () => {
  if (!githubToken.value) {
    $message.warning("请先填写 GitHub Token");
    return false;
  }
  if (!gistId.value) {
    $message.warning("请先填写 Gist ID");
    return false;
  }
  return true;
};

// 云同步 - 上传
const doUpload = async () => {
  syncUploading.value = true;
  try {
    const data = buildSyncPayload(set.$state, site);
    await uploadToGist(githubToken.value, gistId.value, data);
    set.hasSynced = true;
    $message.success("数据已上传到云端");
  } catch (error) {
    console.error("云同步上传失败：", error);
    $message.error(`上传失败：${error.message}`);
  } finally {
    syncUploading.value = false;
  }
};

const syncUpload = () => {
  if (!validateSyncConfig()) return;
  if (!set.hasSynced) {
    $dialog.warning({
      title: "⚠️ 新设备检测",
      content:
        "检测到本设备尚未从云端下载过数据。上传将用当前本地数据（可能是默认数据）覆盖云端，确认继续？",
      positiveText: "仍然上传",
      negativeText: "取消",
      onPositiveClick: doUpload,
    });
  } else {
    doUpload();
  }
};

// 云同步 - 下载（拉取数据并展示对比弹窗）
const syncDownload = async () => {
  if (!validateSyncConfig()) return;
  
  syncCompareModal.value = true;
  cloudDataCache.value = null; // 重置缓存展示 loading
  syncConfirmCountdown.value = 5; // 重置倒计时
  if (countdownTimer) clearInterval(countdownTimer);
  
  try {
    const data = await downloadFromGist(githubToken.value, gistId.value);
    cloudDataCache.value = data;
    
    // 数据加载完毕后开始倒计时
    countdownTimer = setInterval(() => {
      if (syncConfirmCountdown.value > 0) {
        syncConfirmCountdown.value--;
      } else {
        clearInterval(countdownTimer);
      }
    }, 1000);
  } catch (error) {
    console.error("云同步下载失败：", error);
    $message.error(`下载失败：${error.message}`);
    syncCompareModal.value = false;
  }
};

// 确认执行覆盖操作
const confirmSyncDownload = () => {
  const data = cloudDataCache.value;
  if (!data) return;

  try {
    if (data.todoData) site.todoData = data.todoData;
    if (data.noteData) site.noteData = data.noteData;
    if (data.shortcutData) site.shortcutData = data.shortcutData;
    if (data.searchHistory) site.searchHistory = data.searchHistory;
    if (data.settings) {
      for (const [key, val] of Object.entries(data.settings)) {
        if (!shouldSkipSyncSetting(key) && key in set.$state) {
          set.$state[key] = val;
        }
      }
    }
    set.hasSynced = true;
    syncCompareModal.value = false;
    $message.success("数据已成功覆盖本地");
  } catch (error) {
    console.error("数据覆盖失败：", error);
    $message.error("覆盖失败，请重试");
  }
};

// 壁纸类别
const backgroundTypeArr = [
  { name: "本地默认", tip: "默认壁纸，随机更换" },
  { name: "每日必应", tip: "必应每日一图，每天更新" },
  { name: "随机风景", tip: "随机风景图，随机更换" },
  { name: "随机动漫", tip: "随机二次元图，随机更换" },
];

// 主题类别
const themeTypeOptions = [
  {
    label: "浅色模式",
    value: "light",
  },
  {
    label: "深色模式",
    value: "dark",
  },
];

// 切换壁纸
const changeBackground = (type, reset = false) => {
  if (reset) {
    $dialog.warning({
      title: "壁纸恢复",
      content: "确认恢复默认壁纸？若当前为自定义壁纸，你的自定义壁纸将丢失！",
      positiveText: "恢复",
      negativeText: "取消",
      onPositiveClick: () => {
        backgroundType.value = 0;
        $message.info("已恢复为默认壁纸，刷新后生效");
      },
    });
    return true;
  }
  backgroundType.value = type;
  $message.success(`已切换为${backgroundTypeArr[type].name}，刷新后生效`);
};

// 链接跳转方式
const urlJumpTypeOptions = [
  {
    label: "新页面打开",
    value: "open",
  },
  {
    label: "当前页打开",
    value: "href",
  },
];

// 一言句子类型
const hitokotoTypeOptions = [
  { label: "动画", value: "a" },
  { label: "漫画", value: "b" },
  { label: "游戏", value: "c" },
  { label: "文学", value: "d" },
  { label: "原创", value: "e" },
  { label: "来自网络", value: "f" },
  { label: "其他", value: "g" },
  { label: "影视", value: "h" },
  { label: "诗词", value: "i" },
  { label: "网易云", value: "j" },
  { label: "哲学", value: "k" },
  { label: "抖机灵", value: "l" },
];

// 时钟样式
const timeStyleOptions = [
  {
    label: "横向排布",
    value: "one",
  },
  {
    label: "竖向排布",
    value: "two",
  },
];

// 搜索建议来源
const suggestionProviderOptions = [
  { label: "Google", value: "google" },
  { label: "Bing", value: "bing" },
  { label: "百度", value: "baidu" },
];

// 自定义壁纸
const setCustomCover = () => {
  if (identifyInput(customCoverUrl.value) === "url") {
    backgroundType.value = 4;
    backgroundCustom.value = customCoverUrl.value;
    customCoverModal.value = false;
    $message.error("已切换为自定义壁纸，刷新后生效");
  } else {
    $message.error("请输入正确的网址");
  }
};

// 站点重置
const resetSite = () => {
  $dialog.warning({
    title: "站点重置",
    content: "确认重置站点为默认状态？你的全部数据以及自定义设置都将丢失！",
    positiveText: "重置",
    negativeText: "取消",
    onPositiveClick: () => {
      localStorage.clear();
      $message.info("站点重置成功，即将刷新");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
  });
};

onMounted(() => {
  // 检测是否存在自定义壁纸
  if (backgroundCustom.value) customCoverUrl.value = backgroundCustom.value;
});
</script>

<style lang="scss">
.cover-selete {
  margin-top: 12px;
  .item {
    cursor: pointer;
    position: relative;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background-color: var(--main-background-light-color);
    transition:
      background-color 0.3s,
      box-shadow 0.3s;
    &.check {
      background-color: var(--main-background-hover-color);
      &::before {
        content: "";
        position: absolute;
        border-radius: 12px;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 2px solid var(--main-background-hover-color);
        transition: opacity 0.3s;
      }
    }
    &:hover {
      background-color: var(--main-background-hover-color);
      box-shadow: 0 0 0px 2px var(--main-background-hover-color);
      &::before {
        opacity: 0;
      }
    }
    &:active {
      box-shadow: none;
    }
  }
}

.custom-modal {
  width: 90%;
  max-width: 600px;
  .sync-compare {
    table {
      width: 100%;
      text-align: left;
      td {
        &.changed {
          color: var(--n-text-color-pressed, #18a058);
          font-weight: bold;
        }
      }
    }
  }
}
</style>
