import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = args => {
  try { return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return 'unavailable'; }
};
const component = readFileSync(new URL('../src/apps/knowledge/components/MultipleChoiceCard.tsx', import.meta.url), 'utf8');
console.log('[build] Anne build diagnostics v1');
console.log(`[build] Git commit: ${git(['rev-parse', 'HEAD'])}`);
console.log(`[build] Git branch: ${git(['rev-parse', '--abbrev-ref', 'HEAD'])}`);
console.log(`[build] MultipleChoiceCard SHA-256: ${createHash('sha256').update(component).digest('hex')}`);
console.log(`[build] MultipleChoiceCard final line: ${component.trimEnd().split('\n').at(-1)}`);
