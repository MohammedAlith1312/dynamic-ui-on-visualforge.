import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSave?: () => void;
}

export const useKeyboardShortcuts = (handlers: KeyboardShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Prevent default for our shortcuts
      const shouldPreventDefault = cmdOrCtrl && (
        e.key === 'z' || 
        e.key === 'y' || 
        e.key === 'd' || 
        e.key === 'c' || 
        e.key === 'v' ||
        e.key === 's'
      );

      if (shouldPreventDefault) {
        e.preventDefault();
      }

      // Undo: Cmd+Z / Ctrl+Z
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey && handlers.onUndo) {
        handlers.onUndo();
        return;
      }

      // Redo: Cmd+Shift+Z / Ctrl+Y
      if ((cmdOrCtrl && e.key === 'z' && e.shiftKey) || (cmdOrCtrl && e.key === 'y')) {
        if (handlers.onRedo) {
          handlers.onRedo();
        }
        return;
      }

      // Delete: Backspace or Delete
      if ((e.key === 'Backspace' || e.key === 'Delete') && !isInputElement(e.target)) {
        if (handlers.onDelete) {
          e.preventDefault();
          handlers.onDelete();
        }
        return;
      }

      // Duplicate: Cmd+D / Ctrl+D
      if (cmdOrCtrl && e.key === 'd' && handlers.onDuplicate) {
        handlers.onDuplicate();
        return;
      }

      // Copy: Cmd+C / Ctrl+C
      if (cmdOrCtrl && e.key === 'c' && !isInputElement(e.target) && handlers.onCopy) {
        handlers.onCopy();
        return;
      }

      // Paste: Cmd+V / Ctrl+V
      if (cmdOrCtrl && e.key === 'v' && !isInputElement(e.target) && handlers.onPaste) {
        handlers.onPaste();
        return;
      }

      // Save: Cmd+S / Ctrl+S
      if (cmdOrCtrl && e.key === 's' && handlers.onSave) {
        handlers.onSave();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};

// Helper to check if target is an input element
const isInputElement = (target: EventTarget | null): boolean => {
  if (!target) return false;
  const element = target as HTMLElement;
  return (
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.isContentEditable
  );
};
