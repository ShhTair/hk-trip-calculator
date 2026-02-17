# 🧪 CRITICAL TEST CASE - Currency Conversion Fix

## Prerequisites
- Dev server running: http://localhost:5175/
- Open browser console (F12) to see debug logs

## Test Scenario: Hotel Price Conversion

### Step 1: Set Initial Value (HKD Mode)
1. Click on hotel section
2. Edit "Dorsett Mongkok" hotel
3. Set **Price/pair** to: `8903`
4. Save
5. **Expected in HKD mode:** Input shows `8903`
6. **Check console:** Should log conversion

### Step 2: Switch to KZT
1. Click the currency toggle button (top right: "HKD 💵")
2. Button should now show "KZT ₸"
3. **CRITICAL CHECK:** Input should INSTANTLY update to `525277` (8903 × 59)
4. **Check console:** Should see:
   ```
   🔄 Currency toggle: HKD → KZT
   📊 Exchange rate: 1 HKD = 59 KZT
   🔑 Currency version: 0 → 1
   💵 toDisplayCurrency: 8903 HKD → 525277.00 KZT
   ```
5. ✅ **PASS if:** Input shows ~525,277 WITHOUT clicking anything else

### Step 3: Edit Value (in KZT)
1. Click edit on hotel again
2. Change **Price/pair** from 525277 to: `600000`
3. Save
4. **Check console:** Should log:
   ```
   💰 toHKD: 600000 KZT → 10169.49 HKD
   ```
5. ✅ **PASS if:** Can type and edit normally

### Step 4: Switch Back to HKD
1. Click currency toggle button (should show "KZT ₸")
2. Button should now show "HKD 💵"
3. **CRITICAL CHECK:** Input should INSTANTLY update to `10169.49` (600000 / 59)
4. **Check console:** Should see:
   ```
   🔄 Currency toggle: KZT → HKD
   📊 Exchange rate: 1 HKD = 59 KZT
   🔑 Currency version: 1 → 2
   💵 toDisplayCurrency: 10169.49 HKD → 10169.49 HKD
   ```
5. ✅ **PASS if:** Input shows ~10,169.49 WITHOUT clicking anything else

### Step 5: Multiple Toggles
1. Toggle HKD → KZT → HKD → KZT rapidly (5-6 times)
2. ✅ **PASS if:** 
   - Input updates EVERY time
   - Values remain consistent
   - No lag or stale data
   - Currency version increments each time in console

---

## Additional Tests (All Inputs)

### Test Flight Price
1. Edit "Mentor Round-trip Flight"
2. Set price to `5000` HKD
3. Toggle to KZT → Should show `295000` ₸
4. ✅ **PASS if:** Updates instantly

### Test Student Meal Cost
1. In "Student Meals" section
2. Set cost per meal to `100` HKD
3. Toggle to KZT → Should show `5900` ₸
4. ✅ **PASS if:** Updates instantly

### Test Activity Price
1. Edit "Victoria Peak" activity
2. Set price to `182` HKD
3. Toggle to KZT → Should show `10738` ₸
4. ✅ **PASS if:** Updates instantly

### Test Custom Expense
1. Add new custom expense
2. Set amount to `1000` HKD
3. Toggle to KZT → Should show `59000` ₸
4. ✅ **PASS if:** Updates instantly

---

## Expected Console Output (Sample)

When toggling from HKD to KZT with hotel price 8903:

```
🔄 Currency toggle: HKD → KZT
📊 Exchange rate: 1 HKD = 59 KZT
🔑 Currency version: 0 → 1
💵 toDisplayCurrency: 8903 HKD → 525277.00 KZT
💵 toDisplayCurrency: 3876 HKD → 228684.00 KZT
💵 toDisplayCurrency: 100 HKD → 5900.00 KZT
... (more conversions for all displayed prices)
```

---

## ✅ SUCCESS CRITERIA

**MANDATORY:**
- [ ] Hotel price updates INSTANTLY when switching currency
- [ ] Can edit price AFTER switching currency
- [ ] Values convert correctly: HKD → KZT → HKD (round-trip accuracy)
- [ ] NO manual page refresh needed
- [ ] NO clicking elsewhere to trigger update

**BONUS:**
- [ ] All other inputs (flights, meals, activities) also update
- [ ] Console logs show correct calculations
- [ ] Currency version increments properly
- [ ] No React warnings or errors
- [ ] Smooth UX, no flicker or delay

---

## 🚨 FAILURE INDICATORS

**❌ FAIL if any of these occur:**
- Input shows old value after currency switch (e.g., "8903" in both HKD and KZT)
- Need to click input field to see new value
- Page refresh required for update
- Console errors
- Values don't convert back correctly
- Currency version doesn't increment

---

## Debug Tips

If test fails:
1. Check console for errors
2. Verify `currencyVersion` is incrementing in logs
3. Check if `key` props are present in React DevTools
4. Verify `toDisplayCurrency()` is being called
5. Check exchange rate is set correctly (should be 59)

---

**Test Date:** 2026-02-17  
**Expected Result:** ✅ ALL TESTS PASS  
**Dev Server:** http://localhost:5175/
