import React, { useState } from 'react';
import { Gem } from 'lucide-react';

interface AdminLogoProps {
  logoSrc: string;
  className?: string;
}

const AdminLogo: React.FC<AdminLogoProps> = ({ logoSrc, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (imageError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Gem className="w-12 h-12 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">GemNet</div>
          <div className="text-sm text-slate-600">Admin Portal</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
        </div>
      )}
      <img
        src={logoSrc}
        alt="GemNet Logo"
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default AdminLogo;