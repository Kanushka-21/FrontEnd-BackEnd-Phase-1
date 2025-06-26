import React from 'react';
import { cn } from '@/utils';
import { InputProps } from '@/types';

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-secondary-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3 rounded-lg border transition-all duration-200 bg-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-base',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
          disabled && 'bg-secondary-50 cursor-not-allowed',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg
            className="w-4 h-4 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default Input;
