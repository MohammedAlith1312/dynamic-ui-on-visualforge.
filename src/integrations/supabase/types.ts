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
      api_collections: {
        Row: {
          base_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_folders: {
        Row: {
          collection_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_folder_id: string | null
          position: number
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_folder_id?: string | null
          position?: number
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_folder_id?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_folders_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "api_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "api_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      api_request_history: {
        Row: {
          error_message: string | null
          executed_at: string | null
          id: string
          request_id: string
          response_body: string | null
          response_headers: Json | null
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          error_message?: string | null
          executed_at?: string | null
          id?: string
          request_id: string
          response_body?: string | null
          response_headers?: Json | null
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          error_message?: string | null
          executed_at?: string | null
          id?: string
          request_id?: string
          response_body?: string | null
          response_headers?: Json | null
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_request_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "api_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      api_requests: {
        Row: {
          auth_config: Json | null
          auth_type: string | null
          body_content: string | null
          body_type: string | null
          collection_id: string
          created_at: string | null
          description: string | null
          folder_id: string | null
          headers: Json | null
          id: string
          method: string
          name: string
          position: number
          query_params: Json | null
          updated_at: string | null
          url: string
        }
        Insert: {
          auth_config?: Json | null
          auth_type?: string | null
          body_content?: string | null
          body_type?: string | null
          collection_id: string
          created_at?: string | null
          description?: string | null
          folder_id?: string | null
          headers?: Json | null
          id?: string
          method: string
          name: string
          position?: number
          query_params?: Json | null
          updated_at?: string | null
          url: string
        }
        Update: {
          auth_config?: Json | null
          auth_type?: string | null
          body_content?: string | null
          body_type?: string | null
          collection_id?: string
          created_at?: string | null
          description?: string | null
          folder_id?: string | null
          headers?: Json | null
          id?: string
          method?: string
          name?: string
          position?: number
          query_params?: Json | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "api_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_requests_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "api_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_published: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      entity_fields: {
        Row: {
          created_at: string | null
          default_value: string | null
          display_name: string
          entity_id: string
          field_type: Database["public"]["Enums"]["entity_field_type"]
          id: string
          is_required: boolean | null
          name: string
          position: number | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          display_name: string
          entity_id: string
          field_type: Database["public"]["Enums"]["entity_field_type"]
          id?: string
          is_required?: boolean | null
          name: string
          position?: number | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          display_name?: string
          entity_id?: string
          field_type?: Database["public"]["Enums"]["entity_field_type"]
          id?: string
          is_required?: boolean | null
          name?: string
          position?: number | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_fields_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_records: {
        Row: {
          created_at: string | null
          data: Json
          entity_id: string
          id: string
          is_published: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          entity_id: string
          id?: string
          is_published?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          entity_id?: string
          id?: string
          is_published?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_records_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_views: {
        Row: {
          created_at: string
          entity_id: string
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
          user_id: string
          view_config: Json
        }
        Insert: {
          created_at?: string
          entity_id: string
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          view_config?: Json
        }
        Update: {
          created_at?: string
          entity_id?: string
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          view_config?: Json
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          column_width: string | null
          conditional_logic: Json | null
          created_at: string | null
          default_value: string | null
          field_name: string
          field_type: string
          form_id: string
          help_text: string | null
          id: string
          is_required: boolean | null
          is_visible: boolean | null
          label: string
          options: Json | null
          placeholder: string | null
          position: number
          section_id: string | null
          validation_rules: Json | null
        }
        Insert: {
          column_width?: string | null
          conditional_logic?: Json | null
          created_at?: string | null
          default_value?: string | null
          field_name: string
          field_type: string
          form_id: string
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          is_visible?: boolean | null
          label: string
          options?: Json | null
          placeholder?: string | null
          position?: number
          section_id?: string | null
          validation_rules?: Json | null
        }
        Update: {
          column_width?: string | null
          conditional_logic?: Json | null
          created_at?: string | null
          default_value?: string | null
          field_name?: string
          field_type?: string
          form_id?: string
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          is_visible?: boolean | null
          label?: string
          options?: Json | null
          placeholder?: string | null
          position?: number
          section_id?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_fields_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "form_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      form_sections: {
        Row: {
          conditional_logic: Json | null
          created_at: string | null
          description: string | null
          form_id: string
          id: string
          is_visible: boolean | null
          name: string
          parent_section_id: string | null
          position: number
          section_type: string
          title: string
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string | null
          description?: string | null
          form_id: string
          id?: string
          is_visible?: boolean | null
          name: string
          parent_section_id?: string | null
          position?: number
          section_type: string
          title: string
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string | null
          description?: string | null
          form_id?: string
          id?: string
          is_visible?: boolean | null
          name?: string
          parent_section_id?: string | null
          position?: number
          section_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_sections_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_sections_parent_section_id_fkey"
            columns: ["parent_section_id"]
            isOneToOne: false
            referencedRelation: "form_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          data: Json
          form_id: string
          id: string
          ip_address: string | null
          submitted_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          data?: Json
          form_id: string
          id?: string
          ip_address?: string | null
          submitted_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          data?: Json
          form_id?: string
          id?: string
          ip_address?: string | null
          submitted_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json
        }
        Relationships: []
      }
      forms: {
        Row: {
          allow_multiple_submissions: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          redirect_url: string | null
          require_authentication: boolean | null
          submit_button_text: string | null
          success_message: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_multiple_submissions?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          redirect_url?: string | null
          require_authentication?: boolean | null
          submit_button_text?: string | null
          success_message?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_multiple_submissions?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          redirect_url?: string | null
          require_authentication?: boolean | null
          submit_button_text?: string | null
          success_message?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      layout_components: {
        Row: {
          column_index: number
          component_type: string
          content: Json
          created_at: string
          id: string
          layout_id: string
          position: number
          row_id: string | null
          styles: Json | null
          updated_at: string
        }
        Insert: {
          column_index?: number
          component_type: string
          content?: Json
          created_at?: string
          id?: string
          layout_id: string
          position?: number
          row_id?: string | null
          styles?: Json | null
          updated_at?: string
        }
        Update: {
          column_index?: number
          component_type?: string
          content?: Json
          created_at?: string
          id?: string
          layout_id?: string
          position?: number
          row_id?: string | null
          styles?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "layout_components_layout_id_fkey"
            columns: ["layout_id"]
            isOneToOne: false
            referencedRelation: "layouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "layout_components_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "layout_rows"
            referencedColumns: ["id"]
          },
        ]
      }
      layout_rows: {
        Row: {
          column_widths: Json | null
          columns: number
          created_at: string
          id: string
          layout_id: string
          position: number
          responsive_config: Json | null
          styles: Json | null
          updated_at: string
        }
        Insert: {
          column_widths?: Json | null
          columns?: number
          created_at?: string
          id?: string
          layout_id: string
          position?: number
          responsive_config?: Json | null
          styles?: Json | null
          updated_at?: string
        }
        Update: {
          column_widths?: Json | null
          columns?: number
          created_at?: string
          id?: string
          layout_id?: string
          position?: number
          responsive_config?: Json | null
          styles?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "layout_rows_layout_id_fkey"
            columns: ["layout_id"]
            isOneToOne: false
            referencedRelation: "layouts"
            referencedColumns: ["id"]
          },
        ]
      }
      layouts: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_components: {
        Row: {
          column_index: number
          component_type: string
          content: Json
          created_at: string
          id: string
          is_widget_instance: boolean
          page_id: string
          position: number
          row_id: string | null
          styles: Json | null
          updated_at: string
          widget_id: string | null
        }
        Insert: {
          column_index?: number
          component_type: string
          content?: Json
          created_at?: string
          id?: string
          is_widget_instance?: boolean
          page_id: string
          position?: number
          row_id?: string | null
          styles?: Json | null
          updated_at?: string
          widget_id?: string | null
        }
        Update: {
          column_index?: number
          component_type?: string
          content?: Json
          created_at?: string
          id?: string
          is_widget_instance?: boolean
          page_id?: string
          position?: number
          row_id?: string | null
          styles?: Json | null
          updated_at?: string
          widget_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_components_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_components_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "page_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_components_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      page_rows: {
        Row: {
          column_widths: Json | null
          columns: number
          created_at: string
          id: string
          page_id: string
          position: number
          responsive_config: Json | null
          styles: Json | null
          updated_at: string
        }
        Insert: {
          column_widths?: Json | null
          columns?: number
          created_at?: string
          id?: string
          page_id: string
          position?: number
          responsive_config?: Json | null
          styles?: Json | null
          updated_at?: string
        }
        Update: {
          column_widths?: Json | null
          columns?: number
          created_at?: string
          id?: string
          page_id?: string
          position?: number
          responsive_config?: Json | null
          styles?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_rows_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          layout_id: string | null
          menu_order: number
          slug: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          layout_id?: string | null
          menu_order?: number
          slug: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          layout_id?: string | null
          menu_order?: number
          slug?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_layout_id_fkey"
            columns: ["layout_id"]
            isOneToOne: false
            referencedRelation: "layouts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      queries: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_published: boolean | null
          name: string
          query_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_published?: boolean | null
          name: string
          query_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_published?: boolean | null
          name?: string
          query_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      query_conditions: {
        Row: {
          created_at: string | null
          entity_id: string | null
          field_name: string | null
          id: string
          is_group: boolean | null
          logic: string | null
          operator: string | null
          parent_condition_id: string | null
          position: number
          query_id: string
          value: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          field_name?: string | null
          id?: string
          is_group?: boolean | null
          logic?: string | null
          operator?: string | null
          parent_condition_id?: string | null
          position?: number
          query_id: string
          value?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          field_name?: string | null
          id?: string
          is_group?: boolean | null
          logic?: string | null
          operator?: string | null
          parent_condition_id?: string | null
          position?: number
          query_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "query_conditions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_conditions_parent_condition_id_fkey"
            columns: ["parent_condition_id"]
            isOneToOne: false
            referencedRelation: "query_conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_conditions_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
        ]
      }
      query_fields: {
        Row: {
          aggregation: string | null
          created_at: string | null
          entity_id: string
          field_name: string
          id: string
          position: number
          query_id: string
        }
        Insert: {
          aggregation?: string | null
          created_at?: string | null
          entity_id: string
          field_name: string
          id?: string
          position?: number
          query_id: string
        }
        Update: {
          aggregation?: string | null
          created_at?: string | null
          entity_id?: string
          field_name?: string
          id?: string
          position?: number
          query_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "query_fields_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_fields_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
        ]
      }
      query_join_conditions: {
        Row: {
          created_at: string | null
          id: string
          join_id: string
          logic: string | null
          position: number
          primary_field: string
          target_field: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          join_id: string
          logic?: string | null
          position?: number
          primary_field: string
          target_field: string
        }
        Update: {
          created_at?: string | null
          id?: string
          join_id?: string
          logic?: string | null
          position?: number
          primary_field?: string
          target_field?: string
        }
        Relationships: [
          {
            foreignKeyName: "query_join_conditions_join_id_fkey"
            columns: ["join_id"]
            isOneToOne: false
            referencedRelation: "query_joins"
            referencedColumns: ["id"]
          },
        ]
      }
      query_joins: {
        Row: {
          created_at: string | null
          id: string
          is_group: boolean | null
          join_type: string | null
          parent_join_id: string | null
          position: number
          primary_field: string | null
          query_id: string
          target_entity_id: string | null
          target_field: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          join_type?: string | null
          parent_join_id?: string | null
          position?: number
          primary_field?: string | null
          query_id: string
          target_entity_id?: string | null
          target_field?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          join_type?: string | null
          parent_join_id?: string | null
          position?: number
          primary_field?: string | null
          query_id?: string
          target_entity_id?: string | null
          target_field?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "query_joins_parent_join_id_fkey"
            columns: ["parent_join_id"]
            isOneToOne: false
            referencedRelation: "query_joins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_joins_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_joins_target_entity_id_fkey"
            columns: ["target_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      query_settings: {
        Row: {
          created_at: string | null
          display_style: string | null
          group_by: Json | null
          id: string
          limit_rows: number | null
          primary_entity_id: string
          query_id: string
          show_row_numbers: boolean | null
          sort_entity_id: string | null
          sort_field: string | null
          sort_order: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_style?: string | null
          group_by?: Json | null
          id?: string
          limit_rows?: number | null
          primary_entity_id: string
          query_id: string
          show_row_numbers?: boolean | null
          sort_entity_id?: string | null
          sort_field?: string | null
          sort_order?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_style?: string | null
          group_by?: Json | null
          id?: string
          limit_rows?: number | null
          primary_entity_id?: string
          query_id?: string
          show_row_numbers?: boolean | null
          sort_entity_id?: string | null
          sort_field?: string | null
          sort_order?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "query_settings_primary_entity_id_fkey"
            columns: ["primary_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_settings_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: true
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_settings_sort_entity_id_fkey"
            columns: ["sort_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      section_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json
          thumbnail_url: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data: Json
          thumbnail_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "section_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_components: {
        Row: {
          column_index: number
          component_type: string
          content: Json
          created_at: string
          id: string
          position: number
          row_id: string | null
          styles: Json | null
          updated_at: string
          widget_id: string
        }
        Insert: {
          column_index?: number
          component_type: string
          content?: Json
          created_at?: string
          id?: string
          position?: number
          row_id?: string | null
          styles?: Json | null
          updated_at?: string
          widget_id: string
        }
        Update: {
          column_index?: number
          component_type?: string
          content?: Json
          created_at?: string
          id?: string
          position?: number
          row_id?: string | null
          styles?: Json | null
          updated_at?: string
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_components_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "widget_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "widget_components_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_rows: {
        Row: {
          column_widths: Json | null
          columns: number
          created_at: string
          id: string
          position: number
          responsive_config: Json | null
          styles: Json | null
          updated_at: string
          widget_id: string
        }
        Insert: {
          column_widths?: Json | null
          columns?: number
          created_at?: string
          id?: string
          position?: number
          responsive_config?: Json | null
          styles?: Json | null
          updated_at?: string
          widget_id: string
        }
        Update: {
          column_widths?: Json | null
          columns?: number
          created_at?: string
          id?: string
          position?: number
          responsive_config?: Json | null
          styles?: Json | null
          updated_at?: string
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_rows_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      widgets: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_published: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      entity_field_type:
        | "text"
        | "number"
        | "boolean"
        | "date"
        | "longtext"
        | "image"
        | "url"
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
      entity_field_type: [
        "text",
        "number",
        "boolean",
        "date",
        "longtext",
        "image",
        "url",
      ],
    },
  },
} as const
