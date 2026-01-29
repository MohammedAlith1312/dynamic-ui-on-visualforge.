"use client";

import { createContext, useContext, useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Component = Tables<"page_components"> | Tables<"widget_components"> | Tables<"layout_components">;

interface ClipboardContextType {
  copiedComponent: Component | null;
  copyComponent: (component: Component) => void;
  clearClipboard: () => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const ClipboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [copiedComponent, setCopiedComponent] = useState<Component | null>(null);

  const copyComponent = (component: Component) => {
    setCopiedComponent(component);
    toast.success("Component copied to clipboard");
  };

  const clearClipboard = () => {
    setCopiedComponent(null);
  };

  return (
    <ClipboardContext.Provider value={{ copiedComponent, copyComponent, clearClipboard }}>
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error("useClipboard must be used within a ClipboardProvider");
  }
  return context;
};
