const isPlainObject = (value) => Object.prototype.toString.call(value) === "[object Object]";

const toSafeString = (value) => (typeof value === "string" ? value.trim() : "");

const padNumber = (value) => String(value).padStart(2, "0");

const toLocalDateString = (date) =>
  `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;

const parseLocalDateString = (value) => {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const getNextTodoId = (usedIds, preferredId) => {
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

const normalizeTodoDeadline = (value, context) => {
  if (value == null || value === "") {
    return "";
  }

  const parsedDate = parseLocalDateString(value);
  if (parsedDate) {
    return toLocalDateString(parsedDate);
  }

  if (context.strict) {
    throw new Error("Todo deadline is invalid");
  }

  return "";
};

export const normalizeTodoData = (rawData, options = {}) => {
  const context = {
    strict: Boolean(options.strict),
    usedIds: new Set(),
  };

  if (rawData == null) return [];
  if (!Array.isArray(rawData)) {
    if (context.strict) throw new Error("Todo data must be an array");
    return [];
  }

  const normalized = [];
  for (const item of rawData) {
    if (!isPlainObject(item)) {
      if (context.strict) throw new Error("Invalid todo item");
      continue;
    }

    const text = toSafeString(item.text);
    if (!text) {
      if (context.strict) throw new Error("Todo item is missing text");
      continue;
    }

    normalized.push({
      id: getNextTodoId(context.usedIds, item.id),
      text,
      done: Boolean(item.done),
      deadline: normalizeTodoDeadline(item.deadline, context),
    });
  }

  return normalized;
};

export const formatTodoDeadline = (deadline, locale) => {
  if (!deadline) return "";
  const parsedDate = parseLocalDateString(deadline);
  if (!parsedDate) return deadline;

  return new Intl.DateTimeFormat(locale || "zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
};

export const getTodoDeadlineState = (deadline, baseDate = new Date()) => {
  if (!deadline) return "none";
  const parsedDate = parseLocalDateString(deadline);
  if (!parsedDate) return "none";

  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  if (parsedDate.getTime() < today.getTime()) return "overdue";
  if (parsedDate.getTime() === today.getTime()) return "today";
  return "upcoming";
};
