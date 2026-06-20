import { useEffect, useState } from "react";

import { EVENT_LOOP_FRAMES } from "../data/scenarios";
import type { SimulatorSpeed } from "../types";

const TOTAL_STEPS = EVENT_LOOP_FRAMES.length;
const BASE_INTERVAL_MS = 1800;

export function useEventLoopSimulator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [speed, setSpeed] = useState<SimulatorSpeed>(1);

  useEffect(() => {
    if (!isPlaying) return;

    const id = setTimeout(() => {
      if (currentStep === TOTAL_STEPS) {
        if (autoplay) {
          setCurrentStep(1);
        } else {
          setIsPlaying(false);
        }
        return;
      }
      setCurrentStep((step) => step + 1);
    }, BASE_INTERVAL_MS / speed);

    return () => clearTimeout(id);
  }, [isPlaying, currentStep, speed, autoplay]);

  function play() {
    setCurrentStep((step) => (step === TOTAL_STEPS ? 1 : step));
    setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
  }

  function step() {
    setIsPlaying(false);
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function stepBack() {
    setIsPlaying(false);
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  function restart() {
    setIsPlaying(false);
    setCurrentStep(1);
  }

  function toggleAutoplay() {
    setAutoplay((value) => !value);
  }

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    isPlaying,
    autoplay,
    speed,
    setSpeed,
    frame: EVENT_LOOP_FRAMES[currentStep - 1],
    play,
    pause,
    step,
    stepBack,
    restart,
    toggleAutoplay,
  };
}
