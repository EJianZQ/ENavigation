# ENavigation

[中文](./README.md) | [English](./README_EN.md)
<p>
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License: GPL v3" />
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Pinia-Store-f7c02e?logo=pinia&logoColor=black" alt="Pinia" />
  <img src="https://img.shields.io/badge/PWA-enabled-5a0fc8?logo=pwa&logoColor=white" alt="PWA" />
</p>

一个基于 `Vite + Vue 3 + Pinia + Naive UI` 构建的简约起始页 / 导航页项目，支持自定义搜索引擎、快捷方式、壁纸、时间显示以及 GitHub Gist 云同步。

> [!TIP]
> 🚀 在线 Demo: [Vercel](https://e-navigation.vercel.app/) 或 [Cloudflare Pages](https://e-navigation.pages.dev/) 

<p align="center">
  <img src="./.github/assets/start-up.png" alt="ENavigation start-up preview" />
</p>

## ✨ 功能
- 🔎 多搜索引擎切换，支持自定义搜索引擎。搜索建议展示来源切换以及搜索历史

- 🔗 快捷方式管理，支持分组、置顶分组、组内排序、跨组拖拽，以及根据站点 URL 自动显示图标
- ✅ 待办事项管理
- 📝 碎碎念便签管理
- 🖼️ 自定义壁纸、[必应壁纸](https://api.dujin.org/bing/1920.php)、[随机风景壁纸](https://picsum.photos/1920/1080?random=${Date.now()})与[随机二次元壁纸](https://www.loliapi.com/acg/pc/)切换
- 🕒 时间、日期、农历的个性化显示
- 💬 定制化一言
- 🌐 全站 i18n 国际化，支持简体中文 / 繁體中文 / English 即时切换
- 🌙 夜间自动暗色模式
- 💾 本地数据持久化
- ☁️ GitHub Gist 云同步
- 📱 PWA 支持

## ⚙️ 配置

### 1. 环境变量

项目根目录下使用 `.env` 进行站点基础配置：
- `VITE_SITE_TITLE`：站点标题
- `VITE_SITE_ANTHOR`：作者信息
- `VITE_SITE_KEYWORDS`：页面关键词
- `VITE_SITE_DES`：页面描述
- `VITE_SITE_LOGO`：浏览器标签页图标
- `VITE_SITE_APPLE_LOGO`：Apple 设备图标
- `VITE_WELCOME_TEXT`：进入站点时的欢迎语

### 2. 默认配置

首次打开且本地没有缓存时，默认配置来自以下位置：

- `src/stores/setData.js`：全站设置默认值
- `src/stores/siteData.js`：业务数据默认值
- `src/assets/defaultShortCut.js`：默认快捷方式，首次会展示 `影视 / AI / 工具` 三个示例分组
- `src/assets/defaultEngine.js`：默认搜索引擎预设

### 3. 云同步配置

云同步通过 GitHub Gist 实现，需要在站点设置页中填写：

- GitHub Token
- Gist ID

<details>
  <summary>🔐 如何获取 GitHub Token 与 Gist ID</summary>

  GitHub Token 获取步骤：

  1. 登录 GitHub，进入 `Settings`
  2. 打开 `Developer settings`
  3. 进入 `Personal access tokens` -> `Fine-grained tokens`
  4. 点击 `Generate new token`
  5. `Token name` 随便填，填个直观的比如“起始页”；`Resource owner` 选择你自己的账号；`Expiration` 过期时间最好长一点
  6. 在权限设置中将 `Gists` 的用户权限设为 `Read and write`
  7. 生成后复制 Token，并妥善保存

  Gist ID 获取步骤：

  1. 打开 `https://gist.github.com/`
  2. 新建一个 Gist，推荐使用 `secret gist`
  3. 文件名可填写为 `enavigation.json`
  4. 创建完成后，浏览器地址栏会类似于：
     `https://gist.github.com/你的用户名/abcdef1234567890`
  5. 最后一段 `abcdef1234567890` 就是 Gist ID

  - 建议单独创建一个用于 ENavigation 的 Token
  - Token 只会在生成时完整显示一次
  - `secret gist` 不会显示在公开列表里，但知道链接的人仍然可以访问
</details>

> [!IMPORTANT]
> `GitHub Token`、`Gist ID`、`自动同步开关`、`是否已同步标记` 不会被同步到云端，只存储在本地。

## 🚀 部署

### 本地调试开发

```bash
npm install
npm run dev
```

默认地址：

```text
http://localhost:5588/
```

### 构建生产版本

```bash
npm run build
```

构建完成后，产物位于：

```text
dist/
```

### 本地预览生产版本

```bash
npm run preview
```

### 静态部署

这是一个前端静态项目，可以将 `dist` 目录下的产物部署到任意静态托管平台：

- GitHub Pages
- Vercel
- Cloudflare Pages
- Nginx 静态站点

如果部署到子路径而不是根路径，需要根据实际部署地址调整 `vite.config.js` 中的 `base` 配置；若部署在根路径，当前配置可直接使用。

## 🧰 技术栈

- Vue 3
- Vite
- Pinia
- pinia-plugin-persistedstate
- Naive UI
- Sass / SCSS
- vite-plugin-pwa
- vite-plugin-compression
- ESLint
- Prettier

## 🙏 来源与鸣谢

本项目基于 [imsyy/SNav](https://github.com/imsyy/SNav) 继续开发，由于原项目早已停止开发和归档，故在原项目基础上进行了重构与功能扩展，完全尊重原项目的开源协议与权利。

## 📄 License

本项目基于 GNU General Public License v3.0 进行分发与使用。
