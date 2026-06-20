import { ListOrdered } from "lucide-react";

import { SimulatorPanel } from "./SimulatorPanel";
import type { PanelItem } from "../types";

type TaskQueueProps = {
  items: PanelItem[];
};

export function TaskQueue({ items }: TaskQueueProps) {
  return <SimulatorPanel title="Task Queue" icon={ListOrdered} theme="streak" items={items} />;
}
