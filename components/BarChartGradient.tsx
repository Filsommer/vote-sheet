"use client";

import React, { CSSProperties } from "react";
import { scaleBand, scaleLinear, max as d3Max } from "d3";

interface ChartDataItem {
  key: string;
  value: number;
  color: string; // Expects a hex color string e.g., "#RRGGBB"
}

interface BarChartGradientProps {
  data: ChartDataItem[];
  height?: string; // e.g., "h-72"
}

export function BarChartGradient({ data, height = "h-72" }: BarChartGradientProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={`relative w-full ${height} text-center text-gray-500 flex items-center justify-center`}
      >
        No allocation data to display.
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Scales
  const yScale = scaleBand()
    .domain(sortedData.map((d) => d.key))
    .range([0, 100])
    .padding(0.175);

  const xScale = scaleLinear()
    .domain([0, d3Max(sortedData, (d) => d.value) ?? 0])
    .range([0, 100]);

  const longestWordLength = d3Max(sortedData.map((d) => d.key.length)) || 1;
  const marginLeftPx = longestWordLength * 7 + 10; // Adjusted for better spacing
  const marginRightPx = 30; // Add margin for text labels

  return (
    <div
      className={`relative w-full ${height}`}
      style={
        {
          "--marginTop": "0px",
          "--marginRight": `${marginRightPx}px`, // Apply right margin
          "--marginBottom": "16px",
          "--marginLeft": `${marginLeftPx}px`,
        } as CSSProperties
      }
    >
      {/* Chart Area */}
      <div
        className="absolute inset-0
          z-10
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          translate-y-[var(--marginTop)]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          overflow-visible
        "
      >
        {/* Bars and Labels */}
        {sortedData.map((d, index) => {
          const barWidthPercent = xScale(d.value);
          const barHeightPercent = yScale.bandwidth();
          const yPosPercent = yScale(d.key);

          if (yPosPercent === undefined) return null;

          return (
            <React.Fragment key={index}>
              <div
                style={{
                  position: "absolute",
                  left: "0",
                  top: `${yPosPercent}%`,
                  width: `${barWidthPercent}%`,
                  height: `${barHeightPercent}%`,
                  borderRadius: "0 6px 6px 0",
                  backgroundColor: d.color,
                }}
                title={`${d.key}: ${d.value}`}
              />
              {/* Value Label */}
              <div
                style={{
                  position: "absolute",
                  left: `${barWidthPercent}%`, // Position to the right of the bar
                  top: `${yPosPercent}%`,
                  height: `${barHeightPercent}%`,
                  paddingLeft: "8px", // Small space between bar and text
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.75rem", // text-xs
                  color: "#374151", // text-gray-700
                }}
                className="text-gray-700 font-medium" // Fallback if style color doesn't work directly for some reason
              >
                {d.value}
              </div>
            </React.Fragment>
          );
        })}
        {/* SVG for grid lines and X-axis text */}
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {xScale.ticks(Math.min(8, d3Max(sortedData, (d) => d.value) ?? 1)).map((tickValue, i) => (
            <g transform={`translate(${xScale(tickValue)},0)`} className="text-gray-300/80" key={i}>
              <line
                y1={0}
                y2={100}
                stroke="currentColor"
                strokeDasharray="6,5"
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>
      </div>
      {/* Y Axis labels */}
      <div className="absolute h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible">
        {sortedData.map((entry, i) => {
          const yPos = yScale(entry.key);
          if (yPos === undefined) return null;
          return (
            <span
              key={i}
              style={{ left: "-2px", top: `${yPos + yScale.bandwidth() / 2}%` }}
              className="absolute text-xs text-gray-400 -translate-y-1/2 w-full text-right pr-2"
              title={entry.key}
            >
              {entry.key}
            </span>
          );
        })}
      </div>
    </div>
  );
}
