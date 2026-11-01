import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  BookOpen,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { ThemeContext } from './Layout';

interface NavigationProps {
  username?: string;
  level?: number;
  xp?: number;
}

const Navigation: React.FC<NavigationProps> = ({ username = 'Alex Achiever', level = 5, xp = 1250 }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'HUD Command', icon: Compass },
    { path: '/chat', label: 'Great Sage', icon: Sparkles },
    { path: '/quests', label: 'Quest Log', icon: BookOpen },
    { path: '/profile', label: 'Character Sheet', icon: User }
  ];

  // XP calculations for Level
  const xpPerLevel = 500;
  const currentLevelFloor = (level - 1) * xpPerLevel;
  const nextLevelCeil = level * xpPerLevel;
  const currentLevelXP = Math.max(0, xp - currentLevelFloor);
  const progressPercent = Math.min(100, Math.max(0, (currentLevelXP / xpPerLevel) * 100));

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 safe-top"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Guild Seal & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-left bg-transparent border-0 p-0 cursor-pointer group"
              title="Return to Command HUD"
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-brass)',
                  color: 'var(--brass-primary)'
                }}
              >
                <Compass className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  QUESTIFY
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--brass-primary)' }}>
                  Guild Chronicler
                </span>
              </div>
            </button>

            {/* Level & Rank Notch */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="chronicle-stamp">
                LVL {level.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                {username}
              </span>
            </div>
          </div>

          {/* Tactical Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-display font-semibold tracking-wide transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                    color: isActive ? 'var(--brass-primary)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--border-brass)' : '1px solid transparent'
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: The Chronicle Rail Micro-Ticker & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Header Micro Chronicle Rail */}
            <div className="hidden lg:flex flex-col items-end gap-1 w-44">
              <div className="flex items-center justify-between w-full text-[10px] font-mono">
                <span style={{ color: 'var(--brass-primary)' }}>LVL {level}</span>
                <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {xp} / {nextLevelCeil} XP
                </span>
              </div>
              <div className="chronicle-rail-micro w-full">
                <div
                  className="chronicle-rail-segment completed"
                  style={{ width: `${progressPercent}%` }}
                />
                <div
                  className="chronicle-rail-segment"
                  style={{ width: `${100 - progressPercent}%` }}
                />
              </div>
            </div>

            {/* Tactical Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors"
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)'
              }}
              title={theme === 'light' ? 'Switch to Night Canvas (Dark)' : 'Switch to Manuscript Scribe (Light)'}
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
