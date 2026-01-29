import PublicPageComponent from "@/components/PublicPageComponent";
import { supabase } from "@/integrations/supabase/client";

export default async function Home() {
    // Fetch all published pages for the navigation menu on the home page
    const { data: allPages } = await supabase
        .from("pages")
        .select("*")
        .eq("is_published", true)
        .order("menu_order");

    return (
        <PublicPageComponent
            initialData={{
                page: null as any,
                rows: [],
                components: [],
                layout: null,
                layoutRows: [],
                layoutComponents: [],
                allPages: allPages || [],
                widgetData: {}
            }}
        />
    );
}
