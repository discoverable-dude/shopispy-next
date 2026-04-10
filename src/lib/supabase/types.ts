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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      alert_monitors: {
        Row: {
          created_at: string
          id: string
          last_checked: string
          last_price: number | null
          product_id: number
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_checked?: string
          last_price?: number | null
          product_id: number
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_checked?: string
          last_price?: number | null
          product_id?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_monitors_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          notification_frequency: string
          price_alerts_enabled: boolean
          product_alerts_enabled: boolean
          store_name: string | null
          store_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_frequency?: string
          price_alerts_enabled?: boolean
          product_alerts_enabled?: boolean
          store_name?: string | null
          store_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_frequency?: string
          price_alerts_enabled?: boolean
          product_alerts_enabled?: boolean
          store_name?: string | null
          store_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          active: boolean | null
          created_at: string
          html_content: string
          id: string
          name: string
          subject: string
          text_content: string | null
          updated_at: string
          variables: Json | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          html_content: string
          id?: string
          name: string
          subject: string
          text_content?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          html_content?: string
          id?: string
          name?: string
          subject?: string
          text_content?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      product_alerts: {
        Row: {
          alert_type: string
          created_at: string
          email_sent: boolean
          id: string
          new_value: string | null
          old_value: string | null
          product_id: number
          product_title: string
          read_at: string | null
          store_name: string | null
          store_url: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          email_sent?: boolean
          id?: string
          new_value?: string | null
          old_value?: string | null
          product_id: number
          product_title: string
          read_at?: string | null
          store_name?: string | null
          store_url: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          email_sent?: boolean
          id?: string
          new_value?: string | null
          old_value?: string | null
          product_id?: number
          product_title?: string
          read_at?: string | null
          store_name?: string | null
          store_url?: string
          user_id?: string
        }
        Relationships: []
      }
      product_fetches: {
        Row: {
          fetched_at: string
          id: string
          store_id: string
          total_products: number
        }
        Insert: {
          fetched_at?: string
          id?: string
          store_id: string
          total_products?: number
        }
        Update: {
          fetched_at?: string
          id?: string
          store_id?: string
          total_products?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_fetches_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          admin_graphql_api_id: string | null
          alt: string | null
          created_at: string | null
          height: number | null
          id: number
          position: number | null
          product_id: number
          src: string
          updated_at: string | null
          variant_ids: number[] | null
          width: number | null
        }
        Insert: {
          admin_graphql_api_id?: string | null
          alt?: string | null
          created_at?: string | null
          height?: number | null
          id: number
          position?: number | null
          product_id: number
          src: string
          updated_at?: string | null
          variant_ids?: number[] | null
          width?: number | null
        }
        Update: {
          admin_graphql_api_id?: string | null
          alt?: string | null
          created_at?: string | null
          height?: number | null
          id?: number
          position?: number | null
          product_id?: number
          src?: string
          updated_at?: string | null
          variant_ids?: number[] | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          admin_graphql_api_id: string | null
          available: boolean | null
          barcode: string | null
          compare_at_price: number | null
          created_at: string | null
          fulfillment_service: string | null
          id: number
          inventory_management: string | null
          inventory_policy: string | null
          inventory_quantity: number | null
          option1: string | null
          option2: string | null
          option3: string | null
          position: number | null
          price: number | null
          product_id: number
          requires_shipping: boolean | null
          sku: string | null
          taxable: boolean | null
          title: string | null
          updated_at: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          admin_graphql_api_id?: string | null
          available?: boolean | null
          barcode?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          fulfillment_service?: string | null
          id: number
          inventory_management?: string | null
          inventory_policy?: string | null
          inventory_quantity?: number | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          position?: number | null
          price?: number | null
          product_id: number
          requires_shipping?: boolean | null
          sku?: string | null
          taxable?: boolean | null
          title?: string | null
          updated_at?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          admin_graphql_api_id?: string | null
          available?: boolean | null
          barcode?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          fulfillment_service?: string | null
          id?: number
          inventory_management?: string | null
          inventory_policy?: string | null
          inventory_quantity?: number | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          position?: number | null
          price?: number | null
          product_id?: number
          requires_shipping?: boolean | null
          sku?: string | null
          taxable?: boolean | null
          title?: string | null
          updated_at?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          admin_graphql_api_id: string | null
          created_at: string | null
          fetch_id: string
          handle: string | null
          id: number
          inserted_at: string
          product_type: string | null
          published_at: string | null
          published_scope: string | null
          raw_data: Json | null
          status: string | null
          store_id: string
          tags: string[] | null
          template_suffix: string | null
          title: string
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          admin_graphql_api_id?: string | null
          created_at?: string | null
          fetch_id: string
          handle?: string | null
          id: number
          inserted_at?: string
          product_type?: string | null
          published_at?: string | null
          published_scope?: string | null
          raw_data?: Json | null
          status?: string | null
          store_id: string
          tags?: string[] | null
          template_suffix?: string | null
          title: string
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          admin_graphql_api_id?: string | null
          created_at?: string | null
          fetch_id?: string
          handle?: string | null
          id?: number
          inserted_at?: string
          product_type?: string | null
          published_at?: string | null
          published_scope?: string | null
          raw_data?: Json | null
          status?: string | null
          store_id?: string
          tags?: string[] | null
          template_suffix?: string | null
          title?: string
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_fetch_id_fkey"
            columns: ["fetch_id"]
            isOneToOne: false
            referencedRelation: "product_fetches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          created_at: string
          id: string
          store_name: string | null
          store_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          store_name?: string | null
          store_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          store_name?: string | null
          store_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_hidden_stores: {
        Row: {
          hidden_at: string
          id: string
          store_url: string
          user_id: string
        }
        Insert: {
          hidden_at?: string
          id?: string
          store_url: string
          user_id: string
        }
        Update: {
          hidden_at?: string
          id?: string
          store_url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_scrapes: {
        Row: {
          created_at: string
          id: string
          scrape_date: string
          store_url: string
          total_products: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scrape_date?: string
          store_url: string
          total_products?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scrape_date?: string
          store_url?: string
          total_products?: number
          user_id?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          id: string
          variant_id: number
          product_id: number
          store_id: string
          price: number | null
          compare_at_price: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          variant_id: number
          product_id: number
          store_id: string
          price?: number | null
          compare_at_price?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          variant_id?: number
          product_id?: number
          store_id?: string
          price?: number | null
          compare_at_price?: number | null
          recorded_at?: string
        }
        Relationships: []
      }
      inventory_history: {
        Row: {
          id: string
          variant_id: number
          product_id: number
          store_id: string
          inventory_quantity: number | null
          available: boolean | null
          recorded_at: string
        }
        Insert: {
          id?: string
          variant_id: number
          product_id: number
          store_id: string
          inventory_quantity?: number | null
          available?: boolean | null
          recorded_at?: string
        }
        Update: {
          id?: string
          variant_id?: number
          product_id?: number
          store_id?: string
          inventory_quantity?: number | null
          available?: boolean | null
          recorded_at?: string
        }
        Relationships: []
      }
      product_changes: {
        Row: {
          id: string
          store_id: string
          product_id: number
          change_type: string
          product_title: string | null
          old_value: string | null
          new_value: string | null
          metadata: Json | null
          detected_at: string
        }
        Insert: {
          id?: string
          store_id: string
          product_id: number
          change_type: string
          product_title?: string | null
          old_value?: string | null
          new_value?: string | null
          metadata?: Json | null
          detected_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          product_id?: number
          change_type?: string
          product_title?: string | null
          old_value?: string | null
          new_value?: string | null
          metadata?: Json | null
          detected_at?: string
        }
        Relationships: []
      }
      market_reports: {
        Row: {
          id: string
          user_id: string
          report_type: string
          period_start: string
          period_end: string
          report_data: Json
          email_sent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          report_type: string
          period_start: string
          period_end: string
          report_data?: Json
          email_sent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_type?: string
          period_start?: string
          period_end?: string
          report_data?: Json
          email_sent?: boolean
          created_at?: string
        }
        Relationships: []
      }
      store_slugs: {
        Row: {
          id: string
          store_id: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_demo_user_role: {
        Args: {
          user_email: string
          user_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      get_admin_dashboard_data: { Args: never; Returns: Json }
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
