const INDUSTRIES = {
  erp: { id: 'erp', name: 'Enterprise Resource Planning', icon: 'building-2' },
  logistics: { id: 'logistics', name: 'Logistics & Distribution', icon: 'truck' },
  supply_chain: { id: 'supply_chain', name: 'Supply Chain Management', icon: 'link' },
  custom: { id: 'custom', name: 'Custom Application', icon: 'settings' }
};

const COMPANY_SIZES = {
  startup: { id: 'startup', name: 'Startup', range: '1-10 employees' },
  small: { id: 'small', name: 'Small Business', range: '11-50 employees' },
  medium: { id: 'medium', name: 'Medium Enterprise', range: '51-500 employees' },
  enterprise: { id: 'enterprise', name: 'Large Enterprise', range: '500+ employees' }
};

const PROJECT_STATUSES = {
  QUESTIONNAIRE: 'questionnaire',
  DESIGNING: 'designing',
  GENERATING: 'generating',
  GENERATED: 'generated',
  DEPLOYING: 'deploying',
  DEPLOYED: 'deployed',
  FAILED: 'failed'
};

const FIELD_TYPES = ['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Array', 'Enum'];

const RELATIONSHIP_TYPES = ['one-to-one', 'one-to-many', 'many-to-many'];

const AUTOMATION_LEVELS = {
  manual: { id: 'manual', name: 'Manual', description: 'All steps require human action' },
  semi_auto: { id: 'semi-auto', name: 'Semi-Automated', description: 'Key steps automated, human oversight' },
  full_auto: { id: 'full-auto', name: 'Fully Automated', description: 'End-to-end automation' }
};

const DATABASE_OPTIONS = {
  mongodb: { id: 'mongodb', name: 'MongoDB', description: 'Flexible document database' },
  postgresql: { id: 'postgresql', name: 'PostgreSQL', description: 'Relational database' },
  both: { id: 'both', name: 'Both', description: 'MongoDB + PostgreSQL' }
};

const DEPLOYMENT_STATUSES = {
  PENDING: 'pending',
  BUILDING: 'building',
  RUNNING: 'running',
  STOPPED: 'stopped',
  FAILED: 'failed',
  DESTROYED: 'destroyed'
};

module.exports = {
  INDUSTRIES,
  COMPANY_SIZES,
  PROJECT_STATUSES,
  FIELD_TYPES,
  RELATIONSHIP_TYPES,
  AUTOMATION_LEVELS,
  DATABASE_OPTIONS,
  DEPLOYMENT_STATUSES
};
