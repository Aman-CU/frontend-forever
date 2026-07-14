import { InterviewPrepSidebar } from "@/components/layout/InterviewPrepSidebar";

export default function InterviewPrepLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <InterviewPrepSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
