import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Send, X } from 'lucide-react';
import type { Member } from '../types';
import { normalizePhoneForWhatsApp } from '../utils/helpers';

interface BroadcastModalProps {
  isOpen: boolean;
  activeMembers: Member[];
  onClose: () => void;
}

export default function BroadcastModal({ isOpen, activeMembers, onClose }: BroadcastModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setIsSending(false);
    }
  }, [isOpen]);

  const handleBroadcast = async () => {
    if (!message.trim() || isSending) return;

    const webhookUrl = import.meta.env.VITE_BROADCAST_WEBHOOK_URL;
    if (!webhookUrl) {
      alert('Broadcast webhook URL is not configured. Set VITE_BROADCAST_WEBHOOK_URL in your .env file.');
      return;
    }

    const messageToSend = message.trim();
    setIsSending(true);

    try {
      const payload = {
        message: messageToSend,
        totalMembers: activeMembers.length,
        members: activeMembers.map(m => ({
          name: m.name,
          phone: normalizePhoneForWhatsApp(m.phone),
          email: m.email,
        })),
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Webhook failed with status: ${response.status}`);

      alert(`✅ Announcement sent to ${activeMembers.length} active members!`);
      onClose();
    } catch (error: any) {
      console.error('Error sending broadcast:', error);
      alert(`❌ Failed to send broadcast: ${error.message}`);
    } finally {
      setIsSending(false);
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
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 pt-6 pb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Broadcast message</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Send an announcement to {activeMembers.length} active member
                  {activeMembers.length === 1 ? '' : 's'}.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-6 pt-3 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Gym will open at 6:00 AM tomorrow. See you on the floor!"
                  className="w-full min-h-[130px] rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none resize-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBroadcast}
                  disabled={!message.trim() || isSending}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send broadcast
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
