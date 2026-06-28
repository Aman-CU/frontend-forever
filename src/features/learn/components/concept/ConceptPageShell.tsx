"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Code2, Lightbulb, Trophy, Users, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { type ConceptTab } from "@/lib/constants";
import type { ConceptDetail } from "@/features/learn/lib/queries";
import { ConceptHeader } from "./ConceptHeader";
import { ConceptTabs } from "./ConceptTabs";
import { TabPlaceholder } from "./TabPlaceholder";
import { YourTurnRail } from "./YourTurnRail";

// Placeholder copy per tab — replaced by Features 22-26 with real content.
const TAB_BODY: Record<ConceptTab, { icon: LucideIcon; title: string; description: string }> = {
  understand: {
    icon: Lightbulb,
    title: "Understand content — coming in Feature 22",
    description: "The concept guide (MDX) and the What's Happening / Key Insight cards render here.",
  },
  simulate: {
    icon: Code2,
    title: "Simulate content — coming in Feature 23",
    description: "The full interactive simulator with play, step, and scenario controls lives here.",
  },
  challenge: {
    icon: Trophy,
    title: "Challenge content — coming in Feature 24",
    description: "A Monaco editor, test runner, and progressive hints for the concept challenge.",
  },
  interview: {
    icon: Users,
    title: "Interview content — coming in Feature 25",
    description: "Common interview questions about this concept, each with a revealable answer.",
  },
  build: {
    icon: Wrench,
    title: "Build content — coming in Feature 26",
    description: "A project brief and Monaco editor to implement something real with this concept.",
  },
};

type Props = {
  concept: ConceptDetail;
};

export function ConceptPageShell({ concept }: Props) {
  const [activeTab, setActiveTab] = useState<ConceptTab>("understand");
  const body = TAB_BODY[activeTab];

  return (
    <div className="flex flex-col gap-6 px-6 py-8 md:px-8 lg:flex-row lg:gap-8">
      {/* Concept section — header, tabs, and the active tab body */}
      <div className="min-w-0 flex-1">
        <ConceptHeader concept={concept} />

        <ConceptTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <TabPlaceholder icon={body.icon} title={body.title} description={body.description} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Your Turn rail — full-height right column starting at the top, Understand tab only */}
      {activeTab === "understand" && (
        <aside className="shrink-0 lg:w-72">
          <YourTurnRail />
        </aside>
      )}
    </div>
  );
}
