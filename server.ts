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

// Quota exhaustion circuit-breaker state
let quotaCooldownUntil = 0;
let quotaReason = '';

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
  const isCoolingDown = Date.now() < quotaCooldownUntil;
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    geminiQuotaCooldown: isCoolingDown,
    retryAfterSeconds: isCoolingDown ? Math.max(0, Math.ceil((quotaCooldownUntil - Date.now()) / 1000)) : 0,
    time: new Date().toISOString()
  });
});

// Gemini TTS API Endpoint with automatic quota cooldown and fallback
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

    // Check circuit-breaker: if quota limit was hit previously, immediately return fallback
    const now = Date.now();
    if (now < quotaCooldownUntil) {
      const remainingSec = Math.max(1, Math.ceil((quotaCooldownUntil - now) / 1000));
      return res.json({
        fallback: true,
        source: 'browser-speech-fallback',
        retryAfterSeconds: remainingSec,
        message: quotaReason || 'Gemini TTS daily quota reached. Falling back to browser speech.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        fallback: true,
        source: 'browser-speech-fallback',
        message: 'GEMINI_API_KEY is not configured on the server. Using browser speech.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const promptStyle = style || 'Clear, deliberate, authoritative and dignified spelling bee moderator with pristine British English pronunciation';

    // Helper to generate audio from a specified TTS model
    const generateWithModel = async (modelName: string) => {
      return await ai.models.generateContent({
        model: modelName,
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
    };

    let response: any = null;
    let usedModel = 'gemini-3.8-flash-lite-tts';

    try {
      response = await generateWithModel('gemini-3.8-flash-lite-tts');
    } catch (liteErr: any) {
      const isLiteQuota = liteErr?.status === 'RESOURCE_EXHAUSTED' ||
        liteErr?.status === 429 ||
        String(liteErr?.message || '').includes('429') ||
        String(liteErr?.message || '').includes('Quota exceeded') ||
        String(liteErr?.message || '').includes('RESOURCE_EXHAUSTED');

      if (isLiteQuota) {
        // Try fallback to standard flash-tts model
        try {
          usedModel = 'gemini-3.8-flash-tts';
          response = await generateWithModel('gemini-3.8-flash-tts');
        } catch (flashErr: any) {
          // Both models hit quota or error
          throw flashErr || liteErr;
        }
      } else {
        throw liteErr;
      }
    }

    const candidate = response?.candidates?.[0]?.content?.parts?.[0];
    const rawData = candidate?.inlineData?.data;

    if (!rawData) {
      return res.json({
        fallback: true,
        source: 'browser-speech-fallback',
        message: 'No audio returned from Gemini model. Using browser speech.'
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
      source: usedModel
    });
  } catch (err: any) {
    const isQuota = err?.status === 'RESOURCE_EXHAUSTED' ||
      err?.status === 429 ||
      String(err?.message || '').includes('429') ||
      String(err?.message || '').includes('Quota exceeded') ||
      String(err?.message || '').includes('RESOURCE_EXHAUSTED');

    if (isQuota) {
      let cooldownSeconds = 60;
      const retryInfo = err?.details?.find((d: any) => d?.['@type']?.includes('RetryInfo'));
      if (retryInfo?.retryDelay) {
        const match = String(retryInfo.retryDelay).match(/(\d+)/);
        if (match) {
          cooldownSeconds = parseInt(match[1], 10) + 2;
        }
      }
      quotaCooldownUntil = Date.now() + (cooldownSeconds * 1000);
      quotaReason = `Gemini TTS free tier quota exceeded (${cooldownSeconds}s cooldown).`;
      console.warn(`[Gemini TTS] Quota exceeded. Seamlessly activating browser speech fallback for ${cooldownSeconds}s.`);

      return res.json({
        fallback: true,
        source: 'browser-speech-fallback',
        retryAfterSeconds: cooldownSeconds,
        message: quotaReason
      });
    }

    console.warn('[Gemini TTS] Speech request could not be processed, using browser speech fallback:', err?.message || err);
    return res.json({
      fallback: true,
      source: 'browser-speech-fallback',
      message: err?.message || 'Voice generation unavailable, browser speech synthesis active'
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
