import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Brain
} from 'lucide-react';
import { questsageAPI } from '../services/api';
import Navigation from '../components/Navigation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sage';
  timestamp: Date;
  intent?: string;
  suggestions?: string[];
}

const QuestChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hail, Chronicler. The Great Sage stands ready at the Guild Archive. Dictate your operational blockers, request campaign milestone deconstruction, or seek tactical calibration for today's roster.",
      sender: 'sage',
      timestamp: new Date(),
      suggestions: [
        "Deconstruct a complex objective into weighted subtasks",
        "Calibrate fatigue and suggest a low-friction sprint",
        "Audit my active quest ledger for blockers"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickDirectives = [
    { label: "Deconstruct Directive", query: "Deconstruct this ambitious project into 3 weighted operational milestones." },
    { label: "Calibrate Fatigue", query: "My mental energy is depleted. Recommend a 20-minute low-friction objective." },
    { label: "Audit Ledger", query: "Review my current active campaigns and recommend what to tackle first." },
    { label: "Sprint Focus", query: "Initiate a 25-minute Pomodoro focus campaign with clear completion criteria." }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageContent,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await questsageAPI.analyzeMessage({
        message: messageContent,
        user_id: 1,
        context: { surface: 'chat-sanctuary', channel: 'great-sage' }
      });

      const sageMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message || "Directive received and chronicled. The Great Sage recommends proceeding with tactical discipline.",
        sender: 'sage',
        timestamp: new Date(),
        intent: response.intent,
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, sageMessage]);
    } catch (error) {
      console.error('Error analyzing message:', error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "The archival uplink encountered a transmission delay. However, your directive is logged: break down the milestone into measurable increments, focus on single-threaded execution, and verify before advancing.",
        sender: 'sage',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <Navigation username="Great Sage User" level={5} xp={1250} />

      {/* Surface Mode: READ Sanctuary (68-75ch maximum reading column) */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-20 safe-bottom">
        {/* Sanctuary Header */}
        <section className="mb-6">
          <div
            className="p-4 sm:p-5 rounded-lg border relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: 'var(--border-brass)' }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-brass)',
                    color: 'var(--brass-primary)'
                  }}
                >
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="chronicle-stamp">
                      GREAT SAGE // NLU COGNITIVE CO-PILOT
                    </span>
                    <span className="text-[10px] font-mono tracking-widest font-bold" style={{ color: 'var(--status-success)' }}>
                      [ONLINE]
                    </span>
                  </div>
                  <h1 className="font-display font-bold text-lg sm:text-xl tracking-wide uppercase mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    THE SCRIBE SANCTUARY
                  </h1>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                <span>READ MODE: CALM</span>
                <span>LATENCY: &lt;180MS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Message Stream (Focused 70ch Read Sanctuary) */}
        <section className="mb-6">
          <div
            className="rounded-lg border p-4 sm:p-6 min-h-[460px] max-h-[560px] overflow-y-auto space-y-6"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            {messages.map((message) => {
              const isSage = message.sender === 'sage';

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isSage ? 'items-start' : 'items-end'}`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: isSage ? 'var(--brass-primary)' : 'var(--text-muted)' }}>
                      {isSage ? 'GREAT SAGE ARCHIVIST' : 'YOU (CHRONICLER)'}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Bubble Container */}
                  <div
                    className="p-4 rounded-lg text-sm font-body leading-relaxed max-w-xl transition-colors"
                    style={
                      isSage ? {
                        backgroundColor: 'var(--bg-elevated)',
                        borderLeft: '3px solid var(--brass-primary)',
                        borderTop: '1px solid var(--border-subtle)',
                        borderRight: '1px solid var(--border-subtle)',
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)'
                      } : {
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-brass)',
                        color: 'var(--text-primary)',
                        borderRight: '3px solid var(--accent-primary)'
                      }
                    }
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>

                    {/* Interactive Sage Suggestions Chips if provided */}
                    {isSage && message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-4 pt-3 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--brass-primary)' }}>
                          RECOMMENDED DIRECTIVES
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(sug)}
                              className="text-left text-xs font-mono px-2.5 py-1 rounded border cursor-pointer transition-colors"
                              style={{
                                backgroundColor: 'var(--bg-canvas)',
                                borderColor: 'var(--border-subtle)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              ↳ {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Tactical Indeterminate Scanline Loader (Purging Slop Item #7: Bouncing Dots) */}
            {isLoading && (
              <div className="flex flex-col items-start space-y-2 max-w-md">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--brass-primary)' }}>
                    GREAT SAGE COGNITION IN PROGRESS
                  </span>
                </div>
                <div
                  className="p-4 rounded-lg border w-full space-y-3"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-subtle)',
                    borderLeft: '3px solid var(--border-brass)'
                  }}
                >
                  <div className="sage-scanline w-full">
                    <div className="sage-scanline-bar" />
                  </div>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    Consulting Guild Ledger & synthesizing tactical recommendations...
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>

        {/* Tactical Quick Directives Bar (Purging Slop #9 - 4-Card Marketing Grid) */}
        <section className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            <span className="text-[10px] uppercase tracking-wider flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              QUICK PROMPTS:
            </span>
            {quickDirectives.map((qd, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(qd.query)}
                className="px-2.5 py-1 rounded border flex-shrink-0 cursor-pointer transition-colors hover:border-brass text-left"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)'
                }}
              >
                {qd.label}
              </button>
            ))}
          </div>
        </section>

        {/* Input Control Area */}
        <section>
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  className="input-field w-full font-body resize-none"
                  placeholder="Consult the Great Sage or dictate campaign milestones... [Enter to dispatch]"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="btn-primary flex items-center justify-center gap-2 sm:self-stretch px-5 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="font-display tracking-wider uppercase text-xs">Dispatch</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono mt-2 px-1" style={{ color: 'var(--text-muted)' }}>
              <span>TACTICAL ADVISOR ENGINE V2.4</span>
              <span>[SHIFT + ENTER FOR NEWLINE]</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default QuestChat;
