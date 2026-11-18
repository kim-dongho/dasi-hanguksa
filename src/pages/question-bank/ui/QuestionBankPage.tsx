import { Link, useSearchParams } from 'react-router-dom';
import { questions, eras } from '@/entities/question';
import { StudyProgress, useQuestionProgress } from '@/features/answer-question';
export function QuestionBankPage({ mode }: { mode: 'era' | 'exam' | 'wrong' }) {
  const { results } = useQuestionProgress();
  const [params, setParams] = useSearchParams();
  const selected = params.get(mode === 'era' ? 'era' : 'exam');
  const all = questions.filter((q) => mode === 'wrong' || q.exam >= 70);
  const filtered = all.filter(
    (q) =>
      (mode !== 'wrong' || (results[q.id] && results[q.id].selected !== q.answer)) &&
      (!selected ||
        (mode === 'era'
          ? q.eras.includes(selected as (typeof q.eras)[number])
          : q.exam === Number(selected))),
  );
  const exams = [...new Set(all.map((q) => q.exam))].sort((a, b) => b - a);
  const title = mode === 'era' ? '시대별 기출' : mode === 'exam' ? '회차별 기출' : '기출 오답';
  const groups =
    mode === 'era'
      ? eras.map((era) => ({
          id: era.id,
          title: era.name,
          description: era.description,
          items: all.filter((q) => q.eras.includes(era.id)),
        }))
      : exams.map((exam) => ({
          id: String(exam),
          title: `제${exam}회`,
          description: '한국사능력검정시험 심화',
          items: all.filter((q) => q.exam === exam),
        }));
  return (
    <main className="mx-auto max-w-6xl px-5 pb-14 pt-8 md:px-8">
      <header className="mb-8 [&>h1]:my-3 [&>h1]:text-3xl [&>h1]:font-bold [&>p]:text-xs [&>p]:leading-7 [&>p]:text-muted">
        <span className="eyebrow">QUESTION ARCHIVE</span>
        <h1>{title}</h1>
        <p>
          {mode === 'wrong'
            ? '틀린 문제를 다시 풀고, 보기별 메모를 이어서 정리하세요.'
            : '지문·자료에서 묻는 시대 기준으로 분류했어요. 보기의 시대는 분류에 포함하지 않아요.'}
        </p>
      </header>
      {mode === 'era' && !selected ? (
        <div className="mb-6 flex flex-wrap gap-3">
          <Link className="secondary" to="/practice?collection=joseon-early">
            내 조선 전기 10문항 →
          </Link>
          <Link className="secondary" to="/practice?collection=joseon-late">
            내 조선 후기 9문항 →
          </Link>
          <Link className="secondary" to="/practice?collection=joseon-economy">
            내 조선 경제 3문항 →
          </Link>
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
      ) : null}
      {mode !== 'wrong' && !selected ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const answered = group.items.filter((q) => results[q.id]).length;
            return (
              <Link
                key={group.id}
                className="bank-card"
                to={`?${mode === 'era' ? 'era' : 'exam'}=${group.id}`}
              >
                <span className="float-right text-[10px] text-muted">{group.items.length}문항</span>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
                <div className="mb-3 mt-6 h-1 overflow-hidden rounded bg-track [&>span]:block [&>span]:h-full [&>span]:bg-moss">
                  <span
                    style={{
                      width: `${group.items.length ? (answered / group.items.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                {mode === 'era' ? (
                  <StudyProgress questions={group.items} results={results} />
                ) : null}
                <small className="mt-4">
                  {answered} / {group.items.length} 풀이 <span>열어보기 →</span>
                </small>
              </Link>
            );
          })}
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-muted [&>.primary]:ml-auto">
            {selected ? (
              <button className="secondary" onClick={() => setParams({})}>
                ← 목록으로
              </button>
            ) : null}
            <span>
              {selected ? (groups.find((g) => g.id === selected)?.title ?? '선택한 문제') : ''} ·{' '}
              {filtered.length}문항
            </span>
            {filtered.length ? (
              <Link
                className="primary"
                to={`/practice?${mode === 'wrong' ? 'wrong=1' : mode === 'era' ? `era=${selected}` : `exam=${selected}`}`}
              >
                {mode === 'wrong' ? '오답 다시 풀기 →' : '해설 보며 풀기 →'}
              </Link>
            ) : null}
            {mode === 'exam' && selected && filtered.length ? (
              <Link className="secondary" to={`/practice?exam=${selected}&mode=exam`}>
                실전 시험 →
              </Link>
            ) : null}
          </div>
          {mode === 'era' && filtered.length ? (
            <div className="mb-5 rounded-lg border border-line bg-card px-5 py-4">
              <StudyProgress questions={filtered} results={results} />
            </div>
          ) : null}
          {!filtered.length ? (
            <div className="empty">
              {mode === 'wrong'
                ? '아직 틀린 기출문제가 없어요. 시대별·회차별 기출을 먼저 풀어보세요.'
                : '해당 문항이 없어요.'}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-card [&>a]:flex [&>a]:items-center [&>a]:gap-4 [&>a]:border-b [&>a]:border-line [&>a]:px-4 [&>a]:py-4 [&>a]:text-xs [&>a]:no-underline [&>a:hover]:bg-panel [&>a:last-child]:border-0 [&_small]:ml-auto [&_small]:text-muted [&_strong]:font-medium [&>a>span:nth-last-child(3)]:text-muted max-sm:[&>a>span:nth-last-child(3)]:hidden">
              {filtered.map((q) => (
                <Link
                  key={q.id}
                  to={`/practice?${mode === 'wrong' ? 'wrong=1' : mode === 'era' ? `era=${selected}` : `exam=${q.exam}`}&q=${q.id}`}
                >
                  <span
                    className={`result-dot ${results[q.id] ? (results[q.id].selected === q.answer ? 'correct' : 'wrong') : ''}`}
                  >
                    {results[q.id] ? '●' : '○'}
                  </span>
                  <strong>
                    {q.exam}회 {q.number}번
                  </strong>
                  <span>{q.eras.map((id) => eras.find((e) => e.id === id)?.name).join(' · ')}</span>
                  <small>{q.points}점</small>
                  <span>{mode === 'wrong' ? '다시 풀기 →' : '→'}</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
