import { useStoredState } from '@/shared/lib';
export type Result = { selected: number };
export type Results = Record<string, Result>;
const empty: Results = {};
export function useQuestionProgress() {
  const [raw, update, saved] = useStoredState<Results>('original-exam-questions-v1', empty);
  const results: Results = {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [id, result] of Object.entries(raw)) {
      if (Number.isInteger(result?.selected) && result.selected >= 1 && result.selected <= 5)
        results[id] = result;
    }
  }
  const answer = (id: string, selected: number) => {
    if (!Number.isInteger(selected) || selected < 1 || selected > 5) return;
    update({ ...results, [id]: { selected } });
  };
  const gradeAnswers = (answers: Record<string, number>) => {
    const next = { ...results };
    for (const [id, selected] of Object.entries(answers)) {
      if (Number.isInteger(selected) && selected >= 1 && selected <= 5) next[id] = { selected };
    }
    update(next);
  };
  return { results, answer, saved, gradeAnswers };
}
