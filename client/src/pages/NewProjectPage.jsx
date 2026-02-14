import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useProjectStore from '../store/useProjectStore';
import useQuestionnaireStore from '../store/useQuestionnaireStore';
import QuestionnaireWizard from '../components/questionnaire/QuestionnaireWizard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingId = searchParams.get('id');
  const { createProject, fetchProject, currentProject } = useProjectStore();
  const { loadQuestionnaire, reset } = useQuestionnaireStore();
  const [projectId, setProjectId] = useState(existingId);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
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
    const project = await createProject({ name, description, industry });
    setProjectId(project._id);
    await loadQuestionnaire(project._id);
    return project;
  };

  const handleComplete = () => {
    navigate(`/projects/${projectId}/builder`);
  };

  if (initializing) return <LoadingSpinner className="py-20" />;

  return (
    <div className="max-w-4xl mx-auto">
      <QuestionnaireWizard
        projectId={projectId}
        onCreateProject={handleCreateProject}
        onComplete={handleComplete}
      />
    </div>
  );
}
