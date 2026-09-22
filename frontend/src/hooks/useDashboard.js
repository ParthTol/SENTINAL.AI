import { useState, useEffect } from 'react';
import { getDashboardData } from '../api/client';
import {
  ASSETS as MOCK_ASSETS,
  SUMMARY_STATS as MOCK_STATS,
  RISK_DIST as MOCK_RISK_DIST,
  PRIORITY_TABLE as MOCK_PRIORITY,
  COLORS,
} from '../data';

// x/y heatmap positions keyed by asset_id (mock positions for known assets)
const KNOWN_POSITIONS = {
  'ROAD-0234':     { x: 30, y: 26 },
  'BRIDGE-0087':   { x: 74, y: 18 },
  'ROAD-0512':     { x: 58, y: 54 },
  'FLYOVER-0021':  { x: 42, y: 72 },
  'ROAD-0891':     { x: 84, y: 68 },
  'BUILDING-0142': { x: 14, y: 58 },
  // seed data asset IDs from backend
  'ROAD-001':      { x: 30, y: 26 },
  'ROAD-002':      { x: 58, y: 54 },
  'ROAD-003':      { x: 84, y: 68 },
  'BRIDGE-001':    { x: 74, y: 18 },
  'FLYOVER-001':   { x: 42, y: 72 },
  'BUILDING-001':  { x: 14, y: 58 },
};

// Convert API severity counts to SUMMARY_STATS shape
function buildStats(apiStats) {
  return [
    { label: 'Critical Issues',    value: String(apiStats.critical_issues),    sub: 'Immediate attention',   color: COLORS.red    },
    { label: 'High Risk Assets',   value: String(apiStats.high_risk_assets),   sub: 'Action within 14 days', color: COLORS.orange },
    { label: 'Medium Risk Assets', value: String(apiStats.medium_risk_assets), sub: 'Monitor closely',       color: COLORS.yellow },
    { label: 'Assets Monitored',   value: apiStats.total_assets.toLocaleString(), sub: 'Across region',      color: COLORS.green  },
  ];
}

// Convert API asset list to the shape expected by Dashboard + Heatmap
function buildAssets(apiAssets) {
  return apiAssets.map((a, idx) => {
    const pos = KNOWN_POSITIONS[a.asset_id] || {
      // spread unknown assets around the map
      x: 20 + ((idx * 13) % 60),
      y: 20 + ((idx * 17) % 60),
    };
    return {
      id:       a.asset_id,
      type:     a.asset_type,
      location: a.location,
      risk:     Math.round(a.risk_score),
      severity: a.severity,
      defects:  a.defects_count,
      last:     new Date(a.last_inspection).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      x:        pos.x,
      y:        pos.y,
    };
  });
}

// Build risk distribution pie data from asset list
function buildRiskDist(apiAssets) {
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  apiAssets.forEach((a) => { if (counts[a.severity] !== undefined) counts[a.severity]++; });
  return [
    { name: 'Critical', value: counts.Critical, color: COLORS.red    },
    { name: 'High',     value: counts.High,     color: COLORS.orange },
    { name: 'Medium',   value: counts.Medium,   color: COLORS.yellow },
    { name: 'Low',      value: counts.Low,      color: COLORS.green  },
  ];
}

// Build priority table rows from asset list (sorted by risk_score desc)
function buildPriorityTable(apiAssets) {
  return [...apiAssets]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 8)
    .map((a, idx) => ({
      p:        idx + 1,
      asset:    a.asset_id,
      location: a.location,
      defect:   'Detected Defects',
      severity: a.severity,
      score:    Math.round(a.risk_score),
      action:   a.severity === 'Critical' ? 'Inspect within 7 days'
              : a.severity === 'High'     ? 'Structural Inspection'
              : a.severity === 'Medium'   ? 'Routine Monitoring'
              :                            'Scheduled Maintenance',
      status: a.severity === 'Low' ? 'Completed' : 'Pending',
    }));
}

export default function useDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [isLive, setIsLive]   = useState(false); // true = backend data

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getDashboardData()
      .then((res) => {
        if (cancelled) return;
        const { stats, assets } = res.data;
        setData({
          summaryStats:  buildStats(stats),
          assets:        buildAssets(assets),
          riskDist:      buildRiskDist(assets),
          priorityTable: buildPriorityTable(assets),
          rawStats:      stats,
        });
        setIsLive(true);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('Backend unreachable — using mock data', err.message);
        setError(err.message);
        setIsLive(false);
        // Graceful fallback to mock data
        setData({
          summaryStats:  MOCK_STATS,
          assets:        MOCK_ASSETS,
          riskDist:      MOCK_RISK_DIST,
          priorityTable: MOCK_PRIORITY,
          rawStats:      null,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { ...data, loading, error, isLive };
}
