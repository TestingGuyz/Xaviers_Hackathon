// ============================================================
// POST /api/tts — ElevenLabs Text-to-Speech
// ============================================================
import { NextResponse } from 'next/server';
import { ElevenLabsClient } from 'elevenlabs';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      // Fallback: return error so client falls back to Web Speech
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || '9BWtsMINqrJLrRacOk9x';

    const client = new ElevenLabsClient({ apiKey });

    const audioStream = await client.textToSpeech.convert(voiceId, {
      text: text.slice(0, 500),
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.7,
        style: 0.5,
        use_speaker_boost: true,
      },
    });

    // Collect the stream into a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('TTS error:', error?.statusCode || error?.message || error);
    // Return JSON error so client falls back to browser Web Speech
    return NextResponse.json({ error: 'TTS failed', details: error?.statusCode === 401 ? 'Invalid ElevenLabs API key — update ELEVENLABS_API_KEY in .env.local' : 'Unknown error' }, { status: 500 });
  }
}
