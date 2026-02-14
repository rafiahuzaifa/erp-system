const steps = [
  {
    id: 0,
    key: 'industry',
    title: 'Industry & Company Profile',
    description: 'Tell us about your business to help us recommend the right modules.',
    fields: [
      {
        name: 'selected',
        label: 'What type of system are you building?',
        type: 'card-select',
        required: true,
        options: ['erp', 'logistics', 'supply_chain', 'custom']
      },
      {
        name: 'subCategory',
        label: 'What is your primary focus area?',
        type: 'select',
        required: false,
        dependsOn: { field: 'selected', values: ['erp', 'logistics', 'supply_chain'] },
        optionsByParent: {
          erp: ['Manufacturing', 'Retail', 'Services', 'Healthcare', 'Education'],
          logistics: ['Last-mile Delivery', 'Freight', '3PL', 'Courier', 'Cold Chain'],
          supply_chain: ['Manufacturing SCM', 'Retail SCM', 'Food & Beverage', 'Pharmaceutical', 'Automotive']
        }
      },
      {
        name: 'companySize',
        label: 'What is your company size?',
        type: 'card-select',
        required: true,
        options: ['startup', 'small', 'medium', 'enterprise']
      }
    ]
  },
  {
    id: 1,
    key: 'modules',
    title: 'Module Selection',
    description: 'Choose the modules you need. We will suggest the best ones based on your industry.',
    fields: [
      {
        name: 'selected',
        label: 'Select modules for your application',
        type: 'module-grid',
        required: true,
        minSelections: 1
      },
      {
        name: 'priorities',
        label: 'Set priority for each selected module',
        type: 'priority-sliders',
        required: false,
        dependsOn: { field: 'selected', condition: 'notEmpty' }
      }
    ]
  },
  {
    id: 2,
    key: 'entities',
    title: 'Data Entities & Fields',
    description: 'Customize the data structure for each module. Add or remove fields as needed.',
    fields: [
      {
        name: 'customizations',
        label: 'Customize entities for each module',
        type: 'entity-editor',
        required: false
      }
    ]
  },
  {
    id: 3,
    key: 'workflows',
    title: 'Workflows & Automation',
    description: 'Define business workflows and automation levels for your modules.',
    fields: [
      {
        name: 'workflows',
        label: 'Configure workflows',
        type: 'workflow-editor',
        required: false
      }
    ],
    defaultWorkflows: {
      inventory: [
        { name: 'Stock Reorder', description: 'Automatically create purchase orders when stock falls below reorder level' },
        { name: 'Stock Transfer', description: 'Transfer stock between warehouses with approval workflow' }
      ],
      sales: [
        { name: 'Order to Invoice', description: 'Automatically generate invoice when order is confirmed' },
        { name: 'Payment Reminder', description: 'Send reminders for overdue invoices' }
      ],
      purchasing: [
        { name: 'Purchase Approval', description: 'Multi-level approval for purchase orders based on amount' },
        { name: 'Goods Receipt', description: 'Record goods received and update inventory automatically' }
      ],
      hr: [
        { name: 'Leave Approval', description: 'Manager approval workflow for leave requests' },
        { name: 'Onboarding', description: 'New employee onboarding checklist and task assignments' }
      ],
      shipping: [
        { name: 'Shipment Tracking', description: 'Automatic status updates and customer notifications' },
        { name: 'Delivery Confirmation', description: 'Proof of delivery with digital signature' }
      ]
    }
  },
  {
    id: 4,
    key: 'review',
    title: 'Review & Configure',
    description: 'Review your selections and configure deployment settings.',
    fields: [
      {
        name: 'database',
        label: 'Database preference',
        type: 'card-select',
        required: true,
        options: ['mongodb', 'postgresql', 'both'],
        defaultValue: 'mongodb'
      },
      {
        name: 'authentication',
        label: 'Include authentication?',
        type: 'toggle',
        defaultValue: true
      },
      {
        name: 'authMethod',
        label: 'Authentication method',
        type: 'select',
        options: ['jwt', 'session'],
        defaultValue: 'jwt',
        dependsOn: { field: 'authentication', value: true }
      },
      {
        name: 'frontend',
        label: 'Generate frontend (React)?',
        type: 'toggle',
        defaultValue: true
      },
      {
        name: 'docker',
        label: 'Include Docker deployment?',
        type: 'toggle',
        defaultValue: true
      }
    ]
  }
];

const TOTAL_STEPS = steps.length;

module.exports = { steps, TOTAL_STEPS };
