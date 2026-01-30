"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, FileText, Box, Layout as LayoutIcon, Search, FileEdit, ChevronDown, ChevronRight, Eye, Trash2, Plus, Database, SearchCode, List, Network, ClipboardList, LayoutTemplate } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { PagePreviewModal } from "@/components/editor/PagePreviewModal";
import { WidgetPreviewModal } from "@/components/editor/WidgetPreviewModal";
import { LayoutPreviewModal } from "@/components/editor/LayoutPreviewModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [pages, setPages] = useState<Tables<"pages">[]>([]);
  const [widgets, setWidgets] = useState<Tables<"widgets">[]>([]);
  const [layouts, setLayouts] = useState<Tables<"layouts">[]>([]);
  const [entities, setEntities] = useState<Tables<"entities">[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [apiCollections, setApiCollections] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<{
    pages: boolean;
    widgets: boolean;
    layouts: boolean;
    templates: boolean;
    entities: boolean;
    queries: boolean;
    apiCollections: boolean;
    forms: boolean;
  }>({
    pages: true,
    widgets: true,
    layouts: true,
    templates: true,
    entities: true,
    queries: true,
    apiCollections: true,
    forms: true,
  });

  // Preview states for Page
  const [previewPage, setPreviewPage] = useState<Tables<"pages"> | null>(null);
  const [previewPageRows, setPreviewPageRows] = useState<Tables<"page_rows">[]>([]);
  const [previewPageComponents, setPreviewPageComponents] = useState<Tables<"page_components">[]>([]);
  const [previewPageLayout, setPreviewPageLayout] = useState<Tables<"layouts"> | null>(null);
  const [previewPageLayoutRows, setPreviewPageLayoutRows] = useState<Tables<"layout_rows">[]>([]);
  const [previewPageLayoutComponents, setPreviewPageLayoutComponents] = useState<Tables<"layout_components">[]>([]);
  const [previewPageWidgetData, setPreviewPageWidgetData] = useState<Map<string, { rows: any[]; components: any[] }>>(new Map());

  // Preview states for Widget
  const [previewWidget, setPreviewWidget] = useState<Tables<"widgets"> | null>(null);
  const [previewWidgetRows, setPreviewWidgetRows] = useState<Tables<"widget_rows">[]>([]);
  const [previewWidgetComponents, setPreviewWidgetComponents] = useState<Tables<"widget_components">[]>([]);

  // Preview states for Layout
  const [previewLayout, setPreviewLayout] = useState<Tables<"layouts"> | null>(null);
  const [previewLayoutRows, setPreviewLayoutRows] = useState<Tables<"layout_rows">[]>([]);
  const [previewLayoutComponents, setPreviewLayoutComponents] = useState<Tables<"layout_components">[]>([]);

  useEffect(() => {
    loadData();

    // Set up realtime subscriptions for all tables
    const pagesChannel = supabase
      .channel('pages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pages'
        },
        () => loadPages()
      )
      .subscribe();

    const widgetsChannel = supabase
      .channel('widgets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'widgets'
        },
        () => loadWidgets()
      )
      .subscribe();

    const layoutsChannel = supabase
      .channel('layouts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'layouts'
        },
        () => loadLayouts()
      )
      .subscribe();

    const entitiesChannel = supabase
      .channel('entities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entities'
        },
        () => loadEntities()
      )
      .subscribe();

    const queriesChannel = supabase
      .channel('queries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queries'
        },
        () => loadQueries()
      )
      .subscribe();

    const apiCollectionsChannel = supabase
      .channel('api-collections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'api_collections'
        },
        () => loadApiCollections()
      )
      .subscribe();

    const formsChannel = supabase
      .channel('forms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forms'
        },
        () => loadForms()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pagesChannel);
      supabase.removeChannel(widgetsChannel);
      supabase.removeChannel(layoutsChannel);
      supabase.removeChannel(entitiesChannel);
      supabase.removeChannel(queriesChannel);
      supabase.removeChannel(apiCollectionsChannel);
      supabase.removeChannel(formsChannel);
    };
  }, []);

  const loadEntities = async () => {
    const { data, error } = await supabase
      .from("entities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading entities:", error.message, error);
    } else {
      setEntities(data || []);
    }
  };

  const loadPages = async () => {
    const { data } = await supabase
      .from("pages")
      .select("*")
      .order("title");
    setPages(data || []);
  };

  const loadWidgets = async () => {
    const { data } = await supabase
      .from("widgets")
      .select("*")
      .order("title");
    setWidgets(data || []);
  };

  const loadLayouts = async () => {
    const { data } = await supabase
      .from("layouts")
      .select("*")
      .order("title");
    setLayouts(data || []);
  };

  const loadQueries = async () => {
    const { data, error } = await supabase
      .from("queries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading queries:", error.message, error);
    } else {
      setQueries(data || []);
    }
  };

  const loadApiCollections = async () => {
    const { data, error } = await supabase
      .from("api_collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Suppress error if table doesn't exist yet
      if (error.code === '42P01' || error.message.includes('schema cache')) {
        console.warn("API Collections table not found, skipping load.");
      } else {
        console.error("Error loading API collections:", error.message, error);
      }
    } else {
      setApiCollections(data || []);
    }
  };

  const loadForms = async () => {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Suppress error if table doesn't exist yet
      if (error.code === '42P01' || error.message.includes('schema cache')) {
        console.warn("Forms table not found, skipping load.");
      } else {
        console.error("Error loading forms:", error.message, error);
      }
    } else {
      setForms(data || []);
    }
  };

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from("section_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading templates:", error.message, error);
    } else {
      setTemplates(data || []);
    }
  };

  const loadData = async () => {
    await Promise.all([loadPages(), loadWidgets(), loadLayouts(), loadTemplates(), loadEntities(), loadQueries(), loadApiCollections(), loadForms()]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filterItems = <T extends { title?: string; display_name?: string }>(items: T[]) => {
    if (!searchQuery) return items;
    return items.filter(item => {
      const searchText = (item.title || item.display_name || "").toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  };

  const filteredPages = filterItems(pages);
  const filteredWidgets = filterItems(widgets);
  const filteredLayouts = filterItems(layouts);
  const filteredTemplates = templates.filter((template: any) =>
    template.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredEntities = entities.filter((entity) =>
    entity.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredQueries = queries.filter((query: any) =>
    query.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredApiCollections = apiCollections.filter((collection: any) =>
    collection.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredForms = forms.filter((form: any) =>
    form.name?.toLowerCase().includes(searchQuery.toLowerCase()) || form.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePage = async (e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Delete this page?")) return;

    const { error } = await supabase.from("pages").delete().eq("id", pageId);
    if (error) {
      toast.error("Failed to delete page");
    } else {
      toast.success("Page deleted");
    }
  };

  const handleDeleteWidget = async (e: React.MouseEvent, widgetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Delete this widget?")) return;

    const { error } = await supabase.from("widgets").delete().eq("id", widgetId);
    if (error) {
      toast.error("Failed to delete widget");
    } else {
      toast.success("Widget deleted");
    }
  };

  const handleDeleteLayout = async (e: React.MouseEvent, layoutId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Delete this layout?")) return;

    const { error } = await supabase.from("layouts").delete().eq("id", layoutId);
    if (error) {
      toast.error("Failed to delete layout");
    } else {
      toast.success("Layout deleted");
    }
  };

  const handleDeleteEntity = async (e: React.MouseEvent, entityId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this entity?")) return;
    const { error } = await supabase.from("entities").delete().eq("id", entityId);
    if (error) toast.error("Failed to delete entity");
    else toast.success("Entity deleted");
  };

  const handleDeleteQuery = async (e: React.MouseEvent, queryId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this query?")) return;
    const { error } = await supabase.from("queries" as any).delete().eq("id", queryId);
    if (error) toast.error("Failed to delete query");
    else toast.success("Query deleted");
  };

  const handleDeleteApiCollection = async (e: React.MouseEvent, collectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this API collection? All requests will be deleted.")) return;
    const { error } = await supabase.from("api_collections" as any).delete().eq("id", collectionId);
    if (error) toast.error("Failed to delete collection");
    else toast.success("Collection deleted");
  };

  const handleDeleteForm = async (e: React.MouseEvent, formId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this form? All submissions will be deleted.")) return;
    const { error } = await supabase.from("forms" as any).delete().eq("id", formId);
    if (error) toast.error("Failed to delete form");
    else toast.success("Form deleted");
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, templateId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this template?")) return;
    const { error } = await supabase.from("section_templates").delete().eq("id", templateId);
    if (error) toast.error("Failed to delete template");
    else toast.success("Template deleted");
  };

  const handlePreviewPage = async (e: React.MouseEvent, page: Tables<"pages">) => {
    e.preventDefault();
    e.stopPropagation();

    const [rowsData, componentsData, layoutData] = await Promise.all([
      supabase.from("page_rows").select("*").eq("page_id", page.id).order("position"),
      supabase.from("page_components").select("*").eq("page_id", page.id).order("position"),
      page.layout_id ? supabase.from("layouts").select("*").eq("id", page.layout_id).single() : Promise.resolve({ data: null, error: null }),
    ]);

    setPreviewPageRows(rowsData.data || []);
    setPreviewPageComponents(componentsData.data || []);

    if (layoutData.data) {
      const [layoutRowsData, layoutComponentsData] = await Promise.all([
        supabase.from("layout_rows").select("*").eq("layout_id", layoutData.data.id).order("position"),
        supabase.from("layout_components").select("*").eq("layout_id", layoutData.data.id).order("position"),
      ]);

      setPreviewPageLayout(layoutData.data);
      setPreviewPageLayoutRows(layoutRowsData.data || []);
      setPreviewPageLayoutComponents(layoutComponentsData.data || []);
    } else {
      setPreviewPageLayout(null);
      setPreviewPageLayoutRows([]);
      setPreviewPageLayoutComponents([]);
    }

    // Fetch widget data
    const allComponents = [...(componentsData.data || []), ...(layoutData.data ? await supabase.from("layout_components").select("*").eq("layout_id", layoutData.data.id) : { data: [] }).data || []];
    const widgetIds = allComponents.filter((c: any) => c.is_widget_instance && c.widget_id).map((c: any) => c.widget_id);
    const uniqueWidgetIds = Array.from(new Set(widgetIds));

    const widgetDataMap = new Map();
    for (const widgetId of uniqueWidgetIds) {
      const [wRows, wComps] = await Promise.all([
        supabase.from("widget_rows").select("*").eq("widget_id", widgetId).order("position"),
        supabase.from("widget_components").select("*").eq("widget_id", widgetId).order("position"),
      ]);
      widgetDataMap.set(widgetId, { rows: wRows.data || [], components: wComps.data || [] });
    }

    setPreviewPageWidgetData(widgetDataMap);
    setPreviewPage(page);
  };

  const handlePreviewWidget = async (e: React.MouseEvent, widget: Tables<"widgets">) => {
    e.preventDefault();
    e.stopPropagation();

    const [rowsData, componentsData] = await Promise.all([
      supabase.from("widget_rows").select("*").eq("widget_id", widget.id).order("position"),
      supabase.from("widget_components").select("*").eq("widget_id", widget.id).order("position"),
    ]);

    setPreviewWidgetRows(rowsData.data || []);
    setPreviewWidgetComponents(componentsData.data || []);
    setPreviewWidget(widget);
  };

  const handlePreviewLayout = async (e: React.MouseEvent, layout: Tables<"layouts">) => {
    e.preventDefault();
    e.stopPropagation();

    const [rowsData, componentsData] = await Promise.all([
      supabase.from("layout_rows").select("*").eq("layout_id", layout.id).order("position"),
      supabase.from("layout_components").select("*").eq("layout_id", layout.id).order("position"),
    ]);

    setPreviewLayoutRows(rowsData.data || []);
    setPreviewLayoutComponents(componentsData.data || []);
    setPreviewLayout(layout);
  };

  const navItems = [
    { path: "/admin", label: "Pages", icon: FileText },
    { path: "/admin/widgets", label: "Widgets", icon: Box },
    { path: "/admin/layouts", label: "Layouts", icon: LayoutIcon },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shadow-[var(--shadow-soft)]">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            {/* Pages Section */}
            <div>
              <div className="flex items-center group">
                <div
                  onClick={() => toggleSection('pages')}
                  className="flex items-center gap-2 flex-1 px-2 py-2 hover:bg-accent rounded transition-colors cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); router.push("/admin"); }}
                    title="View all pages"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Pages
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); router.push("/admin"); }}
                  title="View all pages"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    const createButton = document.querySelector('[data-create-page]') as HTMLButtonElement;
                    createButton?.click();
                  }}
                  title="Create new page"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => toggleSection('pages')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {expandedSections.pages ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
              {expandedSections.pages && (
                <div className="mt-1 space-y-1">
                  {filteredPages.map((page) => (
                    <div key={page.id} className="group relative">
                      <Link
                        href={`/admin/editor/${page.id}`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
                          pathname === `/admin/editor/${page.id}`
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <FileEdit className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate flex-1">{page.title}</span>
                        {page.is_published && (
                          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Published" />
                        )}
                      </Link>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handlePreviewPage(e, page)}
                          title="Preview"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeletePage(e, page.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredPages.length === 0 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      {searchQuery ? "No pages found" : "No pages yet"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Widgets Section */}
            <div>
              <div className="flex items-center group">
                <div
                  onClick={() => toggleSection('widgets')}
                  className="flex items-center gap-2 flex-1 px-2 py-2 hover:bg-accent rounded transition-colors cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); router.push("/admin/widgets"); }}
                    title="View all widgets"
                  >
                    <Box className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Widgets
                    </span>
                    <Tooltip>
                      <TooltipTrigger onClick={(e) => e.stopPropagation()}>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-xs">Reusable components that update everywhere when edited</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); router.push("/admin/widgets"); }}
                  title="View all widgets"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    const createButton = document.querySelector('[data-create-widget]') as HTMLButtonElement;
                    createButton?.click();
                  }}
                  title="Create new widget"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => toggleSection('widgets')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {expandedSections.widgets ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
              {expandedSections.widgets && (
                <div className="mt-1 space-y-1">
                  {filteredWidgets.map((widget) => (
                    <div key={widget.id} className="group relative">
                      <Link
                        href={`/admin/widgets/${widget.id}`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
                          pathname === `/admin/widgets/${widget.id}`
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Box className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate flex-1">{widget.title}</span>
                        {widget.is_published && (
                          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Published" />
                        )}
                      </Link>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handlePreviewWidget(e, widget)}
                          title="Preview"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteWidget(e, widget.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredWidgets.length === 0 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      {searchQuery ? "No widgets found" : "No widgets yet"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Layouts Section */}
            <div>
              <div className="flex items-center group">
                <div
                  onClick={() => toggleSection('layouts')}
                  className="flex items-center gap-2 flex-1 px-2 py-2 hover:bg-accent rounded transition-colors cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); router.push("/admin/layouts"); }}
                    title="View all layouts"
                  >
                    <LayoutIcon className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Layouts
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); router.push("/admin/layouts"); }}
                  title="View all layouts"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    const createButton = document.querySelector('[data-create-layout]') as HTMLButtonElement;
                    createButton?.click();
                  }}
                  title="Create new layout"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => toggleSection('layouts')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {expandedSections.layouts ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
              {expandedSections.layouts && (
                <div className="mt-1 space-y-1">
                  {filteredLayouts.map((layout) => (
                    <div key={layout.id} className="group relative">
                      <Link
                        href={`/admin/layouts/${layout.id}`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
                          pathname === `/admin/layouts/${layout.id}`
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <LayoutIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate flex-1">{layout.title}</span>
                        {layout.is_published && (
                          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Published" />
                        )}
                      </Link>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handlePreviewLayout(e, layout)}
                          title="Preview"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteLayout(e, layout.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredLayouts.length === 0 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      {searchQuery ? "No layouts found" : "No layouts yet"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Templates Section */}
            <div>
              <div className="flex items-center group">
                <div
                  onClick={() => toggleSection('templates')}
                  className="flex items-center gap-2 flex-1 px-2 py-2 hover:bg-accent rounded transition-colors cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); router.push("/admin/templates"); }}
                    title="View all templates"
                  >
                    <LayoutTemplate className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Templates
                    </span>
                    <Tooltip>
                      <TooltipTrigger onClick={(e) => e.stopPropagation()}>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-xs">Pre-built section patterns to insert into pages</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); router.push("/admin/templates"); }}
                  title="View all templates"
                >
                  <List className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => toggleSection('templates')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {expandedSections.templates ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
              {expandedSections.templates && (
                <div className="mt-1 space-y-1">
                  {filteredTemplates.map((template: any) => (
                    <div key={template.id} className="group relative">
                      <Link
                        href={`/admin/templates/${template.id}/editor`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
                          pathname === `/admin/templates/${template.id}/editor`
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <LayoutTemplate className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate flex-1">{template.name}</span>
                        {template.is_public && (
                          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Public" />
                        )}
                      </Link>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteTemplate(e, template.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredTemplates.length === 0 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      {searchQuery ? "No templates found" : "No templates yet"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Entities Section */}
            <div>
              <div className="flex items-center group">
                <div
                  onClick={() => toggleSection('entities')}
                  className="flex items-center gap-2 flex-1 px-2 py-2 hover:bg-accent rounded transition-colors cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); router.push("/admin/entities"); }}
                    title="View all entities"
                  >
                    <Database className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Entities
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); router.push("/admin/entities"); }}
                  title="View all entities"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    const createButton = document.querySelector('[data-create-entity]') as HTMLButtonElement;
                    createButton?.click();
                  }}
                  title="Create new entity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => toggleSection('entities')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {expandedSections.entities ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
              {expandedSections.entities && (
                <div className="mt-1 space-y-1">
                  {filteredEntities.map((entity) => (
                    <div key={entity.id} className="group relative">
                      <Link
                        href={`/admin/entities/${entity.id}/records`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
                          pathname === `/admin/entities/${entity.id}/records`
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Database className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate flex-1">{entity.display_name}</span>
                        {entity.is_published && (
                          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Published" />
                        )}
                      </Link>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/admin/entities/${entity.id}/records`); }}
                          title="View Records"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteEntity(e, entity.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredEntities.length === 0 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      {searchQuery ? "No entities found" : "No entities yet"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Queries Section */}
            <div>
              <div className="flex items-center group">
                <div
                  onClick={() => toggleSection('queries')}
                  className="flex items-center gap-2 flex-1 px-2 py-2 hover:bg-accent rounded transition-colors cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); router.push("/admin/queries"); }}
                    title="View all queries"
                  >
                    <SearchCode className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Queries
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); router.push("/admin/queries"); }}
                  title="View all queries"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    const createButton = document.querySelector('[data-create-query]') as HTMLButtonElement;
                    createButton?.click();
                  }}
                  title="Create new query"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => toggleSection('queries')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {expandedSections.queries ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
              {expandedSections.queries && (
                <div className="mt-1 space-y-1">
                  {filteredQueries.map((query) => (
                    <div key={query.id} className="group relative">
                      <Link
                        href={`/admin/queries/${query.id}/editor`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
                          pathname === `/admin/queries/${query.id}/editor`
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <SearchCode className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate flex-1">{query.display_name}</span>
                        {query.is_published && (
                          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Published" />
                        )}
                      </Link>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/admin/queries/${query.id}/results`); }}
                          title="View Results"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteQuery(e, query.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredQueries.length === 0 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      {searchQuery ? "No queries found" : "No queries yet"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* API Collections Section */}
            <div>
              <div className="flex items-center group">
                <div
                  onClick={() => toggleSection('apiCollections')}
                  className="flex items-center gap-2 flex-1 px-2 py-2 hover:bg-accent rounded transition-colors cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); router.push("/admin/api-collections"); }}
                    title="View all API collections"
                  >
                    <Network className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    API Client
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); router.push("/admin/api-collections"); }}
                  title="View all collections"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    const createBtn = document.querySelector('[data-create-collection-trigger]') as HTMLButtonElement;
                    createBtn?.click();
                  }}
                  title="Create new collection"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => toggleSection('apiCollections')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {expandedSections.apiCollections ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
              {expandedSections.apiCollections && (
                <div className="mt-1 space-y-1">
                  {filteredApiCollections.map((collection) => (
                    <div key={collection.id} className="group relative">
                      <Link
                        href={`/admin/api-collections/${collection.id}/editor`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
                          pathname === `/admin/api-collections/${collection.id}/editor`
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Network className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate flex-1">{collection.name}</span>
                        {collection.is_published && (
                          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Published" />
                        )}
                      </Link>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/admin/api-collections/${collection.id}/editor`); }}
                          title="Open Collection"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteApiCollection(e, collection.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredApiCollections.length === 0 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      {searchQuery ? "No API collections found" : "No API collections yet"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Forms Section */}
            <div>
              <div className="flex items-center group">
                <div
                  onClick={() => toggleSection('forms')}
                  className="flex items-center gap-2 flex-1 px-2 py-2 hover:bg-accent rounded transition-colors cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); router.push("/admin/forms"); }}
                    title="View all forms"
                  >
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Forms
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); router.push("/admin/forms"); }}
                  title="View all forms"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    const createButton = document.querySelector('[data-create-form]') as HTMLButtonElement;
                    createButton?.click();
                  }}
                  title="Create new form"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => toggleSection('forms')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {expandedSections.forms ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
              {expandedSections.forms && (
                <div className="mt-1 space-y-1">
                  {filteredForms.map((form) => (
                    <div key={form.id} className="group relative">
                      <Link
                        href={`/admin/forms/${form.id}/builder`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
                          pathname === `/admin/forms/${form.id}/builder`
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <ClipboardList className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate flex-1">{form.title || form.name}</span>
                        {form.is_published && (
                          <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Published" />
                        )}
                      </Link>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/admin/forms/${form.id}/submissions`); }}
                          title="View Submissions"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteForm(e, form.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredForms.length === 0 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      {searchQuery ? "No forms found" : "No forms yet"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Preview Modals */}
      <PagePreviewModal
        open={!!previewPage}
        onOpenChange={(open) => !open && setPreviewPage(null)}
        page={previewPage}
        rows={previewPageRows}
        components={previewPageComponents}
        layout={previewPageLayout}
        layoutRows={previewPageLayoutRows}
        layoutComponents={previewPageLayoutComponents}
        widgetData={previewPageWidgetData}
      />

      <WidgetPreviewModal
        open={!!previewWidget}
        onOpenChange={(open) => !open && setPreviewWidget(null)}
        widget={previewWidget}
        rows={previewWidgetRows}
        components={previewWidgetComponents}
      />

      <LayoutPreviewModal
        open={!!previewLayout}
        onOpenChange={(open) => !open && setPreviewLayout(null)}
        layout={previewLayout}
        rows={previewLayoutRows}
        components={previewLayoutComponents}
      />
    </div>
  );
}
