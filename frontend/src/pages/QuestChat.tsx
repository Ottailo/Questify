import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Plus, Check, Loader2 } from 'lucide-react';
import { questsageAPI } from '../services/api';

interface BlueprintStep {
  title: string;
  xp_value: number;
  estimated_duration: number;
}

interface Blueprint {
  title: string;
  description: string;
  difficulty: string;
  xp_value: number;
  estimated_duration: number;
  steps: BlueprintStep[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'planner';
  timestamp: Date;
  suggestions?: string[];
  blueprint?: Blueprint | null;
  saved?: boolean;
}

const GREETING: Message = {
  id: 'greeting',
  text: "Tell me the goal you're stuck on and I'll break it into weighted steps you can start right now.",
  sender: 'planner',
  timestamp: new Date(),
  suggestions: [
    'Break "launch my portfolio site" into steps',
    "I have 45 minutes and low energy — what should I do?",
    'My goal is too vague to start'
  ]
};

const QuestChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const quickPrompts = [
    { label: 'Break down a goal', query: 'Break this project down into weighted steps with time estimates.' },
    { label: 'I have little energy', query: 'My energy is low. Give me one small step I can finish in 20 minutes.' },
    { label: 'What should I do next?', query: 'Look at my active goals and tell me what to work on next.' },
    { label: 'Start a 25 min sprint', query: 'Set up a 25 minute focus sprint with a clear finish line.' }
  ];

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}-u`,
      text: content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await questsageAPI.analyzeMessage({
        message: content,
        user_id: 1,
        context: { surface: 'deconstruct' }
      });

      const raw = response.quest_data as any;
      const blueprint: Blueprint | null = raw && raw.title
        ? {
            title: raw.title,
            description: raw.description || '',
            difficulty: raw.difficulty || 'normal',
            xp_value: raw.xp_value || 150,
            estimated_duration: raw.estimated_duration || 30,
            steps: Array.isArray(raw.subtasks)
              ? raw.subtasks.map((s: any) => ({
                  title: s.title || s.text || 'Untitled step',
                  xp_value: s.xp_value || 0,
                  estimated_duration: s.estimated_duration || 0
                }))
              : []
          }
        : null;

      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-p`,
          text: response.message || 'Here is the breakdown.',
          sender: 'planner',
          timestamp: new Date(),
          suggestions: response.suggestions,
          blueprint: blueprint && blueprint.steps.length > 0 ? blueprint : null
        }
      ]);
    } catch (error) {
      console.error('Error analyzing message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          text: "I couldn't reach the planner service. Your message wasn't lost — try again, or check that the backend is running on port 8000.",
          sender: 'planner',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBlueprint = async (messageId: string, blueprint: Blueprint) => {
    setSavingId(messageId);
    try {
      const total = blueprint.steps.reduce((sum, s) => sum + 1, 0) || 1;
      await questsageAPI.createQuest(1, {
        title: blueprint.title,
        description: blueprint.description,
        difficulty: blueprint.difficulty,
        xp_value: blueprint.xp_value,
        estimated_duration: blueprint.estimated_duration,
        subtasks: blueprint.steps.map((step) => ({
          text: step.title,
          completed: false,
          weight: Math.round(100 / total)
        }))
      });
      setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, saved: true } : m)));
    } catch (error) {
      console.error('Error saving blueprint:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-save-err`,
          text: "Couldn't save that goal to your list. The server rejected the request — nothing was changed.",
          sender: 'planner',
          timestamp: new Date()
        }
      ]);
    } finally {
      setSavingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-24 safe-bottom">
        <header className="mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--border-accent)', color: 'var(--accent-primary)' }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Deconstruct
              </h1>
              <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                Turn a vague goal into weighted steps you can start today.
              </p>
            </div>
          </div>
        </header>

        <section
          className="rounded-lg border p-4 sm:p-5 mb-4 min-h-[420px] max-h-[58vh] overflow-y-auto space-y-5"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          aria-live="polite"
        >
          {messages.map((message) => {
            const isPlanner = message.sender === 'planner';

            return (
              <div key={message.id} className={`flex flex-col ${isPlanner ? 'items-start' : 'items-end'}`}>
                <span className="text-[10px] font-mono uppercase tracking-wider mb-1.5 px-1" style={{ color: 'var(--text-muted)' }}>
                  {isPlanner ? 'Planner' : 'You'} · {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div
                  className="p-3.5 rounded-md text-sm font-body leading-relaxed max-w-xl"
                  style={isPlanner ? {
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)'
                  } : {
                    backgroundColor: 'var(--accent-muted)',
                    border: '1px solid var(--border-accent)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>

                  {/* Blueprint card — the actual deliverable of this screen */}
                  {message.blueprint && (
                    <div
                      className="mt-3.5 rounded-md border overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-strong)' }}
                    >
                      <div className="p-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`stamp-${message.blueprint.difficulty}`}>
                            {message.blueprint.difficulty}
                          </span>
                          <span className="chip-label">{message.blueprint.xp_value} XP</span>
                          <span className="chip-label">{message.blueprint.estimated_duration} MIN</span>
                        </div>
                        <div className="font-display font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                          {message.blueprint.title}
                        </div>
                      </div>

                      <ol className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                        {message.blueprint.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 p-2.5">
                            <span
                              className="font-mono text-[10px] w-4 flex-shrink-0 mt-0.5 tabular-nums"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {idx + 1}
                            </span>
                            <span className="flex-1 text-xs font-body" style={{ color: 'var(--text-primary)' }}>
                              {step.title}
                            </span>
                            {step.estimated_duration > 0 && (
                              <span className="font-mono text-[10px] flex-shrink-0 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                                {step.estimated_duration}m
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>

                      <div className="p-2.5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        <button
                          onClick={() => saveBlueprint(message.id, message.blueprint!)}
                          disabled={message.saved || savingId === message.id}
                          className={message.saved ? 'btn-secondary w-full flex items-center justify-center gap-2 text-xs' : 'btn-primary w-full flex items-center justify-center gap-2 text-xs'}
                        >
                          {message.saved ? (
                            <>
                              <Check className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />
                              <span>Saved to your goals</span>
                            </>
                          ) : savingId === message.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving…</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Save as goal</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {isPlanner && !message.blueprint && message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Try next
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => send(sug)}
                            className="text-left text-xs font-body px-2.5 py-1 rounded border cursor-pointer transition-colors"
                            style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex flex-col items-start gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-1" style={{ color: 'var(--text-muted)' }}>
                Planning…
              </span>
              <div
                className="p-3.5 rounded-md border w-full max-w-md space-y-2.5"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="chronicle-skeleton h-3 w-40" />
                <div className="chronicle-skeleton h-3 w-full" />
                <div className="chronicle-skeleton h-3 w-3/4" />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </section>

        <section className="mb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => send(qp.query)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-md border text-xs font-body flex-shrink-0 cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                {qp.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div
            className="p-2.5 rounded-lg border"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex flex-col sm:flex-row gap-2.5">
              <textarea
                rows={2}
                className="input-field flex-1 resize-none"
                placeholder="Describe the goal you're stuck on… (Enter to send, Shift+Enter for a new line)"
                aria-label="Describe your goal"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || isLoading}
                className="btn-primary flex items-center justify-center gap-2 px-5 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default QuestChat;
