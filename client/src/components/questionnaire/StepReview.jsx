import React, { useState } from 'react';
import { Check, Database, Shield, Monitor, Container, Rocket } from 'lucide-react';
import useQuestionnaireStore from '../../store/useQuestionnaireStore';

const dbOptions = [
  { id: 'mongodb', name: 'MongoDB', desc: 'Flexible document database' },
  { id: 'postgresql', name: 'PostgreSQL', desc: 'Relational database' },
  { id: 'both', name: 'Both', desc: 'MongoDB + PostgreSQL' }
];

export default function StepReview({ projectId, onComplete }) {
  const { responses, updateResponse, completeQuestionnaire, loading } = useQuestionnaireStore();
  const settings = responses.settings || {};
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeQuestionnaire(projectId);
      onComplete();
    } catch {
      setCompleting(false);
    }
  };

  const updateSetting = (key, value) => {
    updateResponse('settings', { [key]: value });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Review & Configure</h2>
      <p className="text-gray-500 text-sm mb-6">Review your selections and configure deployment settings.</p>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Industry</p>
          <p className="text-lg font-bold text-blue-900 capitalize">{responses.industry.selected?.replace('_', ' ') || 'Not set'}</p>
          {responses.industry.subCategory && <p className="text-sm text-blue-600">{responses.industry.subCategory}</p>}
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Selected Modules</p>
          <p className="text-lg font-bold text-green-900">{responses.modules.selected?.length || 0}</p>
          <p className="text-sm text-green-600">{responses.modules.selected?.join(', ')}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Workflows</p>
          <p className="text-lg font-bold text-purple-900">{responses.workflows?.length || 0} enabled</p>
        </div>
      </div>

      {/* Technical Configuration */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Configuration</h3>

      {/* Database */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Database className="w-4 h-4 inline mr-1" /> Database
        </label>
        <div className="grid grid-cols-3 gap-3">
          {dbOptions.map(db => (
            <button
              key={db.id}
              onClick={() => updateSetting('database', db.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                settings.database === db.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-sm">{db.name}</p>
              <p className="text-xs text-gray-500">{db.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4 mb-8">
        {[
          { key: 'authentication', icon: Shield, label: 'Include Authentication', desc: 'JWT-based user authentication' },
          { key: 'frontend', icon: Monitor, label: 'Generate React Frontend', desc: 'Modern React + TailwindCSS interface' },
          { key: 'docker', icon: Container, label: 'Docker Deployment', desc: 'Containerized deployment with Docker' }
        ].map(({ key, icon: Icon, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting(key, !settings[key])}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings[key] !== false ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                settings[key] !== false ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleComplete}
        disabled={completing || loading || !responses.modules.selected?.length}
        className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2"
      >
        <Rocket className="w-5 h-5" />
        {completing ? 'Setting up...' : 'Complete & Start Building'}
      </button>
    </div>
  );
}
