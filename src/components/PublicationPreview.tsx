
import React, { useMemo, useRef } from 'react';
import { Publication } from '../pages/PublicationEditor';
import { PublicationHeaderRenderer } from './publication/PublicationHeaderRenderer';
import { PublicationFooterRenderer } from './publication/PublicationFooterRenderer';
import { PublicationSectionRenderer } from './publication/renderers/PublicationSectionRenderer';
import type { EventPublicationBranding } from '@/types/publicationBranding';
import { mergePublicationBranding } from '@/utils/mergePublicationBranding';
import { useCurrentProfile } from '../hooks/useProfiles';
import { useUmoors } from '../hooks/useUmoors';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { getPublicationRichTextExportStyles } from '@/utils/publicationRichTextExportStyles';
import { USE_UMOOR_ORDER_PREFERENCE } from '@/constants/publicationFeatures';
import { getCombinedParentBlocks } from '@/utils/combinePublicationBlocks';

interface PublicationPreviewProps {
  publication: Publication;
  mode?: 'preview' | 'export';
  locationLogo?: string;
  locationName?: string;
  hostPublication?: Publication | null;
  publicationBranding?: EventPublicationBranding;
}

const PublicationPreview: React.FC<PublicationPreviewProps> = ({
  publication,
  mode = 'preview',
  locationLogo,
  locationName,
  hostPublication,
  publicationBranding: publicationBrandingProp,
}) => {
  const branding = publicationBrandingProp ?? mergePublicationBranding(null);
  const { data: currentProfile } = useCurrentProfile();
  const { data: umoors = [] } = useUmoors();
  const previewContentRef = useRef<HTMLDivElement>(null);

  const combinedParentBlocks = useMemo(
    () => getCombinedParentBlocks(publication, hostPublication, umoors),
    [publication, hostPublication, umoors]
  );

  const exportAsHTML = () => {
    if (!previewContentRef.current) return;

    const previewContent = previewContentRef.current;
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${publication.title || 'Publication'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @font-face {
            font-family: 'Al-Kanz';
            src: url('https://font.itsmedan.net/Kanz-al-Marjaan.ttf') format('truetype');
        }
        .font-kanz {
            font-family: 'Al-Kanz', serif;
        }
        ${getPublicationRichTextExportStyles()}
    </style>
</head>
<body>
    ${previewContent.outerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${locationName ? `${locationName} - ` : ''}${publication.title || 'publication'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const PreviewContent = () => (
    <div ref={previewContentRef} className="max-w-4xl mx-auto px-8 py-8 relative bg-[#FAF5ED]">
      <PublicationHeaderRenderer
        title={publication.title}
        breadcrumb={publication.breadcrumb}
        showDecorative={true}
        locationLogo={locationLogo}
        locationName={locationName}
        headerLines={branding.header}
      />

      {/* Publication Content */}
      {combinedParentBlocks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-xl font-medium mb-3">Empty Publication</div>
          <p className="text-lg">Add Umoor blocks to see the preview</p>
        </div>
      ) : (
        <div className="space-y-8">
          {combinedParentBlocks.map((parentBlock, index) => {
            const shouldShowLogo = USE_UMOOR_ORDER_PREFERENCE
              ? combinedParentBlocks.findIndex((block) => block.umoorId === parentBlock.umoorId) === index
              : true;

            return (
              <PublicationSectionRenderer
                key={parentBlock.id}
                parentBlock={parentBlock}
                mode={mode}
                isLast={index === combinedParentBlocks.length - 1}
                showUmoorLogo={shouldShowLogo}
              />
            );
          })}
        </div>
      )}

      <PublicationFooterRenderer footer={branding.footer} />
    </div>
  );

  if (mode === 'export') {
    return <PreviewContent />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h3>
            <p className="text-sm text-gray-600">
              Your publication as it will appear to readers
            </p>
          </div>
          {currentProfile?.role === 'admin' && (
            <Button
              onClick={exportAsHTML}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export HTML
            </Button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <PreviewContent />
      </div>
    </div>
  );
};

export default PublicationPreview;
