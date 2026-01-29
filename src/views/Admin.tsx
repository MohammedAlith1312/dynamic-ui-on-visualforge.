"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageList } from "@/components/admin/PageList";
import { CreatePageDialog } from "@/components/admin/CreatePageDialog";
import { AdminLayout } from "@/components/admin/AdminLayout";

const Admin = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Pages</h1>
              <p className="text-muted-foreground mt-2">Manage your website pages</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2" data-create-page>
              <Plus className="h-4 w-4" />
              New Page
            </Button>
          </div>
          <PageList onCreatePage={() => setShowCreateDialog(true)} />
        </div>
      </div>
      <CreatePageDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </AdminLayout>
  );
};

export default Admin;
