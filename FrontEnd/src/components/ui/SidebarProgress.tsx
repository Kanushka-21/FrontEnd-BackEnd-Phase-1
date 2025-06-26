import React from 'react';
import { cn } from '@/utils';
import { ProgressBarProps } from '@/types';
import { Check, Home, Camera, FileText, CheckCircle, X } from 'lucide-react';
import logoImage from '@/logo-new.gif';

interface SidebarProgressProps extends ProgressBarProps {
  onCancel?: () => void;
}

const SidebarProgress: React.FC<SidebarProgressProps> = ({
  currentStep,
  totalSteps,
  steps,
  onCancel
}) => {
  const progress = (currentStep / totalSteps) * 100;

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0: return Home;
      case 1: return Camera;
      case 2: return FileText;
      case 3: return CheckCircle;
      default: return Home;
    }
  };

  return (    <div className="h-full bg-white p-4 flex flex-col">
      {/* Header with Logo - Compact */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          {/* GemNet Logo */}          <div className="rounded-lg overflow-hidden w-28 h-28">
            <img src={logoImage} alt="GemNet Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              GemNet
            </h1>
            <p className="text-sm text-gray-600 font-medium">Registration</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">Complete your account setup</p>
        
        {/* Progress indicator - Compact */}
        <div className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-bold text-primary-600">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>      {/* Setup Process - Compact */}
      <div className="flex-1 min-h-0">
        <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide border-b border-gray-200 pb-2">
          SETUP PROCESS
        </h2>
        
        <div className="space-y-1">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isPending = stepNumber > currentStep;
            const StepIcon = getStepIcon(index);

            return (
              <div key={index} className="relative">                  {/* Connection line - Properly Aligned */}
                {index < steps.length - 1 && (
                  <div className="absolute left-5 top-12 w-0.5 h-6 bg-gray-300" />
                )}
                  <div
                  className={cn(
                    'flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 border relative',
                    {
                      'bg-primary-50 border-primary-200 shadow-sm': isCurrent,
                      'bg-green-50 border-green-200': isCompleted,
                      'hover:bg-gray-50 border-transparent': isPending,
                    }
                  )}
                >
                  {/* Step Icon - Smaller */}                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 shadow-sm z-10',
                      {
                        'bg-primary-600 text-white ring-2 ring-primary-200': isCurrent,
                        'bg-green-500 text-white': isCompleted,
                        'bg-gray-200 text-gray-500': isPending,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Step Content - Compact */}
                  <div className="flex-1 min-w-0">                    <h3
                      className={cn(
                        'font-semibold text-base transition-colors duration-300',
                        {
                          'text-primary-700': isCurrent,
                          'text-green-600': isCompleted,
                          'text-gray-500': isPending,
                        }
                      )}
                    >
                      {step}
                      {isCurrent && (
                        <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                          Current
                        </span>
                      )}
                    </h3>
                    <p
                      className={cn(
                        'text-xs mt-0.5 transition-colors duration-300',
                        {
                          'text-primary-700': isCurrent,
                          'text-green-700': isCompleted,
                          'text-secondary-500': isPending,
                        }
                      )}
                    >
                      {getStepDescription(index)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Section - Compact */}
      <div className="mt-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 shadow-sm border border-blue-200">
        <div className="flex items-start space-x-2">
          <div className="bg-blue-200 rounded-full p-1.5">
            <CheckCircle className="w-3 h-3 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-blue-900 mb-1">Need Help?</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              You can complete the registration later or contact support for assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Button - Compact */}      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-3 w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm text-sm font-medium"
        >
          <X className="w-4 h-4" />
          <span>Cancel Registration</span>
        </button>
      )}
    </div>
  );
};

const getStepDescription = (index: number): string => {
  switch (index) {
    case 0: return 'Basic information about your identity';
    case 1: return 'Capture your face for verification';
    case 2: return 'Upload and verify your NIC document';
    case 3: return 'Registration process completed';
    default: return '';
  }
};

export default SidebarProgress;
