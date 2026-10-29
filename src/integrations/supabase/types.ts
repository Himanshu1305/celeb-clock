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
      birthday_reminders: {
        Row: {
          consent_at: string | null
          created_at: string
          friend_dob: string
          friend_name: string
          id: string
          last_notified_year: number | null
          notify_email: string | null
          relationship: string | null
          remind_days_before: number
          unsubscribe_token: string
          unsubscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          consent_at?: string | null
          created_at?: string
          friend_dob: string
          friend_name: string
          id?: string
          last_notified_year?: number | null
          notify_email?: string | null
          relationship?: string | null
          remind_days_before?: number
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          consent_at?: string | null
          created_at?: string
          friend_dob?: string
          friend_name?: string
          id?: string
          last_notified_year?: number | null
          notify_email?: string | null
          relationship?: string | null
          remind_days_before?: number
          unsubscribe_token?: string
          unsubscribed_at?: string | null
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
          is_paid: boolean | null
          is_premium_report: boolean | null
          last_viewed_at: string | null
          personal_message: string | null
          recipient_dob: string
          recipient_name: string
          report_data: Json
          slug: string
          unlock_source: string | null
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
          is_paid?: boolean | null
          is_premium_report?: boolean | null
          last_viewed_at?: string | null
          personal_message?: string | null
          recipient_dob: string
          recipient_name: string
          report_data?: Json
          slug: string
          unlock_source?: string | null
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
          is_paid?: boolean | null
          is_premium_report?: boolean | null
          last_viewed_at?: string | null
          personal_message?: string | null
          recipient_dob?: string
          recipient_name?: string
          report_data?: Json
          slug?: string
          unlock_source?: string | null
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
          known_for: string | null
          name: string
          nationality: string | null
          nationality_code: string | null
          occupation: string | null
          sitelinks: number | null
          slug: string | null
          tier: string | null
          wikidata_id: string | null
          wikipedia_url: string | null
        }
        Insert: {
          birth_date?: string | null
          birth_month_day?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: number
          known_for?: string | null
          name: string
          nationality?: string | null
          nationality_code?: string | null
          occupation?: string | null
          sitelinks?: number | null
          slug?: string | null
          tier?: string | null
          wikidata_id?: string | null
          wikipedia_url?: string | null
        }
        Update: {
          birth_date?: string | null
          birth_month_day?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: number
          known_for?: string | null
          name?: string
          nationality?: string | null
          nationality_code?: string | null
          occupation?: string | null
          sitelinks?: number | null
          slug?: string | null
          tier?: string | null
          wikidata_id?: string | null
          wikipedia_url?: string | null
        }
        Relationships: []
      }
      celebrity_sitelinks_dup_backup_20261024: {
        Row: {
          birth_date: string | null
          birth_month_day: string | null
          created_at: string | null
          death_date: string | null
          id: number | null
          known_for: string | null
          name: string | null
          nationality: string | null
          nationality_code: string | null
          occupation: string | null
          sitelinks: number | null
          slug: string | null
          tier: string | null
          wikidata_id: string | null
          wikipedia_url: string | null
        }
        Insert: {
          birth_date?: string | null
          birth_month_day?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: number | null
          known_for?: string | null
          name?: string | null
          nationality?: string | null
          nationality_code?: string | null
          occupation?: string | null
          sitelinks?: number | null
          slug?: string | null
          tier?: string | null
          wikidata_id?: string | null
          wikipedia_url?: string | null
        }
        Update: {
          birth_date?: string | null
          birth_month_day?: string | null
          created_at?: string | null
          death_date?: string | null
          id?: number | null
          known_for?: string | null
          name?: string | null
          nationality?: string | null
          nationality_code?: string | null
          occupation?: string | null
          sitelinks?: number | null
          slug?: string | null
          tier?: string | null
          wikidata_id?: string | null
          wikipedia_url?: string | null
        }
        Relationships: []
      }
      credit_notes: {
        Row: {
          buyer_email: string
          buyer_name: string
          cgst: number
          created_at: string
          credit_note_date: string
          credit_note_no: string
          currency: string
          emailed_at: string | null
          gross_amount: number
          id: string
          igst: number
          invoice_id: string
          original_invoice_date: string
          original_invoice_no: string
          reason: string
          refund_id: string
          seq: number
          series: string
          sgst: number
          tax_mode: string
          taxable_value: number
          user_id: string | null
        }
        Insert: {
          buyer_email: string
          buyer_name: string
          cgst?: number
          created_at?: string
          credit_note_date?: string
          credit_note_no: string
          currency: string
          emailed_at?: string | null
          gross_amount: number
          id?: string
          igst?: number
          invoice_id: string
          original_invoice_date: string
          original_invoice_no: string
          reason?: string
          refund_id: string
          seq: number
          series: string
          sgst?: number
          tax_mode: string
          taxable_value: number
          user_id?: string | null
        }
        Update: {
          buyer_email?: string
          buyer_name?: string
          cgst?: number
          created_at?: string
          credit_note_date?: string
          credit_note_no?: string
          currency?: string
          emailed_at?: string | null
          gross_amount?: number
          id?: string
          igst?: number
          invoice_id?: string
          original_invoice_date?: string
          original_invoice_no?: string
          reason?: string
          refund_id?: string
          seq?: number
          series?: string
          sgst?: number
          tax_mode?: string
          taxable_value?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_series_fkey"
            columns: ["series"]
            isOneToOne: false
            referencedRelation: "invoice_counters"
            referencedColumns: ["series"]
          },
        ]
      }
      email_subscribers: {
        Row: {
          consent_marketing: boolean
          country_code: string | null
          created_at: string
          daily_horoscope: boolean
          dob: string | null
          email: string
          id: number
          rashi_index: number | null
          source: string | null
          transit_alerts: boolean
          unsubscribe_token: string
          unsubscribed_at: string | null
          weekly_digest: boolean
        }
        Insert: {
          consent_marketing?: boolean
          country_code?: string | null
          created_at?: string
          daily_horoscope?: boolean
          dob?: string | null
          email: string
          id?: never
          rashi_index?: number | null
          source?: string | null
          transit_alerts?: boolean
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          weekly_digest?: boolean
        }
        Update: {
          consent_marketing?: boolean
          country_code?: string | null
          created_at?: string
          daily_horoscope?: boolean
          dob?: string | null
          email?: string
          id?: never
          rashi_index?: number | null
          source?: string | null
          transit_alerts?: boolean
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          weekly_digest?: boolean
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
      feedback: {
        Row: {
          approved: boolean
          comment: string | null
          consent: boolean
          content_type: string
          created_at: string
          dismissed: boolean
          id: string
          rating: number
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          comment?: string | null
          consent?: boolean
          content_type: string
          created_at?: string
          dismissed?: boolean
          id?: string
          rating?: number
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          comment?: string | null
          consent?: boolean
          content_type?: string
          created_at?: string
          dismissed?: boolean
          id?: string
          rating?: number
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_counters: {
        Row: {
          next_value: number
          series: string
        }
        Insert: {
          next_value: number
          series: string
        }
        Update: {
          next_value?: number
          series?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          buyer_country: string
          buyer_email: string
          buyer_gstin: string | null
          buyer_name: string
          buyer_state: string | null
          buyer_state_code: string | null
          cgst: number
          created_at: string
          currency: string
          emailed_at: string | null
          fx_rate: number | null
          fx_rate_date: string | null
          fx_rate_source: string | null
          gross_amount: number
          id: string
          igst: number
          invoice_date: string
          invoice_no: string
          line_items: Json
          order_id: string
          payment_id: string
          pdf_url: string | null
          place_of_supply: string
          seq: number
          series: string
          sgst: number
          tax_mode: string
          taxable_value: number
          user_id: string | null
        }
        Insert: {
          buyer_country: string
          buyer_email: string
          buyer_gstin?: string | null
          buyer_name: string
          buyer_state?: string | null
          buyer_state_code?: string | null
          cgst?: number
          created_at?: string
          currency: string
          emailed_at?: string | null
          fx_rate?: number | null
          fx_rate_date?: string | null
          fx_rate_source?: string | null
          gross_amount: number
          id?: string
          igst?: number
          invoice_date?: string
          invoice_no: string
          line_items: Json
          order_id: string
          payment_id: string
          pdf_url?: string | null
          place_of_supply: string
          seq: number
          series: string
          sgst?: number
          tax_mode: string
          taxable_value: number
          user_id?: string | null
        }
        Update: {
          buyer_country?: string
          buyer_email?: string
          buyer_gstin?: string | null
          buyer_name?: string
          buyer_state?: string | null
          buyer_state_code?: string | null
          cgst?: number
          created_at?: string
          currency?: string
          emailed_at?: string | null
          fx_rate?: number | null
          fx_rate_date?: string | null
          fx_rate_source?: string | null
          gross_amount?: number
          id?: string
          igst?: number
          invoice_date?: string
          invoice_no?: string
          line_items?: Json
          order_id?: string
          payment_id?: string
          pdf_url?: string | null
          place_of_supply?: string
          seq?: number
          series?: string
          sgst?: number
          tax_mode?: string
          taxable_value?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_series_fkey"
            columns: ["series"]
            isOneToOne: false
            referencedRelation: "invoice_counters"
            referencedColumns: ["series"]
          },
        ]
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
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          product: string
          razorpay_order_id: string | null
          razorpay_payment_id: string
          razorpay_subscription_id: string | null
          report_slug: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          product: string
          razorpay_order_id?: string | null
          razorpay_payment_id: string
          razorpay_subscription_id?: string | null
          report_slug?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          product?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string
          razorpay_subscription_id?: string | null
          report_slug?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_report_slug_fkey"
            columns: ["report_slug"]
            isOneToOne: false
            referencedRelation: "birthday_reports"
            referencedColumns: ["slug"]
          },
        ]
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
      pending_reviews: {
        Row: {
          action_steps: string | null
          auto_resolution_note: string | null
          auto_resolved: boolean
          body: string | null
          category: string
          created_at: string
          extra: Json
          id: number
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          title: string
        }
        Insert: {
          action_steps?: string | null
          auto_resolution_note?: string | null
          auto_resolved?: boolean
          body?: string | null
          category: string
          created_at?: string
          extra?: Json
          id?: never
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity: string
          title: string
        }
        Update: {
          action_steps?: string | null
          auto_resolution_note?: string | null
          auto_resolved?: boolean
          body?: string | null
          category?: string
          created_at?: string
          extra?: Json
          id?: never
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_profile: Json | null
          blog_subscription: boolean
          buyer_country: string | null
          buyer_state: string | null
          buyer_state_code: string | null
          country: string | null
          created_at: string
          credits_granted_month: string | null
          email: string
          email_notifications: boolean
          first_name: string | null
          id: string
          last_name: string | null
          name: string
          premium_status: boolean
          premium_until: string | null
          promo_premium_until: string | null
          report_credits: number | null
          subscription_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
          weekly_digest: boolean
          welcomed_at: string | null
        }
        Insert: {
          birth_profile?: Json | null
          blog_subscription?: boolean
          buyer_country?: string | null
          buyer_state?: string | null
          buyer_state_code?: string | null
          country?: string | null
          created_at?: string
          credits_granted_month?: string | null
          email: string
          email_notifications?: boolean
          first_name?: string | null
          id?: string
          last_name?: string | null
          name: string
          premium_status?: boolean
          premium_until?: string | null
          promo_premium_until?: string | null
          report_credits?: number | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
          welcomed_at?: string | null
        }
        Update: {
          birth_profile?: Json | null
          blog_subscription?: boolean
          buyer_country?: string | null
          buyer_state?: string | null
          buyer_state_code?: string | null
          country?: string | null
          created_at?: string
          credits_granted_month?: string | null
          email?: string
          email_notifications?: boolean
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string
          premium_status?: boolean
          premium_until?: string | null
          promo_premium_until?: string | null
          report_credits?: number | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
          welcomed_at?: string | null
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
      report_downloads: {
        Row: {
          downloaded_at: string | null
          id: string
          report_slug: string
          user_id: string | null
        }
        Insert: {
          downloaded_at?: string | null
          id?: string
          report_slug: string
          user_id?: string | null
        }
        Update: {
          downloaded_at?: string | null
          id?: string
          report_slug?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_downloads_report_slug_fkey"
            columns: ["report_slug"]
            isOneToOne: false
            referencedRelation: "birthday_reports"
            referencedColumns: ["slug"]
          },
        ]
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
      trial_claims: {
        Row: {
          claimed_at: string
          normalized_email: string
          user_id: string | null
        }
        Insert: {
          claimed_at?: string
          normalized_email: string
          user_id?: string | null
        }
        Update: {
          claimed_at?: string
          normalized_email?: string
          user_id?: string | null
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
      vedic_chart_cache: {
        Row: {
          access_count: number
          cache_key: string
          chart_data: Json
          created_at: string
          last_accessed_at: string
          source: string
        }
        Insert: {
          access_count?: number
          cache_key: string
          chart_data: Json
          created_at?: string
          last_accessed_at?: string
          source?: string
        }
        Update: {
          access_count?: number
          cache_key?: string
          chart_data?: Json
          created_at?: string
          last_accessed_at?: string
          source?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_id: string
          event_type: string
          payload: Json
          processed_at: string | null
        }
        Insert: {
          event_id: string
          event_type: string
          payload: Json
          processed_at?: string | null
        }
        Update: {
          event_id?: string
          event_type?: string
          payload?: Json
          processed_at?: string | null
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
      increment_report_view_count: {
        Args: { report_id: string }
        Returns: undefined
      }
      issue_credit_note: {
        Args: { p: Json }
        Returns: {
          buyer_email: string
          buyer_name: string
          cgst: number
          created_at: string
          credit_note_date: string
          credit_note_no: string
          currency: string
          emailed_at: string | null
          gross_amount: number
          id: string
          igst: number
          invoice_id: string
          original_invoice_date: string
          original_invoice_no: string
          reason: string
          refund_id: string
          seq: number
          series: string
          sgst: number
          tax_mode: string
          taxable_value: number
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "credit_notes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      issue_invoice: {
        Args: { p: Json }
        Returns: {
          buyer_country: string
          buyer_email: string
          buyer_gstin: string | null
          buyer_name: string
          buyer_state: string | null
          buyer_state_code: string | null
          cgst: number
          created_at: string
          currency: string
          emailed_at: string | null
          fx_rate: number | null
          fx_rate_date: string | null
          fx_rate_source: string | null
          gross_amount: number
          id: string
          igst: number
          invoice_date: string
          invoice_no: string
          line_items: Json
          order_id: string
          payment_id: string
          pdf_url: string | null
          place_of_supply: string
          seq: number
          series: string
          sgst: number
          tax_mode: string
          taxable_value: number
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_review_reviewed: { Args: { p_id: number }; Returns: undefined }
      redeem_report_credit: {
        Args: { p_slug: string; p_user_id: string }
        Returns: Json
      }
      touch_report_view: { Args: { p_slug: string }; Returns: undefined }
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
