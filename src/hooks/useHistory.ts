import { useState, useCallback } from "react";

interface HistoryCommand {
  execute: () => void;
  undo: () => void;
  timestamp: number;
}

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryCommand[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const execute = useCallback((command: Omit<HistoryCommand, 'timestamp'>) => {
    const newCommand: HistoryCommand = {
      ...command,
      timestamp: Date.now(),
    };

    // Execute the command
    newCommand.execute();

    // Clear any forward history
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newCommand);

    // Limit history to 50 commands
    if (newHistory.length > 50) {
      newHistory.shift();
      setCurrentIndex(49);
    } else {
      setCurrentIndex(newHistory.length - 1);
    }

    setHistory(newHistory);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex < 0) return;

    const command = history[currentIndex];
    command.undo();
    setCurrentIndex(currentIndex - 1);
  }, [history, currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1) return;

    const nextIndex = currentIndex + 1;
    const command = history[nextIndex];
    command.execute();
    setCurrentIndex(nextIndex);
  }, [history, currentIndex]);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    execute,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
};
