
import React from 'react';
import { ParentBlockData } from '@/pages/PublicationEditor';

interface UmoorBlockRendererProps {
  umoorBlock: ParentBlockData;
  mode?: 'preview' | 'export';
  showLogo?: boolean;
}

export const UmoorBlockRenderer: React.FC<UmoorBlockRendererProps> = ({ 
  umoorBlock, 
  mode = 'preview',
  showLogo = true
}) => {
  const logoSize = mode === 'export' ? 'w-[75px] h-auto' : 'w-[75px] h-auto';
  
  const renderUmoorLogo = () => {
    // Check if umoorLogo is a URL (starts with http/https or is a data URL)
    if (umoorBlock.umoorLogo && (umoorBlock.umoorLogo.startsWith('http') || umoorBlock.umoorLogo.startsWith('data:'))) {
      return (
        <img
          src={umoorBlock.umoorLogo}
          alt={umoorBlock.umoorName}
          className={`${logoSize} object-cover`}
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
    <div className={`flex ${showLogo ? 'justify-between' : 'justify-end'} items-start mb-6`}>
      {/* Logo positioned in top left - only show if showLogo is true */}
      {showLogo && (
        <div className="z-10 w-1/5">
          {renderUmoorLogo()}
        </div>
      )}
      
      {/* Title and content area with margin for logo and right alignment */}
      <div className="text-right">
        {/* Main Heading */}
        {umoorBlock.title && (
          <h2 className="!text-[40px] !text-[#286741] leading-tight mb-2 font-kanz">
            {umoorBlock.title}
          </h2>
        )}
        
        {/* Subheading */}
        {umoorBlock.subheading && (
          <h3 className="text-lg text-[#B3443E] leading-tight mb-3 font-kanz">
            {umoorBlock.subheading}
          </h3>
        )}
        
        {/* Fallback to umoor name if no title is set */}
        {!umoorBlock.title && !umoorBlock.subheading && (
          <h2 className="!text-[40px] font-bold text-[#286741] leading-tight mb-2 font-kanz">
            {umoorBlock.umoorName}
          </h2>
        )}
      </div>
    </div>
  );
};
