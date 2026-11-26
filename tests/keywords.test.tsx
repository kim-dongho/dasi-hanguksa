import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { keywordNotes, reviewPack } from '@/entities/review-pack';
import { KeywordsPage } from '@/pages/keywords';

describe('one-line keyword notes', () => {
  it('covers every supplied review question with unique, concise keyword entries', () => {
    expect(keywordNotes).toHaveLength(109);
    expect(new Set(keywordNotes.map((note) => note.id)).size).toBe(keywordNotes.length);
    expect([...new Set(keywordNotes.flatMap((note) => note.questionIds))].sort()).toEqual(
      reviewPack.items.map((item) => item.id).sort(),
    );
    for (const note of keywordNotes) {
      expect(note.clue.trim().length).toBeGreaterThan(0);
      expect(note.answer.trim().length).toBeGreaterThan(0);
      expect(note.questionIds.length).toBeGreaterThan(0);
    }
  });
  it('searches, hides the answer for recall and links back to the original question', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <KeywordsPage />
      </MemoryRouter>,
    );
    await user.type(screen.getByRole('textbox', { name: '키워드 검색' }), '수선사');
    expect(screen.getByText('고려 지눌')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '정답 가리고 외우기' }));
    expect(screen.queryByText('고려 지눌')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /정답 보기: 수선사/ }));
    expect(screen.getByText('고려 지눌')).toBeInTheDocument();
    const row = within(screen.getByText('수선사·정혜쌍수·돈오점수').closest('li')!);
    await user.click(row.getByText(/연결 기출/));
    expect(row.getByRole('link', { name: /78회 17번/ })).toHaveAttribute(
      'href',
      '/review?filter=all&q=78-17',
    );
  });
  it('prioritizes current mistakes and includes starred questions even before grading', async () => {
    const user = userEvent.setup();
    localStorage.setItem('original-exam-questions-v1', JSON.stringify({ '71-4': { selected: 1 } }));
    localStorage.setItem('original-exam-question-stars-v1', JSON.stringify({ '75-17': true }));
    render(
      <MemoryRouter>
        <KeywordsPage />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: '내 오답·킵만' }));
    const list = within(screen.getByLabelText('키워드 목록'));
    expect(list.getByText('신라 원광, 진평왕 때')).toBeInTheDocument();
    expect(list.getByText('수시력·화통도감·상감 청자와 같은 시대')).toBeInTheDocument();
    expect(list.queryByText('김홍도; 금강전도는 정선')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '근현대·독립운동' }));
    expect(screen.getByText(/해당하는 키워드가 없어요/)).toBeInTheDocument();
  });
});
