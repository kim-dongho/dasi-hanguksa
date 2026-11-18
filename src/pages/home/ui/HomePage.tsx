import { Link } from 'react-router-dom';
import { questions, eras } from '@/entities/question';
import { studyNotes } from '@/entities/study-note';
import { useQuestionProgress } from '@/features/answer-question';
export function HomePage() {
  const { results } = useQuestionProgress();
  const answered = questions.filter((q) => results[q.id]);
  const wrong = answered.filter((q) => results[q.id].selected !== q.answer);
  const entries = [
    {
      to: '/notes',
      n: '01',
      title: '오답노트',
      description: '헷갈렸던 단서를 나의 지식으로.',
      meta: `개념 오답 ${studyNotes.length}개 · 선지 메모 ${questions.reduce((n, q) => n + (q.notes?.length ?? 0), 0)}개`,
      symbol: '筆',
    },
    {
      to: '/eras',
      n: '02',
      title: '시대별 기출',
      description: '같은 시대의 문제를 연결해서 풀기.',
      meta: `${eras.length}개 시대·주제 · 550문항`,
      symbol: '時',
    },
    {
      to: '/exams',
      n: '03',
      title: '회차별 기출',
      description: '한 회차를 처음부터 끝까지.',
      meta: '80~70회 심화 · 회차당 50문항',
      symbol: '卷',
    },
    {
      to: '/wrong',
      n: '04',
      title: '기출 오답',
      description: '틀린 문제와 보기별 메모 다시 보기.',
      meta: `다시 풀 오답 ${wrong.length}문항`,
      symbol: '復',
    },
  ];
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:px-9 md:py-12">
      <section className="home-hero relative">
        <span className="eyebrow">나만의 한국사 학습 서재</span>
        <h1>
          다시 읽고,
          <br />
          끝내 내 것으로.
        </h1>
        <p>
          원문 그대로 풀고, 보기마다 생각을 남기세요.
          <br />
          틀린 곳에서 다시 시작하는 한국사 공부.
        </p>
        <div className="mb-9 mt-7 flex flex-wrap gap-8 text-xs text-muted [&>span]:flex [&>span]:items-baseline [&>span]:gap-2 [&_b]:text-3xl [&_b]:font-semibold [&_b]:text-ink">
          <span>
            <b>550</b>기출문제
          </span>
          <span>
            <b>{answered.length}</b>풀어본 문제
          </span>
          <span>
            <b>{wrong.length}</b>남은 오답
          </span>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="학습 메뉴">
        {entries.map((entry) => (
          <Link to={entry.to} className="home-card" key={entry.to}>
            <div className="flex items-start justify-between text-[10px] tracking-widest text-accent">
              <span>{entry.n}</span>
              <span className="text-3xl text-faint">{entry.symbol}</span>
            </div>
            <h2>
              {entry.title}
              <span>↗</span>
            </h2>
            <p>{entry.description}</p>
            <small>{entry.meta}</small>
          </Link>
        ))}
      </section>
      <section className="mt-6 grid grid-cols-1 gap-3 rounded-lg border border-line bg-panel px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 [&>a]:min-w-0 [&>a]:justify-between [&>a]:gap-2 [&>a]:whitespace-nowrap [&>a]:px-2 [&>a]:text-left [&>a]:text-[11px] [&>a]:leading-5">
        <span className="col-span-full text-xs font-semibold text-moss">내가 모은 기출</span>
        <Link className="secondary" to="/practice?collection=joseon-early">
          <span>조선 전기 (10문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
        <Link className="secondary" to="/practice?collection=joseon-late">
          <span>조선 후기 (9문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
        <Link className="secondary" to="/practice?collection=joseon-society">
          <span>조선 사회 (2문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
        <Link className="secondary" to="/practice?collection=joseon-economy">
          <span>조선 경제 (3문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
        <Link className="secondary" to="/practice?collection=daewongun">
          <span>흥선대원군 집권기 (3문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
        <Link className="secondary" to="/practice?collection=modern-reforms">
          <span>근대적 개혁 추진(개항~갑신정변) (4문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
        <Link className="secondary" to="/practice?collection=donghak-empire">
          <span>동학 농민 운동과 대한 제국 수립 (4문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
        <Link className="secondary" to="/practice?collection=sovereignty">
          <span>일제 침략과 국권 수호 운동 (4문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
        <Link className="secondary" to="/practice?collection=opening-culture">
          <span>개화기 단체와 문화 (8문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
        <Link className="secondary" to="/practice?collection=1920s-flow">
          <span>1920~1930년대 초 주요 흐름 (6문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
        <Link className="secondary" to="/practice?collection=independence">
          <span>독립운동 (14문항)</span>
          <span aria-hidden="true" className="shrink-0">
            →
          </span>
        </Link>
      </section>
      <p className="mt-7 text-[10px] leading-6 text-muted">
        국사편찬위원회 공식 기출 원문 · 풀이와 메모는 현재 브라우저에 저장됩니다.
      </p>
    </main>
  );
}
