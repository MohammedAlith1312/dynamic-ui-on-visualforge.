import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    console.log('User authenticated:', !!user, 'Auth error:', authError);
    
    if (!user) {
      throw new Error('Unauthorized - Please ensure you are logged in');
    }

    const { requestId } = await req.json();

    // Fetch request configuration
    const { data: request, error: requestError } = await supabaseClient
      .from('api_requests')
      .select(`
        *,
        api_collections!inner(user_id)
      `)
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error('Request not found');
    }

    // Verify user owns this request
    if (request.api_collections.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    // Build the URL with query params
    let url = request.url;
    const queryParams = (request.query_params || [])
      .filter((p: any) => p.enabled !== false && p.key && p.value)
      .map((p: any) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    
    if (queryParams) {
      url += (url.includes('?') ? '&' : '?') + queryParams;
    }

    // Build headers
    const headers: Record<string, string> = {};
    (request.headers || [])
      .filter((h: any) => h.enabled !== false && h.key)
      .forEach((h: any) => {
        headers[h.key] = h.value || '';
      });

    // Add authentication
    const authConfig = request.auth_config || {};
    if (request.auth_type === 'bearer' && authConfig.token) {
      headers['Authorization'] = `Bearer ${authConfig.token}`;
    } else if (request.auth_type === 'basic' && authConfig.username && authConfig.password) {
      const credentials = btoa(`${authConfig.username}:${authConfig.password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    } else if (request.auth_type === 'api-key' && authConfig.key && authConfig.value) {
      headers[authConfig.key] = authConfig.value;
    }

    // Build request body
    let body: any = undefined;
    if (request.body_type && request.body_type !== 'none' && request.body_content) {
      if (request.body_type === 'json') {
        body = request.body_content;
        headers['Content-Type'] = 'application/json';
      } else if (request.body_type === 'x-www-form-urlencoded') {
        body = request.body_content;
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        body = request.body_content;
      }
    }

    // Execute request
    const startTime = Date.now();
    const response = await fetch(url, {
      method: request.method,
      headers,
      body: body,
    });
    const responseTime = Date.now() - startTime;

    // Read response
    const responseText = await response.text();
    let responseBody = responseText;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      // Keep as text if not JSON
    }

    // Get response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const result = {
      success: response.ok,
      statusCode: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      responseTime,
    };

    // Save to history
    try {
      await supabaseClient.from('api_request_history').insert({
        request_id: requestId,
        status_code: response.status,
        response_time_ms: responseTime,
        response_body: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
        response_headers: responseHeaders,
        error_message: response.ok ? null : response.statusText,
      });
    } catch (historyError) {
      console.error('Failed to save history:', historyError);
      // Don't fail the request if history save fails
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error executing request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        statusCode: 0,
        statusText: 'Error',
        headers: {},
        body: error instanceof Error ? error.message : 'Unknown error',
        responseTime: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
