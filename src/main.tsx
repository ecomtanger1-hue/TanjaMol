import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { DirectionProvider } from '@/components/ui/direction';
import { TooltipProvider } from '@/components/ui/tooltip';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DirectionProvider dir="rtl" direction="rtl">
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </DirectionProvider>
  </StrictMode>,
);
