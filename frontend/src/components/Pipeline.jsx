import React, { useState } from "react";
import { Check } from "lucide-react";
import { PIPELINE_STEPS } from "../data";
import SignalBars from "./SignalBars";

export default function Pipeline() {
  const [active, setActive] = useState(1);
  const step = PIPELINE_STEPS.find((s) => s.id === active);

  return (
    <section id="pipeline" className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-bold tracking-widest text-green uppercase">How It Works</span>
        <h2 className="text-white font-extrabold text-3xl md:text-4xl tracking-tight mt-3">
          One photo, six simulated stages
        </h2>
        <p className="text-gray text-sm md:text-base mt-4">
          Every inspection moves through the same pipeline. Select a stage to see the kind of data it produces.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Step list */}
        <div className="lg:col-span-2 space-y-2">
          {PIPELINE_STEPS.map((s) => {
            const isActive = s.id === active;
            const isDone = s.id < active;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className="w-full text-left flex items-start gap-4 px-4 py-3.5 rounded-xl transition-colors"
                style={{
                  background: isActive ? "rgba(29,185,84,0.08)" : "transparent",
                  border: `1px solid ${isActive ? "#1DB95444" : "transparent"}`,
                }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: isActive || isDone ? "#1DB954" : "#1F1F1F",
                    color: isActive || isDone ? "#000" : "#727272",
                  }}
                >
                  {isDone ? <Check size={13} /> : s.id}
                </span>
                <span>
                  <span className="block text-sm font-bold" style={{ color: isActive ? "#fff" : "#B3B3B3" }}>
                    {s.title}
                  </span>
                  <span className="block text-xs mt-0.5 text-grayDim">{s.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Data feed panel */}
        <div className="lg:col-span-3 rounded-2xl border border-line bg-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <SignalBars size="sm" count={3} />
              <span className="text-xs font-bold text-white uppercase tracking-wide">{step.title} — data feed</span>
            </div>
            <span className="text-[11px] font-mono text-grayDim">stage {step.id}/6</span>
          </div>

          <div className="flex-1 rounded-xl bg-elevated border border-line p-5 font-mono text-xs space-y-2.5 min-h-[200px]">
            {step.feed.map((line, i) => (
              <div
                key={line}
                className="flex items-center gap-2 text-greenBright animate-fadeUp"
                style={{ animationDelay: `${i * 0.12}s`, color: "#1ED760" }}
              >
                <span className="text-grayDim">$</span> {line}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-5">
            <button
              disabled={active === 1}
              onClick={() => setActive((a) => Math.max(1, a - 1))}
              className="text-xs font-semibold text-gray disabled:opacity-30 hover:text-white transition-colors"
            >
              ← Previous
            </button>
            <button
              disabled={active === 6}
              onClick={() => setActive((a) => Math.min(6, a + 1))}
              className="text-xs font-bold text-black bg-green disabled:opacity-30 px-4 py-2 rounded-full hover:bg-greenBright transition-colors"
            >
              Next Stage →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
