import { supabase } from "@/integrations/supabase/client";
import type { FieldInfo, DataRecord, DataSourceResult } from "./EntityAdapter";
import { E_FieldDataType } from "@/components/entities/FieldEditor";

export const fetchApiData = async (requestId: string): Promise<DataSourceResult> => {
  // Execute API request via edge function
  const { data, error: funcError } = await supabase.functions.invoke('execute-api-request', {
    body: { requestId }
  });

  if (funcError) {
    throw new Error(`Failed to execute API request: ${funcError.message}`);
  }

  if (!data.success) {
    throw new Error(data.error || "Failed to execute API request");
  }

  // Parse response body
  let responseData: any = data.body;

  // Handle different response formats
  if (typeof responseData === 'string') {
    try {
      responseData = JSON.parse(responseData);
    } catch {
      throw new Error("API response is not valid JSON");
    }
  }

  // Handle different response structures
  let records: any[] = [];

  if (Array.isArray(responseData)) {
    records = responseData;
  } else if (responseData && typeof responseData === 'object') {
    // Check common patterns
    if (Array.isArray(responseData.data)) {
      records = responseData.data;
    } else if (Array.isArray(responseData.results)) {
      records = responseData.results;
    } else if (Array.isArray(responseData.items)) {
      records = responseData.items;
    } else if (Array.isArray(responseData.records)) {
      records = responseData.records;
    } else {
      // Single object - wrap in array
      records = [responseData];
    }
  }

  // Extract fields from first record
  let fields: FieldInfo[] = [];

  if (records.length > 0) {
    const firstRecord = records[0];
    fields = Object.keys(firstRecord).map((key, index) => ({
      id: `field-${index}`,
      name: key,
      display_name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      field_type: inferFieldType(firstRecord[key]),
    }));
  }

  // Transform to DataRecord format
  const dataRecords: DataRecord[] = records.map((record: any, index: number) => ({
    id: record.id || record._id || `api-record-${index}`,
    data: record,
    is_published: true,
    created_at: record.created_at || record.createdAt || new Date().toISOString(),
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
      return E_FieldDataType.String; // No specific URL type in enum, fallback to String or check if you want HTMLEditor
    }

    // Check if it's long text
    if (value.length > 100) {
      return E_FieldDataType.TextArea;
    }
    return E_FieldDataType.String;
  }

  return E_FieldDataType.String;
}

