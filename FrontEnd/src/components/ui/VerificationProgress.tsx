import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle, User, FileText, Eye, Shield, Trophy } from 'lucide-react';

export interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

interface VerificationProgressProps {
  currentStep: string;
  progress: number;
  steps: VerificationStep[];
  errorMessage?: string;
  suggestions?: string[];
}

const VerificationProgress: React.FC<VerificationProgressProps> = ({
  currentStep,
  progress,
  steps,
  errorMessage,
  suggestions
}) => {
  const getStepIcon = (step: VerificationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepBorderColor = (step: VerificationStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in-progress':
        return 'border-blue-200 bg-blue-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Verification Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-start space-x-4 p-4 rounded-lg border ${getStepBorderColor(step)}`}
          >
            {/* Step Icon */}
            <div className="flex-shrink-0 mt-1">
              {getStepIcon(step)}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {step.description}
              </p>

              {/* Progress indicator for current step */}
              {step.status === 'in-progress' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2 text-xs text-blue-600"
                >
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Processing...</span>
                </motion.div>
              )}

              {/* Success indicator */}
              {step.status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs text-green-600 font-medium"
                >
                  ✓ Completed successfully
                </motion.div>
              )}

              {/* Error indicator */}
              {step.status === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs text-red-600 font-medium"
                >
                  ✗ Failed to complete
                </motion.div>
              )}
            </div>

            {/* Step Number */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step.status === 'completed' ? 'bg-green-100 text-green-800' :
              step.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              step.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-500'
            }`}>
              {index + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 mb-2">
                Verification Failed
              </h4>
              <p className="text-sm text-red-700 mb-3">
                {errorMessage}
              </p>
              
              {suggestions && suggestions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-red-800 mb-2">
                    Suggestions to fix this:
                  </h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-500 flex-shrink-0">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Default step configurations for NIC verification
export const createNICVerificationSteps = (currentStep: string): VerificationStep[] => {
  const stepConfigs = [
    {
      id: 'VALIDATING_USER',
      title: 'Validating User',
      description: 'Checking your account information...',
      icon: <User className="w-6 h-6" />
    },
    {
      id: 'VALIDATING_IMAGE',
      title: 'Checking Image Quality',
      description: 'Analyzing image clarity and readability...',
      icon: <Eye className="w-6 h-6" />
    },
    {
      id: 'STORING_IMAGE',
      title: 'Securing Your Data',
      description: 'Safely storing your NIC image...',
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'EXTRACTING_NIC_NUMBER',
      title: 'Reading NIC Number',
      description: 'Extracting text from your document...',
      icon: <FileText className="w-6 h-6" />
    },
    {
      id: 'EXTRACTING_PHOTO',
      title: 'Extracting Photo',
      description: 'Identifying and extracting your photo from the NIC...',
      icon: <User className="w-6 h-6" />
    },
    {
      id: 'VERIFYING_NIC_NUMBER',
      title: 'Verifying Details',
      description: 'Matching NIC number with registration info...',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      id: 'COMPARING_FACES',
      title: 'Face Verification',
      description: 'Comparing your face with NIC photo...',
      icon: <Eye className="w-6 h-6" />
    },
    {
      id: 'COMPLETING_VERIFICATION',
      title: 'Completing Verification',
      description: 'Finalizing your identity verification...',
      icon: <Trophy className="w-6 h-6" />
    }
  ];

  return stepConfigs.map(config => {
    let status: 'pending' | 'in-progress' | 'completed' | 'failed' = 'pending';
    
    const stepIndex = stepConfigs.findIndex(s => s.id === config.id);
    const currentStepIndex = stepConfigs.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentStepIndex) {
      status = 'completed';
    } else if (stepIndex === currentStepIndex) {
      status = 'in-progress';
    }

    return {
      ...config,
      status
    };
  });
};

export default VerificationProgress;
