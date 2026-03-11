import { Link } from 'react-router-dom';
import {
  Layers, ArrowRight, Zap, Shield, Code2, Rocket,
  Package, ShoppingCart, Users, Calculator, Truck, BarChart3,
  CheckCircle2, Star, Globe, Clock
} from 'lucide-react';

const features = [
  { icon: Zap,    title: 'AI-Powered Generation', desc: 'Smart module suggestions and full-stack code generated in minutes based on your industry.',    gradient: 'from-amber-400 to-orange-500',  bg: 'bg-amber-50' },
  { icon: Code2,  title: 'Production-Grade Code',  desc: 'Clean React + Express + MongoDB with proper architecture, models, APIs, and beautiful UI.', gradient: 'from-blue-400 to-indigo-500',   bg: 'bg-blue-50'  },
  { icon: Rocket, title: 'One-Click Deploy',        desc: 'Deploy via Docker or PM2 — live URL ready to share with your clients instantly.',          gradient: 'from-violet-400 to-purple-500', bg: 'bg-violet-50'},
  { icon: Shield, title: 'Secure by Default',       desc: 'JWT auth, input validation, and error handling built in right out of the box.',            gradient: 'from-emerald-400 to-teal-500',  bg: 'bg-emerald-50'},
];

const modules = [
  { icon: Package,      name: 'Inventory' },
  { icon: ShoppingCart, name: 'Sales' },
  { icon: Users,        name: 'HR' },
  { icon: Calculator,   name: 'Accounting' },
  { icon: Truck,        name: 'Shipping' },
  { icon: BarChart3,    name: 'Analytics' },
];

const stats = [
  { value: '500+',   label: 'Businesses Built',  icon: Globe },
  { value: '12',     label: 'ERP Modules',        icon: Layers },
  { value: '< 5min', label: 'Time to Generate',  icon: Clock },
  { value: '100%',   label: 'Code Ownership',     icon: Shield },
];

const steps = [
  { step: '01', title: 'Tell Us Your Needs',  desc: 'Answer a quick questionnaire about your industry, team size, and requirements.' },
  { step: '02', title: 'Customize Modules',   desc: 'Drag-and-drop modules, add custom fields, define workflows — no code needed.' },
  { step: '03', title: 'Generate Code',       desc: 'AI generates full-stack code — backend APIs, database models, and React UI.' },
  { step: '04', title: 'Deploy & Go Live',    desc: 'One-click deploy. Your system is live and ready to manage your business.' },
];

const plans = [
  { name: 'Free',     price: 'Free', period: 'forever', highlight: false, popular: false,
    features: ['1 Project', '3 Modules', 'Code download (ZIP)', 'Community support'],
    cta: 'Get Started Free' },
  { name: 'Pro',      price: '$29',  period: 'per month', highlight: true, popular: true,
    features: ['5 Projects', 'All 12+ modules', 'One-click deployment', 'Priority support', 'Custom branding'],
    cta: 'Start Pro Trial' },
  { name: 'Business', price: '$99',  period: 'per month', highlight: false, popular: false,
    features: ['Unlimited projects', 'All modules', 'Team collaboration', 'API access', 'Dedicated support'],
    cta: 'Contact Sales' },
];

const testimonials = [
  { name: 'Ali Hassan',  role: 'CEO, TechPak',     text: 'Built our inventory system in 4 minutes. Absolutely incredible tool!', stars: 5 },
  { name: 'Sara Malik',  role: 'CTO, LogiCo',      text: 'Saved us 3 months of development time. Highly recommended for any business.', stars: 5 },
  { name: 'Usman Ahmed', role: 'Founder, BizFlow',  text: 'The generated code is clean, well-structured, and production-ready.', stars: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Layers className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">ERP Builder</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <a href="#how"      className="px-4 py-2 font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">How it Works</a>
            <a href="#features" className="px-4 py-2 font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">Features</a>
            <a href="#pricing"  className="px-4 py-2 font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/demo"     className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">🎯 Live Demo</Link>
            <Link to="/login"    className="px-3.5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-bg text-white overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-white/[0.04] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] border border-white/[0.06] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-white/[0.08] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" style={{ animation: 'pulse 2s infinite' }} />
            <Zap className="w-3.5 h-3.5 text-indigo-300" />
            Build your full ERP system in under 5 minutes
          </div>

          <h1 className="text-5xl md:text-[68px] font-extrabold leading-[1.08] tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Build Custom{' '}
            <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ERP Systems
            </span>
            <br />Without Writing Code
          </h1>

          <p className="text-lg md:text-xl text-indigo-200/90 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Select your modules, customize entities, and get a fully working management system
            with database, APIs, and beautiful React UI — deployed and ready in minutes.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-2xl font-bold text-base hover:bg-indigo-50 transition-all shadow-2xl hover:-translate-y-0.5 active:translate-y-0">
              Start Building Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/demo"
              className="inline-flex items-center gap-2 glass px-8 py-3.5 rounded-2xl font-bold text-base hover:bg-white/15 transition-all">
              🎯 Watch Live Demo
            </Link>
          </div>

          <div className="mt-14 flex items-center justify-center gap-3 flex-wrap animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {modules.map(m => (
              <div key={m.name} className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                <m.icon className="w-4 h-4 text-indigo-300" />
                <span className="text-white/80">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center group">
              <div className="inline-flex items-center justify-center w-11 h-11 bg-indigo-50 rounded-2xl mb-3 group-hover:bg-indigo-100 transition-colors">
                <s.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{s.value}</div>
              <div className="text-sm text-gray-500 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white" id="how">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Process</span>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">From idea to live app</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">4 simple steps. No developer needed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(item => (
              <div key={item.step} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm mb-4 shadow-lg shadow-indigo-200">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Features</span>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Everything you need</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Built for businesses that want powerful software without the complexity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/60 transition-all duration-300">
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`bg-gradient-to-br ${f.gradient} rounded-xl w-8 h-8 flex items-center justify-center shadow-sm`}>
                    <f.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Loved by businesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-6 bg-white" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Pricing</span>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-gray-500 mt-3">Start free. Upgrade when you need more power.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {plans.map(plan => (
              <div key={plan.name} className={`rounded-2xl p-8 relative transition-all ${plan.highlight
                ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 text-white shadow-2xl shadow-indigo-300/40 md:-translate-y-2'
                : 'bg-white border border-gray-100 shadow-sm'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    ✦ MOST POPULAR
                  </div>
                )}
                <h3 className={`text-lg font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className="flex items-end gap-1 mt-3 mb-6">
                  <span className={`text-4xl font-extrabold tracking-tight ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-indigo-300' : 'text-gray-400'}`}>/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-indigo-300' : 'text-emerald-500'}`} />
                      <span className={plan.highlight ? 'text-indigo-100' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${plan.highlight
                    ? 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="hero-bg rounded-3xl p-12 text-center text-white overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none">
              <div className="w-[600px] h-[600px] border-2 border-white rounded-full animate-spin-slow" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Ready to build your system?</h2>
              <p className="text-indigo-200 mb-8 text-lg">Join 500+ businesses that built custom systems in minutes.</p>
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-700">ERP Builder</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-gray-700 transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-gray-700 transition-colors">Pricing</a>
            <Link to="/demo"    className="hover:text-gray-700 transition-colors">Live Demo</Link>
            <Link to="/login"   className="hover:text-gray-700 transition-colors">Sign In</Link>
          </div>
          <span>&copy; {new Date().getFullYear()} ERP Builder. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
