import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface FormSubmissionDialogProps {
  submission: any;
  onClose: () => void;
}

export function FormSubmissionDialog({ submission, onClose }: FormSubmissionDialogProps) {
  if (!submission) return null;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

  return (
    <Dialog open={!!submission} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submission ID</p>
                <p className="font-mono text-sm">{submission.id}</p>
              </div>
              <Badge>
                {format(new Date(submission.submitted_at), "MMM d, yyyy h:mm a")}
              </Badge>
            </div>

            {submission.user_id && (
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{submission.user_id}</p>
              </div>
            )}

            {submission.ip_address && (
              <div>
                <p className="text-sm text-muted-foreground">IP Address</p>
                <p className="font-mono text-sm">{submission.ip_address}</p>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Form Data</h4>
              <div className="space-y-3">
                {Object.entries(submission.data || {}).map(([key, value]) => (
                  <div key={key} className="border rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">{key}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {formatValue(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
