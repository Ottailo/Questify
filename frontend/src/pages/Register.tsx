import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, BookOpen, Target, Sparkles, Brain, CheckCircle2 } from 'lucide-react';
import { questsageAPI } from '../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await questsageAPI.registerUser({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      navigate('/');
    } catch (error: any) {
      const detail = error.response?.data?.error || error.response?.data?.detail || 'Registration failed. Please try again.';
      setValidationError(typeof detail === 'string' ? detail : 'Registration failed. Check your details and try again.');
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

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <div className="ambient-hero-glow" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left: Features Overview */}
        <div className="lg:col-span-5 space-y-6 lg:pr-4">
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
                CREATE ACCOUNT
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1
              className="font-display font-bold text-3xl sm:text-4xl tracking-wide uppercase leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              START YOUR JOURNEY
            </h1>
            <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of focused achievers. Get AI-powered goal planning, visual progress tracking, and personalized focus calibration.
            </p>
          </div>

          {/* Features */}
          <div
            className="p-5 rounded-lg border space-y-3"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--brass-primary)' }}>
              <BookOpen className="w-3.5 h-3.5" />
              <span>WHAT YOU GET</span>
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                { icon: Brain, title: "AI Goal Assistant", desc: "Break complex goals into clear, weighted steps." },
                { icon: Target, title: "Focus Calibration", desc: "Smart task sizing based on your energy level." },
                { icon: Sparkles, title: "Progress Tracking", desc: "Visual progress bars that show real completion." },
                { icon: ShieldCheck, title: "Private & Secure", desc: "Your data stays private. Encrypted and secure." }
              ].map((priv, idx) => {
                const Icon = priv.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--brass-primary)' }} />
                    <div className="text-xs">
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{priv.title}</div>
                      <div className="text-[11px] font-body" style={{ color: 'var(--text-muted)' }}>{priv.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--status-success)' }}>
            <CheckCircle2 className="w-4 h-4" />
            <span>SIGN UP IS FREE — START NOW</span>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="lg:col-span-7">
          <div
            className="rounded-lg border p-6 sm:p-8 relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-brass)',
              boxShadow: 'var(--shadow-md), var(--shadow-brass)'
            }}
          >
            {/* Top Brass Accent Line */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: 'linear-gradient(90deg, var(--brass-primary) 0%, var(--accent-primary) 100%)' }}
            />

            <div className="text-center space-y-1.5 mb-5">
              <span className="chip-label">
                REGISTER
              </span>
              <h2
                className="font-display font-bold text-2xl tracking-wide uppercase"
                style={{ color: 'var(--text-primary)' }}
              >
                CREATE ACCOUNT
              </h2>
              <p className="text-xs font-body max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Set up your account and start building momentum.
              </p>
            </div>

            {/* Validation Notice */}
            {validationError && (
              <div
                className="mb-4 p-3 rounded border text-xs font-mono"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--status-danger)',
                  color: 'var(--status-danger)'
                }}
              >
                {validationError}
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-xs font-mono uppercase tracking-wider mb-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Given Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input-field w-full pl-9 font-body"
                      placeholder="Alex"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-xs font-mono uppercase tracking-wider mb-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input-field w-full pl-9 font-body"
                      placeholder="Smith"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-mono uppercase tracking-wider mb-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="input-field w-full pl-9 font-body"
                    placeholder="alex_smith"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-mono uppercase tracking-wider mb-1"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-mono uppercase tracking-wider mb-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field w-full pl-9 pr-10 font-body"
                      placeholder="Create a password"
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

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-mono uppercase tracking-wider mb-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field w-full pl-9 pr-10 font-body"
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer border-0 bg-transparent"
                      style={{ color: 'var(--text-muted)' }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="rounded border mt-0.5"
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <label htmlFor="terms" className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                  I agree to the{' '}
                  <span className="font-mono text-[11px]" style={{ color: 'var(--brass-primary)' }}>Terms of Service</span>{' '}
                  and Privacy Policy.
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
                      CREATING ACCOUNT...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span className="font-display tracking-wider uppercase text-xs">Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2.5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-mono text-xs font-bold hover:underline"
                    style={{ color: 'var(--brass-primary)' }}
                  >
                    Sign In
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
