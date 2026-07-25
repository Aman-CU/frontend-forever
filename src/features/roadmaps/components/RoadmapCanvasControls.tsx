import { Minus, Plus, Maximize } from "lucide-react";

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function RoadmapCanvasControls({ onZoomIn, onZoomOut, onReset }: Props) {
  const buttonClass =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary shadow-sm transition-colors hover:border-accent hover:text-accent";

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <button type="button" onClick={onZoomIn} className={buttonClass} aria-label="Zoom in">
        <Plus className="h-4 w-4" aria-hidden />
      </button>
      <button type="button" onClick={onZoomOut} className={buttonClass} aria-label="Zoom out">
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <button type="button" onClick={onReset} className={buttonClass} aria-label="Reset view">
        <Maximize className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
