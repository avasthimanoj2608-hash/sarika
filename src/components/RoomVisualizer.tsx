/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { FurnitureItem, DesignReport, RoomType } from "../types";
import { Move, RotateCw, Compass, Sliders, CheckCircle2, AlertTriangle, Download, Eye, Layers } from "lucide-react";

interface RoomVisualizerProps {
  report: DesignReport;
  onUpdateFurniture?: (items: FurnitureItem[]) => void;
  selectedItemId: string | null;
  onSelectItemId: (id: string | null) => void;
}

export default function RoomVisualizer({ report, onUpdateFurniture, selectedItemId, onSelectItemId }: RoomVisualizerProps) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [comparison, setComparison] = useState<"after" | "before">("after");
  const [showVastuOverlay, setShowVastuOverlay] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle container resizing to keep canvas responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        const height = Math.max(350, Math.min(500, width * 0.75));
        setDimensions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Sync selected ID when report changes
  useEffect(() => {
    if (report.furniture.length > 0 && !selectedItemId) {
      onSelectItemId(report.furniture[0].id);
    }
  }, [report]);

  // Vastu compliance analyzer for current item position
  const getVastuStatus = (item: FurnitureItem) => {
    const { x, y } = item;
    if (x === undefined || y === undefined) return { valid: true, msg: "Position undefined" };

    // Determine direction quadrant based on coordinates (top-left is NW, top-right is NE, etc.)
    // Let's assume North is TOP of canvas.
    // Left side: West. Right side: East. Top side: North. Bottom side: South.
    let vertical = y < 40 ? "North" : y > 60 ? "South" : "Center";
    let horizontal = x < 40 ? "West" : x > 60 ? "East" : "Center";
    
    let currentZone = "";
    if (vertical === "North" && horizontal === "West") currentZone = "North-West";
    else if (vertical === "North" && horizontal === "East") currentZone = "North-East";
    else if (vertical === "North" && horizontal === "Center") currentZone = "North";
    else if (vertical === "South" && horizontal === "West") currentZone = "South-West";
    else if (vertical === "South" && horizontal === "East") currentZone = "South-East";
    else if (vertical === "South" && horizontal === "Center") currentZone = "South";
    else if (vertical === "Center" && horizontal === "West") currentZone = "West";
    else if (vertical === "Center" && horizontal === "East") currentZone = "East";
    else currentZone = "Center";

    const targetZone = item.vastuZone || "";
    
    // Check compatibility rules
    if (item.name.toLowerCase().includes("bed")) {
      // Bed is best in SW or South. Bad in NE.
      if (currentZone === "North-East") {
        return {
          valid: false,
          zone: currentZone,
          msg: "Vastu Warning: Placing a Bed in the North-East disturbs mental peace and sleep cycle. Relocate to South-West or South."
        };
      }
      return {
        valid: true,
        zone: currentZone,
        msg: "Vastu Compliant: Head faces South/East when sleeping. Promotes deep recovery and stability."
      };
    }

    if (item.name.toLowerCase().includes("sofa") || item.name.toLowerCase().includes("couch")) {
      // Sofa is best in South or West
      if (currentZone === "North-East" || currentZone === "North") {
        return {
          valid: false,
          zone: currentZone,
          msg: "Vastu Warning: Heavy sofa in the North/North-East blocks beneficial cosmic wealth rays. Move to South-West or West."
        };
      }
      return {
        valid: true,
        zone: currentZone,
        msg: "Vastu Compliant: Grounded seating in heavy quadrant enhances domestic harmony."
      };
    }

    if (item.name.toLowerCase().includes("stove") || item.name.toLowerCase().includes("kitchen") || item.name.toLowerCase().includes("oven")) {
      // Stove belongs in SE
      if (currentZone !== "South-East") {
        return {
          valid: false,
          zone: currentZone,
          msg: "Vastu Warning: Fire elements must strictly sit in the South-East zone. Placing it elsewhere triggers financial friction."
        };
      }
      return {
        valid: true,
        zone: currentZone,
        msg: "Vastu Perfect: Cooking in the Agni zone fosters health, vitality, and abundant income."
      };
    }

    if (item.name.toLowerCase().includes("desk") || item.name.toLowerCase().includes("workspace") || item.name.toLowerCase().includes("table")) {
      // Desk is best in North, East, or West. Never NE or SW corner for light desks
      if (currentZone === "South-East") {
        return {
          valid: false,
          zone: currentZone,
          msg: "Vastu Warning: Working in the fire element zone (South-East) can lead to burn-out and stress. Best placed in North or West."
        };
      }
    }

    return {
      valid: true,
      zone: currentZone,
      msg: `Positioned in the ${currentZone} zone. Energetically balanced for general utility.`
    };
  };

  const selectedItem = report.furniture.find((item) => item.id === selectedItemId);

  // Redraw Canvas whenever parameters change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear background
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Grid details
    const gridPadding = 40;
    const roomW = dimensions.width - gridPadding * 2;
    const roomH = dimensions.height - gridPadding * 2;
    const center = { x: dimensions.width / 2, y: dimensions.height / 2 };

    if (comparison === "before") {
      // Render BEFORE state: empty room, dusty walls, gridlines, dark lighting
      ctx.fillStyle = "#E0E0E0"; // dusty color
      ctx.fillRect(gridPadding, gridPadding, roomW, roomH);

      // Grid mesh
      ctx.strokeStyle = "#CCCCCC";
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = gridPadding; x < dimensions.width - gridPadding; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, gridPadding);
        ctx.lineTo(x, dimensions.height - gridPadding);
        ctx.stroke();
      }
      for (let y = gridPadding; y < dimensions.height - gridPadding; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gridPadding, y);
        ctx.lineTo(dimensions.width - gridPadding, y);
        ctx.stroke();
      }

      // Walls
      ctx.strokeStyle = "#757575";
      ctx.lineWidth = 6;
      ctx.strokeRect(gridPadding, gridPadding, roomW, roomH);

      // Title
      ctx.fillStyle = "#616161";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Before: Empty Interior Shell", center.x, center.y);
      return;
    }

    if (viewMode === "2d") {
      // ----------------------------------------------------
      // 2D FLOORPLAN VIEW
      // ----------------------------------------------------
      // Draw floor backdrop colored with secondary/primary colors
      const primaryColor = report.palette.primary || "#F5EFE6";
      const secondaryColor = report.palette.secondary || "#1D2026";
      const accentColor = report.palette.accent || "#DFBA73";

      // Fill floor
      ctx.fillStyle = "#FAF9F6"; // soft paper white floor
      ctx.fillRect(gridPadding, gridPadding, roomW, roomH);

      // Floor grain pattern (subtle lines)
      ctx.strokeStyle = "rgba(0,0,0,0.03)";
      ctx.lineWidth = 2;
      for (let i = gridPadding; i < dimensions.width - gridPadding; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, gridPadding);
        ctx.lineTo(i, dimensions.height - gridPadding);
        ctx.stroke();
      }

      // Render Vastu Quadrants if overlay is enabled
      if (showVastuOverlay) {
        ctx.strokeStyle = "rgba(197, 160, 89, 0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(gridPadding, gridPadding + roomH / 3);
        ctx.lineTo(dimensions.width - gridPadding, gridPadding + roomH / 3);
        ctx.moveTo(gridPadding, gridPadding + (roomH / 3) * 2);
        ctx.lineTo(dimensions.width - gridPadding, gridPadding + (roomH / 3) * 2);
        // Vertical lines
        ctx.moveTo(gridPadding + roomW / 3, gridPadding);
        ctx.lineTo(gridPadding + roomW / 3, dimensions.height - gridPadding);
        ctx.moveTo(gridPadding + (roomW / 3) * 2, gridPadding);
        ctx.lineTo(gridPadding + (roomW / 3) * 2, dimensions.height - gridPadding);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label Quadrants in gold
        ctx.fillStyle = "rgba(197, 160, 89, 0.45)";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        
        const qW = roomW / 6;
        const qH = roomH / 6;
        
        ctx.fillText("NORTH-WEST", gridPadding + qW, gridPadding + qH);
        ctx.fillText("NORTH", gridPadding + qW * 3, gridPadding + qH);
        ctx.fillText("NORTH-EAST", gridPadding + qW * 5, gridPadding + qH);

        ctx.fillText("WEST", gridPadding + qW, gridPadding + qH * 3);
        ctx.fillText("CENTER", gridPadding + qW * 3, gridPadding + qH * 3);
        ctx.fillText("EAST", gridPadding + qW * 5, gridPadding + qH * 3);

        ctx.fillText("SOUTH-WEST", gridPadding + qW, gridPadding + qH * 5);
        ctx.fillText("SOUTH", gridPadding + qW * 3, gridPadding + qH * 5);
        ctx.fillText("SOUTH-EAST", gridPadding + qW * 5, gridPadding + qH * 5);
      }

      // Draw Walls with the selected primary color
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 10;
      ctx.strokeRect(gridPadding, gridPadding, roomW, roomH);

      // Accent border
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(gridPadding - 6, gridPadding - 6, roomW + 12, roomH + 12);

      // Draw Main Entrance (represented as a door swing)
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Draw door at top right (North-East corner typically)
      const doorX = gridPadding + roomW * 0.85;
      const doorY = gridPadding;
      ctx.moveTo(doorX, doorY);
      ctx.lineTo(doorX - 30, doorY); // Door leaf
      ctx.arc(doorX, doorY, 30, Math.PI, Math.PI * 1.5); // Arc swing
      ctx.stroke();
      
      ctx.fillStyle = accentColor;
      ctx.font = "bold 8px sans-serif";
      ctx.fillText("MAIN ENTRY", doorX - 15, doorY + 12);

      // Draw Furniture Items
      report.furniture.forEach((item) => {
        const itemX = gridPadding + (item.x || 50) * 0.01 * roomW;
        const itemY = gridPadding + (item.y || 50) * 0.01 * roomH;
        const isSelected = item.id === selectedItemId;

        ctx.save();
        ctx.translate(itemX, itemY);
        ctx.rotate(((item.rotation || 0) * Math.PI) / 180);

        // Approximate sizing for draw
        let itemWidth = 50;
        let itemHeight = 30;

        if (item.name.toLowerCase().includes("sofa") || item.name.toLowerCase().includes("couch")) {
          itemWidth = 75;
          itemHeight = 35;
          
          // Draw a sofa shape
          ctx.fillStyle = isSelected ? "rgba(197, 160, 89, 0.25)" : "rgba(120, 120, 120, 0.15)";
          ctx.strokeStyle = isSelected ? accentColor : secondaryColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-itemWidth/2, -itemHeight/2, itemWidth, itemHeight, 5);
          ctx.fill();
          ctx.stroke();

          // Cushions details
          ctx.strokeRect(-itemWidth/2 + 5, -itemHeight/2 + 5, itemWidth - 10, itemHeight - 12); // main cushion
          ctx.strokeRect(-itemWidth/2 + 5, itemHeight/2 - 7, itemWidth - 10, 5); // backrest
          // Armrests
          ctx.strokeRect(-itemWidth/2, -itemHeight/2, 5, itemHeight);
          ctx.strokeRect(itemWidth/2 - 5, -itemHeight/2, 5, itemHeight);
        } else if (item.name.toLowerCase().includes("bed")) {
          itemWidth = 65;
          itemHeight = 70;
          
          // Draw bed
          ctx.fillStyle = isSelected ? "rgba(197, 160, 89, 0.25)" : "rgba(120, 120, 120, 0.15)";
          ctx.strokeStyle = isSelected ? accentColor : secondaryColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-itemWidth/2, -itemHeight/2, itemWidth, itemHeight, 4);
          ctx.fill();
          ctx.stroke();

          // Pillows
          ctx.fillStyle = "#E0E0E0";
          ctx.strokeRect(-itemWidth/2 + 8, -itemHeight/2 + 6, 20, 12);
          ctx.strokeRect(itemWidth/2 - 28, -itemHeight/2 + 6, 20, 12);
          // Blanket crease
          ctx.beginPath();
          ctx.moveTo(-itemWidth/2, -itemHeight/2 + 25);
          ctx.lineTo(itemWidth/2, -itemHeight/2 + 25);
          ctx.stroke();
        } else if (item.name.toLowerCase().includes("table") || item.name.toLowerCase().includes("desk")) {
          itemWidth = 55;
          itemHeight = 32;
          // Draw table
          ctx.fillStyle = isSelected ? "rgba(197, 160, 89, 0.25)" : "rgba(120, 120, 120, 0.15)";
          ctx.strokeStyle = isSelected ? accentColor : secondaryColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-itemWidth/2, -itemHeight/2, itemWidth, itemHeight, 2);
          ctx.fill();
          ctx.stroke();
          // Table grain
          ctx.beginPath();
          ctx.moveTo(-itemWidth/2 + 5, -itemHeight/2 + 5);
          ctx.lineTo(itemWidth/2 - 5, -itemHeight/2 + 5);
          ctx.stroke();
        } else if (item.name.toLowerCase().includes("cabinet") || item.name.toLowerCase().includes("sideboard")) {
          itemWidth = 70;
          itemHeight = 22;
          ctx.fillStyle = isSelected ? "rgba(197, 160, 89, 0.25)" : "rgba(120, 120, 120, 0.15)";
          ctx.strokeStyle = isSelected ? accentColor : secondaryColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-itemWidth/2, -itemHeight/2, itemWidth, itemHeight, 1);
          ctx.fill();
          ctx.stroke();
          // Handles
          ctx.strokeRect(-itemWidth/4, -itemHeight/2 + 2, 2, itemHeight - 4);
          ctx.strokeRect(itemWidth/4, -itemHeight/2 + 2, 2, itemHeight - 4);
        } else {
          // General plant or chair or decor item
          itemWidth = 35;
          itemHeight = 35;
          ctx.fillStyle = isSelected ? "rgba(197, 160, 89, 0.25)" : "rgba(120, 120, 120, 0.12)";
          ctx.strokeStyle = isSelected ? accentColor : secondaryColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, itemWidth/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Inner detail (e.g. spiral or cross)
          ctx.beginPath();
          ctx.arc(0, 0, itemWidth/4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Add index text label
        ctx.fillStyle = secondaryColor;
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(item.name.substring(0, 18) + (item.name.length > 18 ? ".." : ""), 0, itemHeight/2 + 12);

        // Draw directional arrow on item
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -itemHeight/2 - 2);
        ctx.lineTo(-4, -itemHeight/2 + 3);
        ctx.moveTo(0, -itemHeight/2 - 2);
        ctx.lineTo(4, -itemHeight/2 + 3);
        ctx.stroke();

        ctx.restore();
      });

    } else {
      // ----------------------------------------------------
      // FAUX-3D PERSPECTIVE PERSPECTIVE VIEW
      // ----------------------------------------------------
      // Create a gorgeous 3D isometric styled corner room drawing!
      const priColor = report.palette.primary || "#F5EFE6";
      const secColor = report.palette.secondary || "#1D2026";
      const accColor = report.palette.accent || "#DFBA73";

      // 3D coordinates anchor
      const oX = center.x;
      const oY = center.y + 60;
      const wallLength = Math.min(roomW * 0.52, 200);
      const wallHeight = 150;

      // Left Wall Polygon (Facing NW)
      ctx.fillStyle = priColor;
      ctx.beginPath();
      ctx.moveTo(oX, oY);
      ctx.lineTo(oX - wallLength, oY - wallLength * 0.5);
      ctx.lineTo(oX - wallLength, oY - wallLength * 0.5 - wallHeight);
      ctx.lineTo(oX, oY - wallHeight);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = secColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Right Wall Polygon (Facing NE)
      // Slightly darken the color of the right wall for shadow realistic illusion
      ctx.fillStyle = pSBC(-0.12, priColor) || priColor;
      ctx.beginPath();
      ctx.moveTo(oX, oY);
      ctx.lineTo(oX + wallLength, oY - wallLength * 0.5);
      ctx.lineTo(oX + wallLength, oY - wallLength * 0.5 - wallHeight);
      ctx.lineTo(oX, oY - wallHeight);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Floor Polygon
      ctx.fillStyle = "#EBE9E2"; // nice beige flooring texture
      ctx.beginPath();
      ctx.moveTo(oX, oY);
      ctx.lineTo(oX - wallLength, oY - wallLength * 0.5);
      ctx.lineTo(oX, oY - wallLength);
      ctx.lineTo(oX + wallLength, oY - wallLength * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Floor plank lines mapping perspective
      ctx.strokeStyle = "rgba(0,0,0,0.04)";
      ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i++) {
        const offset = i * (wallLength / 5);
        ctx.beginPath();
        ctx.moveTo(oX + offset, oY + offset * 0.5);
        ctx.lineTo(oX - wallLength + offset, oY - wallLength * 0.5 + offset * 0.5);
        ctx.stroke();
      }

      // Draw a window representation on the left wall
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.strokeStyle = secColor;
      ctx.beginPath();
      const winX1 = oX - wallLength * 0.7;
      const winY1 = oY - wallLength * 0.35 - wallHeight * 0.6;
      const winX2 = oX - wallLength * 0.3;
      const winY2 = oY - wallLength * 0.15 - wallHeight * 0.6;
      ctx.moveTo(winX1, winY1);
      ctx.lineTo(winX2, winY2);
      ctx.lineTo(winX2, winY2 + 50);
      ctx.lineTo(winX1, winY1 + 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glass shine and window frame lines
      ctx.strokeStyle = accColor;
      ctx.beginPath();
      ctx.moveTo((winX1 + winX2)/2, (winY1 + winY2)/2);
      ctx.lineTo((winX1 + winX2)/2, (winY1 + winY2)/2 + 50);
      ctx.stroke();

      // Draw active lighting glow overlay
      const gradient = ctx.createRadialGradient(oX, oY - wallHeight, 10, oX, oY, 250);
      gradient.addColorStop(0, "rgba(253, 251, 247, 0.25)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(gridPadding, gridPadding, roomW, roomH);

      // Draw Isometric Furniture Boxes
      // Sort items by Y layout position to draw back-to-front correctly (isometric sorting)
      const sortedFurniture = [...report.furniture].sort((a, b) => {
        // Convert x, y percentage into isometric depth. depth = x + y
        const depthA = (a.x || 50) + (a.y || 50);
        const depthB = (b.x || 50) + (b.y || 50);
        return depthA - depthB;
      });

      sortedFurniture.forEach((item) => {
        // Convert 2D center coordinates (0-100) into 3D isometric coordinates
        const pctX = (item.x || 50) * 0.01 - 0.5; // -0.5 to 0.5
        const pctY = (item.y || 50) * 0.01 - 0.5; // -0.5 to 0.5

        // Map onto floor plane
        const fX = oX + (pctX * wallLength) + (pctY * wallLength);
        const fY = oY + (pctX * wallLength * 0.5) - (pctY * wallLength * 0.5);

        const isSelected = item.id === selectedItemId;

        // Draw basic isometric prism box represent item
        ctx.save();
        ctx.translate(fX, fY);

        let w = 24; // width
        let h = 20; // height
        let d = 24; // depth (vertical block height)

        if (item.name.toLowerCase().includes("sofa") || item.name.toLowerCase().includes("couch")) {
          w = 42; h = 20; d = 16;
        } else if (item.name.toLowerCase().includes("bed")) {
          w = 40; h = 42; d = 14;
        } else if (item.name.toLowerCase().includes("table") || item.name.toLowerCase().includes("desk")) {
          w = 30; h = 20; d = 18;
        }

        // Draw Shadow on Floor
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-w, -w * 0.5);
        ctx.lineTo(-w + h, -w * 0.5 + h * 0.5);
        ctx.lineTo(h, h * 0.5);
        ctx.closePath();
        ctx.fill();

        // Left Face
        ctx.fillStyle = isSelected ? accColor : secColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-w, -w * 0.5);
        ctx.lineTo(-w, -w * 0.5 - d);
        ctx.lineTo(0, -d);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.stroke();

        // Right Face
        ctx.fillStyle = isSelected ? pSBC(-0.15, accColor) || accColor : pSBC(-0.25, secColor) || secColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(h, h * 0.5);
        ctx.lineTo(h, h * 0.5 - d);
        ctx.lineTo(0, -d);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Top Face
        ctx.fillStyle = isSelected ? pSBC(0.15, accColor) || accColor : pSBC(0.15, secColor) || secColor;
        ctx.beginPath();
        ctx.moveTo(0, -d);
        ctx.lineTo(-w, -w * 0.5 - d);
        ctx.lineTo(-w + h, -w * 0.5 + h * 0.5 - d);
        ctx.lineTo(h, h * 0.5 - d);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Item Index or short label
        ctx.fillStyle = isSelected ? "#FFFFFF" : "#E0E0E0";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(item.name.split(" ")[0], -w*0.3 + h*0.3, -d/2);

        ctx.restore();
      });

      // Ambient text label on the side corner
      ctx.fillStyle = secColor;
      ctx.font = "9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`Style: ${report.style}`, gridPadding + 10, dimensions.height - gridPadding - 10);
      ctx.textAlign = "right";
      ctx.fillText(`Budget: ${report.budget}`, dimensions.width - gridPadding - 10, dimensions.height - gridPadding - 10);
    }
  }, [dimensions, report, viewMode, selectedItemId, showVastuOverlay, comparison]);

  // Color shading utility function (equivalent to shadeBlendConvert)
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

  // Handle Drag & Drop on Floorplan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewMode !== "2d" || comparison === "before") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gridPadding = 40;
    const roomW = dimensions.width - gridPadding * 2;
    const roomH = dimensions.height - gridPadding * 2;

    // Find if user clicked on any furniture item
    let clickedItem: FurnitureItem | null = null;
    for (const item of report.furniture) {
      const itemX = gridPadding + (item.x || 50) * 0.01 * roomW;
      const itemY = gridPadding + (item.y || 50) * 0.01 * roomH;

      // Simple box collision click within 25px radius
      const dist = Math.hypot(clickX - itemX, clickY - itemY);
      if (dist < 30) {
        clickedItem = item;
        break;
      }
    }

    if (clickedItem) {
      onSelectItemId(clickedItem.id);
      setIsDragging(true);
      const itemX = gridPadding + (clickedItem.x || 50) * 0.01 * roomW;
      const itemY = gridPadding + (clickedItem.y || 50) * 0.01 * roomH;
      setDragOffset({
        x: clickX - itemX,
        y: clickY - itemY,
      });
    } else {
      onSelectItemId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || viewMode !== "2d" || !selectedItemId || !onUpdateFurniture) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    const gridPadding = 40;
    const roomW = dimensions.width - gridPadding * 2;
    const roomH = dimensions.height - gridPadding * 2;

    // Calculate new position
    const targetX = currX - dragOffset.x;
    const targetY = currY - dragOffset.y;

    // Convert back to percentage (bounded 10 to 90 so items don't exit the walls)
    let pctX = Math.round(((targetX - gridPadding) / roomW) * 100);
    let pctY = Math.round(((targetY - gridPadding) / roomH) * 100);

    pctX = Math.max(12, Math.min(88, pctX));
    pctY = Math.max(12, Math.min(88, pctY));

    // Update coordinates in parent array
    const updatedFurniture = report.furniture.map((item) => {
      if (item.id === selectedItemId) {
        return { ...item, x: pctX, y: pctY };
      }
      return item;
    });

    onUpdateFurniture(updatedFurniture);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Rotate selected item
  const handleRotate = () => {
    if (!selectedItemId || !onUpdateFurniture) return;
    const updatedFurniture = report.furniture.map((item) => {
      if (item.id === selectedItemId) {
        const currentRot = item.rotation || 0;
        return { ...item, rotation: (currentRot + 90) % 360 };
      }
      return item;
    });
    onUpdateFurniture(updatedFurniture);
  };

  // Download layout blueprint as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${report.roomName.replace(/\s+/g, "_")}_layout.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 rounded-none overflow-hidden shadow-sm flex flex-col h-full font-sans" id="room-visualizer">
      {/* Top Controls Toolbar */}
      <div className="border-b border-black/10 dark:border-white/10 bg-[#FAF9F6] dark:bg-stone-950 p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-stone-800 dark:text-stone-200" />
          <h3 className="font-bold text-[#1A1A1A] dark:text-[#FAF9F6] text-xs uppercase tracking-widest">Interactive Room Visualizer</h3>
        </div>

        {/* Before / After toggle */}
        <div className="flex rounded-none overflow-hidden border border-black/10 dark:border-white/10 p-0.5 bg-white dark:bg-stone-900 text-[10px] uppercase tracking-wider font-bold">
          <button
            onClick={() => setComparison("after")}
            className={`px-3 py-1 rounded-none transition-all cursor-pointer ${
              comparison === "after"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            After (AI Designed)
          </button>
          <button
            onClick={() => setComparison("before")}
            className={`px-3 py-1 rounded-none transition-all cursor-pointer ${
              comparison === "before"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            Before (Empty Shell)
          </button>
        </div>

        {/* View Mode & Extra Overlay controls */}
        <div className="flex items-center gap-2">
          {comparison === "after" && (
            <div className="flex bg-stone-100 dark:bg-stone-900 rounded-none p-0.5 border border-black/10 dark:border-white/10 text-[10px] uppercase tracking-wider font-bold">
              <button
                onClick={() => setViewMode("2d")}
                className={`px-3 py-1 rounded-none flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "2d" ? "bg-white dark:bg-stone-800 text-black dark:text-white font-extrabold shadow-xs" : "text-stone-400"
                }`}
              >
                <Sliders className="h-3 w-3" /> 2D Floorplan
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={`px-3 py-1 rounded-none flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "3d" ? "bg-white dark:bg-stone-800 text-black dark:text-white font-extrabold shadow-xs" : "text-stone-400"
                }`}
              >
                <Eye className="h-3 w-3" /> 3D Perspective
              </button>
            </div>
          )}

          {viewMode === "2d" && comparison === "after" && (
            <button
              onClick={() => setShowVastuOverlay(!showVastuOverlay)}
              className={`p-1.5 rounded-none border transition-all cursor-pointer ${
                showVastuOverlay
                  ? "bg-black text-white border-black dark:bg-[#FAF9F6] dark:text-[#1A1A1A] dark:border-white"
                  : "bg-white dark:bg-stone-900 border-black/10 dark:border-white/10 text-stone-400 hover:text-black dark:hover:text-white"
              }`}
              title="Toggle Vastu Compass Overlays"
            >
              <Compass className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-none border border-black/15 dark:border-white/15 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
            title="Download Layout Canvas"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4 min-h-[350px]" ref={containerRef}>
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`bg-white dark:bg-stone-900 border border-black/10 dark:border-white/10 rounded-none shadow-xs transition-shadow ${
            viewMode === "2d" && comparison === "after" ? "cursor-grab active:cursor-grabbing" : ""
          }`}
        />

        {viewMode === "2d" && comparison === "after" && (
          <div className="absolute top-6 left-6 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-none text-[9px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 border border-black/10 dark:border-white/10 pointer-events-none font-sans">
            * Drag elements to relocate
          </div>
        )}
      </div>

      {/* Selected Item Control Bar / Details */}
      {comparison === "after" && (
        <div className="p-4 border-t border-black/10 dark:border-white/10 bg-[#FAF9F6] dark:bg-stone-950 font-sans">
          {selectedItem ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-none" style={{ backgroundColor: report.palette.accent }} />
                  <span className="font-bold text-stone-800 dark:text-stone-100 text-sm">{selectedItem.name}</span>
                  <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">
                    {selectedItem.dimensions}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 font-serif">{selectedItem.reason}</p>
                
                {/* Real-time Vastu feedback on coordinates */}
                <div className="flex items-start gap-2.5 mt-3 bg-white dark:bg-stone-900 p-3 rounded-none border border-black/10 dark:border-white/10">
                  {getVastuStatus(selectedItem).valid ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-stone-800 dark:text-stone-200 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px]">
                      Vastu Zone Analysis ({getVastuStatus(selectedItem).zone}):{" "}
                    </span>
                    <span className="text-stone-600 dark:text-stone-400 font-serif italic">{getVastuStatus(selectedItem).msg}</span>
                  </div>
                </div>
              </div>

              {/* Manipulation actions */}
              <div className="md:col-span-4 flex justify-end gap-2">
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-none border border-black/15 dark:border-white/15 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 py-3 font-sans">
              Select/Drag any element on floorplan to configure or verify Vastu.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
