"use client";

import { useEffect, useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { getEntity, getFields } from "@/lib/schema-service";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ChartRenderer } from "./ChartRenderer";
import { DatasourceRenderer } from "./DatasourceRenderer";

type Component =
  | Tables<"page_components">
  | Tables<"layout_components">
  | Tables<"widget_components">;

interface ComponentRendererProps {
  component: Component;
}

export const ComponentRenderer = ({ component }: ComponentRendererProps) => {
  if (!component) {
    console.error("ComponentRenderer received undefined component");
    return null;
  }

  let { component_type, content } = component;

  if (!component_type) {
    console.error("Component missing component_type:", component);
    return null;
  }

  // Handle malformed content with nested 'content' property
  if (content && typeof content === 'object' && 'content' in content && Object.keys(content).length === 1) {
    content = content.content as any;
  }

  switch (component_type) {
    case "heading": {
      const { text, level } = content as { text: string; level: string };
      const Tag = level as keyof JSX.IntrinsicElements;
      const styles = {
        h1: "text-4xl font-bold",
        h2: "text-3xl font-bold",
        h3: "text-2xl font-semibold",
      };
      return <Tag className={styles[level as keyof typeof styles]}>{text}</Tag>;
    }

    case "text":
    case "paragraph": {
      const { text } = content as { text: string };
      return <p className="text-base leading-relaxed whitespace-pre-wrap">{text}</p>;
    }

    case "image": {
      const { url, alt } = content as { url: string; alt: string };
      if (!url) return null;
      return <img src={url} alt={alt} className="w-full max-w-2xl rounded-lg shadow-[var(--shadow-medium)]" />;
    }

    case "button": {
      const { text, link } = content as { text: string; link: string };
      return (
        <Button asChild>
          <a href={link || "#"}>{text}</a>
        </Button>
      );
    }

    case "link": {
      const { text, url } = content as { text: string; url: string };
      return (
        <a href={url || "#"} className="text-primary hover:underline">
          {text}
        </a>
      );
    }

    case "video": {
      const { url } = content as { url: string };
      if (!url) return null;

      // Extract video ID from YouTube or Vimeo URL
      let embedUrl = "";
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.includes("youtu.be")
          ? url.split("/").pop()
          : new URLSearchParams(new URL(url).search).get("v");
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes("vimeo.com")) {
        const videoId = url.split("/").pop();
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      if (!embedUrl) return <p className="text-muted-foreground">Invalid video URL</p>;

      return (
        <div className="aspect-video w-full max-w-2xl">
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    case "divider": {
      return <Separator className="my-4" />;
    }

    case "spacer": {
      const { height } = content as { height: string };
      const heights = {
        small: "h-5",
        medium: "h-10",
        large: "h-20",
      };
      return <div className={heights[height as keyof typeof heights] || heights.medium} />;
    }

    case "quote": {
      const { text, author } = content as { text: string; author: string };
      return (
        <blockquote className="border-l-4 border-primary pl-4 italic">
          <p className="text-lg">{text}</p>
          {author && <footer className="mt-2 text-sm text-muted-foreground">— {author}</footer>}
        </blockquote>
      );
    }

    case "list": {
      const { items, type } = content as { items: string; type: string };
      const listItems = items.split("\n").filter((item) => item.trim());
      const Tag = type === "numbered" ? "ol" : "ul";
      const className = type === "numbered" ? "list-decimal list-inside space-y-1" : "list-disc list-inside space-y-1";
      return (
        <Tag className={className}>
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </Tag>
      );
    }

    case "code": {
      const { code, language } = content as { code: string; language: string };
      return (
        <div className="relative">
          {language && (
            <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {language}
            </div>
          )}
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code className="text-sm font-mono">{code}</code>
          </pre>
        </div>
      );
    }

    case "entity-list": {
      return <EntityListRenderer content={content} />;
    }

    case "entity-detail": {
      return <EntityDetailRenderer content={content} />;
    }

    case "query": {
      return <QueryRenderer content={content} />;
    }

    case "datasource": {
      if (!content || typeof content !== 'object') {
        return (
          <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
            <p className="text-sm text-muted-foreground">Data Source component not configured. Please configure it in the editor.</p>
          </div>
        );
      }
      return <DatasourceRenderer content={content as any} />;
    }

    case "chart": {
      return <ChartRenderer content={content as any} />;
    }

    case "tabs": {
      const { tabs } = content as { tabs: Array<{ id: string; label: string; content: string }> };
      return (
        <div className="w-full">
          <div className="border-b border-border mb-4">
            <div className="flex gap-4">
              {tabs?.map((tab, idx) => (
                <button
                  key={tab.id}
                  className={`px-4 py-2 font-medium ${idx === 0 ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            {tabs?.[0]?.content || "No content"}
          </div>
        </div>
      );
    }

    case "accordion": {
      const { items } = content as { items: Array<{ id: string; title: string; content: string }> };
      return (
        <div className="space-y-2">
          {items?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <h3 className="font-semibold">{item.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    case "card": {
      const { title, description, imageUrl, buttonText, buttonLink } = content as {
        title: string;
        description: string;
        imageUrl: string;
        buttonText: string;
        buttonLink: string;
      };
      return (
        <Card>
          {imageUrl && (
            <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-t-lg" />
          )}
          <CardHeader>
            <h3 className="text-xl font-semibold">{title}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{description}</p>
            {buttonText && (
              <Button asChild>
                <a href={buttonLink || "#"}>{buttonText}</a>
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    case "form-input":
    case "form-textarea":
    case "form-select":
    case "form-checkbox":
    case "form-submit": {
      return (
        <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Form component (preview not available)</p>
        </div>
      );
    }

    default:
      console.error("Unknown component type:", component_type, component);
      return (
        <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground">Unknown component type: {component_type}</p>
        </div>
      );
  }
};

// Entity List Renderer Component
const EntityListRenderer = ({ content }: { content: any }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [entity, setEntity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntityData();
  }, [content.entityId]);

  const loadEntityData = async () => {
    if (!content.entityId) {
      setLoading(false);
      return;
    }

    try {
      // Load schema from JSON instead of Supabase
      const entityData = await getEntity(content.entityId);
      const fieldsData = await getFields(content.entityId);

      // Load actual records from Supabase
      const { data: recordsData, error: recordsError } = await supabase
        .from("entity_records")
        .select("*")
        .eq("entity_id", content.entityId)
        .eq("is_published", true)
        .order("created_at", { ascending: content.sortOrder !== "asc" })
        .limit(content.limit || 10);

      if (recordsError) throw recordsError;

      setEntity(entityData);
      setFields(fieldsData || []);
      setRecords(recordsData || []);
    } catch (error) {
      console.error("Error loading entity data:", error);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;
  if (!entity) return <div className="text-muted-foreground">Entity not found</div>;
  if (records.length === 0) return <div className="text-muted-foreground">No records available</div>;

  const displayFields = fields.filter(f => (content.fields || []).includes(f.name));

  if (content.displayStyle === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              {displayFields.map((field) => (
                <th key={field.id} className="text-left p-3 font-semibold">
                  {field.display_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b">
                {displayFields.map((field) => (
                  <td key={field.id} className="p-3">
                    {renderFieldValue(record.data[field.name], field.field_type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (content.displayStyle === "list") {
    return (
      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.id} className="p-4">
            {displayFields.map((field) => (
              <div key={field.id} className="mb-2">
                <span className="font-semibold">{field.display_name}: </span>
                <span>{renderFieldValue(record.data[field.name], field.field_type)}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.map((record) => (
        <Card key={record.id} className="p-6">
          {displayFields.map((field) => (
            <div key={field.id} className="mb-3">
              <div className="text-sm font-semibold text-muted-foreground mb-1">
                {field.display_name}
              </div>
              <div className="text-base">
                {renderFieldValue(record.data[field.name], field.field_type)}
              </div>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
};

// Entity Detail Renderer Component
const EntityDetailRenderer = ({ content }: { content: any }) => {
  const [record, setRecord] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecordData();
  }, [content.entityId, content.recordId]);

  const loadRecordData = async () => {
    if (!content.entityId || !content.recordId) {
      setLoading(false);
      return;
    }

    try {
      // Load schema from JSON instead of Supabase
      const fieldsData = await getFields(content.entityId);

      // Load actual record from Supabase
      const { data: recordData, error: recordError } = await supabase
        .from("entity_records")
        .select("*")
        .eq("id", content.recordId)
        .eq("is_published", true)
        .single();

      if (recordError) throw recordError;

      setFields(fieldsData || []);
      setRecord(recordData);
    } catch (error) {
      console.error("Error loading record:", error);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;
  if (!record) return <div className="text-muted-foreground">Record not found</div>;

  const displayFields = fields.filter(f => (content.fields || []).includes(f.name));

  if (content.layout === "horizontal") {
    return (
      <div className="flex flex-wrap gap-6">
        {displayFields.map((field) => (
          <div key={field.id} className="flex-1 min-w-[200px]">
            <div className="text-sm font-semibold text-muted-foreground mb-1">
              {field.display_name}
            </div>
            <div className="text-base">
              {renderFieldValue(record.data[field.name], field.field_type)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Vertical layout (default)
  return (
    <div className="space-y-4">
      {displayFields.map((field) => (
        <div key={field.id}>
          <div className="text-sm font-semibold text-muted-foreground mb-1">
            {field.display_name}
          </div>
          <div className="text-base">
            {renderFieldValue(record.data[field.name], field.field_type)}
          </div>
        </div>
      ))}
    </div>
  );
};

// Query Renderer Component
const QueryRenderer = ({ content }: { content: any }) => {
  const [results, setResults] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    executeQuery();
  }, [content.queryId]);

  const executeQuery = async () => {
    if (!content.queryId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: funcError } = await supabase.functions.invoke('execute-query', {
        body: { queryId: content.queryId }
      });

      if (funcError) throw funcError;

      if (data.success) {
        setResults(data.data || []);
        setSettings(data.settings);
      } else {
        setError(data.error || "Failed to execute query");
      }
    } catch (err) {
      console.error("Error executing query:", err);
      setError("Failed to load query results");
    }
    setLoading(false);
  };

  if (loading) return <div className="text-muted-foreground">Loading query results...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!settings) return <div className="text-muted-foreground">Query not found</div>;
  if (results.length === 0) return <div className="text-muted-foreground">No results found</div>;

  const displayStyle = settings.display_style || 'table';
  const showRowNumbers = settings.show_row_numbers || false;

  if (displayStyle === "table") {
    const headers = Object.keys(results[0] || {});

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              {showRowNumbers && <th className="text-left p-3 font-semibold">#</th>}
              {headers.map((header) => (
                <th key={header} className="text-left p-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr key={idx} className="border-b">
                {showRowNumbers && <td className="p-3 text-muted-foreground">{idx + 1}</td>}
                {headers.map((header) => (
                  <td key={header} className="p-3">
                    {row[header] !== null && row[header] !== undefined ? String(row[header]) : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (displayStyle === "list") {
    return (
      <div className="space-y-4">
        {results.map((row, idx) => (
          <Card key={idx} className="p-4">
            {showRowNumbers && <div className="text-sm text-muted-foreground mb-2">#{idx + 1}</div>}
            {Object.entries(row).map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="font-semibold">{key}: </span>
                <span>{value !== null && value !== undefined ? String(value) : "-"}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  }

  // Grid layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((row, idx) => (
        <Card key={idx} className="p-6">
          {showRowNumbers && <div className="text-sm text-muted-foreground mb-3">#{idx + 1}</div>}
          {Object.entries(row).map(([key, value]) => (
            <div key={key} className="mb-3">
              <div className="text-sm font-semibold text-muted-foreground mb-1">
                {key}
              </div>
              <div className="text-base">
                {value !== null && value !== undefined ? String(value) : "-"}
              </div>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
};

// Helper function to render field values based on type
const renderFieldValue = (value: any, fieldType: string) => {
  if (value === null || value === undefined || value === "") return "-";

  switch (fieldType) {
    case "image":
      return <img src={value} alt="" className="max-w-full h-auto rounded" />;
    case "url":
      return <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{value}</a>;
    case "boolean":
      return value === "true" || value === true ? "Yes" : "No";
    case "longtext":
      return <div className="whitespace-pre-wrap">{value}</div>;
    case "date":
      return new Date(value).toLocaleDateString();
    default:
      return String(value);
  }
};
