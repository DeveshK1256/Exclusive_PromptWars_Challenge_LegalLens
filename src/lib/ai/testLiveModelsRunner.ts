import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually without external dependency
try {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    envContent.split('\n').forEach(line => {
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

console.log('====================================================');
console.log('  LegalLens AI Live Gemini Model Diagnostics');
console.log('====================================================');
console.log('GEMINI_API_KEY present:', Boolean(apiKey && apiKey !== 'dummy_gemini_key'));
if (apiKey) {
  console.log('API Key prefix:', apiKey.substring(0, 8) + '...');
} else {
  console.log('WARNING: GEMINI_API_KEY is not set in environment or .env.local.');
}

const ai = new GoogleGenAI({ apiKey });

async function runLiveDiagnostics() {
  console.log('\n--- DIAGNOSTIC 1: List Models API Endpoint ---');
  try {
    const modelsResponse = await ai.models.list({});
    const modelsList: any[] = [];
    for await (const m of modelsResponse) {
      modelsList.push({
        name: m.name,
        displayName: (m as any).displayName,
        supportedGenerationMethods: (m as any).supportedGenerationMethods,
      });
    }
    console.log(`Found ${modelsList.length} models accessible via API Key:`);
    console.log(JSON.stringify(modelsList, null, 2));
  } catch (err: any) {
    console.error('List Models Failed:', err?.message || err);
    if (err?.status) console.error('Status:', err.status);
    if (err?.errorDetails) console.error('Details:', JSON.stringify(err.errorDetails));
  }

  console.log('\n--- DIAGNOSTIC 2: Probe text-embedding-004 ---');
  try {
    const embed004 = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: 'LegalLens AI probe embedding test',
    });
    console.log('text-embedding-004 RAW RESPONSE:');
    console.log(JSON.stringify(embed004, null, 2).substring(0, 500));
  } catch (err: any) {
    console.error('text-embedding-004 RAW ERROR:');
    console.error(err?.message || err);
    if (err?.status) console.error('Status:', err.status);
    if (err?.errorDetails) console.error('Details:', JSON.stringify(err.errorDetails));
  }

  console.log('\n--- DIAGNOSTIC 3: Probe gemini-embedding-001 ---');
  try {
    const embed001 = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: 'LegalLens AI probe embedding test',
    });
    console.log('gemini-embedding-001 RAW RESPONSE:');
    console.log(JSON.stringify(embed001, null, 2).substring(0, 500));
  } catch (err: any) {
    console.error('gemini-embedding-001 RAW ERROR:');
    console.error(err?.message || err);
    if (err?.status) console.error('Status:', err.status);
    if (err?.errorDetails) console.error('Details:', JSON.stringify(err.errorDetails));
  }

  console.log('\n--- DIAGNOSTIC 4: Probe gemini-3.1-pro-preview ---');
  try {
    const gen31pro = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: 'Respond with: "gemini-3.1-pro-preview is active"',
    });
    console.log('gemini-3.1-pro-preview SUCCESS text output:');
    console.log(gen31pro.text);
  } catch (err: any) {
    console.error('gemini-3.1-pro-preview RAW ERROR:');
    console.error(err?.message || err);
    if (err?.status) console.error('Status:', err.status);
    if (err?.errorDetails) console.error('Details:', JSON.stringify(err.errorDetails));
  }

  console.log('\n--- DIAGNOSTIC 5: Probe gemini-3.6-flash ---');
  try {
    const gen36flash = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Respond with: "gemini-3.6-flash is active"',
    });
    console.log('gemini-3.6-flash SUCCESS text output:');
    console.log(gen36flash.text);
  } catch (err: any) {
    console.error('gemini-3.6-flash RAW ERROR:');
    console.error(err?.message || err);
    if (err?.status) console.error('Status:', err.status);
  }

  console.log('\n--- DIAGNOSTIC 6: Probe gemini-1.5-pro ---');
  try {
    const gen15pro = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: 'Respond with: "gemini-1.5-pro is active"',
    });
    console.log('gemini-1.5-pro RAW RESPONSE text:');
    console.log(gen15pro.text);
  } catch (err: any) {
    console.error('gemini-1.5-pro RAW ERROR:');
    console.error(err?.message || err);
    if (err?.status) console.error('Status:', err.status);
  }

  console.log('\n--- DIAGNOSTIC 7: Probe text-embedding-004 alternative endpoint / gemini-2.0-flash ---');
  try {
    const gen20flash = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Respond with: "gemini-2.0-flash is active"',
    });
    console.log('gemini-2.0-flash RAW RESPONSE text:');
    console.log(gen20flash.text);
  } catch (err: any) {
    console.error('gemini-2.0-flash RAW ERROR:');
    console.error(err?.message || err);
  }
}

runLiveDiagnostics().catch(console.error);
