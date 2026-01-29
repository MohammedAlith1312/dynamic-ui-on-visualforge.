"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreateQueryDialog from "@/components/queries/CreateQueryDialog";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface Query {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  query_type: string;
  is_published: boolean;
}

export default function Queries() {
  const router = useRouter();
  const { toast } = useToast();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchQueries();

    const channel = supabase
      .channel('queries-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queries' }, () => {
        fetchQueries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueries = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueries(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading queries",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this query?")) return;

    try {
      const { error } = await (supabase as any).from('queries').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Query deleted",
        description: "The query has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting query",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Queries</h1>
              <p className="text-muted-foreground">Build and manage database queries</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} data-create-query>
              <Plus className="mr-2 h-4 w-4" />
              New Query
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading queries...</div>
          ) : queries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No queries yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first query to start building dynamic data views
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Query
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {queries.map((query) => (
                <Card key={query.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5" />
                          {query.display_name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {query.description || "No description"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant={query.query_type === 'flat' ? 'default' : 'secondary'}>
                        {query.query_type}
                      </Badge>
                      {query.is_published && <Badge variant="outline">Published</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/queries/${query.id}/results`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/queries/${query.id}/editor`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(query.id)}
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

        <CreateQueryDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </AdminLayout>
  );
}
