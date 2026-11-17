import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeSwitch } from '@/features/theme-switch';
import { initializeTheme, themeKey } from '@/shared/lib';
function mockSystem(dark: boolean) {
  const media = new EventTarget() as MediaQueryList;
  Object.defineProperty(media, 'matches', { value: dark, writable: true });
  vi.stubGlobal('matchMedia', () => media);
  return media;
}
afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
});
describe('theme preference', () => {
  it('initializes before rendering and follows system changes', () => {
    const media = mockSystem(true);
    initializeTheme();
    expect(document.documentElement.dataset.theme).toBe('dark');
    render(<ThemeSwitch />);
    expect(screen.getByRole('combobox', { name: '화면 테마' })).toHaveValue('system');
    act(() => {
      Object.defineProperty(media, 'matches', { value: false });
      media.dispatchEvent(new Event('change'));
    });
    expect(document.documentElement.dataset.theme).toBe('light');
  });
  it('persists manual dark mode and ignores system changes until system is selected', () => {
    const media = mockSystem(false);
    const view = render(<ThemeSwitch />);
    fireEvent.change(screen.getByRole('combobox', { name: '화면 테마' }), {
      target: { value: 'dark' },
    });
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(JSON.parse(localStorage.getItem(themeKey)!)).toBe('dark');
    act(() => media.dispatchEvent(new Event('change')));
    expect(document.documentElement.dataset.theme).toBe('dark');
    view.unmount();
    initializeTheme();
    render(<ThemeSwitch />);
    expect(screen.getByRole('combobox', { name: '화면 테마' })).toHaveValue('dark');
    fireEvent.change(screen.getByRole('combobox', { name: '화면 테마' }), {
      target: { value: 'system' },
    });
    expect(document.documentElement.dataset.theme).toBe('light');
  });
  it('falls back safely when saved theme data is malformed', () => {
    mockSystem(false);
    localStorage.setItem(themeKey, 'broken-json');
    initializeTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
