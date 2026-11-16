import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { QuestionBankPage } from '@/pages/question-bank';
import { PracticePage } from '@/pages/practice';
import { NotebookPage } from '@/pages/notebook';
import { SiteHeader } from '@/widgets/site-header';
function PracticeRoute(){const location=useLocation();const params=new URLSearchParams(location.search);params.delete('q');return <PracticePage key={params.toString()}/>;}
export function App(){return <BrowserRouter><SiteHeader/><Routes><Route path="/" element={<HomePage/>}/><Route path="/notes" element={<NotebookPage/>}/><Route path="/eras" element={<QuestionBankPage mode="era"/>}/><Route path="/exams" element={<QuestionBankPage mode="exam"/>}/><Route path="/wrong" element={<QuestionBankPage mode="wrong"/>}/><Route path="/practice" element={<PracticeRoute/>}/><Route path="/joseon-early-review.html" element={<Navigate replace to="/practice?collection=curated"/>}/><Route path="/joseon-choice-notes.html" element={<Navigate replace to="/notes?collection=choices"/>}/><Route path="/index.html" element={<Navigate replace to="/notes"/>}/><Route path="*" element={<main className="mx-auto max-w-6xl px-5 pb-14 pt-8 md:px-8"><h1>페이지를 찾지 못했어요.</h1><a href="/">학습 서재로 돌아가기</a></main>}/></Routes></BrowserRouter>}
