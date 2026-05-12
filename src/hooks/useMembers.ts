import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Member } from '../types';
import { calculateDaysLeft, MOCK_MEMBERS } from '../utils/helpers';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [sentReceipts, setSentReceipts] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem('sentReceipts');
    return stored ? JSON.parse(stored) : {};
  });

  const [selectedPlanMonths, setSelectedPlanMonths] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem('memberPlanMonths');
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem('memberPlanMonths', JSON.stringify(selectedPlanMonths));
  }, [selectedPlanMonths]);

  useEffect(() => {
    localStorage.setItem('sentReceipts', JSON.stringify(sentReceipts));
  }, [sentReceipts]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const isReceiptSent = (memberId: string) => !!sentReceipts[memberId];

  const fetchMembers = async (isManualRefresh = false) => {
    try {
      isManualRefresh ? setIsRefreshing(true) : setLoading(true);

      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Database error: ${error.message}`);

      if (data && data.length > 0) {
        const transformed: Member[] = data.map((record: any) => {
          const planMonths = selectedPlanMonths[record.id.toString()] || record.plan_months || 0;
          return {
            id: record.id.toString(),
            name: record.name || 'Unknown',
            phone: record.phone || 'N/A',
            email: record.email || '',
            daysLeft: calculateDaysLeft(record.joined, planMonths),
            amount: record.amount || 0,
            dateOfJoining: record.joined || '',
            createdAt: record.created_at || new Date().toISOString(),
            planMonths,
          };
        });

        // Sync receipt_status from DB for cross-device consistency
        const dbReceipts: Record<string, number> = {};
        data.forEach((record: any) => {
          if (record.receipt_status === true) {
            dbReceipts[record.id.toString()] = Date.now();
          }
        });
        if (Object.keys(dbReceipts).length > 0) {
          setSentReceipts(prev => ({ ...prev, ...dbReceipts }));
        }

        setMembers(transformed);
      } else {
        setMembers(MOCK_MEMBERS);
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
      if (!isManualRefresh) {
        alert(`Failed to fetch members: ${error.message}\n\nUsing sample data for now.`);
        setMembers(MOCK_MEMBERS);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateMembership = async (id: string, months: number) => {
    const today = new Date().toISOString().split('T')[0];
    const member = members.find(m => m.id === id);
    if (!member) return;

    try {
      let joinedDate = member.dateOfJoining;

      if (!joinedDate) {
        joinedDate = today;
        const { error } = await supabase
          .from('registrations')
          .update({ joined: joinedDate, plan_months: months })
          .eq('id', parseInt(id));

        if (error) {
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
        try {
          await supabase
            .from('registrations')
            .update({ plan_months: months })
            .eq('id', parseInt(id));
        } catch {
          // Column might not exist — localStorage fallback handles it
        }
      }

      setSelectedPlanMonths(prev => ({ ...prev, [id]: months }));

      setSentReceipts(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      setMembers(prev => prev.map(m =>
        m.id === id
          ? { ...m, dateOfJoining: joinedDate, daysLeft: calculateDaysLeft(joinedDate, months), planMonths: months }
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

    // Optimistic update — flip UI immediately
    setSentReceipts(prev => ({ ...prev, [memberId]: Date.now() }));

    try {
      const payload = {
        name: member.name,
        phone: member.phone,
        email: member.email,
        amount: member.amount,
        daysLeft: member.daysLeft,
        dateOfJoining: member.dateOfJoining,
        duration: member.planMonths,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Webhook failed with status: ${response.status}`);

      // Persist to DB so other devices see the sent status
      try {
        await supabase
          .from('registrations')
          .update({ receipt_status: true })
          .eq('id', parseInt(memberId));
      } catch (dbErr) {
        // Run supabase/add-receipt-status.sql if this column is missing
        console.warn('Could not save receipt_status to DB:', dbErr);
      }

      alert(`✅ Receipt sent successfully to ${member.name}!\nEmail: ${member.email}`);
    } catch (error: any) {
      // Revert optimistic update on failure
      setSentReceipts(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
      console.error('Error sending receipt:', error);
      alert(`❌ Failed to send receipt: ${error.message}`);
    }
  };

  const handleAmountSave = async (id: string, amountValue: number) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ amount: amountValue })
        .eq('id', parseInt(id));

      if (error) throw error;

      setSentReceipts(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      setMembers(prev => prev.map(m => m.id === id ? { ...m, amount: amountValue } : m));
    } catch (error) {
      console.error('Error updating amount:', error);
      alert('Failed to update amount');
    }
  };

  const orderedMembers = [...members].sort((a, b) => {
    const aUrgent = a.daysLeft > 0 && a.daysLeft < 7;
    const bUrgent = b.daysLeft > 0 && b.daysLeft < 7;
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return {
    members,
    orderedMembers,
    loading,
    isRefreshing,
    fetchMembers,
    isReceiptSent,
    handleUpdateMembership,
    handleSendReceipt,
    handleAmountSave,
  };
}
