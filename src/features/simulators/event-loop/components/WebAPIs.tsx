import { Cpu } from "lucide-react";

import { SimulatorPanel } from "./SimulatorPanel";
import type { PanelItem } from "../types";

type WebAPIsProps = {
  items: PanelItem[];
};

export function WebAPIs({ items }: WebAPIsProps) {
  return <SimulatorPanel title="Web APIs" icon={Cpu} theme="success" items={items} />;
}
