
import React from 'react';

interface PublicationHeaderRendererProps {
  title: string;
  breadcrumb: string;
  showDecorative?: boolean;
}

export const PublicationHeaderRenderer: React.FC<PublicationHeaderRendererProps> = ({
  title,
  breadcrumb,
  showDecorative = true
}) => {
  return (
    <>
      {/* Decorative Header Separator */}
      {showDecorative && (
        <div className="text-center mb-10">
          <div className="text-2xl font-light text-gray-600 tracking-widest mb-8">
            * * *
          </div>
        </div>
      )}

      {/* Publication Title */}
      {title && (
        <div className="text-center mb-12 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {title}
          </h1>
          <div className="text-lg text-gray-600 mb-2">
            {breadcrumb}
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
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
