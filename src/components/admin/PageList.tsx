import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, Monitor, Code, Download } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PagePreviewModal } from "@/components/editor/PagePreviewModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Page = Tables<"pages">;
type PageRow = Tables<"page_rows">;
type PageComponent = Tables<"page_components">;
type Layout = Tables<"layouts">;
type LayoutRow = Tables<"layout_rows">;
type LayoutComponent = Tables<"layout_components">;

interface PageListProps {
  onCreatePage: () => void;
}

export const PageList = ({ onCreatePage }: PageListProps) => {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPage, setPreviewPage] = useState<Page | null>(null);
  const [previewRows, setPreviewRows] = useState<PageRow[]>([]);
  const [previewComponents, setPreviewComponents] = useState<PageComponent[]>([]);
  const [previewLayout, setPreviewLayout] = useState<Layout | null>(null);
  const [previewLayoutRows, setPreviewLayoutRows] = useState<LayoutRow[]>([]);
  const [previewLayoutComponents, setPreviewLayoutComponents] = useState<LayoutComponent[]>([]);
  const [widgetData, setWidgetData] = useState<Map<string, { rows: any[]; components: any[] }>>(new Map());
  const [selectedHtmlPage, setSelectedHtmlPage] = useState<Page | null>(null);

  const handlePreview = async (page: Page) => {
    const { data: rows } = await supabase
      .from("page_rows")
      .select("*")
      .eq("page_id", page.id)
      .order("position");

    const { data: components } = await supabase
      .from("page_components")
      .select("*")
      .eq("page_id", page.id)
      .order("position");

    let layout = null;
    let layoutRows: LayoutRow[] = [];
    let layoutComponents: LayoutComponent[] = [];

    if (page.layout_id) {
      const { data: layoutData } = await supabase
        .from("layouts")
        .select("*")
        .eq("id", page.layout_id)
        .single();

      if (layoutData) {
        layout = layoutData;

        const { data: lRows } = await supabase
          .from("layout_rows")
          .select("*")
          .eq("layout_id", page.layout_id)
          .order("position");

        const { data: lComponents } = await supabase
          .from("layout_components")
          .select("*")
          .eq("layout_id", page.layout_id)
          .order("position");

        layoutRows = lRows || [];
        layoutComponents = lComponents || [];
      }
    }

    // Fetch widget data for all widget instances
    const widgetInstances = (components || []).filter((c): c is PageComponent & { widget_id: string } =>
      Boolean(c.is_widget_instance && c.widget_id)
    );
    const widgetDataMap = new Map();

    for (const instance of widgetInstances) {
      if (!widgetDataMap.has(instance.widget_id)) {
        const { data: widgetRows } = await supabase
          .from("widget_rows")
          .select("*")
          .eq("widget_id", instance.widget_id)
          .order("position");

        const { data: widgetComponents } = await supabase
          .from("widget_components")
          .select("*")
          .eq("widget_id", instance.widget_id)
          .order("position");

        widgetDataMap.set(instance.widget_id, {
          rows: widgetRows || [],
          components: widgetComponents || []
        });
      }
    }

    setPreviewPage(page);
    setPreviewRows(rows || []);
    setPreviewComponents(components || []);
    setPreviewLayout(layout);
    setPreviewLayoutRows(layoutRows);
    setPreviewLayoutComponents(layoutComponents);
    setWidgetData(widgetDataMap);
  };

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load pages");
      return;
    }

    setPages(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    const { error } = await supabase.from("pages").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete page");
      return;
    }

    setPages(pages.filter((p) => p.id !== id));
    toast.success("Page deleted");
  };

  if (loading) {
    return <div className="text-center py-8">Loading pages...</div>;
  }

  if (pages.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <h3 className="text-lg font-medium mb-2">No pages yet</h3>
          <p className="text-muted-foreground mb-6">Create your first page to get started</p>
          <Button onClick={onCreatePage}>Create Page</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pages.map((page) => (
        <Card key={page.id} className="hover:shadow-[var(--shadow-medium)] transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="truncate">{page.title}</span>
              {page.is_published ? (
                <Eye className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">/{page.slug}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(page)}
                className="gap-2"
              >
                <Monitor className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/editor/${page.id}`)}
                className="flex-1 gap-2"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHtmlPage(page)}
                title="View HTML Source"
                className="gap-2"
              >
                <Code className="h-3 w-3" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(page.id)}
                className="gap-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <PagePreviewModal
        open={!!previewPage}
        onOpenChange={(open) => !open && setPreviewPage(null)}
        page={previewPage}
        rows={previewRows}
        components={previewComponents}
        layout={previewLayout}
        layoutRows={previewLayoutRows}
        layoutComponents={previewLayoutComponents}
        widgetData={widgetData}
      />

      <Dialog open={!!selectedHtmlPage} onOpenChange={(open) => !open && setSelectedHtmlPage(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>HTML Source: {selectedHtmlPage?.title}</DialogTitle>
            <DialogDescription>
              This is the static HTML content that was generated when the page was last published.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden border rounded-md bg-muted/50 p-4 font-mono text-sm">
            <ScrollArea className="h-full w-full">
              <pre className="whitespace-pre-wrap">
                {(selectedHtmlPage as any)?.published_html || "No published HTML found. Please publish the page first."}
              </pre>
            </ScrollArea>
          </div>
          <DialogFooter className="mt-4 flex justify-between sm:justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Slug: /{selectedHtmlPage?.slug}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const html = (selectedHtmlPage as any)?.published_html;
                  if (html) {
                    navigator.clipboard.writeText(html);
                    toast.success("Code copied to clipboard");
                  }
                }}
              >
                Copy Code
              </Button>
              <Button
                disabled={!(selectedHtmlPage as any)?.published_html}
                onClick={() => {
                  const html = (selectedHtmlPage as any)?.published_html;
                  if (html) {
                    const blob = new Blob([html], { type: "text/html" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${selectedHtmlPage?.slug}.html`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    toast.success("File downloaded");
                  }
                }}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download HTML
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
