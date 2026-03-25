const EXCLUDED_SYNC_SETTING_KEYS = ["githubToken", "gistId", "autoSync", "hasSynced"];

export const shouldSkipSyncSetting = (key) => EXCLUDED_SYNC_SETTING_KEYS.includes(key);

export const buildSyncSettings = (settingsState = {}) => {
  const settings = {};
  for (const key of Object.keys(settingsState)) {
    if (!shouldSkipSyncSetting(key)) {
      settings[key] = settingsState[key];
    }
  }
  return settings;
};

export const buildSyncPayload = (settingsState = {}, siteState = {}) => {
  return {
    todoData: siteState.todoData,
    noteData: siteState.noteData,
    shortcutData: siteState.shortcutData,
    searchHistory: siteState.searchHistory,
    settings: buildSyncSettings(settingsState),
  };
};
