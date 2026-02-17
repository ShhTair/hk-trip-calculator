# Testing Guide - HK Trip Calculator Update

## Quick Verification Steps

### 1. Currency System Test
1. Open the app
2. Click the "KZT ₸" button in the header → should switch to "USD $"
3. Open Settings (gear icon)
4. Change "Price per student" → observe both currencies displayed below
5. Check Currency Converter widget (top right):
   - Enter `4400` in KZT field → should show `10.00` in USD
   - Enter `25` in USD field → should show `11000` in KZT
6. Change exchange rate in settings to `500` → converter should update

**Expected:** All monetary values show dual currency display, converter works bidirectionally

### 2. Flights Simplification Test
1. Expand "Flights (Mentors Only)" section
2. Click edit (pencil icon) on "Mentor Round-trip Flight"
3. Enter total round-trip price: `5000` KZT
4. Save
5. Verify display shows: "Total: 10000 ₸ (2 × 5000 ₸)" (for 2 mentors)

**Expected:** Single input field, clear total calculation

### 3. Mentor Meals Test
1. Expand "Meals" section
2. Move slider to "2" meals per day
3. Enter `150` for cost per meal
4. Check the calculation display
5. Uncheck "Include mentor meals"
6. Observe total changes (should decrease)
7. Re-check "Include mentor meals"

**Expected:**
- With mentors: 2 × 150 × 9 days × 26 people = 70,200 ₸
- Without mentors: 2 × 150 × 9 days × 24 people = 64,800 ₸

### 4. Calculation Breakdown Modal Test
1. Click "📊 View Calculation Breakdown" button (top right of summary card)
2. Modal should open with sections:
   - 💰 Revenue
   - 📊 Tax on Revenue (3%)
   - 💸 All Costs (itemized)
   - 📈 Subtotal Profit
   - 🎯 Margin Distribution (4 shares)
   - 🎉 Final Net Profit
3. Verify all numbers match the summary sidebar
4. Check tax calculations:
   - Each share before tax
   - Tax amounts (17% × 3, 0% × 1)
   - Net amounts per person
5. Close modal with X button

**Expected:** Complete calculation flow visible, all math checks out

### 5. Custom Expenses Test
1. Expand "Additional Expenses" section
2. Click "Add Expense"
3. Add expense:
   - Name: "SIM Cards"
   - Amount: `100` ₸
   - Frequency: "One-time"
4. Save → should show total: 100 × 26 = 2,600 ₸
5. Add another:
   - Name: "Daily Snacks"
   - Amount: `50` ₸
   - Frequency: "Per day"
6. Save → should show total: 50 × 9 × 26 = 11,700 ₸
7. Add third:
   - Name: "Group Photos"
   - Amount: `200` ₸
   - Frequency: "Custom count"
   - Count: `3`
8. Save → should show total: 200 × 3 × 26 = 15,600 ₸
9. Delete "Daily Snacks" → total should decrease
10. Edit "SIM Cards" → change amount to `150` → verify update

**Expected:** All frequency types work, multiplies by total participants, edit/delete works

### 6. Accordion Layout Test
1. All sections should have expandable headers with chevron icons
2. Click "Flights (Mentors Only)" header → section collapses
3. Click again → section expands
4. Repeat for all sections:
   - Flights
   - Hotel
   - Transport
   - Meals
   - Activities
   - Additional Expenses
5. Collapse all sections → page should be much more compact
6. Expand only needed sections

**Expected:** Smooth expand/collapse, less scrolling needed

### 7. Tax Configuration Test
1. Open Settings (gear icon)
2. Scroll to "Margin Distribution Tax Rates"
3. Change values:
   - Ментор: `15` (was 17)
   - Аяжан: `20` (was 17)
   - Бекс: `17` (keep)
   - Tair: `5` (was 0)
4. Click "📊 View Calculation Breakdown"
5. Verify tax amounts changed in "Margin Distribution" section
6. Check net amounts reflect new tax rates
7. Verify summary sidebar shows updated distribution

**Expected:** Tax rates are customizable, all calculations update immediately

### 8. Lantau Island Removal Test
1. Expand "Activities" section
2. Verify "Lantau Island (Ngong Ping 360 + Big Buddha)" is NOT in the list
3. Remaining activities should be:
   - Victoria Peak
   - Victoria Harbour
   - Hong Kong Observation Wheel
   - IFC Rooftop Garden
   - Disneyland + Dinner

**Expected:** Lantau Island removed, can be re-added manually if needed

### 9. Compact Layout Visual Test
1. View app on desktop (1920×1080)
2. With all sections expanded, should still fit most content without excessive scrolling
3. With strategic sections collapsed, should see:
   - Header
   - Summary card
   - Most input sections
   - Summary sidebar
   - All above the fold or with minimal scroll

**Expected:** More information density, less vertical space wasted

### 10. End-to-End Calculation Test

**Setup:**
- 24 students
- 2 mentors
- Price per student: 15,000 ₸
- Tax: 3%
- Exchange rate: 440 ₸ per $
- Primary currency: KZT

**Inputs:**
- Hotel: Dorsett Mongkok (selected) = 116,336 ₸
- Transport: Enabled = 7,748 ₸
- Meals: 3 per day, 100 ₸/meal, mentors included = 70,200 ₸
- Activities: All enabled (5 activities) = 32,136 ₸
- Flights: 5,000 ₸ per mentor round-trip = 10,000 ₸
- Custom: SIM Cards 100 ₸ one-time = 2,600 ₸

**Expected Results:**
- **Total Cost:** 239,020 ₸
- **Revenue:** 24 × 15,000 = 360,000 ₸
- **Tax on Revenue (3%):** 10,800 ₸
- **Revenue after tax:** 349,200 ₸
- **Gross Profit:** 349,200 - 239,020 = 110,180 ₸
- **Margin:** 30.6%
- **Each share (before tax):** 110,180 / 4 = 27,545 ₸
- **Ментор (17% tax):** 27,545 - 4,683 = 22,862 ₸
- **Аяжан (17% tax):** 27,545 - 4,683 = 22,862 ₸
- **Бекс (17% tax):** 27,545 - 4,683 = 22,862 ₸
- **Tair (0% tax):** 27,545 - 0 = 27,545 ₸
- **Total tax on shares:** 14,049 ₸
- **Net Profit:** 110,180 - 14,049 = 96,131 ₸

**Verification:**
1. Enter all inputs as above
2. Open breakdown modal
3. Compare all numbers with expected results
4. Check summary sidebar matches
5. Toggle currency → verify USD conversions

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Responsive Design

Test on:
- [ ] Desktop (1920×1080)
- [ ] Laptop (1366×768)
- [ ] Tablet (768×1024)
- [ ] Mobile (375×667)

## Performance

- [ ] Page loads under 2 seconds
- [ ] Currency calculations are instant
- [ ] No lag when typing in inputs
- [ ] Modal opens/closes smoothly
- [ ] Accordions expand/collapse without jank

## Edge Cases

- [ ] 0 students → should handle gracefully
- [ ] 0 mentors → flights cost should be 0
- [ ] Negative numbers → should prevent or handle
- [ ] Very large numbers (999,999,999) → should not break layout
- [ ] Exchange rate 0 or negative → should prevent
- [ ] Delete all activities → total should be 0
- [ ] Delete all custom expenses → section should still work

## Accessibility

- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Buttons have focus states
- [ ] Modal can be closed with Escape key
- [ ] Screen reader friendly (test with NVDA/JAWS)

## Deployment Verification

After Vercel deployment:
1. Visit production URL
2. Run through quick verification steps (1-10 above)
3. Check console for errors
4. Verify build version in footer/header
5. Test on mobile device

## Known Issues / Limitations

- Currency converter widget is fixed position (may overlap on small screens)
- Accordions don't remember state on refresh (intentional, resets to defaults)
- No data persistence (all state resets on page refresh)
- Meal calculation uses total days, not partial days
- Custom expenses always apply to ALL participants (no per-person toggle)

## Success Criteria

✅ All 10 verification tests pass
✅ End-to-end calculation matches expected results
✅ No console errors
✅ Responsive on mobile and desktop
✅ Currency switcher works in both directions
✅ Breakdown modal shows complete flow
✅ Tax configuration is flexible
✅ Custom expenses handle all frequency types
✅ Accordion layout improves information density
✅ Production deployment successful

## Rollback Plan

If critical issues found:
```bash
git revert e0dc149
git push origin master
```

This will restore the previous version while keeping commit history.

## Support

For issues or questions:
- GitHub: https://github.com/ShhTair/hk-trip-calculator
- Create issue with:
  - Steps to reproduce
  - Expected vs actual behavior
  - Browser/device info
  - Screenshots if applicable
