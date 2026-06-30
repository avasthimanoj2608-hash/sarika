/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { VASTU_COMPASS_DATA, VastuCompassDirection } from "../data";
import { Compass, Sparkles, Check, Info, Home, ShieldCheck } from "lucide-react";

export default function VastuConsultant() {
  const [selectedDirection, setSelectedDirection] = useState<string>("North-East (Ishaanya)");

  const currentDir = VASTU_COMPASS_DATA.find((d) => d.direction === selectedDirection) || VASTU_COMPASS_DATA[1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6" id="vastu-consultant">
      {/* Left Column: Interactive Compass Widget */}
      <div className="lg:col-span-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm flex flex-col items-center">
        <div className="flex items-center gap-2 pb-3 mb-4 w-full border-b border-stone-100 dark:border-stone-800">
          <Compass className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Interactive Vastu Compass</h2>
        </div>

        <p className="text-xs text-stone-500 text-center mb-6 leading-relaxed">
          Select a cardinal direction segment on the wheel or the index list below to audit that room zone's energy profile, element alignment, and room placements.
        </p>

        {/* Circular Compass Visualizer */}
        <div className="relative h-64 w-64 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-2 shadow-inner">
          {/* Compass ring circle */}
          <div className="absolute inset-4 rounded-full border border-amber-600/30 flex items-center justify-center">
            {/* Center Core */}
            <div className="h-16 w-16 rounded-full bg-white dark:bg-stone-900 shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center z-10">
              <span className="text-[9px] font-bold text-amber-600 tracking-wider font-mono">CORE</span>
              <span className="text-[7px] text-stone-400">NABHI</span>
            </div>
          </div>

          {/* Slices representation using SVG lines for aesthetic accuracy */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100">
            <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(197, 160, 89, 0.15)" strokeWidth="0.5" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(197, 160, 89, 0.15)" strokeWidth="0.5" />
            <line x1="18.2" y1="18.2" x2="81.8" y2="81.8" stroke="rgba(197, 160, 89, 0.12)" strokeWidth="0.5" />
            <line x1="18.2" y1="81.8" x2="81.8" y2="18.2" stroke="rgba(197, 160, 89, 0.12)" strokeWidth="0.5" />
          </svg>

          {/* Compass direction buttons arranged around the perimeter */}
          {VASTU_COMPASS_DATA.map((item) => {
            // Calculate absolute position on a 200px radius
            const radius = 95;
            const rad = ((item.angle - 90) * Math.PI) / 180;
            const left = 128 + radius * Math.cos(rad);
            const top = 128 + radius * Math.sin(rad);

            const isSelected = item.direction === selectedDirection;
            const shortName = item.direction.split(" ")[0]; // e.g. North-East

            // Get standard abbreviation for circular label
            const abbr = item.direction.includes("-") 
              ? item.direction.substring(0, 1) + item.direction.split("-")[1].substring(0, 1)
              : item.direction.substring(0, 1);

            return (
              <button
                key={item.direction}
                onClick={() => setSelectedDirection(item.direction)}
                style={{ left: `${left}px`, top: `${top}px` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-600 border-amber-600 text-white shadow-md scale-110 z-20"
                    : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-amber-500 hover:text-amber-600"
                }`}
                title={item.direction}
              >
                <span className="text-[10px] font-bold">{abbr}</span>
                <span className="text-[7px] opacity-75 truncate max-w-full px-0.5">
                  {item.element.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Index Grid Selector */}
        <div className="grid grid-cols-2 gap-2 w-full mt-8">
          {VASTU_COMPASS_DATA.map((item) => {
            const isSelected = item.direction === selectedDirection;
            return (
              <button
                key={item.direction}
                onClick={() => setSelectedDirection(item.direction)}
                className={`text-[10px] font-semibold text-left px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400"
                    : "bg-stone-50 dark:bg-stone-950 border-stone-200/60 dark:border-stone-800/60 text-stone-600 dark:text-stone-400 hover:bg-stone-100"
                }`}
              >
                {item.direction}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Direction Energetic Audit Card */}
      <div className="lg:col-span-7 space-y-5">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-wrap justify-between items-start gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Cosmic Alignment Audit
              </span>
              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-2">
                {currentDir.direction}
              </h2>
            </div>
            
            <div className="text-right text-xs">
              <p className="text-stone-400">Natural Element</p>
              <p className="font-bold text-amber-600 dark:text-amber-500 font-mono text-sm">{currentDir.element}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Ruling Planetary Lord</h3>
              <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-xl">
                <span className="font-bold text-xs text-stone-800 dark:text-stone-200 block">{currentDir.lord}</span>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                  Controls structural luck, wellness index, and energetic vibrations generated in this quadrant of the building.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Ideal Room Selections</h3>
              <div className="flex flex-wrap gap-1.5">
                {currentDir.positiveRooms.map((room) => (
                  <span
                    key={room}
                    className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50 px-2.5 py-1 rounded-lg"
                  >
                    <Home className="h-3 w-3" /> {room}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Guidelines */}
          <div className="border-t border-stone-100 dark:border-stone-800 pt-4 mt-6">
            <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-600" /> Actionable Architectural Guidelines
            </h3>
            <div className="space-y-2">
              {currentDir.tips.map((tip, idx) => (
                <div key={idx} className="flex gap-2.5 items-start bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 p-3.5 rounded-xl">
                  <Check className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* General Vastu Reminders */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-2xl flex gap-3 text-xs items-start">
          <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-800 dark:text-amber-400 block">General Vastu Rule of Thumb:</span>
            <p className="text-amber-700 dark:text-amber-500 leading-relaxed mt-1">
              Always keep the Center of the room (Brahmasthan) open and light. Keep the North-East zone clutter-free and clean for spiritual wellness. Anchor heavy, bulky wardrobes and steel closets in the South-West corner for domestic safety and long-term asset stability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
