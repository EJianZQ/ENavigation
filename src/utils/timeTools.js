import LunarCalendar from "lunar-calendar";

const WEEKDAY_LABELS = {
  "zh-CN": ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  "zh-TW": ["週日", "週一", "週二", "週三", "週四", "週五", "週六"],
  "en-US": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const AM_PM_LABELS = {
  "zh-CN": { am: "上午", pm: "下午" },
  "zh-TW": { am: "上午", pm: "下午" },
  "en-US": { am: "AM", pm: "PM" },
};

const GREETINGS = {
  "zh-CN": {
    dawn: "凌晨好",
    morning: "早上好",
    forenoon: "上午好",
    afternoon: "下午好",
    dusk: "傍晚好",
    evening: "晚上好",
    lateNight: "夜深了",
  },
  "zh-TW": {
    dawn: "凌晨好",
    morning: "早安",
    forenoon: "上午好",
    afternoon: "下午好",
    dusk: "傍晚好",
    evening: "晚上好",
    lateNight: "夜深了",
  },
  "en-US": {
    dawn: "Good early morning",
    morning: "Good morning",
    forenoon: "Good day",
    afternoon: "Good afternoon",
    dusk: "Good evening",
    evening: "Good evening",
    lateNight: "Working late tonight",
  },
};

const LUNAR_MONTH_NAMES_EN = [
  "",
  "First Month",
  "Second Month",
  "Third Month",
  "Fourth Month",
  "Fifth Month",
  "Sixth Month",
  "Seventh Month",
  "Eighth Month",
  "Ninth Month",
  "Tenth Month",
  "Eleventh Month",
  "Twelfth Month",
];

const LUNAR_DAY_NAMES_EN = [
  "",
  "First Day",
  "Second Day",
  "Third Day",
  "Fourth Day",
  "Fifth Day",
  "Sixth Day",
  "Seventh Day",
  "Eighth Day",
  "Ninth Day",
  "Tenth Day",
  "Eleventh Day",
  "Twelfth Day",
  "Thirteenth Day",
  "Fourteenth Day",
  "Fifteenth Day",
  "Sixteenth Day",
  "Seventeenth Day",
  "Eighteenth Day",
  "Nineteenth Day",
  "Twentieth Day",
  "Twenty-first Day",
  "Twenty-second Day",
  "Twenty-third Day",
  "Twenty-fourth Day",
  "Twenty-fifth Day",
  "Twenty-sixth Day",
  "Twenty-seventh Day",
  "Twenty-eighth Day",
  "Twenty-ninth Day",
  "Thirtieth Day",
];

const ZODIAC_NAMES_EN = {
  鼠: "Rat",
  牛: "Ox",
  虎: "Tiger",
  兔: "Rabbit",
  龙: "Dragon",
  蛇: "Snake",
  马: "Horse",
  羊: "Goat",
  猴: "Monkey",
  鸡: "Rooster",
  狗: "Dog",
  猪: "Pig",
};

const normalizeLocale = (locale = "zh-CN") => {
  const normalized = String(locale).trim().toLowerCase();
  if (
    normalized.startsWith("zh-tw") ||
    normalized.startsWith("zh-hk") ||
    normalized.startsWith("zh-mo")
  ) {
    return "zh-TW";
  }
  if (normalized.startsWith("en")) {
    return "en-US";
  }
  return "zh-CN";
};

const formatNumber = (value, withZero = true) => {
  if (!withZero) return String(value);
  return String(value).padStart(2, "0");
};

const format12Hour = (hour) => (hour % 12 === 0 ? 12 : hour % 12);

const formatDateLabel = (date, locale) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (locale === "en-US") {
    return `${month}/${day}`;
  }
  return `${month}月${day}日`;
};

const formatWeekday = (date, locale) => {
  return WEEKDAY_LABELS[locale]?.[date.getDay()] || WEEKDAY_LABELS["zh-CN"][date.getDay()];
};

const formatAmPm = (hour, locale) => {
  const key = hour >= 12 ? "pm" : "am";
  return AM_PM_LABELS[locale]?.[key] || AM_PM_LABELS["zh-CN"][key];
};

const formatLunarText = (lunar, locale) => {
  if (locale !== "en-US") {
    return `${lunar.GanZhiYear}年${lunar.lunarMonthName}${lunar.lunarDayName}`;
  }
  const monthName = LUNAR_MONTH_NAMES_EN[lunar.lunarMonth] || `Month ${lunar.lunarMonth}`;
  const dayName = LUNAR_DAY_NAMES_EN[lunar.lunarDay] || `Day ${lunar.lunarDay}`;
  const zodiac = ZODIAC_NAMES_EN[lunar.zodiac] || "Chinese Zodiac";
  const isLeapMonth = lunar.lunarLeapMonth === lunar.lunarMonth;
  return `${isLeapMonth ? "Leap " : ""}${monthName}, ${dayName} · Year of the ${zodiac}`;
};

/**
 * 获取当前时间
 * @returns {Object} 时间对象
 */
export const getCurrentTime = (showZero = true, use12Hour = false, locale = "zh-CN") => {
  try {
    const currentLocale = normalizeLocale(locale);
    const time = new Date();
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    let hour = time.getHours();
    let amPm = "";

    if (use12Hour) {
      hour = format12Hour(hour);
      amPm = formatAmPm(time.getHours(), currentLocale);
    }

    const lunar = LunarCalendar.solarToLunar(year, month, day);

    return {
      year,
      month,
      day,
      dateLabel: formatDateLabel(time, currentLocale),
      hour: showZero ? formatNumber(hour) : String(hour),
      minute: formatNumber(time.getMinutes()),
      second: formatNumber(time.getSeconds()),
      weekday: formatWeekday(time, currentLocale),
      amPm,
      lunar: {
        data: lunar,
        year: lunar.lunarYear,
        month: lunar.lunarMonthName,
        day: lunar.lunarDayName,
        GanZhiYear: lunar.GanZhiYear,
        GanZhiMonth: lunar.GanZhiMonth,
        GanZhiDay: lunar.GanZhiDay,
        text: lunar.lunarMonthName + lunar.lunarDayName,
        localizedText: formatLunarText(lunar, currentLocale),
      },
    };
  } catch (error) {
    console.error("时间获取出错：" + error);
    return {};
  }
};

/**
 * 根据实时时间返回不同的问候语
 * @returns {string} 问候语
 */
export const getGreeting = (locale = "zh-CN") => {
  const currentLocale = normalizeLocale(locale);
  const labels = GREETINGS[currentLocale] || GREETINGS["zh-CN"];
  const currentHour = new Date().getHours();

  if (currentHour >= 6 && currentHour < 9) {
    return labels.morning;
  }
  if (currentHour >= 9 && currentHour < 12) {
    return labels.forenoon;
  }
  if (currentHour >= 12 && currentHour < 18) {
    return labels.afternoon;
  }
  if (currentHour >= 18 && currentHour < 20) {
    return labels.dusk;
  }
  if (currentHour >= 20 && currentHour < 24) {
    return labels.evening;
  }
  if (currentHour >= 4 && currentHour < 6) {
    return labels.dawn;
  }
  return labels.lateNight;
};

/**
 * 获取当前夜间自动暗色使用的日期标识
 * 由于夜间时段定义为 0:00 ~ 5:00，因此直接使用本地自然日即可区分“这一晚”
 * @returns {string} 日期标识，例如 2026-03-25
 */
export const getNightModeDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
