// localStorage wrapper for the PS Intake Tool.
// Every read goes through `readKey` and every write through `writeKey` so
// JSON parse / stringify and error handling are centralized in one place.

import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_RICE_CONFIG,
  STORAGE_KEYS,
} from "./constants.js";

function readKey(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to read ${key} from localStorage`, err);
    return fallback;
  }
}

// Returns true when an exception thrown by `setItem` is the browser's
// "you're out of space" signal. Different browsers pick different error
// names / codes for this, so we check several.
function isQuotaError(err) {
  if (!err) return false;
  return (
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    err.code === 22 ||
    err.code === 1014
  );
}

function writeKey(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (isQuotaError(err)) {
      console.error(
        `localStorage is full while writing ${key}. ` +
          `Documents are stored as data URLs and the browser cap is ~5 MB total.`,
        err,
      );
      // Notify any UI that wants to show a banner. AppLayout subscribes.
      try {
        window.dispatchEvent(
          new CustomEvent("ps:storage-quota-exceeded", {
            detail: { key },
          }),
        );
      } catch {
        // dispatchEvent shouldn't throw, but never let storage take down the app.
      }
      return;
    }
    console.error(`Failed to write ${key} to localStorage`, err);
  }
}

function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.error(`Failed to remove ${key} from localStorage`, err);
  }
}

// Cases
export function getCases() {
  return readKey(STORAGE_KEYS.CASES, []);
}
export function setCases(cases) {
  writeKey(STORAGE_KEYS.CASES, cases);
}

// Counter — only ever increments, never resets even when cases are deleted.
export function getCounter() {
  return readKey(STORAGE_KEYS.COUNTER, 0);
}
export function setCounter(n) {
  writeKey(STORAGE_KEYS.COUNTER, n);
}

// RICE config
export function getRiceConfig() {
  return { ...DEFAULT_RICE_CONFIG, ...readKey(STORAGE_KEYS.RICE_CONFIG, {}) };
}
export function setRiceConfig(cfg) {
  writeKey(STORAGE_KEYS.RICE_CONFIG, cfg);
}

// App settings (display preferences)
export function getAppSettings() {
  return { ...DEFAULT_APP_SETTINGS, ...readKey(STORAGE_KEYS.APP_SETTINGS, {}) };
}
export function setAppSettings(settings) {
  writeKey(STORAGE_KEYS.APP_SETTINGS, settings);
}

// Current role / user
export function getRole() {
  return readKey(STORAGE_KEYS.CURRENT_ROLE, null);
}
export function setRole(role) {
  writeKey(STORAGE_KEYS.CURRENT_ROLE, role);
}
export function getUserName() {
  return readKey(STORAGE_KEYS.CURRENT_USER_NAME, null);
}
export function setUserName(name) {
  writeKey(STORAGE_KEYS.CURRENT_USER_NAME, name);
}

// Nukes every PS Intake Tool key. Used by Settings -> Clear All Data.
export function clearAll() {
  Object.values(STORAGE_KEYS).forEach((k) => removeKey(k));
}

// True when no cases exist yet — used to trigger seeding on first load.
export function isStorageEmpty() {
  return readKey(STORAGE_KEYS.CASES, null) == null;
}
