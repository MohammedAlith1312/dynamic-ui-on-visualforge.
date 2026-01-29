import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Folder, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Request {
  id: string;
  name: string;
  method: string;
  folder_id: string | null;
}

interface ApiFolder {
  id: string;
  name: string;
  parent_folder_id: string | null;
}

interface ApiRequestTreeProps {
  folders: ApiFolder[];
  requests: Request[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string) => void;
  onCreateFolder: () => void;
  onCreateRequest: (folderId?: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export const ApiRequestTree = ({
  folders,
  requests,
  selectedRequestId,
  onSelectRequest,
  onCreateFolder,
  onCreateRequest,
  onDeleteFolder,
  onDeleteRequest,
}: ApiRequestTreeProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-500";
      case "POST": return "bg-green-500";
      case "PUT": return "bg-orange-500";
      case "PATCH": return "bg-yellow-500";
      case "DELETE": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const renderRequests = (folderId: string | null) => {
    return requests
      .filter(r => r.folder_id === folderId)
      .map(request => (
        <div
          key={request.id}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent rounded group ${
            selectedRequestId === request.id ? "bg-accent" : ""
          }`}
          onClick={() => onSelectRequest(request.id)}
        >
          <Badge className={`${getMethodColor(request.method)} text-white text-xs`}>
            {request.method}
          </Badge>
          <span className="flex-1 truncate text-sm">{request.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(request.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ));
  };

  const renderFolder = (folder: ApiFolder) => {
    const isExpanded = expandedFolders.has(folder.id);

    return (
      <div key={folder.id} className="group">
        <div className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded cursor-pointer">
          <button onClick={() => toggleFolder(folder.id)} className="p-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <Folder className="h-4 w-4" />
          <span className="flex-1 text-sm font-medium">{folder.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder(folder.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        {isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {renderRequests(folder.id)}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => onCreateRequest(folder.id)}
            >
              <Plus className="h-3 w-3 mr-2" />
              Add Request
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 p-2 border-b">
        <Button variant="outline" size="sm" onClick={onCreateFolder} className="flex-1">
          <Folder className="h-4 w-4 mr-2" />
          New Folder
        </Button>
        <Button variant="outline" size="sm" onClick={() => onCreateRequest()} className="flex-1">
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>
      
      <div className="space-y-1">
        {folders.filter(f => !f.parent_folder_id).map(renderFolder)}
        {renderRequests(null)}
      </div>
    </div>
  );
};