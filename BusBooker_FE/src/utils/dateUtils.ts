import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

/**
 * Format date to Vietnamese locale date string
 * Parse as UTC (from BE) and format in Vietnam timezone
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
};

/**
 * Format time to HH:mm format
 * Parse as UTC (from BE) and format in Vietnam timezone
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  return dayjs(date).format("HH:mm");
};

/**
 * Format time from UTC database (BE returns UTC)
 * Same as formatTime - both parse as UTC
 */
export const formatTimeFromDB = (
  date: string | Date | null | undefined
): string => {
  return formatTime(date);
};

/**
 * Format date to YYYY-MM-DD format for API (date only, no time)
 */
export const formatDateForAPI = (
  date: string | Date | Dayjs | null | undefined
): string => {
  if (!date) return "";
  const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
  return dateObj.format("YYYY-MM-DD");
};

/**
 * Format date and time to ISO string for API
 * Uses utc(true) to keep local time but format as UTC (same as admin-panel)
 * Example: User selects 8:00 AM Vietnam time -> sends "2025-01-15T08:00:00Z" (keeps 8:00, not converted)
 */
export const formatDateTimeForAPI = (
  date: string | Date | Dayjs | null | undefined,
  keepLocalTime: boolean = true
): string => {
  if (!date) return "";
  const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
  return dateObj.utc(keepLocalTime).format();
};

/**
 * Format date and time together
 */
export const formatDateTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return "";
  return `${formatDate(date)} - ${formatTime(date)}`;
};

/**
 * Check if date is in the past
 */
export const isDateDisabled = (current: Dayjs | null): boolean => {
  return current ? current < dayjs().endOf("day") : false;
};

/**
 * Get default date (tomorrow)
 */
export const getDefaultDate = (): Dayjs => {
  return dayjs().add(1, "day");
};
