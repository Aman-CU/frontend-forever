import { Markdown } from "@/components/shared/Markdown";

// Thin wrapper kept for the practice feature's existing call sites. The actual
// small-Markdown renderer moved to components/shared/Markdown in Feature 25 (third
// consumer: MDX, challenge descriptions, interview answers → rule of three).
type Props = {
  markdown: string;
};

export function ChallengeDescription({ markdown }: Props) {
  return <Markdown markdown={markdown} />;
}
