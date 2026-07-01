export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      birthday_reports: {
        Row: {
          country: string | null
          created_at: string | null
          expires_at: string
          gender: string | null
          gifter_name: string | null
          id: string
          is_premium_report: boolean | null
          personal_message: string | null
          recipient_dob: string
          recipient_name: string
          report_data: Json
          slug: string
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          expires_at: string
          gender?: string | null
          gifter_name?: string | null
          id?: string
          is_premium_report?: boolean | null
          personal_message?: string | null
          recipient_dob: string
          recipient_name: string
          report_data?: Json
          slug: string
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          expires_at?: string
          gender?: string | null
          gifter_name?: string | null
          id?: string
          is_premium_report?: boolean | null
          personal_message?: string | null
          recipient_dob?: string
          recipient_name?: string
          report_data?: Json
          slug?: string
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      blog_drafts: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          author_bio: string | null
          category: string
          content: string
          created_at: string | null
          excerpt: string
          faqs: Json | null
          featured_image: string | null
          generation_prompt: string | null
          id: string
          is_auto_generated: boolean | null
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          read_time: number | null
          review_notes: string | null
          reviewed_by: string | null
          scheduled_for: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          author_bio?: string | null
          category: string
          content: string
          created_at?: string | null
          excerpt: string
          faqs?: Json | null
          featured_image?: string | null
          generation_prompt?: string | null
          id?: string
          is_auto_generated?: boolean | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          read_time?: number | null
          review_notes?: string | null
          reviewed_by?: string | null
          scheduled_for?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          author_bio?: string | null
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string
          faqs?: Json | null
          featured_image?: string | null
          generation_prompt?: string | null
          id?: string
          is_auto_generated?: boolean | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          read_time?: number | null
          review_notes?: string | null
          reviewed_by?: string | null
          scheduled_for?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      celebrity_boosts: {
        Row: {
          boosted_at: string | null
          celebrity_name: string
          id: number
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          boosted_at?: string | null
          celebrity_name: string
          id?: number
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          boosted_at?: string | null
          celebrity_name?: string
          id?: number
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      celebrity_sitelinks: {
        Row: {
          birth_date: string | null
          birth_month_day: string | null
          created_at: string | null
          death_date: string | null
          id: number
          name: string
          nationality: string | null
          nationality_code: string | null
          occupation: string | null
          sitelinks: number | null
          wikidata_id: string | null
          wikipedia_url: string | null
        }
        Insert: {
          birth_date?: string | null
          birth_month_day?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: number
          name: string
          nationality?: string | null
          nationality_code?: string | null
          occupation?: string | null
          sitelinks?: number | null
          wikidata_id?: string | null
          wikipedia_url?: string | null
        }
        Update: {
          birth_date?: string | null
          birth_month_day?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: number
          name?: string
          nationality?: string | null
          nationality_code?: string | null
          occupation?: string | null
          sitelinks?: number | null
          wikidata_id?: string | null
          wikipedia_url?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          data: Json
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          template_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          country: string | null
          created_at: string | null
          date_of_birth: string
          forecast_cache: number | null
          gender: string | null
          id: string
          last_calculated: string | null
          name: string
          relationship: string | null
          score_cache: number | null
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          date_of_birth: string
          forecast_cache?: number | null
          gender?: string | null
          id?: string
          last_calculated?: string | null
          name: string
          relationship?: string | null
          score_cache?: number | null
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string | null
          date_of_birth?: string
          forecast_cache?: number | null
          gender?: string | null
          id?: string
          last_calculated?: string | null
          name?: string
          relationship?: string | null
          score_cache?: number | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          age_group: string
          country: string | null
          display_name: string
          forecast: number
          id: number
          opted_in_at: string | null
          score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age_group: string
          country?: string | null
          display_name?: string
          forecast: number
          id?: number
          opted_in_at?: string | null
          score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age_group?: string
          country?: string | null
          display_name?: string
          forecast?: number
          id?: number
          opted_in_at?: string | null
          score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      longevity_scores: {
        Row: {
          forecast: number | null
          id: number
          recorded_at: string | null
          score: number
          user_id: string
          week_start: string
        }
        Insert: {
          forecast?: number | null
          id?: number
          recorded_at?: string | null
          score: number
          user_id: string
          week_start?: string
        }
        Update: {
          forecast?: number | null
          id?: number
          recorded_at?: string | null
          score?: number
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      pdf_reports_log: {
        Row: {
          created_at: string
          id: string
          report_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blog_subscription: boolean
          country: string | null
          created_at: string
          email: string
          email_notifications: boolean
          first_name: string | null
          id: string
          last_name: string | null
          name: string
          premium_status: boolean
          premium_until: string | null
          subscription_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blog_subscription?: boolean
          country?: string | null
          created_at?: string
          email: string
          email_notifications?: boolean
          first_name?: string | null
          id?: string
          last_name?: string | null
          name: string
          premium_status?: boolean
          premium_until?: string | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blog_subscription?: boolean
          country?: string | null
          created_at?: string
          email?: string
          email_notifications?: boolean
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string
          premium_status?: boolean
          premium_until?: string | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_code_redemptions: {
        Row: {
          code: string
          id: number
          redeemed_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          id?: number
          redeemed_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          id?: number
          redeemed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          expires_at: string | null
          grants_premium: boolean | null
          id: number
          max_uses: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          expires_at?: string | null
          grants_premium?: boolean | null
          id?: number
          max_uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          expires_at?: string | null
          grants_premium?: boolean | null
          id?: number
          max_uses?: number | null
        }
        Relationships: []
      }
      status_checks: {
        Row: {
          client_name: string
          id: string
          timestamp: string | null
        }
        Insert: {
          client_name: string
          id?: string
          timestamp?: string | null
        }
        Update: {
          client_name?: string
          id?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          content: string
          country: string | null
          created_at: string | null
          display_name: string
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          rating: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          country?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          rating: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          country?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          rating?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
