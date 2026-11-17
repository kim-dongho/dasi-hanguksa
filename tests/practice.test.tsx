import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PracticePage } from '@/pages/practice';
import { QuestionBankPage } from '@/pages/question-bank';
import { HomePage } from '@/pages/home';
import { ChoiceMemo } from '@/features/choice-memo';

describe('original practice flow', () => {
  it('shows all four study destinations and both personal collections', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    for (const name of ['오답노트', '시대별 기출', '회차별 기출', '기출 오답'])
      expect(screen.getByRole('heading', { name: new RegExp(name) })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /조선 전기 10문항/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /조선 후기 9문항/ })).toBeInTheDocument();
  });
  it('grades an original question, persists the wrong answer, retries and saves each numbered memo independently', async () => {
    const user = userEvent.setup();
    const view = render(
      <MemoryRouter initialEntries={['/practice?collection=joseon-early&q=77-20']}>
        <PracticePage />
      </MemoryRouter>,
    );
    expect(screen.getByAltText('77회 20번 원문 전체. 배점 3점.')).toBeInTheDocument();
    expect(screen.queryByText('채점 후 복습')).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: '①번 메모' }), '연산군 · 무오사화');
    await user.type(screen.getByRole('textbox', { name: '②번 메모' }), '태종');
    await user.click(screen.getByRole('radio', { name: /^1번/ }));
    await user.click(screen.getByRole('button', { name: '채점하기' }));
    expect(screen.getByText('오답 · 정답 ⑤번')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('original-exam-questions-v1')!)['77-20'].selected).toBe(
      1,
    );
    await user.click(screen.getByRole('button', { name: '다시 풀기' }));
    expect(screen.queryByText('채점 후 복습')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '①번 메모' })).toHaveValue('연산군 · 무오사화');
    await user.click(screen.getByRole('radio', { name: /^5번/ }));
    await user.click(screen.getByRole('button', { name: '채점하기' }));
    expect(screen.getByText('정답 · 3점')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다음 →' }));
    expect(screen.getByRole('textbox', { name: '①번 메모' })).toHaveValue('');
    await user.click(screen.getByRole('button', { name: '← 이전' }));
    expect(screen.getByRole('textbox', { name: '②번 메모' })).toHaveValue('태종');
    view.unmount();
    render(
      <MemoryRouter initialEntries={['/practice?collection=joseon-early&q=77-20']}>
        <PracticePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('textbox', { name: '①번 메모' })).toHaveValue('연산군 · 무오사화');
    expect(screen.getByText('정답 · 3점')).toBeInTheDocument();
  });
  it('keeps old 69th-exam personal mistakes available for review', () => {
    localStorage.setItem(
      'original-exam-questions-v1',
      JSON.stringify({ '69-21': { selected: 1 }, '77-20': { selected: 5 } }),
    );
    const view = render(
      <MemoryRouter>
        <QuestionBankPage mode="wrong" />
      </MemoryRouter>,
    );
    expect(screen.getByText('69회 21번')).toBeInTheDocument();
    expect(screen.queryByText('77회 20번')).not.toBeInTheDocument();
    view.unmount();
    render(
      <MemoryRouter initialEntries={['/practice?wrong=1&q=69-21']}>
        <PracticePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('69회 21번');
  });
  it('starts wrong-answer practice with hidden answers and enabled choices, preserving history until regrading', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'original-exam-questions-v1',
      JSON.stringify({ '77-20': { selected: 1 }, '76-19': { selected: 1 } }),
    );
    localStorage.setItem(
      'original-exam-choice-memos-v1',
      JSON.stringify({ '77-20': ['기존 메모', '', '', '', ''] }),
    );
    const view = render(
      <MemoryRouter initialEntries={['/practice?wrong=1&q=77-20']}>
        <PracticePage />
      </MemoryRouter>,
    );
    expect(screen.queryByText('채점 후 복습')).not.toBeInTheDocument();
    expect(screen.queryByText('오답 · 정답 ⑤번')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^5번/ })).toBeEnabled();
    expect(JSON.parse(localStorage.getItem('original-exam-questions-v1')!)['77-20'].selected).toBe(
      1,
    );
    expect(screen.getByRole('textbox', { name: '①번 메모' })).toHaveValue('기존 메모');
    await user.click(screen.getByRole('radio', { name: /^5번/ }));
    await user.click(screen.getByRole('button', { name: '채점하기' }));
    expect(screen.getByText('정답 · 3점')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다음 →' }));
    expect(screen.queryByText('채점 후 복습')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^1번/ })).toBeEnabled();
    view.unmount();
    render(
      <MemoryRouter>
        <QuestionBankPage mode="wrong" />
      </MemoryRouter>,
    );
    expect(screen.queryByText('77회 20번')).not.toBeInTheDocument();
    expect(screen.getByText('76회 19번')).toBeInTheDocument();
  });
  it('shows explanations for all five choices after grading in era practice, even with an exam-mode URL', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/practice?era=joseon-early&mode=exam&q=76-22']}>
        <PracticePage />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('region', { name: '실전 시험' })).not.toBeInTheDocument();
    expect(screen.queryByText(/홍문관 · 사헌부/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /^1번/ }));
    await user.click(screen.getByRole('button', { name: '채점하기' }));
    expect(screen.getByText(/홍문관 · 사헌부/)).toBeInTheDocument();
    for (const label of ['① 오답', '② 정답', '③ 오답', '④ 오답', '⑤ 오답'])
      expect(screen.getByText(label)).toBeInTheDocument();
  });
  it('keeps exam answers editable and hidden until final submission, then grades the entire set', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'original-exam-questions-v1',
      JSON.stringify({ '76-22': { selected: 2 } }),
    );
    render(
      <MemoryRouter initialEntries={['/practice?collection=joseon-society&mode=exam']}>
        <PracticePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '시험 제출·채점' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: '채점하기' })).not.toBeInTheDocument();
    expect(screen.queryByText('채점 후 복습')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '2번' })).not.toBeChecked();
    await user.click(screen.getByRole('radio', { name: '2번' }));
    expect(screen.queryByText('정답 · 2점')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다음 →' }));
    await user.click(screen.getByRole('radio', { name: '1번' }));
    await user.click(screen.getByRole('button', { name: '← 이전' }));
    expect(screen.getByRole('radio', { name: '2번' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: '1번' }));
    expect(JSON.parse(localStorage.getItem('original-exam-questions-v1')!)['76-22'].selected).toBe(
      2,
    );
    await user.click(screen.getByRole('button', { name: '시험 제출·채점' }));
    expect(screen.getByText('제출 완료 · 1 / 3점 · 1 / 2문항 정답')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '1번' })).toBeDisabled();
    expect(JSON.parse(localStorage.getItem('original-exam-questions-v1')!)['76-22'].selected).toBe(
      1,
    );
    expect(JSON.parse(localStorage.getItem('original-exam-questions-v1')!)['75-25'].selected).toBe(
      1,
    );
    expect(screen.getByRole('link', { name: '보기별 해설 복습 →' })).toHaveAttribute(
      'href',
      '/practice?collection=joseon-society&q=76-22',
    );
    expect(screen.queryByText('채점 후 복습')).not.toBeInTheDocument();
  });
  it('offers real exams only in the exam archive, not in era practice', () => {
    const view = render(
      <MemoryRouter initialEntries={['/exams?exam=76']}>
        <QuestionBankPage mode="exam" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: '실전 시험 →' })).toHaveAttribute(
      'href',
      '/practice?exam=76&mode=exam',
    );
    view.unmount();
    render(
      <MemoryRouter initialEntries={['/eras?era=joseon-early']}>
        <QuestionBankPage mode="era" />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link', { name: '실전 시험 →' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '해설 보며 풀기 →' })).toHaveAttribute(
      'href',
      '/practice?era=joseon-early',
    );
  });
  it('loads exactly the nine newly provided late-Joseon questions', () => {
    render(
      <MemoryRouter initialEntries={['/practice?collection=joseon-late']}>
        <PracticePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('77회 28번');
    expect(
      screen.getAllByRole('button').filter((b) => b.getAttribute('aria-current') === 'page'),
    ).toHaveLength(1);
    expect(screen.getByText('1 / 9')).toBeInTheDocument();
  });
  it('warns instead of losing the current memo when browser storage is unavailable', () => {
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const view = render(<ChoiceMemo questionId="quota-test" label="테스트" />);
    fireEvent.change(screen.getByRole('textbox', { name: '①번 메모' }), {
      target: { value: '이 탭에 유지' },
    });
    expect(screen.getByRole('textbox', { name: '①번 메모' })).toHaveValue('이 탭에 유지');
    expect(screen.getByRole('status')).toHaveTextContent('이 탭에서만 유지');
    set.mockRestore();
    view.unmount();
  });
});
