# HK Trip Calculator - Major Update

## Summary of Changes (Feb 17, 2026)

### ✅ 1. Mentor Flight Cost (Simple Total)
- **DONE**: Changed from separate "туда + обратно" fields to single "Total round-trip cost per mentor"
- Flight entries now use one combined price field
- Label updated to be clearer: "Flight Cost (Round-trip per mentor)"
- Calculation multiplies by number of mentors

### ✅ 2. Mentor Meals
- **DONE**: Added meal configuration for mentors
- Slider for meals per day (0-3)
- Cost per meal input field
- Toggle checkbox to include/exclude mentor meals in calculations
- When enabled, mentors are included in meal count calculations

### ✅ 3. Calculation Breakdown Modal
- **DONE**: Added "📊 View Calculation Breakdown" button in summary header
- Modal displays complete calculation flow:
  - Revenue (students × price)
  - All costs (itemized with details)
  - Subtotal profit (gross profit before margin tax)
  - 3% tax on revenue
  - Margin distribution (4 equal shares)
  - Tax on each share (17% for Mentor, Аяжан, Бекс; 0% for Tair)
  - Net amounts for each person
  - Final net profit after all taxes

### ✅ 4. Currency Switcher
- **DONE**: Added toggle button in header: KZT ₸ ⇄ USD $
- Exchange rate input field in settings
- **ALL** monetary inputs show both currencies:
  - Primary currency (large text)
  - Secondary currency (small gray text below)
- Currency converter widget (see #8)

### ✅ 5. Meal Pricing Simplification
- **DONE**: Removed complex "who pays" options
- New simple interface:
  - Slider: "Number of meals per day" (0-3)
  - Input: "Cost per meal per person per day"
  - Auto-calculation: meals × cost × days × people
  - Toggle to include/exclude mentor meals

### ✅ 6. Remove Lantau Island
- **DONE**: Removed "Lantau Island (Ngong Ping 360 + Big Buddha)" from activities list
- Activity can be re-added manually if needed

### ✅ 7. Custom Additional Expenses
- **DONE**: New "Additional Expenses" section
- Add expense button creates new row with:
  - Name (text input)
  - Amount (number input)
  - Frequency dropdown:
    - One-time
    - Per day
    - Custom count (shows number input when selected)
  - Applies to ALL participants (students + mentors)
  - Delete button per row
  - Edit functionality

### ✅ 8. Side Currency Converter
- **DONE**: Floating widget on right side (fixed position)
- Two-way converter:
  - KZT input → auto-converts to USD
  - USD input → auto-converts to KZT
- Uses same exchange rate as main calculator
- Does NOT affect trip calculations (standalone tool)

### ✅ 9. Compact Layout
- **DONE**: Reduced vertical spacing throughout
- Accordion/collapsible sections for:
  - Flight costs
  - Accommodation
  - Transport
  - Meals
  - Activities
  - Custom expenses
- Chevron icons show expand/collapse state
- Click section header to toggle
- More content fits on screen without scrolling

### ✅ 10. Tax & Margin Distribution
- **DONE**: Default 3% tax on total revenue
- Remaining margin splits 4 equal ways:
  - **Ментор** (Mentor) → 17% tax → Net amount shown
  - **Аяжан** (Ayazhan) → 17% tax → Net amount shown
  - **Бекс** (Beks) → 17% tax → Net amount shown
  - **Tair** (you) → 0% tax → Net amount shown
- All tax percentages customizable in settings
- Net amounts displayed in:
  - Summary sidebar (right column)
  - Calculation breakdown modal (detailed view)
- Shows both gross profit and net profit after all taxes

## Technical Implementation

### State Management
- Added new state variables:
  - `primaryCurrency`: 'KZT' | 'USD'
  - `exchangeRate`: number
  - `mealsPerDay`: number (0-3)
  - `costPerMeal`: number
  - `includeMentorMeals`: boolean
  - `customExpenses`: CustomExpense[]
  - `taxConfig`: TaxConfig (4 separate tax rates)
  - `accordionState`: object tracking open/closed sections
  - `converterKzt` / `converterUsd`: currency converter inputs

### New Interfaces
```typescript
interface CustomExpense {
  id: string;
  name: string;
  amount: number;
  frequency: 'once' | 'perDay' | 'custom';
  customCount: number;
}

interface TaxConfig {
  mentor: number;
  ayazhan: number;
  beks: number;
  tair: number;
}
```

### Currency Formatting
- New `formatCurrency()` function supports dual display
- Returns `{ primary: string, secondary: string }`
- Automatically converts based on exchange rate
- All monetary values show both currencies

### Calculation Flow
1. Revenue from students
2. Subtract 3% revenue tax
3. Subtract all costs (hotel, transport, meals, activities, flights, custom)
4. = Gross Profit
5. Divide by 4 (equal shares)
6. Apply individual tax rates to each share
7. = Net amounts per person
8. Sum all net amounts = Net Profit

## Testing Checklist

- [x] Build compiles successfully
- [x] Dev server runs without errors
- [ ] All calculations correct:
  - [ ] Revenue calculation
  - [ ] 3% tax on revenue
  - [ ] Total costs sum
  - [ ] Gross profit = revenue after tax - costs
  - [ ] Margin distribution (4 shares)
  - [ ] Individual taxes on shares
  - [ ] Net amounts per person
- [ ] Currency conversion works both ways:
  - [ ] KZT → USD conversion accurate
  - [ ] USD → KZT conversion accurate
  - [ ] All inputs show both currencies
  - [ ] Toggle switches primary/secondary display
- [ ] Tax percentages apply correctly:
  - [ ] Can customize each person's tax rate
  - [ ] Calculations update when rates change
  - [ ] Tair shows 0% tax correctly
- [ ] Modal shows complete breakdown:
  - [ ] All sections present
  - [ ] Numbers match summary
  - [ ] Clear, readable layout
- [ ] Custom expenses work:
  - [ ] One-time expenses calculated correctly
  - [ ] Per-day expenses × total days
  - [ ] Custom count works
  - [ ] Multiplies by total participants (students + mentors)
  - [ ] Can add/edit/delete expenses
- [ ] Compact layout works:
  - [ ] Accordions expand/collapse
  - [ ] Default state shows key sections
  - [ ] Less scrolling required
- [ ] Meal system works:
  - [ ] Slider 0-3 meals per day
  - [ ] Cost per meal input
  - [ ] Mentor meals toggle
  - [ ] Calculation accurate

## Deployment

To deploy to Vercel:

```bash
cd /home/tair/.openclaw/workspace/hk-trip-calculator
git add .
git commit -m "Major UX update: currency switcher, breakdown modal, custom expenses, compact layout"
git push origin main
```

If using Vercel CLI:
```bash
vercel --prod
```

Or push to GitHub and let Vercel auto-deploy.

## Notes

- Exchange rate default: 1 USD = 440 KZT (customizable)
- All existing data/state preserved
- Backward compatible with previous version
- No breaking changes to core calculation logic
- Currency converter is standalone (doesn't affect trip calculations)

## Future Enhancements

Potential additions:
- Export calculations to PDF
- Save/load trip configurations
- Multiple trip comparison
- Budget alerts (when approaching limit)
- Historical exchange rate lookup
- Multi-language support (Russian, Kazakh, English)
