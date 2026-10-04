import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const packArg = process.argv.find(value => value.startsWith('--pack='));
const packPath = packArg ? new URL('../' + packArg.slice(7), import.meta.url) : new URL('../cards/pathways/java_foundations_1_2.json', import.meta.url);
const pack = JSON.parse(readFileSync(packPath, 'utf8'));
const javaHome = process.env.JAVA_HOME;
const javac = javaHome ? join(javaHome, 'bin/javac') : 'javac';
const java = javaHome ? join(javaHome, 'bin/java') : 'java';
const baselineArg = process.argv.find(value => value.startsWith('--baseline-release='));
const release = baselineArg ? Number(baselineArg.split('=')[1]) : pack.java_release;
if (!Number.isInteger(release) || release < 21 || release > pack.java_release) throw new Error('Use a baseline release between 21 and the pack target release.');
const directory = mkdtempSync(join(tmpdir(), 'anne-java-foundations-'));
const checks = pack.topics.flatMap(topic => topic.concepts.flatMap(concept =>
  concept.cards.map(card => ({ key: `${topic.key}/${concept.key}/${card.key}`, ...card.verification }))));
const failures = [];
const run = (command, args) => spawnSync(command, args, { encoding: 'utf8', timeout: 15000 });

try {
  const sources = [];
  checks.forEach((check, index) => {
    check.className = `FoundationCheck${index}`;
    check.sourcePath = join(directory, `${check.className}.java`);
    writeFileSync(check.sourcePath, `public class ${check.className} { public static void main(String[] args) throws Exception {\n${check.code}\n} }\n`);
    if (check.kind !== 'compile_error') sources.push(check.sourcePath);
  });
  const version = run(javac, ['-version']);
  const installedRelease = Number(`${version.stdout}${version.stderr}`.match(/javac (\d+)/)?.[1]);
  if (!installedRelease || installedRelease < release) {
    throw new Error(`JDK ${release}+ is required for this check; available javac reports ${installedRelease || 'unknown'}. Set JAVA_HOME to JDK ${release}. --baseline-release=21 can check established examples on an older JDK, but does not verify Java ${pack.java_release}.`);
  }
  const compilation = run(javac, ['--release', String(release), '-d', directory, ...sources]);
  if (compilation.error || compilation.status !== 0) throw new Error(`Valid snippets failed compilation: ${compilation.error?.message ?? compilation.stderr}`);
  for (const check of checks) {
    if (check.kind === 'compile_error') {
      const output = join(directory, check.className);
      mkdirSync(output);
      const result = run(javac, ['--release', String(release), '-d', output, check.sourcePath]);
      if (result.error || result.status === 0 || !result.stderr.includes(check.expected)) {
        failures.push(`${check.key}: expected compiler error '${check.expected}', got ${result.error?.message ?? result.stderr}`);
      }
    } else {
      const result = run(java, ['-cp', directory, check.className]);
      const matches = check.kind === 'output'
        ? result.status === 0 && result.stdout === check.expected
        : result.status !== 0 && result.stderr.includes(`java.lang.${check.expected}`);
      if (result.error || !matches) failures.push(`${check.key}: expected ${check.kind} ${JSON.stringify(check.expected)}, got status ${result.status}: ${result.stdout}${result.stderr}`);
    }
  }
  if (failures.length) throw new Error(failures.join('\n'));
  console.log(`Verified all ${checks.length} authored Java snippets with --release ${release}: outputs, compilation errors and runtime exceptions match.`);
  if (release !== pack.java_release) console.log(`Baseline verification only; the pack targets Java ${pack.java_release}, which still needs its own compiler/runtime check.`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
