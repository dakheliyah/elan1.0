
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';
import { SupabaseServiceError, handleSupabaseError } from './serviceUtils';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

export const eventsService = {
  async getAll(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'fetch events');
    }
  },

  async getById(id: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'fetch event');
    }
  },

  async create(event: EventInsert): Promise<Event> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const eventData = {
        ...event,
        created_by: user.user?.id,
      };

      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'create event');
    }
  },

  async update(id: string, updates: EventUpdate): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error, 'update event');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete event');
    }
  },

  async getWithLocationCount(): Promise<(Event & { location_count: number })[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          locations(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(event => ({
        ...event,
        location_count: event.locations?.[0]?.count || 0,
        locations: undefined,
      }));
    } catch (error) {
      handleSupabaseError(error, 'fetch events with location count');
    }
  },
};

export type { Event, EventInsert, EventUpdate };
