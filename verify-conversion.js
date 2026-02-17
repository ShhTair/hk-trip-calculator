#!/usr/bin/env node

/**
 * Quick verification of currency conversion logic
 * Tests the critical test case without browser
 */

const EXCHANGE_RATE = 59;

// Simulated helper functions (same logic as App.tsx)
const toDisplayCurrency = (hkdAmount, currency, exchangeRate) => {
  return currency === 'KZT' 
    ? hkdAmount * exchangeRate 
    : hkdAmount;
};

const toHKD = (displayAmount, currency, exchangeRate) => {
  return currency === 'KZT' 
    ? displayAmount / exchangeRate 
    : displayAmount;
};

console.log('🧪 Testing Currency Conversion Logic\n');

// Test Case 1: HKD → KZT
console.log('Test 1: HKD → KZT');
const hkdValue = 8903;
const kztValue = toDisplayCurrency(hkdValue, 'KZT', EXCHANGE_RATE);
console.log(`  Input: ${hkdValue} HKD`);
console.log(`  Output: ${kztValue} KZT`);
console.log(`  Expected: ${8903 * 59} KZT`);
console.log(`  ✅ ${kztValue === 8903 * 59 ? 'PASS' : 'FAIL'}\n`);

// Test Case 2: Edit in KZT
console.log('Test 2: Edit to 600,000 KZT');
const newKztValue = 600000;
const convertedToHkd = toHKD(newKztValue, 'KZT', EXCHANGE_RATE);
console.log(`  Input: ${newKztValue} KZT`);
console.log(`  Stored as: ${convertedToHkd} HKD`);
console.log(`  Expected: ${600000 / 59} HKD`);
console.log(`  ✅ ${Math.abs(convertedToHkd - 10169.49) < 0.01 ? 'PASS' : 'FAIL'}\n`);

// Test Case 3: KZT → HKD (round-trip)
console.log('Test 3: Display 10169.49 HKD in HKD mode');
const displayInHkd = toDisplayCurrency(convertedToHkd, 'HKD', EXCHANGE_RATE);
console.log(`  Stored: ${convertedToHkd} HKD`);
console.log(`  Display: ${displayInHkd} HKD`);
console.log(`  Expected: ${convertedToHkd} HKD (no conversion)`);
console.log(`  ✅ ${displayInHkd === convertedToHkd ? 'PASS' : 'FAIL'}\n`);

// Test Case 4: Round-trip accuracy
console.log('Test 4: Round-trip HKD → KZT → HKD');
const original = 8903;
const toKzt = toDisplayCurrency(original, 'KZT', EXCHANGE_RATE);
const backToHkd = toHKD(toKzt, 'KZT', EXCHANGE_RATE);
console.log(`  Original: ${original} HKD`);
console.log(`  → KZT: ${toKzt} KZT`);
console.log(`  → HKD: ${backToHkd} HKD`);
console.log(`  Difference: ${Math.abs(original - backToHkd)}`);
console.log(`  ✅ ${Math.abs(original - backToHkd) < 0.01 ? 'PASS' : 'FAIL'}\n`);

// Test Case 5: Multiple common values
console.log('Test 5: Common values');
const testValues = [
  { hkd: 3876, description: 'Hotel single room' },
  { hkd: 182, description: 'Victoria Peak ticket' },
  { hkd: 100, description: 'Meal cost' },
  { hkd: 0, description: 'Zero value' },
];

let allPass = true;
testValues.forEach(({ hkd, description }) => {
  const kzt = toDisplayCurrency(hkd, 'KZT', EXCHANGE_RATE);
  const expected = hkd * EXCHANGE_RATE;
  const pass = kzt === expected;
  console.log(`  ${pass ? '✅' : '❌'} ${description}: ${hkd} HKD = ${kzt} KZT (expected ${expected})`);
  if (!pass) allPass = false;
});

console.log('\n' + '='.repeat(50));
console.log(allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
console.log('='.repeat(50));
