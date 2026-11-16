import { useStoredState } from '@/shared/lib';
const empty: Record<string,string[]> = {};
export function ChoiceMemo({questionId, label}: {questionId:string; label:string}) {
  const [raw, update, saved] = useStoredState('original-exam-choice-memos-v1', empty);
  const memos = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : empty;
  const current = Array.isArray(memos[questionId]) ? memos[questionId] : [];
  return <aside className="rounded-lg border border-[#d8e0cb] bg-[#eef1e4] px-3.5 py-4 min-[900px]:sticky min-[900px]:top-4" aria-label="보기별 나의 메모"><div className="[&>span]:text-[9px] [&>span]:tracking-wide [&>span]:text-muted [&>h2]:mb-2 [&>h2]:mt-1 [&>h2]:text-base [&>h2]:font-semibold [&>p]:mb-4 [&>p]:text-[10px] [&>p]:leading-5 [&>p]:text-muted"><span>나의 선지 분석</span><h2>{label} 메모</h2><p>각 보기가 어느 왕·인물·사건인지 적어보세요.</p></div><div className="flex flex-col gap-2.5">{['①','②','③','④','⑤'].map((mark,index) => <label className="flex items-start gap-2 [&>span]:whitespace-nowrap [&>span]:pt-2 [&>span]:text-xs [&>span]:text-[#799265] [&>textarea]:max-h-32 [&>textarea]:min-h-[56px] [&>textarea]:w-full [&>textarea]:min-w-0 [&>textarea]:resize-y [&>textarea]:border-[#d8e1c8] [&>textarea]:bg-[#fbfcf4] [&>textarea]:px-2 [&>textarea]:py-1.5 [&>textarea]:text-xs [&>textarea]:leading-5 [&>textarea]:placeholder:text-[10px]" key={mark}><span>{mark}번</span><textarea aria-label={`${mark}번 메모`} rows={2} value={typeof current[index] === 'string' ? current[index] : ''} placeholder="왕·인물·사건, 헷갈리는 점" onChange={event => {
    const next = [...current];next[index] = event.target.value;update({...memos,[questionId]:next});
  }}/></label>)}</div><p className="mb-0 mt-3 border-t border-dashed border-[#d4dec4] pt-2.5 text-[9px] text-muted" role="status">{saved?'현재 브라우저에 자동 저장':'저장 공간에 접근할 수 없어 이 탭에서만 유지돼요.'}</p></aside>;
}
