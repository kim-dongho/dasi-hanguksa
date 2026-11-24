import { KeepQuestion } from './KeepQuestion';

export function ExamAnswer({
  questionId,
  selected,
  submitted,
  onSelect,
}: {
  questionId: string;
  selected?: number;
  submitted: boolean;
  onSelect: (value: number) => void;
}) {
  return (
    <section className="border-t border-line bg-panel px-3.5 py-3">
      <div className="flex flex-wrap items-end gap-3">
        <fieldset className="flex-1">
          <legend className="mb-2 text-xs text-muted">
            실전 답안 · 제출 전까지 변경할 수 있어요
          </legend>
          <div className="flex gap-2">
            {['①', '②', '③', '④', '⑤'].map((mark, index) => (
              <label className="choice" key={mark}>
                <input
                  type="radio"
                  name={`exam-${questionId}`}
                  checked={selected === index + 1}
                  disabled={submitted}
                  onChange={() => onSelect(index + 1)}
                />
                <span aria-hidden="true">{mark}</span>
                <span className="sr-only">{index + 1}번</span>
              </label>
            ))}
          </div>
        </fieldset>
        <KeepQuestion questionId={questionId} />
      </div>
    </section>
  );
}
