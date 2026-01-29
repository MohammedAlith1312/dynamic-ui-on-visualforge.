import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { KeyValueEditor } from "./KeyValueEditor";
import { ApiAuthEditor } from "./ApiAuthEditor";
import { Send } from "lucide-react";

interface ApiRequestEditorProps {
  request: {
    id: string;
    name: string;
    method: string;
    url: string;
    headers: any[];
    query_params: any[];
    body_type: string;
    body_content: string;
    auth_type: string;
    auth_config: any;
  };
  onUpdate: (updates: Partial<any>) => void;
  onSend: () => void;
  sending: boolean;
}

export const ApiRequestEditor = ({ request, onUpdate, onSend, sending }: ApiRequestEditorProps) => {
  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
  const bodyTypes = ["none", "json", "raw", "x-www-form-urlencoded"];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <Input
          value={request.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Request name"
          className="font-medium"
        />
        
        <div className="flex gap-2">
          <Select value={request.method} onValueChange={(method) => onUpdate({ method })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {methods.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            value={request.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="https://api.example.com/endpoint"
            className="flex-1"
          />
          
          <Button onClick={onSend} disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="params" className="flex-1">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="params" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Params
          </TabsTrigger>
          <TabsTrigger value="headers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Headers
          </TabsTrigger>
          <TabsTrigger value="body" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Body
          </TabsTrigger>
          <TabsTrigger value="auth" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Auth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="p-4">
          <KeyValueEditor
            pairs={request.query_params || []}
            onChange={(query_params) => onUpdate({ query_params })}
            placeholder={{ key: "Parameter", value: "Value" }}
          />
        </TabsContent>

        <TabsContent value="headers" className="p-4">
          <KeyValueEditor
            pairs={request.headers || []}
            onChange={(headers) => onUpdate({ headers })}
            placeholder={{ key: "Header", value: "Value" }}
          />
        </TabsContent>

        <TabsContent value="body" className="p-4 space-y-4">
          <Select value={request.body_type || "none"} onValueChange={(body_type) => onUpdate({ body_type })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bodyTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === "none" ? "No Body" : type === "x-www-form-urlencoded" ? "Form URL Encoded" : type.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {request.body_type && request.body_type !== "none" && (
            <Textarea
              value={request.body_content || ""}
              onChange={(e) => onUpdate({ body_content: e.target.value })}
              placeholder={request.body_type === "json" ? '{"key": "value"}' : "Body content"}
              className="min-h-[200px] font-mono text-sm"
            />
          )}
        </TabsContent>

        <TabsContent value="auth" className="p-4">
          <ApiAuthEditor
            authType={request.auth_type || "none"}
            authConfig={request.auth_config || {}}
            onAuthTypeChange={(auth_type) => onUpdate({ auth_type })}
            onAuthConfigChange={(auth_config) => onUpdate({ auth_config })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};