import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Save,
  Eye,
  MoreVertical,
  Loader2,
  Plus,
  Download
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ParentBlock from '@/components/blocks/ParentBlock';
import PublicationPreview from '@/components/PublicationPreview';
import UmoorSelector from '@/components/blocks/UmoorSelector';
import ExportOptionsPanel from '@/components/export/ExportOptionsPanel';
import { useToast } from '@/hooks/use-toast';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  useEvent, 
  useLocation, 
  usePublication,
  useUpdatePublication
} from '@/hooks/useSupabaseQuery';
import { ExportModal } from '@/components/export/ExportModal';
import { PublishDropdown } from '@/components/export/PublishDropdown';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image';
  language?: 'eng' | 'lud';
  data: any;
}

export interface ParentBlockData {
  id: string;
  umoorId: string;
  umoorName: string;
  umoorLogo: string;
  title: string;
  subheading?: string;
  description?: string;
  children: ContentBlock[];
  isGlobal?: boolean;
  locationId?: string;
}

export interface Publication {
  title: string;
  breadcrumb: string;
  parentBlocks: ParentBlockData[];
}

// Helper function to safely convert JSON to ParentBlockData[]
const parseContentFromJson = (content: any): ParentBlockData[] => {
  if (!content) return [];
  
  try {
    // If it's already an array, return it
    if (Array.isArray(content)) {
      return content as ParentBlockData[];
    }
    
    // If it's a string, try to parse it
    if (typeof content === 'string') {
      return JSON.parse(content) as ParentBlockData[];
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing publication content:', error);
    return [];
  }
};

// Helper function to safely convert ParentBlockData[] to JSON
const serializeContentToJson = (parentBlocks: ParentBlockData[]): any => {
  return parentBlocks as any;
};

const PublicationEditorPage = () => {
  const { eventId, locationId, publicationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isEditing = !!publicationId;
  
  // Fetch data from Supabase
  const { data: event, isLoading: eventLoading } = useEvent(eventId || '');
  const { data: location, isLoading: locationLoading } = useLocation(locationId || '');
  const { data: publicationData, isLoading: publicationLoading } = usePublication(publicationId || '');
  const updatePublicationMutation = useUpdatePublication();

  const [publication, setPublication] = useState<Publication>({
    title: '',
    breadcrumb: '',
    parentBlocks: []
  });

  const [showUmoorSelector, setShowUmoorSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'html' | 'pdf'>('html');

  // Load publication data when available
  useEffect(() => {
    if (event && location) {
      const breadcrumb = `${event.name} • ${location.name}`;
      
      if (publicationData) {
        // Load existing publication with safe JSON parsing
        const content = parseContentFromJson(publicationData.content);
        setPublication({
          title: publicationData.title,
          breadcrumb,
          parentBlocks: content
        });
      } else if (!isEditing) {
        // New publication
        setPublication(prev => ({
          ...prev,
          breadcrumb
        }));
      }
    }
  }, [event, location, publicationData, isEditing]);

  const handleBack = () => {
    navigate(`/events/${eventId}/locations/${locationId}`);
  };

  const validatePublication = () => {
    if (!publication.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a publication title.",
        variant: "destructive"
      });
      return false;
    }

    if (publication.parentBlocks.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please add at least one content block.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validatePublication() || !publicationId) return;

    setIsSaving(true);
    
    try {
      await updatePublicationMutation.mutateAsync({
        id: publicationId,
        updates: {
          title: publication.title,
          content: serializeContentToJson(publication.parentBlocks),
          status: 'draft'
        }
      });
      
      toast({
        title: "Publication Saved",
        description: "Your publication has been saved as a draft.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save publication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validatePublication() || !publicationId) return;

    setIsPublishing(true);
    
    try {
      await updatePublicationMutation.mutateAsync({
        id: publicationId,
        updates: {
          title: publication.title,
          content: serializeContentToJson(publication.parentBlocks),
          status: 'published'
        }
      });
      
      toast({
        title: "Publication Published",
        description: "Your publication is now live.",
      });

      // Redirect back to location page after successful publish
      setTimeout(() => {
        navigate(`/events/${eventId}/locations/${locationId}`);
      }, 1000);
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Publish Failed",
        description: "Failed to publish publication. Please try again.",
        variant: "destructive"
      });
      setIsPublishing(false);
    }
  };

  const handlePublishAndExport = async () => {
    // First publish, then show export modal
    await handlePublish();
    if (publicationId) {
      setShowExportModal(true);
    }
  };

  const handleExportHTML = () => {
    if (!publicationId) {
      toast({
        title: "Save Required", 
        description: "Please save your publication before exporting.",
        variant: "destructive"
      });
      return;
    }
    setExportFormat('html');
    setShowExportModal(true);
  };

  const handleExportPDF = () => {
    if (!publicationId) {
      toast({
        title: "Save Required",
        description: "Please save your publication before exporting.", 
        variant: "destructive"
      });
      return;
    }
    setExportFormat('pdf');
    setShowExportModal(true);
  };

  const addParentBlock = (umoor: { id: string; name: string; logo_url: string | null; description: string | null }) => {
    const newParentBlock: ParentBlockData = {
      id: Date.now().toString(),
      umoorId: umoor.id,
      umoorName: umoor.name,
      umoorLogo: umoor.logo_url || '📋', // Use uploaded logo or fallback to emoji
      title: '',
      subheading: '',
      description: '',
      children: [],
      isGlobal: false,
      locationId: locationId || ''
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
        parent.id === parentId ? { ...parent, ...updates, locationId: locationId || '' } : parent
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

  // Loading state
  if (eventLoading || locationLoading || (isEditing && publicationLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-slate-800 mx-auto mb-4" />
          <p className="text-gray-600">Loading publication...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!event || !location || (isEditing && !publicationData && !publicationLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Publication Not Found</h2>
          <p className="text-gray-600 mb-4">The publication you're looking for doesn't exist.</p>
          <Button onClick={handleBack}>Back to Location</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              disabled={isSaving || isPublishing}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigate('/events')} 
                    className="cursor-pointer text-gray-600 hover:text-gray-900"
                  >
                    Event Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigate(`/events/${eventId}`)} 
                    className="cursor-pointer text-gray-600 hover:text-gray-900"
                  >
                    {event?.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={handleBack} 
                    className="cursor-pointer text-gray-600 hover:text-gray-900"
                  >
                    {location?.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900">
                    {isEditing ? `Edit ${publication.title || 'Publication'}` : 'New Publication'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
              disabled={isSaving || isPublishing}
            >
              <Eye size={16} />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSave}
              className="flex items-center gap-2"
              disabled={isSaving || isPublishing || !publicationId}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            
            <PublishDropdown
              onPublish={handlePublish}
              onExportHTML={handleExportHTML}
              onExportPDF={handleExportPDF}
              onPublishAndExport={handlePublishAndExport}
              isPublishing={isPublishing}
              disabled={isSaving || !publicationId}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className={`${showPreview ? 'w-[60%]' : 'w-full'} flex flex-col bg-white border-r border-gray-200 transition-all duration-300`}>
          {/* Publication Title */}
          <div className="p-6 border-b border-gray-200">
            <input
              type="text"
              value={publication.title}
              onChange={(e) => setPublication(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Publication title..."
              className="text-2xl font-bold text-gray-900 w-full border-none outline-none bg-transparent placeholder-gray-400"
              disabled={isSaving || isPublishing}
            />
            <div className="text-sm text-gray-500 mt-1">
              {publication.breadcrumb}
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
                  disabled={isSaving || isPublishing}
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
                                  eventId={eventId} // Pass eventId to ParentBlock
                                  isHost={location?.is_host || false} // Pass host status to ParentBlock
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
                    disabled={isSaving || isPublishing}
                  >
                    <Plus size={16} />
                    Add New Umoor Block
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-[40%] bg-gray-50">
            <PublicationPreview 
              publication={publication} 
              locationLogo={location?.logo_url}
              locationName={location?.name}
            />
          </div>
        )}
      </div>

      {/* Umoor Selector Modal */}
      {showUmoorSelector && (
        <UmoorSelector
          onSelect={addParentBlock}
          onClose={() => setShowUmoorSelector(false)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && publicationId && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          publication={publication}
          publicationId={publicationId}
          locationLogo={location?.logo_url}
          locationName={location?.name}
        />
      )}
    </div>
  );
};

export default PublicationEditorPage;
