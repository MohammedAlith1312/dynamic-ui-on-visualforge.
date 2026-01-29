import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Table2, LayoutGrid, Columns3, Images, List, Clock, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardLayoutEditor } from "../entities/CardLayoutEditor";
import type { FieldInfo } from "./adapters/EntityAdapter";
import { E_FieldDataType } from "../entities/FieldEditor";

interface CardLayout {
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  displayFields: Array<{ fieldId: string; position: number }>;
}

interface KanbanConfig {
  groupByField: string;
  cardLayout: CardLayout;
}

interface GalleryConfig {
  imageField: string;
  titleField: string;
  subtitleField?: string;
}

interface ListConfig {
  titleField: string;
  subtitleField?: string;
  displayFields: Array<{ fieldId: string; position: number }>;
}

interface TimelineConfig {
  dateField: string;
  titleField: string;
  descriptionField?: string;
}

interface CalendarConfig {
  dateField: string;
  titleField: string;
}

interface GanttConfig {
  startDateField: string;
  endDateField: string;
  titleField: string;
  groupByField?: string;
  colorByField?: string;
  dependenciesField?: string;
  progressField?: string;
}

interface ViewOptions {
  visibleColumns: string[];
  sortField: string | null;
  sortOrder: 'asc' | 'desc';
  filters: Array<{ field: string; operator: string; value: string }>;
  cardLayout?: CardLayout;
  kanbanConfig?: KanbanConfig;
  galleryConfig?: GalleryConfig;
  listConfig?: ListConfig;
  timelineConfig?: TimelineConfig;
  calendarConfig?: CalendarConfig;
  ganttConfig?: GanttConfig;
}

interface DatasourceViewOptionsProps {
  fields: FieldInfo[];
  viewType: 'table' | 'card' | 'kanban' | 'gallery' | 'list' | 'timeline' | 'calendar' | 'gantt';
  viewOptions: ViewOptions;
  onViewOptionsChange: (options: ViewOptions) => void;
}

export const DatasourceViewOptions = ({ 
  fields, 
  viewType, 
  viewOptions, 
  onViewOptionsChange 
}: DatasourceViewOptionsProps) => {
  const handleColumnToggle = (fieldId: string, checked: boolean) => {
    const newVisibleColumns = checked
      ? [...viewOptions.visibleColumns, fieldId]
      : viewOptions.visibleColumns.filter(id => id !== fieldId);
    
    onViewOptionsChange({ ...viewOptions, visibleColumns: newVisibleColumns });
  };

  const handleSortChange = (fieldName: string) => {
    onViewOptionsChange({
      ...viewOptions,
      sortField: fieldName === 'none' ? null : fieldName,
    });
  };

  const handleSortOrderToggle = () => {
    onViewOptionsChange({
      ...viewOptions,
      sortOrder: viewOptions.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  // Convert FieldInfo to EntityField format for CardLayoutEditor
  const entityFields = fields.map(f => ({
    id: f.id,
    name: f.name,
    display_name: f.display_name,
    field_type: f.field_type,
  }));

  return (
    <div className="space-y-6">
      <Tabs value={viewType} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="table" className="text-xs"><Table2 className="h-3 w-3 mr-1" />Table</TabsTrigger>
          <TabsTrigger value="card" className="text-xs"><LayoutGrid className="h-3 w-3 mr-1" />Card</TabsTrigger>
          <TabsTrigger value="kanban" className="text-xs"><Columns3 className="h-3 w-3 mr-1" />Kanban</TabsTrigger>
          <TabsTrigger value="gallery" className="text-xs"><Images className="h-3 w-3 mr-1" />Gallery</TabsTrigger>
        </TabsList>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="list" className="text-xs"><List className="h-3 w-3 mr-1" />List</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs"><Clock className="h-3 w-3 mr-1" />Timeline</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs"><Calendar className="h-3 w-3 mr-1" />Calendar</TabsTrigger>
          <TabsTrigger value="gantt" className="text-xs"><BarChart3 className="h-3 w-3 mr-1" />Gantt</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-6 mt-0">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Visible Columns</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
              {fields.map((field) => (
                <div key={field.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`col-${field.name}`}
                    checked={viewOptions.visibleColumns.includes(field.name)}
                    onCheckedChange={(checked) => handleColumnToggle(field.name, checked as boolean)}
                  />
                  <Label htmlFor={`col-${field.name}`} className="font-normal cursor-pointer">
                    {field.display_name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="card" className="space-y-6 mt-0">
          <CardLayoutEditor
            fields={entityFields}
            layout={viewOptions.cardLayout || { titleField: fields[0]?.name || '', displayFields: [] }}
            onChange={(layout) => onViewOptionsChange({ ...viewOptions, cardLayout: layout })}
          />
        </TabsContent>

        <TabsContent value="kanban" className="space-y-6 mt-0">
          <div>
            <Label className="text-sm font-medium">Group By Field *</Label>
            <Select 
              value={viewOptions.kanbanConfig?.groupByField || "none"} 
              onValueChange={(value) => onViewOptionsChange({ 
                ...viewOptions, 
                kanbanConfig: {
                  groupByField: value,
                  cardLayout: viewOptions.kanbanConfig?.cardLayout || { titleField: fields[0]?.id || '', displayFields: [] }
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select field to group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {fields.filter(f => f.field_type === E_FieldDataType.String).map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4 border-t">
            <Label className="text-base font-semibold mb-4 block">Card Configuration</Label>
            <CardLayoutEditor
              fields={entityFields}
              layout={viewOptions.kanbanConfig?.cardLayout || { titleField: fields[0]?.id || '', displayFields: [] }}
              onChange={(layout) => onViewOptionsChange({ 
                ...viewOptions, 
                kanbanConfig: {
                  groupByField: viewOptions.kanbanConfig?.groupByField || '',
                  cardLayout: layout
                }
              })}
              showImageField={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6 mt-0">
          <div>
            <Label className="text-sm font-medium">Image Field *</Label>
            <Select 
              value={viewOptions.galleryConfig?.imageField || "none"} 
              onValueChange={(value) => onViewOptionsChange({ 
                ...viewOptions, 
                galleryConfig: {
                  imageField: value,
                  titleField: viewOptions.galleryConfig?.titleField || fields[0]?.id || ''
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select image field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {fields.filter(f => f.field_type === E_FieldDataType.Image).map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">Title Field *</Label>
            <Select 
              value={viewOptions.galleryConfig?.titleField || fields[0]?.id} 
              onValueChange={(value) => onViewOptionsChange({ 
                ...viewOptions, 
                galleryConfig: {
                  imageField: viewOptions.galleryConfig?.imageField || '',
                  titleField: value
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select title field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6 mt-0">
          <CardLayoutEditor
            fields={entityFields}
            layout={viewOptions.listConfig || { titleField: fields[0]?.id || '', displayFields: [] }}
            onChange={(layout) => onViewOptionsChange({ ...viewOptions, listConfig: layout })}
            showImageField={false}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6 mt-0">
          <div>
            <Label className="text-sm font-medium">Date Field *</Label>
            <Select 
              value={viewOptions.timelineConfig?.dateField || "none"} 
              onValueChange={(value) => onViewOptionsChange({ 
                ...viewOptions, 
                timelineConfig: {
                  dateField: value,
                  titleField: viewOptions.timelineConfig?.titleField || fields[0]?.id || ''
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select date field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {fields.filter(f => f.field_type === E_FieldDataType.Date).map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">Title Field *</Label>
            <Select 
              value={viewOptions.timelineConfig?.titleField || fields[0]?.id} 
              onValueChange={(value) => onViewOptionsChange({ 
                ...viewOptions, 
                timelineConfig: {
                  dateField: viewOptions.timelineConfig?.dateField || '',
                  titleField: value
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select title field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6 mt-0">
          <div>
            <Label className="text-sm font-medium">Date Field *</Label>
            <Select 
              value={viewOptions.calendarConfig?.dateField || "none"} 
              onValueChange={(value) => onViewOptionsChange({ 
                ...viewOptions, 
                calendarConfig: {
                  dateField: value,
                  titleField: viewOptions.calendarConfig?.titleField || fields[0]?.id || ''
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select date field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {fields.filter(f => f.field_type === E_FieldDataType.Date).map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">Title Field *</Label>
            <Select 
              value={viewOptions.calendarConfig?.titleField || fields[0]?.id} 
              onValueChange={(value) => onViewOptionsChange({ 
                ...viewOptions, 
                calendarConfig: {
                  dateField: viewOptions.calendarConfig?.dateField || '',
                  titleField: value
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select title field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="gantt" className="space-y-6 mt-0">
          <div>
            <Label className="text-sm font-medium">Start Date Field *</Label>
            <Select 
              value={viewOptions.ganttConfig?.startDateField || "none"} 
              onValueChange={(value) => onViewOptionsChange({ 
                ...viewOptions, 
                ganttConfig: {
                  startDateField: value,
                  endDateField: viewOptions.ganttConfig?.endDateField || '',
                  titleField: viewOptions.ganttConfig?.titleField || fields[0]?.id || ''
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select start date field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {fields.filter(f => f.field_type === E_FieldDataType.Date).map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">End Date Field *</Label>
            <Select 
              value={viewOptions.ganttConfig?.endDateField || "none"} 
              onValueChange={(value) => onViewOptionsChange({ 
                ...viewOptions, 
                ganttConfig: {
                  startDateField: viewOptions.ganttConfig?.startDateField || '',
                  endDateField: value,
                  titleField: viewOptions.ganttConfig?.titleField || fields[0]?.id || ''
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select end date field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {fields.filter(f => f.field_type === E_FieldDataType.Date).map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">Title Field *</Label>
            <Select 
              value={viewOptions.ganttConfig?.titleField || fields[0]?.id} 
              onValueChange={(value) => onViewOptionsChange({ 
                ...viewOptions, 
                ganttConfig: {
                  startDateField: viewOptions.ganttConfig?.startDateField || '',
                  endDateField: viewOptions.ganttConfig?.endDateField || '',
                  titleField: value
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select title field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Sort Options - Available for all views */}
        <div className="space-y-3 pt-6 border-t">
          <Label className="text-base font-semibold">Sort By</Label>
          <div className="flex gap-2">
            <Select value={viewOptions.sortField || "none"} onValueChange={handleSortChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select field to sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {fields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {viewOptions.sortField && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSortOrderToggle}
                className="px-3"
                title={viewOptions.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

