"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function FormSettings() {
  const params = useParams();
  const formId = params?.formId as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    if (!formId) return;

    const { data, error } = await supabase
      .from("forms" as any)
      .select("*")
      .eq("id", formId)
      .single();

    if (error) {
      toast.error("Failed to load form");
      console.error(error);
      router.push("/admin/forms");
    } else {
      setForm(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formId || !form) return;

    setSaving(true);
    const { error } = await supabase
      .from("forms" as any)
      .update({
        name: form.name,
        title: form.title,
        description: form.description,
        submit_button_text: form.submit_button_text,
        success_message: form.success_message,
        redirect_url: form.redirect_url,
        allow_multiple_submissions: form.allow_multiple_submissions,
        require_authentication: form.require_authentication,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formId);

    if (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } else {
      toast.success("Settings saved");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto space-y-6">
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
                <h1 className="text-3xl font-bold">Form Settings</h1>
                <p className="text-muted-foreground">{form.title}</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic form information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Form Name (Internal)</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="contact-form"
                />
              </div>

              <div>
                <Label htmlFor="title">Form Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contact Us"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the form"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission Settings</CardTitle>
              <CardDescription>Configure how submissions are handled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="submit_text">Submit Button Text</Label>
                <Input
                  id="submit_text"
                  value={form.submit_button_text}
                  onChange={(e) => setForm({ ...form, submit_button_text: e.target.value })}
                  placeholder="Submit"
                />
              </div>

              <div>
                <Label htmlFor="success_message">Success Message</Label>
                <Textarea
                  id="success_message"
                  value={form.success_message}
                  onChange={(e) => setForm({ ...form, success_message: e.target.value })}
                  placeholder="Thank you for your submission!"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="redirect_url">Redirect URL (Optional)</Label>
                <Input
                  id="redirect_url"
                  type="url"
                  value={form.redirect_url || ""}
                  onChange={(e) => setForm({ ...form, redirect_url: e.target.value })}
                  placeholder="https://example.com/thank-you"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Redirect users to this URL after successful submission
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Multiple Submissions</Label>
                  <p className="text-xs text-muted-foreground">
                    Users can submit the form multiple times
                  </p>
                </div>
                <Switch
                  checked={form.allow_multiple_submissions}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, allow_multiple_submissions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Only logged-in users can submit the form
                  </p>
                </div>
                <Switch
                  checked={form.require_authentication}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, require_authentication: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Email notifications (Coming soon)</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Email notification features will be available in a future update.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>External integrations (Coming soon)</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Webhook integrations will be available in a future update.
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
