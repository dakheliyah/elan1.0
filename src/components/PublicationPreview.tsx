
import React, { useMemo, useRef } from 'react';
import { Publication, ParentBlockData } from '../pages/PublicationEditor';
import { PublicationHeaderRenderer } from './publication/PublicationHeaderRenderer';
import { PublicationSectionRenderer } from './publication/renderers/PublicationSectionRenderer';
import { useCurrentProfile } from '../hooks/useProfiles';
import { useUmoors } from '../hooks/useUmoors';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface PublicationPreviewProps {
  publication: Publication;
  mode?: 'preview' | 'export';
  locationLogo?: string;
  locationName?: string;
  hostPublication?: Publication | null;
}

const PublicationPreview: React.FC<PublicationPreviewProps> = ({
  publication,
  mode = 'preview',
  locationLogo,
  locationName,
  hostPublication
}) => {
  const { data: currentProfile } = useCurrentProfile();
  const { data: umoors = [] } = useUmoors();
  const previewContentRef = useRef<HTMLDivElement>(null);

  const combinedParentBlocks = useMemo(() => {
    const allBlocks = hostPublication && hostPublication.parentBlocks
      ? [...hostPublication.parentBlocks.filter(block => block.isGlobal), ...publication.parentBlocks]
      : publication.parentBlocks;

    // Group blocks by umoorId while maintaining order
    const groupedBlocks: { umoorId: string; blocks: any[]; isGlobal: boolean; orderPreference: number }[] = [];
    const umoorMap = new Map<string, { blocks: any[]; isGlobal: boolean; orderPreference: number }>();

    allBlocks.forEach(block => {
      if (!umoorMap.has(block.umoorId)) {
        // Find the umoor data to get order_preference
        const umoorData = umoors.find(u => u.id === block.umoorId);
        const orderPreference = umoorData?.order_preference || 0;
        
        const groupData = { 
          blocks: [], 
          isGlobal: block.isGlobal || false,
          orderPreference
        };
        umoorMap.set(block.umoorId, groupData);
        groupedBlocks.push({ umoorId: block.umoorId, ...groupData });
      }
      umoorMap.get(block.umoorId)!.blocks.push(block);
    });

    // Sort groups by order preference: 1,2,3... first (ascending), then 0s
    // Also maintain global umoors first within each preference group
    groupedBlocks.sort((a, b) => {
      // First, sort by order preference priority
      if (a.orderPreference > 0 && b.orderPreference === 0) return -1;
      if (a.orderPreference === 0 && b.orderPreference > 0) return 1;
      
      // If both have order_preference > 0, sort by order_preference ascending
      if (a.orderPreference > 0 && b.orderPreference > 0) {
        if (a.orderPreference !== b.orderPreference) {
          return a.orderPreference - b.orderPreference;
        }
      }
      
      // Within same preference level, global umoors first
      if (a.isGlobal && !b.isGlobal) return -1;
      if (!a.isGlobal && b.isGlobal) return 1;
      
      return 0;
    });

    return groupedBlocks;
  }, [publication, hostPublication, umoors]);

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
      />

      {/* Publication Content */}
      {combinedParentBlocks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-xl font-medium mb-3">Empty Publication</div>
          <p className="text-lg">Add Umoor blocks to see the preview</p>
        </div>
      ) : (
        <div className="space-y-8">
          {combinedParentBlocks.map((umoorGroup, groupIndex) => (
            <div key={umoorGroup.umoorId}>
              {/* Render all blocks in this umoor group */}
              <div className="space-y-8">
                {umoorGroup.blocks.map((parentBlock, blockIndex) => {
                  // Show logo only for the first block in each umoor group
                  const shouldShowLogo = blockIndex === 0;

                  return (
                    <PublicationSectionRenderer
                      key={parentBlock.id}
                      parentBlock={parentBlock}
                      mode={mode}
                      isLast={groupIndex === combinedParentBlocks.length - 1 && blockIndex === umoorGroup.blocks.length - 1}
                      showUmoorLogo={shouldShowLogo}
                    />
                  );
                })}
              </div>

              {/* Add dotted line separator between umoor groups (except after the last group) */}
              {/* {groupIndex < combinedParentBlocks.length - 1 && (
                 <div className="my-8 border-t border-dotted border-gray-300"></div>
               )} */}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-[#DFCCAE] rounded-lg p-6 md:text-center text-left">
          <div className="text-gray-800 text-sm leading-relaxed">
            <p className="mb-2 font-semibold">
              Ashara Mubaraka 1447H - ITS Helpline
            </p>
            <p className="mb-2">
              Helpline ne aa number par contact Kari sakaai che{' '}
              <a href='https://chat.itshelpline.com' target='_blank' className="text-[#286741] underline font-medium">WhatsApp</a>{' '}
              <br />
               ane Telephone helpline:{' '}
              <a href='tel:918065915253' className="text-[#286741] underline font-medium">+918065915253</a>{' '}
              from 3PM - 6PM (IST)
            </p>
            <p className="mb-2 italic">
              Note: General suwalo na jawabo Whatsapp Menu ma AI Assistant si haasil kari sakaai che
            </p>
          </div>
        </div>
      </div>
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
