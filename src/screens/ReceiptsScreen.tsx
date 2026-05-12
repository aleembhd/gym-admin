import { motion } from 'motion/react';
import { ReceiptText, Phone, CheckCircle2, IndianRupee } from 'lucide-react';
import type { Member } from '../types';

interface ReceiptsScreenProps {
  orderedMembers: Member[];
  isReceiptSent: (id: string) => boolean;
  onSendReceipt: (id: string) => void;
}

export default function ReceiptsScreen({ orderedMembers, isReceiptSent, onSendReceipt }: ReceiptsScreenProps) {
  return (
    <motion.div
      key="receipts"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 px-4"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Billing Management</h2>

      {orderedMembers.map((member, index) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{member.name}</h3>
              <p className="text-xs text-indigo-600 font-medium">Valid for {member.daysLeft} days</p>
              {member.daysLeft > 0 && member.daysLeft <= 7 && (
                <p className="text-xs text-amber-500 font-medium flex items-center gap-1 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Reminder sent
                </p>
              )}
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                <IndianRupee size={10} />
                {member.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isReceiptSent(member.id) ? (
                <button
                  disabled
                  className="bg-emerald-500 text-white rounded-xl py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 cursor-not-allowed opacity-90"
                >
                  <CheckCircle2 size={14} /> Sent
                </button>
              ) : (
                <button
                  onClick={() => onSendReceipt(member.id)}
                  className="bg-indigo-600 text-white rounded-xl py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  <ReceiptText size={14} /> Send Receipt
                </button>
              )}
              <a
                href={`tel:${member.phone.replace(/\s/g, '')}`}
                className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black active:scale-95 transition-all"
                title={`Call ${member.name}`}
              >
                <Phone size={15} />
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
