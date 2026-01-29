import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ColumnDividerProps {
  onDrag: (deltaX: number) => void;
  showGuides?: boolean;
}

const SNAP_POINTS = [25, 33.33, 50, 66.67, 75];

export function ColumnDivider({ onDrag, showGuides = false }: ColumnDividerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      onDrag(deltaX);
      startXRef.current = e.clientX;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Notify parent that dragging ended
      document.dispatchEvent(new Event('columnDividerDragEnd'));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onDrag]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  return (
    <>
      {(isDragging || showGuides) && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {SNAP_POINTS.map((point) => (
            <div
              key={point}
              className="absolute top-0 bottom-0 w-px bg-primary/30 border-l-2 border-dashed border-primary/50"
              style={{ left: `${point}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded whitespace-nowrap">
                {Math.round(point)}%
              </div>
            </div>
          ))}
        </div>
      )}
      <div
        className={cn(
          "relative w-1 cursor-col-resize group hover:bg-primary/20 transition-colors flex items-center justify-center z-20",
          isDragging && "bg-primary/30"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
        <div
          className={cn(
            "w-1 h-12 rounded-full bg-border group-hover:bg-primary transition-colors",
            isDragging && "bg-primary"
          )}
        />
      </div>
    </>
  );
}

