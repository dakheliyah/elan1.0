import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { publicationsService } from '@/services/publicationsService';
import { useToast } from '@/hooks/use-toast';

interface TestCreatePublicationProps {
  eventId: string;
}

const TestCreatePublication: React.FC<TestCreatePublicationProps> = ({ eventId }) => {
  const [title, setTitle] = useState('Test Publication');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateTest = async () => {
    setLoading(true);
    try {
      console.log('Creating test publication for event:', eventId);
      
      const publicationData = {
        title: title,
        content: 'Test content',
        publication_date: new Date().toISOString().split('T')[0],
        event_id: eventId,
        location_ids: [] // Will be ignored by the new service implementation
      };
      
      console.log('Publication data:', publicationData);
      
      const result = await publicationsService.createForEvent(publicationData);
      console.log('Created publications:', result);
      
      toast({
        title: "Success",
        description: `Created ${result.length} publications`
      });
    } catch (error) {
      console.error('Error creating publication:', error);
      toast({
        title: "Error",
        description: `Failed to create publication: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-4">Test Create Publication</h3>
      <div className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Publication title"
        />
        <Button 
          onClick={handleCreateTest}
          disabled={loading || !title.trim()}
        >
          {loading ? 'Creating...' : 'Create Test Publication'}
        </Button>
      </div>
    </div>
  );
};

export default TestCreatePublication;