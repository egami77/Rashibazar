// frontend/src/components/VedicKundali/KundaliChart.jsx
import React from 'react';
import { PLANET_SHORT_NE, RASHI_NE, RASHI_SHORT_NE, toDevanagariNum } from "../../lib/vedic/constants";

const PLANET_KEYS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];

export const KundaliChart = ({ title, titleEn, positions, lagnaSign, size = 320, isDark = false }) => {
  const s = size;
  const half = s / 2;

  const centers = [
    { x: 0.5, y: 0.25 },   // House 1 (top diamond)
    { x: 0.25, y: 0.125 }, // House 2 (top-left triangle)
    { x: 0.125, y: 0.25 }, // House 3 (left-top triangle)
    { x: 0.25, y: 0.5 },   // House 4 (left diamond)
    { x: 0.125, y: 0.75 }, // House 5 (left-bottom triangle)
    { x: 0.25, y: 0.875 }, // House 6 (bottom-left triangle)
    { x: 0.5, y: 0.75 },   // House 7 (bottom diamond)
    { x: 0.75, y: 0.875 }, // House 8 (bottom-right triangle)
    { x: 0.875, y: 0.75 }, // House 9 (right-bottom triangle)
    { x: 0.75, y: 0.5 },   // House 10 (right diamond)
    { x: 0.875, y: 0.25 }, // House 11 (right-top triangle)
    { x: 0.75, y: 0.125 }, // House 12 (top-right triangle)
  ];

  const signOffsetY = -22;

  const houseContents = Array.from({ length: 12 }, () => []);
  for (const p of PLANET_KEYS) {
    const sign = positions[p];
    if (sign === undefined) continue;
    const houseIdx = (sign - lagnaSign + 12) % 12;
    houseContents[houseIdx].push(PLANET_SHORT_NE[p]);
  }

  const colors = isDark 
    ? {
        bg: "bg-black/40",
        border: "border-yellow-500/30",
        svgBg: "bg-black/20",
        stroke: "#d4af37", // Gold
        textSign: "#d4af37",
        textPlanets: "#ffffff",
        textTitle: "text-yellow-500",
        textSub: "text-gray-400"
      }
    : {
        bg: "bg-white",
        border: "border-amber-200",
        svgBg: "bg-orange-50",
        stroke: "#9a3412",
        textSign: "#9a3412",
        textPlanets: "#1e1b4b",
        textTitle: "text-orange-800",
        textSub: "text-gray-500"
      };

  return (
    <div className={`${colors.bg} p-6 flex flex-col items-center rounded-3xl shadow-2xl border ${colors.border} backdrop-blur-md`}>
      <div className="text-center mb-4">
        <h3 className={`font-bold ${colors.textTitle} text-xl leading-tight`}>{title}</h3>
        <p className={`text-xs ${colors.textSub} uppercase tracking-widest`}>{titleEn}</p>
      </div>
      <svg
        viewBox={`0 0 ${s} ${s}`}
        className={`w-full aspect-square ${colors.svgBg} rounded-xl overflow-hidden mx-auto`}
        style={{ maxWidth: s, shapeRendering: "geometricPrecision" }}
      >
        {/* Outer Border */}
        <rect x="0" y="0" width={s} height={s} fill="none" stroke={colors.stroke} strokeWidth="3" />
        
        {/* Main Diagonal Lines */}
        <line x1="0" y1="0" x2={s} y2={s} stroke={colors.stroke} strokeWidth="1.5" />
        <line x1={s} y1="0" x2="0" y2={s} stroke={colors.stroke} strokeWidth="1.5" />
        
        {/* Inner Diamond */}
        <polygon
          points={`${half},0 ${s},${half} ${half},${s} 0,${half}`}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="1.5"
        />

        {centers.map((c, i) => {
          const sign = (lagnaSign + i) % 12;
          const planets = houseContents[i];
          const cx = c.x * s;
          const cy = c.y * s;
          return (
            <g key={i}>
              {/* Sign Number and Short Name */}
              <text
                x={cx}
                y={cy + signOffsetY}
                textAnchor="middle"
                fontSize="11"
                fill={colors.textSign}
                fontWeight="900"
              >
                {toDevanagariNum(sign + 1)}. {RASHI_SHORT_NE[sign]}
              </text>
              {/* Planets */}
              <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                fontSize="15"
                fontWeight="800"
                fill={colors.textPlanets}
                filter={isDark ? "drop-shadow(0px 0px 2px rgba(0,0,0,0.8))" : "none"}
              >
                {planets.join(" ")}
              </text>
              {/* Lagna indicator for House 1 */}
              {i === 0 && (
                <text
                  x={cx}
                  y={cy + 24}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isDark ? "#fbbf24" : "#b91c1c"}
                  fontWeight="900"
                >
                  ल
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className={`mt-4 text-xs ${colors.textSub} font-medium`}>
        लग्न राशि: <span className="font-bold text-yellow-500">{RASHI_NE[lagnaSign]}</span>
      </div>
    </div>
  );
};
