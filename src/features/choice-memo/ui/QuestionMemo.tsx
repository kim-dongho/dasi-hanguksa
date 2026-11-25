import { useStoredState } from '@/shared/lib';

const empty: Record<string, string> = {};

export function QuestionMemo({ questionId }: { questionId: string }) {
  const [raw, update, saved] = useStoredState('original-exam-question-memos-v1', empty);
  const memos = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : empty;
  return (
    <div className="mb-5 rounded-lg border border-control bg-panel p-3">
      <label className="flex flex-col gap-2 text-xs font-semibold text-accent">
        노트 필기
        <textarea
          aria-label="문제 메모"
          rows={4}
          className="min-h-24 w-full resize-y rounded border border-control bg-field px-3 py-2 text-xs font-normal leading-6 text-ink"
          placeholder="핵심 단서 · 왕/사건 · 헷갈린 보기와 구별할 점을 적어보세요."
          value={typeof memos[questionId] === 'string' ? memos[questionId] : ''}
          onChange={(event) => {
            const value = event.target.value;
            update((previous) => ({ ...previous, [questionId]: value }));
          }}
        />
      </label>
      <p className="mt-2 text-[10px] text-muted" role="status">
        {saved
          ? '자동 저장 · 기존 문제 메모와 연결됩니다.'
          : '저장하지 못했습니다. 이 탭에서만 유지됩니다.'}
      </p>
    </div>
  );
}
