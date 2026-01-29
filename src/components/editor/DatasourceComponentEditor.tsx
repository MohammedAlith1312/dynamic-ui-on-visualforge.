import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Search,
  Globe,
  Table2,
  LayoutGrid,
  Columns3,
  Images,
  List,
  Clock,
  Calendar,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { DatasourceViewOptions } from "../datasource/DatasourceViewOptions";
import type { FieldInfo } from "../datasource/adapters/EntityAdapter";
import { fetchEntityData } from "../datasource/adapters/EntityAdapter";

interface DatasourceComponentEditorProps {
  component: any;
  onUpdate: (content: any) => void;
}

interface Entity {
  id: string;
  display_name: string;
}

interface Query {
  id: string;
  display_name: string;
  query_type: string;
}

interface ApiCollection {
  id: string;
  name: string;
}

interface ApiRequest {
  id: string;
  name: string;
  collection_id: string;
}

type DataSourceType = 'entity' | 'query' | 'api';
type ViewType = 'table' | 'card' | 'kanban' | 'gallery' | 'list' | 'timeline' | 'calendar' | 'gantt';

import { getEntities } from "@/lib/schema-service";

export const DatasourceComponentEditor = ({ component, onUpdate }: DatasourceComponentEditorProps) => {
  const content = component.content || {};
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Data Source
  const [dataSourceType, setDataSourceType] = useState<DataSourceType>(content.dataSourceType || 'entity');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [apiCollections, setApiCollections] = useState<ApiCollection[]>([]);
  const [apiRequests, setApiRequests] = useState<ApiRequest[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>(content.entityId || '');
  const [selectedQueryId, setSelectedQueryId] = useState<string>(content.queryId || '');
  const [selectedApiRequestId, setSelectedApiRequestId] = useState<string>(content.apiRequestId || '');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(content.apiCollectionId || '');

  // Step 2: View Type
  const [viewType, setViewType] = useState<ViewType>(content.viewType || 'table');

  // Step 3: View Options
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [viewOptions, setViewOptions] = useState(content.viewOptions || {
    visibleColumns: [],
    sortField: null,
    sortOrder: 'asc' as const,
    filters: [],
  });
  const [loadingFields, setLoadingFields] = useState(false);

  useEffect(() => {
    loadDataSources();
  }, []);

  useEffect(() => {
    if (selectedCollectionId) {
      loadApiRequests(selectedCollectionId);
    }
  }, [selectedCollectionId]);

  useEffect(() => {
    if (step >= 2 && (selectedEntityId || selectedQueryId || selectedApiRequestId)) {
      loadFieldsForDataSource();
    }
  }, [step, selectedEntityId, selectedQueryId, selectedApiRequestId]);

  const loadDataSources = async () => {
    // Load entities from schema service
    const entitiesData = await getEntities();
    setEntities((entitiesData as any[]).filter(e => e.is_published));

    // Load API collections
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: collectionsData } = await supabase
        .from("api_collections")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");
      setApiCollections(collectionsData || []);
    }
  };

  const loadApiRequests = async (collectionId: string) => {
    const { data } = await supabase
      .from("api_requests")
      .select("id, name, collection_id")
      .eq("collection_id", collectionId)
      .order("name");
    setApiRequests(data || []);
  };

  const loadFieldsForDataSource = async () => {
    setLoadingFields(true);
    try {
      let result;

      if (dataSourceType === 'entity' && selectedEntityId) {
        result = await fetchEntityData(selectedEntityId);
      } else if (dataSourceType === 'query' && selectedQueryId) {
        // For queries, we'll infer fields from the query result
        // This is a simplified approach - in production you might want to cache this
        const { data: queryData } = await supabase
          .from("queries")
          .select("id, display_name")
          .eq("id", selectedQueryId)
          .single();

        if (queryData) {
          // We'll set fields when the view is rendered
          // For now, create placeholder fields
          result = { data: [], fields: [] };
        } else {
          result = { data: [], fields: [] };
        }
      } else if (dataSourceType === 'api' && selectedApiRequestId) {
        // For API, we'll infer fields when rendering
        result = { data: [], fields: [] };
      } else {
        result = { data: [], fields: [] };
      }

      setFields(result.fields);

      // Initialize visible columns if empty
      if (viewOptions.visibleColumns.length === 0 && result.fields.length > 0) {
        setViewOptions((prev: any) => ({
          ...prev,
          visibleColumns: result.fields.map(f => f.id),
        }));
      }
    } catch (error) {
      console.error("Error loading fields:", error);
      toast.error("Failed to load fields");
    } finally {
      setLoadingFields(false);
    }
  };

  const handleStep1Complete = () => {
    if (dataSourceType === 'entity' && !selectedEntityId) {
      toast.error("Please select an entity");
      return;
    }
    if (dataSourceType === 'query' && !selectedQueryId) {
      toast.error("Please select a query");
      return;
    }
    if (dataSourceType === 'api' && !selectedApiRequestId) {
      toast.error("Please select an API request");
      return;
    }

    // Save step 1 data
    const step1Content = {
      dataSourceType,
      entityId: dataSourceType === 'entity' ? selectedEntityId : undefined,
      queryId: dataSourceType === 'query' ? selectedQueryId : undefined,
      apiRequestId: dataSourceType === 'api' ? selectedApiRequestId : undefined,
      apiCollectionId: dataSourceType === 'api' ? selectedCollectionId : undefined,
    };

    onUpdate({ ...content, ...step1Content });
    setStep(2);
  };

  const handleStep2Complete = () => {
    // Save step 2 data
    onUpdate({ ...content, viewType });
    setStep(3);
  };

  const handleViewOptionsChange = (options: any) => {
    setViewOptions(options);
    // Auto-save view options
    onUpdate({
      ...content,
      viewType,
      viewOptions: options
    });
  };

  const viewTypeOptions: { value: ViewType; label: string; icon: any; description: string }[] = [
    { value: 'table', label: 'Table', icon: Table2, description: 'Tabular data view' },
    { value: 'card', label: 'Card', icon: LayoutGrid, description: 'Card grid layout' },
    { value: 'kanban', label: 'Kanban', icon: Columns3, description: 'Kanban board' },
    { value: 'gallery', label: 'Gallery', icon: Images, description: 'Image gallery' },
    { value: 'list', label: 'List', icon: List, description: 'List view' },
    { value: 'timeline', label: 'Timeline', icon: Clock, description: 'Timeline view' },
    { value: 'calendar', label: 'Calendar', icon: Calendar, description: 'Calendar view' },
    { value: 'gantt', label: 'Gantt', icon: BarChart3, description: 'Gantt chart' },
  ];

  return (
    <div className="space-y-4">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            {step > 1 ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <span>Data Source</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            {step > 2 ? <Check className="h-4 w-4" /> : '2'}
          </div>
          <span>View Type</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            3
          </div>
          <span>View Options</span>
        </div>
      </div>

      {/* Step 1: Data Source Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Data Source Type</Label>
            <Tabs value={dataSourceType} onValueChange={(value) => setDataSourceType(value as DataSourceType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="entity">
                  <Database className="h-4 w-4 mr-2" />
                  Entity
                </TabsTrigger>
                <TabsTrigger value="query">
                  <Search className="h-4 w-4 mr-2" />
                  Query
                </TabsTrigger>
                <TabsTrigger value="api">
                  <Globe className="h-4 w-4 mr-2" />
                  API
                </TabsTrigger>
              </TabsList>

              <TabsContent value="entity" className="mt-4">
                <div className="space-y-2">
                  <Label>Select Entity</Label>
                  <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only published entities are available
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="query" className="mt-4">
                <div className="space-y-2">
                  <Label>Select Query</Label>
                  <Select value={selectedQueryId} onValueChange={setSelectedQueryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a query" />
                    </SelectTrigger>
                    <SelectContent>
                      {queries.map((query) => (
                        <SelectItem key={query.id} value={query.id}>
                          {query.display_name} ({query.query_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only published queries are available
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="api" className="mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select API Collection</Label>
                    <Select
                      value={selectedCollectionId}
                      onValueChange={(value) => {
                        setSelectedCollectionId(value);
                        setSelectedApiRequestId('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {apiCollections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCollectionId && (
                    <div className="space-y-2">
                      <Label>Select API Request</Label>
                      <Select value={selectedApiRequestId} onValueChange={setSelectedApiRequestId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a request" />
                        </SelectTrigger>
                        <SelectContent>
                          {apiRequests.map((request) => (
                            <SelectItem key={request.id} value={request.id}>
                              {request.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleStep1Complete}>
              Next: View Type <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: View Type Selection */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold mb-3 block">Select View Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {viewTypeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = viewType === option.value;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all hover:border-primary ${isSelected ? 'border-primary bg-primary/5' : ''
                      }`}
                    onClick={() => setViewType(option.value)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <CardTitle className="text-sm">{option.label}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs text-center">
                        {option.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button onClick={handleStep2Complete}>
              Next: View Options <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: View Options */}
      {step === 3 && (
        <div className="space-y-4">
          {loadingFields ? (
            <div className="text-sm text-muted-foreground">Loading fields...</div>
          ) : fields.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Fields will be loaded when the data source is rendered
            </div>
          ) : (
            <DatasourceViewOptions
              fields={fields}
              viewType={viewType}
              viewOptions={viewOptions}
              onViewOptionsChange={handleViewOptionsChange}
            />
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              Configuration saved automatically
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

