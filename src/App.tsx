import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Anchor } from 'lucide-react';
import { Sidebar, type PageId } from '@/components/Sidebar';
import { useSystemStatus, StatusBanner } from '@/components/SystemStatus';
import { Landing } from '@/pages/Landing';
import { CommandCenter } from '@/pages/CommandCenter';
import { Forecast } from '@/pages/Forecast';
import { CharterDecision } from '@/pages/CharterDecision';
import { WhatIf } from '@/pages/WhatIf';
import { Optimization } from '@/pages/Optimization';
import { MarketData } from '@/pages/MarketData';
import { ModelIntelligence } from '@/pages/ModelIntelligence';
import { ScenarioHistory } from '@/pages/ScenarioHistory';
import { MaritimeOperations } from '@/pages/MaritimeOperations';

function App() {
  const [entered, setEntered] = useState(false);
  const [page, setPage] = useState<PageId>('command');
  const [mobileNav, setMobileNav] = useState(false);
  const status = useSystemStatus();

  const navigate = (p: PageId) => setPage(p);

  if (!entered) {
    return <Landing onEnter={() => setEntered(true)} status={status} />;
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <StatusBanner status={status} />
      <div className="flex">
        <Sidebar
          current={page}
          onNavigate={navigate}
          status={status}
          mobileOpen={mobileNav}
          onCloseMobile={() => setMobileNav(false)}
        />
        <main className="flex min-h-screen w-full flex-col lg:pl-[260px]">
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-ink-950/90 px-4 py-3 backdrop-blur-xl lg:hidden">
            <button onClick={() => setMobileNav(true)} className="rounded-md p-1.5 text-slate-300 hover:bg-white/5" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Anchor className="h-4 w-4 text-accent-300" />
              <span className="text-sm font-bold tracking-wide text-white">FREIGHT</span>
            </div>
            <div className="w-7" />
          </div>
          <div className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <AnimatePresence mode="wait">
                <motion.div key={page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                  {page === 'command' && <CommandCenter onNavigate={navigate} />}
                  {page === 'forecast' && <Forecast />}
                  {page === 'charter' && <CharterDecision onNavigate={navigate} />}
                  {page === 'whatif' && <WhatIf />}
                  {page === 'optimize' && <Optimization onNavigate={navigate} />}
                  {page === 'market' && <MarketData />}
                  {page === 'model' && <ModelIntelligence />}
                  {page === 'scenarios' && <ScenarioHistory />}
                  {page === 'maritime' && <MaritimeOperations onNavigate={navigate} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
