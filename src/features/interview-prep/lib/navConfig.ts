// Static sidebar structure for /interview-prep/**. Not DB-driven — this is
// the section's information architecture, locked during Feature 30's
// planning (see build-plan.md, Phase 6). Playbook and Lightning Prep entries
// point at routes that 404 until Features 50/51 ship — same forward-link
// precedent as MoreInterviewPrepCta pointed at this section before it existed.

export type InterviewPrepNavItem = { label: string; href: string };
export type InterviewPrepNavSection = { label: string; items: InterviewPrepNavItem[] };

export const INTERVIEW_PREP_NAV: InterviewPrepNavSection[] = [
  {
    label: "FF Collections",
    items: [
      { label: "FF 75", href: "/interview-prep/ff-75" },
      { label: "FF JavaScript", href: "/interview-prep/ff-javascript" },
      { label: "FF React", href: "/interview-prep/ff-react" },
      { label: "FF Next.js", href: "/interview-prep/ff-nextjs" },
      { label: "FF Frontend System Design", href: "/interview-prep/ff-system-design" },
    ],
  },
  {
    label: "Playbook",
    items: [
      {
        label: "Frontend Interview Playbook",
        href: "/interview-prep/playbook/frontend-interview-playbook",
      },
      { label: "React Interview Playbook", href: "/interview-prep/playbook/react-interview-playbook" },
      {
        label: "Behavioural Interview Playbook",
        href: "/interview-prep/playbook/behavioural-interview-playbook",
      },
      {
        label: "Frontend System Design Playbook",
        href: "/interview-prep/playbook/frontend-system-design-playbook",
      },
      {
        label: "Frontend Resume Playbook",
        href: "/interview-prep/playbook/frontend-resume-playbook",
      },
      {
        label: "Build in Public & Open Source Playbook",
        href: "/interview-prep/playbook/build-in-public-playbook",
      },
    ],
  },
  {
    label: "Lightning Prep",
    items: [
      { label: "Study Plans", href: "/interview-prep/study-plans" },
      { label: "Company Guides", href: "/interview-prep/company-guides" },
    ],
  },
];
