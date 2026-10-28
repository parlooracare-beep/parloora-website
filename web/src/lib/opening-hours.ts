export interface DaySchedule {
  open?: string;
  close?: string;
  closed?: boolean;
}

export type OpeningHoursData = Record<string, DaySchedule>;

export interface OpeningStatusResult {
  isOpen: boolean;
  statusLabel: string;
  todayHoursText: string;
  scheduleList: Array<{
    day: string;
    dayKey: string;
    hoursText: string;
    isToday: boolean;
    closed: boolean;
  }>;
}

const DAYS_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime12h(timeStr?: string): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  // If already contains AM/PM
  if (/am|pm/i.test(trimmed)) return trimmed;

  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const minute = parts[1].padStart(2, "0");
    if (isNaN(hour)) return trimmed;
    const period = hour >= 12 ? "PM" : "AM";
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return `${hour}:${minute} ${period}`;
  }
  return trimmed;
}

function parseTimeToDecimal(timeStr?: string): number | null {
  if (!timeStr) return null;
  const ampm = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!ampm) return null;
  let hour = parseInt(ampm[1], 10);
  const min = parseInt(ampm[2], 10);
  const period = ampm[3]?.toUpperCase();

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;
  return hour + min / 60;
}

export function getParlourOpeningStatus(
  rawOpeningHours: unknown,
  fallbackActive = true
): OpeningStatusResult {
  let openingHours: OpeningHoursData = {};

  if (typeof rawOpeningHours === "string") {
    try {
      openingHours = JSON.parse(rawOpeningHours);
    } catch {
      openingHours = {};
    }
  } else if (rawOpeningHours && typeof rawOpeningHours === "object") {
    openingHours = rawOpeningHours as OpeningHoursData;
  }

  // Get current day and time in Bangladesh (Asia/Dhaka timezone: UTC+6)
  const now = new Date();
  const bdTimeString = now.toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  // Extract Bangladesh current day
  const bdDayMatch = bdTimeString.match(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/i);
  const currentDayName = bdDayMatch ? bdDayMatch[1] : DAYS_ORDER[now.getDay()];

  // Extract current time in decimal (e.g. 14.5 for 2:30 PM)
  const timeMatch = bdTimeString.match(/(\d{1,2}):(\d{2})/);
  const currentDecimalTime = timeMatch
    ? parseInt(timeMatch[1], 10) + parseInt(timeMatch[2], 10) / 60
    : now.getHours() + now.getMinutes() / 60;

  const hasConfiguredDays = Object.keys(openingHours).length > 0;

  const scheduleList = DAYS_ORDER.map((day) => {
    const isToday = day.toLowerCase() === currentDayName.toLowerCase();
    const dayData = openingHours[day] || openingHours[day.toLowerCase()];

    if (!dayData || dayData.closed) {
      return {
        day,
        dayKey: day,
        hoursText: "Closed",
        isToday,
        closed: true,
      };
    }

    const openFormatted = formatTime12h(dayData.open || "09:00");
    const closeFormatted = formatTime12h(dayData.close || "18:00");

    return {
      day,
      dayKey: day,
      hoursText: `${openFormatted} – ${closeFormatted}`,
      isToday,
      closed: false,
    };
  });

  if (!hasConfiguredDays) {
    // If no schedule configured, fallback to standard operating hours if parlour is active
    return {
      isOpen: fallbackActive,
      statusLabel: fallbackActive ? "Open Now" : "Closed",
      todayHoursText: fallbackActive ? "10:00 AM – 8:00 PM" : "Closed",
      scheduleList: DAYS_ORDER.map((day) => ({
        day,
        dayKey: day,
        hoursText: "10:00 AM – 8:00 PM",
        isToday: day.toLowerCase() === currentDayName.toLowerCase(),
        closed: false,
      })),
    };
  }

  const todaySchedule = openingHours[currentDayName] || openingHours[currentDayName.toLowerCase()];

  if (!todaySchedule || todaySchedule.closed) {
    return {
      isOpen: false,
      statusLabel: "Closed",
      todayHoursText: "Closed Today",
      scheduleList,
    };
  }

  const openDec = parseTimeToDecimal(todaySchedule.open || "09:00") ?? 9;
  const closeDec = parseTimeToDecimal(todaySchedule.close || "18:00") ?? 18;

  const isOpen = currentDecimalTime >= openDec && currentDecimalTime < closeDec;
  const todayOpenFormatted = formatTime12h(todaySchedule.open || "09:00");
  const todayCloseFormatted = formatTime12h(todaySchedule.close || "18:00");

  return {
    isOpen,
    statusLabel: isOpen ? "Open Now" : "Closed",
    todayHoursText: `${todayOpenFormatted} – ${todayCloseFormatted}`,
    scheduleList,
  };
}
