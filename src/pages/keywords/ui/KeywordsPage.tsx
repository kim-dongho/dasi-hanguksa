import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keywordNotes } from '@/entities/review-pack';
import { questions, useQuestionStars } from '@/entities/question';
import { useQuestionProgress } from '@/features/answer-question';

const categories = [
  { id: 'culture', name: '문화·종교', hint: '약하다고 한 승려·사상·역사서·작품부터 먼저' },
  { id: 'politics', name: '정치·제도·순서', hint: '왕의 업적, 비슷한 제도와 사건을 비교' },
  { id: 'modern', name: '근현대·독립운동', hint: '조약·운동·단체·인물을 연결' },
  { id: 'heritage', name: '유산·지역 (선택)', hint: '시간이 남으면 유물·궁궐·지역 단서 확인' },
];
const byId = new Map(questions.map((question) => [question.id, question]));

export function KeywordsPage() {
  const { results } = useQuestionProgress();
  const { stars } = useQuestionStars();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [onlyWeak, setOnlyWeak] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [revealed, setRevealed] = useState<string[]>([]);
  const needsReview = (id: string) =>
    !!stars[id] || (!!results[id] && results[id].selected !== byId.get(id)?.answer);
  const weakCount = keywordNotes.filter((note) => note.questionIds.some(needsReview)).length;
  const query = search.trim().toLocaleLowerCase();
  const filtered = keywordNotes.filter(
    (note) =>
      (category === 'all' || note.category === category) &&
      (!onlyWeak || note.questionIds.some(needsReview)) &&
      (!query || `${note.clue} ${note.answer}`.toLocaleLowerCase().includes(query)),
  );
  return (
    <main className="mx-auto max-w-5xl px-5 pb-12 pt-7 md:px-8">
      <header className="mb-6">
        <span className="eyebrow">KEYWORD RECALL</span>
        <h1 className="my-3 text-3xl font-bold">한 줄 키워드 암기</h1>
        <p className="text-xs leading-7 text-muted">
          148문항에서 반복되는 단서·인물을 {keywordNotes.length}줄로 묶었어요. 문화·종교부터 읽고,
          정답을 가린 뒤 화살표 뒤를 떠올려 보세요.
        </p>
        <p className="mt-2 text-xs text-moss">
          현재 채점 오답·킵과 연결된 키워드 {weakCount}줄 · 기억한 개념은 원문에서 다시 구별해
          보세요.
        </p>
        <Link className="mt-3 inline-block text-xs text-muted" to="/review">
          ← 남은 문제 복습으로
        </Link>
      </header>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 text-xs text-muted">
          <span className="sr-only">키워드 검색</span>
          <input
            className="w-full rounded border border-control bg-field px-3 py-2.5 text-xs text-ink"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="왕·인물·책·작품 검색 (예: 수선사, 성종, 물산)"
          />
        </label>
        <button
          className={onlyWeak ? 'primary' : 'secondary'}
          aria-pressed={onlyWeak}
          onClick={() => setOnlyWeak(!onlyWeak)}
        >
          내 오답·킵만
        </button>
        <button
          className={hidden ? 'primary' : 'secondary'}
          aria-pressed={hidden}
          onClick={() => {
            setHidden(!hidden);
            setRevealed([]);
          }}
        >
          {hidden ? '정답 펼치기' : '정답 가리고 외우기'}
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2" aria-label="키워드 분야">
        {[{ id: 'all', name: '전체' }, ...categories].map((entry) => (
          <button
            key={entry.id}
            className={category === entry.id ? 'primary' : 'secondary'}
            aria-pressed={category === entry.id}
            onClick={() => setCategory(entry.id)}
          >
            {entry.name}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-muted">{filtered.length}줄</span>
      </div>
      <div className="space-y-7" aria-label="키워드 목록">
        {categories.map((entry) => {
          const items = filtered
            .filter((note) => note.category === entry.id)
            .sort(
              (a, b) =>
                Number(b.questionIds.some(needsReview)) - Number(a.questionIds.some(needsReview)) ||
                b.questionIds.length - a.questionIds.length,
            );
          if (!items.length) return null;
          return (
            <section key={entry.id} aria-label={entry.name}>
              <div className="mb-3 flex flex-wrap items-baseline gap-3">
                <h2 className="text-lg font-bold">
                  {entry.name}{' '}
                  <small className="text-xs font-normal text-muted">{items.length}줄</small>
                </h2>
                <p className="text-[11px] text-muted">{entry.hint}</p>
              </div>
              <ul className="overflow-hidden rounded-xl border border-line bg-card">
                {items.map((note) => {
                  const weak = note.questionIds.filter(needsReview).length;
                  const show = !hidden || revealed.includes(note.id);
                  return (
                    <li key={note.id} className="border-b border-line px-4 py-3 last:border-0">
                      <p className="text-sm leading-7">
                        <span>{note.clue}</span>
                        <span className="mx-2 text-muted">→</span>
                        {show ? (
                          <strong className="font-semibold text-moss">{note.answer}</strong>
                        ) : (
                          <button
                            className="text-button text-xs text-moss"
                            aria-label={`정답 보기: ${note.clue}`}
                            onClick={() => setRevealed((previous) => [...previous, note.id])}
                          >
                            정답 보기
                          </button>
                        )}
                      </p>
                      <details className="mt-1 text-[10px] text-muted">
                        <summary className="cursor-pointer">
                          연결 기출 {note.questionIds.length}문항
                          {weak ? ` · 내 오답·킵 ${weak}문항` : ''}
                        </summary>
                        <div className="mt-2 flex flex-wrap gap-3">
                          {note.questionIds.map((id) => (
                            <Link
                              className={needsReview(id) ? 'font-semibold text-accent' : ''}
                              key={id}
                              to={`/review?filter=all&q=${id}`}
                            >
                              {id.replace('-', '회 ')}번 ↗
                            </Link>
                          ))}
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {!filtered.length ? (
          <p className="empty">해당하는 키워드가 없어요. 검색어나 분야·오답 필터를 바꿔보세요.</p>
        ) : null}
      </div>
    </main>
  );
}
