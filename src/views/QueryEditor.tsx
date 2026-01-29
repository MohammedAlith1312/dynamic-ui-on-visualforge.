"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QuerySettingsPanel from "@/components/queries/QuerySettingsPanel";
import QueryFieldSelector from "@/components/queries/QueryFieldSelector";
import QueryJoinTree from "@/components/queries/QueryJoinTree";
import QueryConditionTree from "@/components/queries/QueryConditionTree";

export default function QueryEditor() {
  const params = useParams();
  const queryId = params.queryId as string;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchQuery();
  }, [queryId]);

  const fetchQuery = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('queries')
        .select('*')
        .eq('id', queryId)
        .single();

      if (error) throw error;
      setQuery(data);

      // Fetch settings
      const { data: settingsData } = await (supabase as any)
        .from('query_settings')
        .select('*')
        .eq('query_id', queryId)
        .maybeSingle();

      setSettings(settingsData);
    } catch (error: any) {
      toast({
        title: "Error loading query",
        description: error.message,
        variant: "destructive",
      });
      router.push('/admin/queries');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('queries')
        .update({
          display_name: query.display_name,
          description: query.description,
          is_published: query.is_published,
        })
        .eq('id', queryId);

      if (error) throw error;

      toast({
        title: "Query saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving query",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading query...</p>
      </div>
    );
  }

  if (!query) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/queries')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{query.display_name}</h1>
              <p className="text-sm text-muted-foreground">{query.query_type} query</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={query.display_name}
              onChange={(e) => setQuery({ ...query, display_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={query.description || ''}
              onChange={(e) => setQuery({ ...query, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={query.is_published}
              onCheckedChange={(checked) => setQuery({ ...query, is_published: checked })}
            />
            <Label htmlFor="published">Published</Label>
          </div>

          {settings?.primary_entity_id && (
            <>
              <QuerySettingsPanel queryId={queryId!} queryType={query.query_type} />
              <QueryFieldSelector
                queryId={queryId!}
                queryType={query.query_type}
                primaryEntityId={settings.primary_entity_id}
              />
              <QueryJoinTree queryId={queryId!} />
              <QueryConditionTree queryId={queryId!} />
            </>
          )}

          {!settings?.primary_entity_id && (
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Configure query settings below to start building your query. Set the primary entity first.
              </p>
              <div className="mt-4">
                <QuerySettingsPanel queryId={queryId!} queryType={query.query_type} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
