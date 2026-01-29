import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Section {
  id: string;
  title: string;
  description?: string;
  section_type: "section" | "tab" | "column" | "repeatable";
  is_visible: boolean;
}

interface SectionRendererProps {
  sections: Section[];
  children: (sectionId: string) => ReactNode;
  className?: string;
}

export function SectionRenderer({ sections, children, className }: SectionRendererProps) {
  const visibleSections = sections.filter(s => s.is_visible);

  if (visibleSections.length === 0) {
    return <div className={className}>{children("")}</div>;
  }

  // Check if all sections are tabs
  const allTabs = visibleSections.every(s => s.section_type === "tab");
  
  if (allTabs && visibleSections.length > 0) {
    return (
      <Tabs defaultValue={visibleSections[0].id} className={className}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${visibleSections.length}, 1fr)` }}>
          {visibleSections.map((section) => (
            <TabsTrigger key={section.id} value={section.id}>
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {visibleSections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-4">
            {section.description && (
              <p className="text-sm text-muted-foreground">{section.description}</p>
            )}
            {children(section.id)}
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  // Render regular sections
  return (
    <div className={className}>
      {visibleSections.map((section) => {
        if (section.section_type === "section") {
          return (
            <Card key={section.id} className="mb-4">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {children(section.id)}
              </CardContent>
            </Card>
          );
        }

        if (section.section_type === "column") {
          return (
            <div key={section.id} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                {children(section.id)}
              </div>
            </div>
          );
        }

        return (
          <div key={section.id} className="mb-4">
            {children(section.id)}
          </div>
        );
      })}
    </div>
  );
}
