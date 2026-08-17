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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      empresas: {
        Row: {
          cancelado_em: string | null
          ciclo_cobranca: string
          created_at: string
          data_vencimento: string | null
          email_empresa: string | null
          gestor_id: string | null
          hash_secreto: string
          id: string
          link_asaas: string | null
          link_google: string | null
          modelo_sugestao: string | null
          nome_exibicao: string
          periodo_teste_ate: string | null
          plano_assinatura: string
          slug: string
          status_assinatura: boolean
          status_cobranca: string
          valor_assinatura: number | null
          whatsapp_empresa: string | null
        }
        Insert: {
          cancelado_em?: string | null
          ciclo_cobranca?: string
          created_at?: string
          data_vencimento?: string | null
          email_empresa?: string | null
          gestor_id?: string | null
          hash_secreto: string
          id?: string
          link_asaas?: string | null
          link_google?: string | null
          modelo_sugestao?: string | null
          nome_exibicao: string
          periodo_teste_ate?: string | null
          plano_assinatura?: string
          slug: string
          status_assinatura?: boolean
          status_cobranca?: string
          valor_assinatura?: number | null
          whatsapp_empresa?: string | null
        }
        Update: {
          cancelado_em?: string | null
          ciclo_cobranca?: string
          created_at?: string
          data_vencimento?: string | null
          email_empresa?: string | null
          gestor_id?: string | null
          hash_secreto?: string
          id?: string
          link_asaas?: string | null
          link_google?: string | null
          modelo_sugestao?: string | null
          nome_exibicao?: string
          periodo_teste_ate?: string | null
          plano_assinatura?: string
          slug?: string
          status_assinatura?: boolean
          status_cobranca?: string
          valor_assinatura?: number | null
          whatsapp_empresa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "gestores"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          comentario: string | null
          created_at: string
          email_cliente: string | null
          empresa_id: string
          id: string
          nome_cliente: string | null
          nota: number
          solicitou_retorno: boolean
          telefone_cliente: string | null
          tipo_envio: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          email_cliente?: string | null
          empresa_id: string
          id?: string
          nome_cliente?: string | null
          nota: number
          solicitou_retorno?: boolean
          telefone_cliente?: string | null
          tipo_envio?: string
        }
        Update: {
          comentario?: string | null
          created_at?: string
          email_cliente?: string | null
          empresa_id?: string
          id?: string
          nome_cliente?: string | null
          nota?: number
          solicitou_retorno?: boolean
          telefone_cliente?: string | null
          tipo_envio?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      gestores: {
        Row: {
          created_at: string
          email: string | null
          hash_acesso: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          hash_acesso: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          email?: string | null
          hash_acesso?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      leads_teste: {
        Row: {
          created_at: string
          id: string
          link_avaliacao: string | null
          nome_empresa: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_avaliacao?: string | null
          nome_empresa: string
        }
        Update: {
          created_at?: string
          id?: string
          link_avaliacao?: string | null
          nome_empresa?: string
        }
        Relationships: []
      }
      perfis: {
        Row: {
          created_at: string
          empresa_id: string | null
          gestor_id: string | null
          id: string
          nome_exibicao: string | null
          papel: Database["public"]["Enums"]["papel_sia"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa_id?: string | null
          gestor_id?: string | null
          id: string
          nome_exibicao?: string | null
          papel?: Database["public"]["Enums"]["papel_sia"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string | null
          gestor_id?: string | null
          id?: string
          nome_exibicao?: string | null
          papel?: Database["public"]["Enums"]["papel_sia"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfis_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "gestores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      empresas_publicas: {
        Row: {
          email_empresa: string | null
          link_google: string | null
          modelo_sugestao: string | null
          nome_exibicao: string | null
          slug: string | null
          status_assinatura: boolean | null
          whatsapp_empresa: string | null
        }
        Insert: {
          email_empresa?: string | null
          link_google?: string | null
          modelo_sugestao?: string | null
          nome_exibicao?: string | null
          slug?: string | null
          status_assinatura?: boolean | null
          whatsapp_empresa?: string | null
        }
        Update: {
          email_empresa?: string | null
          link_google?: string | null
          modelo_sugestao?: string | null
          nome_exibicao?: string | null
          slug?: string | null
          status_assinatura?: boolean | null
          whatsapp_empresa?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      atribuir_acesso: {
        Args: {
          p_empresa_id?: string
          p_gestor_id?: string
          p_nome_exibicao?: string
          p_papel: Database["public"]["Enums"]["papel_sia"]
          p_usuario_id: string
        }
        Returns: undefined
      }
      designar_primeiro_administrador: {
        Args: { p_email: string }
        Returns: undefined
      }
      eh_administrador: { Args: never; Returns: boolean }
      empresa_atual_id: { Args: never; Returns: string }
      gestor_atual_id: { Args: never; Returns: string }
      papel_atual: {
        Args: never
        Returns: Database["public"]["Enums"]["papel_sia"]
      }
      registrar_feedback_publico: {
        Args: {
          p_comentario?: string
          p_email_cliente?: string
          p_nome_cliente?: string
          p_nota: number
          p_slug: string
          p_solicitou_retorno?: boolean
          p_telefone_cliente?: string
          p_tipo_envio?: string
        }
        Returns: string
      }
    }
    Enums: {
      papel_sia: "administrador" | "gestor" | "empresa"
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
      papel_sia: ["administrador", "gestor", "empresa"],
    },
  },
} as const
