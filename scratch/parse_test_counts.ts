import fs from 'fs';

const logPath = 'C:\\Users\\deves\\.gemini\\antigravity\\brain\\944c6c65-8f60-4b27-a12e-97449c475753\\.system_generated\\tasks\\task-9135.log';
const content = fs.readFileSync(logPath, 'utf8');

const lines = content.split('\n');
const fileResults: { file: string; count: number }[] = [];
let total = 0;

for (const line of lines) {
  const match = line.match(/(src\/[^\s]+\.test\.[tsx]+)\s+\((\d+)\s+tests\)/);
  if (match) {
    const file = match[1];
    const count = parseInt(match[2], 10);
    fileResults.push({ file, count });
    total += count;
  }
}

console.log('--- INDIVIDUAL TEST FILE COUNTS ---');
fileResults.forEach(r => console.log(`${r.file}: ${r.count}`));
console.log('-----------------------------------');
console.log(`SUM OF INDIVIDUAL FILE COUNTS: ${total}`);
console.log(`TOTAL FILES COUNTED: ${fileResults.length}`);
