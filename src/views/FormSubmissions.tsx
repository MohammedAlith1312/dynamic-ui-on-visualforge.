"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Download, Eye, Trash2, Search } from "lucide-react";
import { FormSubmissionDialog } from "@/components/forms/FormSubmissionDialog";
import { format } from "date-fns";

export default function FormSubmissions() {
  const params = useParams();
  const formId = params?.formId as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('form-submissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'form_submissions',
          filter: `form_id=eq.${formId}`
        },
        () => loadSubmissions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formId]);

  const loadData = async () => {
    if (!formId) return;

    await Promise.all([loadForm(), loadSubmissions()]);
    setLoading(false);
  };

  const loadForm = async () => {
    if (!formId) return;

    const { data, error } = await supabase
      .from("forms" as any)
      .select("*")
      .eq("id", formId)
      .single();

    if (error) {
      toast.error("Failed to load form");
      router.push("/admin/forms");
    } else {
      setForm(data);
    }
  };

  const loadSubmissions = async () => {
    if (!formId) return;

    const { data, error } = await supabase
      .from("form_submissions" as any)
      .select("*")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false });

    if (error) {
      toast.error("Failed to load submissions");
      console.error(error);
    } else {
      setSubmissions(data || []);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm("Delete this submission?")) return;

    const { error } = await supabase
      .from("form_submissions" as any)
      .delete()
      .eq("id", submissionId);

    if (error) {
      toast.error("Failed to delete submission");
    } else {
      toast.success("Submission deleted");
    }
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      toast.error("No submissions to export");
      return;
    }

    // Get all unique field names from all submissions
    const allFields = new Set<string>();
    submissions.forEach(sub => {
      Object.keys(sub.data || {}).forEach(key => allFields.add(key));
    });

    const headers = ["ID", "Submitted At", ...Array.from(allFields)];
    const rows = submissions.map(sub => [
      sub.id,
      format(new Date(sub.submitted_at), "yyyy-MM-dd HH:mm:ss"),
      ...Array.from(allFields).map(field => {
        const value = sub.data?.[field];
        return typeof value === "object" ? JSON.stringify(value) : value || "";
      })
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form?.name || "form"}-submissions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Submissions exported");
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (!searchQuery) return true;
    const dataStr = JSON.stringify(sub.data).toLowerCase();
    return dataStr.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!form) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/admin/forms/${formId}/builder`)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Submissions</h1>
                <p className="text-muted-foreground mt-1">{form.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{submissions.length} submissions</Badge>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                disabled={submissions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="border rounded-lg p-12 text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No submissions found" : "No submissions yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Submissions will appear here once users submit the form"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Data Preview</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-xs">
                        {submission.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {format(new Date(submission.submitted_at), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {Object.entries(submission.data || {})
                          .slice(0, 2)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(submission.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <FormSubmissionDialog
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </AdminLayout>
  );
}
