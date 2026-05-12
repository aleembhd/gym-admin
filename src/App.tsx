import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MembersScreen from './screens/MembersScreen';
import ReceiptsScreen from './screens/ReceiptsScreen';
import BroadcastScreen from './screens/BroadcastScreen';
import { useMembers } from './hooks/useMembers';
import { Screen } from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.MEMBERS);

  const {
    members,
    orderedMembers,
    loading,
    isRefreshing,
    fetchMembers,
    isReceiptSent,
    handleUpdateMembership,
    handleSendReceipt,
    handleAmountSave,
  } = useMembers();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <Header isRefreshing={isRefreshing} onRefresh={() => fetchMembers(true)} />

      <main className="max-w-md mx-auto py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeScreen === Screen.MEMBERS && (
              <MembersScreen
                members={members}
                orderedMembers={orderedMembers}
                onUpdateMembership={handleUpdateMembership}
                onAmountSave={handleAmountSave}
              />
            )}
            {activeScreen === Screen.RECEIPTS && (
              <ReceiptsScreen
                orderedMembers={orderedMembers}
                isReceiptSent={isReceiptSent}
                onSendReceipt={handleSendReceipt}
              />
            )}
            {activeScreen === Screen.ANNOUNCEMENTS && (
              <BroadcastScreen members={members} />
            )}
          </AnimatePresence>
        )}
      </main>

      <BottomNav activeScreen={activeScreen} onChange={setActiveScreen} />
    </div>
  );
}
