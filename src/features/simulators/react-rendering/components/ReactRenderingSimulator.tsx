"use client";

import { Lightbulb } from "lucide-react";

import { BrowserChromeBar } from "@/components/shared/simulator-chrome/BrowserChromeBar";
import { PanelHeader } from "@/components/shared/simulator-chrome/PanelHeader";
import { SimulatorControls } from "@/components/shared/simulator-chrome/SimulatorControls";

import { useReactRenderingSimulator } from "../hooks/useReactRenderingSimulator";
import { ExecutionFlowBar } from "./ExecutionFlowBar";
import { StageCardsRow } from "./StageCardsRow";

export function ReactRenderingSimulator() {
  const {
    currentStep,
    totalSteps,
    isPlaying,
    autoplay,
    speed,
    setSpeed,
    frame,
    play,
    pause,
    step,
    stepBack,
    restart,
    toggleAutoplay,
  } = useReactRenderingSimulator();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-xl">
      <span className="sr-only" role="status" aria-live="polite">
        {`Step ${currentStep} of ${totalSteps}: ${frame.description}`}
      </span>

      <BrowserChromeBar />
      <PanelHeader currentStep={currentStep} totalSteps={totalSteps} isPlaying={isPlaying} />

      <div className="flex flex-col gap-3 p-4">
        <StageCardsRow
          cardStatuses={frame.cardStatuses}
          componentStateCount={frame.componentStateCount}
          realDomCount={frame.realDomCount}
          isPlaying={isPlaying}
          onIncrement={play}
        />
        <InsightCallout />
        <ExecutionFlowBar currentStep={currentStep} />
      </div>

      <SimulatorControls
        currentStep={currentStep}
        totalSteps={totalSteps}
        isPlaying={isPlaying}
        autoplay={autoplay}
        speed={speed}
        onPlay={play}
        onPause={pause}
        onStep={step}
        onStepBack={stepBack}
        onRestart={restart}
        onToggleAutoplay={toggleAutoplay}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}

function InsightCallout() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border-light bg-accent-light p-3">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="text-sm text-text-secondary">
        <span className="font-medium text-text-primary">
          React does not update the entire page.
        </span>{" "}
        React <span className="font-semibold text-accent">compares changes first</span>, then
        updates <span className="font-semibold text-accent">only what changed</span>.
      </p>
    </div>
  );
}
