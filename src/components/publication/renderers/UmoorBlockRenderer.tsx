
import React from 'react';
import { ParentBlockData } from '@/pages/PublicationEditor';

interface UmoorBlockRendererProps {
  umoorBlock: ParentBlockData;
  mode?: 'preview' | 'export';
}

export const UmoorBlockRenderer: React.FC<UmoorBlockRendererProps> = ({ 
  umoorBlock, 
  mode = 'preview' 
}) => {
  const logoSize = mode === 'export' ? 'w-24 h-24' : 'w-20 h-20';
  
  const renderUmoorLogo = () => {
    // Check if umoorLogo is a URL (starts with http/https or is a data URL)
    if (umoorBlock.umoorLogo && (umoorBlock.umoorLogo.startsWith('http') || umoorBlock.umoorLogo.startsWith('data:'))) {
      return (
        <img
          src={umoorBlock.umoorLogo}
          alt={umoorBlock.umoorName}
          className={`${logoSize} object-cover rounded-xl border-2 border-gray-200 shadow-sm`}
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement!;
            parent.innerHTML = `<div class="text-5xl ${logoSize} flex items-center justify-center">📋</div>`;
          }}
        />
      );
    }
    
    return (
      <div className={`${logoSize} flex items-center justify-center text-5xl bg-gray-50 rounded-xl border-2 border-gray-200`}>
        {umoorBlock.umoorLogo || '📋'}
      </div>
    );
  };

  return (
    <div className="relative mb-6">
      {/* Logo positioned in top right */}
      <div className="absolute top-0 right-0 z-10">
        {renderUmoorLogo()}
      </div>
      
      {/* Title and content area with margin for logo */}
      <div className="pr-28">
        {/* Main Heading */}
        {umoorBlock.title && (
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
            {umoorBlock.title}
          </h2>
        )}
        
        {/* Subheading */}
        {umoorBlock.subheading && (
          <h3 className="text-lg font-semibold text-gray-700 leading-tight mb-3">
            {umoorBlock.subheading}
          </h3>
        )}
        
        {/* Description */}
        {umoorBlock.description && (
          <p className="text-base text-gray-600 leading-relaxed mb-4">
            {umoorBlock.description}
          </p>
        )}
        
        {/* Fallback to umoor name if no title is set */}
        {!umoorBlock.title && !umoorBlock.subheading && (
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
            {umoorBlock.umoorName}
          </h2>
        )}
      </div>
    </div>
  );
};
