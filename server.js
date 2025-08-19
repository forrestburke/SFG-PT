import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message, model } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const response = await openai.chat.completions.create({
      model: model || "gpt-5",
      messages: [{ role: "user", content: message }],
    });
    const reply = response.choices[0].message.content;
    res.json({ reply, usage: response.usage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Image generation endpoint
app.post("/image", async (req, res) => {
  const { prompt, size } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: size || "1024x1024",
      n: 1
    });

    const imageUrl = response.data[0].url;
    res.json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`SFG-PT running at http://localhost:${port}`);
});
