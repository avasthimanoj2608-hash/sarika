/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RoomType, DesignStyle, BudgetLevel, DesignReport, FurnitureItem, UserProfile } from "../types";
import { STYLE_GUIDES } from "../data";
import RoomVisualizer from "./RoomVisualizer";
import { Wand2, Sparkles, UploadCloud, FileText, Heart, Share2, ClipboardList, Ruler, Compass, Palette, Sofa, Lightbulb, HelpCircle, Check, AlertCircle, Copy, Download, Code } from "lucide-react";

interface AIRoomDesignerProps {
  onSaveToFavorites: (report: DesignReport) => void;
  favoritedIds: string[];
  userProfile: UserProfile;
  onOpenAuth: () => void;
}

export default function AIRoomDesigner({ onSaveToFavorites, favoritedIds, userProfile, onOpenAuth }: AIRoomDesignerProps) {
  const [roomType, setRoomType] = useState<RoomType>("Living Room");
  const [style, setStyle] = useState<DesignStyle>("Modern");
  const [budget, setBudget] = useState<BudgetLevel>("Medium");
  const [dimensions, setDimensions] = useState({ length: 14, width: 12, height: 10, unit: "ft" as "ft" | "m" });
  const [purpose, setPurpose] = useState("");
  
  // Image upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageMime, setUploadedImageMime] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentReport, setCurrentReport] = useState<DesignReport | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"layout" | "colors" | "vastu" | "tips" | "json">("layout");
  const [copiedJson, setCopiedJson] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadingMessages = [
    "Analyzing room dimensions & structural anchors...",
    "Harmonizing color palettes with selected design philosophy...",
    "Drafting optimal scale furniture placement layouts...",
    "Aligning spatial arrangement with sacred Vastu principles...",
    "Curating premium decorative showpieces and accent lights...",
    "Synthesizing your ultimate luxury space plan report..."
  ];

  // Rotate loading messages
  const startLoadingCycle = () => {
    setLoading(true);
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2800);
    return interval;
  };

  // Convert uploaded image to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    setUploadedImageMime(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit trigger
  const handleGenerateDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const loader = startLoadingCycle();

    try {
      let response;
      if (uploadedImage) {
        // Base64 cleaning
        const cleanBase64 = uploadedImage.split(",")[1];
        
        response = await fetch("/api/ai/redesign-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: cleanBase64,
            mimeType: uploadedImageMime || "image/jpeg",
            style,
            budget,
            roomType
          })
        });
      } else {
        response = await fetch("/api/ai/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomType,
            style,
            budget,
            dimensions,
            purpose
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "API server encountered an error.");
      }

      const data = await response.json();
      
      // Inject standard fields for client-side storage
      const finalReport: DesignReport = {
        ...data,
        id: "design-" + Date.now(),
        createdAt: new Date().toISOString(),
        roomType,
        style,
        budget,
        dimensions: {
          length: Number(dimensions.length),
          width: Number(dimensions.width),
          height: Number(dimensions.height),
          unit: dimensions.unit
        }
      };

      setCurrentReport(finalReport);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Something went wrong during generation. Please verify your connection.");
    } finally {
      clearInterval(loader);
      setLoading(false);
    }
  };

  const handleUpdateFurniture = (items: FurnitureItem[]) => {
    if (!currentReport) return;
    setCurrentReport({
      ...currentReport,
      furniture: items
    });
  };

  // Save report to favorites
  const handleSaveFavorite = () => {
    if (!currentReport) return;
    if (!userProfile.isLoggedIn) {
      onOpenAuth();
      return;
    }
    onSaveToFavorites(currentReport);
  };

  const handleCopyJson = () => {
    if (!currentReport) return;
    navigator.clipboard.writeText(JSON.stringify(currentReport, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!currentReport) return;
    const jsonString = JSON.stringify(currentReport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentReport.roomName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-blueprint.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Mock report download (creates a clean HTML page designed as print-friendly report sheet)
  const handleDownloadReport = () => {
    if (!currentReport) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const furnitureRows = currentReport.furniture.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.dimensions}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.material}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #b45309;">$${item.estimatedCost}</td>
      </tr>
    `).join("");

    const lightingRows = currentReport.lighting.map(light => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${light.name} (${light.type})</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${light.placement}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${light.purpose}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #b45309;">$${light.estimatedCost}</td>
      </tr>
    `).join("");

    const decorRows = currentReport.decor.map(dec => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${dec.name} (${dec.type})</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${dec.placement}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${dec.visualAppeal}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #b45309;">$${dec.estimatedCost}</td>
      </tr>
    `).join("");

    const vastuRows = currentReport.vastu.map(vas => `
      <div style="margin-bottom: 15px; border-left: 4px solid #d97706; padding-left: 10px;">
        <h4 style="margin: 0; color: #1e293b; font-size: 15px;">${vas.element} &rarr; <span style="color: #b45309;">${vas.idealDirection}</span></h4>
        <p style="margin: 5px 0 0; font-size: 13px; color: #475569;">${vas.placementDetail}</p>
        <p style="margin: 3px 0 0; font-size: 12px; color: #64748b; font-style: italic;">Why: ${vas.benefit}</p>
      </div>
    `).join("");

    const tipsList = currentReport.spaceOptimizationTips.map(tip => `
      <li style="margin-bottom: 8px; color: #334155;">${tip}</li>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Sarika AI Design Report - ${currentReport.roomName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #334155; line-height: 1.6; }
            .header { border-bottom: 2px solid #b45309; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
            .brand { font-size: 28px; font-weight: bold; color: #1e293b; letter-spacing: 2px; }
            .subtitle { font-size: 14px; text-transform: uppercase; color: #b45309; font-weight: bold; margin-top: 5px; }
            h2 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 40px; }
            .meta { display: grid; grid-template-cols: repeat(4, 1fr); gap: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
            .meta-item { text-align: center; }
            .meta-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .meta-val { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { text-align: left; background: #f1f5f9; padding: 12px 10px; color: #475569; font-size: 13px; text-transform: uppercase; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">SARIKA</div>
            <div class="subtitle">Premium AI Interior Design & Vastu Consultation</div>
          </div>
          
          <h1 style="color: #0f172a; font-size: 24px; margin-bottom: 10px;">${currentReport.roomName}</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Report generated on ${new Date(currentReport.createdAt).toLocaleDateString()}</p>
          
          <div class="meta">
            <div class="meta-item"><div class="meta-label">Space Type</div><div class="meta-val">${currentReport.roomType}</div></div>
            <div class="meta-item"><div class="meta-label">Design Style</div><div class="meta-val">${currentReport.style}</div></div>
            <div class="meta-item"><div class="meta-label">Budget Tier</div><div class="meta-val">${currentReport.budget}</div></div>
            <div class="meta-item"><div class="meta-label">Dimensions</div><div class="meta-val">${currentReport.dimensions.length} x ${currentReport.dimensions.width} ${currentReport.dimensions.unit}</div></div>
          </div>

          <div style="background: #fffcf2; border: 1px solid #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; color: #b45309;">Color Palette Suggestion</h3>
            <div style="display: flex; gap: 20px; align-items: center;">
              <div style="display: flex; gap: 10px;">
                <div style="width: 50px; height: 50px; border-radius: 4px; background: ${currentReport.palette.primary}; border: 1px solid #ddd;"></div>
                <div style="width: 50px; height: 50px; border-radius: 4px; background: ${currentReport.palette.secondary}; border: 1px solid #ddd;"></div>
                <div style="width: 50px; height: 50px; border-radius: 4px; background: ${currentReport.palette.accent}; border: 1px solid #ddd;"></div>
              </div>
              <div>
                <p style="margin: 0; font-size: 14px;"><strong>Primary:</strong> ${currentReport.palette.primaryName} (${currentReport.palette.primary})</p>
                <p style="margin: 3px 0 0 0; font-size: 14px;"><strong>Secondary:</strong> ${currentReport.palette.secondaryName} (${currentReport.palette.secondary})</p>
                <p style="margin: 3px 0 0 0; font-size: 14px;"><strong>Accent:</strong> ${currentReport.palette.accentName} (${currentReport.palette.accent})</p>
              </div>
            </div>
          </div>

          <h2>Furniture Placement Guidelines</h2>
          <table>
            <thead>
              <tr>
                <th>Furniture Piece</th>
                <th>Dimensions</th>
                <th>Materiality</th>
                <th style="text-align: right;">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              ${furnitureRows}
            </tbody>
          </table>

          <h2>Lighting Scheme</h2>
          <table>
            <thead>
              <tr>
                <th>Fixture</th>
                <th>Recommended Placement</th>
                <th>Functional Purpose</th>
                <th style="text-align: right;">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              ${lightingRows}
            </tbody>
          </table>

          <h2>Decorative Elements</h2>
          <table>
            <thead>
              <tr>
                <th>Decorative Item</th>
                <th>Best Placement Coordinates</th>
                <th>Aesthetic Value</th>
                <th style="text-align: right;">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              ${decorRows}
            </tbody>
          </table>

          <h2>Vastu Shastra Alignments</h2>
          ${vastuRows}

          <h2>Space Optimization tips</h2>
          <ul style="padding-left: 20px;">
            ${tipsList}
          </ul>

          <h2 style="border: none; text-align: right; font-size: 20px; margin-top: 40px; color: #1e293b;">
            Total Project Estimate: <span style="color: #b45309; font-weight: bold;">$${currentReport.totalEstimatedCost}</span>
          </h2>

          <div class="footer">
            <p>Designed Digitally by Sarika Interior Design Corporation &copy; 2026. All rights reserved.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isFavorited = currentReport ? favoritedIds.includes(currentReport.id) : false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full p-0" id="ai-room-designer">
      {/* Left Column: Form / Upload Controls */}
      <div className="lg:col-span-4 bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 rounded-none p-6 shadow-sm flex flex-col justify-between max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleGenerateDesign} className="space-y-6">
          <div className="flex flex-col gap-1 pb-4 border-b border-black/10 dark:border-white/10">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">Parameters</span>
            <h2 className="text-xl font-serif italic text-[#1A1A1A] dark:text-[#FAF9F6]">AI Room Designer</h2>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-stone-400 mb-2">
              Select Type of Space
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
              className="w-full bg-[#FAF9F6] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#FAF9F6] text-xs px-3 py-2.5 rounded-none border border-black/15 dark:border-white/15 focus:outline-none focus:border-black dark:focus:border-white transition-all font-sans"
            >
              <optgroup label="Residential Spaces">
                <option value="Living Room">Living Room</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Studio">Studio Apartment</option>
              </optgroup>
              <optgroup label="Commercial Spaces">
                <option value="Office">Office & Workspaces</option>
                <option value="Café">Café</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Shop & Retail">Shop & Retail Stores</option>
                <option value="Salon & Spa">Salons & Spas</option>
                <option value="Hotel Room">Hotel Room & Suites</option>
                <option value="Clinic">Medical Clinic</option>
              </optgroup>
              <option value="Other">Other Unique Spaces</option>
            </select>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-stone-400 mb-2 flex items-center justify-between">
              <span>Room Dimensions</span>
              <span className="flex rounded-none overflow-hidden border border-black/10 dark:border-white/10 p-0.5 bg-white dark:bg-stone-900 text-[9px] uppercase tracking-wider font-bold">
                <button
                  type="button"
                  onClick={() => setDimensions({ ...dimensions, unit: "ft" })}
                  className={`px-2 py-0.5 rounded-none ${dimensions.unit === "ft" ? "bg-black text-white dark:bg-white dark:text-black" : "text-stone-500 hover:text-black dark:hover:text-white"}`}
                >
                  ft
                </button>
                <button
                  type="button"
                  onClick={() => setDimensions({ ...dimensions, unit: "m" })}
                  className={`px-2 py-0.5 rounded-none ${dimensions.unit === "m" ? "bg-black text-white dark:bg-white dark:text-black" : "text-stone-500 hover:text-black dark:hover:text-white"}`}
                >
                  m
                </button>
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 block mb-1">Length ({dimensions.unit})</span>
                <input
                  type="number"
                  min="4"
                  max="100"
                  value={dimensions.length}
                  onChange={(e) => setDimensions({ ...dimensions, length: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#FAF9F6] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#FAF9F6] text-xs px-2.5 py-2 rounded-none border border-black/15 dark:border-white/15 focus:outline-none focus:border-black dark:focus:border-white transition-all"
                />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 block mb-1">Width ({dimensions.unit})</span>
                <input
                  type="number"
                  min="4"
                  max="100"
                  value={dimensions.width}
                  onChange={(e) => setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#FAF9F6] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#FAF9F6] text-xs px-2.5 py-2 rounded-none border border-black/15 dark:border-white/15 focus:outline-none focus:border-black dark:focus:border-white transition-all"
                />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 block mb-1">Height ({dimensions.unit})</span>
                <input
                  type="number"
                  min="4"
                  max="20"
                  value={dimensions.height}
                  onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#FAF9F6] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#FAF9F6] text-xs px-2.5 py-2 rounded-none border border-black/15 dark:border-white/15 focus:outline-none focus:border-black dark:focus:border-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Style selection */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-stone-400 mb-2">
              Select Interior Style Philosophy
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as DesignStyle)}
              className="w-full bg-[#FAF9F6] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#FAF9F6] text-xs px-3 py-2.5 rounded-none border border-black/15 dark:border-white/15 focus:outline-none focus:border-black dark:focus:border-white transition-all font-sans"
            >
              {Object.keys(STYLE_GUIDES).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-stone-400 mt-1 italic font-serif">
              {STYLE_GUIDES[style].tagline}
            </p>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-stone-400 mb-2">
              Select Budget Tier
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["Low", "Medium", "Premium", "Luxury"] as BudgetLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setBudget(level)}
                  className={`py-2 text-[10px] uppercase tracking-wider font-bold rounded-none border transition-all cursor-pointer ${
                    budget === level
                      ? "bg-black text-white border-black dark:bg-[#FAF9F6] dark:text-[#1A1A1A] dark:border-white shadow-xs"
                      : "bg-[#FAF9F6] dark:bg-[#1A1A1A] border-black/10 dark:border-white/10 text-stone-500 dark:text-stone-400 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="border-t border-black/10 dark:border-white/10 pt-4">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-stone-400 mb-2 flex items-center justify-between">
              <span>Redesign from Existing Photo (Optional)</span>
              {uploadedImage && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage(null);
                    setUploadedImageMime(null);
                    setImageFileName("");
                  }}
                  className="text-[10px] text-red-500 hover:underline cursor-pointer font-bold uppercase tracking-widest"
                >
                  Clear Photo
                </button>
              )}
            </label>
            <div className="border border-dashed border-black/20 dark:border-white/20 rounded-none p-4 flex flex-col items-center justify-center bg-[#FAF9F6] dark:bg-[#1A1A1A] hover:bg-black/5 dark:hover:bg-white/5 transition-all relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {uploadedImage ? (
                <div className="flex items-center gap-2 w-full">
                  <img src={uploadedImage} alt="Preview" className="h-10 w-10 object-cover rounded-none border border-black/10" />
                  <div className="overflow-hidden flex-1 text-left">
                    <p className="text-[10px] font-bold text-[#1A1A1A] dark:text-[#FAF9F6] truncate">{imageFileName}</p>
                    <p className="text-[9px] text-stone-400 italic font-serif">Photo selected. AI will auto-reimagine it!</p>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-5 w-5 text-stone-400 mb-1" />
                  <p className="text-[9px] text-stone-500 text-center uppercase tracking-wider font-bold">Click or drag image to redesign photo</p>
                </>
              )}
            </div>
          </div>

          {/* Purpose / Requirements */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-stone-400 mb-2">
              Custom Intentions / Functional Needs
            </label>
            <textarea
              placeholder="e.g. Include bookshelves, child-friendly edges, focus desk in East window..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
              className="w-full bg-[#FAF9F6] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#FAF9F6] text-xs px-3 py-2 rounded-none border border-black/15 dark:border-white/15 focus:outline-none focus:border-black dark:focus:border-white transition-all font-sans"
            />
          </div>

          {apiError && (
            <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-none border border-red-500/20 flex gap-2 items-start font-sans">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{apiError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-none bg-black hover:bg-[#111] text-white dark:bg-[#FAF9F6] dark:hover:bg-white dark:text-[#1A1A1A] font-bold text-xs uppercase tracking-[0.25em] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer font-sans"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Designing..." : "Synthesize AI Space Plan"}
          </button>
        </form>

        <div className="text-[9px] text-stone-400 text-center border-t border-black/10 dark:border-white/10 pt-4 mt-4 uppercase tracking-[0.15em] font-medium font-sans">
          Sarika Powered &bull; Vastu Shastra Certified
        </div>
      </div>

      {/* Right Column: Interactive Visualizer & Space Plan Report Details */}
      <div className="lg:col-span-8 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
        {loading ? (
          /* Premium Loading Screen */
          <div className="bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 rounded-none p-12 shadow-sm flex flex-col items-center justify-center min-h-[450px] text-center">
            <div className="relative h-20 w-20 mb-6 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/5 dark:bg-white/5"></span>
              <div className="relative rounded-full h-12 w-12 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
                <Wand2 className="h-6 w-6 text-[#1A1A1A] dark:text-[#FAF9F6] animate-pulse" />
              </div>
            </div>
            <h3 className="text-base font-serif italic text-stone-800 dark:text-stone-200">Sarika AI Stylist is designing your space...</h3>
            <p className="text-xs text-stone-900 dark:text-stone-100 mt-2 font-medium tracking-wider uppercase min-h-[16px] font-sans">
              {loadingMessages[loadingStep]}
            </p>
            <p className="text-[11px] text-stone-400 mt-8 max-w-sm leading-relaxed font-serif italic">
              Our model synthesizes layout configurations, calculates shadow castings, compiles furniture dimensions, and tests direction quadrants against Vastu Shastra rules.
            </p>
          </div>
        ) : currentReport ? (
          /* Report Loaded & Interactive Area */
          <>
            {/* Visualizer Frame */}
            <div className="h-[460px]">
              <RoomVisualizer
                report={currentReport}
                onUpdateFurniture={handleUpdateFurniture}
                selectedItemId={selectedItemId}
                onSelectItemId={setSelectedItemId}
              />
            </div>

            {/* Design Specifications Report */}
            <div className="bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 rounded-none p-6 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-black/10 dark:border-white/10">
                <div>
                  <h2 className="text-xl font-serif italic text-stone-800 dark:text-stone-100">
                    {currentReport.roomName}
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Dimensions: {currentReport.dimensions.length} x {currentReport.dimensions.width} x {currentReport.dimensions.height} {currentReport.dimensions.unit} | Style: {currentReport.style} | Est. Cost: <span className="font-bold text-black dark:text-white">${currentReport.totalEstimatedCost}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveFavorite}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-none border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isFavorited
                        ? "bg-red-500/10 border-red-200 dark:border-red-900/50 text-red-600"
                        : "bg-white dark:bg-stone-950 border-black/15 dark:border-white/15 text-stone-600 dark:text-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-600 text-red-600" : ""}`} />
                    {isFavorited ? "Saved" : "Save Design"}
                  </button>
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-none border border-black/15 dark:border-white/15 bg-white dark:bg-stone-950 text-stone-600 dark:text-stone-300 hover:bg-stone-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    Print PDF
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-none border border-black/15 dark:border-white/15 bg-white dark:bg-stone-950 text-stone-600 dark:text-stone-300 hover:bg-stone-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    title="Download Design as JSON"
                  >
                    <Download className="h-4 w-4" />
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-black/10 dark:border-white/10 mt-6 overflow-x-auto gap-2">
                <button
                  onClick={() => setActiveTab("layout")}
                  className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "layout"
                      ? "border-black text-black dark:border-white dark:text-white font-extrabold"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Sofa className="h-4 w-4" /> Furniture Plan
                </button>
                <button
                  onClick={() => setActiveTab("colors")}
                  className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "colors"
                      ? "border-black text-black dark:border-white dark:text-white font-extrabold"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Palette className="h-4 w-4" /> Colors & Decor
                </button>
                <button
                  onClick={() => setActiveTab("vastu")}
                  className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "vastu"
                      ? "border-black text-black dark:border-white dark:text-white font-extrabold"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Compass className="h-4 w-4" /> Vastu Audit
                </button>
                <button
                  onClick={() => setActiveTab("tips")}
                  className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "tips"
                      ? "border-black text-black dark:border-white dark:text-white font-extrabold"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <ClipboardList className="h-4 w-4" /> Space Optimization
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`px-4 py-3 text-xs uppercase tracking-widest font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "json"
                      ? "border-black text-black dark:border-white dark:text-white font-extrabold"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Code className="h-4 w-4" /> JSON Blueprint
                </button>
              </div>

              {/* Tab Contents */}
              <div className="pt-6">
                {/* 1. Layout Tab */}
                {activeTab === "layout" && (
                  <div className="space-y-4">
                    <p className="text-xs text-stone-500 leading-relaxed mb-4 font-serif italic">
                      Double-click or tap items on the 2D Floorplan above to select them. Drag items on the floorplan to rearrange the coordinates. The Vastu compass updates compliance checks dynamically.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentReport.furniture.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItemId(item.id)}
                          className={`p-4 rounded-none border transition-all cursor-pointer ${
                            item.id === selectedItemId
                              ? "bg-stone-50 dark:bg-stone-900 border-black dark:border-white shadow-xs"
                              : "bg-[#FAF9F6]/50 dark:bg-stone-950 border-black/10 dark:border-white/10 hover:bg-stone-100/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-800 dark:text-stone-200">{item.name}</span>
                            <span className="text-[10px] text-stone-900 dark:text-stone-100 font-bold font-mono">${item.estimatedCost}</span>
                          </div>
                          <div className="text-[10px] text-stone-400 mt-2 space-y-1">
                            <p className="font-serif">Dimensions: {item.dimensions}</p>
                            <p className="font-serif">Materiality: {item.material}</p>
                            <p className="text-stone-600 dark:text-stone-300 italic mt-2 leading-relaxed">{item.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Colors & Styling Tab */}
                {activeTab === "colors" && (
                  <div className="space-y-6 font-sans">
                    {/* Color Swatches */}
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-3 flex items-center gap-1.5">
                        <Palette className="h-4 w-4" /> Curated Color Palette
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="border border-black/10 dark:border-white/10 rounded-none p-3 bg-[#FAF9F6] dark:bg-stone-950 flex flex-col items-center">
                          <div className="w-full h-10 rounded-none mb-2" style={{ backgroundColor: currentReport.palette.primary }} />
                          <span className="text-[10px] font-bold text-stone-800 dark:text-stone-200">{currentReport.palette.primaryName}</span>
                          <span className="text-[9px] font-mono text-stone-400 mt-0.5">{currentReport.palette.primary}</span>
                        </div>
                        <div className="border border-black/10 dark:border-white/10 rounded-none p-3 bg-[#FAF9F6] dark:bg-stone-950 flex flex-col items-center">
                          <div className="w-full h-10 rounded-none mb-2" style={{ backgroundColor: currentReport.palette.secondary }} />
                          <span className="text-[10px] font-bold text-stone-800 dark:text-stone-200">{currentReport.palette.secondaryName}</span>
                          <span className="text-[9px] font-mono text-stone-400 mt-0.5">{currentReport.palette.secondary}</span>
                        </div>
                        <div className="border border-black/10 dark:border-white/10 rounded-none p-3 bg-[#FAF9F6] dark:bg-stone-950 flex flex-col items-center">
                          <div className="w-full h-10 rounded-none mb-2" style={{ backgroundColor: currentReport.palette.accent }} />
                          <span className="text-[10px] font-bold text-stone-800 dark:text-stone-200">{currentReport.palette.accentName}</span>
                          <span className="text-[9px] font-mono text-stone-400 mt-0.5">{currentReport.palette.accent}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lighting Suggestions */}
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-3 flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4" /> Architectural Lighting Plan
                      </h3>
                      <div className="space-y-3">
                        {currentReport.lighting.map((light, index) => (
                          <div key={index} className="flex gap-3 items-start bg-[#FAF9F6]/40 dark:bg-stone-950 border border-black/10 dark:border-white/10 p-3.5 rounded-none text-xs">
                            <span className="px-2 py-0.5 rounded-none bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-[9px] uppercase tracking-wider mt-0.5">
                              {light.type}
                            </span>
                            <div>
                              <p className="font-bold text-stone-800 dark:text-stone-200">{light.name} &bull; <span className="text-[10px] text-stone-400 font-serif italic">{light.placement}</span></p>
                              <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed font-serif">{light.purpose}</p>
                            </div>
                            <span className="ml-auto font-mono text-stone-800 dark:text-[#FAF9F6] text-[10px] font-bold">${light.estimatedCost}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Showpiece / Decor suggestions */}
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-3">Curated Showpieces & Wall Decor</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentReport.decor.map((decor, index) => (
                          <div key={index} className="p-3.5 bg-[#FAF9F6]/40 dark:bg-stone-950 border border-black/10 dark:border-white/10 rounded-none text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-stone-800 dark:text-stone-200">{decor.name}</span>
                              <span className="font-mono text-[10px] font-bold text-stone-900 dark:text-stone-100">${decor.estimatedCost}</span>
                            </div>
                            <p className="text-[10px] text-stone-400 mt-1.5 font-serif">Placement: {decor.placement}</p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 italic mt-1 leading-relaxed font-serif">{decor.visualAppeal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Vastu Audit Tab */}
                {activeTab === "vastu" && (
                  <div className="space-y-4 font-sans">
                    <div className="p-4 bg-[#FAF9F6] dark:bg-stone-950 text-stone-700 dark:text-stone-300 rounded-none border border-black/10 dark:border-white/10 text-xs leading-relaxed font-serif italic">
                      Vastu Shastra balances ancient element flow (Fire, Water, Earth, Air, Space) inside buildings to yield abundance, health, and peace. Review these primary recommendations:
                    </div>
                    <div className="space-y-3.5">
                      {currentReport.vastu.map((item, index) => (
                        <div key={index} className="p-4 bg-white dark:bg-stone-950 border border-black/10 dark:border-white/10 rounded-none">
                          <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5 mb-2">
                            <span className="font-bold text-xs uppercase tracking-widest text-stone-500">{item.element}</span>
                            <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-none bg-black text-white dark:bg-white dark:text-black">
                              Ideal: {item.idealDirection}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-700 dark:text-stone-300 leading-relaxed font-serif">{item.placementDetail}</p>
                          <p className="text-[10px] text-stone-400 italic mt-2 font-serif">Benefit: {item.benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Tips Tab */}
                {activeTab === "tips" && (
                  <div className="space-y-4 font-sans">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-3">Space Optimization Checklist</h3>
                    <div className="space-y-2.5">
                      {currentReport.spaceOptimizationTips.map((tip, index) => (
                        <div key={index} className="flex gap-3 items-start bg-[#FAF9F6]/40 dark:bg-stone-950 border border-black/10 dark:border-white/10 p-4 rounded-none">
                          <Check className="h-4 w-4 text-stone-800 dark:text-stone-200 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-serif">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. JSON Tab */}
                {activeTab === "json" && (
                  <div className="space-y-4 font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#FAF9F6] dark:bg-stone-950 border border-black/10 dark:border-white/10 rounded-none">
                      <div>
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-800 dark:text-stone-200">Design Specification JSON</h3>
                        <p className="text-xs text-stone-500 font-serif italic mt-0.5">Integrate this space layout specification into other layout systems or CAD editors.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyJson}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-900 border border-black/15 dark:border-white/15 text-stone-700 dark:text-stone-200 hover:bg-stone-100 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copiedJson ? "Copied!" : "Copy JSON"}
                        </button>
                        <button
                          onClick={handleDownloadJson}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-bold uppercase tracking-wider cursor-pointer transition-opacity"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </div>
                    </div>

                    <div className="border border-black/10 dark:border-white/10 rounded-none overflow-hidden">
                      <pre className="bg-[#FAF9F6] dark:bg-stone-950 p-4 text-[11px] font-mono text-stone-800 dark:text-stone-200 max-h-[400px] overflow-y-auto leading-relaxed whitespace-pre-wrap select-all">
                        {JSON.stringify(currentReport, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty / Initial Welcome Screen */
          <div className="bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 rounded-none p-12 shadow-sm flex flex-col items-center justify-center min-h-[450px] text-center">
            <div className="h-12 w-12 flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-black dark:text-white" />
            </div>
            <h2 className="text-2xl font-serif italic text-stone-900 dark:text-[#FAF9F6]">Welcome to Sarika's Studio</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 max-w-md leading-relaxed font-serif italic">
              Define your space dimensions, preferred architectural style guidelines, and design budgets inside the parameters pane.
              Our model synthesizes layout blueprints, lighting matrices, color palettes, and certified Vastu compliance parameters bespoke to your vision.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg mt-10 pt-8 border-t border-black/5 dark:border-white/5">
              <div className="p-4 bg-[#FAF9F6] dark:bg-stone-950 border border-black/5 dark:border-white/5 rounded-none text-center">
                <Sofa className="h-5 w-5 text-black dark:text-white mx-auto mb-2" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-700 dark:text-stone-300 block">Interactive Floorplan</span>
              </div>
              <div className="p-4 bg-[#FAF9F6] dark:bg-stone-950 border border-black/5 dark:border-white/5 rounded-none text-center">
                <Compass className="h-5 w-5 text-black dark:text-white mx-auto mb-2" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-700 dark:text-stone-300 block">Certified Vastu</span>
              </div>
              <div className="p-4 bg-[#FAF9F6] dark:bg-stone-950 border border-black/5 dark:border-white/5 rounded-none text-center">
                <Palette className="h-5 w-5 text-black dark:text-white mx-auto mb-2" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-700 dark:text-stone-300 block">Stylist Visualizer</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
