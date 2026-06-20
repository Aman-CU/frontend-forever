export type PanelTheme = "premium" | "success" | "info" | "streak";

export type PanelItem = {
  code: string;
  status: string;
};

// Closed set of valid console output values for this scenario — keeps
// EXECUTION_ORDER_BY_OUTPUT lookups exhaustive and sound at compile time
// instead of allowing an arbitrary string that could miss the map.
export const CONSOLE_OUTPUT_TOKENS = ["start", "end", "promise", "timeout"] as const;
export type ConsoleOutputToken = (typeof CONSOLE_OUTPUT_TOKENS)[number];

export type SimulatorFrame = {
  step: number;
  callStack: PanelItem[];
  webAPIs: PanelItem[];
  microtaskQueue: PanelItem[];
  taskQueue: PanelItem[];
  consoleOutput: ConsoleOutputToken[];
  activeCodeLines: number[];
  description: string;
};

export type ExecutionOrderEntry = {
  code: string;
  theme: PanelTheme;
};

export type SimulatorSpeed = 0.5 | 1 | 1.5 | 2;
