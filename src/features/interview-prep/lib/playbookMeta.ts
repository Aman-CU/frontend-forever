import { Atom, ClipboardList, FileText, GitFork, MessageCircle, Network } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { PlaybookSlug } from "@/lib/constants";

export type PlaybookMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
};

// Same monochrome-icon precedent as collectionMeta.ts (GreatFrontEnd's own
// Dashboard treatment, user preference 2026-07-14) — no per-playbook colorKey.
export const PLAYBOOK_META: Record<PlaybookSlug, PlaybookMeta> = {
  "frontend-interview-playbook": {
    label: "Frontend Interview Playbook",
    description: "How interviews are structured, what interviewers score, and how to prepare.",
    icon: ClipboardList,
  },
  "react-interview-playbook": {
    label: "React Interview Playbook",
    description: "The question taxonomy React interviews test and live-coding gotchas explained.",
    icon: Atom,
  },
  "behavioural-interview-playbook": {
    label: "Behavioural Interview Playbook",
    description: "The STAR method done properly, and building your own personal story bank.",
    icon: MessageCircle,
  },
  "frontend-system-design-playbook": {
    label: "Frontend System Design Playbook",
    description: "A repeatable framework for frontend system design — requirements to tradeoffs.",
    icon: Network,
  },
  "frontend-resume-playbook": {
    label: "Frontend Resume Playbook",
    description: "What recruiters scan for in 8 seconds, and turning projects into resume material.",
    icon: FileText,
  },
  "build-in-public-playbook": {
    label: "Build in Public & Open Source Playbook",
    description: "Building visibility through public work and open source, without burning out chasing an audience.",
    icon: GitFork,
  },
};
