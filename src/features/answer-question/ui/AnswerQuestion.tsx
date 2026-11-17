import { useRef, useState } from 'react';
import type { Question } from '@/entities/question';
import { useQuestionProgress } from '../model/use-question-progress';
const marks = ['①', '②', '③', '④', '⑤'];
export function AnswerQuestion({
  question: q,
  hidePreviousResult = false,
  onGrade,
}: {
  question: Question;
  hidePreviousResult?: boolean;
  onGrade?: () => void;
}) {
  const { results, answer, retry } = useQuestionProgress();
  const [selected, setSelected] = useState<number>();
  const feedback = useRef<HTMLDivElement>(null);
  const result = hidePreviousResult ? undefined : results[q.id];
  const correct = result?.selected === q.answer;
  return (
    <section className="border-t border-line bg-panel px-3.5 pb-2 pt-2.5 [&>form]:flex [&>form]:items-center [&>form]:gap-4 [&_fieldset]:flex-1 [&_legend]:mb-1 [&_legend]:text-[9px] [&_legend]:text-muted [&_button]:mt-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (selected) {
            answer(q.id, selected);
            onGrade?.();
            requestAnimationFrame(() => feedback.current?.focus({ preventScroll: true }));
          }
        }}
      >
        <fieldset>
          <legend>정답 선택</legend>
          <div className="flex gap-2">
            {marks.map((mark, index) => (
              <label
                key={mark}
                className={`choice ${result && index + 1 === q.answer ? 'correct' : ''} ${result && index + 1 === result.selected && !correct ? 'wrong' : ''}`}
              >
                <input
                  type="radio"
                  name={`answer-${q.id}`}
                  value={index + 1}
                  checked={(result?.selected ?? selected) === index + 1}
                  disabled={!!result}
                  onChange={() => setSelected(index + 1)}
                />
                <span aria-hidden="true">{mark}</span>
                <span className="sr-only">
                  {index + 1}번{q.choices?.[index] ? `. ${q.choices[index]}` : ''}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {result ? (
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setSelected(undefined);
              retry(q.id);
            }}
          >
            다시 풀기
          </button>
        ) : (
          <button className="primary" disabled={!selected}>
            채점하기
          </button>
        )}
      </form>
      {result ? (
        <div
          ref={feedback}
          tabIndex={-1}
          role="status"
          className={`answer-feedback ${correct ? 'correct' : 'wrong'}`}
        >
          <strong>
            {correct ? `정답 · ${q.points}점` : `오답 · 정답 ${marks[q.answer - 1]}번`}
          </strong>
          <span>내 답 {marks[result.selected - 1]}</span>
        </div>
      ) : (
        <p className="mb-0 mt-1 text-[9px] text-muted">보기별로 메모하고 정답을 선택해 보세요.</p>
      )}
    </section>
  );
}
