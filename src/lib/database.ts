export type ProfileRole = 'user' | 'admin'

export type Profile = {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string | null
  role: ProfileRole
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile & { updated_at: string }
        Insert: {
          id: string
          email: string
          username: string
          full_name: string
          role?: ProfileRole
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          full_name?: string
          role?: ProfileRole
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_username_available: {
        Args: { candidate: string }
        Returns: boolean
      }
      email_for_login: {
        Args: { login_name: string }
        Returns: string
      }
      admin_update_profile: {
        Args: {
          target_id: string
          new_full_name: string
          new_email: string
          new_role: string
        }
        Returns: undefined
      }
    }
  }
}
