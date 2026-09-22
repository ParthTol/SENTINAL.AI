import React from "react";
import { COLORS } from "../data";

/**
 * SignalBars — the site's signature motif.
 *
 * A small bank of vertical bars, styled after the "now playing" equalizer
 * bars, repurposed here as a live risk/activity signal. Two modes:
 *
 *  - pulse (default): bars loop continuously, implying a live feed.
 *  - value: bar heights are driven by a `values` array (0-100), for
 *    showing an actual risk/severity read-out that still has a subtle
 *    idle animation.
 */
export default function SignalBars({
  mode = "pulse",
  values,
  count = 4,
  color = COLORS.green,
  colors,
  size = "md",
  className = "",
}) {
  const sizes = {
    sm: { w: 3, h: 14, gap: 2 },
    md: { w: 4, h: 22, gap: 3 },
    lg: { w: 6, h: 40, gap: 4 },
  };
  const s = sizes[size] || sizes.md;
  const bars = mode === "value" && values ? values : Array.from({ length: count }, () => null);

  return (
    <div
      className={`inline-flex items-end ${className}`}
      style={{ height: s.h, gap: s.gap }}
      aria-hidden="true"
    >
      {bars.map((v, i) => {
        const barColor = colors?.[i] || color;
        const staticHeight = v != null ? `${Math.max(12, v)}%` : undefined;
        return (
          <span
            key={i}
            className={mode === "pulse" ? "animate-[equalize_1s_ease-in-out_infinite]" : "animate-[equalize_2.2s_ease-in-out_infinite]"}
            style={{
              display: "block",
              width: s.w,
              height: staticHeight || "100%",
              background: barColor,
              borderRadius: 2,
              transformOrigin: "bottom",
              animationDelay: `${i * 0.15}s`,
              opacity: mode === "value" ? 0.9 : 1,
            }}
          />
        );
      })}
    </div>
  );
}
