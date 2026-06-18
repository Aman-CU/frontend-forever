"use client";

import { motion } from "framer-motion";

import {
  AmazonLogo,
  AnthropicLogo,
  CursorLogo,
  GoogleLogo,
  MetaLogo,
  MicrosoftLogo,
  StripeLogo,
} from "@/components/shared/CompanyLogos";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const LOGOS = [
  { name: "Google", Logo: GoogleLogo },
  { name: "Meta", Logo: MetaLogo },
  { name: "Amazon", Logo: AmazonLogo },
  { name: "Microsoft", Logo: MicrosoftLogo },
  { name: "Stripe", Logo: StripeLogo },
  { name: "Anthropic", Logo: AnthropicLogo },
  { name: "Cursor", Logo: CursorLogo },
] as const;

export function CompanyLogosStrip() {
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.5 }}
        className="text-sm text-text-muted"
      >
        Practice concepts commonly discussed in interviews at
      </motion.p>
      <div
        className="flex w-full items-center justify-start gap-8 overflow-x-auto px-6 text-text-primary [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] sm:justify-center sm:gap-10 sm:overflow-visible sm:px-0 sm:[mask-image:none]"
        style={{ scrollbarWidth: "none" }}
      >
        {LOGOS.map(({ name, Logo }, index) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.55 + index * 0.06 }}
            className="shrink-0"
          >
            <Logo />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
