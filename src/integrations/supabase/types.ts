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
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["activity_entity_type"]
          id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["activity_entity_type"]
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["activity_entity_type"]
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_reference: string
          client_id: string | null
          confirmation_token: string
          created_at: string
          deposit_amount: number | null
          deposit_paid: boolean | null
          email: string
          event_date: string
          event_types: string[]
          food_required: boolean
          forename: string
          further_details: string | null
          guests: number
          id: string
          late_bar: boolean
          notes: string | null
          package: string | null
          phone: string
          resident_dj: boolean
          room_choice: string
          status: string
          surname: string
          total_amount: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          booking_reference: string
          client_id?: string | null
          confirmation_token?: string
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          email: string
          event_date: string
          event_types: string[]
          food_required?: boolean
          forename: string
          further_details?: string | null
          guests: number
          id?: string
          late_bar?: boolean
          notes?: string | null
          package?: string | null
          phone: string
          resident_dj?: boolean
          room_choice: string
          status?: string
          surname: string
          total_amount?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          booking_reference?: string
          client_id?: string | null
          confirmation_token?: string
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          email?: string
          event_date?: string
          event_types?: string[]
          food_required?: boolean
          forename?: string
          further_details?: string | null
          guests?: number
          id?: string
          late_bar?: boolean
          notes?: string | null
          package?: string | null
          phone?: string
          resident_dj?: boolean
          room_choice?: string
          status?: string
          surname?: string
          total_amount?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          email: string
          forename: string
          id: string
          phone: string
          postcode: string | null
          surname: string
          tags: string[] | null
          total_bookings: number | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          forename: string
          id?: string
          phone: string
          postcode?: string | null
          surname: string
          tags?: string[] | null
          total_bookings?: number | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          forename?: string
          id?: string
          phone?: string
          postcode?: string | null
          surname?: string
          tags?: string[] | null
          total_bookings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          pay_rate: number | null
          status: string
          title: string
          updated_at: string
          weekly_hours: number | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          pay_rate?: number | null
          status?: string
          title: string
          updated_at?: string
          weekly_hours?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          pay_rate?: number | null
          status?: string
          title?: string
          updated_at?: string
          weekly_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          employee_id: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          employee_id: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          employee_id?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          bank_details_encrypted: string | null
          created_at: string
          email: string
          employment_status: string
          full_name: string
          id: string
          national_insurance_number: string | null
          phone: string | null
          role: string
          start_date: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          bank_details_encrypted?: string | null
          created_at?: string
          email: string
          employment_status?: string
          full_name: string
          id?: string
          national_insurance_number?: string | null
          phone?: string | null
          role: string
          start_date: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          bank_details_encrypted?: string | null
          created_at?: string
          email?: string
          employment_status?: string
          full_name?: string
          id?: string
          national_insurance_number?: string | null
          phone?: string | null
          role?: string
          start_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          file_url: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          active: boolean | null
          add_on_food_price: number | null
          add_on_late_bar: number | null
          add_on_resident_dj: number | null
          base_price: number
          created_at: string | null
          id: string
          name: string
          package: string | null
          per_guest_price: number | null
          room_choice: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          add_on_food_price?: number | null
          add_on_late_bar?: number | null
          add_on_resident_dj?: number | null
          base_price: number
          created_at?: string | null
          id?: string
          name: string
          package?: string | null
          per_guest_price?: number | null
          room_choice: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          add_on_food_price?: number | null
          add_on_late_bar?: number | null
          add_on_resident_dj?: number | null
          base_price?: number
          created_at?: string | null
          id?: string
          name?: string
          package?: string | null
          per_guest_price?: number | null
          room_choice?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_modules: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          estimated_time: number | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_time?: number | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_time?: number | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          completion_date: string | null
          created_at: string
          employee_id: string
          id: string
          module_id: string
          score: number | null
          status: string
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          employee_id: string
          id?: string
          module_id: string
          score?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          module_id?: string
          score?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wedding_planners: {
        Row: {
          booking_id: string | null
          color_theme: string
          couple_names: string
          created_at: string
          created_by: string | null
          entertainment: Json | null
          font_style: string
          food_options: Json | null
          guests_count: number
          id: string
          kids_meals: string | null
          logo_url: string | null
          public_token: string
          room_decorations: string | null
          schedule: Json | null
          tables_count: number
          updated_at: string
          venue_name: string
          version: number
          wedding_date: string
          welcome_drinks: string | null
        }
        Insert: {
          booking_id?: string | null
          color_theme?: string
          couple_names: string
          created_at?: string
          created_by?: string | null
          entertainment?: Json | null
          font_style?: string
          food_options?: Json | null
          guests_count?: number
          id?: string
          kids_meals?: string | null
          logo_url?: string | null
          public_token?: string
          room_decorations?: string | null
          schedule?: Json | null
          tables_count?: number
          updated_at?: string
          venue_name?: string
          version?: number
          wedding_date: string
          welcome_drinks?: string | null
        }
        Update: {
          booking_id?: string | null
          color_theme?: string
          couple_names?: string
          created_at?: string
          created_by?: string | null
          entertainment?: Json | null
          font_style?: string
          food_options?: Json | null
          guests_count?: number
          id?: string
          kids_meals?: string | null
          logo_url?: string | null
          public_token?: string
          room_decorations?: string | null
          schedule?: Json | null
          tables_count?: number
          updated_at?: string
          venue_name?: string
          version?: number
          wedding_date?: string
          welcome_drinks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wedding_planners_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
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
      activity_entity_type: "booking" | "invoice" | "client" | "payment"
      app_role: "super_admin" | "staff" | "trainer"
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
      activity_entity_type: ["booking", "invoice", "client", "payment"],
      app_role: ["super_admin", "staff", "trainer"],
    },
  },
} as const
