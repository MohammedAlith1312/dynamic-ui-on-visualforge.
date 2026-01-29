import { Card } from "@/components/ui/card";
import { Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const DividerComponentEditor = () => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Minus className="h-4 w-4" />
          Divider Component
        </div>
        <Separator />
      </div>
    </Card>
  );
};
