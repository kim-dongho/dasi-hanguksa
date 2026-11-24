import data from './data/questions.json';
import type { Question } from './model/types';
export const questions = data as Question[];
export const examQuestions = questions.filter((question) => question.exam >= 70);
export { eras } from './model/types';
export type { Question, EraId } from './model/types';
export { useQuestionStars } from './model/use-question-stars';
