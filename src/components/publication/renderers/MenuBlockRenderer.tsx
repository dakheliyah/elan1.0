import React from 'react';
import { MenuBlockData } from '../../../pages/PublicationEditor';

interface MenuBlockRendererProps {
  data: MenuBlockData;
  isPreview?: boolean;
}

const MenuBlockRenderer: React.FC<MenuBlockRendererProps> = ({ data, isPreview = false }) => {
  console.log("Menu Render - Full data object:", data);
  console.log("Menu Render - Header value:", data?.header);
  console.log("Menu Render - Header type:", typeof data?.header);

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
        <div className="bg-[#286741] text-white text-center py-4 px-6 font-kanz">
          <h2 className="text-2xl font-semibold">{data.header}</h2>
        </div>
      )}

      <div className="">
        {data.items.map((item, index) => (
          <div key={index}>
            <div className="px-4 py-6 hover:bg-gray-50 transition-colors duration-150">
              <div className="font-semibold text-[20px] text-[#286741]">
                {item.name}
              </div>
              
              {item.calories && (
                <div className="mt-2">
                  <span className="inline-flex items-center pb-0.5 rounded-full text-[14px] font-medium text-[#656565]">
                    {item.calories}
                  </span>
                </div>
              )}

              {item.allergens && (
                <div className="flex items-center space-x-2 mt-4">
                  <span className="text-sm font-semibold text-gray-600">Allergens:</span>
                  <span className="text-[16px] text-[#535353] leading-relaxed">
                    {item.allergens}
                  </span>
                </div>
              )}
            </div>
            {index < data.items.length - 1 && (
              <div className="border-b border-dotted border-gray-300"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBlockRenderer;