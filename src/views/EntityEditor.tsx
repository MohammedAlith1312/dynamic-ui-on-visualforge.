"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { FieldEditor, E_FieldDataType } from "@/components/entities/FieldEditor";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { getEntity, getFields, updateEntity, saveFields } from "@/lib/schema-service";

interface Entity {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_published: boolean;
}

interface EntityField {
  id: string;
  entity_id: string;
  name: string;
  display_name: string;
  field_type: E_FieldDataType;
  is_required: boolean;
  default_value: any;
  position: number;
}

const EntityEditor = () => {
  const router = useRouter();
  const params = useParams();
  const entityId = params.entityId as string;
  const [entity, setEntity] = useState<Entity | null>(null);
  const [fields, setFields] = useState<EntityField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEntity();
  }, [entityId]);

  const loadEntity = async () => {
    if (!entityId) return;

    setLoading(true);

    // Load from schema service instead of direct JSON import
    const entityData = await getEntity(entityId);
    const fieldsData = await getFields(entityId);

    if (!entityData) {
      toast.error("Entity not found in schema");
      router.push("/admin/entities");
      return;
    }

    setEntity(entityData as any);
    setFields((fieldsData as any[]).sort((a, b) => a.position - b.position));
    setLoading(false);
  };

  const handleSaveEntity = async () => {
    if (!entity || !entityId) return;
    setSaving(true);
    try {
      const result = await updateEntity(entityId, entity);
      if (result.success) {
        toast.success("Entity settings saved (via API)");
      } else {
        toast.error("Failed to save entity settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFields = async (updatedFields: EntityField[]) => {
    if (!entityId) return;
    try {
      const result = await saveFields(entityId, updatedFields, entity);
      if (result.success) {
        toast.success("Fields saved successfully (via API)");
        setFields([]);
        loadEntity();
      } else {
        toast.error("Failed to save fields");
      }
    } catch (error) {
      toast.error("An error occurred while saving fields");
    }
  };

  const handleAddField = () => {
    const newField: EntityField = {
      id: crypto.randomUUID(),
      entity_id: entityId!,
      name: `field_${fields.length + 1}`,
      display_name: `New Field ${fields.length + 1}`,
      field_type: E_FieldDataType.String,
      is_required: false,
      default_value: null,
      position: fields.length,
    };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    // handleSaveFields(updatedFields);
  };

  const handleUpdateField = (index: number, updates: Partial<EntityField>) => {
    const updatedFields = fields.map((f, i) =>
      i === index ? { ...f, ...updates } : f
    );
    setFields(updatedFields);
    // Debounce this in a real app
    // handleSaveFields(updatedFields);
  };

  const handleDeleteField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index)
      .map((f, index) => ({ ...f, position: index }));
    setFields(updatedFields);
    // handleSaveFields(updatedFields);
  };

  // const handleDragEnd = (event: DragEndEvent) => {
  //   const { active, over } = event;
  //   if (over && active.id !== over.id) {
  //     const oldIndex = fields.findIndex((f) => f.id === active.id);
  //     const newIndex = fields.findIndex((f) => f.id === over.id);
  //     const reorderedFields = arrayMove(fields, oldIndex, newIndex).map((f, index) => ({
  //       ...f,
  //       position: index,
  //     }));
  //     setFields(reorderedFields);
  //     // handleSaveFields(reorderedFields);
  //   }
  // };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="max-w-4xl mx-auto text-center py-12 text-muted-foreground">
            Loading entity...
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!entity) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" onClick={() => router.push("/admin/entities")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Edit Entity</h1>
              <p className="text-muted-foreground mt-1">Configure entity settings and fields (via API)</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveEntity} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Entity Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Internal Name</Label>
                  <Input value={entity.name} disabled />
                  <p className="text-xs text-muted-foreground">Cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={entity.display_name}
                    onChange={(e) => setEntity({ ...entity, display_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={entity.description || ""}
                    onChange={(e) => setEntity({ ...entity, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Published</Label>
                  <Switch
                    checked={entity.is_published}
                    onCheckedChange={(checked) => setEntity({ ...entity, is_published: checked })}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Fields</h2>
                <Button onClick={handleAddField} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
                <Button onClick={() => handleSaveFields(fields)} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Fields
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No fields yet. Add your first field to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <FieldEditor
                      key={field.id}
                      field={field}
                      onUpdate={(updates) => handleUpdateField(index, updates)}
                      onDelete={() => handleDeleteField(index)}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EntityEditor;
