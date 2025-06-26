import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/utils';
import { Upload, File, X, Check } from 'lucide-react';
import Button from './Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string[];
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = ['image/jpeg', 'image/jpg', 'image/png'],
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className,
  label = 'Upload Image',
  description = 'Drag and drop your image here, or click to select',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
          setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
        } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
          setError('Please upload a JPEG or PNG image');
        } else {
          setError('Invalid file. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
    disabled,
  });

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-secondary-700 mb-2">
        {label}
      </label>

      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
            {
              'border-primary-400 bg-primary-50': isDragActive,
              'border-secondary-300 hover:border-primary-400 hover:bg-primary-50': !isDragActive && !disabled,
              'border-secondary-200 bg-secondary-50 cursor-not-allowed': disabled,
              'border-red-300 bg-red-50': error,
            }
          )}
        >
          <input {...getInputProps()} />
          
          <Upload className={cn(
            'mx-auto h-12 w-12 mb-4',
            {
              'text-primary-600': isDragActive,
              'text-secondary-400': !isDragActive && !error,
              'text-red-400': error,
            }
          )} />
          
          <p className={cn(
            'text-sm font-medium mb-2',
            {
              'text-primary-600': isDragActive,
              'text-secondary-700': !isDragActive && !error,
              'text-red-600': error,
            }
          )}>
            {isDragActive ? 'Drop the image here' : label}
          </p>
          
          <p className={cn(
            'text-xs',
            {
              'text-primary-500': isDragActive,
              'text-secondary-500': !isDragActive && !error,
              'text-red-500': error,
            }
          )}>
            {error || description}
          </p>
          
          <p className="text-xs text-secondary-400 mt-2">
            Supports: {accept.map(type => type.split('/')[1].toUpperCase()).join(', ')} • 
            Max size: {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      ) : (
        <div className="border border-secondary-300 rounded-lg overflow-hidden">
          {preview && (
            <div className="relative bg-secondary-50 flex items-center justify-center p-4">
              <img
                src={preview}
                alt="NIC Preview"
                className="max-w-full max-h-32 object-contain rounded border border-secondary-200 shadow-sm"
              />
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={removeFile}
                  className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <File className="w-8 h-8 text-primary-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-secondary-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <Check className="w-5 h-5 text-green-500" />
              </div>
            </div>
            
            <div className="mt-3 flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={removeFile}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Remove</span>
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                  setError(null);
                }}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Different</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
