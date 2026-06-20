import { Layers } from "lucide-react";

import { SimulatorPanel } from "./SimulatorPanel";
import type { PanelItem } from "../types";

type CallStackProps = {
  items: PanelItem[];
};

export function CallStack({ items }: CallStackProps) {
  return (
    <SimulatorPanel
      title="Call Stack"
      icon={Layers}
      theme="premium"
      items={items}
      emptyLabel="Stack is empty"
      pulse
    />
  );
}
