import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils';
import { ModalProps } from '@/types';
import { X } from 'lucide-react';

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto',
          'transform transition-all duration-300 scale-100 opacity-100',
          'animate-slide-up'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">
            {title}
          </h2>
          
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-secondary-500" />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
