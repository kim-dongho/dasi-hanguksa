"""Extract official exam crops. Requires PyMuPDF/Pillow; scanned pages use OCR sidecars."""
import json,re,sys
from pathlib import Path
import fitz
from PIL import Image,ImageChops,ImageOps,ImageDraw
root=Path('tmp/pdfs')
sources={s['exam']:s for s in json.loads((root/'sources.json').read_text())}
scan_exams={73,74,78,79}
items=[];missing=[]
for exam in range(80,69,-1):
 doc=fitz.open(root/f'{exam}-questions.pdf')
 anchors=[];lines_by_page={}
 for page_index,page in enumerate(doc):
  width,height=page.rect.width,page.rect.height
  lines=[]
  if exam in scan_exams:
   raw=json.loads((root/f'ocr/{exam}-{page_index+1}.png.json').read_text())
   lines=[{'text':l['text'],'x':l['x']*width,'y':l['y']*height,'right':l['right']*width,'bottom':l['bottom']*height} for l in raw]
  else:
   for block in page.get_text('dict')['blocks']:
    for line in block.get('lines',[]):
     text=''.join(s['text'] for s in line['spans']).replace('\x08','').strip()
     box=line['bbox'];lines.append(dict(text=text,x=box[0],y=box[1],right=box[2],bottom=box[3]))
  lines_by_page[page_index]=lines
  for line in lines:
   match=re.match(r'^(\d{1,2})\.',line['text'])
   x=line['x']/width
   if match and 1<=int(match[1])<=50 and (0.04<x<0.075 or 0.495<x<0.525):
    anchors.append(dict(number=int(match[1]),page=page_index,col=0 if x<.5 else 1,top=line['y'],heading=line['text']))
 assert len(anchors)==50 and len({a['number'] for a in anchors})==50,(exam,len(anchors))
 adoc=fitz.open(root/f'{exam}-answers.pdf');answertext='\n'.join(p.get_text() for p in adoc)
 triples=re.findall(r'(?:^|\n)(\d{1,2})\s*\n([①②③④⑤1-5])\s*\n([1-3])(?=\s*\n)',answertext)
 answers={int(n):(int(a) if a in '12345' else '①②③④⑤'.index(a)+1,int(v)) for n,a,v in triples[:50]}
 assert len(answers)==50,(exam,len(answers))
 assert sum(p for a,p in answers.values())==100,(exam,'point sum')
 out=Path('public/questions')/str(exam);out.mkdir(parents=True,exist_ok=True)
 for anchor in sorted(anchors,key=lambda a:a['number']):
  page=doc[anchor['page']];w,h=page.rect.width,page.rect.height
  # The official sheets share two columns. Keep title, passage, graphics, options and point label.
  left,right=(.054*w,.494*w) if anchor['col']==0 else (.509*w,.951*w)
  top=anchor['top']-5
  next_y=[a['top']-2 for a in anchors if a['page']==anchor['page'] and a['col']==anchor['col'] and a['top']>anchor['top']+10]
  bottom=min(next_y+[.945*h])
  rect=fitz.Rect(left,top,right,bottom)
  number=anchor['number'];dest=out/f'{number}.webp'
  if not dest.exists() or '--force' in sys.argv:
   pix=page.get_pixmap(matrix=fitz.Matrix(2.5,2.5),clip=rect,alpha=False)
   image=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
   difference=ImageChops.difference(image,Image.new('RGB',image.size,'white')).convert('L').point(lambda v:255 if v>35 else 0)
   bounds=difference.getbbox()
   if bounds:
    l,t,r,b=bounds;image=image.crop((max(0,l-10),max(0,t-10),min(image.width,r+10),min(image.height,b+10)))
   image.save(dest,'WEBP',quality=92,method=4)
  with Image.open(dest) as image:iw,ih=image.size
  col_lines=[l for l in lines_by_page[anchor['page']] if top<=l['y']<bottom and left-4<=(l['x']+l['right'])/2<=right+4]
  text='\n'.join(l['text'] for l in sorted(col_lines,key=lambda l:(round(l['y']/4)*4,l['x'])))
  source=sources[exam]
  q=dict(id=f'{exam}-{number}',exam=exam,number=number,page=anchor['page']+1,answer=answers[number][0],points=answers[number][1],image=f'/questions/{exam}/{number}.webp',width=iw,height=ih,text=text,heading=anchor['heading'],source={'pageUrl':source['pageUrl'],'questions':{'url':source['questions']['url']},'answers':{'url':source['answers']['url']}})
  items.append(q)
 print('EXTRACTED',exam,'50 questions, answer sheet total 100 points',flush=True)
Path('tmp/pdfs/bank-unclassified.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
# Per-exam contact sheets for visual boundary checks.
for exam in range(80,69,-1):
 sheet=Image.new('RGB',(240*10,360*5),'#e8e8e0');draw=ImageDraw.Draw(sheet)
 for q in [q for q in items if q['exam']==exam]:
  i=q['number']-1;x=(i%10)*240;y=(i//10)*360
  image=Image.open('public'+q['image']);image.thumbnail((228,325))
  sheet.paste(image,(x+(240-image.width)//2,y+26));draw.text((x+8,y+7),f'{exam} Q{q["number"]} / {q["points"]}pt',fill='black')
 sheet.save(root/f'contact-{exam}.jpg',quality=90)
print('TOTAL',len(items),flush=True)
