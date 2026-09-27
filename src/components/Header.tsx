import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, RefreshCw, Megaphone, X } from 'lucide-react';
import eliteGymLogo from '../images/elitegym-logo.jpeg';

interface HeaderProps {
  searchQuery: string;
  isRefreshing: boolean;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onBroadcast: () => void;
}

export default function Header({
  searchQuery,
  isRefreshing,
  onSearchChange,
  onRefresh,
  onBroadcast,
}: HeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  // Publish the header's real height as a CSS variable so sticky elements
  // below it can offset correctly on any device (fonts/zoom vary the height).
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const setVar = () => {
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`);
    };
    setVar();

    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    window.addEventListener('resize', setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
    };
  }, []);

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    onSearchChange('');
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src={eliteGymLogo}
            alt="Elite Gym"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover shadow-sm"
          />
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-tight text-slate-900">
              ELITE <span className="text-indigo-600">GYM</span>
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">
              Member Ops
            </p>
          </div>
        </div>

        {/* Desktop search (always visible from sm up) */}
        <div className="hidden sm:flex flex-1 min-w-0 items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search name, email, mobile..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* Spacer pushes actions right on mobile */}
        <div className="flex-1 sm:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile-only search toggle */}
          <button
            onClick={() => setMobileSearchOpen(v => !v)}
            title="Search"
            className={`sm:hidden w-9 h-9 flex items-center justify-center rounded-xl active:scale-95 transition-all ${
              mobileSearchOpen
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Search size={16} />
          </button>

          <button
            onClick={onRefresh}
            title="Refresh members"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={onBroadcast}
            title="Broadcast"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <Megaphone size={15} className="text-indigo-600" />
            <span className="hidden sm:inline">Broadcast</span>
          </button>

          <div className="flex items-center gap-2 pl-0.5 sm:pl-1">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              KM
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-sm font-bold text-slate-800">Kiran Mahendra</p>
              <p className="text-[10px] text-slate-400 font-medium">Owner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile expandable search bar */}
      <AnimatePresence initial={false}>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="sm:hidden overflow-hidden border-t border-slate-100"
          >
            <div className="px-4 py-2.5">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2.5 border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <Search size={15} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder="Search name, email, mobile..."
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                  autoFocus
                />
                <button
                  onClick={closeMobileSearch}
                  className="text-slate-400 hover:text-slate-600 active:scale-95 transition-all shrink-0"
                  title="Close search"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
