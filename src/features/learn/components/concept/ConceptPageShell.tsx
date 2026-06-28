import type { ConceptDetail } from "@/features/learn/lib/queries";
import { ConceptHeader } from "./ConceptHeader";
import { ConceptInteractive } from "./ConceptInteractive";
import { YourTurnRail } from "./YourTurnRail";

type Props = {
  concept: ConceptDetail;
};

// Server component: renders the static header + rail on the server and hands them
// to the client tab switcher as props, keeping them out of the client bundle.
export function ConceptPageShell({ concept }: Props) {
  return (
    <ConceptInteractive
      header={<ConceptHeader concept={concept} />}
      rail={<YourTurnRail />}
    />
  );
}
