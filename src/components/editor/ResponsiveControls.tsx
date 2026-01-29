import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Tablet, Smartphone } from "lucide-react";

export type Breakpoint = "desktop" | "tablet" | "mobile";

interface ResponsiveControlsProps {
  currentBreakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
}

export const ResponsiveControls = ({
  currentBreakpoint,
  onBreakpointChange,
}: ResponsiveControlsProps) => {
  return (
    <Tabs value={currentBreakpoint} onValueChange={(v) => onBreakpointChange(v as Breakpoint)}>
      <TabsList>
        <TabsTrigger value="desktop" className="gap-2">
          <Monitor className="h-4 w-4" />
          Desktop
        </TabsTrigger>
        <TabsTrigger value="tablet" className="gap-2">
          <Tablet className="h-4 w-4" />
          Tablet
        </TabsTrigger>
        <TabsTrigger value="mobile" className="gap-2">
          <Smartphone className="h-4 w-4" />
          Mobile
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
