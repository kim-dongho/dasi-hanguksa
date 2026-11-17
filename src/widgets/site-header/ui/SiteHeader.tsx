import { NavLink, Link } from 'react-router-dom';
export function SiteHeader() {
  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-[#f0f0e7] px-[4vw] max-sm:pt-3">
      <Link
        to="/"
        className="flex items-center gap-2.5 whitespace-nowrap text-lg font-bold no-underline [&>span]:grid [&>span]:size-8 [&>span]:place-items-center [&>span]:border [&>span]:border-[#9aab8d] [&>span]:text-xl"
      >
        <span>史</span> 다시, 한국사
      </Link>
      <nav aria-label="주 메뉴">
        {[
          ['/notes', '오답노트'],
          ['/eras', '시대별 기출'],
          ['/exams', '회차별 기출'],
          ['/wrong', '기출 오답'],
        ].map(([to, label]) => (
          <NavLink key={to} to={to}>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
