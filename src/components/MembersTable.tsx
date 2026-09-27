import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  Search,
  Users,
  CalendarX2,
  BadgeCheck,
  ChevronDown,
  Mail,
  Phone,
  CalendarDays,
  CalendarClock,
  AlarmClock,
} from 'lucide-react';
import type { Member, MemberFilter } from '../types';
import { formatDate, formatRupees, getExpiryDate, membershipLabel } from '../utils/helpers';

interface MembersTableProps {
  members: Member[];
  isReceiptSent: (id: string) => boolean;
  isReceiptSending: (id: string) => boolean;
  onSendReceipt: (id: string) => void;
  // WhatsApp send is only shown in the All and Receipts views.
  showReceiptAction: boolean;
  filter: MemberFilter;
  hasSearch: boolean;
}

type Tone = { dot: string; text: string; bg: string; stripe: string };

const NO_PLAN_TONE: Tone = {
  dot: 'bg-slate-300',
  text: 'text-slate-400',
  bg: 'bg-slate-50',
  stripe: 'bg-slate-200',
};

// Color tone for a member based on days left: red at 0, amber <=7, green otherwise.
function toneFor(member: Member): Tone {
  const hasPlan = Boolean(member.dateOfJoining && member.validityDays);
  if (!hasPlan) return NO_PLAN_TONE;
  const { daysLeft } = member;
  if (daysLeft === 0)
    return { dot: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50', stripe: 'bg-rose-500' };
  if (daysLeft <= 7)
    return { dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', stripe: 'bg-amber-400' };
  return {
    dot: 'bg-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    stripe: 'bg-emerald-500',
  };
}

// True when a member is active but within the last week of their plan.
const isExpiringSoon = (member: Member) =>
  Boolean(member.dateOfJoining && member.validityDays) &&
  member.daysLeft > 0 &&
  member.daysLeft <= 7;

// Small amber "Renew soon" nudge.
function RenewSoonTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
      <AlarmClock size={10} /> Renew soon
    </span>
  );
}

// Colored dot + number pill for days left.
function DaysLeftPill({ member, withLabel = false }: { member: Member; withLabel?: boolean }) {
  const hasPlan = Boolean(member.dateOfJoining && member.validityDays);
  if (!hasPlan) {
    return <span className="text-xs text-slate-400 italic">No plan</span>;
  }
  const tone = toneFor(member);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${tone.bg} ${tone.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
      {member.daysLeft}
      {withLabel && <span className="font-semibold">{member.daysLeft === 1 ? 'day' : 'days'} left</span>}
    </span>
  );
}

function ReceiptCell({
  member,
  isReceiptSent,
  isReceiptSending,
  onSendReceipt,
}: {
  member: Member;
  isReceiptSent: (id: string) => boolean;
  isReceiptSending: (id: string) => boolean;
  onSendReceipt: (id: string) => void;
}) {
  if (isReceiptSent(member.id)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-600">
        <CheckCircle2 size={13} /> Sent
      </span>
    );
  }

  if (isReceiptSending(member.id)) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          className="w-3.5 h-3.5 border-2 border-emerald-200 border-t-emerald-600 rounded-full"
        />
        Sending
      </span>
    );
  }

  return (
    <button
      onClick={() => onSendReceipt(member.id)}
      title="Send receipt via WhatsApp"
      aria-label="Send receipt via WhatsApp"
      className="inline-flex items-center justify-center active:scale-90 hover:opacity-80 transition-all"
    >
      <img src="/whatsapp.png" alt="WhatsApp" className="w-9 h-9 object-contain" />
    </button>
  );
}

// Tailored empty-state per tab (and when a search returns nothing).
function EmptyState({ filter, hasSearch }: { filter: MemberFilter; hasSearch: boolean }) {
  let Icon = Users;
  let title = 'No members yet';
  let subtitle = 'Enroll your first member to get started.';

  if (hasSearch) {
    Icon = Search;
    title = 'No matches found';
    subtitle = 'Try a different name, email, or mobile number.';
  } else if (filter === 'expired') {
    Icon = BadgeCheck;
    title = 'No expired members';
    subtitle = "Everyone's membership is active. Nice work.";
  } else if (filter === 'active') {
    Icon = CalendarX2;
    title = 'No active members';
    subtitle = 'Members with a running plan will appear here.';
  } else if (filter === 'receipts') {
    Icon = CheckCircle2;
    title = 'All receipts sent';
    subtitle = 'No active members are waiting for a receipt.';
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <Icon size={22} />
      </div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-[240px]">{subtitle}</p>
    </div>
  );
}

export default function MembersTable({
  members,
  isReceiptSent,
  isReceiptSending,
  onSendReceipt,
  showReceiptAction,
  filter,
  hasSearch,
}: MembersTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (members.length === 0) {
    return <EmptyState filter={filter} hasSearch={hasSearch} />;
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden md:block overflow-x-auto smooth-scroll">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
              <th className="py-3 pr-4 font-bold">Member</th>
              <th className="py-3 px-4 font-bold">Contact</th>
              <th className="py-3 px-4 font-bold">Membership</th>
              <th className="py-3 px-4 font-bold">Started</th>
              <th className="py-3 px-4 font-bold">Expires</th>
              <th className="py-3 px-4 font-bold">Days Left</th>
              <th className="py-3 pl-4 font-bold">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => {
              const expiry = getExpiryDate(member.dateOfJoining, member.validityDays);
              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3.5 pr-4">
                    <span className="text-sm font-bold text-slate-900">{member.name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-xs text-slate-700">{member.email || '—'}</p>
                    <p className="text-xs text-slate-400">{member.phone}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-xs font-semibold text-slate-700">
                      {membershipLabel(member.validityDays)}
                    </p>
                    <p className="text-xs text-emerald-600 font-semibold">
                      {formatRupees(member.amount)}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                    {member.dateOfJoining ? formatDate(member.dateOfJoining) : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                    {expiry ? formatDate(expiry.toISOString()) : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <DaysLeftPill member={member} />
                      {isExpiringSoon(member) && <RenewSoonTag />}
                    </div>
                  </td>
                  <td className="py-3.5 pl-4">
                    {showReceiptAction ? (
                      <ReceiptCell
                        member={member}
                        isReceiptSent={isReceiptSent}
                        isReceiptSending={isReceiptSending}
                        onSendReceipt={onSendReceipt}
                      />
                    ) : isReceiptSent(member.id) ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 size={13} /> Sent
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile compact cards (tap to expand) */}
      <div className="md:hidden space-y-2.5">
        {members.map((member, index) => {
          const expiry = getExpiryDate(member.dateOfJoining, member.validityDays);
          const tone = toneFor(member);
          const isExpanded = expandedId === member.id;
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="relative overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_1px_8px_-2px_rgba(15,23,42,0.08)] hover:shadow-md transition-shadow"
            >
              {/* Status accent stripe */}
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${tone.stripe}`} />

              {/* Tappable summary + right-aligned action */}
              <div className="flex items-stretch">
                <button
                  onClick={() => setExpandedId(prev => (prev === member.id ? null : member.id))}
                  className="flex-1 min-w-0 text-left py-3 pl-4 pr-2 active:bg-slate-50 transition-colors"
                  aria-expanded={isExpanded}
                >
                  {/* Row 1: name + days left */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{member.phone}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <DaysLeftPill member={member} withLabel />
                      <ChevronDown
                        size={15}
                        className={`text-slate-300 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Row 2: membership + amount + expiry, compact single line */}
                  <div className="flex items-center gap-2 text-[11px] min-w-0 mt-2.5">
                    <span className="font-semibold text-slate-700 shrink-0">
                      {membershipLabel(member.validityDays)}
                    </span>
                    <span className="text-emerald-600 font-bold shrink-0">
                      {formatRupees(member.amount)}
                    </span>
                    {expiry && (
                      <span className="text-slate-400 truncate">
                        · exp {formatDate(expiry.toISOString())}
                      </span>
                    )}
                  </div>

                  {isExpiringSoon(member) && (
                    <div className="mt-2">
                      <RenewSoonTag />
                    </div>
                  )}
                </button>

                {/* Right-aligned receipt action, vertically centered */}
                {showReceiptAction && !isReceiptSent(member.id) && (
                  <div
                    className="flex items-center pr-3 pl-1 shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <ReceiptCell
                      member={member}
                      isReceiptSent={isReceiptSent}
                      isReceiptSending={isReceiptSending}
                      onSendReceipt={onSendReceipt}
                    />
                  </div>
                )}
              </div>

              {/* Expanded details */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 pt-1 space-y-2 border-t border-slate-100 mt-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600 pt-2">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{member.email || 'No email on file'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <CalendarDays size={13} className="text-slate-400 shrink-0" />
                        <span>
                          Started:{' '}
                          {member.dateOfJoining ? formatDate(member.dateOfJoining) : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <CalendarClock size={13} className="text-slate-400 shrink-0" />
                        <span>Expires: {expiry ? formatDate(expiry.toISOString()) : '—'}</span>
                      </div>

                      {/* Receipt status note (send action lives on the right of the card) */}
                      {isReceiptSent(member.id) && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <CheckCircle2 size={12} /> Receipt sent
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          );
        })}
      </div>
    </>
  );
}
