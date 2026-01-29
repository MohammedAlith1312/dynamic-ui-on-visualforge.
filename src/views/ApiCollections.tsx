"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCollectionDialog } from "@/components/api/CreateCollectionDialog";
import { Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface ApiCollection {
  id: string;
  name: string;
  description: string | null;
  base_url: string | null;
  created_at: string;
}

const ApiCollections = () => {
  const router = useRouter();
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from("api_collections" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCollections(data as any || []);
    } catch (error) {
      console.error("Error loading collections:", error);
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();

    const channel = supabase
      .channel('api_collections_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'api_collections' }, () => {
        loadCollections();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection? All requests will be deleted.")) {
      return;
    }

    try {
      const { error } = await supabase.from("api_collections" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("Collection deleted");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">API Collections</h1>
            <p className="text-muted-foreground">Manage your REST API collections</p>
          </div>
          <CreateCollectionDialog onCreated={loadCollections} />
        </div>

        {loading ? (
          <div>Loading collections...</div>
        ) : collections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No collections yet</p>
              <CreateCollectionDialog onCreated={loadCollections} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{collection.name}</span>
                  </CardTitle>
                  {collection.description && (
                    <CardDescription className="line-clamp-2">
                      {collection.description}
                    </CardDescription>
                  )}
                  {collection.base_url && (
                    <p className="text-xs text-muted-foreground truncate">
                      {collection.base_url}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/admin/api-collections/${collection.id}/editor`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(collection.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ApiCollections;