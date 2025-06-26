import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  containerClassName?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface FileUploadProps {
  onChange: (file: File) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export interface ProgressBarProps {
  progress: number;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}