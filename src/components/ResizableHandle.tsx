"use client";

import { useCallback } from "react";
import { GripVertical, GripHorizontal } from "lucide-react";

interface ResizableHandleProps {
  /** "horizontal" resizes left/right (sidebar width), "vertical" resizes top/bottom (editor height) */
  direction: "horizontal" | "vertical";
  onDelta: (delta: number) => void;
}

/**
 * A drag handle that emits pixel delta events on mouse drag.
 * Prevents text selection and locks the cursor style during drag.
 */
export function ResizableHandle({ direction, onDelta }: ResizableHandleProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      document.body.style.cursor =
        direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (event: MouseEvent) => {
        const delta =
          direction === "horizontal" ? event.movementX : event.movementY;
        onDelta(delta);
      };

      const handleMouseUp = () => {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [direction, onDelta]
  );

  if (direction === "horizontal") {
    return (
      <div
        onMouseDown={handleMouseDown}
        className="w-1 bg-zinc-800 hover:bg-violet-500/60 cursor-col-resize flex-shrink-0 flex items-center justify-center group transition-colors duration-150"
        title="Drag to resize"
      >
        <GripVertical className="w-3 h-3 text-zinc-700 group-hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="h-1 bg-zinc-800 hover:bg-violet-500/60 cursor-row-resize flex-shrink-0 flex items-center justify-center group transition-colors duration-150"
      title="Drag to resize"
    >
      <GripHorizontal className="w-3 h-3 text-zinc-700 group-hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
