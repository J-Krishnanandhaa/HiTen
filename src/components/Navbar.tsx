import React from 'react';
import { Home, Dumbbell, BarChart3, User } from 'lucide-react';

export type ActiveTab = 'training' | 'exercises' | 'report' | 'me';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const TABS: { id: ActiveTab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'training', label: 'Home', Icon: Home },
  { id: 'exercises', label: 'Exercises', Icon: Dumbbell },
  { id: 'report', label: 'Progress', Icon: BarChart3 },
  { id: 'me', label: 'Profile', Icon: User },
];

/** Floating icon-only bottom bar; the active tab is a filled circle. */
export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => (
  <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
    <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-full bg-hy-surface/95 backdrop-blur-md border border-hy-border shadow-2xl shadow-black/60">
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              active ? 'bg-hy-primary text-hy-on-primary' : 'text-hy-text-2 hover:text-hy-text'
            }`}
          >
            <Icon className="w-6 h-6" />
          </button>
        );
      })}
    </div>
  </nav>
);
