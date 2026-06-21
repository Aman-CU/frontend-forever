"use client";

import { motion } from "framer-motion";

import { AmazonLogo } from "@/components/shared/logos/AmazonLogo";
import { AnthropicLogo } from "@/components/shared/logos/AnthropicLogo";
import { CursorLogo } from "@/components/shared/logos/CursorLogo";
import { GoogleLogo } from "@/components/shared/logos/GoogleLogo";
import { MetaLogo } from "@/components/shared/logos/MetaLogo";
import { MicrosoftLogo } from "@/components/shared/logos/MicrosoftLogo";
import { StripeLogo } from "@/components/shared/logos/StripeLogo";

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
        className="flex w-full items-center justify-start gap-8 overflow-x-auto px-6 text-text-primary [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] lg:justify-center lg:gap-10 lg:overflow-visible lg:px-0 lg:[mask-image:none]"
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
            <span className="sr-only">{name}</span>
            <Logo />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
