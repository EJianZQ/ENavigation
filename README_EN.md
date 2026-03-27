# ENavigation

[中文](./README.md) | [English](./README_EN.md)
<p>
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License: GPL v3" />
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Pinia-Store-f7c02e?logo=pinia&logoColor=black" alt="Pinia" />
  <img src="https://img.shields.io/badge/PWA-enabled-5a0fc8?logo=pwa&logoColor=white" alt="PWA" />
</p>

A minimalist start page / navigation project built with `Vite + Vue 3 + Pinia + Naive UI`, featuring custom search engines, shortcuts, wallpapers, time display, and GitHub Gist cloud sync.

> [!TIP]
> 🚀 Online Demo: [Vercel](https://e-navigation.vercel.app/) or [Cloudflare Pages](https://e-navigation.pages.dev/)

<p align="center">
  <img src="./.github/assets/start-up.png" alt="ENavigation start-up preview" />
</p>

## ✨ Features
- 🔎 Multiple search engines, custom search engine support, switchable suggestion providers, and search history
- 🔗 Shortcut management with create, edit, delete, sorting, and automatic site icons based on URL
- ✅ To-do management
- 📝 Sticky note / memo management
- 🖼️ Support for custom wallpapers, [Bing wallpapers](https://api.dujin.org/bing/1920.php), [random landscape wallpapers](https://picsum.photos/1920/1080?random=${Date.now()}), and [random anime wallpapers](https://www.loliapi.com/acg/pc/)
- 🕒 Personalized time, date, and lunar calendar display
- 💬 Customizable Hitokoto quote display
- 🌐 Full-site i18n support with instant switching between Simplified Chinese, Traditional Chinese, and English
- 🌙 Automatic night dark mode
- 💾 Local data persistence
- ☁️ GitHub Gist cloud sync
- 📱 PWA support

## ⚙️ Configuration

### 1. Environment Variables

Use `.env` in the project root for basic site configuration:
- `VITE_SITE_TITLE`: Site title
- `VITE_SITE_ANTHOR`: Author info
- `VITE_SITE_KEYWORDS`: Page keywords
- `VITE_SITE_DES`: Page description
- `VITE_SITE_LOGO`: Browser tab icon
- `VITE_SITE_APPLE_LOGO`: Apple device icon
- `VITE_WELCOME_TEXT`: Welcome message shown on entry

### 2. Default Configuration

When a user opens the site for the first time with no local cache, the default configuration comes from:

- `src/stores/setData.js`: Global settings defaults
- `src/stores/siteData.js`: Business data defaults
- `src/assets/defaultShortCut.js`: Default shortcuts
- `src/assets/defaultEngine.js`: Default search engine presets

### 3. Cloud Sync Configuration

Cloud sync is implemented through GitHub Gist. Fill in the following items in the settings panel:

- GitHub Token
- Gist ID

<details>
  <summary>🔐 How to get a GitHub Token and Gist ID</summary>

  Steps to get a GitHub Token:

  1. Log in to GitHub and open `Settings`
  2. Go to `Developer settings`
  3. Open `Personal access tokens` -> `Fine-grained tokens`
  4. Click `Generate new token`
  5. Set `Token name` to anything meaningful, choose your own account for `Resource owner`, and preferably use a longer `Expiration`
  6. In permissions, set the `Gists` user permission to `Read and write`
  7. Generate the token, copy it, and save it somewhere safe

  Steps to get a Gist ID:

  1. Open `https://gist.github.com/`
  2. Create a new Gist, preferably a `secret gist`
  3. The file name can be `enavigation.json`
  4. After creation, the browser URL will look like:
     `https://gist.github.com/your-name/abcdef1234567890`
  5. The last segment, `abcdef1234567890`, is the Gist ID

  - It is recommended to create a dedicated token for ENavigation
  - A token is shown in full only once when it is created
  - A `secret gist` will not appear in public listings, but anyone with the link can still access it
</details>

> [!IMPORTANT]
> `GitHub Token`, `Gist ID`, the `auto sync` switch, and the `has synced` marker are not synced to the cloud and are stored locally only.

## 🚀 Deployment

### Local Development

```bash
npm install
npm run dev
```

Default local address:

```text
http://localhost:5588/
```

### Production Build

```bash
npm run build
```

After building, the output files are located in:

```text
dist/
```

### Preview Production Build Locally

```bash
npm run preview
```

### Static Deployment

This is a static frontend project, so the contents of `dist` can be deployed to any static hosting platform:

- GitHub Pages
- Vercel
- Cloudflare Pages
- Nginx static hosting

If you deploy under a subpath instead of the root path, update the `base` option in `vite.config.js` accordingly. If the site is deployed at the root path, the current configuration works as-is.

## 🧰 Tech Stack

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

## 🙏 Source & Acknowledgements

This project is further developed based on [imsyy/SNav](https://github.com/imsyy/SNav). Since the original project has long been archived and is no longer maintained, this repository continues the work with refactoring and feature expansion, while fully respecting the original open-source license and authorship.

## 📄 License

This project is distributed under the GNU General Public License v3.0.
