"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Settings2, Table2, LayoutGrid, Columns3, Images, List, Clock, Calendar, BarChart3 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { EntityRecordDialog } from "@/components/entities/EntityRecordDialog";
import { ViewOptionsPanel } from "@/components/entities/ViewOptionsPanel";
import { ViewSelector, ViewSelectorRef } from "@/components/entities/ViewSelector";
import { CardView } from "@/components/entities/views/CardView";
import { KanbanView } from "@/components/entities/views/KanbanView";
import { GalleryView } from "@/components/entities/views/GalleryView";
import { ListView } from "@/components/entities/views/ListView";
import { TimelineView } from "@/components/entities/views/TimelineView";
import { CalendarView } from "@/components/entities/views/CalendarView";
import { GanttView } from "@/components/entities/views/GanttView";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import { getEntity, getFields } from "@/lib/schema-service";
import { E_FieldDataType } from "@/components/entities/FieldEditor";
import { EntityRecord, EntityField, Entity } from "@/types/entity";


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
}

interface ViewOptions {
  viewType?: 'table' | 'card' | 'kanban' | 'gallery' | 'list' | 'timeline' | 'calendar' | 'gantt';
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

const EntityRecords = () => {
  const router = useRouter();
  const params = useParams();
  const entityId = params.entityId as string;
  const [entity, setEntity] = useState<Entity | null>(null);
  const [fields, setFields] = useState<EntityField[]>([]);
  const [records, setRecords] = useState<EntityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EntityRecord | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    visibleColumns: [],
    sortField: null,
    sortOrder: 'asc',
    filters: [],
  });
  const [selectedViewName, setSelectedViewName] = useState<string>("Default View");
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const viewSelectorRef = useRef<ViewSelectorRef>(null);

  useEffect(() => {
    loadData();
  }, [entityId]);

  const loadData = async () => {
    if (!entityId) return;

    setLoading(true);

    // Load schema from schema service instead of Supabase
    const entityData = await getEntity(entityId);
    const fieldsData = await getFields(entityId);

    // Load actual records from Supabase
    const { data: recordsData, error: recordsError } = await supabase
      .from("entity_records")
      .select("*")
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (!entityData || recordsError) {
      toast.error("Failed to load data");
      console.error({ recordsError });
    } else {
      setEntity(entityData);
      const loadedFields = fieldsData as any[] || [];
      setFields(loadedFields);
      setRecords(recordsData || []);

      // Initialize visible columns with all fields
      if (viewOptions.visibleColumns.length === 0 && loadedFields.length > 0) {
        setViewOptions(prev => ({
          ...prev,
          visibleColumns: loadedFields.map(f => f.id),
        }));
      }
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteRecordId) return;

    const { error } = await supabase
      .from("entity_records")
      .delete()
      .eq("id", deleteRecordId);

    if (error) {
      toast.error("Failed to delete record");
      console.error(error);
    } else {
      toast.success("Record deleted");
      loadData();
    }
    setDeleteRecordId(null);
  };

  const handleTogglePublish = async (recordId: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from("entity_records")
      .update({ is_published: !currentStatus })
      .eq("id", recordId);

    if (error) {
      toast.error("Failed to update record");
      console.error(error);
    } else {
      toast.success(`Record ${!currentStatus ? "published" : "unpublished"}`);
      loadData();
    }
  };

  const handleFieldEdit = async (fieldId: string) => {
    router.push(`/admin/entities/${entityId}/editor`);
  };

  const filteredRecords = records.filter((record) => {
    if (!search) return true;
    return Object.values(record.data).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  // Apply sorting
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (!viewOptions.sortField) return 0;

    const aValue = a.data[viewOptions.sortField];
    const bValue = b.data[viewOptions.sortField];

    if (aValue === bValue) return 0;

    const comparison = aValue > bValue ? 1 : -1;
    return viewOptions.sortOrder === 'asc' ? comparison : -comparison;
  });

  const visibleFields = fields.filter(f => viewOptions.visibleColumns.includes(f.id));

  const renderView = () => {
    const viewType = viewOptions.viewType || 'table';

    const commonProps = {
      records: sortedRecords,
      fields,
      onEdit: (record: EntityRecord) => { setEditingRecord(record); setShowRecordDialog(true); },
      onDelete: (record: EntityRecord) => setDeleteRecordId(record.id),
      onTogglePublish: (record: EntityRecord) => handleTogglePublish(record.id, record.is_published),
    };

    switch (viewType) {
      case 'card':
        return <CardView {...commonProps} cardLayout={viewOptions.cardLayout} />;
      case 'kanban':
        return <KanbanView {...commonProps} kanbanConfig={viewOptions.kanbanConfig} />;
      case 'gallery':
        return <GalleryView {...commonProps} galleryConfig={viewOptions.galleryConfig} />;
      case 'list':
        return <ListView {...commonProps} listConfig={viewOptions.listConfig} />;
      case 'timeline':
        return <TimelineView {...commonProps} timelineConfig={viewOptions.timelineConfig} />;
      case 'calendar':
        return <CalendarView {...commonProps} calendarConfig={viewOptions.calendarConfig} />;
      case 'gantt':
        return <GanttView {...commonProps} ganttConfig={viewOptions.ganttConfig} entityId={entityId} />;
      case 'table':
      default:
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Status</TableHead>
                  {visibleFields.map((field) => (
                    <TableHead key={field.id} className="min-w-[150px]">
                      <div className="flex items-center justify-between">
                        {field.display_name}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-32 text-right sticky right-0 bg-card">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Badge variant={record.is_published ? "default" : "secondary"}>
                        {record.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    {visibleFields.map((field) => (
                      <TableCell key={field.id} className="max-w-xs">
                        <div className="truncate">
                          {field.field_type === E_FieldDataType.Boolean
                            ? (record.data[field.name] ? '✓' : '✗')
                            : record.data[field.name] || "-"}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="sticky right-0 bg-card">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(record.id, record.is_published)}
                        >
                          {record.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingRecord(record); setShowRecordDialog(true); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteRecordId(record.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="max-w-7xl mx-auto text-center py-12 text-muted-foreground">
            Loading records...
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!entity) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" onClick={() => router.push("/admin/entities")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{entity.display_name}</h1>
              <p className="text-muted-foreground mt-1">Manage entity records</p>
            </div>
            <div className="flex gap-2">
              <ViewOptionsPanel
                entityId={entityId!}
                fields={fields}
                viewOptions={viewOptions}
                onViewOptionsChange={setViewOptions}
                currentViewName={selectedViewName}
                currentViewId={selectedViewId}
                onViewSaved={() => viewSelectorRef.current?.refreshViews()}
              />
              <Button variant="outline" size="sm" onClick={() => handleFieldEdit(entityId!)}>
                <Settings2 className="h-4 w-4 mr-2" />
                Edit Fields
              </Button>
              <Button onClick={() => { setEditingRecord(null); setShowRecordDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <div className="mb-4 space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <ViewSelector
                  ref={viewSelectorRef}
                  entityId={entityId!}
                  currentView={viewOptions}
                  onViewLoad={setViewOptions}
                  onViewNameChange={setSelectedViewName}
                  onViewIdChange={setSelectedViewId}
                />

                <div className="flex-1 min-w-[200px]">
                  <ToggleGroup
                    type="single"
                    value={viewOptions.viewType || 'table'}
                    onValueChange={(value) => {
                      if (value) setViewOptions({ ...viewOptions, viewType: value as any });
                    }}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="table" aria-label="Table view" title="Table">
                      <Table2 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="card" aria-label="Card view" title="Card">
                      <LayoutGrid className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="kanban" aria-label="Kanban view" title="Kanban">
                      <Columns3 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="gallery" aria-label="Gallery view" title="Gallery">
                      <Images className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view" title="List">
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="timeline" aria-label="Timeline view" title="Timeline">
                      <Clock className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="calendar" aria-label="Calendar view" title="Calendar">
                      <Calendar className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="gantt" aria-label="Gantt view" title="Gantt">
                      <BarChart3 className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              <Input
                placeholder="Search records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {sortedRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {search ? "No records match your search" : "No records yet"}
              </div>
            ) : (
              renderView()
            )}
          </Card>
        </div>
      </div>

      <EntityRecordDialog
        open={showRecordDialog}
        onOpenChange={setShowRecordDialog}
        entityId={entityId!}
        fields={fields}
        record={editingRecord}
        onSuccess={loadData}
      />

      <AlertDialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default EntityRecords;
