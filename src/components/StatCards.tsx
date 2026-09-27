import { Plus } from 'lucide-react';
import type { MemberFilter } from '../types';

interface StatCardsProps {
  expiredCount: number;
  activeCount: number;
  receiptsCount: number;
  activeFilter: MemberFilter;
  onFilterChange: (filter: MemberFilter) => void;
  onEnroll: () => void;
}

export default function StatCards({
  expiredCount,
  activeCount,
  receiptsCount,
  activeFilter,
  onFilterChange,
  onEnroll,
}: StatCardsProps) {
  const cardBase =
    'text-left rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm transition-all duration-200 active:scale-[0.97] hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

  const ring = (filter: MemberFilter) =>
    activeFilter === filter ? 'ring-2 ring-indigo-600 border-transparent shadow-md' : '';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Expired — status: red */}
      <button
        onClick={() => onFilterChange('expired')}
        className={`${cardBase} ${ring('expired')} bg-gradient-to-br from-rose-50 to-white`}
      >
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">
            Expired
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-0.5" />
        </div>
        <p className="text-3xl sm:text-4xl font-extrabold text-rose-600 mt-2 leading-none tabular-nums">
          {String(expiredCount).padStart(2, '0')}
        </p>
        <p className="text-xs font-medium text-slate-600 mt-2">members to renew</p>
      </button>

      {/* Enroll (action) — accent: indigo */}
      <button
        onClick={onEnroll}
        className={`${cardBase} bg-gradient-to-br from-indigo-50 to-white`}
      >
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
            Action
          </span>
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Plus size={14} strokeWidth={2.5} />
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-2 leading-tight">
          Enroll
        </p>
        <p className="text-xs font-medium text-slate-600 mt-2">new membership</p>
      </button>

      {/* Active — status: green */}
      <button
        onClick={() => onFilterChange('active')}
        className={`${cardBase} ${ring('active')} bg-gradient-to-br from-emerald-50 to-white`}
      >
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            Active
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-0.5" />
        </div>
        <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-2 leading-none tabular-nums">
          {String(activeCount).padStart(2, '0')}
        </p>
        <p className="text-xs font-medium text-slate-600 mt-2">in good standing</p>
      </button>

      {/* Receipts — accent: indigo */}
      <button
        onClick={() => onFilterChange('receipts')}
        className={`${cardBase} ${ring('receipts')} bg-gradient-to-br from-indigo-50 to-white`}
      >
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
            Receipts
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-0.5" />
        </div>
        <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 mt-2 leading-none tabular-nums">
          {String(receiptsCount).padStart(2, '0')}
        </p>
        <p className="text-xs font-medium text-slate-600 mt-2">waiting to send</p>
      </button>
    </div>
  );
}
