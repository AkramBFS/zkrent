import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const tsxCli = resolve(rootDir, 'node_modules/tsx/dist/cli.mjs');

const suites = [
  {
    name: 'OCR & Income Parser Tests',
    path: resolve(rootDir, 'scripts/test-ocr-parser.ts'),
  },
  {
    name: 'Midnight Smart Contract & Prover Integration Tests',
    path: resolve(rootDir, 'scripts/test-midnight-prover.ts'),
  },
];

console.log('==============================================================');
console.log('  ZkRent Automated Test Runner');
console.log('==============================================================');

let hasFailures = false;

for (const suite of suites) {
  console.log(`\n▶ Running: ${suite.name}`);
  console.log(`  Target: ${suite.path}\n`);

  const result = spawnSync(process.execPath, [tsxCli, suite.path], {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  if (result.status !== 0) {
    hasFailures = true;
    console.error(`\n❌ FAILED: ${suite.name} (exit code: ${result.status})`);
    break;
  }
}

if (hasFailures) {
  console.error('\n❌ Test run failed.');
  process.exit(1);
} else {
  console.log('\n==============================================================');
  console.log('✅ ALL TEST SUITES PASSED SUCCESSFULLY');
  console.log('==============================================================\n');
  process.exit(0);
}
