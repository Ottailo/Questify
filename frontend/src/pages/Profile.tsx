import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { questsageAPI } from '../services/api';

interface Achievement {
  id: number;
  name: string;
  description: string;
  achieved: boolean;
  achieved_at: string | null;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  level: number;
  xp: number;
  next_level_xp?: number;
  wisdom_points: number;
  streak_days: number;
  total_quests?: number;
  completed_quests?: number;
  active_quests?: number;
  completion_rate?: number;
  created_at?: string;
  last_activity?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Target, Flame, Sparkles, Trophy, Brain, Award, Shield, Compass, Mail, Calendar, CheckCircle2, Sliders, Bell, Activity
};

const Profile: React.FC = () => {
  // Focus Calibration State
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [sprintDuration, setSprintDuration] = useState<number>(45);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [campaignReminders, setCampaignReminders] = useState(true);
  const [fatigueAlerts, setFatigueAlerts] = useState(true);

  const queryClient = useQueryClient();

  // Profile data from real API
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: async () => (await questsageAPI.getUserProfile()) as UserProfile,
  });

  // Achievements from real API
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['userAchievements'],
    queryFn: () => questsageAPI.getUserAchievements() as Promise<Achievement[]>,
  });

  // Activity from real API
  const { data: recentActivity = [], isLoading: activityLoading } = useQuery<Array<{
    id: number;
    action: string;
    quest_name: string;
    xp_earned: number;
    timestamp: string;
  }>>({
    queryKey: ['userActivity'],
    queryFn: () => questsageAPI.getUserActivity(),
  });

  // DLP from real API
  const { data: dlpData } = useQuery({
    queryKey: ['userDLP'],
    queryFn: () => questsageAPI.getDLP((userProfile as any)?.id || 1),
    enabled: !!userProfile?.id,
  });

  // DLP mutation
  const dlpMutation = useMutation({
    mutationFn: (updates: { energy_patterns?: Record<string, any>; difficulty_preference?: string }) =>
      questsageAPI.updateDLP((userProfile as any)?.id || 1, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDLP'] });
    },
  });

  // Hydrate local state from server DLP
  useEffect(() => {
    if (!dlpData) return;
    const current = (dlpData.energy_patterns as any)?.current;
    if (current === 'low' || current === 'medium' || current === 'high') {
      setEnergyLevel(current);
    }
    const minutes = (dlpData.energy_patterns as any)?.sprint_minutes;
    if (typeof minutes === 'number' && minutes >= 15 && minutes <= 90) {
      setSprintDuration(minutes);
      lastCommittedSprint.current = minutes;
    } else {
      // Backward-compat: older rows only stored difficulty_preference, not an exact duration.
      const pref = dlpData.difficulty_preference;
      let fallbackMinutes = 45;
      if (pref === 'easy') fallbackMinutes = 30;
      else if (pref === 'challenging') fallbackMinutes = 75;
      else if (pref === 'moderate') fallbackMinutes = 45;
      setSprintDuration(fallbackMinutes);
      lastCommittedSprint.current = fallbackMinutes;
    }
  }, [dlpData]);

  // Track last committed sprint duration to prevent redundant commits
  const lastCommittedSprint = useRef<number>(sprintDuration);

  const commitSprint = useCallback(() => {
    if (lastCommittedSprint.current === sprintDuration) return;
    lastCommittedSprint.current = sprintDuration;
    dlpMutation.mutate({
      energy_patterns: { current: energyLevel, sprint_minutes: sprintDuration },
      difficulty_preference: sprintDuration <= 30 ? 'easy' : sprintDuration <= 60 ? 'moderate' : 'challenging'
    });
  }, [sprintDuration, energyLevel, dlpMutation]);

  // Level Progression Math
  const currentXP = userProfile?.xp || 0;
  const currentLevel = userProfile?.level || 1;
  const xpPerLevel = 500;
  const currentFloor = (currentLevel - 1) * xpPerLevel;
  const currentCeil = currentLevel * xpPerLevel;
  const progressInLevel = Math.max(0, currentXP - currentFloor);
  const progressPercent = Math.min(100, Math.round((progressInLevel / xpPerLevel) * 100));

  // Loading state for profile header
  if (profileLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 safe-bottom">
          <div className="mb-8 skeleton-block h-40 rounded-lg" />
          <div className="mb-8 skeleton-block h-32 rounded-lg" />
          <div className="space-y-6">
            <div className="skeleton-block h-64 rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 safe-bottom">
        {/* Profile Header */}
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
              style={{ background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-primary) 100%)' }}
            />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center flex-shrink-0 relative"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '2px solid var(--accent-primary)',
                    color: 'var(--accent-primary)',
                    boxShadow: '0 0 16px rgba(249, 87, 33, 0.15)'
                  }}
                >
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10" />
                  <span className="absolute -bottom-2 -right-2 chip-label text-[9px] py-0 px-1.5">
                    LVL {currentLevel}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="chip-label">
                      PROFILE
                    </span>
                    <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                      ID #{userProfile?.id.toString().padStart(4, '0')}
                    </span>
                  </div>

                  <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    {userProfile?.first_name} {userProfile?.last_name}
                  </h1>

                  <p className="text-xs sm:text-sm font-mono" style={{ color: 'var(--accent-primary)' }}>
                    {userProfile?.title} · @{userProfile?.username}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{userProfile?.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Member since {new Date(userProfile?.created_at || '').toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Top-Right Level Badge */}
              <div
                className="p-4 rounded border flex flex-col items-end self-stretch md:self-auto justify-center"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--accent-primary)'
                }}
              >
                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  LEVEL
                </span>
                <span className="font-display font-bold text-xl sm:text-2xl" style={{ color: 'var(--accent-primary)' }}>
                  LEVEL {currentLevel}
                </span>
                <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                  {currentXP.toLocaleString()} TOTAL XP
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  TOTAL GOALS
                </span>
                <Target className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {userProfile?.total_quests}
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                {userProfile?.active_quests} active right now
              </div>
            </div>

            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  COMPLETED
                </span>
                <Trophy className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums" style={{ color: 'var(--status-success)' }}>
                {userProfile?.completed_quests}
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                {userProfile?.completion_rate}% completion rate
              </div>
            </div>

            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  FOCUS POINTS
                </span>
                <Brain className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                {userProfile?.wisdom_points}
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                Earned through completed goals
              </div>
            </div>

            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  DAY STREAK
                </span>
                <Flame className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                {userProfile?.streak_days} DAYS
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                Consecutive active days
              </div>
            </div>
          </div>
        </section>

        {/* Two-Column Profile Details */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Column 1: Level Progression & Focus Calibration */}
          <div className="space-y-6">
            {/* Level Progression with Momentum Rail */}
            <div
              className="p-5 sm:p-6 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  <h3 className="font-display font-bold text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    LEVEL PROGRESS
                  </h3>
                </div>
                <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {progressPercent}% to Level {currentLevel + 1}
                </span>
              </div>

              {/* Momentum Rail Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span style={{ color: 'var(--accent-primary)' }}>PROGRESS</span>
                  <span className="tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {currentXP} / {currentCeil} XP
                  </span>
                </div>

                <div className="momentum-rail">
                  <div
                    className="momentum-segment"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="momentum-segment"
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
                    Completion Rate
                  </div>
                </div>

                <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
                  <div className="text-xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {userProfile?.active_quests}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Active Goals
                  </div>
                </div>
              </div>
            </div>

            {/* Focus Calibration */}
            <div
              className="p-5 sm:p-6 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  <h3 className="font-display font-bold text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    FOCUS CALIBRATION
                  </h3>
                </div>
                <span className="chip-label">PREFERENCES</span>
              </div>

              <p className="text-xs font-body mb-4" style={{ color: 'var(--text-secondary)' }}>
                QuestSage adjusts task complexity and session length based on your current energy level.
              </p>

              <div className="space-y-4">
                {/* Energy Level Selector */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Energy Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'low', label: 'Depleted', desc: 'Light' },
                      { key: 'medium', label: 'Balanced', desc: 'Balanced' },
                      { key: 'high', label: 'Peak', desc: 'Intense' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          setEnergyLevel(item.key as any);
                          dlpMutation.mutate({ energy_patterns: { current: item.key, sprint_minutes: sprintDuration } });
                        }}
                        className="p-2.5 rounded border text-left cursor-pointer transition-colors"
                        style={{
                          backgroundColor: energyLevel === item.key ? 'var(--bg-elevated)' : 'var(--bg-canvas)',
                          borderColor: energyLevel === item.key ? 'var(--accent-primary)' : 'var(--border-subtle)',
                          color: energyLevel === item.key ? 'var(--accent-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        <div className="text-xs font-bold uppercase">{item.label}</div>
                        <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Duration Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Session Duration
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
                    onMouseUp={commitSprint}
                    onTouchEnd={commitSprint}
                    onKeyUp={commitSprint}
                    className="w-full cursor-pointer"
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

          {/* Column 2: Recent Activity & Notifications */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div
              className="p-5 sm:p-6 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  <h3 className="font-display font-bold text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    RECENT ACTIVITY
                  </h3>
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>LATEST</span>
              </div>

              {activityLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-block h-16 rounded" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No recent activity yet.
                </p>
              ) : (
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
                          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--accent-primary)' }}
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
              )}
            </div>

            {/* Notifications */}
            <div
              className="p-5 sm:p-6 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  <h3 className="font-display font-bold text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    NOTIFICATIONS
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Email Summaries",
                    desc: "Weekly progress summaries and level-ups",
                    value: emailAlerts,
                    toggle: () => setEmailAlerts(!emailAlerts)
                  },
                  {
                    label: "Goal Reminders",
                    desc: "Reminder when a goal approaches its deadline",
                    value: campaignReminders,
                    toggle: () => setCampaignReminders(!campaignReminders)
                  },
                  {
                    label: "Break Reminders",
                    desc: "Reminder to take a break after 3 focus sessions",
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
                        backgroundColor: pref.value ? 'var(--accent-primary)' : 'var(--bg-elevated)',
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

        {/* Achievements */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <h2 className="font-display font-bold text-lg sm:text-xl tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                ACHIEVEMENTS
              </h2>
            </div>
            <span className="chip-label">
              {achievements.filter(a => a.achieved).length} EARNED
            </span>
          </div>

          {achievementsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-block h-56 rounded-lg" />
              ))}
            </div>
          ) : achievements.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
              Complete goals to earn achievements.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((item) => {
                const Icon = ICON_MAP[item.icon] || Award;

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
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--accent-primary)',
                        boxShadow: '0 0 12px rgba(249, 87, 33, 0.12)'
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="space-y-1 mb-3">
                      <span className="chip-label text-[9px]">
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
                      {item.achieved_at ? (
                        `Earned ${new Date(item.achieved_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
                      ) : (
                        'Not yet earned'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;