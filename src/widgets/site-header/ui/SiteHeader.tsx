import { ThemeSwitch } from '@/features/theme-switch';
import { NavLink, Link } from 'react-router-dom';
export function SiteHeader() {
  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-chrome px-[4vw] max-sm:pt-3">
      <Link
        to="/"
        className="flex items-center gap-2.5 whitespace-nowrap text-lg font-bold no-underline [&>span]:grid [&>span]:size-8 [&>span]:place-items-center [&>span]:border [&>span]:border-control [&>span]:text-xl"
      >
        <span>史</span> 다시, 한국사
      </Link>
      <div className="flex flex-wrap items-center gap-4 max-sm:w-full">
        <nav aria-label="주 메뉴" className="flex flex-wrap">
          {[
            ['/notes', '오답노트'],
            ['/eras', '시대별 기출'],
            ['/exams', '회차별 기출'],
            ['/wrong', '기출 오답'],
            ['/review', '148문항 복습'],
            ['/keywords', '키워드 암기'],
          ].map(([to, label]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <ThemeSwitch />
      </div>
    </header>
  );
}
