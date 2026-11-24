import { useStoredState } from '@/shared/lib';

const empty: Record<string, boolean> = {};

export function useQuestionStars() {
  const [raw, update, saved] = useStoredState('original-exam-question-stars-v1', empty);
  const stars: Record<string, boolean> = {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [id, starred] of Object.entries(raw)) {
      if (starred === true) stars[id] = true;
    }
  }
  const toggleStar = (id: string) => {
    update((previous) => {
      const next = { ...previous };
      if (next[id] === true) delete next[id];
      else next[id] = true;
      return next;
    });
  };
  return { stars, toggleStar, saved };
}
