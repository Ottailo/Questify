import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  Clock,
  Zap,
  CheckCircle2,
  Plus,
  Search,
  Pencil,
  Trash2,
  ListChecks,
  X,
  Check,
  Trophy,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { questsageAPI, Quest } from '../services/api';

interface Toast {
  tone: 'ok' | 'err';
  text: string;
}

const QuestList: React.FC = () => {
  const queryClient = useQueryClient();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [newXP, setNewXP] = useState(150);
  const [newDuration, setNewDuration] = useState(30);

  const { data: questsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['quests'],
    queryFn: () => questsageAPI.getAllQuests(),
  });

  useEffect(() => {
    if (questsData) setQuests(questsData);
  }, [questsData]);

  const flash = (tone: 'ok' | 'err', text: string) => {
    setToast({ tone, text });
    window.setTimeout(() => setToast(null), 4000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 64,
        origin: { y: 0.7 },
        colors: ['#F95721', '#F59E0B', '#3FB950'],
        disableForReducedMotion: true
      });
    } catch {
      /* confetti is decorative only */
    }
  };

  const toggleSubtask = async (questId: number, subtaskId: number) => {
    if (togglingId === subtaskId) return;
    setTogglingId(subtaskId);
    try {
      const updated = await questsageAPI.toggleSubtask(questId, subtaskId);
      setQuests(prev => prev.map(q => (q.id === updated.id ? updated : q)));
      if (updated.progress_percentage >= 100) triggerConfetti();
      queryClient.setQueryData(['recentQuests'], (old: any) =>
        old ? old.map((q: any) => (q.id === updated.id ? updated : q)) : old
      );
    } catch (error) {
      console.error('Error toggling subtask:', error);
      flash('err', 'Could not update that step. Check the server connection.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (quest: Quest) => {
    try {
      await questsageAPI.deleteQuest(quest.id);
      setQuests(prev => prev.filter(q => q.id !== quest.id));
      queryClient.setQueryData(['recentQuests'], (old: any) =>
        old ? old.filter((q: any) => q.id !== quest.id) : old
      );
      flash('ok', `"${quest.title}" deleted.`);
    } catch (error) {
      console.error('Error deleting quest:', error);
      flash('err', 'Could not delete that goal.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingQuest) return;
    setSaving(true);
    try {
      const updated = await questsageAPI.updateQuest(editingQuest.id, undefined, {
        title: editingQuest.title,
        description: editingQuest.description,
        status: editingQuest.status
      });
      setQuests(prev => prev.map(q => (q.id === updated.id ? updated : q)));
      queryClient.setQueryData(['recentQuests'], (old: any) =>
        old ? old.map((q: any) => (q.id === updated.id ? updated : q)) : old
      );
      setEditingQuest(null);
      flash('ok', 'Goal updated.');
    } catch (error) {
      console.error('Error updating quest:', error);
      flash('err', 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const created = await questsageAPI.createQuest(undefined, {
        title: newTitle.trim(),
        description: newDescription.trim() || 'Created from the goals list.',
        difficulty: newDifficulty,
        quest_type: 'operational',
        xp_value: Number(newXP) || 150,
        estimated_duration: Number(newDuration) || 30,
        subtasks: [
          { text: 'Define what done looks like', completed: false, weight: 35 },
          { text: 'Do the core work', completed: false, weight: 40 },
          { text: 'Verify and close out', completed: false, weight: 25 }
        ]
      });
      setQuests(prev => [created, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['recentQuests'] });
      setShowAddQuest(false);
      setNewTitle('');
      setNewDescription('');
      setNewDifficulty('normal');
      setNewXP(150);
      setNewDuration(30);
      flash('ok', 'Goal created.');
    } catch (error) {
      console.error('Error creating quest:', error);
      flash('err', 'Could not create that goal.');
    } finally {
      setSaving(false);
    }
  };

  const handleClaimVictory = async (quest: Quest) => {
    try {
      await questsageAPI.claimQuestVictory(quest.id);
      const completed = { ...quest, status: 'completed' as const, progress_percentage: 100 };
      setQuests(prev => prev.map(q => (q.id === quest.id ? completed : q)));
      queryClient.setQueryData(['recentQuests'], (old: any) =>
        old ? old.map((q: any) => (q.id === quest.id ? completed : q)) : old
      );
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      triggerConfetti();
      flash('ok', `Goal complete — ${quest.xp_value} XP banked.`);
    } catch (error) {
      console.error('Error claiming victory:', error);
      flash('err', 'Could not bank the XP. Try again.');
    }
  };

  const filteredQuests = quests.filter(quest => {
    const matchesFilter = filter === 'all' || quest.status === filter;
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeCount = quests.filter(q => q.status === 'in_progress').length;
  const completedCount = quests.filter(q => q.status === 'completed').length;
  const totalXP = quests.reduce((sum, q) => sum + (q.status === 'completed' ? q.xp_value : Math.round(q.xp_value * (q.progress_percentage / 100))), 0);
  const avgProgress = quests.length > 0
    ? Math.round(quests.reduce((sum, q) => sum + q.progress_percentage, 0) / quests.length)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 safe-bottom">
          <div className="rounded-lg p-6 mb-6 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="chronicle-skeleton h-6 w-48 mb-2" />
            <div className="chronicle-skeleton h-4 w-80 mb-6" />
            <div className="chronicle-skeleton h-10 w-full" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <div className="chronicle-skeleton h-3 w-20 mb-3" />
                <div className="chronicle-skeleton h-7 w-14 mb-2" />
                <div className="chronicle-skeleton h-3 w-24" />
              </div>
            ))}
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 rounded-lg border mb-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="chronicle-skeleton h-5 w-72 mb-3" />
              <div className="chronicle-skeleton h-3 w-full max-w-xl mb-4" />
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
        {toast && (
          <div
            role="status"
            className="mb-5 p-3 rounded-md border flex items-center justify-between text-xs font-mono"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: toast.tone === 'ok' ? 'var(--border-strong)' : 'var(--status-danger)',
              color: toast.tone === 'ok' ? 'var(--text-secondary)' : 'var(--status-danger)'
            }}
          >
            <span className="flex items-center gap-2">
              {toast.tone === 'ok'
                ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />
                : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{toast.text}</span>
            </span>
            <button onClick={() => setToast(null)} className="border-0 bg-transparent cursor-pointer text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Dismiss
            </button>
          </div>
        )}

        <section className="mb-6">
          <div
            className="rounded-lg border p-5 sm:p-7 relative overflow-hidden"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <span className="chip-label mb-2">GOALS</span>
                <h1 className="font-display font-bold text-xl sm:text-2xl tracking-tight mt-2" style={{ color: 'var(--text-primary)' }}>
                  Your goals
                </h1>
                <p className="text-sm font-body mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {activeCount > 0 ? `${activeCount} in flight. Mark steps done — progress updates as you go.` : 'No active goals. Start one below.'}
                </p>
              </div>

              <button onClick={() => setShowAddQuest(true)} className="btn-primary flex items-center justify-center gap-2 self-start sm:self-center">
                <Plus className="w-4 h-4" />
                <span>New goal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field w-full pl-10"
                  placeholder="Search your goals…"
                  aria-label="Search goals"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="select-field" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter goals">
                <option value="all">ALL GOALS</option>
                <option value="in_progress">IN FLIGHT</option>
                <option value="completed">DONE</option>
                <option value="not_started">NOT STARTED</option>
                <option value="abandoned">DROPPED</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>IN FLIGHT</div>
              <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--amber-primary)' }}>{activeCount}</div>
              <div className="text-[11px] font-body" style={{ color: 'var(--text-muted)' }}>goals being worked</div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>DONE</div>
              <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--status-success)' }}>{completedCount}</div>
              <div className="text-[11px] font-body" style={{ color: 'var(--text-muted)' }}>completed goals</div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>XP EARNED</div>
              <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--accent-primary)' }}>{totalXP.toLocaleString()}</div>
              <div className="text-[11px] font-body" style={{ color: 'var(--text-muted)' }}>banked and pending</div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>AVG PROGRESS</div>
              <div className="text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>{avgProgress}%</div>
              <div className="text-[11px] font-body" style={{ color: 'var(--text-muted)' }}>across all goals</div>
            </div>
          </div>
        </section>

        <section>
          {isError ? (
            <div className="p-8 rounded-lg border text-center space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--status-danger)' }}>
              <AlertCircle className="w-7 h-7 mx-auto" style={{ color: 'var(--status-danger)' }} />
              <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Could not load your goals</h3>
              <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>Check that the backend is running on port 8000.</p>
              <button onClick={() => refetch()} className="btn-secondary inline-flex items-center gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
            </div>
          ) : filteredQuests.length > 0 ? (
            <div className="space-y-3">
              {filteredQuests.map((quest) => {
                const subtasks = quest.subtasks || [];
                const hasSubtasks = subtasks.length > 0;
                const doneCount = subtasks.filter(s => s.completed).length;
                const effectiveWeight = (w?: number) => w || Math.round(100 / Math.max(subtasks.length, 1));

                return (
                  <div key={quest.id} className="goal-card p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`stamp-${quest.difficulty}`}>
                            {quest.difficulty}
                          </span>
                          <span className="chip-label">
                            {quest.status === 'completed' ? 'DONE' : quest.status === 'in_progress' ? 'IN FLIGHT' : quest.status === 'not_started' ? 'NOT STARTED' : 'DROPPED'}
                          </span>
                          {quest.quest_type && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                              {quest.quest_type.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{quest.title}</h3>
                        <p className="text-xs sm:text-sm font-body" style={{ color: 'var(--text-secondary)' }}>{quest.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 self-start">
                        <button
                          onClick={() => setEditingQuest(quest)}
                          className="w-8 h-8 rounded flex items-center justify-center border transition-colors cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                          title="Edit goal"
                          aria-label={`Edit ${quest.title}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(quest)}
                          className="w-8 h-8 rounded flex items-center justify-center border transition-colors cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                          title="Delete goal"
                          aria-label={`Delete ${quest.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {hasSubtasks && (
                      <div className="my-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--amber-primary)' }}>
                            STEPS ({doneCount}/{subtasks.length})
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                            Click to check off
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {subtasks.map((subtask) => (
                            <button
                              key={subtask.id}
                              onClick={() => toggleSubtask(quest.id, subtask.id)}
                              disabled={togglingId === subtask.id}
                              className="w-full flex items-center gap-3 p-2.5 rounded border text-left transition-colors select-none group"
                              style={{
                                backgroundColor: subtask.completed ? 'var(--bg-canvas)' : 'var(--bg-elevated)',
                                borderColor: subtask.completed ? 'var(--border-subtle)' : 'var(--border-subtle)'
                              }}
                              title={subtask.completed ? 'Mark as not done' : 'Mark as done'}
                            >
                              <span className="flex-shrink-0">
                                {togglingId === subtask.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />
                                ) : subtask.completed ? (
                                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
                                ) : (
                                  <span
                                    className="w-4 h-4 rounded border inline-block"
                                    style={{ borderColor: 'var(--border-strong)' }}
                                  />
                                )}
                              </span>
                              <span
                                className={`flex-1 text-xs font-body transition-colors ${subtask.completed ? 'line-through opacity-50' : 'font-medium'}`}
                                style={{ color: subtask.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}
                              >
                                {subtask.text}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border tabular-nums flex-shrink-0" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                                {effectiveWeight(subtask.weight)}%
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--amber-primary)' }} />
                          <span>{quest.xp_value} XP</span>
                        </span>
                        <span className="tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {quest.progress_percentage}%
                        </span>
                      </div>

                      <div className="momentum-rail" role="progressbar" aria-valuenow={quest.progress_percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${quest.title} progress`}>
                        {hasSubtasks ? (
                          subtasks.map((subtask, idx) => (
                            <div
                              key={subtask.id || idx}
                              className={`momentum-segment ${subtask.completed ? 'completed' : ''}`}
                              style={{ width: `${effectiveWeight(subtask.weight)}%` }}
                              title={`${subtask.text}: ${subtask.completed ? 'done' : 'open'} (${effectiveWeight(subtask.weight)}%)`}
                            />
                          ))
                        ) : (
                          <>
                            <div className="momentum-segment completed" style={{ width: `${quest.progress_percentage}%` }} />
                            <div className="momentum-segment" style={{ width: `${100 - quest.progress_percentage}%` }} />
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono mt-3" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{quest.estimated_duration} MIN</span>
                        </span>
                        <div className="flex items-center gap-3">
                          {quest.progress_percentage >= 100 && quest.status !== 'completed' && (
                            <button
                              onClick={() => handleClaimVictory(quest)}
                              className="btn-victory text-[10px] py-1 px-2.5 flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer border-0"
                            >
                              <Trophy className="w-3 h-3" />
                              <span>Bank XP</span>
                            </button>
                          )}
                          <span className="text-[10px] uppercase">GOAL #{quest.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-lg border text-center space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="w-11 h-11 rounded-md flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <ListChecks className="w-5 h-5" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {searchTerm || filter !== 'all' ? 'No goals match this view' : 'No goals here yet'}
                </h3>
                <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                  {searchTerm || filter !== 'all'
                    ? 'Change the search or filter to see more goals.'
                    : 'Create your first goal and split it into weighted steps.'}
                </p>
              </div>
              <button onClick={() => setShowAddQuest(true)} className="btn-primary inline-flex items-center gap-2 text-xs">
                <Plus className="w-4 h-4" />
                <span>New goal</span>
              </button>
            </div>
          )}
        </section>

        {/* New goal modal */}
        {showAddQuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(1, 4, 9, 0.82)', backdropFilter: 'blur(2px)' }}>
            <div
              className="w-full max-w-xl rounded-lg border p-6 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-md)' }}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>New goal</h3>
                <button onClick={() => setShowAddQuest(false)} className="w-7 h-7 rounded flex items-center justify-center border cursor-pointer" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title</label>
                  <input type="text" required className="input-field w-full" placeholder="e.g. Ship the portfolio launch page" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                  <textarea rows={3} className="input-field w-full resize-none" placeholder="What does done look like?" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Effort</label>
                    <select className="select-field w-full" value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value as any)}>
                      <option value="easy">Light</option>
                      <option value="normal">Standard</option>
                      <option value="hard">Demanding</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>XP</label>
                    <input type="number" className="input-field w-full font-mono tabular-nums" value={newXP} onChange={(e) => setNewXP(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Minutes</label>
                    <input type="number" className="input-field w-full font-mono tabular-nums" value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{saving ? 'Creating…' : 'Create goal'}</span>
                  </button>
                  <button type="button" onClick={() => setShowAddQuest(false)} className="btn-ghost flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editingQuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(1, 4, 9, 0.82)', backdropFilter: 'blur(2px)' }}>
            <div className="w-full max-w-xl rounded-lg border p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-md)' }}>
              <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Edit goal #{editingQuest.id}</h3>
                <button onClick={() => setEditingQuest(null)} className="w-7 h-7 rounded flex items-center justify-center border cursor-pointer" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title</label>
                  <input type="text" className="input-field w-full" value={editingQuest.title} onChange={(e) => setEditingQuest({ ...editingQuest, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                  <textarea rows={3} className="input-field w-full resize-none" value={editingQuest.description} onChange={(e) => setEditingQuest({ ...editingQuest, description: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button onClick={handleSaveEdit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{saving ? 'Saving…' : 'Save changes'}</span>
                  </button>
                  <button onClick={() => setEditingQuest(null)} className="btn-ghost flex-1">Cancel</button>
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
