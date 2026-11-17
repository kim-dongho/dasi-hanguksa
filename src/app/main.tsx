import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from '@/shared/lib';
import { App } from './App';
import 'pretendard/dist/web/variable/pretendardvariable.css';
import '@/shared/styles/global.css';
initializeTheme();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
