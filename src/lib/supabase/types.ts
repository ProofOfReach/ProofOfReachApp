export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          email: string | null
          nostr_pubkey: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          is_admin: boolean
          is_advertiser: boolean
          is_publisher: boolean
          is_viewer: boolean
          is_stakeholder: boolean
        }
        Insert: {
          id?: string
          email?: string | null
          nostr_pubkey?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
          is_advertiser?: boolean
          is_publisher?: boolean
          is_viewer?: boolean
          is_stakeholder?: boolean
        }
        Update: {
          id?: string
          email?: string | null
          nostr_pubkey?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
          is_advertiser?: boolean
          is_publisher?: boolean
          is_viewer?: boolean
          is_stakeholder?: boolean
        }
      }
      UserRole: {
        Row: {
          id: string
          user_id: string
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}