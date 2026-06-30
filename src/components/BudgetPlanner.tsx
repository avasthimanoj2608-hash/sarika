/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BudgetLevel, RoomType } from "../types";
import { Ruler, DollarSign, PieChart, Info, Landmark, Layers } from "lucide-react";

export default function BudgetPlanner() {
  const [roomType, setRoomType] = useState<RoomType>("Living Room");
  const [budgetTier, setBudgetTier] = useState<BudgetLevel>("Medium");
  const [dimensions, setDimensions] = useState({ length: 14, width: 12 });

  const areaSqFt = dimensions.length * dimensions.width;

  // Pricing constants per square foot based on budget levels
  const PRICING_PER_SQFT: Record<BudgetLevel, { base: number; furniture: number; lighting: number; decor: number }> = {
    Low: { base: 8, furniture: 15, lighting: 5, decor: 4 },
    Medium: { base: 15, furniture: 30, lighting: 10, decor: 8 },
    Premium: { base: 35, furniture: 65, lighting: 25, decor: 18 },
    Luxury: { base: 85, furniture: 150, lighting: 60, decor: 45 }
  };

  const currentPricing = PRICING_PER_SQFT[budgetTier];
  
  // Cost calculations
  const rawMaterialsCost = Math.round(areaSqFt * currentPricing.base);
  const furnitureCost = Math.round(areaSqFt * currentPricing.furniture);
  const lightingCost = Math.round(areaSqFt * currentPricing.lighting);
  const decorCost = Math.round(areaSqFt * currentPricing.decor);
  const totalCost = rawMaterialsCost + furnitureCost + lightingCost + decorCost;

  // Percentage shares
  const furniturePct = Math.round((furnitureCost / totalCost) * 100) || 0;
  const materialsPct = Math.round((rawMaterialsCost / totalCost) * 100) || 0;
  const lightingPct = Math.round((lightingCost / totalCost) * 100) || 0;
  const decorPct = Math.round((decorCost / totalCost) * 100) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6" id="budget-planner">
      {/* Left Column: Input Panel */}
      <div className="lg:col-span-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <DollarSign className="h-5 w-5 text-amber-600" />
          <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Project Budget Estimator</h2>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          Estimate full layout remodeling expenses in real time. Adjust dimensions and selecting budget tiers to update line item costs.
        </p>

        {/* Space type */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
            Space Category
          </label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value as RoomType)}
            className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs px-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 focus:outline-none"
          >
            <option value="Living Room">Living Room</option>
            <option value="Bedroom">Bedroom</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Office">Office & Workplace</option>
            <option value="Café">Café / Lounge</option>
            <option value="Shop & Retail">Shop & Retail Store</option>
            <option value="Hotel Room">Hotel Suite</option>
          </select>
        </div>

        {/* Dimensions inputs */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
            Floor Dimensions (Feet)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-stone-400 block mb-0.5">Length (ft)</span>
              <input
                type="number"
                min="4"
                max="100"
                value={dimensions.length}
                onChange={(e) => setDimensions({ ...dimensions, length: parseFloat(e.target.value) || 0 })}
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block mb-0.5">Width (ft)</span>
              <input
                type="number"
                min="4"
                max="100"
                value={dimensions.width}
                onChange={(e) => setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 0 })}
                className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 text-xs px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 focus:outline-none"
              />
            </div>
          </div>
          <p className="text-[10px] text-stone-400 italic mt-1 flex items-center gap-1">
            <Ruler className="h-3 w-3 text-amber-500" /> Calculated Footprint: {areaSqFt} sq. ft.
          </p>
        </div>

        {/* Budget tier tabs */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
            Quality & Material Tier
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["Low", "Medium", "Premium", "Luxury"] as BudgetLevel[]).map((tier) => (
              <button
                key={tier}
                onClick={() => setBudgetTier(tier)}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                  budgetTier === tier
                    ? "bg-stone-950 dark:bg-stone-800 text-white border-stone-950 shadow-sm"
                    : "bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100"
                }`}
              >
                <span className="text-xs font-bold block">{tier}</span>
                <span className="text-[9px] text-stone-400 block mt-0.5">
                  {tier === "Low" && "Standard / DIY"}
                  {tier === "Medium" && "Sleek / Mid-range"}
                  {tier === "Premium" && "Custom Designer"}
                  {tier === "Luxury" && "High-End Bespoke"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Estimations Dashboard */}
      <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Remodeling Calculation
          </span>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-2">
            Project Cost Breakdown
          </h2>
        </div>

        {/* Big Estimated Total Cost Display */}
        <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800/60 rounded-2xl p-5 text-center my-4 relative overflow-hidden shadow-xs">
          <Landmark className="absolute right-4 top-4 h-16 w-16 text-stone-200/50 dark:text-stone-800/40 pointer-events-none" />
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Estimated Cost Bound</p>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-500 mt-1 font-mono">
            ${totalCost.toLocaleString()}
          </p>
          <p className="text-[10px] text-stone-400 mt-1">
            ~ ${(totalCost * 0.9).toLocaleString()} to ${(totalCost * 1.1).toLocaleString()} depending on material fluctuations
          </p>
        </div>

        {/* Detailed Bar Distribution Sheet */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <PieChart className="h-4 w-4 text-amber-600" /> Expense Allocation
          </h3>

          {/* Furniture line */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              <span>Bespoke Furniture ({furniturePct}%)</span>
              <span className="font-mono text-stone-800 dark:text-stone-100">${furnitureCost.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-950 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full transition-all duration-500" style={{ width: `${furniturePct}%` }} />
            </div>
          </div>

          {/* Raw Materials / Flooring / Paint line */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              <span>Flooring, Walls & Materials ({materialsPct}%)</span>
              <span className="font-mono text-stone-800 dark:text-stone-100">${rawMaterialsCost.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-950 rounded-full overflow-hidden">
              <div className="h-full bg-stone-800 dark:bg-stone-400 rounded-full transition-all duration-500" style={{ width: `${materialsPct}%` }} />
            </div>
          </div>

          {/* Lighting line */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              <span>Architectural Lighting ({lightingPct}%)</span>
              <span className="font-mono text-stone-800 dark:text-stone-100">${lightingCost.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-950 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${lightingPct}%` }} />
            </div>
          </div>

          {/* Decor line */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              <span>Showpieces & Wall Decor ({decorPct}%)</span>
              <span className="font-mono text-stone-800 dark:text-stone-100">${decorCost.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-950 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${decorPct}%` }} />
            </div>
          </div>
        </div>

        {/* Disclaimer info */}
        <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800/60 rounded-xl flex gap-2 text-[10px] items-start mt-6 text-stone-400">
          <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            * These figures are estimated based on global average sourcing costs for material and designer services. Sourcing high-quality stone, local carpentry, and specific Vastu items may vary slightly.
          </p>
        </div>
      </div>
    </div>
  );
}
