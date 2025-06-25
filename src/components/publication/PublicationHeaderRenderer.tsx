
import React from 'react';

interface PublicationHeaderRendererProps {
  title: string;
  breadcrumb: string;
  showDecorative?: boolean;
  locationLogo?: string;
  locationName?: string;
}

export const PublicationHeaderRenderer: React.FC<PublicationHeaderRendererProps> = ({
  title,
  breadcrumb,
  showDecorative = true,
  locationLogo,
  locationName
}) => {
  return (
    <>
      {/* Decorative Header Separator */}
      {showDecorative && (
        <div className="text-center mb-10">
          {/* Location Logo */}
          {locationLogo && (
            <div className="mb-6">
              <img
                src={locationLogo}
                alt={locationName || 'Location logo'}
                className="w-16 h-16 mx-auto object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                onError={(e) => {
                  // Hide image if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="text-2xl font-light text-gray-600 tracking-widest mb-8">
            * * *
          </div>
        </div>
      )}

      {/* Publication Title */}
      {title && (
        <div className="text-center mb-12 pb-8">
          <h1 className="!text-[120px] font-bold text-gray-900 mb-4 leading-tight font-kanz">
            تمارو دن
          </h1>
          <div className="text-lg text-gray-600 mb-2">
            Ashara Mubaraka 1447H
          </div>
          <div className="text-sm text-gray-500">
            {title} • {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      )}
    </>
  );
};
