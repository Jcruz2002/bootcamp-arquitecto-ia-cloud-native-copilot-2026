const TOKEN_KEY = "lab05_jwt";
const FLASH_KEY = "lab05_flash";

export const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token || "");
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function setFlashMessage(message, type = "ok") {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, type }));
}

export function consumeFlashMessage() {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(FLASH_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(FLASH_KEY);

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
