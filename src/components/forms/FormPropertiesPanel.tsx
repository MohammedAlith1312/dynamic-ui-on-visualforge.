import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface FormPropertiesPanelProps {
  form: any;
  onUpdate: (updates: any) => void;
}

export function FormPropertiesPanel({ form, onUpdate }: FormPropertiesPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Form Properties</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="form-name">Form Name (Internal)</Label>
          <Input
            id="form-name"
            value={form.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="contact-form"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Internal identifier (lowercase, no spaces)
          </p>
        </div>

        <div>
          <Label htmlFor="form-title">Form Title</Label>
          <Input
            id="form-title"
            value={form.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Contact Us"
          />
        </div>

        <div>
          <Label htmlFor="form-description">Description</Label>
          <Textarea
            id="form-description"
            value={form.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Brief description of the form"
            rows={3}
          />
        </div>

        <Separator />

        <div>
          <Label htmlFor="submit-text">Submit Button Text</Label>
          <Input
            id="submit-text"
            value={form.submit_button_text}
            onChange={(e) => onUpdate({ submit_button_text: e.target.value })}
            placeholder="Submit"
          />
        </div>

        <div>
          <Label htmlFor="success-message">Success Message</Label>
          <Textarea
            id="success-message"
            value={form.success_message}
            onChange={(e) => onUpdate({ success_message: e.target.value })}
            placeholder="Thank you for your submission!"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="redirect-url">Redirect URL (Optional)</Label>
          <Input
            id="redirect-url"
            type="url"
            value={form.redirect_url || ""}
            onChange={(e) => onUpdate({ redirect_url: e.target.value })}
            placeholder="https://example.com/thank-you"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Redirect users to this URL after submission
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
            onCheckedChange={(checked) => onUpdate({ allow_multiple_submissions: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Require Authentication</Label>
            <p className="text-xs text-muted-foreground">
              Only logged-in users can submit
            </p>
          </div>
          <Switch
            checked={form.require_authentication}
            onCheckedChange={(checked) => onUpdate({ require_authentication: checked })}
          />
        </div>
      </div>
    </div>
  );
}
