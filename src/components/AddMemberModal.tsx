import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IndianRupee, X } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; phone: string; email: string; planMonths: number; amount: number }) => Promise<void>;
}

export default function AddMemberModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [planMonths, setPlanMonths] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setPhone('');
      setEmail('');
      setPlanMonths('');
      setAmount('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const parsedPlanMonths = planMonths ? parseInt(planMonths) : 0;
    const parsedAmount = amount ? parseInt(amount) : 0;

    if (!trimmedName || !trimmedPhone) {
      setError('Name and phone are required.');
      return;
    }

    setError('');
    try {
      await onSubmit({
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        planMonths: Number.isNaN(parsedPlanMonths) ? 0 : parsedPlanMonths,
        amount: Number.isNaN(parsedAmount) ? 0 : parsedAmount,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to add member.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/45 backdrop-blur-[2px] px-4 py-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md rounded-[28px] bg-white shadow-2xl border border-slate-100 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">Add Member</h3>
                <p className="text-xs text-slate-400">Create a new active member here</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Name *</span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Member name"
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  autoFocus
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone *</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Optional email"
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Extend Plan</span>
                  <div className="relative">
                    <select
                      value={planMonths}
                      onChange={e => setPlanMonths(e.target.value)}
                      className="w-full appearance-none bg-indigo-50 text-indigo-700 rounded-xl py-3 pl-4 pr-10 text-sm font-semibold cursor-pointer border-none focus:ring-2 focus:ring-indigo-200 outline-none"
                    >
                      <option value="">No plan yet</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(months => (
                        <option key={months} value={months}>
                          {months} Month{months > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Set Amount</span>
                  <div className="flex items-center bg-slate-50 border-2 border-emerald-400 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-300">
                    <IndianRupee size={14} className="ml-3 text-emerald-500 shrink-0" />
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0"
                      className="flex-1 bg-transparent px-2 py-3 text-sm font-bold outline-none text-slate-800 placeholder:text-slate-300"
                    />
                  </div>
                </label>
              </div>

              {error && (
                <p className="text-xs font-medium text-red-500">{error}</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl bg-slate-100 text-slate-600 py-3 text-sm font-bold hover:bg-slate-200 active:scale-[0.99] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl bg-indigo-600 text-white py-3 text-sm font-bold hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
