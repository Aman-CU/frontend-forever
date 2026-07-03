"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { type ConceptTab } from "@/lib/constants";
import { ConceptTabs } from "./ConceptTabs";

type Props = {
  // header, rail, and every tab's content are built upstream and passed in as
  // nodes, so they stay off this client component's own bundle (Understand
  // renders MDX, which needs the server). All 5 tabs are real as of Feature 26.
  header: ReactNode;
  rail: ReactNode;
  understandContent: ReactNode;
  simulateContent: ReactNode;
  challengeContent: ReactNode;
  interviewContent: ReactNode;
  buildContent: ReactNode;
};

export function ConceptInteractive({
  header,
  rail,
  understandContent,
  simulateContent,
  challengeContent,
  interviewContent,
  buildContent,
}: Props) {
  const [activeTab, setActiveTab] = useState<ConceptTab>("understand");

  return (
    <div className="flex flex-col gap-6 px-6 py-8 md:px-8 lg:flex-row lg:gap-8">
      {/* Concept section — header, tabs, and the active tab body */}
      <div className="min-w-0 flex-1">
        {header}

        <ConceptTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div
          id={`concept-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`concept-tab-${activeTab}`}
          tabIndex={0}
          className="mt-6 outline-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {activeTab === "understand" ? (
                understandContent
              ) : activeTab === "simulate" ? (
                simulateContent
              ) : activeTab === "challenge" ? (
                challengeContent
              ) : activeTab === "interview" ? (
                interviewContent
              ) : (
                buildContent
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Your Turn rail — full-height right column starting at the top, Understand tab only */}
      {activeTab === "understand" && (
        <aside aria-label="Your Turn" className="shrink-0 lg:w-72">
          {rail}
        </aside>
      )}
    </div>
  );
}
