import React from 'react';
import { cn } from '@/utils';
import { ProgressBarProps } from '@/types';
import { Check } from 'lucide-react';

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-secondary-200">
          <div
            className="h-full bg-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isPending = stepNumber > currentStep;

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 bg-white',
                    {
                      'border-primary-600 bg-primary-600 text-white': isCompleted,
                      'border-primary-600 bg-white text-primary-600 ring-4 ring-primary-100': isCurrent,
                      'border-secondary-300 text-secondary-400': isPending,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      {
                        'text-primary-600': isCompleted || isCurrent,
                        'text-secondary-500': isPending,
                      }
                    )}
                  >
                    {step}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Progress Text */}
      <div className="text-center">
        <p className="text-sm text-secondary-600">
          Step {currentStep} of {totalSteps}
        </p>
        <div className="mt-2 w-full bg-secondary-200 rounded-full h-1">
          <div
            className="bg-primary-600 h-1 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
