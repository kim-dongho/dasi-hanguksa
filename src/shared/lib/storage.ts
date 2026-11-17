import { useCallback, useEffect, useState } from 'react';
const memory = new Map<string, string>();
const changeEvent = 'history-storage-change';
export function readStored<T>(key: string, fallback: T): T {
  try {
    const value = memory.get(key) ?? window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStored(key, fallback));
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    const sync = (event: Event) => {
      if (event instanceof StorageEvent) {
        if (event.key && event.key !== key) return;
        memory.delete(key);
      } else if ((event as CustomEvent<string>).detail !== key) return;
      setValue(readStored(key, fallback));
    };
    window.addEventListener('storage', sync);
    window.addEventListener(changeEvent, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(changeEvent, sync);
    };
  }, [key, fallback]);
  const update = useCallback(
    (next: T | ((previous: T) => T)) => {
      const result =
        typeof next === 'function' ? (next as (previous: T) => T)(readStored(key, fallback)) : next;
      const serialized = JSON.stringify(result);
      setValue(result);
      try {
        window.localStorage.setItem(key, serialized);
        memory.delete(key);
        setSaved(true);
      } catch {
        memory.set(key, serialized);
        setSaved(false);
      }
      window.dispatchEvent(new CustomEvent(changeEvent, { detail: key }));
    },
    [key, fallback],
  );
  return [value, update, saved] as const;
}
