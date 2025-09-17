import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count?: number;
  showDot?: boolean;
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'danger' | 'warning' | 'success' | 'info';
  className?: string;
  maxCount?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  showDot = false,
  showPulse = false,
  size = 'sm',
  variant = 'danger',
  className,
  maxCount = 99,
}) => {
  // Don't show badge if no count and no dot indicator
  if (!showDot && (!count || count <= 0)) {
    return null;
  }

  // Size configurations
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs min-w-4',
    md: 'h-5 w-5 text-xs min-w-5',
    lg: 'h-6 w-6 text-sm min-w-6',
  };

  // Variant color configurations
  const variantClasses = {
    primary: 'bg-blue-500 text-white',
    danger: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    success: 'bg-green-500 text-white',
    info: 'bg-cyan-500 text-white',
  };

  // Format count display
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  // Dot only mode (no count)
  if (showDot && (!count || count <= 0)) {
    return (
      <div
        className={cn(
          'absolute -top-1 -right-1 rounded-full',
          sizeClasses.sm,
          variantClasses[variant],
          showPulse && 'animate-pulse',
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'absolute -top-1 -right-1 rounded-full flex items-center justify-center font-medium',
        'border-2 border-white shadow-sm',
        sizeClasses[size],
        variantClasses[variant],
        showPulse && 'animate-pulse',
        className
      )}
    >
      {displayCount}
    </div>
  );
};

export default NotificationBadge;