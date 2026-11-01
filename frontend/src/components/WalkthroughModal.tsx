import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  CheckSquare,
  Sliders,
  Trophy,
  Brain,
  Zap
} from 'lucide-react';

interface WalkthroughStep {
  id: number;
  badge: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlights: string[];
}

const STEPS: WalkthroughStep[] = [
  {
    id: 1,
    badge: 'PROTOCOL 01 // SECURITY',
    title: 'Cryptographic Auth & Persistent Sessions',
    description: 'Every vanguard account is secured with 12-round Bcrypt password hashing and signed PyJWT tokens. State seamlessly persists across SQLite and PostgreSQL dual engines.',
    icon: ShieldCheck,
    highlights: [
      'Bcrypt 12-round password hashing with zero plain-text leaks',
      'Cryptographic JWT sessions automatically verified in the browser',
      'Dual-dialect schema architecture supporting local SQLite and cloud PostgreSQL'
    ]
  },
  {
    id: 2,
    badge: 'PROTOCOL 02 // COGNITION',
    title: 'Great Sage AI NLU Copilot',
    description: 'Deconstruct complex ambitions into structured, weighted quest blueprints. Great Sage communicates directly through your local OmniRoute LLM gateway at zero marginal cost.',
    icon: Brain,
    highlights: [
      'Local OmniRoute gateway integration (port 20129) at $0 operational cost',
      'Automatic cognitive breakdown: subtasks, XP values, and estimated duration',
      'One-click "Inscribe Quest" to immediately record blueprints to your active ledger'
    ]
  },
  {
    id: 3,
    badge: 'PROTOCOL 03 // EXECUTION',
    title: 'Tactical Quest & Milestone Ledger',
    description: 'Execute daily sprints and long-term campaigns. Each quest features weighted subtasks with optimistic live checking, real-time database synchronization, and level progress calculations.',
    icon: CheckSquare,
    highlights: [
      'Tactile subtask strikes persist database state with zero reload lag',
      'Visual progress rails indicate exact percentage of completed milestones',
      'One-click "Claim Victory" to bank earned XP directly to your player level'
    ]
  },
  {
    id: 4,
    badge: 'PROTOCOL 04 // CALIBRATION',
    title: 'Cognitive Focus & Fatigue Calibration',
    description: 'QuestSage calibrates to your real-time mental energy. Tune sprint duration between 15 and 90 minutes, configure focus alerts, and prevent burnout through intelligent pacing.',
    icon: Sliders,
    highlights: [
      'Three operational states: Low Energy (20m), Moderate (45m), High Flow (90m)',
      'Prevents burnout through intelligent pacing adjustments and break alerts',
      'Consecutive streak tracking to reinforce daily operational momentum'
    ]
  },
  {
    id: 5,
    badge: 'PROTOCOL 05 // MASTERY',
    title: 'Developer Stats & Achievements',
    description: 'Track your growth from Level 1 to Level 10+ Vanguard. Unlock achievement badges, inspect productivity analytics, and audit your complete historical quest log.',
    icon: Trophy,
    highlights: [
      'Tiered badge unlocks based on completed quests and consistency streaks',
      'Detailed analytics: total quests, completion rate, and accumulated XP points',
      'Clean developer profile with customizable focus notifications'
    ]
  }
];

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('questsage_walkthrough_completed_steps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const IconComponent = step.icon;
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  const toggleStepCompleted = (stepId: number) => {
    setCompletedSteps(prev => {
      const next = prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId];
      try {
        localStorage.setItem('questsage_walkthrough_completed_steps', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleClose = () => {
    try {
      localStorage.setItem('questsage_walkthrough_seen', 'true');
    } catch {}
    onClose();
  };

  const handleFinish = () => {
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl rounded-2xl border card-tactile shadow-2xl overflow-hidden flex flex-col relative"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-strong)'
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{
                background: 'var(--gradient-indigo)',
                color: '#FFFFFF'
              }}
            >
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-display">
                QuestSage Field Guide & Architectural Protocols
              </h2>
            </div>
          </div>

          <button
            data-testid="close-walkthrough"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="w-full h-1 flex bg-[var(--bg-subtle)]">
          {STEPS.map((s, idx) => (
            <div
              key={s.id}
              className="h-full flex-1 transition-all duration-300"
              style={{
                backgroundColor:
                  idx <= currentStep || completedSteps.includes(s.id)
                    ? 'var(--accent-primary)'
                    : 'transparent'
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="badge-pill badge-indigo">
              {step.badge}
            </span>
            <span className="font-mono text-xs text-[var(--text-muted)] font-semibold">
              {currentStep + 1} of {STEPS.length}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-muted)] border border-[var(--border-subtle)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0 shadow-sm">
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                {step.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div
            className="p-4 rounded-xl border space-y-2.5"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold block">
              Architectural Invariants
            </span>
            <div className="space-y-2">
              {step.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-primary)] font-medium">
                  <span className="text-[10px] font-mono text-[var(--brass-primary)] font-bold flex-shrink-0 mt-0.5">
                    [{i + 1}]
                  </span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Check */}
          <button
            onClick={() => toggleStepCompleted(step.id)}
            className="w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: completedSteps.includes(step.id) ? 'var(--emerald-primary)' : 'var(--border-subtle)'
            }}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={completedSteps.includes(step.id)}
                readOnly
                className="checkbox-tactile"
              />
              <span className={`text-xs font-semibold ${completedSteps.includes(step.id) ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>
                Mark protocol inspected & verified
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">
              {completedSteps.includes(step.id) ? 'Verified ✓' : 'Click to verify'}
            </span>
          </button>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={isFirst}
            className={`btn-base btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 ${isFirst ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep ? 'w-5 bg-[var(--accent-primary)]' : 'w-2 bg-[var(--bg-subtle)] hover:bg-[var(--text-muted)]'
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="btn-base btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
              className="btn-base btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalkthroughModal;
