import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, ArrowRight, Zap, Shield, Code2, Rocket,
  Package, ShoppingCart, Users, Calculator, Truck, BarChart3
} from 'lucide-react';

const features = [
  { icon: Zap, title: 'AI-Powered', desc: 'Smart module suggestions based on your industry and business needs' },
  { icon: Code2, title: 'Auto Code Gen', desc: 'Full-stack code generated in minutes — models, APIs, and frontend' },
  { icon: Rocket, title: 'One-Click Deploy', desc: 'Deploy your application instantly with a single click' },
  { icon: Shield, title: 'Production Ready', desc: 'JWT auth, validation, error handling — all built in' }
];

const modules = [
  { icon: Package, name: 'Inventory' },
  { icon: ShoppingCart, name: 'Sales' },
  { icon: Users, name: 'HR' },
  { icon: Calculator, name: 'Accounting' },
  { icon: Truck, name: 'Shipping' },
  { icon: BarChart3, name: 'Analytics' }
];

const plans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['1 Project', '3 Modules', 'Basic code generation', 'Community support'],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29/mo',
    features: ['5 Projects', 'All modules', 'One-click deployment', 'Code export (ZIP)', 'Priority support'],
    cta: 'Start Pro Trial',
    popular: true
  },
  {
    name: 'Business',
    price: '$99/mo',
    features: ['Unlimited projects', 'All modules', 'Team collaboration', 'API access', 'Dedicated support'],
    cta: 'Contact Sales',
    popular: false
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">ERP Builder</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Build your business system in minutes
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Build Custom <span className="text-primary-600">ERP Systems</span> Without Writing Code
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Select your modules, customize entities, and get a fully working management system
            with database, APIs, and frontend — deployed and ready to use.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-3 flex items-center gap-2"
            >
              Start Building Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="btn-secondary text-lg px-8 py-3">
              See How It Works
            </a>
          </div>

          {/* Module icons */}
          <div className="mt-16 flex items-center justify-center gap-6 flex-wrap">
            {modules.map(m => (
              <div key={m.name} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                <m.icon className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-gray-50" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">How It Works</h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            From questionnaire to deployed application in 4 simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Tell Us Your Needs', desc: 'Answer a quick questionnaire about your industry and requirements' },
              { step: '2', title: 'Customize Modules', desc: 'Drag-and-drop modules, add custom fields and workflows' },
              { step: '3', title: 'Generate Code', desc: 'AI generates full-stack code — backend, frontend, and database' },
              { step: '4', title: 'Deploy & Use', desc: 'One-click deploy. Your system is live and ready to manage your business' }
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why ERP Builder?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gray-50" id="pricing">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple Pricing</h2>
          <p className="text-center text-gray-500 mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-8 border-2 ${
                  plan.popular ? 'border-primary-600 shadow-lg relative' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-2.5 rounded-lg font-medium ${
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Build Your System?</h2>
          <p className="text-gray-500 mb-8">
            Join businesses that have built and deployed custom management systems in minutes.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            <span>ERP Builder</span>
          </div>
          <span>&copy; {new Date().getFullYear()} ERP Builder. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
