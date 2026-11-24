import { useStoredState } from '@/shared/lib';
const empty: Record<string, string[]> = {};
const emptyQuestionMemos: Record<string, string> = {};
export function ChoiceMemo({ questionId, label }: { questionId: string; label: string }) {
  const [raw, update, saved] = useStoredState('original-exam-choice-memos-v1', empty);
  const [rawQuestionMemos, updateQuestionMemos, questionMemoSaved] = useStoredState(
    'original-exam-question-memos-v1',
    emptyQuestionMemos,
  );
  const questionMemos =
    rawQuestionMemos && typeof rawQuestionMemos === 'object' && !Array.isArray(rawQuestionMemos)
      ? rawQuestionMemos
      : emptyQuestionMemos;
  const memos = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : empty;
  const current = Array.isArray(memos[questionId]) ? memos[questionId] : [];
  return (
    <aside
      className="rounded-lg border border-control bg-panel px-3.5 py-4 min-[900px]:sticky min-[900px]:top-4"
      aria-label="문제와 보기별 나의 메모"
    >
      <div className="[&>span]:text-[9px] [&>span]:tracking-wide [&>span]:text-muted [&>h2]:mb-2 [&>h2]:mt-1 [&>h2]:text-base [&>h2]:font-semibold [&>p]:mb-4 [&>p]:text-[10px] [&>p]:leading-5 [&>p]:text-muted">
        <span>나의 문제·선지 분석</span>
        <h2>{label} 메모</h2>
        <p>문제의 핵심 단서와 각 보기가 가리키는 왕·인물·사건을 적어보세요.</p>
      </div>
      <label className="mb-4 flex flex-col gap-2 border-b border-dashed border-control pb-4 [&>span]:text-xs [&>span]:font-medium [&>span]:text-accent [&>textarea]:max-h-32 [&>textarea]:min-h-[56px] [&>textarea]:w-full [&>textarea]:resize-y [&>textarea]:border-control [&>textarea]:bg-field [&>textarea]:px-2 [&>textarea]:py-1.5 [&>textarea]:text-xs [&>textarea]:leading-5 [&>textarea]:placeholder:text-[10px]">
        <span>문제 메모</span>
        <textarea
          aria-label="문제 메모"
          rows={2}
          value={typeof questionMemos[questionId] === 'string' ? questionMemos[questionId] : ''}
          placeholder="예: 장수왕의 한성 함락 · 도림, 개로왕이 단서"
          onChange={(event) => {
            const value = event.target.value;
            updateQuestionMemos((previous) => ({ ...previous, [questionId]: value }));
          }}
        />
      </label>
      <div className="flex flex-col gap-2.5">
        {['①', '②', '③', '④', '⑤'].map((mark, index) => (
          <label
            className="flex items-start gap-2 [&>span]:whitespace-nowrap [&>span]:pt-2 [&>span]:text-xs [&>span]:text-accent [&>textarea]:max-h-32 [&>textarea]:min-h-[56px] [&>textarea]:w-full [&>textarea]:min-w-0 [&>textarea]:resize-y [&>textarea]:border-control [&>textarea]:bg-field [&>textarea]:px-2 [&>textarea]:py-1.5 [&>textarea]:text-xs [&>textarea]:leading-5 [&>textarea]:placeholder:text-[10px]"
            key={mark}
          >
            <span>{mark}번</span>
            <textarea
              aria-label={`${mark}번 메모`}
              rows={2}
              value={typeof current[index] === 'string' ? current[index] : ''}
              placeholder="왕·인물·사건, 헷갈리는 점"
              onChange={(event) => {
                const next = [...current];
                next[index] = event.target.value;
                update({ ...memos, [questionId]: next });
              }}
            />
          </label>
        ))}
      </div>
      <p
        className="mb-0 mt-3 border-t border-dashed border-control pt-2.5 text-[9px] text-muted"
        role="status"
      >
        {saved && questionMemoSaved
          ? '현재 브라우저에 자동 저장'
          : '저장 공간에 접근할 수 없어 이 탭에서만 유지돼요.'}
      </p>
    </aside>
  );
}
