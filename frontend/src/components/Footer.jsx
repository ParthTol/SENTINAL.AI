import React from "react";
import { Home } from "lucide-react";
import SignalBars from "./SignalBars";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green shrink-0">
            <Home size={16} color="#000" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="text-white font-extrabold text-sm">SENTINEL AI</div>
            <div className="text-[10px] text-grayDim">Infrastructure Health & Risk Monitoring</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-green">
          <SignalBars size="sm" count={4} />
          Live Monitoring Active
        </div>

        <p className="text-[11px] text-grayDim text-center md:text-right max-w-sm">
          Demo build for a hackathon prototype. All data on this page is mocked — no backend, database, or real
          AI model is connected.
        </p>
      </div>
    </footer>
  );
}
