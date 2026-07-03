import type { ReactNode } from "react";

import type { ConceptDetail } from "@/features/learn/lib/queries";
import { ConceptHeader } from "./ConceptHeader";
import { ConceptInteractive } from "./ConceptInteractive";
import { YourTurnRail } from "./YourTurnRail";

type Props = {
  concept: ConceptDetail;
  understandContent: ReactNode;
  simulateContent: ReactNode;
  challengeContent: ReactNode;
  interviewContent: ReactNode;
  buildContent: ReactNode;
};

// Server component: renders the static header + rail (and the server-rendered
// Understand content built by the page) and hands them to the client tab switcher
// as props, keeping them out of the client bundle.
export function ConceptPageShell({
  concept,
  understandContent,
  simulateContent,
  challengeContent,
  interviewContent,
  buildContent,
}: Props) {
  return (
    <ConceptInteractive
      header={<ConceptHeader concept={concept} />}
      rail={<YourTurnRail />}
      understandContent={understandContent}
      simulateContent={simulateContent}
      challengeContent={challengeContent}
      interviewContent={interviewContent}
      buildContent={buildContent}
    />
  );
}
