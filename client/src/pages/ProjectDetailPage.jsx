import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Blocks, Code, Rocket, FileText, ArrowRight } from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

const statusSteps = [
  { key: 'designing', label: 'Design Modules', icon: Blocks, link: 'builder' },
  { key: 'generated', label: 'Generate Code', icon: Code, link: 'codegen' },
  { key: 'deployed', label: 'Deploy', icon: Rocket, link: 'deploy' }
];

const statusOrder = ['questionnaire', 'designing', 'generating', 'generated', 'deploying', 'deployed'];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject: project, loading, fetchProject } = useProjectStore();

  useEffect(() => {
    fetchProject(id);
  }, [id]);

  if (loading || !project) return <LoadingSpinner className="py-20" />;

  const currentIndex = statusOrder.indexOf(project.status);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500">{project.description || 'No description'}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${project.status === 'deployed' ? 'bg-emerald-100 text-emerald-700' :
              project.status === 'generated' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'}
          `}>
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Industry:</span>
            <span className="ml-2 font-medium capitalize">{project.industry?.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-500">Modules:</span>
            <span className="ml-2 font-medium">{project.modules?.length || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">Database:</span>
            <span className="ml-2 font-medium capitalize">{project.settings?.database || 'mongodb'}</span>
          </div>
        </div>
      </div>

      {/* Action Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusSteps.map((step, i) => {
          const StepIcon = step.icon;
          const isCompleted = currentIndex >= statusOrder.indexOf(step.key);
          const isCurrent = !isCompleted && currentIndex >= statusOrder.indexOf(step.key) - 1;

          return (
            <button
              key={step.key}
              onClick={() => navigate(`/projects/${id}/${step.link}`)}
              className={`card text-left hover:shadow-md transition-shadow ${
                isCurrent ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                isCompleted ? 'bg-green-100' : isCurrent ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                <StepIcon className={`w-6 h-6 ${
                  isCompleted ? 'text-green-600' : isCurrent ? 'text-primary-600' : 'text-gray-400'
                }`} />
              </div>
              <h3 className="font-semibold text-gray-900">{step.label}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {isCompleted ? 'Completed' : isCurrent ? 'Current step' : 'Upcoming'}
              </p>
              <div className="flex items-center gap-1 text-primary-600 text-sm font-medium mt-3">
                {isCompleted ? 'Review' : 'Go'} <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Modules Summary */}
      {project.modules?.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold mb-4">Modules ({project.modules.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {project.modules.map(mod => (
              <div key={mod.moduleId} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{mod.displayName || mod.name}</p>
                <p className="text-xs text-gray-500">{mod.entities?.length || 0} entities</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
