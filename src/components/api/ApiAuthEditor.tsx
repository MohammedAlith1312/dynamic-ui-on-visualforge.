import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuthConfig {
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
}

interface ApiAuthEditorProps {
  authType: string;
  authConfig: AuthConfig;
  onAuthTypeChange: (type: string) => void;
  onAuthConfigChange: (config: AuthConfig) => void;
}

export const ApiAuthEditor = ({
  authType,
  authConfig,
  onAuthTypeChange,
  onAuthConfigChange,
}: ApiAuthEditorProps) => {
  const updateConfig = (field: string, value: string) => {
    onAuthConfigChange({ ...authConfig, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Auth Type</Label>
        <Select value={authType} onValueChange={onAuthTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="api-key">API Key</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {authType === "bearer" && (
        <div className="space-y-2">
          <Label>Token</Label>
          <Input
            type="password"
            placeholder="Bearer token"
            value={authConfig.token || ""}
            onChange={(e) => updateConfig("token", e.target.value)}
          />
        </div>
      )}

      {authType === "basic" && (
        <>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              placeholder="Username"
              value={authConfig.username || ""}
              onChange={(e) => updateConfig("username", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Password"
              value={authConfig.password || ""}
              onChange={(e) => updateConfig("password", e.target.value)}
            />
          </div>
        </>
      )}

      {authType === "api-key" && (
        <>
          <div className="space-y-2">
            <Label>Key</Label>
            <Input
              placeholder="Header name (e.g., X-API-Key)"
              value={authConfig.key || ""}
              onChange={(e) => updateConfig("key", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              type="password"
              placeholder="API key value"
              value={authConfig.value || ""}
              onChange={(e) => updateConfig("value", e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
};