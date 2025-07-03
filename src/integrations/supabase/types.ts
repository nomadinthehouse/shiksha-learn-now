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
      content_items: {
        Row: {
          author: string | null
          content_type: string
          created_at: string
          duration: string | null
          id: string
          metadata: Json | null
          publish_date: string | null
          source: string
          summary: string | null
          thumbnail_url: string | null
          title: string
          url: string
        }
        Insert: {
          author?: string | null
          content_type: string
          created_at?: string
          duration?: string | null
          id?: string
          metadata?: Json | null
          publish_date?: string | null
          source: string
          summary?: string | null
          thumbnail_url?: string | null
          title: string
          url: string
        }
        Update: {
          author?: string | null
          content_type?: string
          created_at?: string
          duration?: string | null
          id?: string
          metadata?: Json | null
          publish_date?: string | null
          source?: string
          summary?: string | null
          thumbnail_url?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      content_tracking: {
        Row: {
          completion_percentage: number | null
          content_type: string
          content_url: string
          created_at: string
          id: string
          is_completed: boolean | null
          last_watched_at: string | null
          topic: string
          total_duration: number | null
          updated_at: string
          user_id: string
          watch_time: number | null
        }
        Insert: {
          completion_percentage?: number | null
          content_type: string
          content_url: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          topic: string
          total_duration?: number | null
          updated_at?: string
          user_id: string
          watch_time?: number | null
        }
        Update: {
          completion_percentage?: number | null
          content_type?: string
          content_url?: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          topic?: string
          total_duration?: number | null
          updated_at?: string
          user_id?: string
          watch_time?: number | null
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          created_at: string
          current_topic: string
          difficulty_level: string | null
          id: string
          recommended_topics: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_topic: string
          difficulty_level?: string | null
          id?: string
          recommended_topics?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_topic?: string
          difficulty_level?: string | null
          id?: string
          recommended_topics?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          provider: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          provider?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          provider?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      search_cache: {
        Row: {
          content_type: string
          created_at: string
          expires_at: string
          id: string
          query: string
          results: Json
        }
        Insert: {
          content_type: string
          created_at?: string
          expires_at?: string
          id?: string
          query: string
          results: Json
        }
        Update: {
          content_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          query?: string
          results?: Json
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          learning_level: string
          query: string
          results_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          learning_level: string
          query: string
          results_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          learning_level?: string
          query?: string
          results_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string
          content_url: string | null
          created_at: string
          id: string
          tags: string[] | null
          title: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_url?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_url?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          difficulty_level: string | null
          id: string
          learning_topics: string[] | null
          preferred_content_types: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty_level?: string | null
          id?: string
          learning_topics?: string[] | null
          preferred_content_types?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty_level?: string | null
          id?: string
          learning_topics?: string[] | null
          preferred_content_types?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completion_percentage: number | null
          content_type: string
          content_url: string
          created_at: string
          id: string
          notes: string | null
          status: string | null
          time_spent: number | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          content_type: string
          content_url: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          time_spent?: number | null
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          content_type?: string
          content_url?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          time_spent?: number | null
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
