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
    'text-left rounded-2xl p-4 sm:p-5 border shadow-sm transition-transform duration-150 active:scale-[0.97] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900';

  const ring = (filter: MemberFilter) =>
    activeFilter === filter ? 'ring-2 ring-slate-900 border-transparent' : 'border-transparent';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Expired */}
      <button
        onClick={() => onFilterChange('expired')}
        className={`${cardBase} ${ring('expired')} bg-gradient-to-br from-rose-50 to-slate-50`}
      >
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Expired</span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-0.5" />
        </div>
        <p className="text-3xl sm:text-4xl font-extrabold text-rose-600 mt-2 leading-none tabular-nums">
          {String(expiredCount).padStart(2, '0')}
        </p>
        <p className="text-xs text-slate-500 mt-2">members to renew</p>
      </button>

      {/* Enroll (action) */}
      <button
        onClick={onEnroll}
        className={`${cardBase} border-transparent bg-gradient-to-br from-sky-50 to-blue-50 hover:from-sky-100`}
      >
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-500">Action</span>
          <Plus size={16} className="text-sky-500" />
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 mt-2 leading-tight">Enroll</p>
        <p className="text-xs text-slate-500 mt-2">new membership</p>
      </button>

      {/* Active */}
      <button
        onClick={() => onFilterChange('active')}
        className={`${cardBase} ${ring('active')} bg-gradient-to-br from-emerald-50 to-green-50`}
      >
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Active</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-0.5" />
        </div>
        <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-2 leading-none tabular-nums">
          {String(activeCount).padStart(2, '0')}
        </p>
        <p className="text-xs text-slate-500 mt-2">in good standing</p>
      </button>

      {/* Receipts */}
      <button
        onClick={() => onFilterChange('receipts')}
        className={`${cardBase} ${ring('receipts')} bg-gradient-to-br from-emerald-50 to-teal-50`}
      >
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">Receipts</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-0.5" />
        </div>
        <p className="text-3xl sm:text-4xl font-extrabold text-teal-600 mt-2 leading-none tabular-nums">
          {String(receiptsCount).padStart(2, '0')}
        </p>
        <p className="text-xs text-slate-500 mt-2">waiting to send</p>
      </button>
    </div>
  );
}
