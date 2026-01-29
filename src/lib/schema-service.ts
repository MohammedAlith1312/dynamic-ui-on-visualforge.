import { supabase } from "@/integrations/supabase/client";

// Remote API base for testing
const REMOTE_API_BASE = "https://apps4x-framework.azurewebsites.net/api/v1";
// Default DataAreaId for testing
const DEFAULT_DATA_AREA = "LGE0000001";

// API Authentication Constants
export let AUTH_TOKEN = "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiJhLmh5ZGVyIiwiTmFtZSI6Ikh5ZGVyIEFsaSIsIkVtYWlsIjoiaHlkZXJAZmFhenRlY2hzb2x1dGlvbnMuY29tIiwiTW9iaWxlTnVtYmVyIjoiMDk4NzY1NDMyMSIsIkNvbXBhbnlJZCI6IkxHRTAwMDAwMDEiLCJleHAiOjE3NjcwNzIyMTYsImlzcyI6ImFwcHM0eC5jb20iLCJhdWQiOiJhcHBzNHguY29tIn0.b5jc5d6zpx5_mY_fYH3oQS7_4RxMXYZyYNFTUf4Zk8Y";

export const setAuthToken = (token: string) => {
  AUTH_TOKEN = token;
};
const APP_ID = "Studio";
const USER_ID = "a.hyder";
const CLIENT_PAGE = "/LGE0000001/Studio/a530d8d753214ac7beaf6207aacbbd4c";

// Helper to get authenticated headers
const getHeaders = (extraHeaders: Record<string, string> = {}) => ({
  "Accept": "application/json, text/plain, */*",
  "Authorization": `Bearer ${AUTH_TOKEN}`,
  "appid": APP_ID,
  "companyid": DEFAULT_DATA_AREA,
  "user-id": USER_ID,
  "X-Client-Page": CLIENT_PAGE,
  ...extraHeaders
});

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    const res = await fetch(url, options);
    if (res.status === 401) {
      console.error("Unauthorized access (401), signing out...");
      await supabase.auth.signOut();
      window.location.href = "/auth";
      throw new Error("Unauthorized");
    }
    return res;
  } catch (error) {
    throw error;
  }
};

export interface MetaObject {
  Id: string;
  Type: string;
  Name: string;
  Status: string;
  Data: string; // JSON string of EntityData
  DataAreaId?: string;
  RecId?: number;
}

export interface EntityField {
  Id: string;
  Name: string;
  Label: string;
  DataType: string;
  IsRequired?: boolean;
  DefaultValue?: any;
  Position?: number;
  EntityId?: string;
  CollectionId?: string;
}

export interface EntityData {
  EntityId: string;
  CollectionId?: string;
  Name: string;
  Description: string | null;
  TableName: string;
  Fields: EntityField[];
}

// Helper to convert internal format to UI format
const mapEntity = (mo: MetaObject) => {
  try {
    const data: EntityData = JSON.parse(mo.Data);
    return {
      id: mo.Id,
      name: data.TableName,
      display_name: data.Name,
      description: data.Description,
      is_published: mo.Status === "Published",
      dataAreaId: mo.DataAreaId,
      recId: mo.RecId,
      collectionId: data.CollectionId
    };
  } catch (e) {
    console.error("Error parsing entity data:", mo);
    return {
      id: mo.Id,
      name: mo.Name,
      display_name: mo.Name,
      description: "",
      is_published: mo.Status === "Published",
      dataAreaId: mo.DataAreaId,
      recId: mo.RecId,
      collectionId: ""
    };
  }
};

export const getEntities = async () => {
  try {
    const res = await fetchWithAuth(`${REMOTE_API_BASE}/metaobject/${DEFAULT_DATA_AREA}?type=Entity`, {
      headers: getHeaders()
    });
    const data = await res.json();
    // API might return a single object or an array
    const metaobjects = Array.isArray(data.Data) ? data.Data : [data.Data];
    const filterentity = metaobjects.filter((mo: MetaObject) => (mo.RecId ?? 0) >= 709);
    return filterentity.map(mapEntity);
  } catch (error) {
    console.error("Error fetching entities:", error);
    return [];
  }
};

export const getEntity = async (id: string) => {
  try {
    // If id is numeric, it's likely a RecId, otherwise use as is
    // const targetId = id === '9ca55aad170e45b9835adf7e5983161a' ? '709' : id;
    let entity = id.replace(/-/g, "");
    const query = `byobjectId?objectId=${entity}`
    const res = await fetchWithAuth(`${REMOTE_API_BASE}/metaobject/${DEFAULT_DATA_AREA}/${query}`, {
      headers: getHeaders()
    });
    const mo = await res.json();
    return mapEntity(mo);
  } catch (error) {
    console.error(`Error fetching entity ${id}:`, error);
    return null;
  }
};

export const getFields = async (entityId: string) => {
  try {
    let entity = entityId.replace(/-/g, "");
    const query = `byobjectId?objectId=${entity}`
    const res = await fetchWithAuth(`${REMOTE_API_BASE}/metaobject/${DEFAULT_DATA_AREA}/${query}`, {
      headers: getHeaders()
    });
    const mo = await res.json();

    if (!mo) return [];
    const entityData: EntityData = JSON.parse(mo.Data);
    return (entityData.Fields || []).map((f) => ({
      id: f.Id,
      entity_id: entityId,
      name: f.Name,
      display_name: f.Label,
      field_type: f.DataType,
      is_required: f.IsRequired,
      default_value: f.DefaultValue,
      position: f.Position,
    }));
  } catch (error) {
    console.error(`Error fetching fields for entity ${entityId}:`, error);
    return [];
  }
};

export const createEntity = async (entity: { name: string; display_name: string; description?: string }) => {
  try {
    const parentId = "a530d8d753214ac7beaf6207aacbbd4c";
    const appId = "a530d8d753214ac7beaf6207aacbbd4c";
    const connectorId = "eb6e7a03f0ed4e09b259fc2abf4507e2";

    const dataObj = {
      Name: entity.name,
      TableName: entity.name,
      Description: entity.description || entity.display_name,
      Image: null,
      TypeName: entity.name,
      CollectionType: "Single",
      ConnectorId: connectorId,
      Fields: null,
      IsWorkFlow: null,
      AppId: appId
    };

    const payload = {
      Type: "Collection",
      Data: JSON.stringify(dataObj),
      Name: entity.name,
      ParentId: parentId,
      ParentType: "Apps",
      AppId: appId
    };

    const res = await fetchWithAuth(`${REMOTE_API_BASE}/metaobject/${DEFAULT_DATA_AREA}/create`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    return { sucess: true, res: await res.json() }
  } catch (error) {
    console.error("Error creating entity:", error);
    return { success: false, error: "Failed to create entity" };
  }
};

export const updateEntity = async (id: string, updates: any) => {
  try {
    const targetId = id === '9ca55aad170e45b9835adf7e5983161a' ? '709' : id;
    const res = await fetchWithAuth(`${REMOTE_API_BASE}/metaobject/${DEFAULT_DATA_AREA}/${targetId}`, {
      method: 'PUT',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates)
    });
    return { sucess: true, res: await res.json() }
  } catch (error) {
    console.error(`Error updating entity ${id}:`, error);
    return { success: false, error: "Failed to update entity" };
  }
};

export const deleteEntity = async (id: string) => {
  try {
    const targetId = id === '9ca55aad170e45b9835adf7e5983161a' ? '709' : id;
    const res = await fetchWithAuth(`${REMOTE_API_BASE}/metaobject/${DEFAULT_DATA_AREA}/${targetId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  } catch (error) {
    console.error(`Error deleting entity ${id}:`, error);
    return { success: false, error: "Failed to delete entity" };
  }
};

export const saveFields = async (entityId: string, fields: any[], entity: any) => {
  try {
    const collectionId = entity?.collectionId || "6e8ef8e548704cfb90a01c1f597fb264";
    const remoteId = entity?.recId || (entityId === '9ca55aad170e45b9835adf7e5983161a' ? '709' : entityId);

    // Fetch existing fields to identify new ones vs updates
    const existingFields = await getFields(entityId);
    const existingMap = new Map(existingFields.map(f => [f.id, f]));
    const existingNames = new Set(existingFields.map(f => (f.name || "").toLowerCase()));

    const toCreate = [];
    const toUpdate = [];

    for (const f of fields) {
      if (f.id && existingMap.has(f.id)) {
        // Check for changes
        const existing = existingMap.get(f.id);

        if (existing) {
          const hasChanges =
            existing.name !== f.name ||
            existing.display_name !== f.display_name ||
            existing.field_type !== f.field_type ||
            existing.is_required !== f.is_required ||
            existing.default_value !== f.default_value ||
            existing.position !== f.position;

          if (hasChanges) {
            toUpdate.push(f);
          }
        }
      } else {
        // New field: Check name to prevent duplicates if ID is missing/temp
        const fieldName = (f.name || f.Name || "").toLowerCase();
        if (!existingNames.has(fieldName)) {
          toCreate.push(f);
        }
      }
    }

    const toDelete = existingFields.filter(ef => !fields.some(f => f.name === ef.name));

    const results = { success: true, creates: null, updates: null, deletes: null };

    // Handle Updates
    if (toUpdate.length > 0) {
      const updatePayload = toUpdate.map(f => ({
        Id: f.id,
        Label: f.display_name || f.Label,
        Name: f.name || f.Name,
        DataType: f.field_type || f.DataType || "String",
        IsRequired: f.is_required,
        DefaultValue: f.default_value,
        Position: f.position,
        EntityId: entity?.id || entityId,
        CollectionId: collectionId
      }));

      const res = await fetchWithAuth(`${REMOTE_API_BASE}/metaobject/${DEFAULT_DATA_AREA}/${remoteId}/fields/update`, {
        method: 'PUT',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updatePayload)
      });
      results.updates = await res.json();
    }

    // Handle Creates
    if (toCreate.length > 0) {
      // Filter out potential duplicates by name if we want to be extra safe, trying to respect implicit logic
      // But typically we trust the list provided.
      const createPayload = toCreate.map(f => ({
        Label: f.display_name || f.Label,
        Name: f.name || f.Name,
        DataType: f.field_type || f.DataType || "String",
        IsRequired: f.is_required,
        DefaultValue: f.default_value,
        Position: f.position,
        EntityId: entity?.id || entityId,
        CollectionId: collectionId
      }));

      const res = await fetchWithAuth(`${REMOTE_API_BASE}/metaobject/${DEFAULT_DATA_AREA}/${remoteId}/fields/create`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(createPayload)
      });
      results.creates = await res.json();
    }

    // Handle Deletes
    if (toDelete.length > 0) {
      const deletePayload = toDelete.map(f => f.name);

      const res = await fetchWithAuth(`${REMOTE_API_BASE}/metaobject/${DEFAULT_DATA_AREA}/${remoteId}/fields/delete`, {
        method: 'DELETE',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(deletePayload)
      });
      results.deletes = await res.json();
    }

    return { success: true, details: results };
  } catch (error) {
    console.error(`Error saving fields for entity ${entityId}:`, error);
    return { success: false, error: "Failed to save fields" };
  }
};
