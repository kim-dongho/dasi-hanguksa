export type ThemePreference = 'system' | 'light' | 'dark';
export const themeKey = 'history-theme-v1';
export function applyTheme(preference: ThemePreference) {
  const dark =
    preference === 'dark' ||
    (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
export function initializeTheme() {
  let preference: ThemePreference = 'system';
  try {
    const stored = JSON.parse(localStorage.getItem(themeKey) ?? '"system"');
    if (stored === 'light' || stored === 'dark') preference = stored;
  } catch {
    /* Fall back to the system theme when storage is unavailable. */
  }
  applyTheme(preference);
}
