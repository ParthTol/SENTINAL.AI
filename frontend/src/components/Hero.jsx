import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import SignalBars from "./SignalBars";
import useDashboard from "../hooks/useDashboard";

export default function Hero() {
  const navigate = useNavigate();
  const { summaryStats, loading } = useDashboard();

  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(29,185,84,0.14) 0%, rgba(18,18,18,0) 70%)" }}
      />
      <div className="relative max-w-7xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-16 text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-elevated text-gray border border-line mb-6">
          <MapPin size={11} /> Pune Municipal Region — Live Build
        </span>

        <h1 className="text-white font-extrabold tracking-tight text-4xl sm:text-5xl md:text-6xl leading-[1.05] max-w-3xl mx-auto">
          AI-Powered Infrastructure Health <span className="text-green">&amp; Risk Monitoring</span>
        </h1>
        <p className="text-gray text-base md:text-lg mt-5 max-w-xl mx-auto">
          Upload a photo of a road, bridge, flyover, or building. Sentinel AI runs it through the full
          inspection pipeline — YOLO detection, feature extraction, and a composite maintenance risk score
          — in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button
            onClick={() => navigate("/upload")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-green text-black hover:bg-greenBright transition-colors"
          >
            Try the Live Demo <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full font-bold text-sm bg-elevated text-white border border-line hover:bg-cardHover transition-colors"
          >
            View Dashboard
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-10 text-green">
          <SignalBars mode="pulse" count={5} size="lg" />
        </div>

        {/* Live KPI cards from backend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl mx-auto">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl border border-line bg-card px-4 py-5 animate-pulse">
                  <div className="h-7 w-12 rounded bg-elevated mx-auto mb-2" />
                  <div className="h-2 w-20 rounded bg-elevated mx-auto" />
                </div>
              ))
            : summaryStats?.map((s) => (
                <div key={s.label} className="rounded-2xl border border-line bg-card px-4 py-5">
                  <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[11px] font-semibold text-gray mt-1">{s.label}</div>
                  <div className="text-[10px] text-grayDim mt-0.5">{s.sub}</div>
                </div>
              ))
          }
        </div>
      </div>
    </section>
  );
}
