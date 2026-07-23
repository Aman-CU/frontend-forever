import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { XLogo } from "@/components/shared/XLogo";

type FooterLink = {
  label: string;
  href: string;
};

type FooterGroup = {
  heading: string;
  links: FooterLink[];
};

const FOOTER_GROUPS: FooterGroup[] = [
  {
    heading: "Product",
    links: [
      { label: "Playground", href: "/playground" },
      { label: "Learn", href: "/learn" },
      { label: "Practice", href: "/practice" },
      { label: "Roadmaps", href: "/roadmaps" },
      { label: "Interview Prep", href: "/interview-prep" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "Follow Frontend Forever on X", href: "#", icon: XLogo },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface dark:bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center text-3xl font-bold text-text-primary">
                FF
              </span>
              <span className="text-base font-semibold text-text-primary">
                Frontend Forever
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-text-secondary">
              Frontend interview-ready concepts you can play with. Learn through
              live simulators, not static text.
            </p>

            <form className="mt-6 flex max-w-sm gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                aria-label="Email address"
              />
              <button
                type="submit"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Subscribe
              </button>
            </form>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold text-text-primary">
                {group.heading}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Frontend Forever. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
