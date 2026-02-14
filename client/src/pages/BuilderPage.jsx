import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Code, ArrowRight } from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import useBuilderStore from '../store/useBuilderStore';
import ModuleBuilder from '../components/builder/ModuleBuilder';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function BuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProject } = useProjectStore();
  const { loadProjectModules, loadCatalog, saveModules, dirty, loading } = useBuilderStore();

  useEffect(() => {
    fetchProject(id);
    loadCatalog();
    loadProjectModules(id);
  }, [id]);

  const handleSave = async () => {
    await saveModules(id);
  };

  const handleGenerate = async () => {
    if (dirty) await saveModules(id);
    navigate(`/projects/${id}/codegen`);
  };

  if (!currentProject) return <LoadingSpinner className="py-20" />;

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-900">{currentProject.name}</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Module Builder
          </span>
          {dirty && (
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!dirty || loading}
            className="btn-secondary flex items-center gap-1 text-sm"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleGenerate}
            className="btn-primary flex items-center gap-1 text-sm"
          >
            <Code className="w-4 h-4" />
            Generate Code
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Builder Canvas */}
      <div className="flex-1 overflow-hidden">
        <ModuleBuilder projectId={id} />
      </div>
    </div>
  );
}
