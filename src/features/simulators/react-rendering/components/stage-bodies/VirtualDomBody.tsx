"use client";

import { Box } from "lucide-react";
import { motion } from "framer-motion";

import { CardZones } from "../StageCard";
import { MiniTree } from "../MiniTree";
import { PendingPlaceholder } from "../PendingPlaceholder";
import type { CardStatus } from "../../types";

type VirtualDomBodyProps = {
  status: CardStatus;
  count: number;
};

export function VirtualDomBody({ status, count }: VirtualDomBodyProps) {
  if (status === "pending") {
    return (
      <CardZones topLabel="Not created yet" bottomNote="Waiting…">
        <PendingPlaceholder icon={Box} />
      </CardZones>
    );
  }

  return (
    <CardZones topLabel="New Virtual DOM">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <MiniTree h2Value={count} highlight="success" />
      </motion.div>
    </CardZones>
  );
}
