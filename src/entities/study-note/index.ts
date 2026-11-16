import rawNotes from './data/notes.json';
import eraData from './data/eras.json';
import type { StudyNote } from './model/types';
export const studyNotes: StudyNote[] = rawNotes;
export const studyEras = eraData;
export type { StudyNote } from './model/types';
