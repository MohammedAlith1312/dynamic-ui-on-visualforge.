import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FormSubmitComponentEditorProps {
  content: {
    buttonText?: string;
    buttonVariant?: string;
    successMessage?: string;
    submitAction?: "entity" | "custom" | "email";
    entityId?: string;
    customEndpoint?: string;
    emailTo?: string;
  };
  onUpdate: (content: any) => void;
}

export const FormSubmitComponentEditor = ({ content, onUpdate }: FormSubmitComponentEditorProps) => {
  const buttonText = content.buttonText || "Submit";
  const buttonVariant = content.buttonVariant || "default";
  const successMessage = content.successMessage || "Form submitted successfully!";
  const submitAction = content.submitAction || "custom";
  const entityId = content.entityId || "";
  const customEndpoint = content.customEndpoint || "";
  const emailTo = content.emailTo || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Form Submit Button</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="submit-button-text">Button Text</Label>
          <Input
            id="submit-button-text"
            value={buttonText}
            onChange={(e) => onUpdate({ ...content, buttonText: e.target.value })}
            placeholder="Submit"
          />
        </div>

        <div className="space-y-2">
          <Label>Button Variant</Label>
          <Select value={buttonVariant} onValueChange={(val) => onUpdate({ ...content, buttonVariant: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="submit-success-message">Success Message</Label>
          <Textarea
            id="submit-success-message"
            value={successMessage}
            onChange={(e) => onUpdate({ ...content, successMessage: e.target.value })}
            placeholder="Form submitted successfully!"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Submit Action</Label>
          <Select value={submitAction} onValueChange={(val: any) => onUpdate({ ...content, submitAction: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entity">Save to Entity</SelectItem>
              <SelectItem value="custom">Custom Endpoint</SelectItem>
              <SelectItem value="email">Send Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {submitAction === "entity" && (
          <div className="space-y-2">
            <Label htmlFor="submit-entity-id">Entity ID</Label>
            <Input
              id="submit-entity-id"
              value={entityId}
              onChange={(e) => onUpdate({ ...content, entityId: e.target.value })}
              placeholder="Entity ID"
            />
          </div>
        )}

        {submitAction === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="submit-custom-endpoint">Custom Endpoint</Label>
            <Input
              id="submit-custom-endpoint"
              value={customEndpoint}
              onChange={(e) => onUpdate({ ...content, customEndpoint: e.target.value })}
              placeholder="https://api.example.com/submit"
            />
          </div>
        )}

        {submitAction === "email" && (
          <div className="space-y-2">
            <Label htmlFor="submit-email-to">Email To</Label>
            <Input
              id="submit-email-to"
              type="email"
              value={emailTo}
              onChange={(e) => onUpdate({ ...content, emailTo: e.target.value })}
              placeholder="recipient@example.com"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
