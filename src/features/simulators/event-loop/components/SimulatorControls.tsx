"use client";

import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { SimulatorSpeed } from "../types";

const SPEED_OPTIONS: SimulatorSpeed[] = [0.5, 1, 1.5, 2];

type SimulatorControlsProps = {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  autoplay: boolean;
  speed: SimulatorSpeed;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onStepBack: () => void;
  onRestart: () => void;
  onToggleAutoplay: () => void;
  onSpeedChange: (speed: SimulatorSpeed) => void;
};

export function SimulatorControls({
  currentStep,
  totalSteps,
  isPlaying,
  autoplay,
  speed,
  onPlay,
  onPause,
  onStep,
  onStepBack,
  onRestart,
  onToggleAutoplay,
  onSpeedChange,
}: SimulatorControlsProps) {
  const isAtStart = currentStep === 1;
  const isAtEnd = currentStep === totalSteps;

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface-secondary px-6 py-4">
      <button
        type="button"
        onClick={isPlaying ? onPause : onPlay}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-text-inverse"
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        type="button"
        onClick={onStepBack}
        disabled={isAtStart}
        aria-label="Step back"
        className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SkipBack className="size-4 text-text-secondary" />
      </button>

      <button
        type="button"
        onClick={onStep}
        disabled={isAtEnd}
        aria-label="Step forward"
        className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SkipForward className="size-4 text-text-secondary" />
      </button>

      <button
        type="button"
        onClick={onRestart}
        aria-label="Restart"
        className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 hover:bg-surface-secondary"
      >
        <RotateCcw className="size-4 text-text-secondary" />
      </button>

      <div className="flex items-center gap-2">
        <Switch
          checked={autoplay}
          onCheckedChange={() => onToggleAutoplay()}
          aria-label="Toggle autoplay"
        />
        <span className="text-sm text-text-secondary">Auto play</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "ml-auto inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary",
          )}
        >
          {speed}x
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {SPEED_OPTIONS.map((option) => (
            <DropdownMenuItem key={option} onClick={() => onSpeedChange(option)}>
              {option}x
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
