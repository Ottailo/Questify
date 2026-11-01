import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Mail,
  Calendar,
  Trophy,
  Target,
  Brain,
  Shield,
  Flame,
  Award,
  Sparkles,
  Compass,
  CheckCircle2,
  Sliders,
  Bell,
  Activity
} from 'lucide-react';
import Navigation from '../components/Navigation';

interface Achievement {
  id: number;
  name: string;
  description: string;
  achieved_at: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

const Profile: React.FC = () => {
  // DLP Fatigue Calibration State
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [sprintDuration, setSprintDuration] = useState<number>(45);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [campaignReminders, setCampaignReminders] = useState(true);
  const [fatigueAlerts, setFatigueAlerts] = useState(true);

  // User Profile Query
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => Promise.resolve({
      id: 1,
      email: "alex.achiever@questsage.guild",
      username: "GreatSageUser",
      first_name: "Alex",
      last_name: "Achiever",
      title: "Vanguard Scout & Guild Chronicler",
      level: 5,
      xp: 1250,
      next_level_xp: 1500,
      wisdom_points: 340,
      streak_days: 7,
      total_quests: 23,
      completed_quests: 18,
      active_quests: 5,
      completion_rate: 78.3,
      created_at: "2024-01-01T00:00:00Z",
      last_activity: "2024-01-25T14:30:00Z",
    }),
  });

  // Replaced literal emojis (Slop #6) with Lucide icons in forged brass seals
  const achievements: Achievement[] = [
    {
      id: 1,
      name: "First Inscription",
      description: "Successfully forged and completed your inaugural quest dossier.",
      achieved_at: "2024-01-02T10:00:00Z",
      icon: Target,
      rarity: 'Common'
    },
    {
      id: 2,
      name: "Vanguard Cadence",
      description: "Maintained a continuous 7-rotation discipline streak.",
      achieved_at: "2024-01-25T07:00:00Z",
      icon: Flame,
      rarity: 'Rare'
    },
    {
      id: 3,
      name: "Scribe of Thousand Seals",
      description: "Accumulated 1,000+ verified XP points across all campaigns.",
      achieved_at: "2024-01-20T15:30:00Z",
      icon: Sparkles,
      rarity: 'Rare'
    },
    {
      id: 4,
      name: "Grand Campaign Master",
      description: "Successfully resolved 15+ complex multi-tier quest dossiers.",
      achieved_at: "2024-01-22T12:00:00Z",
      icon: Trophy,
      rarity: 'Epic'
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Resolved campaign milestone",
      quest_name: "Morning Cognitive Calibration & Deep Scribe",
      xp_earned: 25,
      timestamp: "2024-01-25T07:00:00Z",
    },
    {
      id: 2,
      action: "Inscribed new campaign",
      quest_name: "TypeScript Strict Mode Invariant Gates",
      xp_earned: 0,
      timestamp: "2024-01-24T14:30:00Z",
    },
    {
      id: 3,
      action: "Honor bestowed",
      quest_name: "Vanguard Cadence (7-Day Streak)",
      xp_earned: 50,
      timestamp: "2024-01-24T07:00:00Z",
    },
    {
      id: 4,
      action: "Resolved dossier",
      quest_name: "Tactical Design System OKLCH Migration",
      xp_earned: 100,
      timestamp: "2024-01-23T16:45:00Z",
    },
  ];

  // Level Progression Math
  const currentXP = userProfile?.xp || 1250;
  const currentLevel = userProfile?.level || 5;
  const xpPerLevel = 500;
  const currentFloor = (currentLevel - 1) * xpPerLevel;
  const currentCeil = currentLevel * xpPerLevel;
  const progressInLevel = Math.max(0, currentXP - currentFloor);
  const progressPercent = Math.min(100, Math.round((progressInLevel / xpPerLevel) * 100));

  return (
    <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <Navigation
        username={userProfile?.username || 'Great Sage User'}
        level={userProfile?.level || 5}
        xp={userProfile?.xp || 1250}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 safe-bottom">
        {/* Character Sheet Dossier Header */}
        <section className="mb-8">
          <div
            className="rounded-lg p-6 sm:p-8 border relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: 'linear-gradient(90deg, var(--brass-primary) 0%, var(--accent-primary) 100%)' }}
            />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Forged Brass Guild Avatar Seal */}
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center flex-shrink-0 relative"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '2px solid var(--border-brass)',
                    color: 'var(--brass-primary)',
                    boxShadow: '0 0 16px rgba(184, 134, 11, 0.15)'
                  }}
                >
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10" />
                  <span className="absolute -bottom-2 -right-2 chronicle-stamp text-[9px] py-0 px-1.5">
                    LVL {currentLevel}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="chronicle-stamp">
                      GUILD IDENTITY DOSSIER
                    </span>
                    <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                      REGISTRY #{userProfile?.id.toString().padStart(4, '0')}
                    </span>
                  </div>

                  <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    {userProfile?.first_name} {userProfile?.last_name}
                  </h1>

                  <p className="text-xs sm:text-sm font-mono" style={{ color: 'var(--brass-primary)' }}>
                    {userProfile?.title} · @{userProfile?.username}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{userProfile?.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Enlisted {new Date(userProfile?.created_at || '').toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Top-Right Level Stamp Badge */}
              <div
                className="p-4 rounded border flex flex-col items-end self-stretch md:self-auto justify-center"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-brass)'
                }}
              >
                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  GUILD STANDING
                </span>
                <span className="font-display font-bold text-xl sm:text-2xl" style={{ color: 'var(--brass-primary)' }}>
                  RANK V VANGUARD
                </span>
                <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                  {currentXP.toLocaleString()} ACCRUED XP
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Card Vanguard Telemetry Grid */}
        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  TOTAL EXPEDITIONS
                </span>
                <Target className="w-4 h-4" style={{ color: 'var(--brass-primary)' }} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {userProfile?.total_quests}
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                {userProfile?.active_quests} currently under rotation
              </div>
            </div>

            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  RESOLVED DIRECTIVES
                </span>
                <Trophy className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums" style={{ color: 'var(--status-success)' }}>
                {userProfile?.completed_quests}
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                {userProfile?.completion_rate}% resolution fidelity
              </div>
            </div>

            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  WISDOM CREDITS
                </span>
                <Brain className="w-4 h-4" style={{ color: 'var(--brass-primary)' }} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums" style={{ color: 'var(--brass-primary)' }}>
                {userProfile?.wisdom_points}
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                Synthesized through Great Sage
              </div>
            </div>

            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  DISCIPLINE STREAK
                </span>
                <Flame className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                {userProfile?.streak_days} DAYS
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                Unbroken daily ledger entries
              </div>
            </div>
          </div>
        </section>

        {/* Two-Column Tactical Operations Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Column 1: Level Progression & DLP Fatigue Matrix */}
          <div className="space-y-6">
            {/* Level Progression with The Chronicle Rail */}
            <div
              className="p-5 sm:p-6 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4" style={{ color: 'var(--brass-primary)' }} />
                  <h3 className="font-display font-bold text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    CADENCE & LEVEL THRESHOLD
                  </h3>
                </div>
                <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {progressPercent}% TO LVL {currentLevel + 1}
                </span>
              </div>

              {/* The Chronicle Rail Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span style={{ color: 'var(--brass-primary)' }}>CHRONICLE RAIL</span>
                  <span className="tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {currentXP} / {currentCeil} XP
                  </span>
                </div>

                <div className="chronicle-rail">
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

              <div className="grid grid-cols-2 gap-3 pt-3 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
                  <div className="text-xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {userProfile?.completion_rate}%
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Fidelity Cadence
                  </div>
                </div>

                <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
                  <div className="text-xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {userProfile?.active_quests}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Active Rosters
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Load Precision (DLP) Fatigue Calibration Matrix */}
            <div
              className="p-5 sm:p-6 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4" style={{ color: 'var(--brass-primary)' }} />
                  <h3 className="font-display font-bold text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    DLP FATIGUE CALIBRATION MATRIX
                  </h3>
                </div>
                <span className="chronicle-stamp">OPERATIONAL BIAS</span>
              </div>

              <p className="text-xs font-body mb-4" style={{ color: 'var(--text-secondary)' }}>
                The Great Sage dynamically tunes subtask granularity and cognitive load based on your reported mental reserves.
              </p>

              <div className="space-y-4">
                {/* Energy Level Selector */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Cognitive Energy Reserves
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'low', label: 'Depleted', desc: 'Frictionless' },
                      { key: 'medium', label: 'Balanced', desc: 'Standard' },
                      { key: 'high', label: 'Peak', desc: 'Vanguard' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setEnergyLevel(item.key as any)}
                        className="p-2.5 rounded border text-left cursor-pointer transition-colors"
                        style={{
                          backgroundColor: energyLevel === item.key ? 'var(--bg-elevated)' : 'var(--bg-canvas)',
                          borderColor: energyLevel === item.key ? 'var(--border-brass)' : 'var(--border-subtle)',
                          color: energyLevel === item.key ? 'var(--brass-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        <div className="text-xs font-bold uppercase">{item.label}</div>
                        <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Capacity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Sprint Session Capacity
                    </label>
                    <span className="text-xs font-mono font-bold tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                      {sprintDuration} Minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="90"
                    step="15"
                    value={sprintDuration}
                    onChange={(e) => setSprintDuration(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                    <span>15m Quick</span>
                    <span>45m Pomodoro</span>
                    <span>90m Deep Focus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Recent Activity Timeline & Notifications */}
          <div className="space-y-6">
            {/* Recent Archival Activity */}
            <div
              className="p-5 sm:p-6 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: 'var(--brass-primary)' }} />
                  <h3 className="font-display font-bold text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    ARCHIVAL LEDGER ACTIVITY
                  </h3>
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>CHRONOLOGICAL</span>
              </div>

              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between p-3 rounded border"
                    style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--brass-primary)' }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                          {activity.action}
                        </div>
                        <div className="text-[11px] font-body" style={{ color: 'var(--text-secondary)' }}>
                          {activity.quest_name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-3">
                      {activity.xp_earned > 0 && (
                        <div className="text-xs font-mono font-bold tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                          +{activity.xp_earned} XP
                        </div>
                      )}
                      <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {new Date(activity.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification & Telemetry Dispatches */}
            <div
              className="p-5 sm:p-6 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" style={{ color: 'var(--brass-primary)' }} />
                  <h3 className="font-display font-bold text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    TELEMETRY DISPATCH PREFERENCES
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Operational Email Transmissions",
                    desc: "Weekly synthesis summaries and rank promotions",
                    value: emailAlerts,
                    toggle: () => setEmailAlerts(!emailAlerts)
                  },
                  {
                    label: "Campaign Cadence Alerts",
                    desc: "Gentle nudge when an active quest approaches estimated deadline",
                    value: campaignReminders,
                    toggle: () => setCampaignReminders(!campaignReminders)
                  },
                  {
                    label: "Cognitive Fatigue Warning",
                    desc: "Reminds you to register rest after 3 consecutive focus blocks",
                    value: fatigueAlerts,
                    toggle: () => setFatigueAlerts(!fatigueAlerts)
                  }
                ].map((pref, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded border" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
                    <div className="pr-3">
                      <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{pref.label}</div>
                      <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{pref.desc}</div>
                    </div>
                    <button
                      onClick={pref.toggle}
                      className="w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex-shrink-0 flex items-center"
                      style={{
                        backgroundColor: pref.value ? 'var(--brass-primary)' : 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${pref.value ? 'translate-x-4' : 'translate-x-0'}`}
                        style={{ backgroundColor: 'var(--text-primary)' }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Guild Honors & Forged Brass Milestone Seals (Purging Literal Emojis) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" style={{ color: 'var(--brass-primary)' }} />
              <h2 className="font-display font-bold text-lg sm:text-xl tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                GUILD HONORS & MILESTONE SEALS
              </h2>
            </div>
            <span className="chronicle-stamp">4 UNLOCKED SEALS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-lg border text-center relative overflow-hidden flex flex-col items-center justify-between"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-3 mt-1"
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-brass)',
                      color: 'var(--brass-primary)',
                      boxShadow: '0 0 12px rgba(184, 134, 11, 0.12)'
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1 mb-3">
                    <span className="chronicle-stamp text-[9px]">
                      {item.rarity.toUpperCase()}
                    </span>
                    <h4 className="font-display font-bold text-sm tracking-wide uppercase pt-1" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                    </h4>
                    <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                      {item.description}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono pt-2 border-t w-full" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Inscribed {new Date(item.achieved_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;
