import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Palette, Type, Layers, Sparkles } from "lucide-react";

interface ComponentStyles {
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  borderRadius?: string;
  boxShadow?: string;
  border?: string;
}

interface ComponentStylePanelProps {
  componentId: string;
  styles: ComponentStyles;
  onUpdate: (styles: ComponentStyles) => void;
}

export const ComponentStylePanel = ({
  styles,
  onUpdate,
}: ComponentStylePanelProps) => {
  const [localStyles, setLocalStyles] = useState<ComponentStyles>(styles || {});

  useEffect(() => {
    setLocalStyles(styles || {});
  }, [styles]);

  const handleChange = (key: keyof ComponentStyles, value: string) => {
    const updated = { ...localStyles, [key]: value };
    setLocalStyles(updated);
    onUpdate(updated);
  };

  return (
    <Card className="p-4 mt-2">
      <h3 className="text-sm font-semibold mb-3">Component Styles</h3>
      <Accordion type="multiple" defaultValue={["spacing"]} className="w-full">
        <AccordionItem value="spacing">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Spacing
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">Margin</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Label className="text-xs text-muted-foreground">Top</Label>
                  <Select
                    value={localStyles.marginTop || "0"}
                    onValueChange={(value) => handleChange("marginTop", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.5rem">XS</SelectItem>
                      <SelectItem value="1rem">S</SelectItem>
                      <SelectItem value="1.5rem">M</SelectItem>
                      <SelectItem value="2rem">L</SelectItem>
                      <SelectItem value="3rem">XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Bottom</Label>
                  <Select
                    value={localStyles.marginBottom || "0"}
                    onValueChange={(value) => handleChange("marginBottom", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.5rem">XS</SelectItem>
                      <SelectItem value="1rem">S</SelectItem>
                      <SelectItem value="1.5rem">M</SelectItem>
                      <SelectItem value="2rem">L</SelectItem>
                      <SelectItem value="3rem">XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Padding</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Label className="text-xs text-muted-foreground">All</Label>
                  <Select
                    value={localStyles.paddingTop || "0"}
                    onValueChange={(value) => {
                      handleChange("paddingTop", value);
                      handleChange("paddingBottom", value);
                      handleChange("paddingLeft", value);
                      handleChange("paddingRight", value);
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.5rem">XS</SelectItem>
                      <SelectItem value="1rem">S</SelectItem>
                      <SelectItem value="1.5rem">M</SelectItem>
                      <SelectItem value="2rem">L</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colors">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <Label className="text-xs">Text Color</Label>
              <Input
                type="color"
                value={localStyles.color || "#000000"}
                onChange={(e) => handleChange("color", e.target.value)}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Background Color</Label>
              <Input
                type="color"
                value={localStyles.backgroundColor || "#ffffff"}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                className="h-10 mt-1"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="typography">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Typography
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <Label className="text-xs">Font Size</Label>
              <Select
                value={localStyles.fontSize || "1rem"}
                onValueChange={(value) => handleChange("fontSize", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.75rem">XS</SelectItem>
                  <SelectItem value="0.875rem">S</SelectItem>
                  <SelectItem value="1rem">M</SelectItem>
                  <SelectItem value="1.125rem">L</SelectItem>
                  <SelectItem value="1.25rem">XL</SelectItem>
                  <SelectItem value="1.5rem">2XL</SelectItem>
                  <SelectItem value="2rem">3XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Font Weight</Label>
              <Select
                value={localStyles.fontWeight || "400"}
                onValueChange={(value) => handleChange("fontWeight", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light</SelectItem>
                  <SelectItem value="400">Normal</SelectItem>
                  <SelectItem value="500">Medium</SelectItem>
                  <SelectItem value="600">Semibold</SelectItem>
                  <SelectItem value="700">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Text Align</Label>
              <Select
                value={localStyles.textAlign || "left"}
                onValueChange={(value) => handleChange("textAlign", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="effects">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
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
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Border</Label>
              <Input
                type="text"
                value={localStyles.border || ""}
                onChange={(e) => handleChange("border", e.target.value)}
                placeholder="1px solid #000"
                className="mt-1"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
