"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Edit, Trash2, Database, Eye, Plus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getEntities, deleteEntity } from "@/lib/schema-service";
import { CreateEntityDialog } from "@/components/entities/CreateEntityDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Entity } from "@/types/entity";


const Entities = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({});
  const [deleteEntityId, setDeleteEntityId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        router.push("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        router.push("/auth");
      } else {
        loadEntities();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const loadEntities = async () => {
    setLoading(true);

    // Load entities from schema service instead of Supabase
    const data = await getEntities();
    setEntities(data as any);

    // Load record counts for each entity from Supabase (keeping records in Supabase)
    const counts: Record<string, number> = {};
    for (const entity of data as any || []) {
      const { count } = await supabase
        .from("entity_records")
        .select("*", { count: "exact", head: true })
        .eq("entity_id", entity.id);
      counts[entity.id] = count || 0;
    }
    setRecordCounts(counts);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteEntityId) return;

    try {
      const result = await deleteEntity(deleteEntityId);
      if (result.success) {
        toast.success("Entity deleted successfully (via API)");
        loadEntities();
      } else {
        toast.error("Failed to delete entity");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
    setDeleteEntityId(null);
  };

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Entities</h1>
              <p className="text-muted-foreground mt-2">Manage your custom data entities (Schema via API)</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Entity
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading entities...</div>
          ) : entities.length === 0 ? (
            <Card className="p-12 text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No entities yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first entity to start managing custom data
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Entity
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entities.map((entity) => (
                <Card key={entity.id} className="p-6 hover:shadow-lg transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{entity.display_name}</h3>
                        <p className="text-sm text-muted-foreground">{entity.name}</p>
                      </div>
                    </div>
                    <Badge variant={entity.is_published ? "default" : "secondary"}>
                      {entity.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  {entity.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {entity.description}
                    </p>
                  )}

                  <div className="text-sm text-muted-foreground mb-4">
                    {recordCounts[entity.id] || 0} records
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/admin/entities/${entity.id}/records`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Records
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/entities/${entity.id}/editor`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteEntityId(entity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateEntityDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadEntities}
      />

      <AlertDialog open={!!deleteEntityId} onOpenChange={() => setDeleteEntityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entity? This will permanently delete it from the schema.
              Actual database records will remain but will be inaccessible through this entity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Entities;
