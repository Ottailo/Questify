import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Edit3,
  Trash2,
  BookOpen,
  X,
  Compass,
  Check,
  Trophy
} from 'lucide-react';
import { questsageAPI, Quest } from '../services/api';
import Navigation from '../components/Navigation';

const QuestList: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [newXP, setNewXP] = useState(150);
  const [newDuration, setNewDuration] = useState(30);

  // Real API call
  const { data: questsData, isLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: () => questsageAPI.getAllQuests(),
  });

  useEffect(() => {
    if (questsData && questsData.length > 0) {
      setQuests(questsData);
    } else if (questsData && questsData.length === 0) {
      // If server returns empty, seed sensible default dossiers for tactical feel
      setQuests([
        {
          id: 101,
          title: 'Master TypeScript Strict Mode Invariant Gates',
          description: 'Refactor core domain models and remove any/unknown leakages from legacy state slices.',
          quest_type: 'Engineering',
          difficulty: 'hard',
          status: 'in_progress',
          xp_value: 350,
          estimated_duration: 90,
          progress_percentage: 65,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subtasks: [
            { id: 1, text: 'Enable noImplicitAny and strictNullChecks', completed: true, weight: 30 },
            { id: 2, text: 'Map API DTO response contracts with Zod schema guards', completed: true, weight: 35 },
            { id: 3, text: 'Audit compiler output with zero build diagnostics', completed: false, weight: 35 }
          ]
        },
        {
          id: 102,
          title: 'Morning Cognitive Calibration & Cold Scribe',
          description: 'Execute uninterrupted 25-minute deep focus block before opening communication channels.',
          quest_type: 'Discipline',
          difficulty: 'easy',
          status: 'completed',
          xp_value: 120,
          estimated_duration: 25,
          progress_percentage: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subtasks: [
            { id: 4, text: 'Hydrate and review daily campaign directives', completed: true, weight: 50 },
            { id: 5, text: 'Transcribe top 3 priority objectives into Guild Ledger', completed: true, weight: 50 }
          ]
        },
        {
          id: 103,
          title: 'Tactical Design System OKLCH Migration',
          description: 'Purge legacy gray hex codes and replace with forest-ink tokens and brass accents.',
          quest_type: 'Design',
          difficulty: 'normal',
          status: 'in_progress',
          xp_value: 250,
          estimated_duration: 60,
          progress_percentage: 40,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subtasks: [
            { id: 6, text: 'Audit and consolidate fragmented CSS stylesheets', completed: true, weight: 40 },
            { id: 7, text: 'Implement Chronicle Rail and 5-state resilience views', completed: false, weight: 30 },
            { id: 8, text: 'Verify 100dvh mobile compliance and touch targets', completed: false, weight: 30 }
          ]
        }
      ]);
    }
  }, [questsData]);

  const calculateProgress = (subtasks: Quest['subtasks']) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completedWeight = subtasks.reduce((sum, s) => sum + (s.completed ? s.weight : 0), 0);
    return Math.min(100, Math.round(completedWeight));
  };

  const triggerVictoryConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D9531E', '#C89D3C', '#10B981', '#FAF8F2'],
        disableForReducedMotion: true
      });
    } catch (e) {
      // safe fallback
    }
  };

  const toggleSubtask = (questId: number, subtaskId: number) => {
    setQuests(prevQuests =>
      prevQuests.map(quest => {
        if (quest.id !== questId) return quest;

        const updatedSubtasks = quest.subtasks.map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );

        const newProgress = calculateProgress(updatedSubtasks);
        const newStatus = newProgress === 100
          ? 'completed'
          : newProgress > 0
            ? 'in_progress'
            : 'not_started';

        // Trigger confetti celebration when reaching 100% completion
        if (newProgress === 100 && quest.progress_percentage !== 100) {
          triggerVictoryConfetti();
        }

        return {
          ...quest,
          subtasks: updatedSubtasks,
          progress_percentage: newProgress,
          status: newStatus
        };
      })
    );
  };

  const handleEditQuest = (quest: Quest) => {
    setEditingQuest(quest);
  };

  const handleSaveQuest = () => {
    if (!editingQuest) return;
    setQuests(prev => prev.map(q => q.id === editingQuest.id ? editingQuest : q));
    setEditingQuest(null);
  };

  const handleDeleteQuest = (questId: number) => {
    setQuests(prevQuests => prevQuests.filter(quest => quest.id !== questId));
  };

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: Quest = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDescription.trim() || 'Custom directive added to Guild Roster.',
      difficulty: newDifficulty,
      status: 'in_progress',
      quest_type: 'Operational',
      xp_value: Number(newXP) || 150,
      estimated_duration: Number(newDuration) || 30,
      progress_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: [
        { id: 1, text: 'Initial scoping and setup', completed: false, weight: 35 },
        { id: 2, text: 'Core implementation work', completed: false, weight: 40 },
        { id: 3, text: 'Verification and closure', completed: false, weight: 25 }
      ]
    };

    setQuests(prev => [created, ...prev]);
    setShowAddQuest(false);
    setNewTitle('');
    setNewDescription('');
  };

  const filteredQuests = quests.filter(quest => {
    const matchesFilter = filter === 'all' || quest.status === filter;
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate summary telemetry
  const activeCount = quests.filter(q => q.status === 'in_progress').length;
  const completedCount = quests.filter(q => q.status === 'completed').length;
  const totalXP = quests.reduce((sum, q) => sum + (q.status === 'completed' ? q.xp_value : Math.round(q.xp_value * (q.progress_percentage / 100))), 0);
  const avgProgress = quests.length > 0
    ? Math.round(quests.reduce((sum, q) => sum + q.progress_percentage, 0) / quests.length)
    : 0;

  // 1. Loading State with structural skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        <Navigation username="Great Sage User" level={5} xp={1250} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 safe-bottom">
          <div className="rounded-lg p-6 mb-8 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="chronicle-skeleton h-6 w-56 mb-2" />
            <div className="chronicle-skeleton h-4 w-96 mb-6" />
            <div className="chronicle-skeleton h-10 w-full" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <div className="chronicle-skeleton h-5 w-72 mb-3" />
                <div className="chronicle-skeleton h-3 w-full max-w-xl mb-4" />
                <div className="chronicle-skeleton h-2 w-full mb-2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <Navigation username="Great Sage User" level={5} xp={1250} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 safe-bottom">
        {/* Header Section */}
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="chronicle-stamp">
                    GUILD DOSSIER LOG // CODEX VII
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                    ARCHIVE REGISTER
                  </span>
                </div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                  CAMPAIGN ROSTER & QUEST LOG
                </h1>
                <p className="text-xs sm:text-sm font-body" style={{ color: 'var(--text-secondary)' }}>
                  Manage active campaigns, track discrete subtask weights, and log verified completions.
                </p>
              </div>

              <button
                onClick={() => setShowAddQuest(true)}
                className="btn-primary flex items-center justify-center gap-2 self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>Forge New Quest</span>
              </button>
            </div>

            {/* Search and Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field w-full pl-10"
                  placeholder="Filter dossiers by directive title, keyword, or domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <select
                  className="select-field w-full"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">ALL STATUS ROSTERS</option>
                  <option value="in_progress">IN PROGRESS ONLY</option>
                  <option value="completed">RESOLVED & ARCHIVED</option>
                  <option value="not_started">UNINITIATED</option>
                  <option value="abandoned">ABANDONED</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Quest Telemetry Summary Strip */}
        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                ACTIVE CAMPAIGNS
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--brass-primary)' }}>
                {activeCount}
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>Under current rotation</div>
            </div>

            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                RESOLVED QUESTS
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--status-success)' }}>
                {completedCount}
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>Inscribed in archive</div>
            </div>

            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                EARNED XP VALUE
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                {totalXP.toLocaleString()}
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>Accrued guild telemetry</div>
            </div>

            <div
              className="p-4 rounded-lg border flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                ROSTER MEAN PROGRESS
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {avgProgress}%
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>Weighted execution</div>
            </div>
          </div>
        </section>

        {/* Quest Dossiers List */}
        <section>
          {filteredQuests.length > 0 ? (
            <div className="space-y-4">
              {filteredQuests.map((quest) => {
                const subtasks = quest.subtasks || [];
                const hasSubtasks = subtasks.length > 0;
                const completedCount = subtasks.filter(s => s.completed).length;

                return (
                  <div key={quest.id} className="quest-card p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`stamp-${quest.difficulty}`}>
                            {quest.difficulty.toUpperCase()}
                          </span>
                          <span className="chronicle-stamp">
                            STATUS: {quest.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {quest.quest_type && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                              {quest.quest_type.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <h3 className="font-display font-bold text-base sm:text-lg tracking-wide" style={{ color: 'var(--text-primary)' }}>
                          {quest.title}
                        </h3>

                        <p className="text-xs sm:text-sm font-body" style={{ color: 'var(--text-secondary)' }}>
                          {quest.description}
                        </p>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1.5 self-start">
                        <button
                          onClick={() => handleEditQuest(quest)}
                          className="w-8 h-8 rounded flex items-center justify-center cursor-pointer border transition-colors"
                          style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                          title="Modify Quest Dossier"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuest(quest.id)}
                          className="w-8 h-8 rounded flex items-center justify-center cursor-pointer border transition-colors hover:text-red-400"
                          style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                          title="Expunge Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtasks Ledger (Interactive Checkable Items) */}
                    {hasSubtasks && (
                      <div className="my-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--brass-primary)' }}>
                            DISCRETE OPERATIONAL MILESTONES ({completedCount}/{subtasks.length})
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                            Click to toggle completion
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {subtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              onClick={() => toggleSubtask(quest.id, subtask.id)}
                              className="flex items-center gap-3 p-2.5 rounded cursor-pointer transition-colors border select-none group"
                              style={{
                                backgroundColor: subtask.completed ? 'var(--bg-canvas)' : 'var(--bg-elevated)',
                                borderColor: subtask.completed ? 'var(--border-subtle)' : 'var(--border-subtle)'
                              }}
                            >
                              <div className="flex-shrink-0">
                                {subtask.completed ? (
                                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
                                ) : (
                                  <Circle className="w-4 h-4 transition-colors group-hover:text-amber-400" style={{ color: 'var(--text-muted)' }} />
                                )}
                              </div>
                              <span
                                className={`flex-1 text-xs font-body transition-colors ${
                                  subtask.completed
                                    ? 'line-through opacity-50'
                                    : 'font-medium'
                                }`}
                                style={{ color: subtask.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}
                              >
                                {subtask.text}
                              </span>
                              <span
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0 tabular-nums"
                                style={{
                                  backgroundColor: 'var(--bg-canvas)',
                                  borderColor: 'var(--border-subtle)',
                                  color: 'var(--brass-primary)'
                                }}
                              >
                                {subtask.weight}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* The Chronicle Rail (Signature Feature) */}
                    <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span style={{ color: 'var(--brass-primary)' }}>CHRONICLE RAIL</span>
                        <span className="tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {quest.progress_percentage}% PROGRESSION ({Math.round(quest.xp_value * (quest.progress_percentage / 100))} / {quest.xp_value} XP)
                        </span>
                      </div>

                      <div className="chronicle-rail">
                        {hasSubtasks ? (
                          subtasks.map((subtask, idx) => {
                            const segmentWidth = `${subtask.weight}%`;
                            return (
                              <div
                                key={subtask.id || idx}
                                className={`chronicle-rail-segment ${subtask.completed ? 'completed' : ''}`}
                                style={{ width: segmentWidth }}
                                title={`${subtask.text}: ${subtask.completed ? 'Completed' : 'Pending'} (${subtask.weight}%)`}
                              />
                            );
                          })
                        ) : (
                          <>
                            <div
                              className="chronicle-rail-segment completed"
                              style={{ width: `${quest.progress_percentage}%` }}
                            />
                            <div
                              className="chronicle-rail-segment"
                              style={{ width: `${100 - quest.progress_percentage}%` }}
                            />
                          </>
                        )}
                      </div>

                      {/* Footer Telemetry & Victory Action */}
                      <div className="flex items-center justify-between text-[11px] font-mono mt-3" style={{ color: 'var(--text-muted)' }}>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--brass-primary)' }} />
                            <span>+{quest.xp_value} XP VALUE</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{quest.estimated_duration}M EST. TIME</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {quest.progress_percentage === 100 && (
                            <button
                              onClick={() => triggerVictoryConfetti()}
                              className="btn-victory text-[10px] py-1 px-2.5 flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer border-0"
                              title="Honor resolution and celebrate victory"
                            >
                              <Trophy className="w-3 h-3" />
                              <span>Claim Victory</span>
                            </button>
                          )}
                          <span className="text-[10px] uppercase">
                            DOSSIER #{quest.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State: Uninscribed Docket */
            <div
              className="p-12 rounded-lg border text-center space-y-4"
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
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-display font-bold text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                  No Matching Campaign Records
                </h3>
                <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                  {searchTerm || filter !== 'all'
                    ? 'No dossiers correspond with the active query filter parameters.'
                    : 'The Guild Chronicle ledger is uninscribed. Initiate a new campaign below.'
                  }
                </p>
              </div>
              <button
                onClick={() => setShowAddQuest(true)}
                className="btn-primary inline-flex items-center gap-2 text-xs font-display tracking-wider uppercase"
              >
                <Plus className="w-4 h-4" />
                <span>Forge New Campaign</span>
              </button>
            </div>
          )}
        </section>

        {/* Forge New Quest Modal (Parchment Styled Tactical Dialog) */}
        {showAddQuest && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(5, 10, 8, 0.85)', backdropFilter: 'blur(2px)' }}
          >
            <div
              className="w-full max-w-xl rounded-lg border p-6 max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-brass)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4" style={{ color: 'var(--brass-primary)' }} />
                  <h3 className="font-display font-bold text-lg tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    QUEST FORGE // NEW DOSSIER
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddQuest(false)}
                  className="w-7 h-7 rounded flex items-center justify-center border cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateQuest} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field w-full font-body"
                    placeholder="e.g. Master Domain-Driven Invariant Gates"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Directive Description
                  </label>
                  <textarea
                    rows={3}
                    className="input-field w-full font-body resize-none"
                    placeholder="Provide operational context and definition of resolution..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Difficulty Tier
                    </label>
                    <select
                      className="select-field w-full"
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value as any)}
                    >
                      <option value="easy">Easy (Novice)</option>
                      <option value="normal">Normal (Adept)</option>
                      <option value="hard">Hard (Master)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      XP Bounty Value
                    </label>
                    <input
                      type="number"
                      className="input-field w-full font-mono tabular-nums"
                      value={newXP}
                      onChange={(e) => setNewXP(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Est. Minutes
                    </label>
                    <input
                      type="number"
                      className="input-field w-full font-mono tabular-nums"
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Inscribe to Ledger</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddQuest(false)}
                    className="btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Quest Modal */}
        {editingQuest && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(5, 10, 8, 0.85)', backdropFilter: 'blur(2px)' }}
          >
            <div
              className="w-full max-w-xl rounded-lg border p-6 max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-brass)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-display font-bold text-lg tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                  EDIT CAMPAIGN DOSSIER #{editingQuest.id}
                </h3>
                <button
                  onClick={() => setEditingQuest(null)}
                  className="w-7 h-7 rounded flex items-center justify-center border cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    className="input-field w-full font-body"
                    value={editingQuest.title}
                    onChange={(e) => setEditingQuest({ ...editingQuest, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="input-field w-full font-body resize-none"
                    value={editingQuest.description}
                    onChange={(e) => setEditingQuest({ ...editingQuest, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Difficulty
                    </label>
                    <select
                      className="select-field w-full"
                      value={editingQuest.difficulty}
                      onChange={(e) => setEditingQuest({ ...editingQuest, difficulty: e.target.value as any })}
                    >
                      <option value="easy">Easy</option>
                      <option value="normal">Normal</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      XP Value
                    </label>
                    <input
                      type="number"
                      className="input-field w-full font-mono tabular-nums"
                      value={editingQuest.xp_value}
                      onChange={(e) => setEditingQuest({ ...editingQuest, xp_value: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button onClick={handleSaveQuest} className="btn-primary flex-1">
                    Save Changes
                  </button>
                  <button onClick={() => setEditingQuest(null)} className="btn-ghost flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestList;
