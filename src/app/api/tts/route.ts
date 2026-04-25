// ============================================================
// POST /api/tts — ElevenLabs Text-to-Speech
// ============================================================
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'fUDKSLKYXTValLvoatWr';

    console.log('[TTS] Using key:', apiKey ? apiKey.slice(0, 8) + '...' : 'MISSING');
    console.log('[TTS] Using voice:', voiceId);

    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text.slice(0, 500),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('[TTS] ElevenLabs error:', response.status, errText);
      return NextResponse.json({ error: 'TTS failed', status: response.status, detail: errText }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('[TTS] Error:', error?.message || error);
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
  }
}
