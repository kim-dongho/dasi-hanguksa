export type EraId = 'ancient'|'kingdoms'|'states'|'goryeo'|'joseon-early'|'joseon-late'|'opening'|'occupation'|'modern'|'integrated';
export interface Question {
  id: string; exam: number; number: number; page: number; answer: number; points: number;
  image: string; width: number; height: number; eras: EraId[]; text?: string;
  collections?: string[]; title?: string; explanation?: string; choiceNotes?: string[];
  choices?: string[]; notes?: {clue: string; answer: string; memo: string}[];
  source: { pageUrl: string; questions: {url: string}; answers: {url: string} };
}
export const eras: {id: EraId; name: string; description: string}[] = [
  {id:'ancient',name:'선사·고조선',description:'시대의 시작과 초기 국가'},
  {id:'kingdoms',name:'삼국·가야',description:'고구려·백제·신라·가야'},
  {id:'states',name:'남북국·후삼국',description:'통일 신라·발해와 후삼국'},
  {id:'goryeo',name:'고려',description:'왕건부터 공양왕까지'},
  {id:'joseon-early',name:'조선 전기',description:'건국과 제도 정비'},
  {id:'joseon-late',name:'조선 후기',description:'양난 이후의 정치·사회'},
  {id:'opening',name:'개항기·대한제국',description:'개항과 근대 국가 수립'},
  {id:'occupation',name:'일제강점기',description:'민족 운동과 독립운동'},
  {id:'modern',name:'현대',description:'해방 이후의 대한민국'},
  {id:'integrated',name:'통합·지역사',description:'여러 시대를 잇는 주제'},
];
