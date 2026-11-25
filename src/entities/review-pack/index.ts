import data from './data/review-pack.json';

export const reviewPack = data;
export type ReviewItem = (typeof data.items)[number];
