import React from "react";
import { Clock, Eye, TrendingDown } from "lucide-react";

const POINTS = [
  {
    icon: Eye,
    title: "Defects go unnoticed",
    body: "Manual visual inspections cover a fraction of a city's road and structure network each year, so early-stage cracking and corrosion often go undetected until they become expensive.",
  },
  {
    icon: Clock,
    title: "Inspections are slow",
    body: "A single engineer can only assess a handful of assets per day. At that pace, a full pass over a mid-size municipal network takes months, not weeks.",
  },
  {
    icon: TrendingDown,
    title: "Risk isn't prioritized",
    body: "Without a consistent scoring method, maintenance budgets get spread evenly instead of going first to the assets that pose the greatest structural or safety risk.",
  },
];

export default function Problem() {
  return (
    <section id="problem" className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-bold tracking-widest text-green uppercase">The Problem</span>
        <h2 className="text-white font-extrabold text-3xl md:text-4xl tracking-tight mt-3">
          Aging infrastructure, inspected the slow way
        </h2>
        <p className="text-gray text-sm md:text-base mt-4">
          Municipal networks are growing faster than the teams that inspect them. Sentinel AI is built to close
          that gap with a consistent, photo-based triage layer that sits in front of manual inspection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {POINTS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-line bg-card p-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-elevated mb-4">
              <p.icon size={18} className="text-green" />
            </div>
            <h3 className="text-white font-bold text-base mb-2">{p.title}</h3>
            <p className="text-gray text-sm leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
