import { supabase } from "@/integrations/supabase/client";
import { getEntity, getFields } from "@/lib/schema-service";
import { E_FieldDataType } from "@/components/entities/FieldEditor";

export interface FieldInfo {
  id: string;
  name: string;
  display_name: string;
  field_type: E_FieldDataType;
}

export interface DataRecord {
  id: string;
  data: Record<string, any>;
  is_published?: boolean;
  created_at?: string;
}

export interface DataSourceResult {
  data: DataRecord[];
  fields: FieldInfo[];
}

export const fetchEntityData = async (entityId: string): Promise<DataSourceResult> => {
  // Load schema from JSON instead of Supabase
  const entityData = await getEntity(entityId);
  const fieldsData = await getFields(entityId);

  if (!entityData) {
    throw new Error(`Failed to load entity: Entity not found in schema`);
  }

  // Load actual records from Supabase
  const { data: recordsRes, error: recordsError } = await supabase
    .from("entity_records")
    .select("*")
    .eq("entity_id", entityId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (recordsError) {
    throw new Error(`Failed to load records: ${recordsError.message}`);
  }

  const fields = (fieldsData || []).map(field => ({
    id: field.id,
    name: field.name,
    display_name: field.display_name,
    field_type: field.field_type as E_FieldDataType,
  }));

  const data = (recordsRes || []).map(record => ({
    id: record.id,
    data: record.data as Record<string, any>,
    is_published: record.is_published || undefined,
    created_at: record.created_at || undefined,
  }));

  return { data, fields };
};

