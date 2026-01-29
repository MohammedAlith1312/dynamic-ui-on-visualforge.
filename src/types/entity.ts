import { E_FieldDataType } from "@/components/entities/FieldEditor";

export interface Entity {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    icon?: string | null;
    is_published: boolean;
    created_at?: string;
    dataAreaId?: string;
    recId?: number;
    collectionId?: string;
}

export interface EntityRecord {
    id: string;
    data: any;
    is_published: boolean | null;
    created_at: string | null;
    entity_id?: string;
    user_id?: string;
    updated_at?: string | null;
}

export interface EntityField {
    id: string;
    name: string;
    display_name: string;
    field_type: E_FieldDataType;
    is_required?: boolean;
    default_value?: any;
    position?: number;
}
