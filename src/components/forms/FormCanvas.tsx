import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

interface FormCanvasProps {
  fields: any[];
  sections: any[];
  onSelectField: (field: any) => void;
  onSelectSection: (section: any) => void;
  onDeleteField: (fieldId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddSection: () => void;
}

export function FormCanvas({ fields, sections, onSelectField, onSelectSection, onDeleteField, onDeleteSection, onAddSection }: FormCanvasProps) {
  // Group fields by section
  const fieldsBySection = fields.reduce((acc, field) => {
    const sectionId = field.section_id || 'no-section';
    if (!acc[sectionId]) acc[sectionId] = [];
    acc[sectionId].push(field);
    return acc;
  }, {} as Record<string, any[]>);

  const SortableField = ({ field }: { field: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: field.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <Card
        ref={setNodeRef}
        style={style}
        className="p-4 cursor-pointer hover:border-primary transition-colors group relative"
        onClick={() => onSelectField(field)}
      >
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{field.label}</span>
              {field.is_required && (
                <Badge variant="secondary" className="text-xs">Required</Badge>
              )}
              <Badge variant="outline" className="text-xs">{field.field_type}</Badge>
            </div>

            {field.placeholder && (
              <p className="text-sm text-muted-foreground">Placeholder: {field.placeholder}</p>
            )}

            {field.help_text && (
              <p className="text-xs text-muted-foreground mt-1">{field.help_text}</p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteField(field.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  };

  const SortableSection = ({ section, sectionFields }: { section: any; sectionFields: any[] }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: section.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <Card
        ref={setNodeRef}
        style={style}
        className="border-2 border-primary/20 bg-primary/5"
      >
        <CardHeader
          className="cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => onSelectSection(section)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="text-xs">
                    {section.section_type}
                  </Badge>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
                {section.description && (
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSection(section.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {sectionFields.map((field) => (
            <SortableField key={field.id} field={field} />
          ))}
          {sectionFields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
              No fields in this section yet. Drag fields here from the library.
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const DroppableCanvas = () => {
    const { setNodeRef } = useDroppable({
      id: 'canvas-no-section',
    });

    return (
      <div ref={setNodeRef} className="max-w-3xl mx-auto space-y-4">
        <Card className="border-dashed border-2 p-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">No fields or sections yet</p>
            <p className="text-sm">Drag fields from the left sidebar or add sections below</p>
          </div>
        </Card>
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={onAddSection}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section / Tab / Step
        </Button>
      </div>
    );
  };

  if (fields.length === 0 && sections.length === 0) {
    return <DroppableCanvas />;
  }

  const { setNodeRef: setCanvasRef } = useDroppable({
    id: 'canvas-no-section',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Sections */}
      {sections.map((section) => (
        <SortableSection
          key={section.id}
          section={section}
          sectionFields={fieldsBySection[section.id] || []}
        />
      ))}

      {/* Fields without section */}
      <div className="space-y-3" ref={setCanvasRef}>
        {fieldsBySection['no-section']?.map((field: any) => (
          <SortableField key={field.id} field={field} />
        ))}
        {(!fieldsBySection['no-section'] || fieldsBySection['no-section'].length === 0) && sections.length > 0 && (
          <Card className="border-dashed border-2 p-8">
            <p className="text-sm text-muted-foreground text-center">
              Drop fields here or into a section above
            </p>
          </Card>
        )}
      </div>

      {/* Add Section Button */}
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={onAddSection}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Section / Tab / Step
      </Button>
    </div>
  );
}