import { useState } from 'react';
import { motion } from 'motion/react';
import MemberCard from '../components/MemberCard';
import type { Member } from '../types';

interface MembersScreenProps {
  members: Member[];
  orderedMembers: Member[];
  onUpdateMembership: (id: string, months: number) => void;
  onAmountSave: (id: string, amount: number) => void;
}

export default function MembersScreen({
  members,
  orderedMembers,
  onUpdateMembership,
  onAmountSave,
}: MembersScreenProps) {
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('');

  const handleStartEdit = (member: Member) => {
    setEditingAmountId(member.id);
    setAmountInput(member.amount === 0 ? '' : String(member.amount));
  };

  const handleSave = (id: string) => {
    const parsed = parseInt(amountInput);
    if (!isNaN(parsed) && parsed > 0) {
      onAmountSave(id, parsed);
    }
    setEditingAmountId(null);
    setAmountInput('');
  };

  const handleCancel = () => {
    setEditingAmountId(null);
    setAmountInput('');
  };

  return (
    <motion.div
      key="members"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center mb-2 px-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Active Members</h2>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold text-indigo-600 leading-none">{members.length}</span>
          <span className="text-xs text-slate-400 font-medium leading-tight">Total</span>
        </div>
      </div>

      {orderedMembers.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-slate-400">
          No members found.
        </div>
      ) : (
        orderedMembers.map((member, index) => (
          <MemberCard
            key={member.id}
            member={member}
            index={index}
            isEditing={editingAmountId === member.id}
            amountInput={amountInput}
            onAmountInputChange={setAmountInput}
            onAmountSave={() => handleSave(member.id)}
            onAmountCancel={handleCancel}
            onStartEdit={() => handleStartEdit(member)}
            onUpdateMembership={months => onUpdateMembership(member.id, months)}
          />
        ))
      )}
    </motion.div>
  );
}
