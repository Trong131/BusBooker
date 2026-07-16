import { STORAGE_KEYS } from "../constants";

/**
 * Get item from localStorage
 */
export const getStorageItem = <T = any>(
  key: string,
  defaultValue: T | null = null
): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Set item to localStorage
 */
export const setStorageItem = (
  key: string,
  value: string | object | null | undefined
): void => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(
        key,
        typeof value === "string" ? value : JSON.stringify(value)
      );
    }
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
};

/**
 * Clear all booking-related storage items
 * Note: START_TIME and END_TIME are no longer used for search state (now using URL params)
 * but kept here for backward compatibility if needed
 */
export const clearBookingStorage = (): void => {
  removeStorageItem(STORAGE_KEYS.CHIEU_DI);
  removeStorageItem(STORAGE_KEYS.GIA_CHIEU_DI);
  removeStorageItem(STORAGE_KEYS.CHIEU_VE);
  removeStorageItem(STORAGE_KEYS.GIA_CHIEU_VE);
  removeStorageItem(STORAGE_KEYS.CLICK_COUNT);
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Set access token to localStorage
 */
export const setAccessToken = (token: string): void => {
  setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

/**
 * Remove access token from localStorage
 */
export const removeAccessToken = (): void => {
  removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
};
