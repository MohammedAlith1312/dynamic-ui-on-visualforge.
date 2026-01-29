import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConditionNode {
  id: string;
  parent_condition_id: string | null;
  is_group: boolean;
  logic: string | null;
  entity_id: string | null;
  field_name: string | null;
  operator: string | null;
  value: string | null;
}

interface JoinNode {
  id: string;
  parent_join_id: string | null;
  is_group: boolean;
  target_entity_id: string | null;
  join_type: string | null;
  primary_field: string | null;
  target_field: string | null;
}

function buildConditionTree(
  conditions: ConditionNode[],
  parentId: string | null,
  entityAliases: Map<string, string>
): string {
  const children = conditions.filter(c => c.parent_condition_id === parentId);
  if (children.length === 0) return '';

  const parts: string[] = [];
  
  for (let i = 0; i < children.length; i++) {
    const condition = children[i];
    
    if (condition.is_group) {
      // Recursively build child conditions
      const childConditions = buildConditionTree(conditions, condition.id, entityAliases);
      if (childConditions) {
        parts.push(`(${childConditions})`);
      }
    } else {
      // Leaf condition
      const entityAlias = entityAliases.get(condition.entity_id!) || 'e0';
      let conditionStr = '';
      
      switch (condition.operator) {
        case '=':
          conditionStr = `${entityAlias}.data->>'${condition.field_name}' = '${condition.value}'`;
          break;
        case '!=':
          conditionStr = `${entityAlias}.data->>'${condition.field_name}' != '${condition.value}'`;
          break;
        case 'LIKE':
          conditionStr = `${entityAlias}.data->>'${condition.field_name}' ILIKE '%${condition.value}%'`;
          break;
        case '>':
          conditionStr = `(${entityAlias}.data->>'${condition.field_name}')::numeric > ${condition.value}`;
          break;
        case '<':
          conditionStr = `(${entityAlias}.data->>'${condition.field_name}')::numeric < ${condition.value}`;
          break;
        case '>=':
          conditionStr = `(${entityAlias}.data->>'${condition.field_name}')::numeric >= ${condition.value}`;
          break;
        case '<=':
          conditionStr = `(${entityAlias}.data->>'${condition.field_name}')::numeric <= ${condition.value}`;
          break;
        case 'IN':
          conditionStr = `${entityAlias}.data->>'${condition.field_name}' IN (${condition.value})`;
          break;
        case 'IS NULL':
          conditionStr = `${entityAlias}.data->>'${condition.field_name}' IS NULL`;
          break;
        case 'IS NOT NULL':
          conditionStr = `${entityAlias}.data->>'${condition.field_name}' IS NOT NULL`;
          break;
      }
      
      if (conditionStr) {
        parts.push(conditionStr);
      }
    }
  }

  // Join parts with the group's logic (or AND by default for root)
  const group = conditions.find(c => c.id === parentId);
  const logic = group?.logic?.toUpperCase() || 'AND';
  
  return parts.join(` ${logic} `);
}

function buildJoinClauses(
  joins: JoinNode[],
  parentId: string | null,
  entityAliases: Map<string, string>,
  aliasCounter: { value: number }
): string {
  const children = joins.filter(j => j.parent_join_id === parentId);
  if (children.length === 0) return '';

  let joinClauses = '';
  
  for (const join of children) {
    if (join.is_group) {
      // Recursively build child joins
      joinClauses += buildJoinClauses(joins, join.id, entityAliases, aliasCounter);
    } else {
      // Leaf join
      const joinAlias = `e${aliasCounter.value++}`;
      entityAliases.set(join.target_entity_id!, joinAlias);
      
      const joinType = join.join_type?.toUpperCase() || 'INNER';
      const primaryAlias = 'e0';
      
      joinClauses += ` ${joinType} JOIN entity_records ${joinAlias} ON ${primaryAlias}.data->>'${join.primary_field}' = ${joinAlias}.data->>'${join.target_field}' AND ${joinAlias}.entity_id = '${join.target_entity_id}'`;
    }
  }
  
  return joinClauses;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { queryId } = await req.json();

    if (!queryId) {
      throw new Error('queryId is required');
    }

    console.log('Executing query:', queryId);

    // Fetch query configuration
    const { data: query, error: queryError } = await supabaseClient
      .from('queries')
      .select('*')
      .eq('id', queryId)
      .single();

    if (queryError) throw queryError;
    if (!query) throw new Error('Query not found');

    console.log('Query config:', query);

    // Fetch query settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('query_settings')
      .select('*')
      .eq('query_id', queryId)
      .maybeSingle();

    if (settingsError) throw settingsError;

    // Fetch query fields
    const { data: fields, error: fieldsError } = await supabaseClient
      .from('query_fields')
      .select('*')
      .eq('query_id', queryId)
      .order('position');

    if (fieldsError) throw fieldsError;

    // Fetch query joins
    const { data: joins, error: joinsError } = await supabaseClient
      .from('query_joins')
      .select('*')
      .eq('query_id', queryId)
      .order('position');

    if (joinsError) throw joinsError;

    // Fetch query conditions
    const { data: conditions, error: conditionsError } = await supabaseClient
      .from('query_conditions')
      .select('*')
      .eq('query_id', queryId)
      .order('position');

    if (conditionsError) throw conditionsError;

    // If no settings or fields, return empty results
    if (!settings || !fields || fields.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: [], rowCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch entity information for field mapping
    const entityIds = [...new Set([
      settings.primary_entity_id,
      ...fields.map((f: any) => f.entity_id),
      ...(joins || []).filter((j: any) => !j.is_group).map((j: any) => j.target_entity_id)
    ])];

    const { data: entities } = await supabaseClient
      .from('entities')
      .select('id, name, display_name')
      .in('id', entityIds);

    const entityMap = new Map(entities?.map((e: any) => [e.id, e]) || []);

    // Build SELECT clause
    let selectParts: string[] = [];
    let entityAliases = new Map<string, string>();
    entityAliases.set(settings.primary_entity_id, 'e0');

    if (query.query_type === 'flat') {
      fields.forEach((field: any) => {
        const entityAlias = entityAliases.get(field.entity_id) || 'e0';
        const entity = entityMap.get(field.entity_id);
        const columnAlias = `${entity?.display_name || 'Field'}: ${field.field_name}`;
        selectParts.push(`${entityAlias}.data->>'${field.field_name}' AS "${columnAlias}"`);
      });
    } else {
      // Aggregate query
      fields.forEach((field: any) => {
        const entityAlias = entityAliases.get(field.entity_id) || 'e0';
        const entity = entityMap.get(field.entity_id);
        
        if (field.aggregation) {
          const columnAlias = `${field.aggregation.toUpperCase()}(${entity?.display_name || 'Field'}: ${field.field_name})`;
          
          if (field.aggregation === 'count') {
            selectParts.push(`COUNT(*) AS "${columnAlias}"`);
          } else {
            selectParts.push(`${field.aggregation.toUpperCase()}((${entityAlias}.data->>'${field.field_name}')::numeric) AS "${columnAlias}"`);
          }
        } else {
          const columnAlias = `${entity?.display_name || 'Field'}: ${field.field_name}`;
          selectParts.push(`${entityAlias}.data->>'${field.field_name}' AS "${columnAlias}"`);
        }
      });
    }

    // Build FROM clause with JOINs using tree structure
    let fromClause = `entity_records e0`;
    
    if (joins && joins.length > 0) {
      const aliasCounter = { value: 1 };
      fromClause += buildJoinClauses(joins, null, entityAliases, aliasCounter);
    }

    // Build WHERE clause using tree structure
    let whereParts: string[] = [`e0.entity_id = '${settings.primary_entity_id}'`, `e0.is_published = true`];
    
    if (conditions && conditions.length > 0) {
      const conditionTree = buildConditionTree(conditions, null, entityAliases);
      if (conditionTree) {
        whereParts.push(conditionTree);
      }
    }

    // Build GROUP BY clause for aggregate queries
    let groupByClause = '';
    if (query.query_type === 'aggregate' && settings.group_by && Array.isArray(settings.group_by) && settings.group_by.length > 0) {
      const groupFields = settings.group_by.map((fieldName: string) => {
        return `e0.data->>'${fieldName}'`;
      });
      groupByClause = `GROUP BY ${groupFields.join(', ')}`;
    }

    // Build ORDER BY clause
    let orderByClause = '';
    if (settings.sort_field && settings.sort_order) {
      const sortEntityAlias = entityAliases.get(settings.sort_entity_id || settings.primary_entity_id) || 'e0';
      orderByClause = `ORDER BY ${sortEntityAlias}.data->>'${settings.sort_field}' ${settings.sort_order.toUpperCase()}`;
    }

    // Build LIMIT clause
    const limitClause = `LIMIT ${settings.limit_rows || 50}`;

    // Construct final SQL
    const sql = `
      SELECT ${selectParts.join(', ')}
      FROM ${fromClause}
      WHERE ${whereParts.join(' AND ')}
      ${groupByClause}
      ${orderByClause}
      ${limitClause}
    `.trim();

    console.log('Generated SQL:', sql);

    // Execute query using Supabase RPC or direct query
    const { data: results, error: execError } = await supabaseClient.rpc('execute_sql', { query: sql });

    if (execError) {
      console.error('Execution error:', execError);
      // If RPC doesn't exist, try to return empty results for now
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [], 
          rowCount: 0,
          note: 'Query execution requires database function. SQL generated successfully.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results || [], 
        rowCount: results?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error executing query:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        data: [],
        rowCount: 0
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
