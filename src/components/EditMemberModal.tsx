import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pencil, X } from 'lucide-react';
import type { Member } from '../types';
import { getExpiryDate } from '../utils/helpers';

interface EditMemberModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onSave: (
    id: string,
    payload: { name: string; phone: string; email: string; joined: string; expires: string },
  ) => Promise<void>;
}

// yyyy-mm-dd for date inputs
const toInputDate = (d: Date | string | null): string => {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function EditMemberModal({ isOpen, member, onClose, onSave }: EditMemberModalProps) {
  const [step, setStep] = useState<'confirm' | 'form'>('confirm');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState('');
  const [expires, setExpires] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load the member's values whenever the modal opens.
  useEffect(() => {
    if (isOpen && member) {
      setStep('confirm');
      setName(member.name);
      setPhone(member.phone);
      setEmail(member.email);
      setJoined(toInputDate(member.dateOfJoining));
      setExpires(toInputDate(getExpiryDate(member.dateOfJoining, member.validityDays)));
      setError('');
      setIsSaving(false);
    }
  }, [isOpen, member]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!member) return;

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedPhone) {
      setError('Name and mobile number are required.');
      return;
    }
    if (joined && expires && new Date(expires) < new Date(joined)) {
      setError('Expiry date cannot be before the start date.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await onSave(member.id, {
        name: trimmedName,
        phone: trimmedPhone,
        email: email.trim(),
        joined,
        expires,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass =
    'w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400';
  const labelClass = 'text-sm font-semibold text-slate-700';

  return (
    <AnimatePresence>
      {isOpen && member && (
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
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {step === 'confirm' ? (
              // Step 1: confirm intent
              <div className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Pencil size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Edit member details?</h3>
                <p className="text-sm text-slate-500 mt-1.5">
                  This will change the saved details for{' '}
                  <span className="font-semibold text-slate-700">{member.name}</span>.
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 active:scale-[0.98] transition-all"
                  >
                    OK
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: editable form
              <>
                <div className="flex items-start justify-between px-6 pt-6 pb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Edit member</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Update details and save.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 pt-3 space-y-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={fieldClass}
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Mobile</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Started</label>
                      <input
                        type="date"
                        value={joined}
                        onChange={e => setJoined(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Expires</label>
                      <input
                        type="date"
                        value={expires}
                        onChange={e => setExpires(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSaving && (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                      )}
                      {isSaving ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
