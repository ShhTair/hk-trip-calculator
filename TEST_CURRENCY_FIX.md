# Currency Conversion Fix - Testing Checklist

## Quick Test Steps

### 1. Start the Development Server
```bash
cd /home/tair/.openclaw/workspace/hk-trip-calculator
npm run dev
```

### 2. Test Each Input Field

#### A. Settings - Price per Student
1. Note current value in HKD mode
2. Click "HKD 💵" button to switch to "KZT ₸"
3. ✅ Input should show converted value (multiply by 59)
4. Edit the value in KZT
5. Switch back to HKD
6. ✅ Value should convert back correctly

#### B. Flights - Mentor Flight Cost
1. Click "Flights (Mentors Only)" accordion
2. Click Edit (pencil icon) on "Mentor Round-trip Flight"
3. Switch currency between HKD/KZT
4. ✅ Price input should show correct converted value
5. Edit value in KZT mode
6. Save and switch back to HKD
7. ✅ Stored value should be correct HKD

#### C. Mentor Meals - Cost per Meal
1. In Flights section, scroll to "Mentor Meals"
2. Set "Meals/day" to 2
3. Note the "Cost/meal" input
4. Switch currency to KZT
5. ✅ Cost/meal should show converted value
6. Edit and verify conversion

#### D. Hotel - Price Per Pair & Per Person
1. Click "Hotel" accordion
2. Click Edit (pencil icon) on any hotel
3. Switch to KZT mode
4. ✅ Both "Price/pair" and "Price/solo" should show KZT values
5. Edit both values in KZT
6. Save, switch to HKD
7. ✅ Values should convert back correctly

#### E. Student Meals - Cost per Meal
1. Click "Student Meals" accordion
2. Set "Meals per day" to 2
3. Note "Cost per meal" input
4. Switch to KZT
5. ✅ Input should show converted value
6. Edit and verify

#### F. Activities - Price per Person
1. Click "Activities" accordion
2. Click Edit (pencil icon) on any activity
3. Switch to KZT
4. ✅ "Price per person" should show converted value
5. Edit and save
6. Switch back to HKD and verify

#### G. Custom Expenses - Amount
1. Click "Custom Expenses" accordion
2. Click "Add Custom Expense"
3. Add an expense with an amount
4. Switch to KZT
5. ✅ Amount should show converted value
6. Edit and verify conversion

### 3. Verify Storage
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Check `hk-trip-settings`, `hk-trip-hotels`, etc.
4. ✅ All prices should be stored in HKD (base currency)

### 4. Test Scenario: Real Usage

**Example Test:**
1. Set exchange rate: 59 KZT per 1 HKD
2. Switch to HKD mode
3. Add hotel with:
   - Price/pair: 8903 HKD
   - Price/solo: 4451.5 HKD
4. Switch to KZT mode
5. ✅ Should show:
   - Price/pair: 525,277 KZT
   - Price/solo: 262,638.5 KZT
6. Edit Price/pair to 500,000 KZT
7. Switch back to HKD
8. ✅ Should show: 8,474.58 HKD (500,000 ÷ 59)

## Expected Results Summary

| Test | Expected Behavior |
|------|------------------|
| HKD → KZT | All inputs show value × 59 |
| Edit in KZT | Value saves correctly |
| KZT → HKD | All inputs show value ÷ 59 |
| localStorage | All prices in HKD |
| Calculations | Correct in both modes |
| Labels | Show both currencies |

## Bug Indicators (Should NOT Happen)

❌ Inputs showing same number in both currencies  
❌ Editing in KZT doesn't save correctly  
❌ Switching currencies changes stored values  
❌ Calculations wrong after currency switch  
❌ localStorage has mixed currencies  

## Success Criteria

✅ All 8 input fields convert properly  
✅ Data always stored in HKD  
✅ Display changes based on primaryCurrency  
✅ Editing works in both currencies  
✅ No data loss on currency switch  

---

**Fixed Fields:** 8 inputs
- pricePerStudent
- flight.price
- mentorCostPerMeal
- hotel.pricePerPair
- hotel.pricePerPerson
- costPerMeal (student meals)
- activity.pricePerPerson
- customExpense.amount

**Status:** Ready for testing 🚀
