import React, { useState } from 'react';
import { Building2, Truck, Link, Settings } from 'lucide-react';
import useQuestionnaireStore from '../../store/useQuestionnaireStore';

const industries = [
  { id: 'erp', name: 'Enterprise Resource Planning', icon: Building2, description: 'Inventory, sales, HR, accounting, and more', color: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
  { id: 'logistics', name: 'Logistics & Distribution', icon: Truck, description: 'Shipping, fleet, routing, and delivery', color: 'bg-orange-50 border-orange-200 hover:border-orange-400' },
  { id: 'supply_chain', name: 'Supply Chain Management', icon: Link, description: 'Procurement, suppliers, demand planning', color: 'bg-green-50 border-green-200 hover:border-green-400' },
  { id: 'custom', name: 'Custom Application', icon: Settings, description: 'Build from scratch with any modules', color: 'bg-purple-50 border-purple-200 hover:border-purple-400' }
];

const companySizes = [
  { id: 'startup', name: 'Startup', range: '1-10 employees' },
  { id: 'small', name: 'Small Business', range: '11-50 employees' },
  { id: 'medium', name: 'Medium Enterprise', range: '51-500 employees' },
  { id: 'enterprise', name: 'Large Enterprise', range: '500+ employees' }
];

const subCategories = {
  erp: ['Manufacturing', 'Retail', 'Services', 'Healthcare', 'Education'],
  logistics: ['Last-mile Delivery', 'Freight', '3PL', 'Courier', 'Cold Chain'],
  supply_chain: ['Manufacturing SCM', 'Retail SCM', 'Food & Beverage', 'Pharmaceutical', 'Automotive']
};

export default function StepIndustry({ projectId, onCreateProject }) {
  const { responses, updateResponse } = useQuestionnaireStore();
  const industry = responses.industry;
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  const handleIndustrySelect = async (id) => {
    updateResponse('industry', { selected: id });
    if (!projectId && projectName) {
      await onCreateProject(projectName, projectDesc, id);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Industry & Company Profile</h2>
      <p className="text-gray-500 text-sm mb-6">Tell us about your business to recommend the right modules.</p>

      {/* Project Name (only for new projects) */}
      {!projectId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="My ERP System"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={projectDesc}
              onChange={e => setProjectDesc(e.target.value)}
              placeholder="Custom ERP for my business"
              className="input"
            />
          </div>
        </div>
      )}

      {/* Industry Selection */}
      <label className="block text-sm font-medium text-gray-700 mb-3">What type of system are you building?</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {industries.map(ind => {
          const Icon = ind.icon;
          const isSelected = industry.selected === ind.id;
          return (
            <button
              key={ind.id}
              onClick={() => handleIndustrySelect(ind.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                  : `${ind.color} border`
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-gray-600'}`} />
                <span className="font-semibold text-gray-900">{ind.name}</span>
              </div>
              <p className="text-sm text-gray-500">{ind.description}</p>
            </button>
          );
        })}
      </div>

      {/* Sub-category */}
      {industry.selected && subCategories[industry.selected] && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Focus Area</label>
          <div className="flex flex-wrap gap-2">
            {subCategories[industry.selected].map(sub => (
              <button
                key={sub}
                onClick={() => updateResponse('industry', { subCategory: sub })}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  industry.subCategory === sub
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Company Size */}
      <label className="block text-sm font-medium text-gray-700 mb-3">Company Size</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {companySizes.map(size => (
          <button
            key={size.id}
            onClick={() => updateResponse('industry', { companySize: size.id })}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              industry.companySize === size.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="font-medium text-sm">{size.name}</p>
            <p className="text-xs text-gray-500">{size.range}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
