"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ApiRequestTree } from "@/components/api/ApiRequestTree";
import { ApiRequestEditor } from "@/components/api/ApiRequestEditor";
import { ApiResponseViewer } from "@/components/api/ApiResponseViewer";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const ApiCollectionEditor = () => {
  const params = useParams();
  const collectionId = params?.collectionId as string;
  const router = useRouter();

  const [collection, setCollection] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [sending, setSending] = useState(false);

  const loadCollection = async () => {
    if (!collectionId) return;

    try {
      const { data, error } = await supabase
        .from("api_collections" as any)
        .select("*")
        .eq("id", collectionId)
        .single();

      if (error) throw error;
      setCollection(data);
    } catch (error) {
      console.error("Error loading collection:", error);
      toast.error("Failed to load collection");
    }
  };

  const loadFolders = async () => {
    if (!collectionId) return;

    try {
      const { data, error } = await supabase
        .from("api_folders" as any)
        .select("*")
        .eq("collection_id", collectionId)
        .order("position");

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };

  const loadRequests = async () => {
    if (!collectionId) return;

    try {
      const { data, error } = await supabase
        .from("api_requests" as any)
        .select("*")
        .eq("collection_id", collectionId)
        .order("position");

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const loadSelectedRequest = async () => {
    if (!selectedRequestId) {
      setSelectedRequest(null);
      setResponse(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("api_requests" as any)
        .select("*")
        .eq("id", selectedRequestId)
        .single();

      if (error) throw error;
      setSelectedRequest(data);
    } catch (error) {
      console.error("Error loading request:", error);
    }
  };

  useEffect(() => {
    loadCollection();
    loadFolders();
    loadRequests();
  }, [collectionId]);

  useEffect(() => {
    loadSelectedRequest();
  }, [selectedRequestId]);

  const handleCreateFolder = async () => {
    const name = prompt("Folder name:");
    if (!name?.trim()) return;

    try {
      const { error } = await supabase.from("api_folders" as any).insert({
        collection_id: collectionId!,
        name: name.trim(),
        position: folders.length,
      });

      if (error) throw error;
      toast.success("Folder created");
      loadFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const handleCreateRequest = async (folderId?: string) => {
    const name = prompt("Request name:");
    if (!name?.trim()) return;

    try {
      const { data, error } = await supabase.from("api_requests" as any).insert({
        collection_id: collectionId!,
        folder_id: folderId || null,
        name: name.trim(),
        method: "GET",
        url: "",
        position: requests.length,
      }).select();

      if (error) throw error;
      toast.success("Request created");
      loadRequests();
      if (data && data.length > 0) {
        setSelectedRequestId((data as any)[0].id);
      }
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to create request");
    }
  };

  const handleUpdateRequest = async (updates: Partial<any>) => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from("api_requests" as any)
        .update(updates)
        .eq("id", selectedRequest.id);

      if (error) throw error;
      setSelectedRequest({ ...selectedRequest, ...updates });
      loadRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
    }
  };

  const handleSendRequest = async () => {
    if (!selectedRequest) return;

    setSending(true);
    setResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("execute-api-request", {
        body: { requestId: selectedRequest.id },
      });

      if (error) throw error;
      setResponse(data);

      if (data.success) {
        toast.success("Request completed");
      } else {
        toast.error("Request failed");
      }
    } catch (error) {
      console.error("Error executing request:", error);
      toast.error("Failed to execute request");
      setResponse({
        success: false,
        statusCode: 0,
        statusText: "Error",
        headers: {},
        body: error instanceof Error ? error.message : "Unknown error",
        responseTime: 0,
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Delete this folder and all its requests?")) return;

    try {
      const { error } = await supabase.from("api_folders" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("Folder deleted");
      loadFolders();
      loadRequests();
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Delete this request?")) return;

    try {
      const { error } = await supabase.from("api_requests" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("Request deleted");
      if (selectedRequestId === id) {
        setSelectedRequestId(null);
      }
      loadRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("Failed to delete request");
    }
  };

  if (!collection) return <div className="p-6">Loading...</div>;

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/api-collections")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          {collection.base_url && (
            <p className="text-sm text-muted-foreground">{collection.base_url}</p>
          )}
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <div className="h-full overflow-auto border-r">
            <ApiRequestTree
              folders={folders}
              requests={requests}
              selectedRequestId={selectedRequestId}
              onSelectRequest={setSelectedRequestId}
              onCreateFolder={handleCreateFolder}
              onCreateRequest={handleCreateRequest}
              onDeleteFolder={handleDeleteFolder}
              onDeleteRequest={handleDeleteRequest}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={75}>
          {selectedRequest ? (
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={60} minSize={30}>
                <ApiRequestEditor
                  request={selectedRequest}
                  onUpdate={handleUpdateRequest}
                  onSend={handleSendRequest}
                  sending={sending}
                />
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel defaultSize={40} minSize={20}>
                <div className="h-full overflow-auto p-4">
                  <h3 className="text-lg font-semibold mb-4">Response</h3>
                  <ApiResponseViewer response={response} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a request from the sidebar or create a new one
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ApiCollectionEditor;