/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomType =
  | "Living Room"
  | "Bedroom"
  | "Kitchen"
  | "Bathroom"
  | "Office"
  | "Café"
  | "Restaurant"
  | "Shop & Retail"
  | "Salon & Spa"
  | "Hotel Room"
  | "Clinic"
  | "Studio"
  | "Other";

export type DesignStyle =
  | "Modern"
  | "Minimalist"
  | "Luxury"
  | "Contemporary"
  | "Scandinavian"
  | "Industrial"
  | "Traditional"
  | "Bohemian"
  | "Rustic"
  | "Classic"
  | "Japanese"
  | "Mediterranean";

export type BudgetLevel = "Low" | "Medium" | "Premium" | "Luxury";

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  primaryName: string;
  secondaryName: string;
  accentName: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  dimensions: string;
  material: string;
  estimatedCost: number;
  reason: string;
  vastuZone: string;
  // Position for visualization
  x?: number; // 0 to 100 relative
  y?: number; // 0 to 100 relative
  rotation?: number; // degrees
}

export interface LightingFixture {
  type: "Ambient" | "Task" | "Accent";
  name: string;
  placement: string;
  purpose: string;
  estimatedCost: number;
}

export interface DecorItem {
  type: string;
  name: string;
  placement: string;
  visualAppeal: string;
  estimatedCost: number;
}

export interface VastuRecommendation {
  element: string;
  idealDirection: string;
  placementDetail: string;
  benefit: string;
  priority: "High" | "Medium" | "Optional";
}

export interface DesignReport {
  id: string;
  createdAt: string;
  roomName: string;
  roomType: RoomType;
  style: DesignStyle;
  budget: BudgetLevel;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "ft" | "m";
  };
  palette: ColorPalette;
  furniture: FurnitureItem[];
  lighting: LightingFixture[];
  decor: DecorItem[];
  vastu: VastuRecommendation[];
  spaceOptimizationTips: string[];
  totalEstimatedCost: number;
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
}
