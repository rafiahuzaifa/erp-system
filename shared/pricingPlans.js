const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    projectLimit: 1,
    moduleLimit: 3,
    canDeploy: false,
    canExport: false,
    supportLevel: 'community',
    pricing: { INR: 0, USD: 0 },
    displayPricing: { INR: 'Free', USD: 'Free' },
    interval: null,
    features: [
      '1 Project',
      '3 Modules per project',
      'Basic code generation',
      'Community support'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    projectLimit: 5,
    moduleLimit: -1,
    canDeploy: true,
    canExport: true,
    supportLevel: 'priority',
    pricing: { INR: 99900, USD: 2900 },
    displayPricing: { INR: '\u20B9999', USD: '$29' },
    interval: 'monthly',
    features: [
      '5 Projects',
      'All modules unlocked',
      'One-click deployment',
      'Code export (ZIP)',
      'Priority support',
      'Custom branding'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Business',
    projectLimit: -1,
    moduleLimit: -1,
    canDeploy: true,
    canExport: true,
    supportLevel: 'dedicated',
    pricing: { INR: 299900, USD: 9900 },
    displayPricing: { INR: '\u20B92,999', USD: '$99' },
    interval: 'monthly',
    features: [
      'Unlimited projects',
      'All modules unlocked',
      'One-click deployment',
      'Code export (ZIP)',
      'Dedicated support',
      'Custom branding',
      'Team collaboration',
      'API access',
      'Template marketplace access'
    ]
  }
};

const CURRENCIES = {
  INR: { code: 'INR', symbol: '\u20B9', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' }
};

const getPlanLimits = (planId) => PLANS[planId] || PLANS.free;

module.exports = { PLANS, CURRENCIES, getPlanLimits };
