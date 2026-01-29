import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, X } from "lucide-react";
import { useState } from "react";

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSlug: string;
}

type DeviceType = "desktop" | "tablet" | "mobile";

export const PreviewModal = ({ open, onOpenChange, pageSlug }: PreviewModalProps) => {
  const [device, setDevice] = useState<DeviceType>("desktop");

  const deviceSizes = {
    desktop: "w-full h-full",
    tablet: "w-[768px] h-[1024px]",
    mobile: "w-[375px] h-[667px]",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0 gap-0">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-card">
          <div className="flex items-center gap-2">
            <Button
              variant={device === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("desktop")}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </Button>
            <Button
              variant={device === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("tablet")}
              className="gap-2"
            >
              <Tablet className="h-4 w-4" />
              Tablet
            </Button>
            <Button
              variant={device === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("mobile")}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto bg-muted flex items-center justify-center p-4">
          <div className={`${deviceSizes[device]} bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300`}>
            <iframe
              src={`/page/${pageSlug}`}
              className="w-full h-full border-0"
              title="Page Preview"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
