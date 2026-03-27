import { translate } from "@/i18n";

const DEFAULT_SHORTCUTS = [
  { id: 0, nameKey: "defaultShortcuts.translation", url: "https://www.deepl.com/translator" },
  { id: 1, nameKey: "defaultShortcuts.map", url: "https://ditu.amap.com/" },
  { id: 2, nameKey: "defaultShortcuts.images", url: "https://www.pexels.com/" },
  { id: 3, nameKey: "defaultShortcuts.drive", url: "https://www.aliyundrive.com/drive/" },
  { id: 4, nameKey: "defaultShortcuts.cloudflare", url: "https://dash.cloudflare.com/" },
  { id: 5, nameKey: "defaultShortcuts.mail", url: "https://mail.qq.com/" },
  { id: 6, nameKey: "defaultShortcuts.github", url: "https://github.com/" },
  { id: 7, nameKey: "defaultShortcuts.bilibili", url: "https://www.bilibili.com/" },
];

export const getDefaultShortcuts = (locale) =>
  DEFAULT_SHORTCUTS.map((item) => ({
    id: item.id,
    name: translate(item.nameKey, {}, locale),
    url: item.url,
  }));
