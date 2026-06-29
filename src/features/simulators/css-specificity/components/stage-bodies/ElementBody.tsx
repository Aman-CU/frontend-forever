"use client";

import { Code2 } from "lucide-react";
import { motion } from "framer-motion";

import { PendingPlaceholder } from "../PendingPlaceholder";
import type { StageStatus } from "../../types";

type ElementBodyProps = {
  status: StageStatus;
  elementHtml: string;
};

export function ElementBody({ status, elementHtml }: ElementBodyProps) {
  if (status === "pending") {
    return <PendingPlaceholder icon={Code2} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 items-center justify-center"
    >
      <pre className="w-full overflow-x-auto rounded-md bg-surface-secondary p-2.5 text-left font-mono text-[11px] leading-relaxed text-text-secondary">
        <code>{elementHtml}</code>
      </pre>
    </motion.div>
  );
}
