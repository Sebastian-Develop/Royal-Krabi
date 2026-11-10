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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      shop_email_events: {
        Row: {
          created_at: string
          error: string | null
          id: string
          kind: string
          order_id: string
          provider_id: string | null
          provider_status: string | null
          retry_claimed_at: string | null
          success: boolean
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          kind: string
          order_id: string
          provider_id?: string | null
          provider_status?: string | null
          retry_claimed_at?: string | null
          success: boolean
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          order_id?: string
          provider_id?: string | null
          provider_status?: string | null
          retry_claimed_at?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "shop_email_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_kind: string
          product_name: string
          quantity: number
          subtotal_cents: number
          unit_price_cents: number
          validity_months: number | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_kind: string
          product_name: string
          quantity: number
          subtotal_cents: number
          unit_price_cents: number
          validity_months?: number | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_kind?: string
          product_name?: string
          quantity?: number
          subtotal_cents?: number
          unit_price_cents?: number
          validity_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          access_token: string
          city: string
          country: string
          created_at: string
          currency: string
          customer_email_claimed_at: string | null
          delivery: string
          discount_cents: number
          discount_checked_at: string | null
          discount_code: string
          discount_valid: boolean | null
          dispatch: Json | null
          email: string
          full_name: string
          gift_text: string
          id: string
          legal_version: string
          notes: string
          operator_email_claimed_at: string | null
          operator_notified_at: string | null
          order_email_sent_at: string | null
          paid_at: string | null
          paid_email_sent_at: string | null
          phone: string
          postal_code: string
          recipient: string
          status: string
          street: string
          submission_key: string | null
          total_cents: number
        }
        Insert: {
          access_token?: string
          city?: string
          country?: string
          created_at?: string
          currency?: string
          customer_email_claimed_at?: string | null
          delivery: string
          discount_cents?: number
          discount_checked_at?: string | null
          discount_code?: string
          discount_valid?: boolean | null
          dispatch?: Json | null
          email: string
          full_name: string
          gift_text?: string
          id?: string
          legal_version?: string
          notes?: string
          operator_email_claimed_at?: string | null
          operator_notified_at?: string | null
          order_email_sent_at?: string | null
          paid_at?: string | null
          paid_email_sent_at?: string | null
          phone: string
          postal_code?: string
          recipient?: string
          status?: string
          street?: string
          submission_key?: string | null
          total_cents: number
        }
        Update: {
          access_token?: string
          city?: string
          country?: string
          created_at?: string
          currency?: string
          customer_email_claimed_at?: string | null
          delivery?: string
          discount_cents?: number
          discount_checked_at?: string | null
          discount_code?: string
          discount_valid?: boolean | null
          dispatch?: Json | null
          email?: string
          full_name?: string
          gift_text?: string
          id?: string
          legal_version?: string
          notes?: string
          operator_email_claimed_at?: string | null
          operator_notified_at?: string | null
          order_email_sent_at?: string | null
          paid_at?: string | null
          paid_email_sent_at?: string | null
          phone?: string
          postal_code?: string
          recipient?: string
          status?: string
          street?: string
          submission_key?: string | null
          total_cents?: number
        }
        Relationships: []
      }
      shop_payment_attempts: {
        Row: {
          created_at: string
          hosted_checkout_url: string | null
          id: string
          order_id: string
          status: string
          sumup_checkout_id: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          hosted_checkout_url?: string | null
          id?: string
          order_id: string
          status?: string
          sumup_checkout_id?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          hosted_checkout_url?: string | null
          id?: string
          order_id?: string
          status?: string
          sumup_checkout_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_payment_attempts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          declaration: string
          email: string
          email_history: Json
          full_name: string
          handling_status: string
          id: string
          internal_notes: string
          matched_order_id: string | null
          operator_email_claimed_at: string | null
          order_reference: string
          processed_at: string | null
          received_at: string
          remark: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          declaration: string
          email: string
          email_history?: Json
          full_name: string
          handling_status?: string
          id?: string
          internal_notes?: string
          matched_order_id?: string | null
          operator_email_claimed_at?: string | null
          order_reference: string
          processed_at?: string | null
          received_at?: string
          remark?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          declaration?: string
          email?: string
          email_history?: Json
          full_name?: string
          handling_status?: string
          id?: string
          internal_notes?: string
          matched_order_id?: string | null
          operator_email_claimed_at?: string | null
          order_reference?: string
          processed_at?: string | null
          received_at?: string
          remark?: string
          updated_at?: string | null
          updated_by?: string | null
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
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
