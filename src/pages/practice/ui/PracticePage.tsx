import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { questions, useQuestionStars } from '@/entities/question';
import {
  AnswerQuestion,
  ExamAnswer,
  ResetQuestionProgress,
  StudyProgress,
  useQuestionProgress,
} from '@/features/answer-question';
import { ChoiceMemo } from '@/features/choice-memo';
export function PracticePage() {
  const [params, setParams] = useSearchParams();
  const { results, gradeAnswers, saved } = useQuestionProgress();
  const { stars } = useQuestionStars();
  const isExam = params.get('mode') === 'exam' && !params.get('era') && !params.get('wrong');
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [retrying, setRetrying] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [resetCount, setResetCount] = useState(0);
  const [pool] = useState(() =>
    questions
      .filter((q) =>
        params.get('collection')
          ? params.get('collection') === 'curated'
            ? q.collections?.includes('joseon-early')
            : q.collections?.includes(params.get('collection')!)
          : !!params.get('wrong') || !!params.get('exam') || q.exam >= 70,
      )
      .filter((q) => !params.get('exam') || q.exam === Number(params.get('exam')))
      .filter(
        (q) => !params.get('era') || q.eras.includes(params.get('era') as (typeof q.eras)[number]),
      )
      .filter(
        (q) =>
          !params.get('wrong') ||
          stars[q.id] ||
          (results[q.id] && results[q.id].selected !== q.answer),
      ),
  );
  const current = pool.find((q) => q.id === params.get('q')) ?? pool[0];
  const index = current ? pool.indexOf(current) : -1;
  const zoom = useRef<HTMLDialogElement>(null);
  function navigate(id: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set('q', id);
        return next;
      },
      { replace: true },
    );
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  const answered = isExam
    ? pool.filter((q) => draft[q.id]).length
    : pool.filter((q) => results[q.id]).length;
  if (!current)
    return (
      <main className="mx-auto max-w-6xl px-5 pb-14 pt-8 md:px-8">
        <div className="empty">
          풀 문제를 찾지 못했어요.
          <br />
          <Link to="/eras">시대별 기출로 돌아가기</Link>
        </div>
      </main>
    );
  const hidePreviousResult =
    retrying.includes(current.id) || (!!params.get('wrong') && !reviewed.includes(current.id));
  const graded = !isExam && !hidePreviousResult && !!results[current.id];
  const score = pool.reduce((sum, q) => sum + (draft[q.id] === q.answer ? q.points : 0), 0);
  const maxScore = pool.reduce((sum, q) => sum + q.points, 0);
  const studyParams = new URLSearchParams(params);
  studyParams.delete('mode');
  const wrongParams = new URLSearchParams(studyParams);
  wrongParams.delete('q');
  wrongParams.set('wrong', '1');
  const remainingWrong = pool.filter(
    (q) => stars[q.id] || (results[q.id] && results[q.id].selected !== q.answer),
  );
  return (
    <main className={`mx-auto max-w-[1600px] px-4 pb-28 ${graded ? 'is-graded' : ''}`}>
      <div className="flex min-h-[62px] flex-wrap items-center justify-between gap-3 py-2 [&>div:first-child]:flex [&>div:first-child]:items-baseline [&>div:first-child]:gap-4 [&_h1]:text-lg [&_h1]:font-bold [&_small]:ml-2 [&_small]:text-[10px] [&_small]:font-normal [&_small]:text-muted [&_a]:text-xs [&_a]:text-muted [&_a]:no-underline">
        <div>
          <Link to={params.get('wrong') ? '/wrong' : params.get('era') ? '/eras' : '/exams'}>
            ← 목록
          </Link>
          <h1>
            {current.exam}회 {current.number}번 <small>심화 · {current.points}점</small>
          </h1>
        </div>
        {!isExam ? (
          <div className="flex flex-wrap items-center gap-4">
            <StudyProgress questions={pool} results={results} />
            {!params.get('wrong') && remainingWrong.length ? (
              <Link className="secondary" to={`/practice?${wrongParams}`}>
                오답·별표 풀기 ({remainingWrong.length}문항)
              </Link>
            ) : null}
            {params.get('era') && !params.get('wrong') ? (
              <ResetQuestionProgress
                questions={pool}
                onReset={() => {
                  setRetrying([]);
                  setReviewed([]);
                  setResetCount((previous) => previous + 1);
                  navigate(pool[0].id);
                }}
              />
            ) : null}
          </div>
        ) : null}
      </div>
      {params.get('wrong') ? (
        <p className="mb-3 text-xs text-muted">
          오답·별표 풀이 · 남은 복습 {remainingWrong.length}문항 · 킵한 문제는 맞혀도 유지됩니다.
          킵하지 않은 정답 문제는 다음 목록에서 제외됩니다.
        </p>
      ) : null}
      {isExam ? (
        <section
          className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-card px-4 py-3 text-xs"
          aria-label="실전 시험"
        >
          <strong>실전 시험</strong>
          {submitted ? (
            <>
              <span role="status">
                제출 완료 · {score} / {maxScore}점 ·{' '}
                {pool.filter((q) => draft[q.id] === q.answer).length} / {pool.length}문항 정답
              </span>
              {!saved ? (
                <p role="alert" className="text-accent">
                  결과를 저장하지 못했습니다. 새로고침하면 사라질 수 있습니다.
                </p>
              ) : null}
              <Link className="secondary ml-auto" to={`/practice?${studyParams}`}>
                보기별 해설 복습 →
              </Link>
            </>
          ) : (
            <>
              <span>
                {answered} / {pool.length} 답안 작성 · 제출 전에는 정답과 해설이 공개되지 않아요.
              </span>
              <button
                className="primary ml-auto"
                disabled={answered !== pool.length}
                onClick={() => {
                  gradeAnswers(draft);
                  setSubmitted(true);
                }}
              >
                시험 제출·채점
              </button>
            </>
          )}
        </section>
      ) : (
        <p className="sr-only">해설 학습 · 채점 후 보기별 해설을 확인하세요.</p>
      )}
      <div className="grid grid-cols-1 items-start gap-4 min-[900px]:grid-cols-[126px_minmax(0,1fr)_240px] min-[1400px]:grid-cols-[138px_minmax(0,1fr)_265px]">
        <aside className="min-[900px]:sticky min-[900px]:top-4 [&>nav]:flex [&>nav]:gap-1 [&>nav]:overflow-auto [&>nav]:p-1 max-[899px]:[&>nav]:flex-row min-[900px]:[&>nav]:max-h-[calc(100dvh-190px)] min-[900px]:[&>nav]:flex-col">
          <div className="mb-3 mt-2 flex justify-between text-[11px] text-moss max-[899px]:hidden [&>small]:text-muted">
            문항 이동{' '}
            <small>
              {answered} / {pool.length}
            </small>
          </div>
          <nav aria-label="문항 선택">
            {pool.map((q) => (
              <button
                className={`practice-nav-item ${q.id === current.id ? 'active' : ''}`}
                key={q.id}
                onClick={() => navigate(q.id)}
                aria-current={q.id === current.id ? 'page' : undefined}
              >
                <span
                  className={`result-dot ${isExam ? (submitted ? (draft[q.id] === q.answer ? 'correct' : 'wrong') : '') : results[q.id] ? (results[q.id].selected === q.answer ? 'correct' : 'wrong') : ''}`}
                >
                  {(isExam ? draft[q.id] : results[q.id]) ? '●' : '○'}
                </span>
                {q.exam}회 {q.number}번
                {stars[q.id] ? (
                  <span className="text-amber-500" aria-label="킵한 문제">
                    ★
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <section className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="flex h-8 items-center justify-between gap-2 border-b border-line bg-card px-3.5 text-[9px] text-muted">
              <span>공식 원문 · 문제·지문·보기·배점 포함</span>
              <button className="text-button" onClick={() => zoom.current?.showModal()}>
                크게 보기 ⤢
              </button>
            </div>
            <button
              className={`flex h-auto min-h-0 w-full cursor-zoom-in items-center justify-center border-0 bg-white p-2.5 ${isExam ? 'min-[900px]:h-[calc(100dvh-400px)]' : 'min-[900px]:h-[calc(100dvh-326px)]'} min-[900px]:min-h-[300px] [&>img]:block [&>img]:h-auto [&>img]:w-full [&>img]:max-w-full [&>img]:object-contain min-[900px]:[&>img]:max-h-full min-[900px]:[&>img]:w-auto`}
              aria-label={`${current.exam}회 ${current.number}번 원문 확대`}
              onClick={() => zoom.current?.showModal()}
            >
              <img
                src={current.image}
                width={current.width}
                height={current.height}
                alt={`${current.exam}회 ${current.number}번 원문 전체. 배점 ${current.points}점.`}
              />
            </button>
            {isExam ? (
              <ExamAnswer
                questionId={current.id}
                selected={draft[current.id]}
                submitted={submitted}
                onSelect={(value) => setDraft((previous) => ({ ...previous, [current.id]: value }))}
              />
            ) : (
              <AnswerQuestion
                key={`${current.id}-${resetCount}`}
                question={current}
                hidePreviousResult={hidePreviousResult}
                onRetry={() => setRetrying((previous) => [...previous, current.id])}
                onGrade={() => {
                  setRetrying((previous) => previous.filter((id) => id !== current.id));
                  setReviewed((previous) =>
                    previous.includes(current.id) ? previous : [...previous, current.id],
                  );
                }}
              />
            )}
          </section>
          {graded ? (
            <section className="mt-4 rounded-lg border border-line bg-card px-5 py-5 [&>h2]:mb-3 [&>h2]:text-lg [&>h2]:font-semibold [&_p]:text-xs [&_p]:leading-7 [&_p]:text-muted [&_details]:mt-4 [&_details]:text-xs [&_details]:text-muted [&_summary]:cursor-pointer">
              <h2>채점 후 복습</h2>
              {current.explanation ? (
                <p>{current.explanation}</p>
              ) : (
                <p>
                  정답은 <strong>{['①', '②', '③', '④', '⑤'][current.answer - 1]}번</strong>이에요.
                  오른쪽에 적은 보기별 메모를 원문과 대조해 보세요.
                </p>
              )}
              {current.choiceNotes ? (
                <ol className="m-0 list-none p-0 [&>li]:flex [&>li]:gap-3 [&>li]:border-b [&>li]:border-line [&>li]:py-2 [&>li]:text-xs [&>li]:text-muted [&>li.correct]:text-moss [&>li.correct]:font-semibold">
                  {current.choiceNotes.map((note, i) => (
                    <li key={note} className={i + 1 === current.answer ? 'correct' : ''}>
                      <b>
                        {['①', '②', '③', '④', '⑤'][i]} {i + 1 === current.answer ? '정답' : '오답'}
                      </b>
                      {note}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="rounded border border-line bg-paper px-3 py-2">
                  이 문항의 보기별 해설은 아직 등록되지 않았어요.
                </p>
              )}
              {current.notes?.length ? (
                <details>
                  <summary>네가 헷갈렸던 선지 메모</summary>
                  {current.notes.map((note, i) => (
                    <div className="mt-2 rounded bg-panel px-3 py-2.5 text-xs text-accent" key={i}>
                      <strong>
                        {note.clue} → {note.answer}
                      </strong>
                      <p>{note.memo}</p>
                    </div>
                  ))}
                </details>
              ) : null}
            </section>
          ) : null}
          <div className="flex flex-wrap gap-3 px-0.5 py-2 text-[9px] text-muted [&>span]:ml-auto max-sm:[&>span]:ml-0">
            <a href={current.source.pageUrl} target="_blank" rel="noreferrer">
              공식 자료실 ↗
            </a>
            <a href={current.source.questions.url} target="_blank" rel="noreferrer">
              문제지 PDF ↗
            </a>
            {graded || (isExam && submitted) ? (
              <a href={current.source.answers.url} target="_blank" rel="noreferrer">
                정답표 PDF ↗
              </a>
            ) : null}
            <span>사진 등의 저작권은 원저작자에게 있습니다.</span>
          </div>
        </div>
        <ChoiceMemo
          key={current.id}
          questionId={current.id}
          label={`${current.exam}회 ${current.number}번`}
        />
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 min-[900px]:grid-cols-[126px_minmax(0,1fr)_240px] min-[1400px]:grid-cols-[138px_minmax(0,1fr)_265px]">
        <nav
          aria-label="문제 이동"
          className="pointer-events-auto flex items-center justify-between gap-3 rounded-lg border border-control bg-card p-2 shadow-lg min-[900px]:col-start-2"
        >
          <button
            className="secondary min-h-11 min-w-24 sm:min-w-32"
            disabled={index === 0}
            onClick={() => navigate(pool[index - 1].id)}
          >
            ← 이전
          </button>
          <span className="text-center text-xs tabular-nums text-muted">
            {index + 1} / {pool.length}
          </span>
          <button
            className="primary min-h-11 min-w-24 sm:min-w-32"
            disabled={index === pool.length - 1}
            onClick={() => navigate(pool[index + 1].id)}
          >
            다음 →
          </button>
        </nav>
      </div>
      <dialog
        className="m-auto h-[96dvh] max-h-none w-[98vw] max-w-none overflow-hidden rounded-lg border border-control bg-card p-0"
        ref={zoom}
      >
        <div className="flex h-12 items-center justify-between border-b border-line px-4 [&>h2]:text-sm [&>h2]:font-semibold">
          <h2>
            {current.exam}회 {current.number}번 · {current.points}점
          </h2>
          <button className="secondary" onClick={() => zoom.current?.close()}>
            닫기 ✕
          </button>
        </div>
        <div className="flex h-[calc(96dvh-50px)] items-center justify-center overflow-hidden bg-white p-1 [&>img]:block [&>img]:h-full [&>img]:w-full [&>img]:min-w-0 [&>img]:object-contain">
          <img src={current.image} alt={`${current.exam}회 ${current.number}번 확대 원문`} />
        </div>
      </dialog>
    </main>
  );
}
