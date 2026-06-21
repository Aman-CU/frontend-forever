"use client";

import { Lightbulb } from "lucide-react";

import { useEventLoopSimulator } from "../hooks/useEventLoopSimulator";
import { BrowserChromeBar } from "./BrowserChromeBar";
import { CallStack } from "./CallStack";
import { CodePanel } from "./CodePanel";
import { ExecutionOrder } from "./ExecutionOrder";
import { MicrotaskQueue } from "./MicrotaskQueue";
import { OutputPanel } from "./OutputPanel";
import { PanelHeader } from "./PanelHeader";
import { SimulatorControls } from "./SimulatorControls";
import { TaskQueue } from "./TaskQueue";
import { WebAPIs } from "./WebAPIs";

export function EventLoopSimulator() {
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
  } = useEventLoopSimulator();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-xl">
      <span className="sr-only" role="status" aria-live="polite">
        {`Step ${currentStep} of ${totalSteps}: ${frame.description}`}
      </span>

      <BrowserChromeBar />
      <PanelHeader currentStep={currentStep} totalSteps={totalSteps} isPlaying={isPlaying} />

      <div className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CallStack items={frame.callStack} />
          <WebAPIs items={frame.webAPIs} />
          <MicrotaskQueue items={frame.microtaskQueue} />
          <TaskQueue items={frame.taskQueue} />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <CodePanel activeLines={frame.activeCodeLines} />
          </div>
          <div className="lg:col-span-1">
            <OutputPanel consoleOutput={frame.consoleOutput} />
          </div>
        </div>

        <ExecutionOrder consoleOutput={frame.consoleOutput} />
        <InsightCallout />
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
    <div className="flex items-start gap-2.5 rounded-lg border border-border-light bg-surface-secondary p-3">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="text-sm text-text-secondary">
        <span className="font-medium text-text-primary">
          Microtasks are executed before tasks.
        </span>{" "}
        That&apos;s why <span className="font-mono text-info">Promise</span>{" "}
        callbacks run before{" "}
        <span className="font-mono text-streak">setTimeout</span>.
      </p>
    </div>
  );
}
