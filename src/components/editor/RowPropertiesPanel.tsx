import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Palette, Layers, Radius, Columns2, Smartphone, Tablet } from "lucide-react";

interface RowStyles {
  backgroundColor?: string;
  backgroundImage?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  borderRadius?: string;
  boxShadow?: string;
}

interface ResponsiveConfig {
  mobile?: {
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    stackColumns?: boolean;
  };
  tablet?: {
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
  };
}

interface RowPropertiesPanelProps {
  rowId: string;
  columns: number;
  styles: RowStyles;
  columnWidths?: number[];
  responsiveConfig?: ResponsiveConfig;
  onUpdate: (styles: RowStyles) => void;
  onUpdateColumnWidths?: (widths: number[]) => void;
  onUpdateResponsiveConfig?: (config: ResponsiveConfig) => void;
}

export const RowPropertiesPanel = ({
  columns,
  styles,
  columnWidths,
  responsiveConfig,
  onUpdate,
  onUpdateColumnWidths,
  onUpdateResponsiveConfig,
}: RowPropertiesPanelProps) => {
  const [localStyles, setLocalStyles] = useState<RowStyles>(styles || {});
  const [localColumnWidths, setLocalColumnWidths] = useState<number[]>(
    columnWidths || Array(columns).fill(100 / columns)
  );
  const [localResponsiveConfig, setLocalResponsiveConfig] = useState<ResponsiveConfig>(
    responsiveConfig || {}
  );

  useEffect(() => {
    setLocalStyles(styles || {});
  }, [styles]);

  useEffect(() => {
    setLocalColumnWidths(columnWidths || Array(columns).fill(100 / columns));
  }, [columnWidths, columns]);

  useEffect(() => {
    setLocalResponsiveConfig(responsiveConfig || {});
  }, [responsiveConfig]);

  const handleChange = (key: keyof RowStyles, value: string) => {
    const updated = { ...localStyles, [key]: value };
    setLocalStyles(updated);
    onUpdate(updated);
  };

  const handleColumnWidthChange = (index: number, value: number) => {
    const updated = [...localColumnWidths];
    updated[index] = value;
    setLocalColumnWidths(updated);
    onUpdateColumnWidths?.(updated);
  };

  const handleResponsiveChange = (
    breakpoint: 'mobile' | 'tablet',
    key: string,
    value: string | boolean
  ) => {
    const updated = {
      ...localResponsiveConfig,
      [breakpoint]: {
        ...localResponsiveConfig[breakpoint],
        [key]: value,
      },
    };
    setLocalResponsiveConfig(updated);
    onUpdateResponsiveConfig?.(updated);
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Row Properties</h3>
      <Accordion type="multiple" defaultValue={["background", "spacing", "columns"]} className="w-full">
        <AccordionItem value="columns">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Columns2 className="h-4 w-4" />
              Column Widths
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {Array.from({ length: columns }, (_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Column {i + 1}</Label>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(localColumnWidths[i])}%
                  </span>
                </div>
                <Slider
                  value={[localColumnWidths[i]]}
                  onValueChange={([value]) => handleColumnWidthChange(i, value)}
                  min={5}
                  max={95}
                  step={5}
                  className="mt-1"
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              Note: Column widths are percentages. Adjust for custom layouts.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="background">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Background
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <Label className="text-xs">Background Color</Label>
              <Input
                type="color"
                value={localStyles.backgroundColor || "#ffffff"}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Background Image URL</Label>
              <Input
                type="text"
                value={localStyles.backgroundImage || ""}
                onChange={(e) => handleChange("backgroundImage", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="spacing">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Spacing
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Padding Top</Label>
                <Select
                  value={localStyles.paddingTop || "0"}
                  onValueChange={(value) => handleChange("paddingTop", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1rem">Small</SelectItem>
                    <SelectItem value="2rem">Medium</SelectItem>
                    <SelectItem value="4rem">Large</SelectItem>
                    <SelectItem value="6rem">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Padding Bottom</Label>
                <Select
                  value={localStyles.paddingBottom || "0"}
                  onValueChange={(value) => handleChange("paddingBottom", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1rem">Small</SelectItem>
                    <SelectItem value="2rem">Medium</SelectItem>
                    <SelectItem value="4rem">Large</SelectItem>
                    <SelectItem value="6rem">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Padding Left</Label>
                <Select
                  value={localStyles.paddingLeft || "0"}
                  onValueChange={(value) => handleChange("paddingLeft", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1rem">Small</SelectItem>
                    <SelectItem value="2rem">Medium</SelectItem>
                    <SelectItem value="4rem">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Padding Right</Label>
                <Select
                  value={localStyles.paddingRight || "0"}
                  onValueChange={(value) => handleChange("paddingRight", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1rem">Small</SelectItem>
                    <SelectItem value="2rem">Medium</SelectItem>
                    <SelectItem value="4rem">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="effects">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Radius className="h-4 w-4" />
              Effects
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <Label className="text-xs">Border Radius</Label>
              <Select
                value={localStyles.borderRadius || "0"}
                onValueChange={(value) => handleChange("borderRadius", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="0.25rem">Small</SelectItem>
                  <SelectItem value="0.5rem">Medium</SelectItem>
                  <SelectItem value="1rem">Large</SelectItem>
                  <SelectItem value="9999px">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Shadow</Label>
              <Select
                value={localStyles.boxShadow || "none"}
                onValueChange={(value) => handleChange("boxShadow", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="0 1px 3px 0 rgb(0 0 0 / 0.1)">Small</SelectItem>
                  <SelectItem value="0 4px 6px -1px rgb(0 0 0 / 0.1)">Medium</SelectItem>
                  <SelectItem value="0 10px 15px -3px rgb(0 0 0 / 0.1)">Large</SelectItem>
                  <SelectItem value="0 20px 25px -5px rgb(0 0 0 / 0.1)">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="responsive">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Responsive Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-2">
                  <Smartphone className="h-3 w-3" />
                  Mobile
                </Label>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Stack Columns Vertically</Label>
                <Switch
                  checked={localResponsiveConfig.mobile?.stackColumns || false}
                  onCheckedChange={(checked) =>
                    handleResponsiveChange('mobile', 'stackColumns', checked)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Padding Top</Label>
                  <Select
                    value={localResponsiveConfig.mobile?.paddingTop || localStyles.paddingTop || "0"}
                    onValueChange={(value) =>
                      handleResponsiveChange('mobile', 'paddingTop', value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.5rem">XS</SelectItem>
                      <SelectItem value="1rem">Small</SelectItem>
                      <SelectItem value="1.5rem">Medium</SelectItem>
                      <SelectItem value="2rem">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Padding Bottom</Label>
                  <Select
                    value={localResponsiveConfig.mobile?.paddingBottom || localStyles.paddingBottom || "0"}
                    onValueChange={(value) =>
                      handleResponsiveChange('mobile', 'paddingBottom', value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.5rem">XS</SelectItem>
                      <SelectItem value="1rem">Small</SelectItem>
                      <SelectItem value="1.5rem">Medium</SelectItem>
                      <SelectItem value="2rem">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Padding Left</Label>
                  <Select
                    value={localResponsiveConfig.mobile?.paddingLeft || localStyles.paddingLeft || "0"}
                    onValueChange={(value) =>
                      handleResponsiveChange('mobile', 'paddingLeft', value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.5rem">XS</SelectItem>
                      <SelectItem value="1rem">Small</SelectItem>
                      <SelectItem value="1.5rem">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Padding Right</Label>
                  <Select
                    value={localResponsiveConfig.mobile?.paddingRight || localStyles.paddingRight || "0"}
                    onValueChange={(value) =>
                      handleResponsiveChange('mobile', 'paddingRight', value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.5rem">XS</SelectItem>
                      <SelectItem value="1rem">Small</SelectItem>
                      <SelectItem value="1.5rem">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t">
              <Label className="text-xs font-semibold flex items-center gap-2">
                <Tablet className="h-3 w-3" />
                Tablet
              </Label>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Padding Top</Label>
                  <Select
                    value={localResponsiveConfig.tablet?.paddingTop || localStyles.paddingTop || "0"}
                    onValueChange={(value) =>
                      handleResponsiveChange('tablet', 'paddingTop', value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.75rem">XS</SelectItem>
                      <SelectItem value="1.5rem">Small</SelectItem>
                      <SelectItem value="2.5rem">Medium</SelectItem>
                      <SelectItem value="3.5rem">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Padding Bottom</Label>
                  <Select
                    value={localResponsiveConfig.tablet?.paddingBottom || localStyles.paddingBottom || "0"}
                    onValueChange={(value) =>
                      handleResponsiveChange('tablet', 'paddingBottom', value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.75rem">XS</SelectItem>
                      <SelectItem value="1.5rem">Small</SelectItem>
                      <SelectItem value="2.5rem">Medium</SelectItem>
                      <SelectItem value="3.5rem">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Padding Left</Label>
                  <Select
                    value={localResponsiveConfig.tablet?.paddingLeft || localStyles.paddingLeft || "0"}
                    onValueChange={(value) =>
                      handleResponsiveChange('tablet', 'paddingLeft', value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.75rem">XS</SelectItem>
                      <SelectItem value="1.5rem">Small</SelectItem>
                      <SelectItem value="2.5rem">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Padding Right</Label>
                  <Select
                    value={localResponsiveConfig.tablet?.paddingRight || localStyles.paddingRight || "0"}
                    onValueChange={(value) =>
                      handleResponsiveChange('tablet', 'paddingRight', value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.75rem">XS</SelectItem>
                      <SelectItem value="1.5rem">Small</SelectItem>
                      <SelectItem value="2.5rem">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
