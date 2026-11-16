import { useState } from 'react';
import type { StudyNote } from '@/entities/study-note';
type Attempt = {value:string; correct:boolean};
export function ReviewNoteCard({note,quiz,result,onGrade,onRetry}:{note:StudyNote;quiz:boolean;result?:Attempt;onGrade:(value:string)=>void;onRetry:()=>void}) {
  const [value,setValue] = useState('');
  const visible = !quiz || !!result;
  return <article className={`note-card ${result?.correct?'done':''}`}><div className="flex items-center gap-4 text-[10px] text-muted [&>span:first-child]:font-semibold [&>span:first-child]:text-moss [&>span:last-child]:ml-auto"><span>Q. {note.number}</span><span>{note.topic}</span>{visible?<span>{note.date}</span>:null}</div><h3>{note.question}</h3>
    {quiz && !result?<form className="flex max-w-xl gap-2.5 [&>input]:min-w-0 [&>input]:flex-1" onSubmit={e=>{e.preventDefault();if(value.trim())onGrade(value.trim());}}><label className="sr-only" htmlFor={`note-${note.id}`}>정답 입력</label><input id={`note-${note.id}`} placeholder={note.answer.includes('/')?'두 요소를 모두 입력':'왕·인물·사건 입력'} value={value} onChange={e=>setValue(e.target.value)} required/><button className="primary">채점</button></form>:null}
    {result&&quiz?<p className={result.correct?'green':'rust'} role="status">{result.correct?'정답이에요!':'다시 기억해 봐요.'} · 내 답: {result.value}</p>:null}
    {visible?<><div className="flex items-center gap-3 text-xs [&>strong]:text-base [&>strong]:text-moss [&>del]:text-[#bf937b]"><span className="muted">{quiz?'정답':'원래 내 답'}</span>{!quiz?<del>{note.wrong}</del>:null}<strong>{note.answer}</strong></div><div className="mt-4 border-t border-dashed border-line pt-3 text-xs leading-7 text-muted [&>a]:mt-3 [&>a]:inline-block [&>a]:text-[10px]"><p>{note.explanation}</p><p><b>혼동 주의</b> {note.contrast}</p><div className="rounded bg-[#eff4e6] px-3 py-2 text-[#6b8751]">{note.memory}</div><a href={note.source} target="_blank" rel="noreferrer">해설 근거 ↗</a></div></>:null}
    {quiz&&result?<button className="text-button" onClick={()=>{setValue('');onRetry();}}>다시 풀기</button>:null}
  </article>;
}
