"use client";

import { ArrowDown, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";
import { BrowserChromeBar } from "@/components/shared/simulator-chrome/BrowserChromeBar";
import { PanelHeader } from "@/components/shared/simulator-chrome/PanelHeader";
import { ScenarioSwitcher } from "@/components/shared/simulator-chrome/ScenarioSwitcher";
import { SimulatorControls } from "@/components/shared/simulator-chrome/SimulatorControls";
import type { SimulatorRootProps } from "@/components/shared/simulator-chrome/types";

import { useBrowserPipelineSimulator } from "../hooks/useBrowserPipelineSimulator";
import { ParseTracksRow } from "./ParseTracksRow";
import { PipelineStagesRow } from "./PipelineStagesRow";
import { StageRail } from "./StageRail";

export function BrowserPipelineSimulator({
  showScenarioSwitcher,
  onReachedEnd,
}: SimulatorRootProps = {}) {
  const {
    currentStep,
    totalSteps,
    isPlaying,
    autoplay,
    speed,
    setSpeed,
    frame,
    scenario,
    scenarios,
    activeScenarioId,
    setScenario,
    play,
    pause,
    step,
    stepBack,
    restart,
    toggleAutoplay,
  } = useBrowserPipelineSimulator({ onReachedEnd });

  const mergeActive = frame.stageStatuses["render-tree"] !== "pending";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-xl">
      <span className="sr-only" role="status" aria-live="polite">
        {`Step ${currentStep} of ${totalSteps}: ${frame.description}`}
      </span>

      <BrowserChromeBar />
      <PanelHeader currentStep={currentStep} totalSteps={totalSteps} isPlaying={isPlaying} />

      <div className="flex flex-col gap-2.5 p-4">
        {showScenarioSwitcher && (
          <ScenarioSwitcher
            scenarios={scenarios}
            activeId={activeScenarioId}
            onChange={setScenario}
          />
        )}
        <StageRail stageStatuses={frame.stageStatuses} />
        <ParseTracksRow
          stageStatuses={frame.stageStatuses}
          htmlSource={scenario.htmlSource}
          cssSource={scenario.cssSource}
          domTree={scenario.domTree}
          cssomTree={scenario.cssomTree}
        />
        <MergeConnector active={mergeActive} />
        <PipelineStagesRow
          stageStatuses={frame.stageStatuses}
          renderTree={scenario.renderTree}
          renderTreeCaption={scenario.renderTreeCaption}
          layoutBoxes={scenario.layoutBoxes}
          pageBoxes={scenario.pageBoxes}
        />
        <InsightCallout title={scenario.insight.title} body={scenario.insight.body} />
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

function MergeConnector({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 py-0.5" aria-hidden="true">
      <div className={cn("h-3 w-px", active ? "bg-accent" : "bg-border")} />
      <ArrowDown className={cn("size-3.5", active ? "text-accent" : "text-text-muted")} />
      <div className={cn("h-3 w-px", active ? "bg-accent" : "bg-border")} />
    </div>
  );
}

function InsightCallout({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border-light bg-accent-light p-3">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="text-sm text-text-secondary">
        <span className="font-medium text-text-primary">{title}</span> {body}
      </p>
    </div>
  );
}
