"use client";

import { GitCompare } from "lucide-react";
import { motion } from "framer-motion";

import { CardZones } from "../StageCard";
import { MiniTree } from "../MiniTree";
import { PendingPlaceholder } from "../PendingPlaceholder";
import type { CardStatus } from "../../types";

type DiffingBodyProps = {
  status: CardStatus;
  count: number;
};

export function DiffingBody({ status, count }: DiffingBodyProps) {
  if (status === "pending") {
    return (
      <CardZones topLabel="Not compared yet" bottomNote="Waiting…">
        <PendingPlaceholder icon={GitCompare} />
      </CardZones>
    );
  }

  return (
    <CardZones
      topLabel="Compare Changes"
      bottomNote={
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex items-center justify-center gap-1 text-streak"
        >
          <span className="size-1.5 rounded-full bg-streak" aria-hidden="true" />
          Changed: 1 node
        </motion.span>
      }
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="flex gap-3"
      >
        <MiniTree h2Value={0} label="Before" />
        <MiniTree h2Value={count} highlight="streak" label="After" />
      </motion.div>
    </CardZones>
  );
}
