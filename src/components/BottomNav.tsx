import { Users, ReceiptText, Megaphone } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  onChange: (screen: Screen) => void;
}

export default function BottomNav({ activeScreen, onChange }: BottomNavProps) {
  const tabs = [
    { screen: Screen.MEMBERS, icon: Users, label: 'Members' },
    { screen: Screen.RECEIPTS, icon: ReceiptText, label: 'Receipts' },
    { screen: Screen.ANNOUNCEMENTS, icon: Megaphone, label: 'Broadcast' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.1)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {tabs.map(({ screen, icon: Icon, label }) => {
          const isActive = activeScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => onChange(screen)}
              className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide uppercase">{label}</span>
              {isActive && <motion.div layoutId="nav-pill" className="w-1 h-1 rounded-full bg-indigo-600" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
