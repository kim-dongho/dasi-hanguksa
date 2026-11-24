import type { Question } from '@/entities/question';
import { useQuestionProgress } from '../model/use-question-progress';

export function ResetQuestionProgress({
  questions,
  onReset,
}: {
  questions: Question[];
  onReset?: () => void;
}) {
  const { results, reset, saved } = useQuestionProgress();
  return (
    <div>
      <button
        type="button"
        className="secondary whitespace-nowrap"
        disabled={!questions.some((question) => results[question.id])}
        onClick={() => {
          if (
            !window.confirm(
              '이 시대 문항의 풀이 기록과 점수를 초기화할까요?\n회차별 기출·기출 오답에도 반영되며, 작성한 메모는 유지됩니다.',
            )
          )
            return;
          reset(questions.map((question) => question.id));
          onReset?.();
        }}
      >
        풀이 초기화
      </button>
      {!saved ? (
        <p role="alert" className="mt-2 text-xs text-accent">
          초기화 결과를 저장하지 못했습니다. 새로고침하면 이전 기록이 돌아올 수 있습니다.
        </p>
      ) : null}
    </div>
  );
}
