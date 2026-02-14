import React from 'react';
import { Zap, Plus } from 'lucide-react';
import useQuestionnaireStore from '../../store/useQuestionnaireStore';

const defaultWorkflows = {
  inventory: [
    { name: 'Stock Reorder', description: 'Auto-create purchase orders when stock falls below reorder level' },
    { name: 'Stock Transfer', description: 'Transfer stock between warehouses with approval' }
  ],
  sales: [
    { name: 'Order to Invoice', description: 'Auto-generate invoice when order is confirmed' },
    { name: 'Payment Reminder', description: 'Send reminders for overdue invoices' }
  ],
  purchasing: [
    { name: 'Purchase Approval', description: 'Multi-level approval for purchase orders' },
    { name: 'Goods Receipt', description: 'Record goods received and update inventory' }
  ],
  hr: [
    { name: 'Leave Approval', description: 'Manager approval workflow for leave requests' },
    { name: 'Onboarding', description: 'New employee onboarding checklist' }
  ],
  shipping: [
    { name: 'Shipment Tracking', description: 'Auto status updates and notifications' },
    { name: 'Delivery Confirmation', description: 'Proof of delivery with signature' }
  ],
  fleet: [
    { name: 'Maintenance Schedule', description: 'Auto-schedule vehicle maintenance' }
  ],
  procurement: [
    { name: 'Requisition Approval', description: 'Multi-level requisition approval' }
  ],
  suppliers: [
    { name: 'Supplier Evaluation', description: 'Periodic supplier performance review' }
  ],
  demand: [
    { name: 'Forecast Alert', description: 'Alert when forecast deviates significantly' }
  ],
  warehouse: [
    { name: 'Pick Order Assignment', description: 'Auto-assign pick orders to workers' }
  ]
};

const automationLevels = [
  { id: 'manual', label: 'Manual', color: 'bg-gray-100 text-gray-700' },
  { id: 'semi-auto', label: 'Semi-Auto', color: 'bg-blue-100 text-blue-700' },
  { id: 'full-auto', label: 'Full Auto', color: 'bg-green-100 text-green-700' }
];

export default function StepWorkflows({ projectId }) {
  const { responses, updateResponse } = useQuestionnaireStore();
  const selectedModules = responses.modules.selected || [];
  const workflows = responses.workflows || [];

  const getWorkflowsForModule = (moduleId) => {
    return defaultWorkflows[moduleId] || [];
  };

  const isWorkflowEnabled = (moduleName, workflowName) => {
    return workflows.some(w => w.moduleName === moduleName && w.workflowName === workflowName);
  };

  const getWorkflowLevel = (moduleName, workflowName) => {
    const w = workflows.find(w => w.moduleName === moduleName && w.workflowName === workflowName);
    return w?.automationLevel || 'manual';
  };

  const toggleWorkflow = (moduleName, workflow) => {
    const exists = isWorkflowEnabled(moduleName, workflow.name);
    let updated;

    if (exists) {
      updated = workflows.filter(w => !(w.moduleName === moduleName && w.workflowName === workflow.name));
    } else {
      updated = [...workflows, {
        moduleName,
        workflowName: workflow.name,
        description: workflow.description,
        automationLevel: 'manual'
      }];
    }

    updateResponse('workflows', updated);
  };

  const setAutomationLevel = (moduleName, workflowName, level) => {
    const updated = workflows.map(w => {
      if (w.moduleName === moduleName && w.workflowName === workflowName) {
        return { ...w, automationLevel: level };
      }
      return w;
    });
    updateResponse('workflows', updated);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Workflows & Automation</h2>
      <p className="text-gray-500 text-sm mb-6">
        Enable business workflows and set automation levels. Enabled: {workflows.length}
      </p>

      <div className="space-y-4">
        {selectedModules.map(moduleId => {
          const moduleWorkflows = getWorkflowsForModule(moduleId);
          if (moduleWorkflows.length === 0) return null;

          return (
            <div key={moduleId}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 capitalize">
                {moduleId.replace('_', ' ')}
              </h3>
              <div className="space-y-2">
                {moduleWorkflows.map(workflow => {
                  const enabled = isWorkflowEnabled(moduleId, workflow.name);
                  const level = getWorkflowLevel(moduleId, workflow.name);

                  return (
                    <div
                      key={workflow.name}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        enabled ? 'border-primary-200 bg-primary-50/50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => toggleWorkflow(moduleId, workflow)}
                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              enabled ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                            }`}
                          >
                            {enabled && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium text-gray-900">{workflow.name}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{workflow.description}</p>
                          </div>
                        </div>

                        {enabled && (
                          <div className="flex gap-1 ml-4">
                            {automationLevels.map(lvl => (
                              <button
                                key={lvl.id}
                                onClick={() => setAutomationLevel(moduleId, workflow.name, lvl.id)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  level === lvl.id ? lvl.color : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                }`}
                              >
                                {lvl.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {selectedModules.length === 0 && (
          <p className="text-gray-400 text-center py-8">Select modules in the previous step to see available workflows.</p>
        )}
      </div>
    </div>
  );
}
