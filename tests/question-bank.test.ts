import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { examQuestions, questions, eras } from '@/entities/question';
describe('official exam bank', () => {
  it('has exactly 550 original questions, 50 and 100 points in each of eleven exams', () => {
    expect(examQuestions).toHaveLength(550);
    expect(new Set(examQuestions.map((q) => q.id)).size).toBe(550);
    for (let exam = 70; exam <= 80; exam++) {
      const group = examQuestions.filter((q) => q.exam === exam);
      expect(group).toHaveLength(50);
      expect(group.map((q) => q.number).sort((a, b) => a - b)).toEqual(
        Array.from({ length: 50 }, (_, i) => i + 1),
      );
      expect(group.reduce((sum, q) => sum + q.points, 0)).toBe(100);
    }
  });
  it('ships every original crop, valid era and traceable official source', () => {
    const eraIds = eras.map((e) => e.id);
    for (const q of questions) {
      expect(existsSync(`public${q.image}`), q.id).toBe(true);
      expect(q.width, q.id).toBeGreaterThan(600);
      expect(q.height, q.id).toBeGreaterThan(150);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(1);
      expect(q.answer, q.id).toBeLessThanOrEqual(5);
      expect(q.eras.length, q.id).toBeGreaterThan(0);
      for (const era of q.eras) expect(eraIds, q.id).toContain(era);
      expect(q.source.questions.url).toMatch(
        /^https:\/\/www.historyexam.go.kr\/atchFile\/FileDown.do/,
      );
      expect(q.source.answers.url).toMatch(
        /^https:\/\/www.historyexam.go.kr\/atchFile\/FileDown.do/,
      );
    }
  });
  it('retains personal collections and their corrected notes', () => {
    expect(questions.filter((q) => q.collections?.includes('joseon-early'))).toHaveLength(10);
    expect(questions.filter((q) => q.collections?.includes('joseon-late'))).toHaveLength(9);
    expect(questions.reduce((n, q) => n + (q.notes?.length ?? 0), 0)).toBe(233);
    expect(
      questions
        .filter((q) => q.collections?.includes('joseon-society'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['75-25', '76-22']);
    expect(
      questions
        .filter((q) => q.collections?.includes('joseon-economy'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['70-23', '74-27', '75-26']);
    expect(
      questions
        .filter((q) => q.collections?.includes('daewongun'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['70-28', '76-29', '77-29']);
    expect(
      questions
        .filter((q) => q.collections?.includes('modern-reforms'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['70-29', '71-29', '72-30', '74-28']);
    expect(
      questions
        .filter((q) => q.collections?.includes('donghak-empire'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['69-31', '71-34', '76-31', '76-32']);
    expect(questions.find((q) => q.id === '69-31')?.answer).toBe(1);
    expect(questions.find((q) => q.id === '69-31')?.notes?.[1].answer).toContain('1881');
    expect(
      questions
        .filter((q) => q.collections?.includes('sovereignty'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['69-34', '71-35', '75-30', '77-33']);
    expect(questions.find((q) => q.id === '69-34')?.answer).toBe(4);
    expect(questions.find((q) => q.id === '71-35')?.notes?.[2].answer).toContain('1915');
    expect(
      questions
        .filter((q) => q.collections?.includes('opening-culture'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['68-36', '70-33', '72-29', '74-34', '75-32', '75-33', '77-34', '77-35']);
    expect(questions.find((q) => q.id === '68-36')?.answer).toBe(5);
    expect(questions.find((q) => q.id === '77-35')?.notes?.[2].answer).toContain('향교');
    expect(
      questions
        .filter((q) => q.collections?.includes('1920s-flow'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['69-35', '69-37', '71-39', '75-40', '76-39', '77-38']);
    expect(questions.find((q) => q.id === '69-35')?.answer).toBe(2);
    expect(questions.find((q) => q.id === '69-37')?.answer).toBe(1);
    expect(questions.find((q) => q.id === '77-38')?.choiceNotes?.[2]).toContain('1942');
    expect(
      questions
        .filter((q) => q.collections?.includes('independence'))
        .map((q) => q.id)
        .sort(),
    ).toEqual([
      '67-37',
      '67-43',
      '70-37',
      '71-36',
      '72-37',
      '73-36',
      '74-37',
      '74-38',
      '74-42',
      '75-37',
      '75-39',
      '77-32',
      '77-36',
      '77-41',
    ]);
    expect(
      questions
        .filter((q) => q.collections?.includes('occupation-culture'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['67-42', '70-41', '72-39', '76-40']);
    expect(questions.find((q) => q.id === '67-37')?.choiceNotes?.[2]).toContain('나석주');
    expect(questions.find((q) => q.id === '67-42')?.choiceNotes?.[1]).toContain('1905');
    expect(questions.find((q) => q.id === '74-37')?.notes?.[4].answer).toContain('독립의군부');
    expect(
      questions
        .filter((q) => q.collections?.includes('liberation'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['65-45', '70-42', '71-47', '75-45', '76-44']);
    expect(
      questions
        .filter((q) => q.collections?.includes('rhee-war'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['69-44', '70-44', '75-46']);
    expect(questions.find((q) => q.id === '65-45')?.answer).toBe(5);
    expect(questions.find((q) => q.id === '69-44')?.answer).toBe(2);
    expect(questions.find((q) => q.id === '76-44')?.choiceNotes?.[2]).toContain('1942');
    expect(
      questions.filter((q) => q.collections?.includes('park-government')).map((q) => q.id),
    ).toEqual(['75-47']);
    expect(questions.find((q) => q.id === '75-47')?.choiceNotes?.[2]).toContain('1987');
    expect(
      questions
        .filter((q) => q.collections?.includes('recent-governments'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['69-50', '74-48', '75-49', '76-49']);
    expect(questions.find((q) => q.id === '69-50')?.answer).toBe(5);
    expect(questions.find((q) => q.id === '75-49')?.choiceNotes?.[0]).toContain('김대중');
    expect(
      questions
        .filter((q) => q.collections?.includes('inter-korean-democracy'))
        .map((q) => q.id)
        .sort(),
    ).toEqual(['71-50', '74-49']);
    expect(questions.find((q) => q.id === '71-50')?.notes?.[1].answer).toContain('1992');
    expect(
      questions.filter((q) => q.collections?.includes('prehistoric')).map((q) => q.id),
    ).toEqual(['74-1']);
    expect(questions.find((q) => q.id === '74-1')?.choiceNotes?.[1]).toContain('고려');
    expect(questions.find((q) => q.id === '74-1')?.eras).toEqual(['ancient']);
    expect(questions.find((q) => q.id === '72-30')?.notes?.[4].answer).toContain('1899');
    expect(questions.find((q) => q.id === '71-29')?.explanation).toContain('조영 수호 통상 조약');
    expect(questions.find((q) => q.id === '76-29')?.notes?.[0].answer).toContain('1894');
    expect(questions.find((q) => q.id === '76-22')?.notes?.[0].answer).toBe('홍문관');
    expect(questions.find((q) => q.id === '71-22')?.notes?.[0].memo).toContain('체류 기간');
    expect(questions.find((q) => q.id === '77-28')?.notes?.[0].clue).toContain('진주');
  });
  it('provides five authored choice explanations for every personal review question', () => {
    const personal = questions.filter((q) => q.collections?.length);
    expect(personal).toHaveLength(87);
    for (const q of personal) {
      expect(q.choiceNotes, q.id).toHaveLength(5);
      expect(
        q.choiceNotes?.every((note) => note.trim().length > 0),
        q.id,
      ).toBe(true);
    }
  });
  it('provides a nonempty explanation and five choice explanations for all eras', () => {
    for (const q of questions) {
      expect(q.explanation?.trim().length, q.id).toBeGreaterThan(0);
      expect(q.choiceNotes, q.id).toHaveLength(5);
      expect(
        q.choiceNotes?.every((note) => note.trim().length > 0),
        q.id,
      ).toBe(true);
    }
  });
  it('classifies by the prompt and source material, never by distractors', () => {
    expect(questions.find((q) => q.id === '77-20')?.eras).toEqual(['joseon-early']);
    expect(questions.find((q) => q.id === '76-19')?.eras).toEqual(['joseon-early']);
    expect(questions.find((q) => q.id === '79-46')?.eras).toEqual(['occupation']);
    expect(questions.find((q) => q.id === '72-10')?.eras).toEqual(['kingdoms', 'states']);
    expect(questions.find((q) => q.id === '74-23')?.eras).toEqual(['joseon-early']);
    expect(questions.find((q) => q.id === '73-25')?.eras).toEqual(['joseon-early']);
    for (const id of ['72-47', '72-48', '75-38', '71-30', '70-48'])
      expect(questions.find((q) => q.id === id)?.eras, id).toEqual(['integrated']);
  });
  it('preserves official answers for the selected original questions', () => {
    for (const [id, answer] of Object.entries({
      '77-20': 5,
      '76-19': 4,
      '72-18': 2,
      '73-20': 1,
      '72-20': 2,
      '73-21': 3,
      '75-22': 2,
      '76-20': 5,
      '69-21': 4,
      '70-19': 3,
    }))
      expect(questions.find((q) => q.id === id)?.answer).toBe(answer);
  });
  it('configures Vercel production builds and SPA deep links', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
    expect(config.framework).toBe('vite');
    expect(config.outputDirectory).toBe('dist');
    expect(config.buildCommand).toBe('npm run build');
    expect(config.rewrites[0].destination).toBe('/index.html');
  });
});
