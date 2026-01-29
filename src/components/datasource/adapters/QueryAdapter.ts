import { supabase } from "@/integrations/supabase/client";
import type { FieldInfo, DataRecord, DataSourceResult } from "./EntityAdapter";
import { E_FieldDataType } from "@/components/entities/FieldEditor";

export const fetchQueryData = async (queryId: string): Promise<DataSourceResult> => {
  // Execute query via edge function
  const { data, error: funcError } = await supabase.functions.invoke('execute-query', {
    body: { queryId }
  });

  if (funcError) {
    throw new Error(`Failed to execute query: ${funcError.message}`);
  }

  if (!data.success) {
    throw new Error(data.error || "Failed to execute query");
  }

  const results = data.data || [];
  const settings = data.settings || {};

  // Extract fields from first result or from query settings
  let fields: FieldInfo[] = [];

  if (results.length > 0) {
    // Infer fields from result structure
    const firstResult = results[0];
    fields = Object.keys(firstResult).map((key, index) => ({
      id: `field-${index}`,
      name: key,
      display_name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      field_type: inferFieldType(firstResult[key]),
    }));
  } else if (settings.selected_fields) {
    // Use fields from query settings if available
    fields = settings.selected_fields.map((field: any, index: number) => ({
      id: `field-${index}`,
      name: field.name || field.field_name || `field_${index}`,
      display_name: field.display_name || field.name || field.field_name || `Field ${index + 1}`,
      field_type: inferFieldType(null),
    }));
  }

  // Transform results to DataRecord format
  const dataRecords: DataRecord[] = results.map((row: any, index: number) => ({
    id: row.id || `record-${index}`,
    data: row,
    is_published: true,
    created_at: row.created_at || new Date().toISOString(),
  }));

  return { data: dataRecords, fields };
};

function inferFieldType(value: any): E_FieldDataType {
  if (value === null || value === undefined) return E_FieldDataType.String;

  if (typeof value === 'boolean') return E_FieldDataType.Boolean;
  if (typeof value === 'number') {
    return Number.isInteger(value) ? E_FieldDataType.Interger : E_FieldDataType.Decimal;
  }
  if (typeof value === 'string') {
    // Check if it's a date
    if (/^\d{4}-\d{2}-\d{2}/.test(value) || !isNaN(Date.parse(value))) {
      return E_FieldDataType.Date;
    }
    // Check if it's a URL
    if (/^https?:\/\//.test(value)) {
      // Check if it's an image URL
      if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value)) {
        return E_FieldDataType.Image;
      }
      return E_FieldDataType.String;
    }
    // Check if it's long text
    if (value.length > 100) {
      return E_FieldDataType.TextArea;
    }
    return E_FieldDataType.String;
  }

  return E_FieldDataType.String;
}

