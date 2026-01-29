import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface FormPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  fields: any[];
  sections: any[];
}

export const FormPreviewModal = ({
  open,
  onOpenChange,
  form,
  fields,
  sections
}: FormPreviewModalProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [rating, setRating] = useState<Record<string, number>>({});
  const [date, setDate] = useState<Record<string, Date | undefined>>({});
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const tabSections = sections.filter(s => s.section_type === "tab").sort((a, b) => a.position - b.position);
  const isMultiStep = tabSections.length > 0;

  const validateCurrentTab = () => {
    if (!isMultiStep) return true;

    const currentSection = tabSections[currentTabIndex];
    const sectionFields = fields.filter(f => f.section_id === currentSection.id && f.is_required);

    for (const field of sectionFields) {
      const value = formData[field.field_name] || date[field.field_name];

      if (!value || (Array.isArray(value) && value.length === 0)) {
        toast.error(`Please fill in required field: ${field.label}`);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentTab() && currentTabIndex < tabSections.length - 1) {
      setCurrentTabIndex(currentTabIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setCurrentTabIndex(currentTabIndex - 1);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.field_name] || field.default_value || "";
    const widthClassMap = {
      full: "col-span-12",
      half: "col-span-12 md:col-span-6",
      third: "col-span-12 md:col-span-4",
      quarter: "col-span-12 md:col-span-3",
    };
    const widthClass = widthClassMap[(field.column_width as keyof typeof widthClassMap)] || widthClassMap.full;

    if (field.field_type === "hidden") {
      return null;
    }

    return (
      <div key={field.id} className={widthClass}>
        <div className="space-y-2">
          {field.field_type !== "checkbox" && (
            <Label htmlFor={field.field_name}>
              {field.label}
              {field.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          {field.help_text && (
            <p className="text-sm text-muted-foreground">{field.help_text}</p>
          )}

          {/* Text-based fields */}
          {["text", "email", "tel", "url", "password", "number"].includes(field.field_type) && (
            <Input
              id={field.field_name}
              type={field.field_type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.value })}
              required={field.is_required}
            />
          )}

          {/* Textarea */}
          {field.field_type === "textarea" && (
            <Textarea
              id={field.field_name}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.value })}
              required={field.is_required}
              rows={4}
            />
          )}

          {/* Select */}
          {field.field_type === "select" && (
            <Select value={value} onValueChange={(val) => setFormData({ ...formData, [field.field_name]: val })}>
              <SelectTrigger id={field.field_name}>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt: any) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Radio */}
          {field.field_type === "radio" && (
            <RadioGroup value={value} onValueChange={(val) => setFormData({ ...formData, [field.field_name]: val })}>
              {field.options?.map((opt: any) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={`${field.field_name}-${opt.value}`} />
                  <Label htmlFor={`${field.field_name}-${opt.value}`} className="font-normal">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Checkbox (single or multiple) */}
          {field.field_type === "checkbox" && (
            <div className="space-y-2">
              {field.options?.length > 0 ? (
                // Multiple checkboxes
                field.options.map((opt: any) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.field_name}-${opt.value}`}
                      checked={formData[field.field_name]?.includes(opt.value)}
                      onCheckedChange={(checked) => {
                        const current = formData[field.field_name] || [];
                        const updated = checked
                          ? [...current, opt.value]
                          : current.filter((v: string) => v !== opt.value);
                        setFormData({ ...formData, [field.field_name]: updated });
                      }}
                    />
                    <Label htmlFor={`${field.field_name}-${opt.value}`} className="font-normal">
                      {opt.label}
                    </Label>
                  </div>
                ))
              ) : (
                // Single checkbox
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.field_name}
                    checked={!!formData[field.field_name]}
                    onCheckedChange={(checked) => setFormData({ ...formData, [field.field_name]: checked })}
                  />
                  <Label htmlFor={field.field_name} className="font-normal">
                    {field.label}
                    {field.is_required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Date */}
          {field.field_type === "date" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date[field.field_name] && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date[field.field_name] ? format(date[field.field_name]!, "PPP") : <span>{field.placeholder || "Pick a date"}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date[field.field_name]}
                  onSelect={(d) => setDate({ ...date, [field.field_name]: d })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Time */}
          {field.field_type === "time" && (
            <Input
              id={field.field_name}
              type="time"
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.value })}
              required={field.is_required}
            />
          )}

          {/* DateTime */}
          {field.field_type === "datetime" && (
            <Input
              id={field.field_name}
              type="datetime-local"
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.value })}
              required={field.is_required}
            />
          )}

          {/* File */}
          {["file", "image"].includes(field.field_type) && (
            <Input
              id={field.field_name}
              type="file"
              accept={field.field_type === "image" ? "image/*" : undefined}
              onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.files?.[0] })}
              required={field.is_required}
            />
          )}

          {/* Color */}
          {field.field_type === "color" && (
            <Input
              id={field.field_name}
              type="color"
              value={value || "#000000"}
              onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.value })}
              className="h-10"
            />
          )}

          {/* Range */}
          {field.field_type === "range" && (
            <div className="space-y-2">
              <Slider
                value={[Number(value) || field.validation_rules?.min || 0]}
                onValueChange={([val]) => setFormData({ ...formData, [field.field_name]: val })}
                min={field.validation_rules?.min || 0}
                max={field.validation_rules?.max || 100}
                step={1}
              />
              <div className="text-sm text-muted-foreground text-center">
                Value: {value || field.validation_rules?.min || 0}
              </div>
            </div>
          )}

          {/* Rating */}
          {field.field_type === "rating" && (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating({ ...rating, [field.field_name]: star });
                    setFormData({ ...formData, [field.field_name]: star });
                  }}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      star <= (rating[field.field_name] || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (section: any, sectionFields: any[]) => {
    return (
      <div key={section.id} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
        <div className="grid grid-cols-12 gap-4">
          {sectionFields.map(renderField)}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Get fields without sections (ungrouped)
    const ungroupedFields = fields.filter(f => !f.section_id).sort((a, b) => a.position - b.position);

    // Check if we have tab sections
    const tabSections = sections.filter(s => s.section_type === "tab").sort((a, b) => a.position - b.position);
    const regularSections = sections.filter(s => s.section_type !== "tab").sort((a, b) => a.position - b.position);

    if (tabSections.length > 0) {
      const currentSection = tabSections[currentTabIndex];
      const sectionFields = fields
        .filter(f => f.section_id === currentSection?.id)
        .sort((a, b) => a.position - b.position);

      return (
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Step {currentTabIndex + 1} of {tabSections.length}
            </div>
            <div className="flex gap-2">
              {tabSections.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 w-8 rounded-full transition-colors",
                    index === currentTabIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Current tab content */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{currentSection?.title}</h3>
              {currentSection?.description && (
                <p className="text-sm text-muted-foreground">{currentSection.description}</p>
              )}
            </div>
            <div className="grid grid-cols-12 gap-4">
              {sectionFields.map(renderField)}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentTabIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentTabIndex < tabSections.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit">
                {form?.submit_button_text || "Submit"}
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Render regular sections */}
        {regularSections.map((section) => {
          const sectionFields = fields
            .filter(f => f.section_id === section.id)
            .sort((a, b) => a.position - b.position);
          return renderSection(section, sectionFields);
        })}

        {/* Render ungrouped fields */}
        {ungroupedFields.length > 0 && (
          <div className="grid grid-cols-12 gap-4">
            {ungroupedFields.map(renderField)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <div className="flex items-center justify-between border-b px-6 py-4 bg-card">
          <div>
            <h2 className="text-xl font-semibold">{form?.title}</h2>
            {form?.description && (
              <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>{form?.title}</CardTitle>
              {form?.description && <CardDescription>{form.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {renderContent()}

                {!isMultiStep && (
                  <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg">
                      {form?.submit_button_text || "Submit"}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
