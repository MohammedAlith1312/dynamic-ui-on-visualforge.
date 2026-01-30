"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function QueryResults() {
  const params = useParams();
  const queryId = params?.queryId as string;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetchQueryAndResults();
  }, [queryId]);

  const fetchQueryAndResults = async () => {
    setLoading(true);
    try {
      const { data: queryData, error: queryError } = await (supabase as any)
        .from('queries')
        .select('*')
        .eq('id', queryId)
        .single();

      if (queryError) throw queryError;
      setQuery(queryData);

      // Call execute-query edge function
      const { data, error } = await supabase.functions.invoke('execute-query', {
        body: { queryId },
      });

      if (error) throw error;
      setResults(data.data || []);
    } catch (error: any) {
      toast({
        title: "Error loading results",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  if (!query) return null;

  const columns = results.length > 0 ? Object.keys(results[0]) : [];

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
              <p className="text-sm text-muted-foreground">Query Results</p>
            </div>
          </div>
          <Button onClick={fetchQueryAndResults} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No results found
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, idx) => (
                  <TableRow key={idx}>
                    {columns.map((column) => (
                      <TableCell key={column}>
                        {typeof row[column] === 'object'
                          ? JSON.stringify(row[column])
                          : String(row[column] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
