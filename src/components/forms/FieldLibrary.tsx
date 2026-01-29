import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, Type, Mail, Phone, Hash, Calendar, Clock, Upload, Image, Link, Lock, Palette, Gauge, Star, FileSignature, FileType, ChevronRight, ChevronDown } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

interface FieldLibraryProps {
  onAddField: (fieldType: string, sectionId?: string) => void;
}

const DraggableFieldButton = ({ field, onAddField }: { field: { type: string; label: string; icon: any }; onAddField: (type: string) => void }) => {
  const Icon = field.icon;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${field.type}`,
    data: { fieldType: field.type },
  });

  return (
    <Button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      variant="ghost"
      className="w-full justify-start gap-2 h-9 cursor-grab active:cursor-grabbing"
      onClick={() => onAddField(field.type)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{field.label}</span>
    </Button>
  );
};

const BASIC_FIELDS = [
  { type: "text", label: "Text", icon: Type },
  { type: "email", label: "Email", icon: Mail },
  { type: "tel", label: "Phone", icon: Phone },
  { type: "number", label: "Number", icon: Hash },
  { type: "textarea", label: "Long Text", icon: FileType },
  { type: "select", label: "Dropdown", icon: ChevronDown },
  { type: "radio", label: "Radio", icon: ChevronRight },
  { type: "checkbox", label: "Checkbox", icon: ChevronDown },
  { type: "date", label: "Date", icon: Calendar },
  { type: "time", label: "Time", icon: Clock },
  { type: "file", label: "File Upload", icon: Upload },
];

const ADVANCED_FIELDS = [
  { type: "multi-select", label: "Multi-Select", icon: ChevronDown },
  { type: "datetime", label: "Date & Time", icon: Calendar },
  { type: "url", label: "URL", icon: Link },
  { type: "password", label: "Password", icon: Lock },
  { type: "color", label: "Color Picker", icon: Palette },
  { type: "range", label: "Range Slider", icon: Gauge },
  { type: "rating", label: "Rating", icon: Star },
  { type: "signature", label: "Signature", icon: FileSignature },
  { type: "richtext", label: "Rich Text", icon: FileType },
  { type: "image", label: "Image Upload", icon: Image },
  { type: "hidden", label: "Hidden Field", icon: Type },
];

export function FieldLibrary({ onAddField }: FieldLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBasic, setExpandedBasic] = useState(true);
  const [expandedAdvanced, setExpandedAdvanced] = useState(false);

  const filteredBasic = BASIC_FIELDS.filter(field =>
    field.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdvanced = ADVANCED_FIELDS.filter(field =>
    field.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-3">Field Library</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <button
          onClick={() => setExpandedBasic(!expandedBasic)}
          className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-primary transition-colors"
        >
          <span>Basic Fields</span>
          {expandedBasic ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {expandedBasic && (
          <div className="space-y-1">
            {filteredBasic.map((field) => (
              <DraggableFieldButton 
                key={field.type} 
                field={field} 
                onAddField={onAddField} 
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <button
          onClick={() => setExpandedAdvanced(!expandedAdvanced)}
          className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-primary transition-colors"
        >
          <span>Advanced Fields</span>
          {expandedAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {expandedAdvanced && (
          <div className="space-y-1">
            {filteredAdvanced.map((field) => (
              <DraggableFieldButton 
                key={field.type} 
                field={field} 
                onAddField={onAddField} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}