import data from './data/review-pack.json';
import keywords from './data/keywords.json';

export const reviewPack = data;
export type ReviewItem = (typeof data.items)[number];
export const keywordNotes = keywords;
