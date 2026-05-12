import { motion } from 'motion/react';
import { Phone, CalendarDays, IndianRupee, ChevronDown } from 'lucide-react';
import type { Member } from '../types';
import { isNewMember, formatDate } from '../utils/helpers';

interface MemberCardProps {
  member: Member;
  index: number;
  isEditing: boolean;
  amountInput: string;
  onAmountInputChange: (val: string) => void;
  onAmountSave: () => void;
  onAmountCancel: () => void;
  onStartEdit: () => void;
  onUpdateMembership: (months: number) => void;
}

export default function MemberCard({
  member,
  index,
  isEditing,
  amountInput,
  onAmountInputChange,
  onAmountSave,
  onAmountCancel,
  onStartEdit,
  onUpdateMembership,
}: MemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white p-4 shadow-sm border-y sm:border border-slate-100 flex flex-col gap-3 relative overflow-hidden"
    >
      {isNewMember(member.createdAt) && (
        <div className="absolute top-0 left-0">
          <div className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-br-lg shadow-sm">
            NEW
          </div>
        </div>
      )}

      {/* Name + Days Left */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-slate-800 leading-tight">{member.name}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Phone size={13} /> {member.phone}
          </p>
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
          member.daysLeft === 0
            ? 'bg-slate-100 text-slate-400'
            : member.daysLeft < 7
            ? 'bg-red-50 text-red-600'
            : 'bg-green-50 text-green-600'
        }`}>
          {member.daysLeft === 0 ? 'No plan' : `${member.daysLeft} days left`}
        </div>
      </div>

      {/* Joined + Amount */}
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={14} className="text-indigo-400" />
          <span className="font-medium">Joined:</span>
          <span className={member.dateOfJoining ? 'text-slate-700' : 'text-slate-400 italic'}>
            {member.dateOfJoining ? formatDate(member.dateOfJoining) : 'Not assigned'}
          </span>
        </div>
        <div className="w-px h-5 bg-slate-200" />
        <div className="flex items-center gap-1">
          <IndianRupee size={14} className={member.amount === 0 ? 'text-slate-300' : 'text-emerald-500'} />
          <span className={`text-sm font-bold ${member.amount === 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
            {member.amount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Plan / Amount controls */}
      {isEditing ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-slate-50 border-2 border-emerald-400 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-300">
            <span className="pl-3 text-emerald-500 font-bold text-base select-none">₹</span>
            <input
              type="number"
              value={amountInput}
              onChange={e => onAmountInputChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAmountSave()}
              className="flex-1 bg-transparent px-2 py-2.5 text-base font-bold outline-none text-slate-800 placeholder:text-slate-300"
              placeholder="Enter amount"
              autoFocus
            />
          </div>
          <button
            onClick={onAmountSave}
            className="w-11 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform shadow-md shadow-emerald-100 hover:bg-emerald-600"
            title="Save amount"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
          <button
            onClick={onAmountCancel}
            className="w-11 h-11 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform hover:bg-slate-200"
            title="Cancel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              className="w-full appearance-none bg-indigo-50 text-indigo-700 rounded-xl py-2.5 pl-4 pr-10 text-sm font-semibold cursor-pointer border-none focus:ring-2 focus:ring-indigo-200 outline-none"
              onChange={e => onUpdateMembership(parseInt(e.target.value))}
              defaultValue=""
            >
              <option value="" disabled>{member.dateOfJoining ? 'Extend Plan' : 'Select Plan'}</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
              <ChevronDown size={14} />
            </div>
          </div>
          <button
            onClick={onStartEdit}
            className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md shadow-emerald-100 hover:bg-emerald-600"
          >
            <IndianRupee size={14} /> Set Amount
          </button>
        </div>
      )}
    </motion.div>
  );
}
