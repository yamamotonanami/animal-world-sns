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
      users: {
        Row: {
          id: string
          clerk_id: string
          nickname: string | null
          animal_type_id: string | null
          current_title_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          nickname?: string | null
          animal_type_id?: string | null
          current_title_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          nickname?: string | null
          animal_type_id?: string | null
          current_title_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          original_content: string
          translated_content: string
          space_type: 'town' | 'forest' | 'lake'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_content: string
          translated_content: string
          space_type: 'town' | 'forest' | 'lake'
          created_at?: string
        }
      }
      reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          type: 'tail' | 'groom' | 'stretch'
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          type: 'tail' | 'groom' | 'stretch'
          created_at?: string
        }
      }
      animal_types: {
        Row: {
          id: string
          name: string
          sub_type: string | null
          is_premium: boolean
        }
      }
      titles: {
        Row: {
          id: string
          name: string
          category: string | null
          unlock_condition: string | null
        }
      }
    }
  }
}
