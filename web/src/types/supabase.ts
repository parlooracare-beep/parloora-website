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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          androidAppUrl: string | null
          autoApproveSellers: boolean | null
          commissionRate: number | null
          id: string
          iosAppUrl: string | null
          maintenanceMode: boolean | null
          maxBookingsPerDay: number | null
          platformName: string | null
          reviewModerationEnabled: boolean | null
          supportEmail: string | null
          systemEmailsEnabled: boolean | null
        }
        Insert: {
          androidAppUrl?: string | null
          autoApproveSellers?: boolean | null
          commissionRate?: number | null
          id: string
          iosAppUrl?: string | null
          maintenanceMode?: boolean | null
          maxBookingsPerDay?: number | null
          platformName?: string | null
          reviewModerationEnabled?: boolean | null
          supportEmail?: string | null
          systemEmailsEnabled?: boolean | null
        }
        Update: {
          androidAppUrl?: string | null
          autoApproveSellers?: boolean | null
          commissionRate?: number | null
          id?: string
          iosAppUrl?: string | null
          maintenanceMode?: boolean | null
          maxBookingsPerDay?: number | null
          platformName?: string | null
          reviewModerationEnabled?: boolean | null
          supportEmail?: string | null
          systemEmailsEnabled?: boolean | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount: number | null
          booking_date: string | null
          booking_type: string | null
          created_at: string
          updated_at: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          date: string | null
          id: string
          is_guest: boolean | null
          notes: string | null
          original_price: number | null
          parlour_id: string | null
          parlour_name: string | null
          payment_method: string | null
          payment_status: string | null
          payment_intent_id: string | null
          staff_id: string | null
          points_awarded: boolean | null
          price: number | null
          reward_discount: number | null
          reward_points_redeemed: number | null
          seller_id: string | null
          service_address: string | null
          service_id: string | null
          service_name: string | null
          status: string | null
          time: string | null
        }
        Insert: {
          amount?: number | null
          booking_date?: string | null
          booking_type?: string | null
          created_at?: string
          updated_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          date?: string | null
          id?: string
          is_guest?: boolean | null
          notes?: string | null
          original_price?: number | null
          parlour_id?: string | null
          parlour_name?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payment_intent_id?: string | null
          staff_id?: string | null
          points_awarded?: boolean | null
          price?: number | null
          reward_discount?: number | null
          reward_points_redeemed?: number | null
          seller_id?: string | null
          service_address?: string | null
          service_id?: string | null
          service_name?: string | null
          status?: string | null
          time?: string | null
        }
        Update: {
          amount?: number | null
          booking_date?: string | null
          booking_type?: string | null
          created_at?: string
          updated_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          date?: string | null
          id?: string
          is_guest?: boolean | null
          notes?: string | null
          original_price?: number | null
          parlour_id?: string | null
          parlour_name?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payment_intent_id?: string | null
          staff_id?: string | null
          points_awarded?: boolean | null
          price?: number | null
          reward_discount?: number | null
          reward_points_redeemed?: number | null
          seller_id?: string | null
          service_address?: string | null
          service_id?: string | null
          service_name?: string | null
          status?: string | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          parlour_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          parlour_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          parlour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          status: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          status?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          status?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          delivery_method: string | null
          id: string
          items: Json | null
          items_count: number | null
          payment_method: string | null
          phone: string | null
          points_awarded: boolean | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          status: string | null
          total: number | null
          total_amount: number | null
          total_price: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          delivery_method?: string | null
          id?: string
          items?: Json | null
          items_count?: number | null
          payment_method?: string | null
          phone?: string | null
          points_awarded?: boolean | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          status?: string | null
          total?: number | null
          total_amount?: number | null
          total_price?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          delivery_method?: string | null
          id?: string
          items?: Json | null
          items_count?: number | null
          payment_method?: string | null
          phone?: string | null
          points_awarded?: boolean | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          status?: string | null
          total?: number | null
          total_amount?: number | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parlours: {
        Row: {
          address: string | null
          city: string | null
          commission_rate: number | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          image: string | null
          name: string
          owner_id: string | null
          phone: string | null
          rating: number | null
          status: string | null
          total_bookings: number | null
          type: string | null
          is_active: boolean | null
          opening_hours: Json | null
          website: string | null
          gallery_urls: Json | null
          logo_url: string | null
          cover_url: string | null
          full_address: string | null
          map_lat: number | null
          map_lng: number | null
          nid_number: string | null
          trade_license: string | null
          trade_license_url: string | null
          verification_docs: Json | null
          bank_account: string | null
          bkash_number: string | null
          nagad_number: string | null
          booking_rules: string | null
          cancellation_policy: string | null
          profile_completion: number | null
          is_booking_ready: boolean | null
          username?: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          total_bookings?: number | null
          type?: string | null
          is_active?: boolean | null
          opening_hours?: Json | null
          website?: string | null
          gallery_urls?: Json | null
          logo_url?: string | null
          cover_url?: string | null
          full_address?: string | null
          map_lat?: number | null
          map_lng?: number | null
          nid_number?: string | null
          trade_license?: string | null
          trade_license_url?: string | null
          verification_docs?: Json | null
          bank_account?: string | null
          bkash_number?: string | null
          nagad_number?: string | null
          booking_rules?: string | null
          cancellation_policy?: string | null
          profile_completion?: number | null
          is_booking_ready?: boolean | null
          username?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          status?: string | null
          total_bookings?: number | null
          type?: string | null
          is_active?: boolean | null
          opening_hours?: Json | null
          website?: string | null
          gallery_urls?: Json | null
          logo_url?: string | null
          cover_url?: string | null
          full_address?: string | null
          map_lat?: number | null
          map_lng?: number | null
          nid_number?: string | null
          trade_license?: string | null
          trade_license_url?: string | null
          verification_docs?: Json | null
          bank_account?: string | null
          bkash_number?: string | null
          nagad_number?: string | null
          booking_rules?: string | null
          cancellation_policy?: string | null
          profile_completion?: number | null
          is_booking_ready?: boolean | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parlours_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string | null
          customer_name: string | null
          id: string
          seller_name: string | null
          status: string | null
          transaction_id: string | null
          type: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          customer_name?: string | null
          id?: string
          seller_name?: string | null
          status?: string | null
          transaction_id?: string | null
          type?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          customer_name?: string | null
          id?: string
          seller_name?: string | null
          status?: string | null
          transaction_id?: string | null
          type?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          seller_id: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          seller_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          seller_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          rating: number | null
          seller_id: string | null
          stock: number | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price?: number
          rating?: number | null
          seller_id?: string | null
          stock?: number | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          rating?: number | null
          seller_id?: string | null
          stock?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          discount_type: "percentage" | "flat"
          discount_value: number
          min_order_amount: number
          max_uses: number | null
          current_uses: number
          valid_from: string
          valid_until: string | null
          is_active: boolean
          applies_to: "all" | "products" | "bookings"
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: "percentage" | "flat"
          discount_value: number
          min_order_amount?: number
          max_uses?: number | null
          current_uses?: number
          valid_from?: string
          valid_until?: string | null
          is_active?: boolean
          applies_to?: "all" | "products" | "bookings"
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: "percentage" | "flat"
          discount_value?: number
          min_order_amount?: number
          max_uses?: number | null
          current_uses?: number
          valid_from?: string
          valid_until?: string | null
          is_active?: boolean
          applies_to?: "all" | "products" | "bookings"
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          id: string
          product_id: string | null
          rating: number | null
          seller_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          seller_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          seller_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          standardPriceRange: string | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          standardPriceRange?: string | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          standardPriceRange?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          discount: number | null
          duration: string | null
          gender: string | null
          id: string
          image: string | null
          is_active: boolean | null
          name: string
          parlour_id: string | null
          price: number
          seller_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount?: number | null
          duration?: string | null
          gender?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          name: string
          parlour_id?: string | null
          price: number
          seller_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount?: number | null
          duration?: string | null
          gender?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          name?: string
          parlour_id?: string | null
          price?: number
          seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_parlour_id_fkey"
            columns: ["parlour_id"]
            isOneToOne: false
            referencedRelation: "parlours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          address_line: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          is_default: boolean | null
          label: string | null
          user_id: string | null
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          user_id?: string | null
        }
        Update: {
          address_line?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          display_name: string | null
          dob: string | null
          email: string | null
          gender: string | null
          id: string
          location: string | null
          phone: string | null
          preferences: Json | null
          reward_points: number
          role: string
          status: string | null
          updated_at: string
          avatar_url: string | null
          preferred_language: string | null
          beauty_preferences: Json | null
          favorite_services: string[] | null
          emergency_contact: Json | null
          email_notifications: boolean | null
          sms_notifications: boolean | null
          profile_completion: number | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          dob?: string | null
          email?: string | null
          gender?: string | null
          id: string
          location?: string | null
          phone?: string | null
          preferences?: Json | null
          reward_points?: number
          role?: string
          status?: string | null
          updated_at?: string
          avatar_url?: string | null
          preferred_language?: string | null
          beauty_preferences?: Json | null
          favorite_services?: string[] | null
          emergency_contact?: Json | null
          email_notifications?: boolean | null
          sms_notifications?: boolean | null
          profile_completion?: number | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          dob?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          preferences?: Json | null
          reward_points?: number
          role?: string
          status?: string | null
          updated_at?: string
          avatar_url?: string | null
          preferred_language?: string | null
          beauty_preferences?: Json | null
          favorite_services?: string[] | null
          emergency_contact?: Json | null
          email_notifications?: boolean | null
          sms_notifications?: boolean | null
          profile_completion?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
