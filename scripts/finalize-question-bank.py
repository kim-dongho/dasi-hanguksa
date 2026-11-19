import json
from pathlib import Path
bank=json.loads(Path('tmp/pdfs/bank-unclassified.json').read_text())
# Reviewed against each question's target, not the chronology of its distractors.
# Overlapping or thematic questions may belong to multiple eras.
A,K,S,G,E,L,O,C,M,I='ancient kingdoms states goryeo joseon-early joseon-late opening occupation modern integrated'.split()
ranges={
80:[(1,1,A),(2,5,K),(6,10,S),(11,19,G),(20,21,E),(22,27,L),(28,34,O),(35,42,C),(43,49,M),(50,50,I)],
79:[(1,2,A),(3,6,K),(7,10,S),(11,18,G),(19,20,E),(21,27,L),(28,35,O),(36,44,C),(45,49,M),(50,50,I)],
78:[(1,3,A),(4,7,K),(8,10,S),(11,18,G),(19,22,E),(23,27,L),(28,35,O),(36,43,C),(44,49,M),(50,50,I)],
77:[(1,2,A),(3,6,K),(7,10,S),(11,18,G),(19,21,E),(22,28,L),(29,35,O),(36,44,C),(45,49,M),(50,50,I)],
76:[(1,1,A),(2,4,K),(5,9,S),(10,18,G),(19,22,E),(23,27,L),(28,35,O),(36,43,C),(44,49,M),(50,50,I)],
75:[(1,2,A),(3,5,K),(6,8,S),(9,9,K),(10,10,S),(11,18,G),(19,22,E),(23,27,L),(28,33,O),(34,44,C),(45,49,M),(50,50,I)],
74:[(1,2,A),(3,5,K),(6,9,S),(10,18,G),(19,21,E),(22,27,L),(28,35,O),(36,43,C),(44,49,M),(50,50,I)],
73:[(1,1,A),(2,6,K),(7,10,S),(11,18,G),(19,21,E),(22,22,L),(23,23,E),(24,28,L),(29,29,O),(30,30,L),(31,35,O),(36,45,C),(46,50,M)],
72:[(1,2,A),(3,5,K),(6,10,S),(11,17,G),(18,21,E),(22,22,L),(23,23,E),(24,28,L),(29,35,O),(36,42,C),(43,50,M)],
71:[(1,2,A),(3,8,K),(9,9,S),(10,18,G),(19,21,E),(22,27,L),(28,35,O),(36,44,C),(45,50,M)],
70:[(1,2,A),(3,5,K),(6,9,S),(10,16,G),(17,21,E),(22,27,L),(28,33,O),(34,41,C),(42,50,M)]
}
overrides={
'80-43':[C,M], '79-24':[E], '79-46':[C], '78-10':[G],
'77-8':[K], '77-12':[I], '77-27':[I], '77-32':[C],
'76-15':[G], '76-46':[I], '75-7':[K], '75-38':[I], '75-39':[C],
'74-23':[E], '73-25':[E], '70-48':[I], '73-4':[A], '73-9':[K], '73-19':[I], '73-24':[I],
'72-10':[K,S], '72-47':[I], '72-48':[I], '72-50':[I],
'71-7':[S], '71-12':[S], '71-18':[I], '71-30':[I], '71-37':[O], '71-45':[I],
'70-10':[G], '70-22':[I], '70-50':[I]
}
# A distractor from another era never expands the question's era tags.
for q in bank:
 q['eras']=overrides.get(q['id']) or [era for start,end,era in ranges[q['exam']] if start<=q['number']<=end]
 assert q['eras'],q['id']
 q.pop('heading',None)
curated=json.loads(Path('src/entities/question/data/curated.json').read_text())
for q in curated:q['collections']=['joseon-early']
late=[
(77,28,'박규수와 임술 농민 봉기','진주 안핵사 박규수의 보고는 철종 때 임술 농민 봉기(1862)의 상황이다. 이후 삼정의 문란을 시정하기 위해 삼정이정청이 설치되었다.',[
('진주 안핵사 박규수','철종','원래 메모의 “전주”를 “진주”로 교정. 1862년 진주 농민 봉기 수습을 위해 파견되었다.'),('삼정이정청','철종','임술 농민 봉기를 계기로 1862년 설치한 삼정 개혁 기구.'),('황사영 백서·외국 군대 출병 요청','순조 · 신유박해','1801년 신유박해 때 작성. 철종 때의 사건보다 앞선다.')]),
(75,23,'병자호란과 삼학사','남한산성·삼학사·심양으로 압송된 척화파의 단서로 (가)는 병자호란이다. 병자호란 중 김준룡이 광교산 전투에서 승리하였다.',[
('이괄의 난','인조','인조반정(1623) 공신 책봉에 대한 불만 등이 배경이 된 1624년의 반란. 인조반정 자체와는 별개 사건이다.'),('송상현·동래성 항전','임진왜란','1592년 일본군에 맞서 동래성에서 항전. 병자호란과 구분한다.')]),
(75,27,'김조순과 순조','세도 정치의 주요 인물이자 왕의 장인인 김조순의 단서로 (가)는 순조다. 순조 때 홍경래의 난이 일어났다.',[
('이만손·영남 만인소','고종 · 위정척사 운동','1881년 조선책략 유포에 반발하여 올린 상소.'),('이시애의 난','세조','1467년 길주를 근거지로 일어났다. 홍경래의 난(순조)과 구분한다.')]),
(74,22,'예송부터 신임사화 사이','기해예송(현종, 1659)과 목호룡의 고변(경종, 1722) 사이를 묻는다. 1689년 숙종 때 기사환국으로 인현 왕후가 폐위되고 남인이 집권하였다.',[
('기축옥사·정여립 모반 사건','선조','1589년 정여립 모반 사건을 빌미로 동인이 피해를 입었다. 효종 때 송시열의 기축봉사와 구분한다.'),('목호룡 고변·연잉군과 노론의 위기','경종 · 신임사화','1722년 임인옥사. 연잉군은 훗날 영조이며, 당시 왕은 경종이다. “노른”은 “노론”으로 교정.')]),
(76,25,'영조의 청계천 준천','준천사 설치·청계천 준설·신문고 부활의 단서로 왕은 영조다. 속대전 편찬도 영조의 정책이다.',[
('청계천 정비·준천 사업','영조','재건보다는 “준천(준설)”로 기억. 하천 바닥의 토사를 파내어 범람을 방지했다.'),('총융청·수어청 창설','인조','수도 외곽과 남한산성 방어를 위한 군영. 효종의 북벌과 혼동하지 않는다.')]),
(75,24,'영조와 이인좌의 난','이인좌의 난을 평정한 왕은 영조다. 탕평 교서 반포와 탕평비 건립을 연결한다.',[
('이인좌의 난','영조','1728년 발생한 무신란. 영조 초기의 반란이다.'),('금위영 설치','숙종','1682년 설치. 중앙 군영인 5군영 체제를 완성하였다.')]),
(74,25,'신유박해와 황사영 백서','순조 1년(1801), 황사영의 백서, 제천 배론성지의 단서로 (가)는 신유박해다. 이승훈·정약용 등이 연루되어 처벌되었다.',[
('박규수 안핵사 파견','철종 · 임술 농민 봉기','1862년 진주 농민 봉기 수습을 위한 파견. 순조 때 신유박해의 수습 조치가 아니다.')]),
(71,22,'이괄의 난과 병자호란 사이','(가)는 이괄의 난(1624), (나)는 병자호란 후 소현 세자가 심양에 인질로 간 지 5년가량 지난 상황이다. 그 사이인 1636~1637년 병자호란 때 김상헌이 남한산성에서 항전을 주장했다.',[
('소현 세자·심양 체류 5년','병자호란 이후','“5년”은 병자호란의 지속 기간이 아니라 인질로 심양에 들어간 뒤의 체류 기간이다.'),('이괄의 난','인조','1624년 발생. 인조반정 이듬해이며 병자호란보다 앞선다.')]),
(70,24,'정조와 규장각 검서관','규장각 검서관에 이덕무·박제가·유득공·서이수를 등용한 왕은 정조다. 거중기를 활용한 수원 화성 축조도 정조와 연결한다.',[
('수원 화성 축조','정조','거중기·정약용·장용영과 함께 기억한다.'),('삼정이정청 설치','철종','1862년 임술 농민 봉기 이후 설치되었다.')])
]
byid={q['id']:q for q in bank}
for exam,number,title,explanation,notes in late:
 q=byid[f'{exam}-{number}']
 q['title']=title;q['explanation']=explanation;q['collections']=['joseon-late']
 q['notes']=[dict(clue=clue,answer=answer,memo=memo) for clue,answer,memo in notes]
for c in curated:
 id=c['id']
 if id in byid:
  q=byid[id]
  for key in ['title','explanation','choiceNotes','choices','notes','collections']:q[key]=c[key]
 else:
  c['image']='/'+c['image'];c['eras']=[E]
  bank.append(c)
# Personal subject collection; era tags continue to follow each question's prompt.
for id in ['76-22','75-25']:
 byid[id]['collections']=['joseon-society']
byid['76-22']['explanation']='옥당은 홍문관의 별칭이다. 홍문관은 궁중 도서·문한과 국왕 자문을 맡았으며 사헌부·사간원과 함께 3사를 이루었다.'
byid['75-25']['explanation']='장용영은 정조가 설치한 친위 군영이다. 조선 후기에는 한글 소설의 독자층이 넓어지고 세책가에서 책을 빌려 읽었다.'
byid['76-22']['notes']=[dict(clue='옥당',answer='홍문관',memo='')]
# Explanations are authored separately from official answers and personal memos.
for id,notes in json.loads(Path('scripts/personal-choice-explanations.json').read_text()).items():
 assert len(notes)==5
 byid[id]['choiceNotes']=notes
for review in json.loads(Path('scripts/joseon-economy-review.json').read_text()):
 q=byid[review['id']]
 q.update({key:value for key,value in review.items() if key!='id'})
 q['collections']=['joseon-economy']
 assert len(q['choiceNotes'])==5
for review in json.loads(Path('scripts/daewongun-review.json').read_text()):
 q=byid[review['id']]
 q.update({key:value for key,value in review.items() if key!='id'})
 q['collections']=['daewongun']
 assert len(q['choiceNotes'])==5
for review in json.loads(Path('scripts/modern-reforms-review.json').read_text()):
 q=byid[review['id']]
 q.update({key:value for key,value in review.items() if key!='id'})
 q['collections']=['modern-reforms']
 assert len(q['choiceNotes'])==5
# Coverage is checked against question targets rather than distractor eras.
for id,review in json.loads(Path('scripts/occupation-explanations.json').read_text()).items():
 assert len(review['choiceNotes'])==5
 byid[id].update(review)
for id,review in json.loads(Path('scripts/era-explanations.json').read_text()).items():
 assert len(review['choiceNotes'])==5
 byid[id].update(review)
# Personal additions may include official questions outside the regular exam range.
for filename,collection in [('empire-review.json','donghak-empire'),('sovereignty-review.json','sovereignty'),('opening-culture-review.json','opening-culture'),('1920s-review.json','1920s-flow'),('independence-review.json','independence'),('occupation-culture-review.json','occupation-culture'),('liberation-review.json','liberation'),('rhee-war-review.json','rhee-war'),('park-review.json','park-government'),('recent-governments-review.json','recent-governments'),('inter-korean-democracy-review.json','inter-korean-democracy')]:
 for review in json.loads((Path('scripts')/filename).read_text()):
  q=byid.get(review['id'])
  if q is None:
   q=dict(review)
   bank.append(q)
   byid[q['id']]=q
  else:
   q.update({key:value for key,value in review.items() if key!='id'})
  q['collections']=[collection]
  assert len(q['choiceNotes'])==5
# Keep 550 regular questions plus requested personal questions from exams 65, 67, 68 and 69.
assert len([q for q in bank if q['exam']>=70])==550
assert len(bank)==562
for e in range(70,81):
 group=[q for q in bank if q['exam']==e]
 assert len(group)==50 and sum(q['points'] for q in group)==100
for q in bank:
 assert q.get('explanation','').strip(),q['id']
 assert len(q.get('choiceNotes',[]))==5 and all(note.strip() for note in q['choiceNotes']),q['id']
 q.pop('text',None)
Path('src/entities/question/data/questions.json').write_text(json.dumps(bank,ensure_ascii=False,separators=(',',':')))
Path('scripts/era-classification.json').write_text(json.dumps({'ranges':ranges,'overrides':overrides},ensure_ascii=False,indent=2))
print('550 regular questions + 12 retained personal questions; early collection 10; late collection 9')
print('choice notes:',sum(len(q.get('notes',[])) for q in bank))
