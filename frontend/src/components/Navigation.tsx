import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
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

const Navigation: React.FC<NavigationProps> = ({ username = 'User', level = 1, xp = 0 }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chat', label: 'Deconstruct', icon: MessageSquare },
    { path: '/quests', label: 'Goals', icon: CheckSquare },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  // XP progression toward the next level
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
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-left border-0 p-0 cursor-pointer"
              style={{ background: 'transparent' }}
              title="QuestSage Dashboard"
              aria-label="QuestSage home"
            >
              <img
                src="/logo-momentum-prism.svg"
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg flex-shrink-0"
              />
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  QuestSage
                </span>
                <span className="font-mono text-[10px] tracking-tight" style={{ color: 'var(--accent-primary)' }}>
                  Momentum Engine
                </span>
              </div>
            </button>

            {/* Level identity */}
            <div
              className="hidden sm:flex items-center gap-2 pl-3 border-l"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <span className="chip-label" style={{ color: 'var(--amber-primary)', borderColor: 'rgba(245, 158, 11, 0.32)', background: 'var(--amber-muted)' }}>
                Lvl {level}
              </span>
              <span className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                {username}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display font-semibold transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent'
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Progress + theme */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end gap-1 w-40">
              <div className="flex items-center justify-between w-full text-[10px] font-mono">
                <span style={{ color: 'var(--amber-primary)' }}>Lvl {level}</span>
                <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {xp} / {nextLevelCeil} XP
                </span>
              </div>
              <div className="momentum-rail-micro w-full" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level">
                <div className="momentum-segment completed" style={{ width: `${progressPercent}%` }} />
                <div className="momentum-segment" style={{ width: `${100 - progressPercent}%` }} />
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-colors"
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)'
              }}
              title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
              aria-label="Toggle colour theme"
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
