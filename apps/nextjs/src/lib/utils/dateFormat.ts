import dayjs from 'dayjs';
import 'dayjs/locale/es-mx'; // Import Mexican Spanish locale
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

// Set Mexican Spanish as default locale
dayjs.locale('es-mx');

/**
 * Format a date to Mexican format (DD/MM/YYYY)
 * @param date - Date string or Date object
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateMX = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  return dayjs(date).format('DD/MM/YYYY');
};

/**
 * Format a date to long Mexican format (e.g., "4 de noviembre de 2025")
 * @param date - Date string or Date object
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateLongMX = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  return dayjs(date).format('D [de] MMMM [de] YYYY');
};

/**
 * Format a date with time in Mexican format (DD/MM/YYYY HH:mm)
 * @param date - Date string or Date object
 * @returns Formatted date-time string or empty string if invalid
 */
export const formatDateTimeMX = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

/**
 * Format a date to ISO format (YYYY-MM-DD) for database storage
 * @param date - Date string or Date object
 * @returns ISO formatted date string or empty string if invalid
 */
export const formatDateISO = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * Format a date for HTML date input fields (YYYY-MM-DD)
 * Ensures the date is properly formatted for <input type="date">
 * @param date - Date string or Date object
 * @returns Formatted date string for input or empty string if invalid
 */
export const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const parsedDate = dayjs(date);
  if (!parsedDate.isValid()) return '';
  return parsedDate.format('YYYY-MM-DD');
};

/**
 * Get relative time in Spanish (e.g., "hace 2 días")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const getRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

// Export dayjs instance configured with Mexican locale
export { dayjs };
