/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const isCloudRun = !!process.env.K_SERVICE;
const PORT = isCloudRun ? 3000 : (process.env.PORT || 3000);

app.use(express.json({ limit: "15mb" }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set. AI features will run in mock mode.");
}

// Helper to check and retrieve Gemini Client
function getAi(): GoogleGenAI {
  if (!aiClient) {
    throw new Error("GEMINI_API_KEY is not configured on the server. Please add it via the Settings > Secrets menu.");
  }
  return aiClient;
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: !!aiClient });
});

// 2. Room Designer Endpoint (Returns structured JSON)
app.post("/api/ai/design", async (req, res) => {
  try {
    const { roomType, style, budget, dimensions, purpose } = req.body;
    
    if (!roomType || !style || !budget || !dimensions) {
      return res.status(400).json({ error: "Missing required fields for room design." });
    }

    const length = parseFloat(dimensions.length) || 12;
    const width = parseFloat(dimensions.width) || 10;
    const height = parseFloat(dimensions.height) || 9;
    const unit = dimensions.unit || "ft";

    const prompt = `
      Perform a complete professional interior design suggestion for a ${roomType} using the "${style}" style under a "${budget}" budget.
      The room dimensions are: Length: ${length} ${unit}, Width: ${width} ${unit}, Height: ${height} ${unit}.
      ${purpose ? `User specified purpose/notes: "${purpose}"` : ""}

      Provide:
      1. A custom room name (e.g. "Serene Nordic Sanctuary" or "Industrial Loft Lounge").
      2. A cohesive color palette containing exactly 3 colors: primary, secondary, and accent with hex codes and elegant descriptive names.
      3. A list of 4 to 6 specific furniture items. For each item provide:
         - A unique ID
         - Furniture name (e.g., "Minimalist Ash-Wood Sofa")
         - Recommended dimensions
         - Premium material (e.g., "Full-Grain Italian Leather", "Solid White Oak")
         - Estimated cost (integer in USD, keeping total cost in line with the selected budget: Low=<$1500, Medium=$1500-$5000, Premium=$5000-$15000, Luxury=$15000+)
         - A clear, thoughtful reason why this fits the style and size
         - Ideal Vastu zone (e.g. South-West, East, North, North-West, South-East, West)
         - 2D Canvas layout coordinates: x (number between 15 and 85, representing horizontal offset percentage) and y (number between 15 and 85, representing vertical offset percentage).
         - Rotation (0, 90, 180, or 270)
      4. A list of 2 to 3 lighting fixtures (Ambient, Task, Accent) with names, placements, purposes, and estimated costs.
      5. A list of 3 to 4 decor suggestions (Paintings, sculptures, rugs, lamps, etc.) with names, placements, and visual appeal reasons.
      6. A list of 3 Vastu-based placement recommendations matching this room type (e.g. Ideal location for entry, bed, sofa, desk, mirrors, cash counters, plants, water features etc.), why it is beneficial, and priority level.
      7. A list of 3 to 4 custom space optimization tips.
      8. A calculated total estimated budget sum.
    `;

    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roomName: { type: Type.STRING },
            palette: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING, description: "Hex color code starting with #" },
                secondary: { type: Type.STRING, description: "Hex color code starting with #" },
                accent: { type: Type.STRING, description: "Hex color code starting with #" },
                primaryName: { type: Type.STRING },
                secondaryName: { type: Type.STRING },
                accentName: { type: Type.STRING }
              },
              required: ["primary", "secondary", "accent", "primaryName", "secondaryName", "accentName"]
            },
            furniture: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  dimensions: { type: Type.STRING },
                  material: { type: Type.STRING },
                  estimatedCost: { type: Type.INTEGER },
                  reason: { type: Type.STRING },
                  vastuZone: { type: Type.STRING },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  rotation: { type: Type.INTEGER }
                },
                required: ["id", "name", "dimensions", "material", "estimatedCost", "reason", "vastuZone", "x", "y", "rotation"]
              }
            },
            lighting: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Must be exactly Ambient, Task, or Accent" },
                  name: { type: Type.STRING },
                  placement: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  estimatedCost: { type: Type.INTEGER }
                },
                required: ["type", "name", "placement", "purpose", "estimatedCost"]
              }
            },
            decor: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  name: { type: Type.STRING },
                  placement: { type: Type.STRING },
                  visualAppeal: { type: Type.STRING },
                  estimatedCost: { type: Type.INTEGER }
                },
                required: ["type", "name", "placement", "visualAppeal", "estimatedCost"]
              }
            },
            vastu: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  element: { type: Type.STRING },
                  idealDirection: { type: Type.STRING },
                  placementDetail: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                  priority: { type: Type.STRING, description: "High, Medium, or Optional" }
                },
                required: ["element", "idealDirection", "placementDetail", "benefit", "priority"]
              }
            },
            spaceOptimizationTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            totalEstimatedCost: { type: Type.INTEGER }
          },
          required: ["roomName", "palette", "furniture", "lighting", "decor", "vastu", "spaceOptimizationTips", "totalEstimatedCost"]
        }
      }
    });

    const reportText = response.text;
    if (!reportText) {
      throw new Error("No design suggestion returned by Gemini.");
    }

    const designReport = JSON.parse(reportText.trim());
    return res.json(designReport);

  } catch (error: any) {
    console.error("AI Design Error:", error);
    return res.status(500).json({
      error: "Failed to generate design recommendations.",
      details: error.message
    });
  }
});

// 3. AI Chat Assistant Endpoint (Preserves chat messages context)
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getAi();
    
    // Convert history into standard system and chat format
    const systemInstruction = `
      You are "Sarika's Elite AI Interior Designer & Vastu Consultant".
      Your goal is to answer interior design, space planning, lighting, remodeling, showpiece decor, and Vastu Shastra questions.
      Always maintain a highly professional, luxurious, informative, yet warm tone.
      Provide detailed advice, including specific materials, furniture layouts, color pairings, and Vastu justifications.
      Use bullet points and clean structure so your responses look beautiful. Keep answers structured and elegant.
    `;

    // Map history to standard contents structure if provided
    const chatHistory = history ? history.map((h: any) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    })) : [];

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: chatHistory,
      config: {
        systemInstruction
      }
    });

    const response = await chat.sendMessage({ message });
    return res.json({ text: response.text });

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      error: "Failed to process chat message.",
      details: error.message
    });
  }
});

// 4. Image-based Redesign Endpoint
app.post("/api/ai/redesign-image", async (req, res) => {
  try {
    const { imageBase64, mimeType, style, budget, roomType } = req.body;
    
    if (!imageBase64 || !style || !budget || !roomType) {
      return res.status(400).json({ error: "Missing required fields for image redesign." });
    }

    const ai = getAi();

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64
      }
    };

    const textPart = {
      text: `
        Analyze this uploaded photograph of a room, which the user identified as a "${roomType}".
        The user wants to redesign it into the "${style}" style under a "${budget}" budget.
        
        Analyze:
        1. Current state: outline what you see (lighting, clutter level, wall color, structural items like windows/pillars).
        2. Dimensions assessment: estimate the width, length, and height based on perspective.
        3. A comprehensive redesign plan containing:
           - Redesigned room name
           - New color palette (primary, secondary, accent with hex values)
           - Furniture changes: what should be replaced, what can be kept, and placement
           - Lighting upgrades (ambient, task, accent)
           - Vastu corrections based on what is currently situated
           - Decor recommendations
           - Space optimization hacks
           - Total estimate
        
        Respond with structured JSON matching the prompt format of a design plan.
      `
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roomName: { type: Type.STRING },
            analysisOfOriginal: { type: Type.STRING, description: "Detailed structural analysis of the original uploaded photo." },
            palette: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING, description: "Hex color code starting with #" },
                secondary: { type: Type.STRING, description: "Hex color code starting with #" },
                accent: { type: Type.STRING, description: "Hex color code starting with #" },
                primaryName: { type: Type.STRING },
                secondaryName: { type: Type.STRING },
                accentName: { type: Type.STRING }
              },
              required: ["primary", "secondary", "accent", "primaryName", "secondaryName", "accentName"]
            },
            furniture: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  dimensions: { type: Type.STRING },
                  material: { type: Type.STRING },
                  estimatedCost: { type: Type.INTEGER },
                  reason: { type: Type.STRING },
                  vastuZone: { type: Type.STRING },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  rotation: { type: Type.INTEGER }
                },
                required: ["id", "name", "dimensions", "material", "estimatedCost", "reason", "vastuZone", "x", "y", "rotation"]
              }
            },
            lighting: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Must be Ambient, Task, or Accent" },
                  name: { type: Type.STRING },
                  placement: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  estimatedCost: { type: Type.INTEGER }
                },
                required: ["type", "name", "placement", "purpose", "estimatedCost"]
              }
            },
            decor: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  name: { type: Type.STRING },
                  placement: { type: Type.STRING },
                  visualAppeal: { type: Type.STRING },
                  estimatedCost: { type: Type.INTEGER }
                },
                required: ["type", "name", "placement", "visualAppeal", "estimatedCost"]
              }
            },
            vastu: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  element: { type: Type.STRING },
                  idealDirection: { type: Type.STRING },
                  placementDetail: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                  priority: { type: Type.STRING, description: "High, Medium, or Optional" }
                },
                required: ["element", "idealDirection", "placementDetail", "benefit", "priority"]
              }
            },
            spaceOptimizationTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            totalEstimatedCost: { type: Type.INTEGER }
          },
          required: ["roomName", "analysisOfOriginal", "palette", "furniture", "lighting", "decor", "vastu", "spaceOptimizationTips", "totalEstimatedCost"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No redesign report generated.");
    }

    const designReport = JSON.parse(resultText.trim());

    // Try to generate an image using gemini-2.5-flash-image
    // We wrap in a try-catch to keep it robust if client keys don't support or error out
    let generatedImageUrl = "";
    try {
      const imgPrompt = `A professionally photographed, interior designed ${style} styled ${roomType} space, colored with ${designReport.palette.primaryName} and ${designReport.palette.secondaryName} and accented with ${designReport.palette.accentName}. Luxury rendering, 8k, realistic lighting, spacious, Vastu-compliant architecture.`;
      
      const imgRes = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: imgPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      if (imgRes.candidates?.[0]?.content?.parts) {
        for (const part of imgRes.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (imgErr) {
      console.warn("AI Image generation skipped or errored (expected for standard/unpaid keys). Fallback used.", imgErr);
    }

    return res.json({
      ...designReport,
      imageUrl: generatedImageUrl || undefined
    });

  } catch (error: any) {
    console.error("AI Redesign Error:", error);
    return res.status(500).json({
      error: "Failed to analyze and redesign image.",
      details: error.message
    });
  }
});

// Serve static assets or compile Vite in Dev
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets...");
    // Robustly determine the dist folder location relative to __dirname (when compiled/bundled)
    // or falling back to process.cwd() as a safety measure.
    let distPath = path.join(process.cwd(), "dist");
    if (typeof __dirname !== "undefined") {
      if (path.basename(__dirname) === "dist") {
        distPath = __dirname;
      } else {
        distPath = path.join(__dirname, "dist");
      }
    }
    console.log(`Resolved production assets path: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const isNumericPort = !isNaN(Number(PORT));
  if (isNumericPort) {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Express Server running on port ${PORT}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(`Express Server running on UNIX socket/pipe: ${PORT}`);
    });
  }
}

startServer();
