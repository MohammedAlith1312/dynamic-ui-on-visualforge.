import { supabase } from "@/integrations/supabase/client";
import PublicPageComponent from "@/components/PublicPageComponent";
import { notFound } from "next/navigation";
import { Tables } from "@/integrations/supabase/types";



export async function generateStaticParams() {
    const { data: pages } = await supabase
        .from("pages")
        .select("slug")
        .eq("is_published", true);

    return pages?.map((page) => ({
        slug: page.slug,
    })) || [];
}

export default async function PageBySlug({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // 1. Fetch the page and all pages for navigation
    const [pageResult, allPagesResult] = await Promise.all([
        supabase.from("pages").select("*").eq("slug", slug).eq("is_published", true).single(),
        supabase.from("pages").select("*").eq("is_published", true).order("menu_order")
    ]);

    const page = pageResult.data;
    const allPages = allPagesResult.data || [];

    if (!page) {
        notFound();
    }

    // 2. Fetch rows and components
    const [rowsResult, componentsResult] = await Promise.all([
        supabase.from("page_rows").select("*").eq("page_id", page.id).order("position"),
        supabase.from("page_components").select("*").eq("page_id", page.id).order("position")
    ]);

    const rows = rowsResult.data || [];
    const components = componentsResult.data || [];

    // 3. Fetch layout if exists
    let layout: Tables<"layouts"> | null = null;
    let layoutRows: Tables<"layout_rows">[] = [];
    let layoutComponents: Tables<"layout_components">[] = [];

    if (page.layout_id) {
        const { data: layoutData } = await supabase
            .from("layouts")
            .select("*")
            .eq("id", page.layout_id)
            .eq("is_published", true)
            .maybeSingle();

        if (layoutData) {
            const [lRows, lComps] = await Promise.all([
                supabase.from("layout_rows").select("*").eq("layout_id", layoutData.id).order("position"),
                supabase.from("layout_components").select("*").eq("layout_id", layoutData.id).order("position")
            ]);
            layout = layoutData;
            layoutRows = lRows.data || [];
            layoutComponents = lComps.data || [];
        }
    }

    // 4. Fetch widget data
    const widgetInstances = components.filter(c => c.is_widget_instance && c.widget_id);
    const widgetIds = Array.from(new Set(widgetInstances.map(c => c.widget_id!)));

    const widgetData: Record<string, { rows: any[]; components: any[] }> = {};

    for (const widgetId of widgetIds) {
        const [wRows, wComps] = await Promise.all([
            supabase.from("widget_rows").select("*").eq("widget_id", widgetId).order("position"),
            supabase.from("widget_components").select("*").eq("widget_id", widgetId).order("position")
        ]);
        widgetData[widgetId] = {
            rows: wRows.data || [],
            components: wComps.data || []
        };
    }

    return (
        <PublicPageComponent
            slug={slug}
            initialData={{
                page,
                rows,
                components,
                layout,
                layoutRows,
                layoutComponents,
                allPages,
                widgetData
            }}
        />
    );
}
