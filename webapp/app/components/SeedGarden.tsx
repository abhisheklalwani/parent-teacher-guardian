"use client";

import { Sprout } from "lucide-react";
import type { CSSProperties } from "react";

/** Deterministic scatter so plants don't reshuffle on re-render. */
function plantStyle(index: number, total: number): CSSProperties {
  const golden = 0.6180339887;
  const left = ((index * golden) % 1) * 92 + 4;
  const top = ((index * golden * 3.7) % 1) * 78 + 8;
  const size = 18 + ((index * 5) % 14);
  const rotate = ((index * 37) % 50) - 25;
  const opacity = 0.18 + ((index * 7) % 12) / 100;

  // Keep a soft clear zone in the center for the welcome text.
  const inCenter = left > 28 && left < 72 && top > 22 && top < 62;
  const nudgedTop = inCenter
    ? top < 42
      ? top * 0.45
      : 62 + (top - 62) * 0.5
    : top;

  return {
    left: `${left}%`,
    top: `${nudgedTop}%`,
    width: size,
    height: size,
    opacity: Math.min(0.38, opacity + (total > 12 ? 0 : 0.06)),
    transform: `rotate(${rotate}deg)`,
  };
}

type SeedGardenProps = {
  count: number;
};

export function SeedGarden({ count }: SeedGardenProps) {
  const plants = Math.min(count, 40);

  if (plants <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: plants }, (_, index) => (
        <Sprout
          key={index}
          strokeWidth={1.5}
          className="absolute text-success transition-opacity duration-500"
          style={plantStyle(index, plants)}
        />
      ))}
    </div>
  );
}
