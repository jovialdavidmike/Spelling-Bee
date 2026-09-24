import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Audio cache for spoken words/prompts
const audioCache = new Map<string, { audioBase64: string; mimeType: string }>();

// Helper to convert 16-bit 24kHz Mono PCM to standard playable WAV buffer
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  const dataSize = pcmBuffer.length;
  const fileSize = dataSize + 36;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // AudioFormat PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString()
  });
});

// Gemini TTS API Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', style } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    const cleanText = text.trim();
    if (!cleanText) {
      return res.status(400).json({ error: 'Text parameter cannot be empty' });
    }

    const cacheKey = `${voiceName}:${cleanText}`;
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      return res.json({
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        cached: true,
        source: 'cache'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not set on the server. Falling back to local synthesizer.',
        fallback: true
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const promptStyle = style || 'Clear, deliberate, authoritative and dignified spelling bee moderator with pristine British English pronunciation';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: promptStyle
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const candidate = response.candidates?.[0]?.content?.parts?.[0];
    const rawData = candidate?.inlineData?.data;

    if (!rawData) {
      return res.status(502).json({
        error: 'No audio returned from Gemini model',
        fallback: true
      });
    }

    // Convert raw PCM to WAV
    const rawPcm = Buffer.from(rawData, 'base64');
    const wavBuffer = pcmToWav(rawPcm, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString('base64');

    audioCache.set(cacheKey, { audioBase64: wavBase64, mimeType: 'audio/wav' });

    return res.json({
      audioBase64: wavBase64,
      mimeType: 'audio/wav',
      voiceName,
      source: 'gemini-3.8-flash-lite-tts'
    });
  } catch (err: any) {
    console.error('Error generating Gemini TTS:', err?.message || err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate Gemini voice',
      fallback: true
    });
  }
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpellReady server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
