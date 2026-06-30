/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { STYLE_GUIDES } from "../data";
import { DesignStyle } from "../types";
import { Palette, Copy, Check, Sparkles, RefreshCw } from "lucide-react";

// Color shading helper
function pSBC(p: number, c: string): string {
  const i = parseInt;
  let r, g, b;
  if (c.length > 7) {
    const rgb = c.replace(/[^\d,]/g, "").split(",");
    r = i(rgb[0]);
    g = i(rgb[1]);
    b = i(rgb[2]);
  } else {
    let f = i(c.slice(1), 16);
    r = f >> 16;
    g = (f >> 8) & 0x00ff;
    b = f & 0x0000ff;
  }
  const t = p < 0 ? 0 : 255;
  const n = p < 0 ? p * -1 : p;
  r = Math.round((t - r) * n) + r;
  g = Math.round((t - g) * n) + g;
  b = Math.round((t - b) * n) + b;
  return `rgb(${r},${g},${b})`;
}

export default function ColorStudio() {
  const [stylePreset, setStylePreset] = useState<DesignStyle>("Modern");
  const [colors, setColors] = useState({
    primary: "#F2F0EA",
    secondary: "#2E3033",
    accent: "#C5A059",
    primaryName: "Alabaster White",
    secondaryName: "Slate Charcoal",
    accentName: "Brushed Brass"
  });
  
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Load preset colors
  const handleLoadPreset = (s: DesignStyle) => {
    setStylePreset(s);
    const preset = STYLE_GUIDES[s].colors;
    setColors({
      primary: preset[0].hex,
      secondary: preset[1].hex,
      accent: preset[2].hex,
      primaryName: preset[0].name,
      secondaryName: preset[1].name,
      accentName: preset[2].name
    });
  };

  const handleCopy = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // Generate random cohesive palette (simulating palette generation)
  const handleRandomize = () => {
    const randomColors = [
      { p: "#E5E4E2", s: "#232B2B", a: "#D4AF37", pn: "Platinum Silk", sn: "Rich Anthracite", an: "Gold Leaf" },
      { p: "#FFF8DC", s: "#3E2723", a: "#D32F2F", pn: "Warm Silk", sn: "Espresso Bark", an: "Crimson Rose" },
      { p: "#F0F8FF", s: "#1A237E", a: "#FFB300", pn: "Ice Blue Linen", sn: "Midnight Navy", an: "Amber Flare" },
      { p: "#F5F5DC", s: "#556B2F", a: "#8B4513", pn: "Warm Beige", sn: "Sage Green", an: "Chestnut" },
      { p: "#FDF5E6", s: "#2F4F4F", a: "#FF7F50", pn: "Cream Lace", sn: "Slate Teal", an: "Coral Sunset" }
    ];
    const picked = randomColors[Math.floor(Math.random() * randomColors.length)];
    setColors({
      primary: picked.p,
      secondary: picked.s,
      accent: picked.a,
      primaryName: picked.pn,
      secondaryName: picked.sn,
      accentName: picked.an
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 font-sans" id="color-studio">
      {/* Left Column: Preset Loader and Color Picker */}
      <div className="lg:col-span-5 bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 rounded-none p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-stone-800 dark:text-stone-200" />
            <h2 className="text-xs uppercase tracking-widest font-bold text-stone-800 dark:text-stone-200">Color Palette Studio</h2>
          </div>
          <button
            onClick={handleRandomize}
            className="p-1.5 rounded-none border border-black/15 dark:border-white/15 text-stone-600 dark:text-stone-300 hover:bg-stone-50 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            title="Randomize Palette"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Preset selector */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-3">
            Load Architectural Philosophy Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(STYLE_GUIDES).map((s) => (
              <button
                key={s}
                onClick={() => handleLoadPreset(s as DesignStyle)}
                className={`text-[9px] uppercase tracking-wider px-3.5 py-2 rounded-none border font-bold transition-all cursor-pointer ${
                  stylePreset === s
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "bg-[#FAF9F6] dark:bg-stone-950 border-black/10 dark:border-white/10 text-stone-600 dark:text-stone-400 hover:bg-stone-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Pickers */}
        <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1">Fine-Tune Color Tone</h3>
          
          {/* Primary Color Picker */}
          <div className="flex items-center justify-between gap-4 bg-[#FAF9F6]/50 dark:bg-stone-950 p-3 rounded-none border border-black/10 dark:border-white/10">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                className="h-8 w-8 rounded-none border border-black/25 bg-transparent cursor-pointer"
              />
              <div className="text-left">
                <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold block">Primary Wall Color</span>
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{colors.primaryName}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-stone-400">{colors.primary}</span>
              <button
                onClick={() => handleCopy(colors.primary, 0)}
                className="p-1 rounded-none text-stone-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                {copiedIndex === 0 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Secondary Color Picker */}
          <div className="flex items-center justify-between gap-4 bg-[#FAF9F6]/50 dark:bg-stone-950 p-3 rounded-none border border-black/10 dark:border-white/10">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.secondary}
                onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                className="h-8 w-8 rounded-none border border-black/25 bg-transparent cursor-pointer"
              />
              <div className="text-left">
                <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold block">Secondary Furniture Base</span>
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{colors.secondaryName}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-stone-400">{colors.secondary}</span>
              <button
                onClick={() => handleCopy(colors.secondary, 1)}
                className="p-1 rounded-none text-stone-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                {copiedIndex === 1 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Accent Color Picker */}
          <div className="flex items-center justify-between gap-4 bg-[#FAF9F6]/50 dark:bg-stone-950 p-3 rounded-none border border-black/10 dark:border-white/10">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colors.accent}
                onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                className="h-8 w-8 rounded-none border border-black/25 bg-transparent cursor-pointer"
              />
              <div className="text-left">
                <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold block">Accent Decor Pop</span>
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{colors.accentName}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-stone-400">{colors.accent}</span>
              <button
                onClick={() => handleCopy(colors.accent, 2)}
                className="p-1 rounded-none text-stone-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                {copiedIndex === 2 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Simulator Wall Panel */}
      <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 rounded-none p-6 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-widest font-bold bg-[#FAF9F6] dark:bg-stone-950 border border-black/10 dark:border-white/10 px-3 py-1 text-stone-700 dark:text-stone-300">
            Real-time Color Previewer
          </span>
          <h2 className="text-2xl font-serif italic text-stone-800 dark:text-stone-100 mt-4">
            Simulated Interior Coloring
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-serif leading-relaxed">
            Observe how the selected primary (wall), secondary (couch), and accent (art/lamp) colors work in a living room composition.
          </p>
        </div>

        {/* Visual Mock Setup */}
        <div className="relative h-64 w-full rounded-none border border-black/10 dark:border-white/10 overflow-hidden my-6 flex flex-col justify-end p-6" style={{ backgroundColor: colors.primary }}>
          {/* Back wall border trims */}
          <div className="absolute inset-x-0 top-0 h-4 bg-stone-950/5 border-b border-stone-950/10" />
          <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-stone-950/5" /> {/* Wall seam */}

          {/* Elegant Floating Painting (Accent Color representation) */}
          <div className="absolute top-12 left-16 w-24 h-28 border-4 border-stone-900 bg-stone-100 p-2 flex flex-col justify-between shadow-md rounded-none">
            <div className="w-full h-16 rounded-none shadow-inner" style={{ backgroundColor: colors.accent }} />
            <div className="text-[8px] text-stone-500 font-mono text-center">Accent Art</div>
          </div>

          {/* Wall Lamp Casting Light */}
          <div className="absolute top-10 right-20 w-10 flex flex-col items-center">
            {/* Lamp sconce */}
            <div className="h-4 w-4 rounded-none" style={{ backgroundColor: colors.accent }} />
            {/* Cone of warm light */}
            <div className="w-20 h-28 bg-gradient-to-b from-amber-200/50 to-transparent clip-light" />
          </div>

          {/* Minimalist modern sofa silhouette (Secondary Color representation) */}
          <div className="relative w-2/3 mx-auto flex flex-col items-center select-none z-10">
            {/* Couch back rest */}
            <div className="w-full h-16 rounded-t-none shadow-sm border-b border-stone-950/10" style={{ backgroundColor: colors.secondary }} />
            {/* Couch cushion row */}
            <div className="w-[104%] h-8 rounded-none -mt-1 shadow-md" style={{ backgroundColor: pSBC(0.1, colors.secondary) || colors.secondary }} />
            {/* Couch legs */}
            <div className="flex justify-between w-4/5 h-4 mt-0.5">
              <div className="w-2 h-full bg-stone-800" />
              <div className="w-2 h-full bg-stone-800" />
            </div>
          </div>

          {/* Decorative floor rug (mix of secondary and primary) */}
          <div className="absolute bottom-1 inset-x-20 h-6 rounded-none opacity-35 filter blur-xs" style={{ backgroundColor: colors.secondary }} />
        </div>

        {/* Description and metadata */}
        <div className="p-4 bg-[#FAF9F6] dark:bg-stone-950 border border-black/10 dark:border-white/10 rounded-none text-xs flex justify-between items-center text-stone-500">
          <span className="flex items-center gap-1 font-serif italic"><Sparkles className="h-4 w-4 text-[#1A1A1A] dark:text-[#FAF9F6]" /> Fully Custom Styling Scheme</span>
          <span className="font-mono text-[9px] uppercase tracking-wider">Ratio: 60% Walls, 30% Sofa, 10% Art Sconce</span>
        </div>
      </div>
    </div>
  );
}
