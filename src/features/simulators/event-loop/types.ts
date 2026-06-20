export type PanelTheme = "premium" | "success" | "info" | "streak";

export type PanelItem = {
  code: string;
  status: string;
};

export type SimulatorFrame = {
  step: number;
  callStack: PanelItem[];
  webAPIs: PanelItem[];
  microtaskQueue: PanelItem[];
  taskQueue: PanelItem[];
  consoleOutput: string[];
  activeCodeLines: number[];
};

export type ExecutionOrderEntry = {
  code: string;
  theme: PanelTheme;
};

export type SimulatorSpeed = 0.5 | 1 | 1.5 | 2;
