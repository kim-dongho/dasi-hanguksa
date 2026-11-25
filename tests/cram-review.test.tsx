import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { existsSync } from 'node:fs';
import { reviewPack } from '@/entities/review-pack';
import { questions } from '@/entities/question';
import { CramReviewPage } from '@/pages/cram-review';
import { PracticePage } from '@/pages/practice';

describe('148-question compressed review', () => {
  it.each(['69-10', '77-20'])(
    'grades %s in the review card and saves its note across questions and remounts',
    async (id) => {
      const user = userEvent.setup();
      const q = questions.find((question) => question.id === id)!;
      localStorage.setItem(
        'original-exam-questions-v1',
        JSON.stringify({ [id]: { selected: q.answer } }),
      );
      const url = `/review?q=${id}`;
      const view = render(
        <MemoryRouter initialEntries={[url]}>
          <CramReviewPage />
        </MemoryRouter>,
      );
      for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
      await user.type(screen.getByRole('textbox', { name: '문제 메모' }), '사료의 핵심 단서 정리');
      await user.click(screen.getByRole('radio', { name: /^1번/ }));
      await user.click(screen.getByRole('button', { name: '채점하기' }));
      expect(screen.getByText('오답 · 정답 ⑤번')).toBeInTheDocument();
      expect(screen.getByText('보기 5개 구별하기')).toBeInTheDocument();
      expect(JSON.parse(localStorage.getItem('original-exam-questions-v1')!)[id]).toEqual({
        selected: 1,
      });
      await user.click(screen.getByRole('button', { name: '다시 풀기' }));
      for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
      await user.click(screen.getByRole('radio', { name: /^5번/ }));
      await user.click(screen.getByRole('button', { name: '채점하기' }));
      expect(screen.getByText(`정답 · ${q.points}점`)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '다음 문제 →' }));
      expect(screen.getByRole('textbox', { name: '문제 메모' })).toHaveValue('');
      await user.click(screen.getByRole('button', { name: '← 이전 문제' }));
      expect(screen.getByRole('textbox', { name: '문제 메모' })).toHaveValue(
        '사료의 핵심 단서 정리',
      );
      view.unmount();
      render(
        <MemoryRouter initialEntries={[url]}>
          <CramReviewPage />
        </MemoryRouter>,
      );
      expect(screen.getByRole('textbox', { name: '문제 메모' })).toHaveValue(
        '사료의 핵심 단서 정리',
      );
      for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
    },
  );
  it('opens a supplemental question in the regular practice page', () => {
    render(
      <MemoryRouter initialEntries={['/practice?exam=69&q=69-10']}>
        <PracticePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('69회 10번');
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });
  it('covers all 148 PDF items with complete source images and five choice notes', () => {
    expect(reviewPack.items).toHaveLength(148);
    expect(new Set(reviewPack.items.map((item) => item.id)).size).toBe(148);
    expect(reviewPack.items.map((item) => item.order)).toEqual(
      Array.from({ length: 148 }, (_, i) => i + 1),
    );
    expect(reviewPack.groups).toHaveLength(24);
    expect(reviewPack.items.filter((item) => item.id.startsWith('69-'))).toHaveLength(15);
    const bank = new Map(questions.map((q) => [q.id, q]));
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const item of reviewPack.items) {
      const question = bank.get(item.id)!;
      expect(question, item.id).toBeDefined();
      expect(existsSync(`public${question.image}`), item.id).toBe(true);
      expect(question.choiceNotes, item.id).toHaveLength(5);
      expect(question.answer, item.id).toBeGreaterThanOrEqual(1);
      expect(question.answer, item.id).toBeLessThanOrEqual(5);
      expect(item.takeaway, item.id).toBe(question.choiceNotes![question.answer - 1]);
      expect(item.clue.length, item.id).toBeGreaterThan(10);
      expect(item.clue, item.id).not.toMatch(/\[교재 확인\]|지문 해설|문항별 해설/);
      expect(
        reviewPack.groups.some((group) => group.id === item.group),
        item.id,
      ).toBe(true);
    }
    expect(bank.get('69-10')!.answer).toBe(5);
    expect(bank.get('69-41')!.answer).toBe(4);
  });

  it('hides answers, saves recall progress and resumes without changing exam results or memos', async () => {
    const user = userEvent.setup();
    const result = JSON.stringify({ '77-20': { selected: 5 } });
    const memo = JSON.stringify({ '77-20': '개인 메모' });
    localStorage.setItem('original-exam-questions-v1', result);
    localStorage.setItem('original-exam-question-memos-v1', memo);
    const view = render(
      <MemoryRouter>
        <CramReviewPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: '69회 10번' })).toBeInTheDocument();
    expect(screen.queryByText('정답 ⑤번')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '정답·핵심 단서 보기' }));
    expect(screen.getByText('정답 ⑤번')).toBeInTheDocument();
    expect(screen.getByText('보기 5개 구별하기')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '기억남 →' }));
    expect(screen.getByRole('heading', { name: '70회 13번' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '정답·핵심 단서 보기' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('history-cram-review-148-v1')!)).toEqual({
      '69-10': 'done',
    });
    expect(localStorage.getItem('original-exam-questions-v1')).toBe(result);
    expect(localStorage.getItem('original-exam-question-memos-v1')).toBe(memo);
    view.unmount();
    render(
      <MemoryRouter>
        <CramReviewPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: '70회 13번' })).toBeInTheDocument();
  });

  it('filters the complete topic and removes remembered questions from the retry queue', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'history-cram-review-148-v1',
      JSON.stringify({ '69-35': 'again', '71-39': 'done' }),
    );
    render(
      <MemoryRouter initialEntries={['/review?topic=products']}>
        <CramReviewPage />
      </MemoryRouter>,
    );
    expect(
      within(screen.getByRole('navigation', { name: '압축 복습 문제 이동' })).getByText('1 / 4'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 보기만' }));
    expect(screen.getByRole('heading', { name: '69회 35번' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '정답·핵심 단서 보기' }));
    await user.click(screen.getByRole('button', { name: '기억남 →' }));
    expect(screen.getByText(/선택한 범위에 남은 문항이 없어요/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '미완료만' }));
    expect(screen.getByRole('heading', { name: '73회 44번' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('navigation', { name: '압축 복습 문제 이동' })).getByText('1 / 2'),
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: '주제' }), 'balhae');
    expect(
      within(screen.getByRole('navigation', { name: '압축 복습 문제 이동' })).getByText('1 / 5'),
    ).toBeInTheDocument();
  });

  it('marks the final question for retry and explains where to continue', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/review?topic=factions&q=72-26']}>
        <CramReviewPage />
      </MemoryRouter>,
    );
    const navigation = within(screen.getByRole('navigation', { name: '압축 복습 문제 이동' }));
    expect(navigation.getByRole('button', { name: '다음 문제 →' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '정답·핵심 단서 보기' }));
    await user.click(screen.getByRole('button', { name: '다시 보기 →' }));
    expect(JSON.parse(localStorage.getItem('history-cram-review-148-v1')!)['72-26']).toBe('again');
    expect(screen.getByText(/목록의 마지막 문항/)).toBeInTheDocument();
  });
});
