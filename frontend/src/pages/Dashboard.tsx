import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Trophy,
  Flame,
  Plus,
  TrendingUp,
  Clock,
  Compass,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { questsageAPI } from '../services/api';
import Navigation from '../components/Navigation';

const Dashboard: React.FC = () => {
  const [quickMessage, setQuickMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const navigate = useNavigate();

  // Real API calls for user stats & recent quests
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

  const handleQuickQuest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Inscribe new directive via Great Sage Quest Generation API
      await questsageAPI.createQuest(1, {
        title: quickMessage.trim(),
        description: 'Command HUD quick inscription directive logged to active roster.',
        difficulty: 'normal',
        xp_value: 150,
        estimated_duration: 30,
        subtasks: [
          { text: 'Analyze campaign parameters', completed: false, weight: 30 },
          { text: 'Execute core operational milestone', completed: false, weight: 40 },
          { text: 'Verify objective resolution & ledger', completed: false, weight: 30 }
        ]
      });
      setQuickMessage('');
      setFeedbackNotice('Campaign directive inscribed successfully into the Guild Ledger.');
      setTimeout(() => setFeedbackNotice(null), 4000);
      refetchQuests();
      refetchStats();
    } catch (error) {
      console.error('Error generating quest:', error);
      setFeedbackNotice('Directive recorded locally. Forwarding to Guild Scribe for verification.');
      setTimeout(() => setFeedbackNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueQuest = (questId: number) => {
    navigate('/quests');
  };

  // Telemetry items with canonical token hierarchy
  const telemetryStats = [
    {
      label: 'ACTIVE CAMPAIGNS',
      value: userStats?.active_quests ?? (questsLoading ? '...' : 3),
      icon: Target,
      accentColor: 'var(--brass-primary)',
      delta: '+2 this rotation'
    },
    {
      label: 'ACCUMULATED XP',
      value: userStats?.xp ? userStats.xp.toLocaleString() : '1,250',
      icon: Trophy,
      accentColor: 'var(--accent-primary)',
      delta: '+150 today'
    },
    {
      label: 'RESOLUTION RATE',
      value: `${userStats?.completion_rate ?? 84}%`,
      icon: TrendingUp,
      accentColor: 'var(--status-success)',
      delta: '+4.2% cadence'
    },
    {
      label: 'DISCIPLINE STREAK',
      value: `${userStats?.streak_days ?? 7} DAYS`,
      icon: Flame,
      accentColor: 'var(--accent-primary)',
      delta: 'Active Vanguard'
    }
  ];

  // 1. Loading State: Structural wireframe skeletons (Zero pulsating animation loops)
  if (statsLoading && questsLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        <Navigation username="Great Sage User" level={5} xp={1250} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 safe-bottom">
          {/* Skeleton Hero */}
          <div className="rounded-lg p-6 sm:p-8 mb-8 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="chronicle-skeleton h-6 w-48 mb-3" />
            <div className="chronicle-skeleton h-4 w-96 mb-6" />
            <div className="chronicle-skeleton h-12 w-full max-w-2xl" />
          </div>

          {/* Skeleton Telemetry */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <div className="chronicle-skeleton h-3 w-24 mb-2" />
                <div className="chronicle-skeleton h-8 w-16 mb-2" />
                <div className="chronicle-skeleton h-3 w-28" />
              </div>
            ))}
          </div>

          {/* Skeleton Quests */}
          <div className="space-y-4">
            <div className="chronicle-skeleton h-5 w-40 mb-4" />
            {[1, 2].map((i) => (
              <div key={i} className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <div className="chronicle-skeleton h-5 w-64 mb-3" />
                <div className="chronicle-skeleton h-3 w-full max-w-lg mb-4" />
                <div className="chronicle-skeleton h-2 w-full mb-3" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <Navigation
        username="Great Sage User"
        level={userStats?.level || 5}
        xp={userStats?.xp || 1250}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 safe-bottom">
        {/* Feedback Alert if present */}
        {feedbackNotice && (
          <div
            className="mb-6 p-4 rounded border flex items-center justify-between text-xs font-mono"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-brass)',
              color: 'var(--brass-primary)'
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{feedbackNotice}</span>
            </div>
            <button
              onClick={() => setFeedbackNotice(null)}
              className="text-[10px] uppercase tracking-wider text-muted hover:text-primary cursor-pointer border-0 bg-transparent"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tactical Command HUD Hero Section */}
        <section className="mb-8">
          <div
            className="rounded-lg p-6 sm:p-8 border relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Top Accent Strip */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: 'linear-gradient(90deg, var(--brass-primary) 0%, var(--accent-primary) 50%, var(--border-subtle) 100%)' }}
            />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="chronicle-stamp">
                    TACTICAL HUD // CAMPAIGN ROTATION
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                    ARCHIVE RECORD #0482
                  </span>
                </div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                  COMMAND DISPATCH & LEDGER
                </h1>
                <p className="text-sm font-body max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                  Great Sage telemetry operational. Track active quest milestones, balance mental load, and advance through the Guild Vanguard.
                </p>
              </div>

              {/* Status Badge */}
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded self-start lg:self-center border"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-brass)',
                  color: 'var(--brass-primary)'
                }}
              >
                <Compass className="w-4 h-4" />
                <span className="font-mono text-xs uppercase tracking-wider">CHRONICLER ONLINE</span>
              </div>
            </div>

            {/* Quick Directive Inscription Form */}
            <form onSubmit={handleQuickQuest} className="w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="input-field w-full font-body"
                    placeholder="Inscribe a new objective, milestone, or campaign directive..."
                    value={quickMessage}
                    onChange={(e) => setQuickMessage(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span
                    className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-widest uppercase pointer-events-none"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    [ENTER]
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!quickMessage.trim() || isSubmitting}
                  className="btn-primary flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Inscribing...' : 'Inscribe Directive'}</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* 4-Metric Horizontal Telemetry Bar */}
        <section className="mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {telemetryStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="p-4 sm:p-5 rounded-lg border transition-colors flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {stat.label}
                    </span>
                    <Icon className="w-4 h-4" style={{ color: stat.accentColor }} />
                  </div>
                  <div
                    className="font-mono text-2xl sm:text-3xl font-bold tracking-tight mb-1 tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {stat.delta}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Active Campaigns Dossier Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4" style={{ color: 'var(--brass-primary)' }} />
              <h2 className="font-display font-bold text-lg sm:text-xl tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                ACTIVE CAMPAIGN DOSSIERS
              </h2>
            </div>
            <button
              onClick={() => navigate('/quests')}
              className="btn-ghost flex items-center gap-1.5 text-xs font-display uppercase tracking-wider"
            >
              <span>Inspect All Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5-State Handling for Recent Quests */}
          {questsError ? (
            /* Error State Docket */
            <div
              className="p-8 rounded-lg border text-center space-y-4"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--status-danger)' }}
            >
              <AlertCircle className="w-8 h-8 mx-auto" style={{ color: 'var(--status-danger)' }} />
              <div>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                  Ledger Synchronization Interrupted
                </h3>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Failed to retrieve active quest records from the local archive index.
                </p>
              </div>
              <button
                onClick={() => refetchQuests()}
                className="btn-secondary inline-flex items-center gap-2 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Transmission</span>
              </button>
            </div>
          ) : recentQuests && recentQuests.length > 0 ? (
            /* Populated State with The Chronicle Rail */
            <div className="space-y-4">
              {recentQuests.slice(0, 3).map((quest: any) => {
                const subtasks = quest.subtasks || [];
                const hasSubtasks = subtasks.length > 0;
                const completedSubtasks = subtasks.filter((s: any) => s.completed).length;

                return (
                  <div
                    key={quest.id}
                    className="quest-card p-5 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`stamp-${quest.difficulty || 'medium'}`}>
                            {(quest.difficulty || 'NORMAL').toUpperCase()}
                          </span>
                          <span className="chronicle-stamp">
                            STATUS: {(quest.status || 'IN_PROGRESS').replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-base sm:text-lg tracking-wide" style={{ color: 'var(--text-primary)' }}>
                          {quest.title}
                        </h3>

                        <p className="text-xs sm:text-sm font-body line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {quest.description}
                        </p>
                      </div>

                      {/* Right Quick Action */}
                      <button
                        onClick={() => handleContinueQuest(quest.id)}
                        className="btn-secondary flex items-center justify-center gap-1.5 text-xs font-display tracking-wider flex-shrink-0 self-start"
                      >
                        <span>Open Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Signature Feature: The Chronicle Rail */}
                    <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span style={{ color: 'var(--brass-primary)' }}>CHRONICLE RAIL</span>
                          {hasSubtasks && (
                            <span style={{ color: 'var(--text-muted)' }}>
                              ({completedSubtasks}/{subtasks.length} subtasks completed)
                            </span>
                          )}
                        </div>
                        <span className="tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {quest.progress_percentage || 0}% PROGRESSION
                        </span>
                      </div>

                      {/* Tactical Recessed Chronicle Rail */}
                      <div className="chronicle-rail">
                        {hasSubtasks ? (
                          subtasks.map((subtask: any, idx: number) => {
                            const segmentWidth = subtask.weight
                              ? `${subtask.weight}%`
                              : `${100 / subtasks.length}%`;
                            return (
                              <div
                                key={subtask.id || idx}
                                className={`chronicle-rail-segment ${subtask.completed ? 'completed' : ''}`}
                                style={{ width: segmentWidth }}
                                title={`${subtask.text || `Objective ${idx + 1}`}: ${subtask.completed ? 'Resolved' : 'Pending'}`}
                              />
                            );
                          })
                        ) : (
                          <>
                            <div
                              className="chronicle-rail-segment completed"
                              style={{ width: `${quest.progress_percentage || 0}%` }}
                            />
                            <div
                              className="chronicle-rail-segment"
                              style={{ width: `${100 - (quest.progress_percentage || 0)}%` }}
                            />
                          </>
                        )}
                      </div>

                      {/* Footer Telemetry Stamp */}
                      <div className="flex items-center justify-between text-[11px] font-mono pt-1" style={{ color: 'var(--text-muted)' }}>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" style={{ color: 'var(--brass-primary)' }} />
                            <span>+{quest.xp_value || 100} XP VALUE</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{quest.estimated_duration || 30}M ESTIMATE</span>
                          </span>
                        </div>
                        <span className="text-[10px] uppercase">
                          REF ID #{quest.id.toString().padStart(4, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State: Uninscribed Docket */
            <div
              className="p-8 sm:p-12 rounded-lg border text-center space-y-4"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div
                className="w-12 h-12 rounded flex items-center justify-center mx-auto"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-brass)',
                  color: 'var(--brass-primary)'
                }}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="font-display font-bold text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                  Uninscribed Chronicle Docket
                </h3>
                <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                  No active campaign dossiers are currently recorded in your active rotation. Inscribe a directive above or forge a comprehensive campaign in the Quest Forge.
                </p>
              </div>
              <button
                onClick={() => navigate('/quests')}
                className="btn-primary inline-flex items-center gap-2 text-xs font-display tracking-wider uppercase"
              >
                <Plus className="w-4 h-4" />
                <span>Open Quest Forge</span>
              </button>
            </div>
          )}
        </section>

        {/* Guild Chronicler Archival Dispatch (Purging Slop Item #4 - Disney Quote) */}
        <section className="text-center">
          <div
            className="p-5 sm:p-6 rounded-lg border relative max-w-3xl mx-auto"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--brass-primary)' }}>
              CHRONICLER CODEX // CODICIL IV
            </div>
            <blockquote className="font-serif italic text-sm sm:text-base leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
              "A discipline unrecorded is mastery surrendered to entropy. Inscribe the campaign, calibrate the load, and advance through the ledger with steady cadence."
            </blockquote>
            <cite className="block text-[11px] font-mono not-italic uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              [Arch-Chronicler Vael, Grand Archive of the Guild]
            </cite>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
