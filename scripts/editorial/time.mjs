// Every timestamp the run writes is for the owner in Bali; UTC rides along so
// a log can be lined up with a server's.
export const EDITORIAL_TIMEZONE = "Asia/Makassar";

export function stamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EDITORIAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "";
  const local = `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
  return {
    local: `${local} ${EDITORIAL_TIMEZONE} (UTC+8)`,
    date: `${get("year")}-${get("month")}-${get("day")}`,
    utc: date.toISOString(),
  };
}
