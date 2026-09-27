import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import Header from './components/Header';
import { usePullToRefresh } from './hooks/usePullToRefresh';
import StatCards from './components/StatCards';
import MembersTable from './components/MembersTable';
import EnrollModal from './components/EnrollModal';
import BroadcastModal from './components/BroadcastModal';
import { useMembers } from './hooks/useMembers';
import { getExpiryDate, getMemberStatus } from './utils/helpers';
import type { Member, MemberFilter } from './types';

const PAGE_SIZE = 8;

const FILTER_TABS: { key: MemberFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'expired', label: 'Expired' },
  { key: 'active', label: 'Active' },
  { key: 'receipts', label: 'Receipts' },
];

export default function App() {
  const {
    members,
    orderedMembers,
    loading,
    isRefreshing,
    fetchMembers,
    isReceiptSent,
    isReceiptSending,
    handleSendReceipt,
    handleCreateMember,
    isAddingMember,
  } = useMembers();

  const [filter, setFilter] = useState<MemberFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  // Counts for the stat cards (from the full member set, ignoring search).
  const counts = useMemo(() => {
    let expired = 0;
    let active = 0;
    let receipts = 0;
    members.forEach(m => {
      const status = getMemberStatus(m);
      if (status === 'expired') expired += 1;
      if (status === 'active') {
        active += 1;
        if (!isReceiptSent(m.id)) receipts += 1;
      }
    });
    return { expired, active, receipts };
  }, [members, isReceiptSent]);

  const activeMembers = useMemo(
    () => members.filter(m => getMemberStatus(m) === 'active'),
    [members],
  );

  // Apply the selected filter, sort by relevance for that tab, then search.
  const filteredMembers = useMemo(() => {
    let list: Member[] = [...orderedMembers];

    if (filter === 'expired') {
      list = list.filter(m => getMemberStatus(m) === 'expired');
      // Most overdue first = oldest expiry date at the top.
      list.sort((a, b) => {
        const ea = getExpiryDate(a.dateOfJoining, a.validityDays)?.getTime() ?? Infinity;
        const eb = getExpiryDate(b.dateOfJoining, b.validityDays)?.getTime() ?? Infinity;
        return ea - eb;
      });
    } else if (filter === 'active') {
      list = list.filter(m => getMemberStatus(m) === 'active');
      // Soonest to expire first = fewest days left at the top.
      list.sort((a, b) => a.daysLeft - b.daysLeft);
    } else if (filter === 'receipts') {
      list = list.filter(m => getMemberStatus(m) === 'active' && !isReceiptSent(m.id));
      list.sort((a, b) => a.daysLeft - b.daysLeft);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        m =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.toLowerCase().includes(q),
      );
    }
    return list;
  }, [orderedMembers, filter, searchQuery, isReceiptSent]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Per-tab counts shown on the filter pills.
  const tabCounts: Record<MemberFilter, number> = {
    all: members.length,
    expired: counts.expired,
    active: counts.active,
    receipts: counts.receipts,
  };

  const changeFilter = (next: MemberFilter) => {
    setFilter(next);
    setPage(1);
  };

  // Pull-to-refresh (mobile): drag down from the top to reload members.
  const { pullDistance, isRefreshing: isPulling, threshold } = usePullToRefresh({
    onRefresh: () => fetchMembers(true),
    disabled: enrollOpen || broadcastOpen,
  });
  const pullProgress = Math.min(pullDistance / threshold, 1);

  const handleEnrollSubmit = async (payload: {
    name: string;
    phone: string;
    email: string;
    planMonths: number;
    amount: number;
  }) => {
    await handleCreateMember(payload);
    setEnrollOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 text-slate-900 font-sans">
      <Header
        searchQuery={searchQuery}
        isRefreshing={isRefreshing}
        onSearchChange={value => {
          setSearchQuery(value);
          setPage(1);
        }}
        onRefresh={() => fetchMembers(true)}
        onBroadcast={() => setBroadcastOpen(true)}
      />

      {/* Pull-to-refresh indicator (mobile) */}
      {(pullDistance > 0 || isPulling) && (
        <div
          className="sm:hidden flex items-center justify-center overflow-hidden"
          style={{ height: pullDistance }}
        >
          <div
            className="flex items-center gap-2 text-xs font-semibold text-slate-500"
            style={{ opacity: pullProgress }}
          >
            <RefreshCw
              size={16}
              className={isPulling ? 'animate-spin text-indigo-600' : 'text-slate-400'}
              style={{ transform: isPulling ? undefined : `rotate(${pullProgress * 270}deg)` }}
            />
            {isPulling ? 'Refreshing...' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}

      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 transition-transform"
        style={{ transform: pullDistance > 0 ? `translateY(${pullDistance * 0.15}px)` : undefined }}
      >
        {/* Title */}
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Operations Floor · Today
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Membership control
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {members.length} member{members.length === 1 ? '' : 's'} · 1 location
          </p>
        </div>

        {/* Stat cards */}
        <StatCards
          expiredCount={counts.expired}
          activeCount={counts.active}
          receiptsCount={counts.receipts}
          activeFilter={filter}
          onFilterChange={changeFilter}
          onEnroll={() => setEnrollOpen(true)}
        />

        {/* Table panel */}
        <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm shadow-sm p-4 sm:p-5">
          {/* Filter pills + legend — sticky on mobile so it stays reachable while scrolling */}
          <div
            className="sticky z-20 py-2 mb-2 bg-white/95 backdrop-blur-md rounded-xl sm:static sm:py-0 sm:mb-4 sm:bg-transparent sm:backdrop-blur-none sm:rounded-none flex flex-wrap items-center justify-between gap-3"
            style={{ top: 'var(--header-height, 52px)' }}
          >
            <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              {FILTER_TABS.map(tab => {
                const isActive = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => changeFilter(tab.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold tabular-nums ${
                        isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {tabCounts[tab.key]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> 0 days
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> ≤7 days
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> active
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
              />
            </div>
          ) : (
            <>
              <MembersTable
                members={pagedMembers}
                isReceiptSent={isReceiptSent}
                isReceiptSending={isReceiptSending}
                onSendReceipt={handleSendReceipt}
                showReceiptAction={filter === 'all' || filter === 'receipts'}
                filter={filter}
                hasSearch={searchQuery.trim().length > 0}
              />

              {/* Footer: showing + pagination */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium">
                  Showing {filteredMembers.length === 0 ? 0 : pagedMembers.length} of{' '}
                  {members.length}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition-all"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition-all"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[11px] font-medium uppercase tracking-widest text-slate-400 py-2">
          Elite Gym · Member Ops Console
        </p>
      </main>

      <EnrollModal
        isOpen={enrollOpen}
        isSubmitting={isAddingMember}
        onClose={() => setEnrollOpen(false)}
        onSubmit={handleEnrollSubmit}
      />

      <BroadcastModal
        isOpen={broadcastOpen}
        activeMembers={activeMembers}
        onClose={() => setBroadcastOpen(false)}
      />
    </div>
  );
}
