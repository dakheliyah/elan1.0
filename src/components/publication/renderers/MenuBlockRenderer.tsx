import React from 'react';
import { MenuBlockData } from '../../../pages/PublicationEditor';

interface MenuBlockRendererProps {
  data: MenuBlockData;
  isPreview?: boolean;
}

const MenuBlockRenderer: React.FC<MenuBlockRendererProps> = ({ data, isPreview = false }) => {
  if (!data?.items || data.items.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center text-gray-500 italic">
          No menu items available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header Section */}
      {data.header && (
        <div className="bg-primary text-white text-center py-4 px-6 font-kanz">
          <h2 className="text-2xl font-semibold">{data.header}</h2>
        </div>
      )}

      <div className="">
        {data.items.map((item, index) => (
          <div key={index} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
            <div className="space-y-3">
              <div className="font-semibold text-lg text-gray-900">
                {item.name}
                <br />
                {item.calories && (
                  <span className="inline-flex items-center pb-0.5 rounded-full text-xs font-medium text-gray-900">
                    {item.calories}
                  </span>
                )}
              </div>

              {item.allergens && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Allergens:</span>
                  <span className="text-sm text-red-600 leading-relaxed">
                    {item.allergens}
                  </span>
                </div>
              )}
            </div>

            {index < data.items.length - 1 && (
              <div className="mt-5 border-b border-dotted border-gray-300"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBlockRenderer;