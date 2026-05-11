/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { supabase, MemberRecord } from './supabaseClient';

// --- Types ---

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  daysLeft: number;
  amount: number;
  dateOfJoining: string; // empty string = not yet assigned
  createdAt: string; // for "NEW" tag calculation
  planMonths: number; // duration in months
}

enum Screen {
  MEMBERS = 'members',
  RECEIPTS = 'receipts',
  ANNOUNCEMENTS = 'announcements'
}

// --- Helper Functions ---

const calculateDaysLeft = (joinedDate: string | null, planMonths: number): number => {
  if (!joinedDate) return 0;
  
  const joined = new Date(joinedDate);
  const today = new Date();
  const expiryDate = new Date(joined);
  expiryDate.setMonth(expiryDate.getMonth() + planMonths);
  
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

const isNewMember = (createdAt: string): boolean => {
  const created = new Date(createdAt);
  const today = new Date();
  const diffTime = today.getTime() - created.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 4; // Show "NEW" tag for 4 days from creation
};

// --- Mock Data (Fallback if Supabase fails) ---
const MOCK_MEMBERS: Member[] = [
  { 
    id: '1', 
    name: 'Croxton Technologies', 
    phone: '7878888888',
    email: 'croxtontechnologies@gmail.com',
    daysLeft: 0, 
    amount: 0, 
    dateOfJoining: '', 
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    planMonths: 0
  },
  { 
    id: '2', 
    name: 'Abdul Aleem', 
    phone: '7672029401',
    email: 'abdul.aleem4020@gmail.com',
    daysLeft: 0, 
    amount: 0, 
    dateOfJoining: '', 
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    planMonths: 0
  },
];

// --- Components ---

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.MEMBERS);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('');
  
  // Track sent receipts with timestamps
  const [sentReceipts, setSentReceipts] = useState<{ [key: string]: number }>(() => {
    const stored = localStorage.getItem('sentReceipts');
    return stored ? JSON.parse(stored) : {};
  });
  const [selectedPlanMonths, setSelectedPlanMonths] = useState<{ [key: string]: number }>(() => {
    // Load from localStorage on initial render
    const stored = localStorage.getItem('memberPlanMonths');
    return stored ? JSON.parse(stored) : {};
  });

  // Save plan months to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('memberPlanMonths', JSON.stringify(selectedPlanMonths));
  }, [selectedPlanMonths]);

  // Save sent receipts to localStorage (no cleanup - permanent until plan update)
  useEffect(() => {
    localStorage.setItem('sentReceipts', JSON.stringify(sentReceipts));
  }, [sentReceipts]);

  // Fetch members from Supabase
  useEffect(() => {
    fetchMembers();
  }, []);

  // Check if receipt was sent (permanent until plan update)
  const isReceiptSent = (memberId: string): boolean => {
    return !!sentReceipts[memberId];
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      console.log('Connecting to Supabase...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      
      // Try to fetch from Supabase - using 'registrations' table
      const { data: fetchedData, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Fetched data:', fetchedData);

      if (fetchedData && fetchedData.length > 0) {
        const transformedMembers: Member[] = fetchedData.map((record: any) => {
          const planMonths = selectedPlanMonths[record.id.toString()] || record.plan_months || 0;
          const daysLeft = calculateDaysLeft(record.joined, planMonths);
          
          return {
            id: record.id.toString(),
            name: record.name || 'Unknown',
            phone: record.phone || 'N/A',
            email: record.email || '',
            daysLeft: daysLeft,
            amount: record.amount || 0,
            dateOfJoining: record.joined || '',
            createdAt: record.created_at || new Date().toISOString(),
            planMonths: planMonths,
          };
        });

        console.log('Transformed members:', transformedMembers);
        setMembers(transformedMembers);
      } else {
        console.log('No members found in database, using mock data');
        setMembers(MOCK_MEMBERS);
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
      alert(`Failed to fetch members: ${error.message}\n\nUsing sample data for now.`);
      setMembers(MOCK_MEMBERS);
    } finally {
      setLoading(false);
    }
  };

  // Sort members: urgent (< 7 days) first, then by created_at (newest first)
  const orderedMembers = [...members].sort((a, b) => {
    const aUrgent = a.daysLeft > 0 && a.daysLeft < 7;
    const bUrgent = b.daysLeft > 0 && b.daysLeft < 7;
    
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;
    
    // If both urgent or both not urgent, sort by created_at (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleUpdateMembership = async (id: string, months: number) => {
    const today = new Date().toISOString().split('T')[0];
    const member = members.find(m => m.id === id);
    
    if (!member) return;

    try {
      let joinedDate = member.dateOfJoining;
      
      // If no joining date, set today as joining date
      if (!joinedDate) {
        joinedDate = today;
        
        // Try to update both joined date and plan_months in database
        const updateData: any = { joined: joinedDate };
        
        // Try to include plan_months if the column exists
        try {
          updateData.plan_months = months;
        } catch (e) {
          // Column might not exist, that's okay
        }
        
        const { error } = await supabase
          .from('registrations')
          .update(updateData)
          .eq('id', parseInt(id));

        if (error) {
          // If error is about plan_months column not existing, try without it
          if (error.message.includes('plan_months')) {
            const { error: retryError } = await supabase
              .from('registrations')
              .update({ joined: joinedDate })
              .eq('id', parseInt(id));
            
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
      } else {
        // Try to update plan_months for existing member
        try {
          await supabase
            .from('registrations')
            .update({ plan_months: months })
            .eq('id', parseInt(id));
        } catch (e) {
          // Column might not exist, that's okay - we'll use localStorage
        }
      }

      // Store the plan months locally
      setSelectedPlanMonths(prev => ({
        ...prev,
        [id]: months
      }));

      // Calculate days left
      const daysLeft = calculateDaysLeft(joinedDate, months);

      // Reset receipt sent status when plan is updated
      setSentReceipts(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      // Update local state
      setMembers(prev => prev.map(m => 
        m.id === id 
          ? { ...m, dateOfJoining: joinedDate, daysLeft, planMonths: months } 
          : m
      ));
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Failed to update membership');
    }
  };

  const handleSendReceipt = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    try {
      // Show loading state
      const button = document.activeElement as HTMLButtonElement;
      if (button) button.disabled = true;

      console.log('Sending receipt to webhook for:', member.name);

      // Prepare webhook payload
      const payload = {
        name: member.name,
        phone: member.phone,
        email: member.email,
        amount: member.amount,
        daysLeft: member.daysLeft,
        dateOfJoining: member.dateOfJoining,
        duration: member.planMonths, // duration in months
        timestamp: new Date().toISOString()
      };

      console.log('Webhook payload:', payload);

      // Call the webhook
      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Webhook response status:', response.status);

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      const result = await response.text();
      console.log('Webhook response:', result);

      // Mark receipt as sent with current timestamp
      setSentReceipts(prev => ({
        ...prev,
        [memberId]: Date.now()
      }));

      alert(`✅ Receipt sent successfully to ${member.name}!\nEmail: ${member.email}`);
    } catch (error: any) {
      console.error('Error sending receipt:', error);
      alert(`❌ Failed to send receipt: ${error.message}`);
    } finally {
      // Re-enable button
      const button = document.activeElement as HTMLButtonElement;
      if (button) button.disabled = false;
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      console.log('Sending broadcast to webhook...');
      
      // Prepare broadcast payload
      const payload = {
        message: broadcastMessage,
        totalMembers: members.length,
        members: members.map(m => ({
          name: m.name,
          phone: m.phone,
          email: m.email
        })),
        timestamp: new Date().toISOString()
      };

      console.log('Broadcast payload:', payload);

      // Call the broadcast webhook
      const webhookUrl = import.meta.env.VITE_BROADCAST_WEBHOOK_URL;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Broadcast webhook response status:', response.status);

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      const result = await response.text();
      console.log('Broadcast webhook response:', result);

      alert(`✅ Announcement sent to all ${members.length} members!`);
      setBroadcastMessage('');
    } catch (error: any) {
      console.error('Error sending broadcast:', error);
      alert(`❌ Failed to send broadcast: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleAmountEdit = (member: Member) => {
    setEditingAmountId(member.id);
    // Set empty string if amount is 0, otherwise show the amount
    setAmountInput(member.amount === 0 ? '' : String(member.amount));
  };

  const handleAmountSave = async (id: string) => {
    const parsed = parseInt(amountInput);
    if (!isNaN(parsed) && parsed > 0) {
      try {
        // Update in database
        const { error } = await supabase
          .from('registrations')
          .update({ amount: parsed })
          .eq('id', parseInt(id));

        if (error) throw error;

        // Reset receipt sent status when amount is updated
        setSentReceipts(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });

        // Update local state
        setMembers(prev => prev.map(m => m.id === id ? { ...m, amount: parsed } : m));
      } catch (error) {
        console.error('Error updating amount:', error);
        alert('Failed to update amount');
      }
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
            <span className="text-indigo-600 font-extrabold">Elite</span>
            <span className="text-slate-800 font-extrabold -ml-1.5">Gym</span>
          </h1>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            Owner Access
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
            />
          </div>
        ) : (
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
                  <span className="text-2xl font-bold text-indigo-600 leading-none">{members.length}</span>
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
                  {isNewMember(member.createdAt) && (
                    <div className="absolute top-0 left-0">
                      <div className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-br-lg shadow-sm">
                        NEW
                      </div>
                    </div>
                  )}

                  {/* Row 1: Name + Days Left */}
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

                  {/* Row 2: Date of Joining + Amount */}
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-indigo-400" />
                      <span className="font-medium">Joined:</span>
                      <span className={`${member.dateOfJoining ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                        {member.dateOfJoining ? formatDate(member.dateOfJoining) : 'Not assigned'}
                      </span>
                    </div>
                    <div className="w-px h-5 bg-slate-200" />
                    {/* Amount display */}
                    <div className="flex items-center gap-1">
                      <IndianRupee size={14} className={member.amount === 0 ? 'text-slate-300' : 'text-emerald-500'} />
                      <span className={`text-sm font-bold ${member.amount === 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
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
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{member.name}</h3>
                      <p className="text-xs text-indigo-600 font-medium">Valid for {member.daysLeft} days</p>
                      {member.daysLeft > 0 && member.daysLeft <= 7 && (
                        <p className="text-xs text-amber-500 font-medium flex items-center gap-1 mt-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
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
                          onClick={() => handleSendReceipt(member.id)}
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
          )}

          {activeScreen === Screen.ANNOUNCEMENTS && (
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
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                />
              </div>

              <button 
                onClick={handleBroadcast}
                disabled={!broadcastMessage.trim() || isSending}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  !broadcastMessage.trim() || isSending
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
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
          )}
        </AnimatePresence>
        )}
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
