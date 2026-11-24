import { useQuestionStars } from '@/entities/question';

export function KeepQuestion({ questionId }: { questionId: string }) {
  const { stars, toggleStar, saved } = useQuestionStars();
  return (
    <div>
      <button
        type="button"
        className={`secondary whitespace-nowrap ${stars[questionId] ? 'text-amber-500' : ''}`}
        aria-label="문제 킵"
        aria-pressed={!!stars[questionId]}
        title="킵한 문제는 정답 여부와 관계없이 오답과 함께 복습합니다."
        onClick={() => toggleStar(questionId)}
      >
        <span aria-hidden="true">{stars[questionId] ? '★' : '☆'}</span>{' '}
        {stars[questionId] ? '킵됨' : '문제 킵'}
      </button>
      {!saved ? (
        <p role="alert" className="mt-2 text-xs text-accent">
          킵 상태를 저장하지 못했습니다. 이 탭에서만 유지됩니다.
        </p>
      ) : null}
    </div>
  );
}
