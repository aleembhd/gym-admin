/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  ReceiptText, 
  Megaphone, 
  Phone, 
  ChevronDown, 
  Send, 
  CheckCircle2,
  CalendarDays,
  IndianRupee,
  Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Member {
  id: string;
  name: string;
  phone: string;
  daysLeft: number;
  lastPaymentDate: string;
  amount: number;
  dateOfJoining: string; // empty string = not yet assigned
}

enum Screen {
  MEMBERS = 'members',
  RECEIPTS = 'receipts',
  ANNOUNCEMENTS = 'announcements'
}

// --- Mock Data (Indian names & numbers) ---

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Arjun Sharma',    phone: '+91 98765 43210', daysLeft: 5,  lastPaymentDate: '2024-03-15', amount: 1200, dateOfJoining: '2023-06-10' },
  { id: '2', name: 'Priya Nair',      phone: '+91 90123 45678', daysLeft: 28, lastPaymentDate: '2024-04-10', amount: 1500, dateOfJoining: '2023-09-01' },
  { id: '3', name: 'Rahul Verma',     phone: '+91 87654 32109', daysLeft: 3,  lastPaymentDate: '2024-03-01', amount: 999,  dateOfJoining: '2024-01-15' },
  { id: '4', name: 'Deepika Reddy',   phone: '+91 99887 76655', daysLeft: 60, lastPaymentDate: '2024-04-20', amount: 1800, dateOfJoining: '2023-11-20' },
  { id: '5', name: 'Karthik Iyer',    phone: '+91 91234 56789', daysLeft: 1,  lastPaymentDate: '2024-02-28', amount: 1100, dateOfJoining: '2024-02-01' },
  { id: '6', name: 'Sneha Kulkarni',  phone: '+91 88001 12233', daysLeft: 45, lastPaymentDate: '2024-04-05', amount: 1350, dateOfJoining: '2024-03-01' },
  { id: '7', name: 'Vikram Pillai',   phone: '+91 93456 78901', daysLeft: 12, lastPaymentDate: '2024-03-20', amount: 2000, dateOfJoining: '2023-07-25' },
  // New members — no plan or amount assigned yet
  { id: '8', name: 'Meera Joshi',     phone: '+91 97001 22334', daysLeft: 0,  lastPaymentDate: '', amount: 0, dateOfJoining: '' },
  { id: '9', name: 'Saurabh Tiwari',  phone: '+91 94455 66778', daysLeft: 0,  lastPaymentDate: '', amount: 0, dateOfJoining: '' },
];

// --- Components ---

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.MEMBERS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('');

  // Fixed display order — sorted once at load, never re-sorted during the session.
  // Cards update in-place; positions only change on a full page refresh.
  const [displayOrder] = useState<string[]>(() =>
    [...INITIAL_MEMBERS]
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .map(m => m.id)
  );

  const orderedMembers = displayOrder
    .map(id => members.find(m => m.id === id))
    .filter(Boolean) as Member[];

  const handleUpdateMembership = (id: string, months: number) => {
    const today = new Date().toISOString().split('T')[0];
    const daysToAdd = months * 30;
    setMembers(prev => prev.map(m => {
      if (m.id !== id) return m;
      if (!m.dateOfJoining) {
        // First-time plan: set today as joining date, days = exact selection
        return { ...m, dateOfJoining: today, daysLeft: daysToAdd };
      }
      // Existing member: extend from current remaining days
      return { ...m, daysLeft: m.daysLeft + daysToAdd };
    }));
  };

  const handleSendReceipt = (name: string) => {
    alert(`Receipt sent to ${name}!`);
  };

  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      alert(`Announcement broadcasted to all ${members.length} members!`);
      setBroadcastMessage('');
      setIsSending(false);
    }, 1500);
  };

  const handleAmountEdit = (member: Member) => {
    setEditingAmountId(member.id);
    setAmountInput(String(member.amount));
  };

  const handleAmountSave = (id: string) => {
    const parsed = parseInt(amountInput);
    if (!isNaN(parsed) && parsed > 0) {
      setMembers(prev => prev.map(m => m.id === id ? { ...m, amount: parsed } : m));
    }
    setEditingAmountId(null);
  };

  const handleAmountCancel = () => {
    setEditingAmountId(null);
    setAmountInput('');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Dumbbell size={16} />
            </div>
            <span className="text-indigo-600 font-extrabold">Light</span>
            <span className="text-slate-800 font-extrabold -ml-1.5">Gym</span>
          </h1>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            Owner Access
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto py-6">
        <AnimatePresence mode="wait">
          {activeScreen === Screen.MEMBERS && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Active Members header with big count */}
              <div className="flex justify-between items-center mb-2 px-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Active Members</h2>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl font-black text-indigo-600 leading-none">{members.length}</span>
                  <span className="text-xs text-slate-400 font-medium leading-tight">Total</span>
                </div>
              </div>
              
              {orderedMembers.map((member, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={member.id}
                  className="bg-white p-4 shadow-sm border-y sm:border border-slate-100 flex flex-col gap-3 relative overflow-hidden"
                >
                  {/* NEW Tag */}
                  {index < 3 && (
                    <div className="absolute top-0 left-0">
                      <div className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-br-lg shadow-sm">
                        NEW
                      </div>
                    </div>
                  )}

                  {/* Row 1: Name + Days Left */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-2xl text-slate-800 leading-tight">{member.name}</h3>
                      <p className="text-base text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone size={15} /> {member.phone}
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

                  {/* Row 2: Date of Joining + Amount */}
                  <div className="flex items-center gap-3 text-base text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={17} className="text-indigo-400" />
                      <span className="font-medium">Joined:</span>
                      <span className={`${member.dateOfJoining ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                        {member.dateOfJoining ? formatDate(member.dateOfJoining) : 'Not assigned'}
                      </span>
                    </div>
                    <div className="w-px h-5 bg-slate-200" />
                    {/* Amount display */}
                    <div className="flex items-center gap-1">
                      <IndianRupee size={20} className={member.amount === 0 ? 'text-slate-300' : 'text-emerald-500'} />
                      <span className={`text-xl font-extrabold ${member.amount === 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
                        {member.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Extend Plan + Set Amount */}
                  {editingAmountId === member.id ? (
                    /* Editing state: full-width clean input bar */
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-slate-50 border-2 border-emerald-400 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-300">
                        <span className="pl-3 text-emerald-500 font-bold text-base select-none">₹</span>
                        <input
                          type="number"
                          value={amountInput}
                          onChange={e => setAmountInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAmountSave(member.id)}
                          className="flex-1 bg-transparent px-2 py-2.5 text-base font-bold outline-none text-slate-800 placeholder:text-slate-300"
                          placeholder="Enter amount"
                          autoFocus
                        />
                      </div>
                      {/* Tick confirm */}
                      <button
                        onClick={() => handleAmountSave(member.id)}
                        className="w-11 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform shadow-md shadow-emerald-100 hover:bg-emerald-600"
                        title="Save amount"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </button>
                      {/* Cancel */}
                      <button
                        onClick={handleAmountCancel}
                        className="w-11 h-11 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform hover:bg-slate-200"
                        title="Cancel"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ) : (
                    /* Normal state: Extend Plan + Set Amount side by side */
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 group">
                        <select
                          className="w-full appearance-none bg-indigo-50 text-indigo-700 rounded-xl py-2.5 pl-4 pr-10 text-sm font-semibold cursor-pointer border-none focus:ring-2 focus:ring-indigo-200 outline-none"
                          onChange={(e) => handleUpdateMembership(member.id, parseInt(e.target.value))}
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
                        className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md shadow-emerald-100 hover:bg-emerald-600"
                        onClick={() => handleAmountEdit(member)}
                      >
                        <IndianRupee size={14} /> Set Amount
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeScreen === Screen.RECEIPTS && (
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
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={member.id} 
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
                >
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{member.name}</h3>
                        <p className="text-xs text-indigo-600 font-medium">Valid for {member.daysLeft} days</p>
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                          <IndianRupee size={10} />
                          {member.amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSendReceipt(member.name)}
                      className="bg-indigo-600 text-white rounded-xl py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      <ReceiptText size={14} /> Send Receipt
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeScreen === Screen.ANNOUNCEMENTS && (
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 px-4"
            >
              <div className="text-center space-y-2 py-4">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Megaphone size={32} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Mass Broadcast</h2>
                <p className="text-sm text-slate-500">Updates will be sent to all your active members.</p>
              </div>

              <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <textarea 
                  className="w-full bg-transparent p-4 min-h-[200px] text-slate-800 outline-none resize-none placeholder:text-slate-300"
                  placeholder="Hey everyone! We have a special yoga session this Sunday at 10 AM..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                />
              </div>

              <button 
                onClick={handleBroadcast}
                disabled={!broadcastMessage.trim() || isSending}
                className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] ${
                  !broadcastMessage.trim() || isSending
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-indigo-600 text-white shadow-indigo-200'
                }`}
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send size={16} /> Broadcast to {members.length} Members
                  </>
                )}
              </button>

              <div className="p-4 bg-indigo-50 rounded-xl flex gap-3 items-start border border-indigo-100">
                <CheckCircle2 size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed text-indigo-700">
                  <strong>Pro Tip:</strong> Use broadcast for holiday announcements, class schedule changes, or membership special offers.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => setActiveScreen(Screen.MEMBERS)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeScreen === Screen.MEMBERS ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Users size={20} strokeWidth={activeScreen === Screen.MEMBERS ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide uppercase">Members</span>
            {activeScreen === Screen.MEMBERS && (
              <motion.div layoutId="nav-pill" className="w-1 h-1 rounded-full bg-indigo-600" />
            )}
          </button>

          <button 
            onClick={() => setActiveScreen(Screen.RECEIPTS)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeScreen === Screen.RECEIPTS ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <ReceiptText size={20} strokeWidth={activeScreen === Screen.RECEIPTS ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide uppercase">Receipts</span>
            {activeScreen === Screen.RECEIPTS && (
              <motion.div layoutId="nav-pill" className="w-1 h-1 rounded-full bg-indigo-600" />
            )}
          </button>

          <button 
            onClick={() => setActiveScreen(Screen.ANNOUNCEMENTS)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeScreen === Screen.ANNOUNCEMENTS ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Megaphone size={20} strokeWidth={activeScreen === Screen.ANNOUNCEMENTS ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide uppercase">Broadcast</span>
            {activeScreen === Screen.ANNOUNCEMENTS && (
              <motion.div layoutId="nav-pill" className="w-1 h-1 rounded-full bg-indigo-600" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
