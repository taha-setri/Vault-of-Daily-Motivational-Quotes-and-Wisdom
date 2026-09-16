import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Convert 16-bit Linear PCM to standard RIFF/WAV Buffer
function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // 16 for PCM format chunk
  header.writeUInt16LE(1, 20); // 1 for PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Quote Text-To-Speech Endpoint (Strictly Male Voice, supports Arabic & English)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, author, voice = "Charon", lang = "ar" } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      // Strictly enforce male voices: Charon (deep wise male), Fenrir (firm resonant male), Puck (clear male)
      const allowedMaleVoices = ["Charon", "Fenrir", "Puck"];
      const selectedVoice = allowedMaleVoices.includes(voice) ? voice : "Charon";

      const cleanText = text.trim();

      // 1. Gemini High-Fidelity Male TTS
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGeminiClient();
          const ttsPrompt =
            lang === "en"
              ? `Read aloud in an articulate, dignified, deep, and resonant male voice with a calm, contemplative cadence: "${cleanText}"${author ? ` — by ${author}` : ""}`
              : `اقرأ بصوت رجل فصيح، وقور، عميق وهادئ بنبرة حكيمة وبلاغة عربية تامة: ${cleanText}${author ? `. قاله ${author}` : ""}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [
              {
                parts: [
                  {
                    text: ttsPrompt,
                  },
                ],
              },
            ],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: selectedVoice },
                },
              },
            },
          });

          const part = response.candidates?.[0]?.content?.parts?.[0];
          const base64Data = part?.inlineData?.data;

          if (base64Data) {
            const rawPcm = Buffer.from(base64Data, "base64");
            const wavBuffer = pcmToWav(rawPcm, 24000, 1, 16);
            const audioUrl = `data:audio/wav;base64,${wavBuffer.toString("base64")}`;
            return res.json({
              audioUrl,
              source: "gemini",
              voice: selectedVoice,
              speakerGender: "male",
              lang,
            });
          }
        } catch (geminiErr: any) {
          console.warn("Gemini Male TTS warning:", geminiErr?.message || geminiErr);
        }
      }

      // If Gemini TTS is not available, delegate to browser male-tuned speech synthesis
      return res.status(503).json({
        error: "Male voice generator temporarily unavailable on server",
        fallbackToBrowser: true,
        lang,
      });
    } catch (err: any) {
      console.error("Server /api/tts error:", err);
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
