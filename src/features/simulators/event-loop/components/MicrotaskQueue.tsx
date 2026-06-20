import { Zap } from "lucide-react";

import { SimulatorPanel } from "./SimulatorPanel";
import type { PanelItem } from "../types";

type MicrotaskQueueProps = {
  items: PanelItem[];
};

export function MicrotaskQueue({ items }: MicrotaskQueueProps) {
  return <SimulatorPanel title="Microtask Queue" icon={Zap} theme="info" items={items} />;
}
