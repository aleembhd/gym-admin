import { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Send } from 'lucide-react';
import type { Member } from '../types';

interface BroadcastScreenProps {
  members: Member[];
}

export default function BroadcastScreen({ members }: BroadcastScreenProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async () => {
    if (!message.trim()) return;

    const messageToSend = message;
    setMessage('');
    setIsSending(true);

    try {
      const payload = {
        message: messageToSend,
        totalMembers: members.length,
        members: members.map(m => ({ name: m.name, phone: m.phone, email: m.email })),
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(import.meta.env.VITE_BROADCAST_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Webhook failed with status: ${response.status}`);

      alert(`✅ Announcement sent to all ${members.length} members!`);
    } catch (error: any) {
      setMessage(messageToSend);
      console.error('Error sending broadcast:', error);
      alert(`❌ Failed to send broadcast: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      key="announcements"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5 px-4"
    >
      <div className="text-center space-y-2 py-3">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Megaphone size={28} />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-slate-800">Gym Announcements</h2>
        <p className="text-xs text-slate-500">Send updates to all {members.length} members</p>
      </div>

      <div className="bg-white rounded-xl p-1 shadow-sm border border-slate-200 focus-within:border-indigo-300 transition-all">
        <textarea
          className="w-full bg-transparent p-3 min-h-[160px] text-sm text-slate-800 outline-none resize-none placeholder:text-slate-400"
          placeholder="Example: Gym closed tomorrow for maintenance. Regular hours resume on Monday."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>

      <button
        onClick={handleBroadcast}
        disabled={!message.trim() || isSending}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
          !message.trim() || isSending
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
        }`}
      >
        {isSending ? (
          <span className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            Sending...
          </span>
        ) : (
          <>
            <Send size={16} /> Send to All Members
          </>
        )}
      </button>

      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-700">Quick Tips:</strong> Use for class schedule changes, holiday hours, new equipment arrivals, or special workout sessions.
        </p>
      </div>
    </motion.div>
  );
}
