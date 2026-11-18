import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { studyNotes, studyEras } from '@/entities/study-note';
import { questions } from '@/entities/question';
import { ReviewNoteCard } from '@/features/review-note';
import { useStoredState } from '@/shared/lib';
type Attempts = Record<string, { value: string; correct: boolean }>;
const empty: Attempts = {};
const normalize = (value: string) =>
  value
    .normalize('NFKC')
    .replace(/[\s·,／/()（）]+/g, '')
    .toLowerCase();
export function NotebookPage() {
  const [params, setParams] = useSearchParams();
  const choices = params.get('collection') === 'choices';
  const [era, setEra] = useState('all'),
    [search, setSearch] = useState(''),
    [quiz, setQuiz] = useState(true),
    [onlyPending, setOnlyPending] = useState(false);
  const [raw, update] = useStoredState<Attempts>('history-notebook-attempts-v1', empty);
  const attempts = raw && typeof raw === 'object' ? raw : empty;
  const filtered = studyNotes.filter(
    (n) =>
      (era === 'all' || n.era === era) &&
      (!onlyPending || !attempts[n.id]?.correct) &&
      [n.question, n.answer, n.explanation, n.contrast, ...n.keywords]
        .join(' ')
        .includes(search.trim()),
  );
  const curated = questions.filter((q) => q.collections?.length);
  const noteCount = curated.reduce((sum, q) => sum + (q.notes?.length ?? 0), 0);
  return (
    <main className="mx-auto max-w-6xl px-5 pb-14 pt-8 md:px-8">
      <header className="mb-8 [&>h1]:my-3 [&>h1]:text-3xl [&>h1]:font-bold [&>p]:text-xs [&>p]:leading-7 [&>p]:text-muted">
        <span className="eyebrow">MY NOTEBOOK</span>
        <h1>오답노트</h1>
        <p>헷갈렸던 단서를 정확한 개념으로 연결하기.</p>
      </header>
      <div className="notebook-tabs mb-6 flex flex-wrap items-center gap-2 [&>a]:ml-auto [&>a]:text-xs [&>a]:text-muted max-sm:[&>a]:ml-0 max-sm:[&>a]:w-full">
        <button className={!choices ? 'selected' : ''} onClick={() => setParams({})}>
          개념 오답 {studyNotes.length}
        </button>
        <button
          className={choices ? 'selected' : ''}
          onClick={() => setParams({ collection: 'choices' })}
        >
          선지 메모 {noteCount}
        </button>
        <Link to="/practice?collection=curated">조선 전기 10문항 ↗</Link>
        <Link to="/practice?collection=joseon-late">조선 후기 9문항 ↗</Link>
        <Link to="/practice?collection=joseon-society">조선 사회 2문항 ↗</Link>
        <Link to="/practice?collection=joseon-economy">조선 경제 3문항 ↗</Link>
        <Link className="secondary" to="/practice?collection=daewongun">
          흥선대원군 집권기 3문항 →
        </Link>
        <Link className="secondary" to="/practice?collection=modern-reforms">
          근대적 개혁 추진(개항~갑신정변) 4문항 →
        </Link>
        <Link className="secondary" to="/practice?collection=donghak-empire">
          동학 농민 운동과 대한 제국 수립 4문항 →
        </Link>
        <Link className="secondary" to="/practice?collection=sovereignty">
          일제 침략과 국권 수호 운동 (4문항) →
        </Link>
        <Link className="secondary" to="/practice?collection=opening-culture">
          개화기 단체와 문화 (8문항) →
        </Link>
      </div>
      {choices ? (
        <div className="curated-notes">
          {curated.map((q) => (
            <section
              key={q.id}
              className="my-6 [&>h2]:mb-4 [&>h2]:flex [&>h2]:items-center [&>h2]:justify-between [&>h2]:text-xl [&>h2]:font-semibold [&>h2>a]:text-[11px] [&>h2>a]:font-normal [&>h2>a]:text-muted"
            >
              <h2>
                {q.exam}회 {q.number}번{' '}
                <Link to={`/practice?collection=${q.collections?.[0]}&q=${q.id}`}>원문 풀기 ↗</Link>
              </h2>
              {q.notes?.map((n, i) => (
                <article key={i} className="note-card">
                  <h3>{n.clue}</h3>
                  <strong className="text-base font-semibold text-moss">{n.answer}</strong>
                  <p>{n.memo}</p>
                </article>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2.5 [&>input]:min-w-40 [&>input]:flex-1 [&>label]:flex [&>label]:items-center [&>label]:gap-2 [&>label]:text-[11px] [&>label]:text-muted">
            <input
              type="search"
              aria-label="오답 검색"
              placeholder="왕·인물·사건 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select aria-label="시대 선택" value={era} onChange={(e) => setEra(e.target.value)}>
              <option value="all">모든 시대</option>
              {studyEras.map((e) => (
                <option value={e.id} key={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <button className="secondary" onClick={() => setQuiz(!quiz)}>
              {quiz ? '정답·해설 읽기' : '직접 맞혀보기'}
            </button>
            <label>
              <input
                type="checkbox"
                checked={onlyPending}
                onChange={(e) => setOnlyPending(e.target.checked)}
              />{' '}
              아직 못 맞힌 문제
            </label>
          </div>
          <p className="my-4 text-xs text-muted">
            {filtered.length}개 오답 · {studyNotes.filter((n) => attempts[n.id]?.correct).length}개
            정답
          </p>
          {filtered.length ? (
            filtered.map((note) => (
              <ReviewNoteCard
                key={`${note.id}-${quiz}`}
                note={note}
                quiz={quiz}
                result={attempts[note.id]}
                onGrade={(value) =>
                  update({
                    ...attempts,
                    [note.id]: { value, correct: normalize(value) === normalize(note.answer) },
                  })
                }
                onRetry={() => {
                  const next = { ...attempts };
                  delete next[note.id];
                  update(next);
                }}
              />
            ))
          ) : (
            <div className="empty">조건에 맞는 오답이 없어요.</div>
          )}
        </>
      )}
    </main>
  );
}
