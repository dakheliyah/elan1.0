export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      compression_settings: {
        Row: {
          auto_compress: boolean | null
          enable_progressive: boolean | null
          enable_webp: boolean | null
          event_id: string
          id: string
          max_height: number | null
          max_width: number | null
          quality_images: number | null
          quality_thumbnails: number | null
          updated_at: string
        }
        Insert: {
          auto_compress?: boolean | null
          enable_progressive?: boolean | null
          enable_webp?: boolean | null
          event_id: string
          id?: string
          max_height?: number | null
          max_width?: number | null
          quality_images?: number | null
          quality_thumbnails?: number | null
          updated_at?: string
        }
        Update: {
          auto_compress?: boolean | null
          enable_progressive?: boolean | null
          enable_webp?: boolean | null
          event_id?: string
          id?: string
          max_height?: number | null
          max_width?: number | null
          quality_images?: number | null
          quality_thumbnails?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compression_settings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          event_id: string | null
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          event_id?: string | null
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string | null
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          event_id: string | null
          host_location_id: string | null
          id: string
          is_host: boolean | null
          logo_url: string | null
          name: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          host_location_id?: string | null
          id?: string
          is_host?: boolean | null
          logo_url?: string | null
          name: string
          timezone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          host_location_id?: string | null
          id?: string
          is_host?: boolean | null
          logo_url?: string | null
          name?: string
          timezone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_host_location_id_fkey"
            columns: ["host_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_access_log: {
        Row: {
          access_type: string
          bytes_transferred: number | null
          cache_hit: boolean | null
          created_at: string
          id: string
          ip_address: unknown | null
          media_file_id: string
          response_time_ms: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          bytes_transferred?: number | null
          cache_hit?: boolean | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          media_file_id: string
          response_time_ms?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          bytes_transferred?: number | null
          cache_hit?: boolean | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          media_file_id?: string
          response_time_ms?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_access_log_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_backup_jobs: {
        Row: {
          backup_location: string | null
          backup_type: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          event_id: string
          file_count: number | null
          id: string
          started_at: string | null
          status: string
          total_size_bytes: number | null
        }
        Insert: {
          backup_location?: string | null
          backup_type: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          event_id: string
          file_count?: number | null
          id?: string
          started_at?: string | null
          status?: string
          total_size_bytes?: number | null
        }
        Update: {
          backup_location?: string | null
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          event_id?: string
          file_count?: number | null
          id?: string
          started_at?: string | null
          status?: string
          total_size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_backup_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_backup_jobs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          access_count: number | null
          archived_at: string | null
          avg_response_time_ms: number | null
          cdn_url: string | null
          compression_ratio: number | null
          created_at: string
          duration_seconds: number | null
          event_id: string
          file_type: string
          format: string
          height: number | null
          id: string
          is_archived: boolean | null
          is_optimized: boolean | null
          last_accessed: string | null
          mime_type: string
          name: string
          original_name: string
          size_bytes: number
          storage_path: string
          thumbnail_url: string | null
          updated_at: string
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          access_count?: number | null
          archived_at?: string | null
          avg_response_time_ms?: number | null
          cdn_url?: string | null
          compression_ratio?: number | null
          created_at?: string
          duration_seconds?: number | null
          event_id: string
          file_type: string
          format: string
          height?: number | null
          id?: string
          is_archived?: boolean | null
          is_optimized?: boolean | null
          last_accessed?: string | null
          mime_type: string
          name: string
          original_name: string
          size_bytes: number
          storage_path: string
          thumbnail_url?: string | null
          updated_at?: string
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          access_count?: number | null
          archived_at?: string | null
          avg_response_time_ms?: number | null
          cdn_url?: string | null
          compression_ratio?: number | null
          created_at?: string
          duration_seconds?: number | null
          event_id?: string
          file_type?: string
          format?: string
          height?: number | null
          id?: string
          is_archived?: boolean | null
          is_optimized?: boolean | null
          last_accessed?: string | null
          mime_type?: string
          name?: string
          original_name?: string
          size_bytes?: number
          storage_path?: string
          thumbnail_url?: string | null
          updated_at?: string
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_files_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_optimization_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          event_id: string
          id: string
          media_file_ids: string[]
          options: Json | null
          progress: number | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          event_id: string
          id?: string
          media_file_ids: string[]
          options?: Json | null
          progress?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          event_id?: string
          id?: string
          media_file_ids?: string[]
          options?: Json | null
          progress?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_optimization_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_optimization_jobs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      media_usage: {
        Row: {
          created_at: string
          id: string
          media_file_id: string
          publication_id: string | null
          usage_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_file_id: string
          publication_id?: string | null
          usage_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          media_file_id?: string
          publication_id?: string | null
          usage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_usage_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_usage_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      media_versions: {
        Row: {
          created_at: string
          format: string
          height: number | null
          id: string
          is_optimized: boolean | null
          media_file_id: string
          quality: number | null
          size_bytes: number
          storage_path: string
          url: string
          version_type: string
          width: number | null
        }
        Insert: {
          created_at?: string
          format: string
          height?: number | null
          id?: string
          is_optimized?: boolean | null
          media_file_id: string
          quality?: number | null
          size_bytes: number
          storage_path: string
          url: string
          version_type: string
          width?: number | null
        }
        Update: {
          created_at?: string
          format?: string
          height?: number | null
          id?: string
          is_optimized?: boolean | null
          media_file_id?: string
          quality?: number | null
          size_bytes?: number
          storage_path?: string
          url?: string
          version_type?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_versions_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      orphaned_files: {
        Row: {
          cleanup_scheduled: string | null
          detected_at: string
          id: string
          is_cleaned: boolean | null
          last_accessed: string | null
          size_bytes: number
          storage_path: string
        }
        Insert: {
          cleanup_scheduled?: string | null
          detected_at?: string
          id?: string
          is_cleaned?: boolean | null
          last_accessed?: string | null
          size_bytes: number
          storage_path: string
        }
        Update: {
          cleanup_scheduled?: string | null
          detected_at?: string
          id?: string
          is_cleaned?: boolean | null
          last_accessed?: string | null
          size_bytes?: number
          storage_path?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      publication_locations: {
        Row: {
          content: string | null
          created_at: string
          id: string
          location_id: string | null
          publication_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          location_id?: string | null
          publication_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          location_id?: string | null
          publication_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_locations_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          content: Json | null
          created_at: string | null
          created_by: string | null
          event_id: string | null
          id: string
          location_id: string | null
          publication_date: string
          status: Database["public"]["Enums"]["publication_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          id?: string
          location_id?: string | null
          publication_date: string
          status?: Database["public"]["Enums"]["publication_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          id?: string
          location_id?: string | null
          publication_date?: string
          status?: Database["public"]["Enums"]["publication_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publications_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_quotas: {
        Row: {
          created_at: string
          event_id: string
          id: string
          quota_bytes: number
          updated_at: string
          used_bytes: number
          warning_threshold: number
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          quota_bytes?: number
          updated_at?: string
          used_bytes?: number
          warning_threshold?: number
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          quota_bytes?: number
          updated_at?: string
          used_bytes?: number
          warning_threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "storage_quotas_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_usage_history: {
        Row: {
          created_at: string
          date: string
          event_id: string
          file_count: number
          id: string
          used_bytes: number
        }
        Insert: {
          created_at?: string
          date?: string
          event_id: string
          file_count: number
          id?: string
          used_bytes: number
        }
        Update: {
          created_at?: string
          date?: string
          event_id?: string
          file_count?: number
          id?: string
          used_bytes?: number
        }
        Relationships: [
          {
            foreignKeyName: "storage_usage_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      umoors: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          order_preference: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          order_preference?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          order_preference?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_location_access: {
        Row: {
          access_level: Database["public"]["Enums"]["location_access_level"]
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string
          id: string
          location_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["location_access_level"]
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by: string
          id?: string
          location_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["location_access_level"]
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string
          id?: string
          location_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_location_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_location_access_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_location_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_publications_for_all_locations: {
        Args: {
          p_title: string
          p_event_id: string
          p_publication_date: string
          p_status?: Database["public"]["Enums"]["publication_status"]
          p_created_by?: string
        }
        Returns: {
          publication_id: string
          location_id: string
          location_name: string
        }[]
      }
      detect_orphaned_files: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_publication_by_event_and_date: {
        Args: { event_uuid: string; pub_date: string }
        Returns: {
          id: string
          title: string
          content: string
          status: string
          is_featured: boolean
          publication_date: string
          event_id: string
          created_at: string
          updated_at: string
          created_by: string
        }[]
      }
      get_publication_locations_with_status: {
        Args: { pub_id: string }
        Returns: {
          location_id: string
          location_name: string
          content: string
          status: string
          updated_at: string
        }[]
      }
      get_publications_by_event_and_date: {
        Args: { p_event_id: string; p_publication_date: string }
        Returns: {
          publication_id: string
          title: string
          content: Json
          status: string
          location_id: string
          location_name: string
          location_is_host: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      update_storage_quota_usage: {
        Args: { p_event_id: string }
        Returns: undefined
      }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "expired"
      location_access_level: "read" | "write" | "admin"
      publication_status: "draft" | "mark_as_ready" | "archived"
      user_role: "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      invitation_status: ["pending", "accepted", "expired"],
      location_access_level: ["read", "write", "admin"],
      publication_status: ["draft", "mark_as_ready", "archived"],
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const
