import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Zap,
  Flame,
  Plus,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ListChecks,
  CheckCircle2,
  Gauge
} from 'lucide-react';
import { questsageAPI } from '../services/api';

const LEVEL_XP = 500;

const Dashboard: React.FC = () => {
  const [quickGoal, setQuickGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);
  const navigate = useNavigate();

  const {
    data: userStats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => questsageAPI.getUserStats(1),
  });

  const {
    data: recentQuests,
    isLoading: questsLoading,
    isError: questsError,
    refetch: refetchQuests
  } = useQuery({
    queryKey: ['recentQuests'],
    queryFn: () => questsageAPI.getRecentQuests(),
  });

  const flash = (tone: 'ok' | 'warn', text: string) => {
    setFeedback({ tone, text });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  const handleQuickGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickGoal.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await questsageAPI.createQuest(1, {
        title: quickGoal.trim(),
        description: 'Added from the dashboard quick entry.',
        difficulty: 'normal',
        xp_value: 150,
        estimated_duration: 30,
        subtasks: [
          { text: 'Define what done looks like', completed: false, weight: 30 },
          { text: 'Do the core work', completed: false, weight: 40 },
          { text: 'Verify and close out', completed: false, weight: 30 }
        ]
      });
      setQuickGoal('');
      flash('ok', 'Goal added and split into three weighted steps.');
      refetchQuests();
      refetchStats();
    } catch (error) {
      console.error('Error creating goal:', error);
      flash('warn', 'Could not reach the server. Your goal was not saved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const level = userStats?.level ?? 5;
  const xp = userStats?.xp ?? 1250;
  const xpIntoLevel = Math.max(0, xp - (level - 1) * LEVEL_XP);

  const stats = [
    {
      label: 'ACTIVE GOALS',
      value: userStats?.active_quests ?? (questsLoading ? '—' : 0),
      helper: 'currently in flight',
      icon: Target,
      color: 'var(--amber-primary)'
    },
    {
      label: 'TOTAL XP',
      value: xp.toLocaleString(),
      helper: `${xpIntoLevel} into level ${level}`,
      icon: Zap,
      color: 'var(--accent-primary)'
    },
    {
      label: 'COMPLETION RATE',
      value: `${Math.round(userStats?.completion_rate ?? 0)}%`,
      helper: `${userStats?.completed_quests ?? 0} finished`,
      icon: TrendingUp,
      color: 'var(--status-success)'
    },
    {
      label: 'DAY STREAK',
      value: `${userStats?.streak_days ?? 0}`,
      helper: 'consecutive active days',
      icon: Flame,
      color: 'var(--accent-primary)'
    }
  ];

  if (statsLoading && questsLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 safe-bottom">
          <div className="rounded-lg p-6 mb-6 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="chronicle-skeleton h-6 w-52 mb-3" />
            <div className="chronicle-skeleton h-4 w-80 mb-6" />
            <div className="chronicle-skeleton h-11 w-full" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <div className="chronicle-skeleton h-3 w-20 mb-3" />
                <div className="chronicle-skeleton h-7 w-16 mb-2" />
                <div className="chronicle-skeleton h-3 w-24" />
              </div>
            ))}
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="p-5 rounded-lg border mb-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="chronicle-skeleton h-5 w-64 mb-3" />
              <div className="chronicle-skeleton h-3 w-full max-w-lg mb-4" />
              <div className="chronicle-skeleton h-1.5 w-full" />
            </div>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 safe-bottom">
        {feedback && (
          <div
            role="status"
            className="mb-5 p-3 rounded-md border flex items-center justify-between text-xs font-mono"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: feedback.tone === 'ok' ? 'var(--border-strong)' : 'var(--status-danger)',
              color: feedback.tone === 'ok' ? 'var(--text-secondary)' : 'var(--status-danger)'
            }}
          >
            <span className="flex items-center gap-2">
              {feedback.tone === 'ok'
                ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />
                : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{feedback.text}</span>
            </span>
            <button
              onClick={() => setFeedback(null)}
              className="border-0 bg-transparent cursor-pointer text-[10px] uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header + quick capture */}
        <section className="mb-6">
          <div
            className="rounded-lg border p-5 sm:p-7 relative overflow-hidden"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
              <div>
                <span className="chip-label mb-2">TODAY</span>
                <h1 className="font-display font-bold text-xl sm:text-2xl tracking-tight mt-2" style={{ color: 'var(--text-primary)' }}>
                  Momentum Dashboard
                </h1>
                <p className="text-sm font-body mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {stats[0].value !== '—' && Number(stats[0].value) > 0
                    ? `${stats[0].value} goal${Number(stats[0].value) === 1 ? '' : 's'} in flight. Pick one and move it forward.`
                    : 'Nothing in flight yet. Capture your first goal below.'}
                </p>
              </div>

              <div
                className="flex items-center gap-2 px-3 py-2 rounded-md border self-start sm:self-auto"
                style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-strong)' }}
              >
                <Gauge className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  LEVEL {level} · {xpIntoLevel}/{LEVEL_XP} XP
                </span>
              </div>
            </div>

            <form onSubmit={handleQuickGoal}>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="What do you want to get done?"
                  aria-label="Add a goal"
                  value={quickGoal}
                  onChange={(e) => setQuickGoal(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!quickGoal.trim() || isSubmitting}
                  className="btn-primary flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Adding…' : 'Add goal'}</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Telemetry */}
        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {stat.label}
                    </span>
                    <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                  </div>
                  <div className="font-mono text-2xl font-bold tabular-nums mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-body" style={{ color: 'var(--text-muted)' }}>
                    {stat.helper}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Active goals */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Active goals
            </h2>
            <button
              onClick={() => navigate('/quests')}
              className="btn-ghost flex items-center gap-1.5 text-xs"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {questsError ? (
            <div
              className="p-8 rounded-lg border text-center space-y-3"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--status-danger)' }}
            >
              <AlertCircle className="w-7 h-7 mx-auto" style={{ color: 'var(--status-danger)' }} />
              <div>
                <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Could not load your goals
                </h3>
                <p className="text-xs font-body mt-1" style={{ color: 'var(--text-secondary)' }}>
                  The server did not respond. Nothing was lost.
                </p>
              </div>
              <button onClick={() => refetchQuests()} className="btn-secondary inline-flex items-center gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
            </div>
          ) : recentQuests && recentQuests.length > 0 ? (
            <div className="space-y-3">
              {recentQuests.slice(0, 3).map((quest: any) => {
                const subtasks = quest.subtasks || [];
                const done = subtasks.filter((s: any) => s.completed).length;
                const progress = quest.progress_percentage || 0;

                return (
                  <div key={quest.id} className="goal-card p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`stamp-${quest.difficulty || 'normal'}`}>
                            {quest.difficulty || 'normal'}
                          </span>
                          <span className="chip-label">
                            {quest.status === 'completed' ? 'DONE' : quest.status === 'not_started' ? 'NOT STARTED' : 'IN FLIGHT'}
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                          {quest.title}
                        </h3>
                        {quest.description && (
                          <p className="text-xs font-body line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {quest.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => navigate('/quests')}
                        className="btn-secondary flex items-center gap-1.5 text-xs flex-shrink-0 self-start"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span style={{ color: 'var(--text-muted)' }}>
                          {subtasks.length > 0 ? `${done}/${subtasks.length} steps` : 'no steps yet'}
                        </span>
                        <span className="tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {progress}%
                        </span>
                      </div>

                      <div
                        className="momentum-rail"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${quest.title} progress`}
                      >
                        {subtasks.length > 0 ? (
                          subtasks.map((subtask: any, idx: number) => (
                            <div
                              key={subtask.id || idx}
                              className={`momentum-segment ${subtask.completed ? 'completed' : ''}`}
                              style={{ width: `${subtask.weight || 100 / subtasks.length}%` }}
                              title={`${subtask.text} — ${subtask.completed ? 'done' : 'open'}`}
                            />
                          ))
                        ) : (
                          <>
                            <div className="momentum-segment completed" style={{ width: `${progress}%` }} />
                            <div className="momentum-segment" style={{ width: `${100 - progress}%` }} />
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-mono pt-0.5" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" style={{ color: 'var(--amber-primary)' }} />
                          <span>{quest.xp_value || 100} XP</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{quest.estimated_duration || 30} min</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="p-10 rounded-lg border text-center space-y-4"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div
                className="w-11 h-11 rounded-md flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                <ListChecks className="w-5 h-5" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  No goals yet
                </h3>
                <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                  Add one above, or let the planner break a big one down for you.
                </p>
              </div>
              <button
                onClick={() => navigate('/chat')}
                className="btn-primary inline-flex items-center gap-2 text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Break down a goal</span>
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
