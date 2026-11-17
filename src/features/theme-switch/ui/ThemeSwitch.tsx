import { useEffect } from 'react';
import { applyTheme, themeKey, useStoredState } from '@/shared/lib';
import type { ThemePreference } from '@/shared/lib';
export function ThemeSwitch() {
  const [stored, setPreference] = useStoredState<ThemePreference>(themeKey, 'system');
  const preference = stored === 'light' || stored === 'dark' ? stored : 'system';
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => applyTheme(preference);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [preference]);
  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <span className="sr-only">화면 테마</span>
      <select
        aria-label="화면 테마"
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
        className="!px-2 !py-1.5"
      >
        <option value="system">◐ 시스템</option>
        <option value="light">☀ 라이트</option>
        <option value="dark">☾ 다크</option>
      </select>
    </label>
  );
}
