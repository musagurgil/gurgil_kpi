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
      calendar_activities: {
        Row: {
          category_id: string | null
          category_key: string | null
          created_at: string | null
          date: string
          description: string | null
          duration: number
          end_time: string | null
          id: string
          start_time: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          category_key?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          duration: number
          end_time?: string | null
          id?: string
          start_time?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          category_key?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          duration?: number
          end_time?: string | null
          id?: string
          start_time?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_activities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "calendar_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_categories: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      kpi_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          kpi_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          kpi_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          kpi_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_assignments_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          kpi_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          kpi_id: string
          user_id: string
          user_name: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          kpi_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_comments_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_progress: {
        Row: {
          id: string
          kpi_id: string
          note: string | null
          recorded_at: string | null
          recorded_by: string
          user_id: string
          value: number
        }
        Insert: {
          id?: string
          kpi_id: string
          note?: string | null
          recorded_at?: string | null
          recorded_by: string
          user_id: string
          value: number
        }
        Update: {
          id?: string
          kpi_id?: string
          note?: string | null
          recorded_at?: string | null
          recorded_by?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_progress_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_targets: {
        Row: {
          created_at: string | null
          created_by: string
          current_value: number | null
          department: string
          description: string | null
          end_date: string
          id: string
          period: Database["public"]["Enums"]["kpi_period"]
          priority: Database["public"]["Enums"]["kpi_priority"]
          start_date: string
          status: Database["public"]["Enums"]["kpi_status"] | null
          target_value: number
          title: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_value?: number | null
          department: string
          description?: string | null
          end_date: string
          id?: string
          period: Database["public"]["Enums"]["kpi_period"]
          priority: Database["public"]["Enums"]["kpi_priority"]
          start_date: string
          status?: Database["public"]["Enums"]["kpi_status"] | null
          target_value: number
          title: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_value?: number | null
          department?: string
          description?: string | null
          end_date?: string
          id?: string
          period?: Database["public"]["Enums"]["kpi_period"]
          priority?: Database["public"]["Enums"]["kpi_priority"]
          start_date?: string
          status?: Database["public"]["Enums"]["kpi_status"] | null
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_targets_department_fkey"
            columns: ["department"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["name"]
          },
        ]
      }
      notifications: {
        Row: {
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["notification_priority"]
          title: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["notification_category"]
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          metadata?: Json | null
          priority: Database["public"]["Enums"]["notification_priority"]
          title: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          department: string
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          last_name: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          department: string
          email: string
          first_name: string
          id: string
          is_active?: boolean | null
          last_login?: string | null
          last_name: string
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          department?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_fkey"
            columns: ["department"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["name"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          author_id: string
          author_name: string
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string
        }
        Insert: {
          author_id: string
          author_name: string
          content: string
          created_at?: string | null
          id: string
          is_internal?: boolean | null
          ticket_id: string
        }
        Update: {
          author_id?: string
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          created_at: string | null
          created_by: string
          created_by_email: string | null
          created_by_name: string | null
          description: string
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          source_department: string
          status: Database["public"]["Enums"]["ticket_status"] | null
          target_department: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by: string
          created_by_email?: string | null
          created_by_name?: string | null
          description: string
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          source_department: string
          status?: Database["public"]["Enums"]["ticket_status"] | null
          target_department: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string
          created_by_email?: string | null
          created_by_name?: string | null
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          source_department?: string
          status?: Database["public"]["Enums"]["ticket_status"] | null
          target_department?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_source_department_fkey"
            columns: ["source_department"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "tickets_target_department_fkey"
            columns: ["target_department"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["name"]
          },
        ]
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
      app_role: "admin" | "department_manager" | "employee"
      kpi_period: "monthly" | "quarterly" | "yearly"
      kpi_priority: "low" | "medium" | "high" | "critical"
      kpi_status: "active" | "completed" | "paused" | "cancelled"
      notification_category: "kpi" | "ticket" | "calendar" | "system" | "user"
      notification_priority: "low" | "medium" | "high" | "critical"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
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
      app_role: ["admin", "department_manager", "employee"],
      kpi_period: ["monthly", "quarterly", "yearly"],
      kpi_priority: ["low", "medium", "high", "critical"],
      kpi_status: ["active", "completed", "paused", "cancelled"],
      notification_category: ["kpi", "ticket", "calendar", "system", "user"],
      notification_priority: ["low", "medium", "high", "critical"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
    },
  },
} as const
