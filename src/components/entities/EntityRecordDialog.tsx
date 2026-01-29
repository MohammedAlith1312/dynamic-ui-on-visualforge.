import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { E_FieldDataType } from "./FieldEditor";
import { getEntity } from "@/lib/schema-service";

import { EntityRecord, EntityField } from "@/types/entity";

interface EntityRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  fields: EntityField[];
  record: EntityRecord | null;
  onSuccess: () => void;
}

export const EntityRecordDialog = ({
  open,
  onOpenChange,
  entityId,
  fields,
  record,
  onSuccess,
}: EntityRecordDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData(record.data);
      setIsPublished(record.is_published ?? false);
    } else {
      const initialData: Record<string, any> = {};
      fields.forEach((field) => {
        initialData[field.name] = field.default_value || "";
      });
      setFormData(initialData);
      setIsPublished(false);
    }
  }, [record, fields, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      // Validate required fields
      for (const field of fields) {
        if (field.is_required && (!formData[field.name] || formData[field.name] === "")) {
          toast.error(`${field.display_name} is required`);
          setLoading(false);
          return;
        }
      }

      if (record) {
        // Update existing record
        const { error } = await supabase
          .from("entity_records")
          .update({
            data: formData,
            is_published: isPublished,
          })
          .eq("id", record.id);

        if (error) throw error;
        toast.success("Record updated successfully");
      } else {
        // Check if entity exists in Supabase
        const { data: existingEntity } = await supabase
          .from("entities")
          .select("id")
          .eq("id", entityId)
          .single();

        if (!existingEntity) {
          // Fetch entity details from remote API
          const remoteEntity = await getEntity(entityId);
          if (remoteEntity) {
            // Create entity in Supabase
            const { error: createError } = await supabase
              .from("entities")
              .insert({
                id: entityId,
                name: remoteEntity.name,
                display_name: remoteEntity.display_name,
                description: remoteEntity.description,
                user_id: user.id,
              });

            if (createError) {
              console.error("Failed to sync entity to Supabase:", createError);
              // We continue anyway, hoping it might work or the error is minor, 
              // but likely the FK constraint will fail next if this failed.
            }
          }
        }

        // Create new record
        const { error } = await supabase
          .from("entity_records")
          .insert({
            entity_id: entityId,
            user_id: user.id,
            data: formData,
            is_published: isPublished,
          });

        if (error) throw error;
        toast.success("Record created successfully");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: EntityField) => {
    const value = formData[field.name] || "";

    switch (field.field_type) {
      case E_FieldDataType.TextArea:
        return (
          <Textarea
            id={field.name}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.is_required}
            rows={4}
          />
        );

      case E_FieldDataType.Boolean:
        return (
          <Switch
            checked={value === "true" || value === true}
            onCheckedChange={(checked) => setFormData({ ...formData, [field.name]: checked })}
          />
        );

      case E_FieldDataType.Interger:
        return (
          <Input
            id={field.name}
            type="number"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.is_required}
          />
        );

      case E_FieldDataType.Date:
        return (
          <Input
            id={field.name}
            type="date"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.is_required}
          />
        );

      default:
        return (
          <Input
            id={field.name}
            type={field.field_type === E_FieldDataType.Image ? "url" : "text"}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.is_required}
            placeholder={field.field_type === E_FieldDataType.Image ? "https://..." : ""}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Record" : "Create New Record"}</DialogTitle>
          <DialogDescription>
            {record ? "Update the record details below" : "Fill in the details for the new record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.display_name}
                  {field.is_required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}

            <div className="flex items-center justify-between pt-4 border-t">
              <Label>Published</Label>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : record ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
