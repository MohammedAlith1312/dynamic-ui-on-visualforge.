"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ComponentRenderer } from "@/components/public/ComponentRenderer";

type Page = Tables<"pages">;
type PageRow = Tables<"page_rows">;
type PageComponent = Tables<"page_components">;
type Layout = Tables<"layouts">;
type LayoutRow = Tables<"layout_rows">;
type LayoutComponent = Tables<"layout_components">;

const PublicPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<Page | null>(null);
  const [rows, setRows] = useState<PageRow[]>([]);
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [layoutRows, setLayoutRows] = useState<LayoutRow[]>([]);
  const [layoutComponents, setLayoutComponents] = useState<LayoutComponent[]>([]);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgetData, setWidgetData] = useState<Map<string, { rows: any[]; components: any[] }>>(new Map());

  useEffect(() => {
    loadContent();
  }, [slug]);

  const loadContent = async () => {
    // Load all published pages for navigation
    const { data: pagesData } = await supabase
      .from("pages")
      .select("*")
      .eq("is_published", true)
      .order("menu_order");

    setAllPages(pagesData || []);

    if (!slug) {
      setLoading(false);
      return;
    }

    // Load specific page
    const { data: pageData } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (pageData) {
      const { data: rowsData } = await supabase
        .from("page_rows")
        .select("*")
        .eq("page_id", pageData.id)
        .order("position");

      const { data: componentsData } = await supabase
        .from("page_components")
        .select("*")
        .eq("page_id", pageData.id)
        .order("position");

      setPage(pageData);
      setRows(rowsData || []);
      setComponents(componentsData || []);

      // Load layout if assigned
      if (pageData.layout_id) {
        const { data: layoutData } = await supabase
          .from("layouts")
          .select("*")
          .eq("id", pageData.layout_id!)
          .eq("is_published", true)
          .maybeSingle();

        if (layoutData) {
          const { data: layoutRowsData } = await supabase
            .from("layout_rows")
            .select("*")
            .eq("layout_id", layoutData.id)
            .order("position");

          const { data: layoutComponentsData } = await supabase
            .from("layout_components")
            .select("*")
            .eq("layout_id", layoutData.id)
            .order("position");

          setLayout(layoutData);
          setLayoutRows(layoutRowsData || []);
          setLayoutComponents(layoutComponentsData || []);
        }
      }

      // Fetch widget data for all widget instances
      const widgetInstances = (componentsData || []).filter(
        (c): c is PageComponent & { widget_id: string } =>
          Boolean(c.is_widget_instance && c.widget_id)
      );
      const widgetDataMap = new Map<string, { rows: any[]; components: any[] }>();

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

      setWidgetData(widgetDataMap);
    }

    setLoading(false);
  };

  const getPageColumnComponents = (rowId: string, columnIndex: number) => {
    return components
      .filter((c) => c.row_id === rowId && c.column_index === columnIndex)
      .sort((a, b) => a.position - b.position);
  };

  const getLayoutColumnComponents = (rowId: string, columnIndex: number) => {
    return layoutComponents
      .filter((c) => c.row_id === rowId && c.column_index === columnIndex)
      .sort((a, b) => a.position - b.position);
  };

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  const renderWidgetContent = (widgetId: string) => {
    const widget = widgetData.get(widgetId);
    if (!widget) return null;

    return widget.rows
      .sort((a, b) => a.position - b.position)
      .map((row) => {
        const rowComponents = widget.components
          .filter((c: any) => c.row_id === row.id)
          .sort((a: any, b: any) => a.position - b.position);

        const columnComponents: any[] = Array.from(
          { length: row.columns },
          () => []
        );

        rowComponents.forEach((comp: any) => {
          if (comp.column_index < row.columns) {
            columnComponents[comp.column_index].push(comp);
          }
        });

        return (
          <div
            key={row.id}
            className={`grid gap-6 ${gridClasses[row.columns as keyof typeof gridClasses]}`}
          >
            {columnComponents.map((colComps, colIndex) => (
              <div key={colIndex} className="space-y-6">
                {colComps.map((component: any) => (
                  <ComponentRenderer key={component.id} component={component} />
                ))}
              </div>
            ))}
          </div>
        );
      });
  };

  const renderPageContent = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      {!layout && <h1 className="text-4xl font-bold mb-8">{page?.title}</h1>}
      {rows.map((row) => (
        <div
          key={row.id}
          className={`grid gap-6 ${gridClasses[row.columns as keyof typeof gridClasses]}`}
        >
          {Array.from({ length: row.columns }, (_, columnIndex) => (
            <div key={columnIndex} className="space-y-6">
              {getPageColumnComponents(row.id, columnIndex).map((component) => {
                // Render widget instances
                if (component.is_widget_instance && component.widget_id) {
                  return (
                    <div key={component.id}>
                      {renderWidgetContent(component.widget_id!)}
                    </div>
                  );
                }
                return <ComponentRenderer key={component.id} component={component} />;
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderLayoutContent = () => {
    if (!layout) return renderPageContent();

    return (
      <div className="space-y-8">
        {layoutRows.map((row) => (
          <div
            key={row.id}
            className={`grid gap-6 ${gridClasses[row.columns as keyof typeof gridClasses]}`}
          >
            {Array.from({ length: row.columns }, (_, columnIndex) => (
              <div key={columnIndex} className="space-y-6">
                {getLayoutColumnComponents(row.id, columnIndex).map((component) => {
                  if (component.component_type === "page-content") {
                    return (
                      <div key={component.id} className="space-y-8">
                        {renderPageContent()}
                      </div>
                    );
                  }
                  return <ComponentRenderer key={component.id} component={component} />;
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card shadow-[var(--shadow-soft)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Website
            </Link>
            <div className="flex gap-4">
              {allPages.map((p) => (
                <Link
                  key={p.id}
                  href={`/page/${p.slug}`}
                  className={`text-sm transition-colors hover:text-primary ${p.slug === slug ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-12 overflow-y-auto">
        {page ? (
          renderLayoutContent()
        ) : (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Welcome to My Website</h1>
            <p className="text-muted-foreground mb-8">
              Select a page from the navigation above to get started
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Admin Login
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicPage;
