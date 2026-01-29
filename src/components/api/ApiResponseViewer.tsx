import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface ApiResponseViewerProps {
  response: {
    statusCode: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    responseTime: number;
  } | null;
}

export const ApiResponseViewer = ({ response }: ApiResponseViewerProps) => {
  if (!response) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No response yet
      </div>
    );
  }

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "bg-green-500";
    if (code >= 300 && code < 400) return "bg-yellow-500";
    return "bg-red-500";
  };

  const copyBody = () => {
    const text = typeof response.body === 'string' 
      ? response.body 
      : JSON.stringify(response.body, null, 2);
    navigator.clipboard.writeText(text);
    toast.success("Response copied to clipboard");
  };

  const formatBody = () => {
    if (typeof response.body === 'string') {
      try {
        const parsed = JSON.parse(response.body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return response.body;
      }
    }
    return JSON.stringify(response.body, null, 2);
  };

  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Badge className={getStatusColor(response.statusCode)}>
            {response.statusCode} {response.statusText}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {response.responseTime}ms
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={copyBody}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </div>

      <Tabs defaultValue="body" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="body" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Body
          </TabsTrigger>
          <TabsTrigger value="headers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Headers
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="body" className="p-4">
          <pre className="text-sm overflow-auto max-h-96 bg-muted p-4 rounded">
            <code>{formatBody()}</code>
          </pre>
        </TabsContent>
        
        <TabsContent value="headers" className="p-4">
          <div className="space-y-2">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-2 text-sm">
                <span className="font-medium min-w-[200px]">{key}:</span>
                <span className="text-muted-foreground break-all">{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};