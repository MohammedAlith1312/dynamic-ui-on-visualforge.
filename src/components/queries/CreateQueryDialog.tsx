import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CreateQueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateQueryDialog({ open, onOpenChange }: CreateQueryDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [queryType, setQueryType] = useState<"flat" | "aggregate">("flat");

  const generateName = (displayName: string) => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleCreate = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Display name required",
        description: "Please enter a display name for the query.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const name = generateName(displayName);

      const { data: query, error } = await (supabase as any)
        .from('queries')
        .insert({
          user_id: userData.user.id,
          name,
          display_name: displayName,
          description: description || null,
          query_type: queryType,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Query created",
        description: "Your query has been created successfully.",
      });

      onOpenChange(false);
      setDisplayName("");
      setDescription("");
      setQueryType("flat");

      router.push(`/admin/queries/${query.id}/editor`);
    } catch (error: any) {
      toast({
        title: "Error creating query",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Query</DialogTitle>
          <DialogDescription>
            Build a new database query to display dynamic data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="My Query"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this query do?"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="queryType">Query Type</Label>
            <Select value={queryType} onValueChange={(value) => setQueryType(value as "flat" | "aggregate")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat (List Records)</SelectItem>
                <SelectItem value="aggregate">Aggregate (Group & Calculate)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {queryType === 'flat'
                ? 'Display individual records from one or more entities'
                : 'Group records and calculate sums, counts, averages, etc.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Query"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
