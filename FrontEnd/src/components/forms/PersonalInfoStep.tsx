import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useRegistration, useFormValidation } from '@/hooks';
import { validators } from '@/utils';
import { UserRegistrationRequest, RegistrationStep } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const PersonalInfoStep: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser, loading, progress } = useRegistration();
  const [isNavigating, setIsNavigating] = useState(false);

  const initialValues: UserRegistrationRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    nicNumber: '',
  };

  const validationRules = {
    firstName: validators.required,
    lastName: validators.required,
    email: (value: string) => {
      const required = validators.required(value);
      if (required) return required;
      return validators.email(value);
    },
    password: (value: string) => {
      const required = validators.required(value);
      if (required) return required;
      return validators.password(value);
    },
    phoneNumber: (value: string) => {
      const required = validators.required(value);
      if (required) return required;
      return validators.phone(value);
    },
    address: validators.required,
    dateOfBirth: (value: string) => {
      const required = validators.required(value);
      if (required) return required;
      return validators.dateOfBirth(value);
    },
    nicNumber: (value: string) => {
      const required = validators.required(value);
      if (required) return required;
      return validators.nic(value);
    },
  };

  const {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
  } = useFormValidation(initialValues, validationRules);

  // Watch for progress changes after successful registration
  useEffect(() => {
    if (isNavigating && progress.personalInfoCompleted && progress.userId) {
      console.log('Progress updated successfully, navigating to face verification...');
      setTimeout(() => {
        navigate('/register/face-verification');
      }, 500);
    }
  }, [progress, isNavigating, navigate]);

  const handleInputChange = (field: keyof UserRegistrationRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue(field, e.target.value);
  };

  const handleInputBlur = (field: keyof UserRegistrationRequest) => () => {
    setTouched(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!');
    
    // Check validation
    const isValid = validate();
    console.log('Form validation result:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed');
      return;
    }

    console.log('Validation passed, calling registerUser API...');
    setIsNavigating(true);
    
    try {
      const userId = await registerUser(values);
      console.log('Registration API response:', userId);
      
      if (userId) {
        console.log('Registration successful, waiting for progress update...');
        // The navigation will be handled by the useEffect above
      } else {
        console.log('Registration failed - no userId returned');
        setIsNavigating(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setIsNavigating(false);
    }
  };

  return (
    <div className="h-full w-full p-6 flex flex-col">
      {/* Form Content - Full Size */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        {/* Form Fields - Expanded Layout */}
        <div className="flex-1 grid grid-cols-2 gap-6 content-start">
          {/* First Column */}
          <div className="space-y-4">
            <Input
              label="First Name"
              name="firstName"
              value={values.firstName}
              onChange={handleInputChange('firstName')}
              onBlur={handleInputBlur('firstName')}
              error={touched.firstName ? errors.firstName : undefined}
              required
              placeholder="Enter your first name"
            />
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={values.email}
              onChange={handleInputChange('email')}
              onBlur={handleInputBlur('email')}
              error={touched.email ? errors.email : undefined}
              required
              placeholder="Enter your email address"
            />

            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={values.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              onBlur={handleInputBlur('phoneNumber')}
              error={touched.phoneNumber ? errors.phoneNumber : undefined}
              required
              placeholder="+94701234567"
            />

            <Input
              label="Address"
              name="address"
              value={values.address}
              onChange={handleInputChange('address')}
              onBlur={handleInputBlur('address')}
              error={touched.address ? errors.address : undefined}
              required
              placeholder="Enter your full address"
            />
          </div>

          {/* Second Column */}
          <div className="space-y-4">
            <Input
              label="Last Name"
              name="lastName"
              value={values.lastName}
              onChange={handleInputChange('lastName')}
              onBlur={handleInputBlur('lastName')}
              error={touched.lastName ? errors.lastName : undefined}
              required
              placeholder="Enter your last name"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleInputChange('password')}
              onBlur={handleInputBlur('password')}
              error={touched.password ? errors.password : undefined}
              required
              placeholder="Create a strong password"
            />

            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={values.dateOfBirth}
              onChange={handleInputChange('dateOfBirth')}
              onBlur={handleInputBlur('dateOfBirth')}
              error={touched.dateOfBirth ? errors.dateOfBirth : undefined}
              required
            />

            <Input
              label="NIC Number"
              name="nicNumber"
              value={values.nicNumber}
              onChange={handleInputChange('nicNumber')}
              onBlur={handleInputBlur('nicNumber')}
              error={touched.nicNumber ? errors.nicNumber : undefined}
              required
              placeholder="123456789V or 123456789123"
            />
          </div>
        </div>

        {/* Terms and Conditions - Full Width */}
        <div className="mt-4 mb-4">
          <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4 max-w-6xl">
            <p className="text-sm text-secondary-600 leading-relaxed">
              By proceeding, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 underline font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 underline font-medium">
                Privacy Policy
              </a>
              . Your personal information will be used solely for identity verification purposes.
            </p>
          </div>
        </div>

        {/* Navigation Buttons - Full Width Layout */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-secondary-100">
          <Link to="/login">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Login</span>
            </Button>
          </Link>

          <Button
            type="submit"
            size="md"
            disabled={loading || isNavigating}
            loading={loading || isNavigating}
            className="flex items-center space-x-2 px-8"
          >
            <span>
              {isNavigating ? 'Processing...' : 'Continue to Face Verification'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoStep;
