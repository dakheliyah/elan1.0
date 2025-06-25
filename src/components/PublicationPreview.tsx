
import React, { useMemo } from 'react';
import { Publication, ParentBlockData } from '../pages/PublicationEditor';
import { PublicationHeaderRenderer } from './publication/PublicationHeaderRenderer';
import { PublicationSectionRenderer } from './publication/renderers/PublicationSectionRenderer';

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

  const combinedParentBlocks = useMemo(() => {
    const allBlocks = hostPublication && hostPublication.parentBlocks 
      ? [...hostPublication.parentBlocks.filter(block => block.isGlobal), ...publication.parentBlocks]
      : publication.parentBlocks;

    // Group blocks by umoorId while maintaining order
    const groupedBlocks: { umoorId: string; blocks: any[]; isGlobal: boolean }[] = [];
    const umoorMap = new Map<string, { blocks: any[]; isGlobal: boolean }>();

    allBlocks.forEach(block => {
      if (!umoorMap.has(block.umoorId)) {
        const groupData = { blocks: [], isGlobal: block.isGlobal || false };
        umoorMap.set(block.umoorId, groupData);
        groupedBlocks.push({ umoorId: block.umoorId, ...groupData });
      }
      umoorMap.get(block.umoorId)!.blocks.push(block);
    });

    // Sort groups: global umoors first, then local umoors
    groupedBlocks.sort((a, b) => {
      if (a.isGlobal && !b.isGlobal) return -1;
      if (!a.isGlobal && b.isGlobal) return 1;
      return 0;
    });

    return groupedBlocks;
  }, [publication, hostPublication]);


  const PreviewContent = () => (
    <div className="max-w-4xl mx-auto px-8 py-8">
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
    </div>
  );

  if (mode === 'export') {
    return <PreviewContent />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h3>
        <p className="text-sm text-gray-600">
          Your publication as it will appear to readers
        </p>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <PreviewContent />
      </div>
    </div>
  );
};

export default PublicationPreview;
