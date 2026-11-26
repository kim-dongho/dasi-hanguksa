import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { questions } from '@/entities/question';
import { reviewPack, type ReviewItem } from '@/entities/review-pack';
import { useStoredState } from '@/shared/lib';
import { AnswerQuestion, useQuestionProgress } from '@/features/answer-question';
import { QuestionMemo } from '@/features/choice-memo';

type Progress = Record<string, 'done' | 'again'>;
const empty: Progress = {};
const byId = new Map(questions.map((question) => [question.id, question]));
const regularIds = new Set(questions.map((question) => question.id));
const ordered = reviewPack.groups.flatMap((group) =>
  reviewPack.items.filter((item) => item.group === group.id),
);

function ReviewCard({
  item,
  mark,
  recordGrade,
}: {
  item: ReviewItem;
  mark: (status: 'done' | 'again') => void;
  recordGrade: (status: 'done' | 'again') => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState(false);
  const question = byId.get(item.id)!;
  const group = reviewPack.groups.find((entry) => entry.id === item.group)!;
  const practiceParams = new URLSearchParams({ q: question.id });
  if (question.exam < 70 && question.collections?.[0])
    practiceParams.set('collection', question.collections[0]);
  else practiceParams.set('exam', String(question.exam));

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
        <h2 className="text-base font-bold">
          {question.exam}회 {question.number}번
        </h2>
        <span className="text-[11px] text-muted">
          PDF {item.order}번 · {group.name}
        </span>
      </header>
      <div className="grid items-start min-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="bg-white p-3">
            <img
              className="mx-auto max-h-[max(340px,calc(100dvh-310px))] w-full object-contain"
              src={question.image}
              width={question.width}
              height={question.height}
              alt={`${question.exam}회 ${question.number}번 문제 원문`}
            />
          </div>
          <AnswerQuestion
            question={question}
            hidePreviousResult={!graded}
            onGrade={(selected) => {
              recordGrade(selected === question.answer ? 'done' : 'again');
              setGraded(true);
              setRevealed(true);
            }}
            onRetry={() => {
              setGraded(false);
              setRevealed(false);
            }}
          />
        </div>
        <section
          className="min-w-0 border-t border-line p-5 min-[900px]:border-l min-[900px]:border-t-0"
          aria-label="압축 복습 카드"
        >
          <QuestionMemo questionId={question.id} />
          {!revealed ? (
            <>
              <p className="mb-4 text-xs leading-7 text-muted">
                보기를 선택하고 채점하세요. 답을 확인하면 핵심 단서와 보기별 해설이 열립니다.
              </p>
              <button className="primary w-full" onClick={() => setRevealed(true)}>
                정답·핵심 단서 보기
              </button>
              <p className="mt-3 text-[11px] leading-6 text-muted">
                길게 필기하지 않아도 돼요. 확인한 뒤 기억나는지 판단하고 다음 문제로 넘어가세요.
              </p>
            </>
          ) : (
            <>
              <p className="mb-4 rounded-lg bg-panel px-4 py-3 text-sm font-semibold text-moss">
                정답 {['①', '②', '③', '④', '⑤'][question.answer - 1]}번
              </p>
              <dl className="space-y-4 text-xs leading-7">
                <div>
                  <dt className="font-bold text-accent">1. 판별 단서</dt>
                  <dd>{item.clue}</dd>
                </div>
                <div>
                  <dt className="font-bold text-accent">2. 정답 연결</dt>
                  <dd>{item.takeaway}</dd>
                </div>
                <div>
                  <dt className="font-bold text-accent">3. 같은 주제의 혼동 구별</dt>
                  <dd>{group.guide}</dd>
                </div>
              </dl>
              <details className="mt-4 text-xs leading-7" open>
                <summary className="cursor-pointer font-semibold">보기 5개 구별하기</summary>
                <ol className="mt-2 space-y-2">
                  {question.choiceNotes!.map((note, index) => (
                    <li
                      key={index}
                      className={`rounded border border-line px-3 py-2 ${index + 1 === question.answer ? 'bg-panel text-moss' : 'text-muted'}`}
                    >
                      <b>
                        {['①', '②', '③', '④', '⑤'][index]}{' '}
                        {index + 1 === question.answer ? '정답' : '오답'}
                      </b>{' '}
                      · {note}
                    </li>
                  ))}
                </ol>
              </details>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button className="secondary" onClick={() => mark('again')}>
                  다시 보기 →
                </button>
                <button className="primary" onClick={() => mark('done')}>
                  기억남 →
                </button>
              </div>
            </>
          )}
          {regularIds.has(question.id) ? (
            <Link
              className="mt-4 inline-block text-[11px] text-muted"
              to={`/practice?${practiceParams}`}
            >
              기존 풀이 화면에서 풀기 ↗
            </Link>
          ) : null}
        </section>
      </div>
    </article>
  );
}

export function CramReviewPage() {
  const [params, setParams] = useSearchParams();
  const { results } = useQuestionProgress();
  const [raw, update, saved] = useStoredState<Progress>('history-cram-review-148-v1', empty);
  const stored = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : empty;
  const progress: Progress = {};
  for (const item of ordered) {
    const status = stored[item.id];
    if (status === 'done' || status === 'again') progress[item.id] = status;
    else if (results[item.id]) {
      progress[item.id] =
        results[item.id].selected === byId.get(item.id)!.answer ? 'done' : 'again';
    }
  }
  // Keep the graded question visible until the user finishes reading its explanation.
  const [heldId, setHeldId] = useState<string>();
  const topic = params.get('topic') ?? 'all';
  const filter = params.get('filter') ?? 'all';
  const scope = ordered.filter((item) => topic === 'all' || item.group === topic);
  const filtered = scope.filter(
    (item) =>
      item.id === heldId ||
      (filter === 'again'
        ? progress[item.id] === 'again'
        : filter === 'remaining'
          ? progress[item.id] !== 'done'
          : true),
  );
  const current =
    filtered.find((item) => item.id === heldId) ??
    filtered.find((item) => item.id === params.get('q')) ??
    filtered.find((item) => progress[item.id] !== 'done') ??
    filtered[0];
  const index = current ? filtered.indexOf(current) : -1;
  const done = ordered.filter((item) => progress[item.id] === 'done').length;
  const again = ordered.filter((item) => progress[item.id] === 'again').length;
  const answered = ordered.filter((item) => results[item.id]).length;
  const correct = ordered.filter(
    (item) => results[item.id]?.selected === byId.get(item.id)!.answer,
  ).length;
  const accuracy = answered ? `${((correct / answered) * 100).toFixed(1)}%` : '—';
  const [notice, setNotice] = useState('');
  function navigate(id: string) {
    setHeldId(undefined);
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set('q', id);
        return next;
      },
      { replace: true },
    );
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function select(key: string, value: string) {
    setHeldId(undefined);
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set(key, value);
      next.delete('q');
      return next;
    });
    setNotice('');
  }
  function mark(status: 'done' | 'again') {
    if (!current) return;
    setHeldId(undefined);
    update((previous) => ({ ...previous, [current.id]: status }));
    if (filtered[index + 1]) navigate(filtered[index + 1].id);
    else setNotice('목록의 마지막 문항입니다. 미완료·다시 보기에서 남은 문항을 확인하세요.');
  }
  return (
    <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:px-8">
      <header className="mb-5">
        <span className="eyebrow">LAST-MINUTE REVIEW</span>
        <h1 className="my-2 text-2xl font-bold">148문항 압축 복습</h1>
        <p className="text-xs leading-6 text-muted">
          제공한 오답·별표 148문항을 {reviewPack.groups.length}개 주제로 묶었어요. 단서 떠올리기 →
          해설 확인 → 기억남·다시 보기 순서로 전부 복습하세요.
        </p>
        <dl
          aria-label="148문항 채점 현황"
          className="mt-4 flex flex-wrap gap-x-8 gap-y-3 rounded-lg border border-line bg-card px-4 py-3 text-xs tabular-nums"
        >
          <div>
            <dt className="mb-1 text-[10px] text-muted">채점</dt>
            <dd className="font-semibold">
              {answered} / {ordered.length}문항
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-[10px] text-muted">정답</dt>
            <dd className="font-semibold text-moss">
              {correct} / {ordered.length}문항
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-[10px] text-muted">정답률 (채점 기준)</dt>
            <dd className="font-semibold text-moss">{accuracy}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[10px] text-muted">
          정답률은 최근 채점 기준입니다. 채점하면 기억남·다시 보기에 자동 반영되며, 복습 후 직접
          바꿀 수도 있습니다.
        </p>
        <div
          className="my-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
          aria-label="압축 복습 현황"
        >
          <span>
            전체 <b>148문항</b>
          </span>
          <span>
            기억남 <b>{done}문항</b>
          </span>
          <span>
            다시 보기 <b>{again}문항</b>
          </span>
          <span>
            미완료 <b>{148 - done}문항</b>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded bg-track">
          <div
            className="h-full bg-moss transition-[width]"
            style={{ width: `${(done / 148) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted">
          기존 채점 기록 중 복습 표시가 없는 문항도 자동 반영됩니다. 미완료에는 다시 보기 문항이
          포함됩니다.
        </p>
        {!saved ? (
          <p role="alert" className="mt-2 text-xs text-accent">
            복습 진행을 저장하지 못했습니다. 이 탭에서만 유지됩니다.
          </p>
        ) : null}
      </header>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-col gap-1 text-xs text-muted">
          주제
          <select
            className="max-w-full rounded border border-control bg-field px-3 py-2 text-ink"
            value={topic}
            onChange={(event) => select('topic', event.target.value)}
          >
            <option value="all">전체 주제 · 148문항</option>
            {reviewPack.groups.map((group) => {
              const items = ordered.filter((item) => item.group === group.id);
              return (
                <option key={group.id} value={group.id}>
                  {group.name} · {items.filter((item) => progress[item.id] === 'done').length}/
                  {items.length}
                </option>
              );
            })}
          </select>
        </label>
        <div className="flex flex-wrap gap-2" aria-label="복습 범위">
          {[
            ['all', '전체'],
            ['remaining', '미완료만'],
            ['again', '다시 보기만'],
          ].map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? 'primary' : 'secondary'}
              aria-pressed={filter === value}
              onClick={() => select('filter', value)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs tabular-nums text-muted">
          {current ? index + 1 : 0} / {filtered.length}문항
        </span>
      </div>
      {current ? (
        <>
          <ReviewCard
            key={current.id}
            item={current}
            mark={mark}
            recordGrade={(status) => {
              setHeldId(current.id);
              update((previous) => ({ ...previous, [current.id]: status }));
            }}
          />
          <nav
            aria-label="압축 복습 문제 이동"
            className="mt-4 flex items-center justify-between gap-3"
          >
            <button
              className="secondary"
              disabled={index <= 0}
              onClick={() => navigate(filtered[index - 1].id)}
            >
              ← 이전 문제
            </button>
            <span className="text-xs text-muted">
              {index + 1} / {filtered.length}
            </span>
            <button
              className="secondary"
              disabled={index === filtered.length - 1}
              onClick={() => navigate(filtered[index + 1].id)}
            >
              다음 문제 →
            </button>
          </nav>
        </>
      ) : (
        <div className="empty">
          선택한 범위에 남은 문항이 없어요. 전체 또는 다른 주제를 선택하세요.
        </div>
      )}
      {notice ? (
        <p className="mt-4 rounded-lg bg-panel p-4 text-xs leading-6" role="status">
          {notice}
        </p>
      ) : null}
      <details className="mt-6 rounded-lg border border-line bg-card p-4">
        <summary className="cursor-pointer text-xs font-semibold">
          현재 주제 문항 목록 ({scope.length}문항)
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {scope.map((item) => (
            <button
              key={item.id}
              className="secondary text-xs"
              onClick={() => {
                setHeldId(undefined);
                setParams((previous) => {
                  const next = new URLSearchParams(previous);
                  next.set('filter', 'all');
                  next.set('q', item.id);
                  return next;
                });
                setNotice('');
              }}
            >
              {progress[item.id] === 'done' ? '✓ ' : progress[item.id] === 'again' ? '↻ ' : ''}
              {item.id.replace('-', '회 ')}번
            </button>
          ))}
        </div>
      </details>
    </main>
  );
}
