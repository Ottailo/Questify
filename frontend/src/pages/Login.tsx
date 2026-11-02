import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Brain, Database, AlertCircle } from 'lucide-react';
import { questsageAPI } from '../services/api';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: 'demo@questsage.com',
    password: 'demo123',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await questsageAPI.loginUser({
        email: formData.email,
        password: formData.password
      });
      navigate('/');
    } catch (error: any) {
      const detail = error.response?.data?.error || error.response?.data?.detail || 'Authentication failed. Please verify credentials.';
      setErrorMessage(detail);
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
        {/* Left: Brand & Feature Overview */}
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
              <span className="chip-label">QUESTSAGE</span>
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
              TURN AMBITION INTO ACTION
            </h1>
            <p className="text-sm sm:text-base font-body leading-relaxed max-w-lg" style={{ color: 'var(--text-secondary)' }}>
              Break down complex goals into clear, actionable steps. Powered by AI that understands how you work best.
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
                SYSTEM STATUS
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
            "A goal without a plan is just a wish. Start building momentum."
          </blockquote>
        </div>

        {/* Right: Sign In Form */}
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
              <span className="chip-label">
                SIGN IN
              </span>
              <h2
                className="font-display font-bold text-2xl tracking-wide uppercase"
                style={{ color: 'var(--text-primary)' }}
              >
                WELCOME BACK
              </h2>
              <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                Sign in to access your goals, progress, and AI assistant.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {errorMessage && (
                <div
                  className="p-3 rounded border flex items-start gap-2 text-xs font-mono"
                  role="alert"
                  style={{
                    backgroundColor: 'var(--status-danger-muted)',
                    borderColor: 'var(--status-danger)',
                    color: 'var(--status-danger)'
                  }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-mono uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Email
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
                    placeholder="you@example.com"
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
                    Password
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
                    placeholder="Enter your password"
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
                  <span>Remember me</span>
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
                      SIGNING IN...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span className="font-display tracking-wider uppercase text-xs">Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-mono text-xs font-bold hover:underline"
                    style={{ color: 'var(--brass-primary)' }}
                  >
                    Create Account
                  </Link>
                </span>
              </div>
            </form>

            {/* Demo Credentials */}
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
                EMAIL: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>demo@questsage.com</span> | PASSWORD: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>demo123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
