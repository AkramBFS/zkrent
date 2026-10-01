/**
 * Security Rate Limiter & Qualification Consumption Test Suite
 */

import { checkRateLimit, applyRateLimit } from '../src/lib/rate-limit.js';
import { consumeContractRecord, transitionRecordLifecycle, InvalidStateTransitionError } from '../src/lib/lifecycle.js';
import { NextRequest } from 'next/server';

console.log('==============================================================');
console.log('  Running Security Rate Limiter & Lease Consumption Test Suite');
console.log('==============================================================\n');

let passedTests = 0;
let totalTests = 0;

function report(name: string, ok: boolean, note?: string) {
  totalTests++;
  if (ok) {
    passedTests++;
    console.log(`  ✓ ${name} ${note ? `(${note})` : ''}`);
  } else {
    console.error(`  ✗ ${name} ${note ? `(${note})` : ''}`);
    throw new Error(`Test failed: ${name}`);
  }
}

// -----------------------------------------------------------------------------
// Test 1: Sliding Window Rate Limiter
// -----------------------------------------------------------------------------
console.log('▶ [1/3] Sliding Window Rate Limiter Tests');

const testIp = '192.168.1.100';
const options = { limit: 5, windowMs: 1000, prefix: 'test-suite' };

// First 5 requests should pass
for (let i = 1; i <= 5; i++) {
  const result = checkRateLimit(testIp, options);
  report(`Rate limit allows request ${i} within limit`, result.success === true, `Remaining: ${result.remaining}`);
}

// 6th request should fail
const blocked = checkRateLimit(testIp, options);
report('Rate limit blocks request 6 when threshold exceeded', blocked.success === false && blocked.remaining === 0);

// Request from different IP should succeed
const differentIp = '192.168.1.101';
const differentResult = checkRateLimit(differentIp, options);
report('Rate limit evaluates IPs independently', differentResult.success === true && differentResult.remaining === 4);

// -----------------------------------------------------------------------------
// Test 2: HTTP 429 Response & Headers
// -----------------------------------------------------------------------------
console.log('\n▶ [2/3] HTTP 429 Response & Headers Formatting');

const dummyReq = new NextRequest('http://localhost:3000/api/verifications/prove', {
  headers: {
    'x-forwarded-for': '10.0.0.99',
  },
});

const reqOptions = { limit: 2, windowMs: 2000, prefix: 'prove-test' };

// 2 allowed
applyRateLimit(dummyReq, reqOptions);
applyRateLimit(dummyReq, reqOptions);

// 3rd blocked with 429
const response429 = applyRateLimit(dummyReq, reqOptions);
report('applyRateLimit returns 429 response when limit reached', response429 !== null && response429.status === 429);

if (response429) {
  report('Response contains Retry-After header', response429.headers.has('Retry-After'));
  report('Response contains X-RateLimit-Limit header', response429.headers.get('X-RateLimit-Limit') === '2');
  report('Response contains X-RateLimit-Remaining: 0', response429.headers.get('X-RateLimit-Remaining') === '0');
}

// -----------------------------------------------------------------------------
// Test 3: Qualification Consumption Lifecycle
// -----------------------------------------------------------------------------
console.log('\n▶ [3/3] On-Chain Qualification Record Consumption');

// Valid transition: Active -> Consumed
const consumed = consumeContractRecord('Active');
report('Active qualification transitions safely to Consumed', consumed === 'Consumed');

// Illegal transition: Consumed -> Consumed (double consume prevented)
try {
  consumeContractRecord('Consumed');
  report('Prevents double consumption of qualification record', false);
} catch (e: any) {
  report('Prevents double consumption of qualification record', e instanceof InvalidStateTransitionError);
}

// Illegal transition: Revoked -> Consumed (revoked record cannot be consumed)
try {
  consumeContractRecord('Revoked');
  report('Prevents consumption of Revoked qualification record', false);
} catch (e: any) {
  report('Prevents consumption of Revoked qualification record', e instanceof InvalidStateTransitionError);
}

// Illegal transition: Expired -> Consumed (expired record cannot be consumed)
try {
  consumeContractRecord('Expired');
  report('Prevents consumption of Expired qualification record', false);
} catch (e: any) {
  report('Prevents consumption of Expired qualification record', e instanceof InvalidStateTransitionError);
}

console.log('\n==============================================================');
console.log(`✅ ALL ${passedTests}/${totalTests} SECURITY & CONSUMPTION TESTS PASSED`);
console.log('==============================================================\n');
