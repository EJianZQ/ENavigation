import { getNightModeDateKey } from "@/utils/timeTools";

export const COMMAND_GROUP_ORDER = ["navigation", "create", "language", "appearance"];
export const BOX_TAB_NAMES = {
  shortcuts: "shortcuts",
  notes: "notes",
  todos: "todos",
};
export const BOX_PENDING_ACTIONS = {
  createShortcut: "createShortcut",
  createNote: "createNote",
  focusTodoInput: "focusTodoInput",
};

const WALLPAPER_TYPE_COMMANDS = [
  { value: 0, translationKey: "local" },
  { value: 1, translationKey: "bing" },
  { value: 2, translationKey: "landscape" },
  { value: 3, translationKey: "anime" },
];

const getKeywordList = (tm, key) => {
  const values = tm(key);
  return Array.isArray(values) ? values.filter(Boolean).map((item) => String(item)) : [];
};

export const getEffectiveThemeType = (set, status) => {
  if (status.nightModeActive) {
    return status.tempThemeOverride || "dark";
  }
  return set.themeType;
};

export const applyThemeTypeSelection = (targetTheme, set, status) => {
  if (status.nightModeActive) {
    if (targetTheme === "dark") {
      status.setTempThemeOverride("");
      status.setTempThemeOverrideNightKey("");
      return;
    }
    status.setTempThemeOverride(targetTheme);
    status.setTempThemeOverrideNightKey(getNightModeDateKey());
    return;
  }
  set.themeType = targetTheme;
};

export const getCommandPaletteBaseStatus = (status) => {
  return status.siteStatus === "command" ? status.commandPreviousStatus : status.siteStatus;
};

export const createCommandPaletteCommands = ({
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
}) => {
  const currentStatus = getCommandPaletteBaseStatus(status);
  const currentThemeType = getEffectiveThemeType(set, status);
  const commands = [
    {
      id: "open-search",
      group: "navigation",
      title: t("commandPalette.commands.openSearch.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.openSearch.keywords"),
      visible: currentStatus !== "focus",
      run: openSearch,
    },
    {
      id: "open-settings",
      group: "navigation",
      title: t("commandPalette.commands.openSettings.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.openSettings.keywords"),
      visible: currentStatus !== "set",
      run: openSettings,
    },
    {
      id: "open-toolbox",
      group: "navigation",
      title: t("commandPalette.commands.openToolbox.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.openToolbox.keywords"),
      visible: currentStatus !== "box",
      run: openBox,
    },
    {
      id: "go-home",
      group: "navigation",
      title: t("commandPalette.commands.goHome.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.goHome.keywords"),
      visible: currentStatus !== "normal",
      run: goHome,
    },
    {
      id: "create-shortcut",
      group: "create",
      title: t("commandPalette.commands.createShortcut.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.createShortcut.keywords"),
      visible: true,
      run: openCreateShortcut,
    },
    {
      id: "create-note",
      group: "create",
      title: t("commandPalette.commands.createNote.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.createNote.keywords"),
      visible: true,
      run: openCreateNote,
    },
    {
      id: "create-todo",
      group: "create",
      title: t("commandPalette.commands.createTodo.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.createTodo.keywords"),
      visible: true,
      run: openCreateTodo,
    },
    {
      id: "language-zh-cn",
      group: "language",
      title: t("commandPalette.commands.languageZhCN.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.languageZhCN.keywords"),
      visible: set.language !== "zh-CN",
      run: () => switchLanguage("zh-CN"),
    },
    {
      id: "language-zh-tw",
      group: "language",
      title: t("commandPalette.commands.languageZhTW.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.languageZhTW.keywords"),
      visible: set.language !== "zh-TW",
      run: () => switchLanguage("zh-TW"),
    },
    {
      id: "language-en-us",
      group: "language",
      title: t("commandPalette.commands.languageEnUS.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.languageEnUS.keywords"),
      visible: set.language !== "en-US",
      run: () => switchLanguage("en-US"),
    },
    {
      id: "theme-light",
      group: "appearance",
      title: t("commandPalette.commands.themeLight.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.themeLight.keywords"),
      visible: currentThemeType !== "light",
      run: () => switchTheme("light"),
    },
    {
      id: "theme-dark",
      group: "appearance",
      title: t("commandPalette.commands.themeDark.title"),
      keywords: getKeywordList(tm, "commandPalette.commands.themeDark.keywords"),
      visible: currentThemeType !== "dark",
      run: () => switchTheme("dark"),
    },
    {
      id: set.autoNightMode ? "disable-auto-night" : "enable-auto-night",
      group: "appearance",
      title: set.autoNightMode
        ? t("commandPalette.commands.disableAutoNight.title")
        : t("commandPalette.commands.enableAutoNight.title"),
      keywords: set.autoNightMode
        ? getKeywordList(tm, "commandPalette.commands.disableAutoNight.keywords")
        : getKeywordList(tm, "commandPalette.commands.enableAutoNight.keywords"),
      visible: true,
      run: toggleAutoNightMode,
    },
    ...WALLPAPER_TYPE_COMMANDS.map((item) => ({
      id: `wallpaper-${item.translationKey}`,
      group: "appearance",
      title: t(`commandPalette.commands.wallpaper.${item.translationKey}.title`),
      keywords: getKeywordList(
        tm,
        `commandPalette.commands.wallpaper.${item.translationKey}.keywords`,
      ),
      visible: set.backgroundType !== item.value,
      run: () => switchWallpaper(item.value),
    })),
  ];

  return commands
    .filter((item) => item.visible)
    .map((item) => ({
      ...item,
      groupLabel: t(`commandPalette.groups.${item.group}`),
    }));
};
