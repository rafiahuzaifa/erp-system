import React from 'react';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <button
            onClick={() => onStepClick?.(index)}
            disabled={index > currentStep + 1}
            className="flex flex-col items-center group"
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
              transition-colors border-2
              ${index < currentStep
                ? 'bg-primary-600 border-primary-600 text-white'
                : index === currentStep
                  ? 'bg-white border-primary-600 text-primary-600'
                  : 'bg-white border-gray-300 text-gray-400'
              }
              ${index <= currentStep + 1 ? 'cursor-pointer' : 'cursor-not-allowed'}
            `}>
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`mt-2 text-xs font-medium max-w-[80px] text-center
              ${index <= currentStep ? 'text-primary-600' : 'text-gray-400'}
            `}>
              {step}
            </span>
          </button>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 mt-[-20px] ${
              index < currentStep ? 'bg-primary-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
