import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const PageContentComponentEditor = () => {
  return (
    <Card className="p-6 bg-muted/50 border-dashed">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <p className="font-medium">Page Content Placeholder</p>
          <p className="text-sm text-muted-foreground">
            This is where the page content will appear
          </p>
        </div>
      </div>
    </Card>
  );
};
