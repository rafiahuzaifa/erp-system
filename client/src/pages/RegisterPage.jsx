import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const perks = [
  '1 free project to get started',
  'Full-stack code generated in minutes',
  'Download ZIP — you own the code',
  'No credit card required',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (form.password.length < 6) { setValidationError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setValidationError('Passwords do not match'); return; }
    try {
      await register(form.name, form.email, form.password);
      navigate('/', { replace: true });
    } catch {}
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] hero-bg flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/20 rounded-full" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">ERP Builder</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4 tracking-tight">
            Start building<br />
            <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              for free today
            </span>
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
            Create your account and get your first ERP system running in under 5 minutes.
          </p>
        </div>
        <div className="relative z-10 space-y-3">
          {perks.map(p => (
            <div key={p} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-medium text-white/90">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">ERP Builder</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create your account</h1>
              <p className="text-gray-500 mt-1 text-sm">Free forever. No credit card needed.</p>
            </div>

            {displayError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-center justify-between">
                <span>{displayError}</span>
                <button onClick={() => { clearError(); setValidationError(''); }} className="ml-3 font-bold text-red-500 hover:text-red-700">×</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                  className="input" placeholder="John Doe" required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  className="input" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={e => update('password', e.target.value)}
                    className="input pr-10" placeholder="Min 6 characters" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <input type="password" value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  className="input" placeholder="Repeat your password" required />
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm mt-2">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
