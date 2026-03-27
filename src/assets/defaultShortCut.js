import { translate } from "@/i18n";

const DEFAULT_SHORTCUT_GROUPS = [
  {
    id: 0,
    nameKey: "defaultShortcuts.groups.entertainment",
    pinned: false,
    shortcuts: [
      { id: 0, nameKey: "defaultShortcuts.items.youtube", url: "https://www.youtube.com/" },
      { id: 1, nameKey: "defaultShortcuts.items.twitch", url: "https://www.twitch.tv/" },
      { id: 2, nameKey: "defaultShortcuts.items.bilibili", url: "https://www.bilibili.com/" },
      { id: 3, nameKey: "defaultShortcuts.items.netflix", url: "https://www.netflix.com/" },
    ],
  },
  {
    id: 1,
    nameKey: "defaultShortcuts.groups.ai",
    pinned: false,
    shortcuts: [
      { id: 4, nameKey: "defaultShortcuts.items.chatgpt", url: "https://chatgpt.com/" },
      { id: 5, nameKey: "defaultShortcuts.items.gemini", url: "https://gemini.google.com/" },
      { id: 6, nameKey: "defaultShortcuts.items.grok", url: "https://grok.com/" },
      { id: 7, nameKey: "defaultShortcuts.items.claude", url: "https://claude.ai/" },
    ],
  },
  {
    id: 2,
    nameKey: "defaultShortcuts.groups.tools",
    pinned: false,
    shortcuts: [
      {
        id: 8,
        nameKey: "defaultShortcuts.items.googleTranslate",
        url: "https://translate.google.com/",
      },
      { id: 9, nameKey: "defaultShortcuts.items.deepl", url: "https://www.deepl.com/translator" },
      { id: 10, nameKey: "defaultShortcuts.items.amazon", url: "https://www.amazon.com/" },
      { id: 11, nameKey: "defaultShortcuts.items.taobao", url: "https://www.taobao.com/" },
    ],
  },
];

export const getDefaultShortcuts = (locale) =>
  DEFAULT_SHORTCUT_GROUPS.map((group) => ({
    id: group.id,
    name: translate(group.nameKey, {}, locale),
    pinned: group.pinned,
    shortcuts: group.shortcuts.map((item) => ({
      id: item.id,
      name: translate(item.nameKey, {}, locale),
      url: item.url,
    })),
  }));
