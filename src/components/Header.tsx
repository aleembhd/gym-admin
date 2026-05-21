import { Search, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import eliteGymLogo from '../images/elitegym-logo.jpeg';

interface HeaderProps {
  showSearch: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  isRefreshing: boolean;
  onSearchToggle: () => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export default function Header({
  showSearch,
  isSearchOpen,
  searchQuery,
  isRefreshing,
  onSearchToggle,
  onSearchChange,
  onRefresh,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <img src={eliteGymLogo} alt="Elite Gym" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-indigo-600 font-extrabold">Elite</span>
          <span className="text-slate-800 font-extrabold -ml-1.5">Gym</span>
        </h1>
        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              onClick={onSearchToggle}
              title="Search members"
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all"
            >
              {isSearchOpen ? <X size={16} /> : <Search size={16} />}
            </button>
          )}
          <button
            onClick={onRefresh}
            title="Refresh members"
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            Owner Access
          </div>
        </div>
        </div>

        <AnimatePresence initial={false}>
          {showSearch && isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-2 border border-slate-200">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder="Search by name"
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-slate-400 hover:text-slate-600 active:scale-95 transition-all"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
