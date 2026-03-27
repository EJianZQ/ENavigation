import { resolveInitialLocale, translate } from "@/i18n";

const isPlainObject = (value) => Object.prototype.toString.call(value) === "[object Object]";

const toSafeString = (value) => (typeof value === "string" ? value.trim() : "");

const hasShortcutGroupMarker = (value) =>
  isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, "shortcuts");

const looksLikeGroupEntry = (value) => hasShortcutGroupMarker(value) && Array.isArray(value.shortcuts);

const looksLikeLegacyShortcutEntry = (value) =>
  isPlainObject(value) &&
  !hasShortcutGroupMarker(value) &&
  (Object.prototype.hasOwnProperty.call(value, "id") ||
    Object.prototype.hasOwnProperty.call(value, "name") ||
    Object.prototype.hasOwnProperty.call(value, "url"));

const getDefaultShortcutGroupName = (locale) =>
  translate("defaultShortcuts.defaultGroup", {}, locale || resolveInitialLocale());

const getNextNumericId = (usedIds, preferredId) => {
  if (Number.isInteger(preferredId) && preferredId >= 0 && !usedIds.has(preferredId)) {
    usedIds.add(preferredId);
    return preferredId;
  }

  let nextId = 0;
  while (usedIds.has(nextId)) {
    nextId += 1;
  }
  usedIds.add(nextId);
  return nextId;
};

const normalizeShortcutItem = (value, context) => {
  if (!isPlainObject(value)) {
    if (context.strict) throw new Error("Invalid shortcut item");
    return null;
  }

  const name = toSafeString(value.name);
  const url = toSafeString(value.url);

  if (!name || !url) {
    if (context.strict) throw new Error("Shortcut item is missing required fields");
    return null;
  }

  return {
    id: getNextNumericId(context.usedShortcutIds, value.id),
    name,
    url,
  };
};

const normalizeShortcutItems = (items, context) => {
  if (!Array.isArray(items)) {
    if (context.strict) throw new Error("Shortcut items must be an array");
    return [];
  }

  const normalized = [];
  for (const item of items) {
    const nextItem = normalizeShortcutItem(item, context);
    if (nextItem) normalized.push(nextItem);
  }
  return normalized;
};

const createLegacyShortcutGroup = (items, locale, context) => {
  const shortcuts = normalizeShortcutItems(items, context);
  if (!shortcuts.length) return null;

  return {
    id: getNextNumericId(context.usedGroupIds, 0),
    name: getDefaultShortcutGroupName(locale),
    pinned: false,
    shortcuts,
  };
};

const normalizeShortcutGroup = (group, locale, context) => {
  if (!isPlainObject(group)) {
    if (context.strict) throw new Error("Invalid shortcut group");
    return null;
  }

  const name = toSafeString(group.name) || getDefaultShortcutGroupName(locale);
  const shortcuts = normalizeShortcutItems(group.shortcuts, context);

  return {
    id: getNextNumericId(context.usedGroupIds, group.id),
    name,
    pinned: Boolean(group.pinned),
    shortcuts,
  };
};

const sortShortcutGroups = (groups) => {
  const pinnedGroups = groups.filter((group) => group.pinned);
  const regularGroups = groups.filter((group) => !group.pinned);
  return [...pinnedGroups, ...regularGroups];
};

export const normalizeShortcutData = (rawData, options = {}) => {
  const locale = options.locale || resolveInitialLocale();
  const context = {
    strict: Boolean(options.strict),
    usedGroupIds: new Set(),
    usedShortcutIds: new Set(),
  };

  if (rawData == null) return [];
  if (!Array.isArray(rawData)) {
    if (context.strict) throw new Error("Shortcut data must be an array");
    return [];
  }
  if (!rawData.length) return [];

  const groupEntries = [];
  const legacyItems = [];

  for (const item of rawData) {
    if (looksLikeGroupEntry(item)) {
      groupEntries.push(item);
      continue;
    }

    if (hasShortcutGroupMarker(item)) {
      if (context.strict) throw new Error("Shortcut group shortcuts must be an array");
      continue;
    }

    if (looksLikeLegacyShortcutEntry(item)) {
      legacyItems.push(item);
      continue;
    }

    if (context.strict) {
      throw new Error("Invalid shortcut data entry");
    }
  }

  if (context.strict && groupEntries.length && legacyItems.length) {
    throw new Error("Mixed shortcut data formats are not supported");
  }

  const normalizedGroups = [];

  if (legacyItems.length) {
    const legacyGroup = createLegacyShortcutGroup(legacyItems, locale, context);
    if (legacyGroup) normalizedGroups.push(legacyGroup);
  }

  for (const group of groupEntries) {
    const nextGroup = normalizeShortcutGroup(group, locale, context);
    if (nextGroup) normalizedGroups.push(nextGroup);
  }

  return sortShortcutGroups(normalizedGroups);
};

export const getShortcutStats = (shortcutData = []) => {
  const normalized = normalizeShortcutData(shortcutData);
  return {
    groupCount: normalized.length,
    shortcutCount: normalized.reduce((total, group) => total + group.shortcuts.length, 0),
  };
};

export const getFlatShortcutItems = (shortcutData = []) => {
  const normalized = normalizeShortcutData(shortcutData);
  return normalized.flatMap((group) => group.shortcuts);
};

export const getNextShortcutGroupId = (shortcutData = []) => {
  return normalizeShortcutData(shortcutData).reduce((maxId, group) => Math.max(maxId, group.id), -1) + 1;
};

export const getNextShortcutItemId = (shortcutData = []) => {
  return getFlatShortcutItems(shortcutData).reduce((maxId, item) => Math.max(maxId, item.id), -1) + 1;
};
