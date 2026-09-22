import React, { useState } from "react";
import { FileText, Share2, Download } from "lucide-react";
import { REPORTS, COLORS } from "../data";

function Stat({ label, value, color }) {
  return (
    <div>
      <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[11px] mt-0.5 text-grayDim">{label}</div>
    </div>
  );
}

export default function Reports() {
  const [active, setActive] = useState(REPORTS[0]);
  const swatch = [COLORS.red, COLORS.orange, COLORS.yellow, COLORS.green];

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-2xl mb-10">
        <span className="text-xs font-bold tracking-widest text-green uppercase">Reports</span>
        <h2 className="text-white font-extrabold text-3xl md:text-4xl tracking-tight mt-3">
          Reports &amp; Recommendations
        </h2>
        <p className="text-gray text-sm md:text-base mt-4">
          Review infrastructure inspection findings and maintenance priorities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {REPORTS.map((r) => (
          <div key={r.id} className="rounded-2xl border border-line bg-card p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(29,185,84,0.14)" }}>
                <FileText size={16} className="text-green" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">{r.title}</div>
                <div className="text-[11px] text-grayDim">Generated {r.generated}</div>
              </div>
            </div>
            <div className="flex gap-6 text-xs mb-4">
              <div>
                <div className="text-grayDim">{r.stat1Label}</div>
                <div className="font-bold text-white">{r.stat1}</div>
              </div>
              <div>
                <div className="text-grayDim">Critical Issues</div>
                <div className="font-bold text-red">{r.critical} Detected</div>
              </div>
            </div>
            <button
              onClick={() => setActive(r)}
              className="w-full py-2.5 rounded-full text-xs font-bold transition-colors"
              style={{
                background: active.id === r.id ? "#1DB954" : "#1F1F1F",
                color: active.id === r.id ? "#000" : "#fff",
                border: `1px solid ${active.id === r.id ? "#1DB954" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {active.id === r.id ? "Currently Previewing" : "View Report"}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-green">Report Preview</div>
            <h3 className="text-white font-bold text-lg">{active.title}</h3>
            <p className="text-xs mt-1 max-w-xl text-grayDim">{active.summary}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-elevated text-white border border-line">
              <Share2 size={13} /> Share
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-green text-black">
              <Download size={13} /> Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Stat label="Total Assets" value={active.stat1} color="#fff" />
          <Stat label="Critical Issues" value={active.critical} color={COLORS.red} />
          <Stat label="High Risk" value={active.high} color={COLORS.orange} />
          <Stat label="Medium Risk" value={active.medium} color={COLORS.yellow} />
        </div>

        <div className="mb-6">
          <div className="text-xs font-semibold mb-2 text-grayDim">Detected Damage Distribution</div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-elevated">
            {active.topDefects.map((d, i) => (
              <div key={d.name} style={{ width: `${d.pct}%`, background: swatch[i % 4] }} title={`${d.name} ${d.pct}%`} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {active.topDefects.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-gray">
                <span className="w-2 h-2 rounded-full" style={{ background: swatch[i % 4] }} />
                {d.name} ({d.pct}%)
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold mb-2 text-grayDim">Prioritized Recommended Actions</div>
          <ul className="space-y-2">
            {active.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-green" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
