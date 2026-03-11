import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import useQuestionnaireStore from '../store/useQuestionnaireStore';
import QuestionnaireWizard from '../components/questionnaire/QuestionnaireWizard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingId = searchParams.get('id');
  const { createProject, fetchProject, error: projectError, clearError } = useProjectStore();
  const { loadQuestionnaire, reset } = useQuestionnaireStore();
  const [projectId, setProjectId] = useState(existingId);
  const [initializing, setInitializing] = useState(true);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    reset();
    clearError();
    setCreateError('');
    const init = async () => {
      if (existingId) {
        try {
          await fetchProject(existingId);
          await loadQuestionnaire(existingId);
          setProjectId(existingId);
        } catch {
          setProjectId(null);
        }
      }
      setInitializing(false);
    };
    init();
    return () => reset();
  }, [existingId]);

  const handleCreateProject = async (name, description, industry) => {
    setCreateError('');
    try {
      const project = await createProject({ name, description, industry });
      setProjectId(project._id);
      await loadQuestionnaire(project._id);
      return project;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create project';
      setCreateError(msg);
      throw err;
    }
  };

  const handleComplete = () => {
    navigate(`/projects/${projectId}/builder`);
  };

  if (initializing) return <LoadingSpinner className="py-20" />;

  const displayError = createError || projectError;

  return (
    <div className="max-w-4xl mx-auto">
      {displayError && (
        <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{displayError}</span>
            {displayError.toLowerCase().includes('plan limit') && (
              <span className="ml-1">
                <Link to="/dashboard" className="underline font-semibold">Go to dashboard</Link> to manage existing projects, or{' '}
                <Link to="/settings" className="underline font-semibold">upgrade your plan</Link>.
              </span>
            )}
          </div>
          <button onClick={() => { setCreateError(''); clearError(); }} className="font-bold text-red-400 hover:text-red-600">×</button>
        </div>
      )}
      <QuestionnaireWizard
        projectId={projectId}
        onCreateProject={handleCreateProject}
        onComplete={handleComplete}
      />
    </div>
  );
}
