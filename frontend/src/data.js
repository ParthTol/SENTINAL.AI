// ------------------------------------------------------------------
//  SENTINEL AI — MOCK DATA
//  Every value below is hardcoded demo data. Nothing here is fetched
//  from a real backend, database, or AI model.
// ------------------------------------------------------------------

export const COLORS = {
  green: "#1DB954",
  greenBright: "#1ED760",
  red: "#F15E6C",
  orange: "#FF8C42",
  yellow: "#F5C94D",
  gray: "#B3B3B3",
  grayDim: "#727272",
};

export const SEVERITY_STYLE = {
  Critical: { fg: COLORS.red, bg: "rgba(241,94,108,0.14)" },
  High: { fg: COLORS.orange, bg: "rgba(255,140,66,0.14)" },
  Medium: { fg: COLORS.yellow, bg: "rgba(245,201,77,0.14)" },
  Low: { fg: COLORS.green, bg: "rgba(29,185,84,0.14)" },
};

// Monitored infrastructure assets — also used as heatmap zones on the
// Dashboard's spatial risk map (x / y are percentage positions).
export const ASSETS = [
  { id: "ROAD-0234", type: "Road", location: "Baner Road", risk: 82, severity: "Critical", defects: 3, last: "2 days ago", x: 30, y: 26 },
  { id: "BRIDGE-0087", type: "Bridge", location: "Mumbai-Pune Highway", risk: 76, severity: "High", defects: 2, last: "3 days ago", x: 74, y: 18 },
  { id: "ROAD-0512", type: "Road", location: "Kothrud", risk: 71, severity: "High", defects: 2, last: "5 days ago", x: 58, y: 54 },
  { id: "FLYOVER-0021", type: "Flyover", location: "Shivajinagar", risk: 54, severity: "Medium", defects: 1, last: "1 week ago", x: 42, y: 72 },
  { id: "ROAD-0891", type: "Road", location: "Wakad", risk: 38, severity: "Low", defects: 1, last: "4 days ago", x: 84, y: 68 },
  { id: "BUILDING-0142", type: "Building", location: "Hinjewadi", risk: 24, severity: "Low", defects: 1, last: "2 weeks ago", x: 14, y: 58 },
];

// Heatmap intensity zones layered behind the asset markers on the map
export const HEATMAP_ZONES = [
  { x: 28, y: 24, radius: 18, intensity: 0.9, color: COLORS.red },
  { x: 74, y: 18, radius: 15, intensity: 0.7, color: COLORS.orange },
  { x: 58, y: 54, radius: 16, intensity: 0.65, color: COLORS.orange },
  { x: 42, y: 72, radius: 14, intensity: 0.4, color: COLORS.yellow },
  { x: 84, y: 68, radius: 12, intensity: 0.25, color: COLORS.green },
  { x: 14, y: 58, radius: 12, intensity: 0.2, color: COLORS.green },
];

export const SUMMARY_STATS = [
  { label: "Critical Issues", value: "12", sub: "Immediate attention", color: COLORS.red },
  { label: "High Risk Assets", value: "27", sub: "Action within 14 days", color: COLORS.orange },
  { label: "Medium Risk Assets", value: "64", sub: "Monitor closely", color: COLORS.yellow },
  { label: "Assets Monitored", value: "1,284", sub: "Across region", color: COLORS.green },
];

export const RISK_DIST = [
  { name: "Critical", value: 12, color: COLORS.red },
  { name: "High", value: 27, color: COLORS.orange },
  { name: "Medium", value: 64, color: COLORS.yellow },
  { name: "Low", value: 181, color: COLORS.green },
];

export const DEFECTS_BAR = [
  { name: "Cracks", value: 142 },
  { name: "Potholes", value: 98 },
  { name: "Corrosion", value: 76 },
  { name: "Exposed Steel", value: 52 },
  { name: "Leakage", value: 29 },
];

export const HEALTH_TREND = [
  { month: "Jan", score: 72 },
  { month: "Feb", score: 69 },
  { month: "Mar", score: 67 },
  { month: "Apr", score: 64 },
  { month: "May", score: 59 },
  { month: "Jun", score: 55 },
];

export const PRIORITY_TABLE = [
  { p: 1, asset: "ROAD-0234", location: "Baner Road", defect: "Longitudinal Crack", severity: "Critical", score: 82, action: "Inspect within 7 days", status: "Pending" },
  { p: 2, asset: "BRIDGE-0087", location: "Mumbai Highway", defect: "Corrosion", severity: "High", score: 76, action: "Structural Inspection", status: "Pending" },
  { p: 3, asset: "ROAD-0512", location: "Kothrud", defect: "Pothole", severity: "High", score: 71, action: "Repair within 14 days", status: "Assigned" },
  { p: 4, asset: "FLYOVER-0021", location: "Shivajinagar", defect: "Surface Fatigue", severity: "Medium", score: 54, action: "Routine Monitoring", status: "Assigned" },
  { p: 5, asset: "ROAD-0891", location: "Wakad", defect: "Minor Pothole", severity: "Low", score: 38, action: "Scheduled Maintenance", status: "Completed" },
];

// The 6-step pipeline shown in the Pipeline section, each with a short
// burst of contextual "data feed" lines that stream in beside it.
export const PIPELINE_STEPS = [
  {
    id: 1,
    title: "Image Upload",
    description: "Field crews or fixed cameras submit an infrastructure image for review.",
    feed: ["road_frame_0182.jpg received", "resolution 4032×3024", "geo-tag: Baner Road, Pune"],
  },
  {
    id: 2,
    title: "Damage Detection",
    description: "Candidate defect regions are localized within the frame.",
    feed: ["region_1: crack (0.96)", "region_2: pothole (0.91)", "region_3: corrosion (0.87)"],
  },
  {
    id: 3,
    title: "Feature Extraction",
    description: "Each defect region is measured for extent and geometry.",
    feed: ["crack length: 1.8m", "crack width: 4.2mm", "pothole area: 0.82m²"],
  },
  {
    id: 4,
    title: "Risk Prediction",
    description: "Defect features are combined with asset context into a composite score.",
    feed: ["severity weight: 0.62", "context weight: 0.24", "extent weight: 0.14"],
  },
  {
    id: 5,
    title: "Priority Ranking",
    description: "The asset is ranked against the rest of the monitored network.",
    feed: ["composite score: 82 / 100", "rank: #1 of 1,284", "priority: P1 — Critical"],
  },
  {
    id: 6,
    title: "Dashboard / Report",
    description: "Results are pushed to the live dashboard and maintenance report.",
    feed: ["dashboard updated", "priority queue +1", "report draft generated"],
  },
];

export const STAGES = ["Image Upload", "Damage Detection", "Feature Extraction", "Risk Prediction", "Priority Ranking"];

export const DEFECT_CARDS = [
  { name: "Longitudinal Crack", severity: "Critical", confidence: 96, extra: [["Length", "1.8m"], ["Width", "4.2mm"]] },
  { name: "Pothole", severity: "Medium", confidence: 91, extra: [["Area", "0.82m²"]] },
  { name: "Corrosion", severity: "Low", confidence: 87, extra: [] },
];

export const BOXES = [
  { label: "CRACK", conf: 96, top: "10%", left: "8%", w: "38%", h: "34%", color: COLORS.red },
  { label: "POTHOLE", conf: 91, top: "48%", left: "40%", w: "34%", h: "30%", color: COLORS.yellow },
  { label: "CORROSION", conf: 87, top: "58%", left: "6%", w: "28%", h: "30%", color: COLORS.green },
];

// Reports available on the Reports page, each with a summary and a
// "preview" data set (stat totals, damage distribution, recommended
// actions) shown when the report card is selected.
export const REPORTS = [
  {
    id: "monthly",
    title: "Monthly Infrastructure Health Report",
    generated: "August 2026",
    stat1Label: "Assets Analyzed",
    stat1: "1,284",
    critical: 12,
    high: 27,
    medium: 64,
    summary:
      "Overall network health continues a gradual decline this quarter, driven mainly by surface fatigue on high-traffic arterial roads and rising corrosion counts on load-bearing structures.",
    topDefects: [
      { name: "Cracks", pct: 42 },
      { name: "Potholes", pct: 26 },
      { name: "Corrosion", pct: 18 },
      { name: "Other", pct: 14 },
    ],
    actions: [
      "Immediate inspection on ROAD-0234 (Baner Road) due to deep fatigue cracking.",
      "Scheduled repair for structural corrosion elements along Mumbai Highway (BRIDGE-0087).",
      "Standard preventive maintenance seal coatings on sector-4 residential routes.",
    ],
  },
  {
    id: "critical",
    title: "Critical Infrastructure Report",
    generated: "August 2026",
    stat1Label: "Assets Analyzed",
    stat1: "248",
    critical: 12,
    high: 19,
    medium: 22,
    summary:
      "This report isolates the 248 highest-consequence assets in the network — bridges, flyovers, and arterial roads — and flags those requiring intervention within the next inspection cycle.",
    topDefects: [
      { name: "Corrosion", pct: 38 },
      { name: "Structural Cracking", pct: 31 },
      { name: "Exposed Steel", pct: 19 },
      { name: "Other", pct: 12 },
    ],
    actions: [
      "Prioritize structural inspection for BRIDGE-0087 within 7 days.",
      "Escalate FLYOVER-0021 for a follow-up survey given recurring fatigue readings.",
      "Review load restrictions on 3 aging highway segments pending inspection.",
    ],
  },
  {
    id: "road",
    title: "Road Damage Report",
    generated: "August 2026",
    stat1Label: "Assets Analyzed",
    stat1: "842",
    critical: 8,
    high: 21,
    medium: 47,
    summary:
      "Road-surface defects account for the largest share of detected issues this month, concentrated on high-traffic corridors in Baner, Kothrud and Wakad.",
    topDefects: [
      { name: "Potholes", pct: 44 },
      { name: "Cracks", pct: 39 },
      { name: "Surface Rutting", pct: 11 },
      { name: "Other", pct: 6 },
    ],
    actions: [
      "Resurface priority pothole clusters along Kothrud within 14 days.",
      "Seal longitudinal cracking on ROAD-0234 ahead of monsoon season.",
      "Continue routine monitoring on low-severity segments in Wakad.",
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance Priority Report",
    generated: "August 2026",
    stat1Label: "Priority Assets",
    stat1: "39",
    critical: 12,
    high: 15,
    medium: 12,
    summary:
      "39 assets have been flagged for active maintenance scheduling this cycle, ranked by composite risk score and defect extent.",
    topDefects: [
      { name: "Cracks", pct: 33 },
      { name: "Corrosion", pct: 29 },
      { name: "Potholes", pct: 24 },
      { name: "Other", pct: 14 },
    ],
    actions: [
      "Confirm field crews for the 12 critical-severity assets this week.",
      "Batch-schedule the 15 high-severity repairs for the next maintenance window.",
      "Re-evaluate medium-severity items after the next inspection pass.",
    ],
  },
];

// Selectable presets for the Live Demo section — lets a visitor trigger
// a full simulated analysis without needing to upload their own photo.
export const DEMO_PRESETS = [
  {
    id: "road-crack",
    label: "Cracked Arterial Road",
    assetId: "ROAD-0234",
    location: "Baner Road, Pune",
    type: "Road",
    thumbGradient: "from-[#3a2a1a] to-[#1a1108]",
    score: 82,
    severity: "Critical",
    defects: DEFECT_CARDS,
  },
  {
    id: "bridge-corrosion",
    label: "Corroded Bridge Girder",
    assetId: "BRIDGE-0087",
    location: "Mumbai-Pune Highway",
    type: "Bridge",
    thumbGradient: "from-[#2a1a1a] to-[#100808]",
    score: 76,
    severity: "High",
    defects: [
      { name: "Corrosion", severity: "High", confidence: 93, extra: [["Depth", "2.1mm"]] },
      { name: "Exposed Steel", severity: "Medium", confidence: 84, extra: [] },
    ],
  },
  {
    id: "flyover-fatigue",
    label: "Flyover Surface Fatigue",
    assetId: "FLYOVER-0021",
    location: "Shivajinagar",
    type: "Flyover",
    thumbGradient: "from-[#1a2a1e] to-[#08100b]",
    score: 54,
    severity: "Medium",
    defects: [
      { name: "Surface Fatigue", severity: "Medium", confidence: 88, extra: [["Area", "1.2m²"]] },
    ],
  },
];
