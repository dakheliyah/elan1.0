
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
    <div className='bg-[url(/ydt_pattern.png)] h-12 bg-repeat-x w-full absolute top-0 left-0'></div>
      {/* Decorative Header Separator */}
      {showDecorative && (
        <div className="text-center mb-10 pt-9">
          {/* Location Logo */}
          {locationLogo && (
            <div className="mb-6">
              <img
                src={locationLogo}
                alt={locationName || 'Location logo'}
                className="w-24 h-auto mx-auto object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                onError={(e) => {
                  // Hide image if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="text-xl font-light text-[#859069] tracking-widest mb-8">
            Ashara Mubaraka 1447h <br />
            Chennai (Madras)
          </div>
        </div>
      )}

      {/* Publication Title */}
      {title && (
        <div className="text-center mb-12 pb-8 flex flex-col items-center">
          <h1 className="!text-[120px] text-[#859069] leading-tight font-kanz flex items-center gap-12">
            <span><img src="/deco.png" alt="" /></span>
            تمارو دن
            <span><img src="/deco.png" alt="" /></span>
          </h1>
          <div className="text-xl text-[#859069]">
            {title}
          </div>
        </div>
      )}
    </>
  );
};
