import React from 'react';
import useQuestionnaireStore from '../../store/useQuestionnaireStore';
import StepIndicator from '../common/StepIndicator';
import StepIndustry from './StepIndustry';
import StepModules from './StepModules';
import StepEntities from './StepEntities';
import StepWorkflows from './StepWorkflows';
import StepReview from './StepReview';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const stepNames = ['Industry', 'Modules', 'Entities', 'Workflows', 'Review'];

export default function QuestionnaireWizard({ projectId, onCreateProject, onComplete }) {
  const { currentStep, goToStep, nextStep, prevStep, saveStep, loading } = useQuestionnaireStore();

  const handleNext = async () => {
    if (!projectId) return; // can't proceed without a created project
    await saveStep(projectId);
    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepIndustry projectId={projectId} onCreateProject={onCreateProject} />;
      case 1:
        return <StepModules projectId={projectId} />;
      case 2:
        return <StepEntities projectId={projectId} />;
      case 3:
        return <StepWorkflows projectId={projectId} />;
      case 4:
        return <StepReview projectId={projectId} onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <StepIndicator
        steps={stepNames}
        currentStep={currentStep}
        onStepClick={(step) => step <= currentStep && goToStep(step)}
      />

      <div className="card min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {currentStep < 4 && (
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleNext}
              disabled={loading || !projectId}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
            {currentStep === 0 && !projectId && (
              <p className="text-xs text-gray-400">Enter project name &amp; select an industry first</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
