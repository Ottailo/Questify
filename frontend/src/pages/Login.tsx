import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Brain, Database } from 'lucide-react';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: 'demo@questsage.com',
    password: 'demo123',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      localStorage.setItem('questsage_token', 'chronicler_verified_token');
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePreloadDemo = () => {
    setFormData({
      email: 'demo@questsage.com',
      password: 'demo123',
    });
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <div className="ambient-hero-glow" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Stage: Expedition Briefing & Operational Dossier */}
        <div className="lg:col-span-6 space-y-6 lg:pr-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-brass)',
                color: 'var(--brass-primary)',
              }}
            >
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="chronicle-stamp">GUILD VANGUARD</span>
              <div className="font-display font-bold text-sm tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>
                QUESTSAGE OS
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-wide uppercase leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              THE CRYPTOGRAPHIC LEDGER OF AMBITION
            </h1>
            <p className="text-sm sm:text-base font-body leading-relaxed max-w-lg" style={{ color: 'var(--text-secondary)' }}>
              Transform amorphous goals into discrete tactical campaigns. Powered by Great Sage AI and local OmniRoute multi-model intelligence.
            </p>
          </div>

          {/* Archival Telemetry Box */}
          <div
            className="p-5 rounded-lg border space-y-3"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                ARCHIVAL TELEMETRY
              </span>
              <span className="text-[10px] font-mono tracking-widest font-bold" style={{ color: 'var(--status-success)' }}>
                [ONLINE]
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div
                className="p-3 rounded border"
                style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
                  <Brain className="w-3.5 h-3.5" style={{ color: 'var(--brass-primary)' }} />
                  <span>AI Cognition</span>
                </div>
                <div className="text-xs font-mono font-semibold mt-1" style={{ color: 'var(--brass-primary)' }}>
                  OmniRoute LLM
                </div>
              </div>

              <div
                className="p-3 rounded border"
                style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
                  <Lock className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
                  <span>Encryption</span>
                </div>
                <div className="text-xs font-mono font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
                  Bcrypt-12 / JWT
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" style={{ color: 'var(--brass-primary)' }} />
                <span>Database Engine:</span>
              </span>
              <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--brass-primary)' }}>
                SQLite // PostgreSQL
              </span>
            </div>
          </div>

          <blockquote className="font-serif italic text-xs leading-relaxed pl-3 border-l-2" style={{ borderColor: 'var(--brass-primary)', color: 'var(--text-muted)' }}>
            "Directives without discipline dissolve into entropy. Inscribe your milestones."
          </blockquote>
        </div>

        {/* Right Stage: Authentication Dossier Card */}
        <div className="lg:col-span-6">
          <div
            className="rounded-lg border p-6 sm:p-8 relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-brass)',
              boxShadow: 'var(--shadow-md), var(--shadow-brass)'
            }}
          >
            {/* Top Forged Brass Accent Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: 'linear-gradient(90deg, var(--brass-primary) 0%, var(--accent-primary) 100%)' }}
            />

            <div className="text-center space-y-2 mb-6">
              <span className="chronicle-stamp">
                GUILD ARCHIVE // AUTHENTICATION
              </span>
              <h2
                className="font-display font-bold text-2xl tracking-wide uppercase"
                style={{ color: 'var(--text-primary)' }}
              >
                AUTHORIZE CHRONICLER
              </h2>
              <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                Present your credentials to access the Guild Ledger, active campaigns, and Great Sage telemetry.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-mono uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Chronicler Dispatch (Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field w-full pl-9 font-body"
                    placeholder="chronicler@guild.archive"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-mono uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Cipher Key (Password)
                  </label>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    Bcrypt 12-Round
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field w-full pl-9 pr-10 font-body"
                    placeholder="Enter archival cipher"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer border-0 bg-transparent"
                    style={{ color: 'var(--text-muted)' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-body cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="rounded border"
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>Persist Archival Session</span>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                      VERIFYING CIPHER...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span className="font-display tracking-wider uppercase text-xs">Access Ledger</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                  Unregistered Chronicler?{' '}
                  <Link
                    to="/register"
                    className="font-mono text-xs font-bold hover:underline"
                    style={{ color: 'var(--brass-primary)' }}
                  >
                    Inscribe New Docket
                  </Link>
                </span>
              </div>
            </form>

            {/* Tactical Demo Docket Footer */}
            <div
              className="mt-5 p-3 rounded border text-xs font-mono space-y-1"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-subtle)',
                borderLeft: '3px solid var(--border-brass)'
              }}
            >
              <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--brass-primary)' }}>
                <span className="uppercase tracking-wider">PRELOADED DEMO CREDENTIALS</span>
                <button
                  onClick={handlePreloadDemo}
                  className="underline hover:text-primary cursor-pointer border-0 bg-transparent p-0 text-[10px] font-mono"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Auto-fill
                </button>
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                EMAIL: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>demo@questsage.com</span> | CIPHER: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>demo123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
