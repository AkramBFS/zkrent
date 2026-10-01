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
    name: 'Midnight Contract Circuits Security & Functional Suite (T1 - T8)',
    path: resolve(rootDir, 'scripts/test-contract-circuits.ts'),
  },
  {
    name: 'Midnight Smart Contract & Prover Integration Tests',
    path: resolve(rootDir, 'scripts/test-midnight-prover.ts'),
  },
  {
    name: 'Phase 4 Lifecycle, Storage & Security Suite',
    path: resolve(rootDir, 'scripts/test-phase4-lifecycle.ts'),
  },
  {
    name: 'Canonical State Machine & Illegal Transition Tests',
    path: resolve(rootDir, 'scripts/test-lifecycle-machine.ts'),
  },
  {
    name: 'Server Proof Verification & Anti-Forgery Tests',
    path: resolve(rootDir, 'scripts/test-proof-verification.ts'),
  },
  {
    name: 'Sharp Image Metadata & EXIF Stripping Tests',
    path: resolve(rootDir, 'scripts/test-image-metadata.ts'),
  },
  {
    name: 'Stripe Webhook Deduplication & Refund Semantics Tests',
    path: resolve(rootDir, 'scripts/test-stripe-webhook-dedupe.ts'),
  },
  {
    name: 'MinIO & S3 Storage Compatibility Tests',
    path: resolve(rootDir, 'scripts/test-storage-minio-s3.ts'),
  },
  {
    name: 'Rate Limiting & Lease Consumption Tests',
    path: resolve(rootDir, 'scripts/test-security-rate-limit.ts'),
  },
  {
    name: 'Explicit Privacy Regression & Anti-Leakage Suite',
    path: resolve(rootDir, 'scripts/test-privacy-regression.ts'),
  },
  {
    name: 'End-to-End Persona Journeys & Multi-Role Integration Suite',
    path: resolve(rootDir, 'scripts/test-e2e-journey.ts'),
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
