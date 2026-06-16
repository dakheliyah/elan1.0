import React from 'react';
import { MenuBlockData } from '../../../pages/PublicationEditor';

const ARABIC_SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
const containsArabic = (text?: string) => Boolean(text && ARABIC_SCRIPT_RE.test(text));

const LUD_FONT_STACK =
  '"Al-Kanz", "Noto Sans Arabic", "Amiri", "Traditional Arabic", Arial, sans-serif';
const LUD_FONT_SIZE_SCALE = 1.3;

interface MenuFieldProps {
  text?: string;
  className?: string;
  as?: 'div' | 'span' | 'h2';
  baseFontSize?: number;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

/** Renders a single text field with per-content direction and LUD font when Arabic. */
const MenuField: React.FC<MenuFieldProps> = ({
  text,
  className = '',
  as: Tag = 'div',
  baseFontSize,
  align = 'right',
  children,
}) => {
  const isArabic = containsArabic(text);
  const alignClass =
    align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : 'text-right';

  return (
    <Tag
      className={`${className} ${alignClass}`}
      dir={isArabic ? 'rtl' : 'ltr'}
      style={
        isArabic
          ? {
              fontFamily: LUD_FONT_STACK,
              lineHeight: 1.8,
              unicodeBidi: 'plaintext',
              ...(baseFontSize
                ? { fontSize: `${baseFontSize * LUD_FONT_SIZE_SCALE}px` }
                : {}),
            }
          : undefined
      }
    >
      {children}
    </Tag>
  );
};

interface MenuBlockRendererProps {
  data: MenuBlockData;
  language?: 'eng' | 'lud';
  isPreview?: boolean;
}

const MenuBlockRenderer: React.FC<MenuBlockRendererProps> = ({ data }) => {
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
      {data.header && (
        <div className="bg-[#286741] text-white text-center py-4 px-6">
          <MenuField
            text={data.header}
            as="h2"
            align="center"
            baseFontSize={24}
            className="text-2xl font-semibold"
          >
            {data.header}
          </MenuField>
        </div>
      )}

      <div>
        {data.items.map((item, index) => (
          <div key={index}>
            <div className="px-4 py-6 hover:bg-gray-50 transition-colors duration-150 text-right">
              <MenuField
                text={item.name}
                baseFontSize={20}
                className="font-semibold text-[20px] text-[#286741]"
              >
                {item.name}
              </MenuField>

              {item.calories && (
                <div className="mt-2">
                  <MenuField
                    text={item.calories}
                    as="span"
                    baseFontSize={14}
                    className="inline-flex items-center pb-0.5 rounded-full text-[14px] font-medium text-[#656565]"
                  >
                    {item.calories}
                  </MenuField>
                </div>
              )}

              {item.allergens && (
                <div className="flex items-center justify-end gap-2 mt-4" dir="ltr">
                  <span className="text-sm font-semibold text-gray-600 shrink-0">
                    Allergens:
                  </span>
                  <MenuField
                    text={item.allergens}
                    as="span"
                    baseFontSize={16}
                    className="text-[16px] text-[#535353] leading-relaxed"
                  >
                    {item.allergens}
                  </MenuField>
                </div>
              )}
            </div>
            {index < data.items.length - 1 && (
              <div className="border-b border-dotted border-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBlockRenderer;
