import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Publication {
  id: string;
  title: string;
  location_id: string | null;
  event_id: string;
  status: string;
  created_at: string;
}

const DebugPublications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        console.log('Fetching all publications...');
        const { data, error } = await supabase
          .from('publications')
          .select('id, title, location_id, event_id, status, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching publications:', error);
          setError(error.message);
        } else {
          console.log('Publications fetched:', data);
          setPublications(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (loading) return <div>Loading publications...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Debug: All Publications</h2>
      <p className="mb-4">Total publications: {publications.length}</p>
      
      {publications.length === 0 ? (
        <p>No publications found in database.</p>
      ) : (
        <div className="space-y-4">
          {publications.map((pub) => (
            <div key={pub.id} className="border p-4 rounded">
              <h3 className="font-semibold">{pub.title}</h3>
              <p><strong>ID:</strong> {pub.id}</p>
              <p><strong>Event ID:</strong> {pub.event_id}</p>
              <p><strong>Location ID:</strong> {pub.location_id || 'NULL'}</p>
              <p><strong>Status:</strong> {pub.status}</p>
              <p><strong>Created:</strong> {new Date(pub.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebugPublications;