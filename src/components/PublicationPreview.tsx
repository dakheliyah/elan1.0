
import React from 'react';
import { Publication } from '../pages/PublicationEditor';
import { PublicationHeaderRenderer } from './publication/PublicationHeaderRenderer';
import { PublicationSectionRenderer } from './publication/renderers/PublicationSectionRenderer';

interface PublicationPreviewProps {
  publication: Publication;
  mode?: 'preview' | 'export';
}

const PublicationPreview: React.FC<PublicationPreviewProps> = ({ 
  publication, 
  mode = 'preview' 
}) => {

  const PreviewContent = () => (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <PublicationHeaderRenderer
        title={publication.title}
        breadcrumb={publication.breadcrumb}
        showDecorative={true}
      />

      {/* Publication Content */}
      {publication.parentBlocks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-xl font-medium mb-3">Empty Publication</div>
          <p className="text-lg">Add Umoor blocks to see the preview</p>
        </div>
      ) : (
        <div className="space-y-0">
          {publication.parentBlocks.map((parentBlock, index) => (
            <PublicationSectionRenderer
              key={parentBlock.id}
              parentBlock={parentBlock}
              mode={mode}
              isLast={index === publication.parentBlocks.length - 1}
            />
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
