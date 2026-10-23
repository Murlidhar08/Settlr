"use client";

import { cn } from "@/lib/utils";
import type { GrowthDataPoint } from "@/types/admin-dashboard";
import { TrendingUp, Users } from "lucide-react";
import { useId, useMemo, useState } from "react";

interface GrowthChartProps {
  data: GrowthDataPoint[];
  timeframe: "14d" | "6m";
  onTimeframeChange: (tf: "14d" | "6m") => void;
}

export function GrowthChart({ data, timeframe, onTimeframeChange }: GrowthChartProps) {
  const gradientId = useId();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 700;
  const height = 240;
  const marginLeft = 42;
  const marginRight = 24;
  const marginTop = 20;
  const marginBottom = 36;

  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;
  const baselineY = height - marginBottom;
  const topY = marginTop;
  const midY = (topY + baselineY) / 2;

  const { points, areaPath, linePath, maxVal, totalRegistrations } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        points: [],
        areaPath: "",
        linePath: "",
        maxVal: 4,
        totalRegistrations: 0,
      };
    }

    const total = data.reduce((acc, item) => acc + item.count, 0);
    const rawMax = Math.max(...data.map((d) => d.count), 0);
    // Dynamic max ceiling: round up to a clean number
    const ceiling = rawMax <= 4 ? 4 : Math.ceil(rawMax * 1.15);

    const stepWidth = chartWidth / (data.length - 1 || 1);

    const pts = data.map((d, index) => {
      const x = marginLeft + index * stepWidth;
      const y = baselineY - (d.count / ceiling) * chartHeight;
      return {
        x,
        y,
        count: d.count,
        label: d.label,
        date: d.date,
        sliceX: index === 0 ? marginLeft : x - stepWidth / 2,
        sliceWidth:
          index === 0 || index === data.length - 1 ? stepWidth / 2 : stepWidth,
      };
    });

    if (pts.length === 1) {
      const p = pts[0];
      return {
        points: pts,
        areaPath: "",
        linePath: `M ${marginLeft} ${p.y} L ${width - marginRight} ${p.y}`,
        maxVal: ceiling,
        totalRegistrations: total,
      };
    }

    // Build smooth cubic bezier curve
    let lPath = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      lPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const lastPt = pts[pts.length - 1];
    const firstPt = pts[0];
    const aPath = `${lPath} L ${lastPt.x} ${baselineY} L ${firstPt.x} ${baselineY} Z`;

    return {
      points: pts,
      areaPath: aPath,
      linePath: lPath,
      maxVal: ceiling,
      totalRegistrations: total,
    };
  }, [data, chartWidth, chartHeight, baselineY, marginLeft, marginRight, width]);

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              User Registration Velocity
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
              {totalRegistrations} new users
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Account creations trend over time for{" "}
            {timeframe === "14d" ? "the last 14 days" : "the last 6 months"}
          </p>
        </div>

        {/* Timeframe selector pill buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/40 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onTimeframeChange("14d")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              timeframe === "14d"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            14 Days
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange("6m")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              timeframe === "6m"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            6 Months
          </button>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      {points.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-border/40 space-y-2">
          <Users className="h-8 w-8 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">No registration data available</p>
          <p>User registrations during this timeframe will appear here automatically.</p>
        </div>
      ) : (
        <div
          className="relative pt-2"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-52 sm:h-64 overflow-visible select-none"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  className="text-primary"
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  className="text-primary"
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>

            {/* Y-Axis Grid Lines & Values */}
            <g className="text-border/40">
              <line
                x1={marginLeft}
                y1={topY}
                x2={width - marginRight}
                y2={topY}
                stroke="currentColor"
                strokeDasharray="3 3"
              />
              <line
                x1={marginLeft}
                y1={midY}
                x2={width - marginRight}
                y2={midY}
                stroke="currentColor"
                strokeDasharray="3 3"
              />
              <line
                x1={marginLeft}
                y1={baselineY}
                x2={width - marginRight}
                y2={baselineY}
                stroke="currentColor"
                className="text-border/70"
              />
            </g>

            {/* Y-Axis Numerical Labels */}
            <g className="text-[10px] font-mono fill-muted-foreground select-none">
              <text x={marginLeft - 8} y={topY + 3} textAnchor="end">
                {maxVal}
              </text>
              <text x={marginLeft - 8} y={midY + 3} textAnchor="end">
                {Math.round(maxVal / 2)}
              </text>
              <text x={marginLeft - 8} y={baselineY + 3} textAnchor="end">
                0
              </text>
            </g>

            {/* Area Fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill={`url(#${gradientId})`}
                className="transition-all duration-300"
              />
            )}

            {/* Stroke Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                className="stroke-primary"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Hover Crosshair Guideline */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={topY}
                x2={activePoint.x}
                y2={baselineY}
                className="stroke-primary/50"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            {/* Points & Hit Areas */}
            {points.map((pt, idx) => (
              <g key={idx}>
                {/* Visible Data Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === idx ? 5.5 : 3}
                  className={cn(
                    "transition-all duration-150 pointer-events-none",
                    hoveredIndex === idx
                      ? "fill-primary stroke-background stroke-2"
                      : "fill-primary/80"
                  )}
                />

                {/* Wide invisible vertical hover column */}
                <rect
                  x={pt.sliceX}
                  y={topY}
                  width={pt.sliceWidth}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              </g>
            ))}

            {/* X-Axis Tick Labels */}
            <g className="text-[10px] font-medium fill-muted-foreground select-none">
              {points.map((pt, idx) => {
                // Determine which labels to render to avoid overcrowding
                let showLabel = false;
                if (timeframe === "6m") {
                  showLabel = true;
                } else {
                  // 14 days: show first, every 3rd, and last
                  showLabel =
                    idx === 0 ||
                    idx === points.length - 1 ||
                    idx % 3 === 0;
                }

                if (!showLabel) return null;

                return (
                  <text
                    key={idx}
                    x={pt.x}
                    y={baselineY + 18}
                    textAnchor="middle"
                  >
                    {pt.label}
                  </text>
                );
              })}
            </g>
          </svg>

          {/* Floating Tooltip */}
          {activePoint && (
            <div
              className="absolute pointer-events-none z-20 px-3 py-1.5 rounded-xl bg-popover/95 backdrop-blur-md border border-border shadow-xl text-popover-foreground transition-all duration-100 text-center animate-in fade-in zoom-in-95 duration-100"
              style={{
                left: `${(activePoint.x / width) * 100}%`,
                top: `${(activePoint.y / height) * 100}%`,
                transform:
                  activePoint.y < 70
                    ? "translate(-50%, 14px)"
                    : "translate(-50%, -120%)",
              }}
            >
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {activePoint.label}
              </div>
              <div className="text-sm font-black text-primary">
                {activePoint.count} {activePoint.count === 1 ? "user" : "users"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
