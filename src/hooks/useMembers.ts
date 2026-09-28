import { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import type { Member } from '../types';
import {
  calculateDaysLeft,
  monthsFromValidity,
  normalizePhoneForWhatsApp,
  planMonthsToDays,
} from '../utils/helpers';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const [sentReceipts, setSentReceipts] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem('sentReceipts');
    return stored ? JSON.parse(stored) : {};
  });

  const [sendingReceipts, setSendingReceipts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem('sentReceipts', JSON.stringify(sentReceipts));
  }, [sentReceipts]);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Recompute days-left at every midnight so the countdown decreases by 1
  // exactly when the date changes, without needing a manual refresh.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const recomputeDaysLeft = () => {
      setMembers(prev =>
        prev.map(m => ({
          ...m,
          daysLeft: m.dateOfJoining && m.validityDays
            ? calculateDaysLeft(m.dateOfJoining, m.validityDays)
            : m.daysLeft,
        }))
      );
    };

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      timeoutId = setTimeout(() => {
        recomputeDaysLeft();
        scheduleNextMidnight();
      }, nextMidnight.getTime() - now.getTime());
    };

    scheduleNextMidnight();
    return () => clearTimeout(timeoutId);
  }, []);

  const isReceiptSent = (memberId: string) => !!sentReceipts[memberId];
  const isReceiptSending = (memberId: string) => !!sendingReceipts[memberId];

  const fetchMembers = async (isManualRefresh = false) => {
    try {
      isManualRefresh ? setIsRefreshing(true) : setLoading(true);

      if (!supabase || !isSupabaseConfigured) {
        setMembers([]);
        return;
      }

      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Database error: ${error.message}`);

      if (data && data.length > 0) {
        const transformed: Member[] = data.map((record: any) => {
          // validity = original plan span in days (end date - joined), fixed at enroll.
          const validityDays = parseInt(record.validity) || 0;
          // Live countdown from joined + validity; falls back to stored validity
          // only if there is no join date to count from.
          const daysLeft = record.joined
            ? calculateDaysLeft(record.joined, validityDays)
            : validityDays;
          const receiptSent =
            String(record.receipt_status) === 'true' || !!sentReceipts[record.id.toString()];
          return {
            id: record.id.toString(),
            name: record.name || 'Unknown',
            phone: record.phone || 'N/A',
            email: record.email || '',
            daysLeft,
            validityDays,
            amount: parseInt(record.amount) || 0,
            dateOfJoining: record.joined || '',
            createdAt: record.created_at || new Date().toISOString(),
            receiptSent,
          };
        });

        // Sync receipt_status from DB for cross-device consistency.
        // Column type is text, so the DB returns the string "true", not boolean true.
        const dbReceipts: Record<string, number> = {};
        data.forEach((record: any) => {
          if (String(record.receipt_status) === 'true') {
            dbReceipts[record.id.toString()] = Date.now();
          }
        });
        if (Object.keys(dbReceipts).length > 0) {
          setSentReceipts(prev => ({ ...prev, ...dbReceipts }));
        }

        setMembers(transformed);
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
      if (!isManualRefresh) {
        alert(`Failed to fetch members: ${error.message}`);
        setMembers([]);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSendReceipt = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    if (!supabase || !isSupabaseConfigured) {
      alert('Supabase is not configured, so receipt sending is disabled in preview mode.');
      return;
    }

    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
    if (!webhookUrl) {
      alert('Webhook URL is not configured. Set VITE_WEBHOOK_URL in your .env file to enable receipt sending.');
      return;
    }

    // Show loading until the request succeeds and WhatsApp opens
    setSendingReceipts(prev => ({ ...prev, [memberId]: true }));

    try {
      const payload = {
        name: member.name,
        // Normalize to 91 + 10 digits so N8N builds a valid WhatsApp link.
        phone: normalizePhoneForWhatsApp(member.phone),
        email: member.email,
        amount: member.amount,
        daysLeft: member.daysLeft,
        dateOfJoining: member.dateOfJoining,
        duration: monthsFromValidity(member.validityDays),
        validityDays: member.validityDays,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Webhook failed with status: ${response.status}`);

      // The webhook may return a JSON object with a whatsappLink field, or it
      // may return an empty/non-JSON body. Parse defensively so an empty
      // response doesn't crash and wrongly report the send as failed.
      const raw = await response.text();
      let whatsappLink: string | undefined;
      if (raw) {
        try {
          const result = JSON.parse(raw);
          whatsappLink = result?.whatsappLink;
        } catch {
          // Response wasn't JSON — that's fine, just no link to open.
        }
      }
      if (whatsappLink) {
        window.open(whatsappLink, '_blank');
      }

      // Mark as sent now that the request succeeded and WhatsApp opened
      setSentReceipts(prev => ({ ...prev, [memberId]: Date.now() }));

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
      console.error('Error sending receipt:', error);
      alert(`❌ Failed to send receipt: ${error.message}`);
    } finally {
      setSendingReceipts(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    }
  };

  const handleCreateMember = async (payload: { name: string; phone: string; email: string; planMonths: number; amount: number }) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    try {
      setIsAddingMember(true);

      const today = new Date().toISOString().split('T')[0];
      const hasPlan = payload.planMonths > 0;
      // validity = whole days from today to (today + planMonths calendar months).
      // Stored fixed; the live "days left" is recomputed from joined + validity.
      const validityDays = hasPlan ? planMonthsToDays(today, payload.planMonths) : 0;

      const { error } = await supabase
        .from('registrations')
        .insert({
          name: payload.name,
          phone: payload.phone,
          email: payload.email || null,
          joined: hasPlan ? today : null,
          amount: payload.amount || 0,
          validity: validityDays,
          receipt_status: false,
        });

      if (error) throw error;

      await fetchMembers(true);
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    } finally {
      setIsAddingMember(false);
    }
  };

  const updateMember = async (
    id: string,
    payload: { name: string; phone: string; email: string; joined: string; expires: string },
  ) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // validity = whole days between the (edited) start and expiry dates.
    const start = new Date(payload.joined);
    const end = new Date(payload.expires);
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const validityDays = Math.max(
      0,
      Math.round((endMidnight.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const { error } = await supabase
      .from('registrations')
      .update({
        name: payload.name,
        phone: payload.phone,
        email: payload.email || null,
        joined: payload.joined || null,
        validity: validityDays,
      })
      .eq('id', parseInt(id));

    if (error) throw error;

    // Update local state immediately so the card reflects the edit.
    setMembers(prev =>
      prev.map(m =>
        m.id === id
          ? {
              ...m,
              name: payload.name,
              phone: payload.phone,
              email: payload.email,
              dateOfJoining: payload.joined,
              validityDays,
              daysLeft: calculateDaysLeft(payload.joined, validityDays),
            }
          : m,
      ),
    );
  };

  const deleteMember = async (id: string) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.from('registrations').delete().eq('id', parseInt(id));
    if (error) throw error;

    // Remove from local state and clear any receipt tracking.
    setMembers(prev => prev.filter(m => m.id !== id));
    setSentReceipts(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
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
    isReceiptSending,
    handleSendReceipt,
    handleCreateMember,
    isAddingMember,
    updateMember,
    deleteMember,
  };
}
