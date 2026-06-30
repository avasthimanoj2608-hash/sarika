/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DesignStyle, DesignReport } from "./types";
import dataJson from "./data.json";

export interface StyleDetails {
  name: DesignStyle;
  tagline: string;
  description: string;
  keyElements: string[];
  colors: { name: string; hex: string }[];
  idealLighting: string;
  recommendedDecor: string[];
}

export interface VastuCompassDirection {
  direction: string;
  angle: number;
  element: string;
  lord: string;
  positiveRooms: string[];
  tips: string[];
}

export const STYLE_GUIDES = dataJson.STYLE_GUIDES as Record<DesignStyle, StyleDetails>;
export const VASTU_COMPASS_DATA = dataJson.VASTU_COMPASS_DATA as VastuCompassDirection[];
export const TEMPLATE_ROOMS = dataJson.TEMPLATE_ROOMS as unknown as DesignReport[];
