/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { STYLE_GUIDES, StyleDetails } from "../data";
import { DesignStyle } from "../types";
import { Layers, Lightbulb, Bookmark, HelpCircle } from "lucide-react";

export default function StyleBoard() {
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>("Modern");

  const currentStyle = STYLE_GUIDES[selectedStyle];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6" id="style-board">
      {/* Left Column: Style list */}
      <div className="lg:col-span-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-100 dark:border-stone-800">
          <Layers className="h-5 w-5 text-amber-600" />
          <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Explore Design Styles</h2>
        </div>

        <p className="text-xs text-stone-400 mb-4">
          Select an architectural design philosophy below to browse its guidelines, colors, and decor pairings.
        </p>

        <div className="space-y-1">
          {Object.keys(STYLE_GUIDES).map((styleName) => {
            const isSelected = styleName === selectedStyle;
            const styleObj = STYLE_GUIDES[styleName as DesignStyle];
            return (
              <button
                key={styleName}
                onClick={() => setSelectedStyle(styleName as DesignStyle)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-stone-950 dark:bg-stone-800 text-white border-stone-950"
                    : "bg-stone-50 dark:bg-stone-950 border-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100"
                }`}
              >
                <span className="font-bold text-xs block">{styleName}</span>
                <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-amber-400" : "text-stone-400"}`}>
                  {styleObj.tagline}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Style details card */}
      <div className="lg:col-span-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Philosophy Card
          </span>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-2">
            {currentStyle.name} Style Guide
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
            {currentStyle.description}
          </p>
        </div>

        {/* Swatches block */}
        <div>
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Representative Colors</h3>
          <div className="grid grid-cols-3 gap-3">
            {currentStyle.colors.map((color, idx) => (
              <div key={idx} className="flex flex-col items-center p-3 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800/60 rounded-xl">
                <div className="w-full h-12 rounded-lg shadow-inner mb-2" style={{ backgroundColor: color.hex }} />
                <span className="text-[10px] font-bold text-stone-800 dark:text-stone-200 text-center">{color.name}</span>
                <span className="text-[9px] font-mono text-stone-400 mt-0.5">{color.hex}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 dark:border-stone-800 pt-5">
          {/* Key Elements list */}
          <div>
            <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">Core Architectural Elements</h3>
            <div className="space-y-1.5">
              {currentStyle.keyElements.map((el, idx) => (
                <div key={idx} className="flex gap-2 items-center text-xs text-stone-600 dark:text-stone-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                  <span>{el}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lighting guidelines */}
          <div>
            <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-amber-600" /> Lighting Guidelines
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800/60 p-3 rounded-xl">
              {currentStyle.idealLighting}
            </p>
          </div>
        </div>

        {/* Decorative elements suggestions */}
        <div className="border-t border-stone-100 dark:border-stone-800 pt-5">
          <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
            <Bookmark className="h-4 w-4 text-amber-600" /> Signature Decorative Elements
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {currentStyle.recommendedDecor.map((dec, idx) => (
              <span key={idx} className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50 px-3 py-1 rounded-lg">
                {dec}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
