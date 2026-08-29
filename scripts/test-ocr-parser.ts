/**
 * Unit tests for src/lib/ocr/income-parser.ts
 *
 * Run with:  npx tsx scripts/test-ocr-parser.ts
 */

import { extractIncome, parseMonetaryValue } from '../src/lib/ocr/income-parser';

// ── Helpers ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✕ FAIL: ${message}`);
  }
}

function assertAmount(actual: number | null | undefined, expected: number, label: string) {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ ${label}: ${actual}`);
  } else {
    failed++;
    console.error(`  ✕ FAIL: ${label}: expected ${expected}, got ${actual}`);
  }
}

// ── Test Suite: parseMonetaryValue ───────────────────────────────────────

console.log('\n═══ parseMonetaryValue ═══\n');

assertAmount(parseMonetaryValue('40,778.09'), 40778.09, 'US format');
assertAmount(parseMonetaryValue('40.778,09'), 40778.09, 'EU format');
assertAmount(parseMonetaryValue('40778.09'), 40778.09, 'Raw decimal');
assertAmount(parseMonetaryValue('40778,09'), 40778.09, 'Raw comma decimal');
assertAmount(parseMonetaryValue('40778'), 40778, 'Integer');
assertAmount(parseMonetaryValue('1,234,567.89'), 1234567.89, 'Large US format');
assertAmount(parseMonetaryValue('1.234.567,89'), 1234567.89, 'Large EU format');

// ── Test Suite: extractIncome (Primary bank statement) ──────────────────

console.log('\n═══ extractIncome: Primary Bank Statement ═══\n');

const primaryStatement = `
BANK OF EUROPE
Customer: John Doe
Account: NL91ABNA0417164300

Period of time: 01.01.2024 - 31.12.2024
Account number: NL91ABNA0417164300
Total (EUR)
40,778.09
BIC: ABNANL2A

Date       Description          Credit     Debit
01/03/24   Salary Jan           +9,328.40
01/06/24   Salary Feb           +9,328.40
15/06/24   Bonus                +31,450.49
`.trim();

const result1 = extractIncome(primaryStatement);
assert(result1 !== null, 'Should find income');
assertAmount(result1?.amount, 40778.09, 'Primary statement amount');
assert(result1?.currency === 'EUR', `Currency is EUR (got ${result1?.currency})`);
assert(result1?.amount !== 31450.49, 'Does not select transaction +31,450.49');
assert(result1?.amount !== 9328.40, 'Does not select transaction +9,328.40');

// ── Test Suite: Variations ──────────────────────────────────────────────

console.log('\n═══ extractIncome: Variations ═══\n');

const variation1 = `
TOTAL EUR 40,778.09
Some other line
`;
const r2 = extractIncome(variation1);
assert(r2 !== null, 'TOTAL EUR variation found');
assertAmount(r2?.amount, 40778.09, 'TOTAL EUR variation amount');
assert(r2?.currency === 'EUR', 'TOTAL EUR currency');

const variation2 = `
Account Summary
Total
40 778.09 EUR
`;
// Note: the parser normalises spaces inside numbers
const r3 = extractIncome(variation2);
assert(r3 !== null, 'Total newline + space grouping found');
assertAmount(r3?.amount, 40778.09, 'Space grouping amount');

const variation3 = `
Total (USD)
$88,000.00
`;
const r4 = extractIncome(variation3);
assert(r4 !== null, 'USD variation found');
assertAmount(r4?.amount, 88000.0, 'USD amount');
assert(r4?.currency === 'USD', `USD currency (got ${r4?.currency})`);

const variation4 = `
Closing Balance
€12,345.67
`;
const r5 = extractIncome(variation4);
assert(r5 !== null, 'Closing Balance found');
assertAmount(r5?.amount, 12345.67, 'Closing Balance amount');

// ── Test Suite: OCR error repair ────────────────────────────────────────

console.log('\n═══ extractIncome: OCR Misreads ═══\n');

const ocrMisread1 = `
Total (EUR)
4O,778.O9
`;
const r6 = extractIncome(ocrMisread1);
assert(r6 !== null, 'OCR O→0 misread found');
assertAmount(r6?.amount, 40778.09, 'OCR O→0 misread amount');

const ocrMisread2 = `
Total (EUR)
40,778.0g
`;
const r7 = extractIncome(ocrMisread2);
assert(r7 !== null, 'OCR g→9 misread found');
// Note: 40778.09 (g→9)
assertAmount(r7?.amount, 40778.09, 'OCR g→9 misread amount');

// ── Test Suite: Invalid / No match ──────────────────────────────────────

console.log('\n═══ extractIncome: Invalid / No Match ═══\n');

const noTotal = `
Date       Description          Credit     Debit
01/03/24   Salary Jan           +9,328.40
01/06/24   Salary Feb           +9,328.40
15/06/24   Bonus                +31,450.49
No totals anywhere here.
`;
const r8 = extractIncome(noTotal);
assert(r8 === null, 'No total found returns null');

const emptyDoc = '';
const r9 = extractIncome(emptyDoc);
assert(r9 === null, 'Empty document returns null');

// ── Summary ─────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(50));

if (failed > 0) {
  process.exit(1);
}
