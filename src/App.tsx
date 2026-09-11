import { useEffect, useState } from 'react';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    members,
    orderedMembers,
    loading,
    isRefreshing,
    fetchMembers,
    isReceiptSent,
    isReceiptSending,
    handleUpdateMembership,
    handleSendReceipt,
    handleAmountSave,
  } = useMembers();

  const showSearch = activeScreen !== Screen.ANNOUNCEMENTS;
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredMembers = normalizedSearch
    ? members.filter(member => member.name.toLowerCase().includes(normalizedSearch))
    : members;
  const filteredOrderedMembers = normalizedSearch
    ? orderedMembers.filter(member => member.name.toLowerCase().includes(normalizedSearch))
    : orderedMembers;

  useEffect(() => {
    if (!showSearch) {
      setSearchOpen(false);
      setSearchQuery('');
    }
  }, [showSearch]);

  const handleSearchToggle = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearchQuery('');
      return;
    }

    setSearchOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <Header
        showSearch={showSearch}
        isSearchOpen={searchOpen}
        searchQuery={searchQuery}
        isRefreshing={isRefreshing}
        onSearchToggle={handleSearchToggle}
        onSearchChange={setSearchQuery}
        onRefresh={() => fetchMembers(true)}
      />

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
                members={filteredMembers}
                orderedMembers={filteredOrderedMembers}
                onUpdateMembership={handleUpdateMembership}
                onAmountSave={handleAmountSave}
              />
            )}
            {activeScreen === Screen.RECEIPTS && (
              <ReceiptsScreen
                orderedMembers={filteredOrderedMembers}
                isReceiptSent={isReceiptSent}
                isReceiptSending={isReceiptSending}
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
