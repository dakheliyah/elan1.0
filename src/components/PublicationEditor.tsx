import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye, 
  MoreVertical,
  ChevronLeft
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ParentBlock from './blocks/ParentBlock';
import PublicationPreview from './PublicationPreview';
import UmoorSelector from './blocks/UmoorSelector';
import { ContentBlock, ParentBlockData, Publication } from '../pages/PublicationEditor';

const PublicationEditor = () => {
  const [publication, setPublication] = useState<Publication>({
    title: 'Tamaro Din 02 Moharram',
    breadcrumb: 'Ashara 1447h • Colombo',
    parentBlocks: []
  });

  const [showUmoorSelector, setShowUmoorSelector] = useState(false);

  const addParentBlock = (umoor: { id: string; name: string; logo_url: string | null; description: string | null }) => {
    const newParentBlock: ParentBlockData = {
      id: Date.now().toString(),
      umoorId: umoor.id,
      umoorName: umoor.name,
      umoorLogo: umoor.logo_url || '📋', // Use logo_url or fallback to emoji
      title: '',
      children: []
    };

    setPublication(prev => ({
      ...prev,
      parentBlocks: [...prev.parentBlocks, newParentBlock]
    }));
    setShowUmoorSelector(false);
  };

  const updateParentBlock = (parentId: string, updates: Partial<ParentBlockData>) => {
    setPublication(prev => ({
      ...prev,
      parentBlocks: prev.parentBlocks.map(parent =>
        parent.id === parentId ? { ...parent, ...updates } : parent
      )
    }));
  };

  const removeParentBlock = (parentId: string) => {
    setPublication(prev => ({
      ...prev,
      parentBlocks: prev.parentBlocks.filter(parent => parent.id !== parentId)
    }));
  };

  const addChildBlock = (parentId: string, type: 'text' | 'image', language?: 'eng' | 'lud') => {
    const newChild: ContentBlock = {
      id: Date.now().toString(),
      type,
      language: type === 'text' ? language : undefined,
      data: type === 'text' 
        ? { content: '', language: language || 'eng' }
        : { imageUrl: '', alt: '' }
    };

    updateParentBlock(parentId, {
      children: [...(publication.parentBlocks.find(p => p.id === parentId)?.children || []), newChild]
    });
  };

  const updateChildBlock = (parentId: string, childId: string, data: any) => {
    const parent = publication.parentBlocks.find(p => p.id === parentId);
    if (!parent) return;

    const updatedChildren = parent.children.map(child =>
      child.id === childId ? { ...child, data: { ...child.data, ...data } } : child
    );

    updateParentBlock(parentId, { children: updatedChildren });
  };

  const removeChildBlock = (parentId: string, childId: string) => {
    const parent = publication.parentBlocks.find(p => p.id === parentId);
    if (!parent) return;

    const updatedChildren = parent.children.filter(child => child.id !== childId);
    updateParentBlock(parentId, { children: updatedChildren });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(publication.parentBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPublication(prev => ({
      ...prev,
      parentBlocks: items
    }));
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Editor Panel - 60% width */}
      <div className="w-[60%] flex flex-col bg-white border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <ChevronLeft size={16} />
            </Button>
            <div>
              <div className="text-sm text-gray-500">{publication.breadcrumb}</div>
              <h1 className="text-xl font-semibold text-gray-900">{publication.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Eye size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical size={16} />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {publication.parentBlocks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <h3 className="text-lg font-medium mb-2">No content blocks yet</h3>
                <p className="mb-6">Start building your publication by selecting an Umoor department.</p>
              </div>
              <Button 
                onClick={() => setShowUmoorSelector(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus size={16} className="mr-2" />
                Select Umoor to Add Block
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="parent-blocks">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-6"
                    >
                      {publication.parentBlocks.map((parentBlock, index) => (
                        <Draggable key={parentBlock.id} draggableId={parentBlock.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              } transition-shadow`}
                            >
                              <ParentBlock
                                parentBlock={parentBlock}
                                dragHandleProps={provided.dragHandleProps}
                                onUpdateParent={(updates) => updateParentBlock(parentBlock.id, updates)}
                                onRemoveParent={() => removeParentBlock(parentBlock.id)}
                                onAddChild={(type, language) => addChildBlock(parentBlock.id, type, language)}
                                onUpdateChild={(childId, data) => updateChildBlock(parentBlock.id, childId, data)}
                                onRemoveChild={(childId) => removeChildBlock(parentBlock.id, childId)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => setShowUmoorSelector(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add New Umoor Block
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel - 40% width */}
      <div className="w-[40%] bg-gray-50">
        <PublicationPreview publication={publication} />
      </div>

      {/* Umoor Selector Modal */}
      {showUmoorSelector && (
        <UmoorSelector
          onSelect={addParentBlock}
          onClose={() => setShowUmoorSelector(false)}
        />
      )}
    </div>
  );
};

export default PublicationEditor;
