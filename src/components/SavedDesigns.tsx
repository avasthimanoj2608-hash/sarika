/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DesignReport } from "../types";
import { Trash2, ExternalLink, Calendar, HeartOff, LayoutGrid } from "lucide-react";

interface SavedDesignsProps {
  favorites: DesignReport[];
  onRemoveFavorite: (id: string) => void;
  onSelectFavorite: (report: DesignReport) => void;
}

export default function SavedDesigns({ favorites, onRemoveFavorite, onSelectFavorite }: SavedDesignsProps) {
  if (favorites.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[350px]" id="saved-designs">
        <HeartOff className="h-10 w-10 text-stone-400 mb-4" />
        <h3 className="text-base font-bold text-stone-800 dark:text-stone-100">No Saved Designs Yet</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
          Once you synthesize a space in the **AI Room Designer**, tap the "Save Favorite" heart icon to bookmark and preserve your design blueprint here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6" id="saved-designs">
      <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
        <LayoutGrid className="h-5 w-5 text-amber-600" />
        <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Saved Design History</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((design) => {
          // Color representations
          const pri = design.palette.primary;
          const sec = design.palette.secondary;
          const acc = design.palette.accent;

          return (
            <div
              key={design.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Header palette bands */}
              <div className="h-12 flex">
                <div className="flex-1" style={{ backgroundColor: pri }} title={`Primary: ${design.palette.primaryName}`} />
                <div className="flex-1" style={{ backgroundColor: sec }} title={`Secondary: ${design.palette.secondaryName}`} />
                <div className="flex-1" style={{ backgroundColor: acc }} title={`Accent: ${design.palette.accentName}`} />
              </div>

              {/* Body details */}
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[9px] bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-100 font-bold uppercase tracking-wider">
                    {design.style}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(design.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-stone-800 dark:text-stone-200 mt-2 truncate">
                  {design.roomName}
                </h3>
                
                <p className="text-[11px] text-stone-500 mt-1">
                  Type: {design.roomType} &bull; Sizing: {design.dimensions.length}x{design.dimensions.width} {design.dimensions.unit}
                </p>

                <p className="text-xs font-bold text-amber-600 dark:text-amber-500 mt-3 font-mono">
                  Project Estimate: ${design.totalEstimatedCost}
                </p>
              </div>

              {/* Action buttons */}
              <div className="p-3 border-t border-stone-100 dark:border-stone-800/60 bg-stone-50 dark:bg-stone-950 flex gap-2 justify-end">
                <button
                  onClick={() => onRemoveFavorite(design.id)}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                  title="Delete Favorite"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onSelectFavorite(design)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950 dark:bg-stone-800 hover:bg-stone-800 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Load Layout
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
