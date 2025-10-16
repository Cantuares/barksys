import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a date string to YYYY-MM-DD format
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'yyyy-MM-dd');
    }
    // Fallback: try to parse as regular Date
    const fallbackDate = new Date(dateString);
    if (isValid(fallbackDate)) {
      return format(fallbackDate, 'yyyy-MM-dd');
    }
    return dateString; // Return original if all parsing fails
  } catch {
    return dateString; // Return original string if parsing fails
  }
};

/**
 * Format a date string to a more readable format (e.g., "Oct 20, 2025")
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string in readable format
 */
export const formatReadableDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'MMM dd, yyyy');
    }
    // Fallback: try to parse as regular Date
    const fallbackDate = new Date(dateString);
    if (isValid(fallbackDate)) {
      return format(fallbackDate, 'MMM dd, yyyy');
    }
    return dateString; // Return original if all parsing fails
  } catch {
    return dateString; // Return original string if parsing fails
  }
};

/**
 * Format a date string to short format (e.g., "20/10/2025")
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string in short format
 */
export const formatShortDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'dd/MM/yyyy');
    }
    // Fallback: try to parse as regular Date
    const fallbackDate = new Date(dateString);
    if (isValid(fallbackDate)) {
      return format(fallbackDate, 'dd/MM/yyyy');
    }
    return dateString; // Return original if all parsing fails
  } catch {
    return dateString; // Return original string if parsing fails
  }
};

/**
 * Format a date string to time format (e.g., "10:00 AM")
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted time string
 */
export const formatTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'HH:mm');
    }
    // Fallback: try to parse as regular Date
    const fallbackDate = new Date(dateString);
    if (isValid(fallbackDate)) {
      return format(fallbackDate, 'HH:mm');
    }
    return dateString; // Return original if all parsing fails
  } catch {
    return dateString; // Return original string if parsing fails
  }
};

/**
 * Format currency value
 * @param value - Numeric value to format
 * @param currency - Currency code (default: 'EUR')
 * @param locale - Locale string (default: 'pt-PT')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number, 
  currency: string = 'EUR', 
  locale: string = 'pt-PT'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value);
};

/**
 * Check if a date string is valid
 * @param dateString - Date string to validate
 * @returns True if date is valid, false otherwise
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
};
