import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

try {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...vals] = trimmed.split('=');
        if (key && vals.length > 0) {
          const val = vals.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = val;
        }
      }
    });
  }
} catch (e) {
  // ignore
}

const apiKey = process.env.GEMINI_API_KEY || '';

console.log('=======================================================');
console.log('  LegalLens AI — Single Live Gemini 3.6 Flash Probe');
console.log('=======================================================');
console.log('API Key detected:', apiKey ? `${apiKey.substring(0, 10)}... (length ${apiKey.length})` : 'NONE');
console.log('Timestamp:', new Date().toISOString());
console.log('=======================================================\n');

const ai = new GoogleGenAI({ apiKey });

async function probeSingle() {
  const start = Date.now();
  console.log('>>> Sending 1 targeted live prompt to model: "gemini-3.6-flash"...');
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Analyze this clause: "Employee agrees not to compete for 12 months within 50 miles of company office." Return JSON with keys: title, severity_level ("green"|"yellow"|"orange"|"red"), finding_kind, plain_explanation, verbatim_quote.',
    });
    const duration = Date.now() - start;
    console.log(`\n[STATUS: SUCCESS 🟢] Wall-Clock Duration: ${duration}ms`);
    console.log(`[RAW LIVE GEMINI 3.6 FLASH OUTPUT]:\n${res.text}\n`);
    if (res.usageMetadata) {
      console.log(`[USAGE METADATA]:`, JSON.stringify(res.usageMetadata, null, 2));
    }
  } catch (err: any) {
    const duration = Date.now() - start;
    console.log(`\n[STATUS: ERROR 🔴] Wall-Clock Duration: ${duration}ms`);
    console.log(`[ERROR MESSAGE]: ${err.message}`);
    if (err.status) console.log(`[HTTP STATUS]: ${err.status}`);
  }
}

probeSingle();


