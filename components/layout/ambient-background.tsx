"use client";

import { motion } from "framer-motion";
import { useAppPreferences } from "@/components/providers/app-preferences-provider";
import { cn } from "@/lib/utils";

/** Fixed behind content; slow drift + scale so corners feel alive without distracting. */
export function AmbientBackground() {
  const { theme } = useAppPreferences();

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-opacity duration-500",
        theme === "light" && "opacity-[0.88]",
      )}
    >
      <motion.div
        className="absolute -start-28 top-[-4rem] h-[20rem] w-[20rem] rounded-full bg-gradient-to-br from-cyan-300/28 via-sky-400/16 to-transparent blur-3xl sm:h-[22rem] sm:w-[22rem] dark:from-cyan-400/35 dark:via-sky-500/20 dark:to-transparent"
        aria-hidden
        animate={{
          x: [0, 32, -18, 14, 0],
          y: [0, 20, 10, -12, 0],
          scale: [1, 1.12, 1.04, 1.08, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -end-24 top-8 h-[24rem] w-[24rem] rounded-full bg-gradient-to-bl from-violet-400/26 via-fuchsia-300/14 to-transparent blur-3xl sm:top-12 sm:h-[26rem] sm:w-[26rem] dark:from-violet-500/40 dark:via-fuchsia-500/22 dark:to-transparent"
        aria-hidden
        animate={{
          x: [0, -36, 20, -24, 0],
          y: [0, 28, -14, 18, 0],
          scale: [1, 1.1, 0.96, 1.06, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
      />
      <motion.div
        className="absolute bottom-8 start-[34%] h-64 w-64 rounded-full bg-indigo-400/14 blur-3xl dark:bg-blue-500/12"
        aria-hidden
        animate={{
          opacity: [0.35, 0.55, 0.42, 0.35],
          scale: [1, 1.06, 0.98, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}
