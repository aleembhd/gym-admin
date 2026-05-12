import { RefreshCw } from 'lucide-react';
import eliteGymLogo from '../images/elitegym-logo.jpeg';

interface HeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function Header({ isRefreshing, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <img src={eliteGymLogo} alt="Elite Gym" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-indigo-600 font-extrabold">Elite</span>
          <span className="text-slate-800 font-extrabold -ml-1.5">Gym</span>
        </h1>
        <div className="flex items-center gap-2">
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
    </header>
  );
}
