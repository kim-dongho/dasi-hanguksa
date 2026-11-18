import type { Question } from '@/entities/question';
import type { Results } from '../model/use-question-progress';

export function StudyProgress({ questions, results }: { questions: Question[]; results: Results }) {
  const answered = questions.filter((question) => results[question.id]).length;
  const correct = questions.filter(
    (question) => results[question.id]?.selected === question.answer,
  );
  const score = correct.reduce((sum, question) => sum + question.points, 0);
  const total = questions.reduce((sum, question) => sum + question.points, 0);

  return (
    <dl aria-label="학습 현황" className="flex flex-wrap gap-x-6 gap-y-2 text-xs tabular-nums">
      <div>
        <dt className="mb-1 text-[10px] text-muted">풀이</dt>
        <dd className="m-0 whitespace-nowrap font-semibold">
          {answered} / {questions.length}문항
        </dd>
      </div>
      <div>
        <dt className="mb-1 text-[10px] text-muted">정답</dt>
        <dd className="m-0 whitespace-nowrap font-semibold text-positive">
          {correct.length} / {questions.length}문항
        </dd>
      </div>
      <div>
        <dt className="mb-1 text-[10px] text-muted">점수</dt>
        <dd className="m-0 whitespace-nowrap font-semibold text-moss">
          {score} / {total}점
        </dd>
      </div>
    </dl>
  );
}
