import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { STAGES, DEFECT_CARDS, BOXES, DEMO_PRESETS, COLORS } from "../data";
import SignalBars from "./SignalBars";
import { analyzeImage } from "../api/client";

// ── Asset type options ─────────────────────────────────────────────────────
const ASSET_TYPES = ["Road", "Bridge", "Flyover", "Building", "Dam", "Tunnel"];

// ── Convert API detections → DefectCard shape ──────────────────────────────
const CLASS_NAMES = {
  0: "Crack", 1: "Pothole", 2: "Corrosion", 3: "Exposed Steel",
  4: "Concrete Damage", 5: "Bridge Crack", 6: "Surface Fatigue",
  7: "Spalling", 8: "Leakage",
};

function apiDetectionsToCards(detections) {
  if (!detections || detections.length === 0) return [];
  return detections.map((d) => ({
    name:       d.label || CLASS_NAMES[d.class] || `Class-${d.class}`,
    severity:   d.severity || "Medium",
    confidence: Math.round((d.confidence || 0) * 100),
    extra:      [],
  }));
}

// ── Map real risk score to severity ───────────────────────────────────────
function scoreToSeverity(score) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

// ── Generate bounding-box overlays from API detections ────────────────────
function apiDetectionsToBoxes(detections, imgW = 640, imgH = 640) {
  if (!detections || detections.length === 0) return [];
  const colorMap = { 0: COLORS.red, 1: COLORS.yellow, 2: COLORS.orange };
  return detections.slice(0, 5).map((d, i) => {
    const [x1, y1, x2, y2] = d.xyxy || [0, 0, imgW * 0.4, imgH * 0.3];
    return {
      label: d.label || CLASS_NAMES[d.class] || `Class-${d.class}`,
      conf:  Math.round((d.confidence || 0) * 100),
      top:   `${(y1 / imgH) * 100}%`,
      left:  `${(x1 / imgW) * 100}%`,
      w:     `${((x2 - x1) / imgW) * 100}%`,
      h:     `${((y2 - y1) / imgH) * 100}%`,
      color: colorMap[i % 3] || COLORS.green,
    };
  });
}

// ── Main LiveDemo ──────────────────────────────────────────────────────────
export default function LiveDemo() {
  const navigate = useNavigate();

  // File / preset
  const [uploaded,  setUploaded]  = useState(null);
  const [preset,    setPreset]    = useState(null);
  const [dragOver,  setDragOver]  = useState(false);
  const fileInputRef = useRef(null);

  // Asset metadata form (only for real uploads)
  const [assetType,     setAssetType]     = useState("Road");
  const [assetLocation, setAssetLocation] = useState("");
  const [assetIdInput,  setAssetIdInput]  = useState("");

  // Analysis state
  const [analyzing,  setAnalyzing]  = useState(false);
  const [stageIdx,   setStageIdx]   = useState(-1);
  const [done,       setDone]       = useState(false);
  const [added,      setAdded]      = useState(false);
  const [apiError,   setApiError]   = useState(null);
  const [isLive,     setIsLive]     = useState(false);  // true = real backend result
  const timers = useRef([]);

  // Real result from backend
  const [realResult, setRealResult] = useState(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleFile = (file) => {
    if (!file) return;
    setPreset(null);
    setApiError(null);
    const reader = new FileReader();
    reader.onload = (e) =>
      setUploaded({ dataUrl: e.target.result, file, name: file.name, size: file.size });
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const choosePreset = (p) => {
    setUploaded(null);
    setPreset(p);
    setDone(false);
    setAdded(false);
    setRealResult(null);
    setIsLive(false);
    setApiError(null);
  };

  const reset = () => {
    setUploaded(null);
    setPreset(null);
    setDone(false);
    setAdded(false);
    setStageIdx(-1);
    setRealResult(null);
    setIsLive(false);
    setApiError(null);
  };

  // ── Simulated run (for presets) ────────────────────────────────────────
  const runSimulated = () => {
    setAnalyzing(true);
    setDone(false);
    setStageIdx(-1);
    setIsLive(false);
    STAGES.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStageIdx(i), 500 * (i + 1)));
    });
    timers.current.push(
      setTimeout(() => {
        setAnalyzing(false);
        setDone(true);
      }, 500 * STAGES.length + 400)
    );
  };

  // ── Real API run (for uploaded images) ────────────────────────────────
  const runRealAnalysis = async () => {
    if (!uploaded?.file) return;
    setAnalyzing(true);
    setDone(false);
    setStageIdx(-1);
    setApiError(null);
    setIsLive(false);

    // Animate stages 0-3 while waiting for API
    [0, 1, 2, 3].forEach((i) => {
      timers.current.push(setTimeout(() => setStageIdx(i), 600 * (i + 1)));
    });

    const assetId = assetIdInput.trim() || `${assetType.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    try {
      const res = await analyzeImage(uploaded.file, {
        asset_id:  assetId,
        asset_type: assetType,
        location:  assetLocation.trim() || "Pune, Maharashtra",
      });

      const data = res.data;
      setRealResult(data);
      setIsLive(true);

      // Finish remaining stages
      setStageIdx(STAGES.length - 1);
      setTimeout(() => {
        setAnalyzing(false);
        setDone(true);
      }, 600);
    } catch (err) {
      console.error("Analysis API error:", err);
      setApiError(err.response?.data?.detail || err.message || "Backend error");
      setAnalyzing(false);
      setStageIdx(-1);
    }
  };

  const runAnalysis = () => {
    if (preset)    runSimulated();
    else           runRealAnalysis();
  };

  // ── Derived display values ───────────────────────────────────────────
  const fmtSize = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);
  const hasInput = uploaded || preset;

  const score    = isLive ? Math.round(realResult?.risk_score ?? 0) : (preset?.score ?? 82);
  const severity = isLive ? (realResult?.severity ?? "Low")         : (preset?.severity ?? "Critical");
  const defects  = isLive ? apiDetectionsToCards(realResult?.detections)  : (preset?.defects ?? DEFECT_CARDS);
  const boxes    = isLive ? apiDetectionsToBoxes(realResult?.detections)  : BOXES;

  const circumference  = 2 * Math.PI * 54;
  const offset         = circumference * (1 - score / 100);
  const severityColor  = { Critical: COLORS.red, High: COLORS.orange, Medium: COLORS.yellow, Low: COLORS.green }[severity] || COLORS.green;

  return (
    <section id="live-demo" className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-2xl mb-10">
        <span className="text-xs font-bold tracking-widest text-green uppercase">Live Demo</span>
        <h2 className="text-white font-extrabold text-3xl md:text-4xl tracking-tight mt-3">
          Run an infrastructure inspection
        </h2>
        <p className="text-gray text-sm md:text-base mt-4">
          Upload your own image to run it through the real YOLO + XGBoost pipeline, or pick a preset
          scenario to see a simulated analysis.
        </p>
      </div>

      {/* ── Input selection ── */}
      {!hasInput && !done && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="lg:col-span-2 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center text-center py-14 px-6 transition-colors"
            style={{ borderColor: dragOver ? "#1DB954" : "rgba(255,255,255,0.08)", background: dragOver ? "rgba(29,185,84,0.06)" : "#181818" }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(29,185,84,0.14)" }}>
              <UploadIcon size={24} className="text-green" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Upload Infrastructure Image</h3>
            <p className="text-sm text-gray">
              Drag and drop your image, or <span className="text-green">browse from your device</span>
            </p>
            <p className="text-[11px] mt-3 text-grayDim">Supported: JPG · PNG · WEBP — Real YOLO analysis</p>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {/* Presets */}
          <div className="rounded-2xl border border-line bg-card p-5">
            <h4 className="text-white font-bold text-sm mb-1">Or try a preset</h4>
            <p className="text-xs text-grayDim mb-4">Simulated analysis — no real model.</p>
            <div className="space-y-2.5">
              {DEMO_PRESETS.map((p) => (
                <button key={p.id} onClick={() => choosePreset(p)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-line hover:border-green/50 hover:bg-cardHover transition-colors text-left">
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${p.thumbGradient} shrink-0`} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{p.label}</div>
                    <div className="text-[10px] text-grayDim truncate">{p.assetId} · {p.location}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Preview + metadata form ── */}
      {hasInput && !analyzing && !done && (
        <div className="rounded-2xl border border-line bg-card p-5 max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            {uploaded ? (
              <img src={uploaded.dataUrl} alt="preview" className="w-24 h-24 rounded-xl object-cover shrink-0 border border-line" />
            ) : (
              <div className={`w-24 h-24 rounded-xl shrink-0 bg-gradient-to-br ${preset.thumbGradient}`} />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-sm truncate flex items-center gap-2">
                <ImageIcon size={14} className="text-green" />
                {uploaded ? uploaded.name : preset.label}
              </div>
              <div className="text-xs mt-1 text-grayDim">
                {uploaded ? fmtSize(uploaded.size) : `${preset.assetId} · ${preset.location}`}
              </div>
              {uploaded && (
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-green">
                  <Wifi size={11} /> Will use real YOLO + XGBoost pipeline
                </div>
              )}
            </div>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full shrink-0 text-red"
              style={{ background: "rgba(241,94,108,0.1)" }}>
              <Trash2 size={13} /> Remove
            </button>
          </div>

          {/* Asset metadata form — only for real uploads */}
          {uploaded && (
            <div className="border-t border-line pt-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-grayDim mb-1">Asset Type</label>
                <select value={assetType} onChange={(e) => setAssetType(e.target.value)} className="input">
                  {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-grayDim mb-1">Location</label>
                <input type="text" placeholder="e.g. Baner Road, Pune" value={assetLocation}
                  onChange={(e) => setAssetLocation(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-[11px] text-grayDim mb-1">Asset ID <span className="text-grayDim">(optional)</span></label>
                <input type="text" placeholder="Auto-generated" value={assetIdInput}
                  onChange={(e) => setAssetIdInput(e.target.value)} className="input" />
              </div>
            </div>
          )}

          {apiError && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red/10 border border-red/20 text-xs text-red">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span><b>Analysis failed:</b> {apiError}. Check that the backend is running.</span>
            </div>
          )}

          <button onClick={runAnalysis}
            className="w-full py-3.5 rounded-full font-bold text-sm bg-green text-black hover:bg-greenBright transition-colors">
            {uploaded ? "Analyze Infrastructure (Real AI)" : "Run Simulated Analysis"}
          </button>
        </div>
      )}

      {/* ── Progress view ── */}
      {analyzing && (
        <div className="max-w-md">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 animate-spin"
              style={{ borderColor: "#1DB95433", borderTopColor: "#1DB954" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <UploadIcon size={20} className="text-green" />
            </div>
          </div>
          <h3 className="text-white font-bold text-base mb-4">
            {isLive || uploaded ? "Running AI pipeline..." : "Simulating inspection..."}
          </h3>
          <div className="space-y-2">
            {STAGES.map((s, i) => {
              const isDone    = i <= stageIdx;
              const isCurrent = i === stageIdx;
              return (
                <div key={s} className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all"
                  style={{ background: isDone ? "rgba(29,185,84,0.08)" : "#181818", border: `1px solid ${isDone ? "#1DB95444" : "rgba(255,255,255,0.08)"}` }}>
                  {isDone
                    ? <CheckCircle2 size={17} className="text-green" />
                    : <Circle size={17} className={`text-grayDim ${isCurrent ? "animate-pulse" : ""}`} />
                  }
                  <span className="text-sm font-semibold" style={{ color: isDone ? "#fff" : "#727272" }}>{s}</span>
                  {isDone && <span className="ml-auto text-[11px] font-bold text-green">Complete</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Results view ── */}
      {done && (
        <div className="space-y-5">
          {/* Live vs simulated badge */}
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green/10 text-green border border-green/30">
                <Wifi size={11} /> Real AI Result — YOLO + XGBoost
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-elevated text-grayDim border border-line">
                Simulated Result — Demo Data
              </span>
            )}
          </div>

          {/* Image analysis + detections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-line bg-card p-5">
              <h4 className="text-white font-bold text-sm mb-3">
                {isLive ? "Detected Regions (YOLO)" : "Image Analysis Model"}
              </h4>
              <div className="relative rounded-xl overflow-hidden bg-[#1a1a1a]" style={{ aspectRatio: "4/3" }}>
                {uploaded ? (
                  <img src={uploaded.dataUrl} alt="analysis" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${preset?.thumbGradient}`} />
                )}
                {boxes.map((b, i) => (
                  <div key={i} className="absolute rounded-md"
                    style={{ top: b.top, left: b.left, width: b.w, height: b.h, border: `2px solid ${b.color}`, boxShadow: `0 0 12px ${b.color}55` }}>
                    <span className="absolute -top-6 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                      style={{ background: b.color, color: "#000" }}>
                      {b.label} — {b.conf}%
                    </span>
                  </div>
                ))}
                {isLive && boxes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-grayDim">
                    No defects detected above threshold
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-card p-5">
              <h4 className="text-white font-bold text-sm mb-3">
                {defects.length} Defect{defects.length !== 1 ? "s" : ""} Detected
              </h4>
              {defects.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green p-4 rounded-xl bg-green/10 border border-green/20">
                  <CheckCircle2 size={16} /> No structural defects detected — asset looks healthy.
                </div>
              ) : (
                <div className="space-y-3">
                  {defects.map((d, i) => (
                    <div key={i} className="rounded-xl p-4 bg-elevated border border-line">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-sm uppercase tracking-wide">{d.name}</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ color: { Critical: COLORS.red, High: COLORS.orange, Medium: COLORS.yellow, Low: COLORS.green }[d.severity] || COLORS.gray, background: "rgba(255,255,255,0.05)" }}>
                          {d.severity}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-grayDim">
                        <span>Confidence: <b className="text-white">{d.confidence}%</b></span>
                        {(d.extra || []).map(([k, v]) => <span key={k}>{k}: <b className="text-white">{v}</b></span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Risk score */}
          <div className="rounded-2xl border border-line bg-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="54" fill="none" stroke="#1F1F1F" strokeWidth="10" />
                    <circle cx="64" cy="64" r="54" fill="none" stroke={severityColor} strokeWidth="10"
                      strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-white">{score}</span>
                    <span className="text-[10px] text-grayDim">/ 100</span>
                    <span className="text-[10px] font-bold mt-0.5" style={{ color: severityColor }}>{severity.toUpperCase()}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold mt-3 text-gray">Maintenance Risk Score</span>
                {isLive && <span className="text-[10px] text-green mt-1">XGBoost model</span>}
              </div>
              <div className="md:col-span-2">
                <p className="text-xs leading-relaxed text-grayDim">
                  {isLive
                    ? `Composite score computed by XGBoost from ${realResult?.num_detections ?? 0} YOLO detection(s). Mean confidence: ${Math.round((realResult?.mean_confidence ?? 0) * 100)}%.`
                    : "Composite score based on detected defect severity, defect extent and infrastructure context."}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <SignalBars mode="value" values={[score, score * 0.7, score * 0.4]}
                    colors={[severityColor, severityColor, severityColor]} size="lg" />
                  <span className="text-xs text-grayDim">Relative signal strength across defect regions</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setAdded(true)} disabled={added}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm bg-green text-black disabled:opacity-70">
              {added ? <><CheckCircle2 size={16} /> Added to Queue</> : <><Plus size={16} /> Add to Priority Queue</>}
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="flex-1 py-3 rounded-full font-bold text-sm bg-elevated text-white border border-line">
              View Dashboard
            </button>
            <button onClick={() => navigate("/reports")}
              className="flex-1 py-3 rounded-full font-bold text-sm bg-elevated text-white border border-line">
              Generate Report
            </button>
          </div>
          <div className="text-center">
            <button onClick={reset} className="text-xs font-semibold text-grayDim hover:text-white transition-colors">
              ← Run another inspection
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
