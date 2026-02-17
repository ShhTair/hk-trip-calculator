import { useState } from 'react';
import { Calculator, Users, Hotel, Utensils, Sparkles, DollarSign, TrendingUp, Settings as SettingsIcon, MapPin, Plane, Plus, Edit2, Trash2, Camera, Percent, PieChart, ChevronDown, ChevronUp, ArrowLeftRight, X } from 'lucide-react';

interface Settings {
  students: number;
  mentors: number;
  pricePerStudent: number;
  taxPercent: number;
  exchangeRate: number;
  primaryCurrency: 'KZT' | 'USD';
}

interface Hotel {
  id: string;
  name: string;
  pricePerPerson: number;
  pricePerPair: number;
  includesBreakfast: boolean;
  includesTransfer: boolean;
  url: string;
  notes: string;
}

interface Activity {
  id: string;
  name: string;
  pricePerPerson: number;
  enabled: boolean;
  notes: string;
  url?: string;
}

interface Flight {
  id: string;
  name: string;
  route: string;
  date: string;
  time: string;
  price: number;
  notes: string;
}

interface Transport {
  mtr: number;
  ferry: number;
}

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

const DATES = {
  start: '2026-03-20',
  end: '2026-03-29',
  totalNights: 8,
  totalDays: 9
};

const formatCurrency = (amount: number, currency: 'KZT' | 'USD', exchangeRate: number) => {
  if (currency === 'KZT') {
    return {
      primary: amount.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' ₸',
      secondary: (amount / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $'
    };
  } else {
    return {
      primary: amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $',
      secondary: (amount * exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' ₸'
    };
  }
};

const INITIAL_HOTELS: Hotel[] = [
  {
    id: 'beacon',
    name: 'The BEACON',
    pricePerPerson: 3876,
    pricePerPair: 7752,
    includesBreakfast: false,
    includesTransfer: false,
    url: 'https://book-directonline.com/properties/TheBeaconDirect',
    notes: 'Without Breakfast'
  },
  {
    id: 'dorsett',
    name: 'Dorsett Mongkok',
    pricePerPerson: 4451.5,
    pricePerPair: 8903,
    includesBreakfast: true,
    includesTransfer: true,
    url: 'https://www.book-secure.com/index.php?s=results&property=cnhon27154',
    notes: 'With Breakfast + Airport Transfer for group'
  }
];

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'victoria-peak',
    name: 'Victoria Peak (Peak Tram + Sky Terrace)',
    pricePerPerson: 182,
    enabled: true,
    notes: 'Return/Single, included Sky Terrace 428 + MeiLok Experience Studio',
    url: 'https://webstore.thepeak.com.hk/ticket-detail?id=860'
  },
  {
    id: 'victoria-harbour',
    name: 'Victoria Harbour (Star Ferry + Laser Show)',
    pricePerPerson: 280,
    enabled: true,
    notes: 'Tsim Sha Tsui pier / Symphony of Lights Tour (19:45-20:30) / Non-alcoholic drink',
    url: 'https://www.starferry.com.hk/en/wt-schedule'
  },
  {
    id: 'observation-wheel',
    name: 'Hong Kong Observation Wheel',
    pricePerPerson: 20,
    enabled: true,
    notes: 'Can be $320 HKD if we take 2 private cabins',
    url: 'https://hkow.hk/#ticketshkow'
  },
  {
    id: 'ifc-rooftop',
    name: 'IFC Rooftop Garden',
    pricePerPerson: 10,
    enabled: true,
    notes: 'Take a drink for a pleasant experience'
  },
  {
    id: 'disneyland',
    name: 'Disneyland + Dinner',
    pricePerPerson: 752,
    enabled: true,
    notes: '2-in-1 meal voucher + Day Pass',
    url: 'https://www.hongkongdisneyland.com/book/general-tickets'
  }
];

const TRANSPORT: Transport = {
  mtr: 288,
  ferry: 10
};

function App() {
  const [settings, setSettings] = useState<Settings>({
    students: 24,
    mentors: 2,
    pricePerStudent: 0,
    taxPercent: 3,
    exchangeRate: 440,
    primaryCurrency: 'KZT'
  });

  const [taxConfig, setTaxConfig] = useState<TaxConfig>({
    mentor: 17,
    ayazhan: 17,
    beks: 17,
    tair: 0
  });

  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('dorsett');
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [flights, setFlights] = useState<Flight[]>([
    {
      id: 'mentor-flight',
      name: 'Mentor Round-trip Flight',
      route: 'TSE ⇄ HKG',
      date: '2026-03-20',
      time: '10:00',
      price: 0,
      notes: 'Total round-trip cost per mentor'
    }
  ]);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  const [mealsPerDay, setMealsPerDay] = useState(0);
  const [costPerMeal, setCostPerMeal] = useState(100);
  const [includeMentorMeals, setIncludeMentorMeals] = useState(true);

  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([]);
  const [editingExpense, setEditingExpense] = useState<CustomExpense | null>(null);

  const [includeTransport, setIncludeTransport] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Accordion states
  const [accordionState, setAccordionState] = useState({
    flights: true,
    hotel: true,
    transport: true,
    meals: true,
    activities: true,
    customExpenses: true
  });

  // Currency converter state
  const [converterKzt, setConverterKzt] = useState('');
  const [converterUsd, setConverterUsd] = useState('');

  const selectedHotel = hotels.find(h => h.id === selectedHotelId) || hotels[0];

  const toggleAccordion = (section: keyof typeof accordionState) => {
    setAccordionState(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCurrency = () => {
    setSettings(prev => ({
      ...prev,
      primaryCurrency: prev.primaryCurrency === 'KZT' ? 'USD' : 'KZT'
    }));
  };

  const handleConverterKztChange = (value: string) => {
    setConverterKzt(value);
    const num = parseFloat(value) || 0;
    setConverterUsd((num / settings.exchangeRate).toFixed(2));
  };

  const handleConverterUsdChange = (value: string) => {
    setConverterUsd(value);
    const num = parseFloat(value) || 0;
    setConverterKzt((num * settings.exchangeRate).toFixed(0));
  };

  // Calculate hotel costs
  const calculateHotelCost = () => {
    const studentPairs = Math.floor(settings.students / 2);
    const studentSingles = settings.students % 2;
    const mentorSingles = settings.mentors;
    
    const pairsCost = studentPairs * selectedHotel.pricePerPair;
    const singlesCost = (studentSingles + mentorSingles) * selectedHotel.pricePerPerson;
    
    return {
      total: pairsCost + singlesCost,
      pairs: studentPairs,
      singles: studentSingles + mentorSingles
    };
  };

  // Calculate transport costs
  const calculateTransportCost = () => {
    if (!includeTransport) return 0;
    const totalPeople = settings.students + settings.mentors;
    return (TRANSPORT.mtr + TRANSPORT.ferry) * totalPeople;
  };

  // Calculate meal costs
  const calculateMealCost = () => {
    const totalPeople = includeMentorMeals 
      ? settings.students + settings.mentors 
      : settings.students;
    return mealsPerDay * costPerMeal * DATES.totalDays * totalPeople;
  };

  // Calculate activities cost
  const calculateActivitiesCost = () => {
    const totalPeople = settings.students + settings.mentors;
    return activities
      .filter(a => a.enabled)
      .reduce((sum, activity) => sum + (activity.pricePerPerson * totalPeople), 0);
  };

  // Calculate flights cost (only mentors!)
  const calculateFlightsCost = () => {
    return flights.reduce((sum, flight) => sum + (flight.price * settings.mentors), 0);
  };

  // Calculate custom expenses
  const calculateCustomExpensesCost = () => {
    const totalPeople = settings.students + settings.mentors;
    return customExpenses.reduce((sum, expense) => {
      let multiplier = 1;
      if (expense.frequency === 'once') {
        multiplier = 1;
      } else if (expense.frequency === 'perDay') {
        multiplier = DATES.totalDays;
      } else if (expense.frequency === 'custom') {
        multiplier = expense.customCount;
      }
      return sum + (expense.amount * multiplier * totalPeople);
    }, 0);
  };

  const hotelCost = calculateHotelCost();
  const transportCost = calculateTransportCost();
  const mealCost = calculateMealCost();
  const activitiesCost = calculateActivitiesCost();
  const flightsCost = calculateFlightsCost();
  const customExpensesCost = calculateCustomExpensesCost();
  
  const totalCost = hotelCost.total + transportCost + mealCost + activitiesCost + flightsCost + customExpensesCost;
  
  // Revenue (only students pay)
  const totalRevenue = settings.students * settings.pricePerStudent;
  
  // Tax calculation
  const taxOnRevenue = (totalRevenue * settings.taxPercent) / 100;
  const revenueAfterTax = totalRevenue - taxOnRevenue;
  
  // Profit before margin distribution
  const grossProfit = revenueAfterTax - totalCost;
  
  // Margin distribution (4 equal shares)
  const marginPerShare = grossProfit / 4;
  
  // Tax on each share
  const taxOnMentorShare = (marginPerShare * taxConfig.mentor) / 100;
  const taxOnAyazhanShare = (marginPerShare * taxConfig.ayazhan) / 100;
  const taxOnBeksShare = (marginPerShare * taxConfig.beks) / 100;
  const taxOnTairShare = (marginPerShare * taxConfig.tair) / 100;
  
  // Net amounts for each person
  const netMentor = marginPerShare - taxOnMentorShare;
  const netAyazhan = marginPerShare - taxOnAyazhanShare;
  const netBeks = marginPerShare - taxOnBeksShare;
  const netTair = marginPerShare - taxOnTairShare;
  
  const totalTaxOnShares = taxOnMentorShare + taxOnAyazhanShare + taxOnBeksShare + taxOnTairShare;
  const netProfit = grossProfit - totalTaxOnShares;
  
  const marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  
  // Cost per student
  const costPerStudent = settings.students > 0 ? totalCost / settings.students : 0;
  const marginPerStudent = settings.students > 0 ? grossProfit / settings.students : 0;

  const toggleActivity = (id: string) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const addHotel = () => {
    const newHotel: Hotel = {
      id: `hotel-${Date.now()}`,
      name: 'New Hotel',
      pricePerPerson: 0,
      pricePerPair: 0,
      includesBreakfast: false,
      includesTransfer: false,
      url: '',
      notes: ''
    };
    setHotels([...hotels, newHotel]);
    setEditingHotel(newHotel);
  };

  const updateHotel = (hotel: Hotel) => {
    setHotels(hotels.map(h => h.id === hotel.id ? hotel : h));
    setEditingHotel(null);
  };

  const deleteHotel = (id: string) => {
    if (hotels.length <= 1) return;
    setHotels(hotels.filter(h => h.id !== id));
    if (selectedHotelId === id) {
      setSelectedHotelId(hotels[0].id);
    }
  };

  const addActivity = () => {
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      name: 'New Activity',
      pricePerPerson: 0,
      enabled: true,
      notes: '',
      url: ''
    };
    setActivities([...activities, newActivity]);
    setEditingActivity(newActivity);
  };

  const updateActivity = (activity: Activity) => {
    setActivities(activities.map(a => a.id === activity.id ? activity : a));
    setEditingActivity(null);
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const addFlight = () => {
    const newFlight: Flight = {
      id: `flight-${Date.now()}`,
      name: 'New Flight',
      route: '',
      date: DATES.start,
      time: '10:00',
      price: 0,
      notes: ''
    };
    setFlights([...flights, newFlight]);
    setEditingFlight(newFlight);
  };

  const updateFlight = (flight: Flight) => {
    setFlights(flights.map(f => f.id === flight.id ? flight : f));
    setEditingFlight(null);
  };

  const deleteFlight = (id: string) => {
    setFlights(flights.filter(f => f.id !== id));
  };

  const addCustomExpense = () => {
    const newExpense: CustomExpense = {
      id: `expense-${Date.now()}`,
      name: 'New Expense',
      amount: 0,
      frequency: 'once',
      customCount: 1
    };
    setCustomExpenses([...customExpenses, newExpense]);
    setEditingExpense(newExpense);
  };

  const updateCustomExpense = (expense: CustomExpense) => {
    setCustomExpenses(customExpenses.map(e => e.id === expense.id ? expense : e));
    setEditingExpense(null);
  };

  const deleteCustomExpense = (id: string) => {
    setCustomExpenses(customExpenses.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 relative">
      {/* Currency Converter Widget */}
      <div className="fixed right-4 top-4 z-50 bg-white rounded-lg shadow-lg p-3 w-64 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">Currency Converter</h3>
          <ArrowLeftRight className="w-4 h-4 text-blue-500" />
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600">KZT ₸</label>
            <input
              type="number"
              value={converterKzt}
              onChange={(e) => handleConverterKztChange(e.target.value)}
              placeholder="0"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">USD $</label>
            <input
              type="number"
              value={converterUsd}
              onChange={(e) => handleConverterUsdChange(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            Rate: 1 $ = {settings.exchangeRate} ₸
          </div>
        </div>
      </div>

      {/* Breakdown Modal */}
      {showBreakdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <PieChart className="w-6 h-6 text-blue-500" />
                Calculation Breakdown
              </h2>
              <button
                onClick={() => setShowBreakdown(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Revenue */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-green-800 mb-2">💰 Revenue</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>{settings.students} students × {formatCurrency(settings.pricePerStudent, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    <span className="font-bold">{formatCurrency(totalRevenue, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    ({formatCurrency(totalRevenue, settings.primaryCurrency, settings.exchangeRate).secondary})
                  </div>
                </div>
              </div>

              {/* Tax on Revenue */}
              {settings.taxPercent > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg text-red-800 mb-2">📊 Tax on Revenue ({settings.taxPercent}%)</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Revenue tax</span>
                      <span className="font-bold text-red-600">-{formatCurrency(taxOnRevenue, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      ({formatCurrency(taxOnRevenue, settings.primaryCurrency, settings.exchangeRate).secondary})
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-300">
                    <div className="flex justify-between font-bold">
                      <span>Revenue after tax</span>
                      <span className="text-blue-600">{formatCurrency(revenueAfterTax, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Costs */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-orange-800 mb-2">💸 All Costs (Itemized)</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>• Hotel ({hotelCost.pairs} pairs + {hotelCost.singles} singles)</span>
                    <span>{formatCurrency(hotelCost.total, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                  </div>
                  {transportCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Transport (MTR + Ferry)</span>
                      <span>{formatCurrency(transportCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    </div>
                  )}
                  {mealCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Meals ({mealsPerDay}/day × {includeMentorMeals ? settings.students + settings.mentors : settings.students} people × {DATES.totalDays} days)</span>
                      <span>{formatCurrency(mealCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    </div>
                  )}
                  {activitiesCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Activities ({activities.filter(a => a.enabled).length} items)</span>
                      <span>{formatCurrency(activitiesCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    </div>
                  )}
                  {flightsCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Flights ({settings.mentors} mentors)</span>
                      <span>{formatCurrency(flightsCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    </div>
                  )}
                  {customExpensesCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Custom Expenses ({customExpenses.length} items)</span>
                      <span>{formatCurrency(customExpensesCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-orange-300">
                  <div className="flex justify-between font-bold">
                    <span>Total Costs</span>
                    <span className="text-orange-600">{formatCurrency(totalCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className={`${grossProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
                <h3 className={`font-bold text-lg ${grossProfit >= 0 ? 'text-blue-800' : 'text-red-800'} mb-2`}>
                  📈 Subtotal Profit (Before Margin Tax)
                </h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Revenue after tax - Total costs</span>
                    <span className={`font-bold text-xl ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {grossProfit >= 0 ? '+' : ''}{formatCurrency(grossProfit, settings.primaryCurrency, settings.exchangeRate).primary}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    ({formatCurrency(grossProfit, settings.primaryCurrency, settings.exchangeRate).secondary})
                  </div>
                </div>
              </div>

              {/* Margin Distribution */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-purple-800 mb-2">🎯 Margin Distribution (4 Equal Shares)</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Each share (before tax)</span>
                    <span className="font-bold">{formatCurrency(marginPerShare, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-purple-300 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Ментор (Mentor)</span>
                        <span className="text-gray-600">Tax: {taxConfig.mentor}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">- Tax: {formatCurrency(taxOnMentorShare, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                        <span className="font-bold text-green-600">= {formatCurrency(netMentor, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Аяжан (Ayazhan)</span>
                        <span className="text-gray-600">Tax: {taxConfig.ayazhan}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">- Tax: {formatCurrency(taxOnAyazhanShare, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                        <span className="font-bold text-green-600">= {formatCurrency(netAyazhan, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Бекс (Beks)</span>
                        <span className="text-gray-600">Tax: {taxConfig.beks}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">- Tax: {formatCurrency(taxOnBeksShare, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                        <span className="font-bold text-green-600">= {formatCurrency(netBeks, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Tair (You)</span>
                        <span className="text-gray-600">Tax: {taxConfig.tair}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">- Tax: {formatCurrency(taxOnTairShare, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                        <span className="font-bold text-green-600">= {formatCurrency(netTair, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-purple-400">
                    <div className="flex justify-between font-bold">
                      <span>Total tax on shares</span>
                      <span className="text-red-600">-{formatCurrency(totalTaxOnShares, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Net Profit */}
              <div className={`${netProfit >= 0 ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-lg p-4`}>
                <h3 className={`font-bold text-xl ${netProfit >= 0 ? 'text-green-800' : 'text-red-800'} mb-2`}>
                  🎉 Final Net Profit (All Taxes Paid)
                </h3>
                <div className="text-lg space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Total for distribution:</span>
                    <span className={`font-bold text-2xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit, settings.primaryCurrency, settings.exchangeRate).primary}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ({formatCurrency(netProfit, settings.primaryCurrency, settings.exchangeRate).secondary})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Calculator className="w-7 h-7 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hong Kong Trip Calculator</h1>
                <p className="text-gray-600 text-xs">📅 {DATES.start} → {DATES.end} ({DATES.totalNights} nights, {DATES.totalDays} days)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleCurrency}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                {settings.primaryCurrency === 'KZT' ? 'KZT ₸' : 'USD $'}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <SettingsIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Number of students
                </label>
                <input
                  type="number"
                  value={settings.students}
                  onChange={(e) => setSettings({ ...settings, students: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Number of mentors
                </label>
                <input
                  type="number"
                  value={settings.mentors}
                  onChange={(e) => setSettings({ ...settings, mentors: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Travel free (included in costs)</p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price per student ({settings.primaryCurrency})
                </label>
                <input
                  type="number"
                  value={settings.pricePerStudent}
                  onChange={(e) => setSettings({ ...settings, pricePerStudent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(settings.pricePerStudent, settings.primaryCurrency, settings.exchangeRate).secondary}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Revenue Tax (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxPercent}
                  onChange={(e) => setSettings({ ...settings, taxPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Deducted from revenue</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Exchange Rate (1 USD =)
                </label>
                <input
                  type="number"
                  value={settings.exchangeRate}
                  onChange={(e) => setSettings({ ...settings, exchangeRate: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">KZT per 1 USD</p>
              </div>
            </div>

            {/* Tax Config */}
            <div className="border-t pt-3">
              <h3 className="text-sm font-bold mb-2">Margin Distribution Tax Rates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Ментор (%)</label>
                  <input
                    type="number"
                    value={taxConfig.mentor}
                    onChange={(e) => setTaxConfig({ ...taxConfig, mentor: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Аяжан (%)</label>
                  <input
                    type="number"
                    value={taxConfig.ayazhan}
                    onChange={(e) => setTaxConfig({ ...taxConfig, ayazhan: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Бекс (%)</label>
                  <input
                    type="number"
                    value={taxConfig.beks}
                    onChange={(e) => setTaxConfig({ ...taxConfig, beks: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tair (%)</label>
                  <input
                    type="number"
                    value={taxConfig.tair}
                    onChange={(e) => setTaxConfig({ ...taxConfig, tair: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-4 mb-4 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Summary</h2>
            </div>
            <button
              onClick={() => setShowBreakdown(true)}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
            >
              <PieChart className="w-4 h-4" />
              📊 View Calculation Breakdown
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Dates</div>
              <div className="text-base font-bold text-gray-900">{DATES.totalDays} days</div>
              <div className="text-xs text-gray-600">{DATES.start.slice(5)} → {DATES.end.slice(5)}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Group</div>
              <div className="text-base font-bold text-gray-900">{settings.students + settings.mentors} ppl</div>
              <div className="text-xs text-gray-600">{settings.students}s + {settings.mentors}m</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Cost/student</div>
              <div className="text-base font-bold text-blue-600">{formatCurrency(costPerStudent, settings.primaryCurrency, settings.exchangeRate).primary}</div>
              <div className="text-xs text-gray-600">{formatCurrency(costPerStudent, settings.primaryCurrency, settings.exchangeRate).secondary}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Revenue</div>
              <div className="text-base font-bold text-green-600">{formatCurrency(totalRevenue, settings.primaryCurrency, settings.exchangeRate).primary}</div>
              <div className="text-xs text-gray-600">{formatCurrency(totalRevenue, settings.primaryCurrency, settings.exchangeRate).secondary}</div>
            </div>

            {settings.taxPercent > 0 && (
              <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-red-200">
                <div className="text-xs text-gray-500 uppercase mb-1">Tax {settings.taxPercent}%</div>
                <div className="text-base font-bold text-red-600">-{formatCurrency(taxOnRevenue, settings.primaryCurrency, settings.exchangeRate).primary}</div>
                <div className="text-xs text-gray-600">{formatCurrency(taxOnRevenue, settings.primaryCurrency, settings.exchangeRate).secondary}</div>
              </div>
            )}

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Margin</div>
              <div className={`text-base font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {grossProfit >= 0 ? '+' : ''}{formatCurrency(grossProfit, settings.primaryCurrency, settings.exchangeRate).primary}
              </div>
              <div className="text-xs text-gray-600">{marginPercent.toFixed(1)}%</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-green-200">
              <div className="text-xs text-gray-500 uppercase mb-1">Net Profit</div>
              <div className={`text-base font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit, settings.primaryCurrency, settings.exchangeRate).primary}
              </div>
              <div className="text-xs text-gray-600">After all tax</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Options */}
          <div className="lg:col-span-2 space-y-3">
            {/* Flights */}
            <div className="bg-white rounded-xl shadow-sm">
              <button
                onClick={() => toggleAccordion('flights')}
                className="w-full p-3 flex justify-between items-center hover:bg-gray-50 rounded-t-xl"
              >
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Flights (Mentors Only)
                </h2>
                {accordionState.flights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {accordionState.flights && (
                <div className="p-3 border-t">
                  <div className="space-y-2 mb-3">
                    {flights.map((flight) => (
                      <div key={flight.id} className="p-3 border-2 border-gray-200 rounded-lg">
                        {editingFlight?.id === flight.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingFlight.name}
                              onChange={(e) => setEditingFlight({ ...editingFlight, name: e.target.value })}
                              placeholder="Name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={editingFlight.route}
                                onChange={(e) => setEditingFlight({ ...editingFlight, route: e.target.value })}
                                placeholder="Route"
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <input
                                type="number"
                                value={editingFlight.price}
                                onChange={(e) => setEditingFlight({ ...editingFlight, price: parseFloat(e.target.value) || 0 })}
                                placeholder={`Price (${settings.primaryCurrency})`}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <input
                              type="text"
                              value={editingFlight.notes}
                              onChange={(e) => setEditingFlight({ ...editingFlight, notes: e.target.value })}
                              placeholder="Notes"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateFlight(editingFlight)}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingFlight(null)}
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-gray-900">{flight.name}</h3>
                              <div className="text-xs text-gray-600 mt-1">{flight.route}</div>
                              {flight.notes && <div className="text-xs text-gray-500 mt-1">{flight.notes}</div>}
                              {flight.price > 0 && (
                                <div className="text-xs text-blue-600 mt-1 font-medium">
                                  Total: {formatCurrency(flight.price * settings.mentors, settings.primaryCurrency, settings.exchangeRate).primary} ({settings.mentors} × {formatCurrency(flight.price, settings.primaryCurrency, settings.exchangeRate).primary})
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingFlight(flight)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Edit2 className="w-3 h-3 text-gray-600" />
                              </button>
                              <button
                                onClick={() => deleteFlight(flight.id)}
                                className="p-1 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addFlight}
                    className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Flight
                  </button>
                  {flightsCost > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg text-xs">
                      <div className="font-semibold text-gray-900">
                        Total flights: {formatCurrency(flightsCost, settings.primaryCurrency, settings.exchangeRate).primary}
                      </div>
                      <div className="text-gray-500 mt-0.5">
                        {formatCurrency(flightsCost, settings.primaryCurrency, settings.exchangeRate).secondary}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hotel Selection */}
            <div className="bg-white rounded-xl shadow-sm">
              <button
                onClick={() => toggleAccordion('hotel')}
                className="w-full p-3 flex justify-between items-center hover:bg-gray-50 rounded-t-xl"
              >
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Hotel className="w-4 h-4" />
                  Hotel
                </h2>
                {accordionState.hotel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {accordionState.hotel && (
                <div className="p-3 border-t">
                  <div className="space-y-2 mb-3">
                    {hotels.map((hotel) => (
                      <div key={hotel.id}>
                        {editingHotel?.id === hotel.id ? (
                          <div className="p-3 border-2 border-blue-500 rounded-lg space-y-2">
                            <input
                              type="text"
                              value={editingHotel.name}
                              onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                              placeholder="Hotel name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                value={editingHotel.pricePerPair}
                                onChange={(e) => setEditingHotel({ ...editingHotel, pricePerPair: parseFloat(e.target.value) || 0 })}
                                placeholder={`Price/pair (${settings.primaryCurrency})`}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <input
                                type="number"
                                value={editingHotel.pricePerPerson}
                                onChange={(e) => setEditingHotel({ ...editingHotel, pricePerPerson: parseFloat(e.target.value) || 0 })}
                                placeholder={`Price/solo (${settings.primaryCurrency})`}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <input
                              type="text"
                              value={editingHotel.notes}
                              onChange={(e) => setEditingHotel({ ...editingHotel, notes: e.target.value })}
                              placeholder="Notes"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <div className="flex gap-3">
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={editingHotel.includesBreakfast}
                                  onChange={(e) => setEditingHotel({ ...editingHotel, includesBreakfast: e.target.checked })}
                                />
                                Breakfast
                              </label>
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={editingHotel.includesTransfer}
                                  onChange={(e) => setEditingHotel({ ...editingHotel, includesTransfer: e.target.checked })}
                                />
                                Transfer
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateHotel(editingHotel)}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingHotel(null)}
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                              {hotels.length > 1 && (
                                <button
                                  onClick={() => { deleteHotel(hotel.id); setEditingHotel(null); }}
                                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 ml-auto"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setSelectedHotelId(hotel.id)}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition relative ${
                              selectedHotelId === hotel.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingHotel(hotel); }}
                              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="w-3 h-3 text-gray-600" />
                            </button>
                            <div className="flex justify-between items-start mb-1 pr-8">
                              <div>
                                <h3 className="font-semibold text-sm text-gray-900">{hotel.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{hotel.notes}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-medium text-gray-900">{formatCurrency(hotel.pricePerPair, settings.primaryCurrency, settings.exchangeRate).primary}</div>
                                <div className="text-xs text-gray-500">pair</div>
                              </div>
                            </div>
                            <div className="flex gap-2 text-xs text-green-600">
                              {hotel.includesBreakfast && <span>✓ Breakfast</span>}
                              {hotel.includesTransfer && <span>✓ Transfer</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addHotel}
                    className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs flex items-center justify-center gap-1 mb-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add Hotel
                  </button>
                  <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <div>Rooms: {hotelCost.pairs} pairs + {hotelCost.singles} singles</div>
                    <div className="font-semibold text-gray-900 mt-1">
                      Total: {formatCurrency(hotelCost.total, settings.primaryCurrency, settings.exchangeRate).primary}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Transport */}
            <div className="bg-white rounded-xl shadow-sm">
              <button
                onClick={() => toggleAccordion('transport')}
                className="w-full p-3 flex justify-between items-center hover:bg-gray-50 rounded-t-xl"
              >
                <h2 className="text-base font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Transport
                </h2>
                {accordionState.transport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {accordionState.transport && (
                <div className="p-3 border-t">
                  <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition">
                    <input
                      type="checkbox"
                      checked={includeTransport}
                      onChange={(e) => setIncludeTransport(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">MTR + Buses + Ferry</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatCurrency(TRANSPORT.mtr + TRANSPORT.ferry, settings.primaryCurrency, settings.exchangeRate).primary} per person
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-700">
                        {formatCurrency((TRANSPORT.mtr + TRANSPORT.ferry) * (settings.students + settings.mentors), settings.primaryCurrency, settings.exchangeRate).primary}
                      </div>
                      <div className="text-xs text-gray-500">total</div>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Meals */}
            <div className="bg-white rounded-xl shadow-sm">
              <button
                onClick={() => toggleAccordion('meals')}
                className="w-full p-3 flex justify-between items-center hover:bg-gray-50 rounded-t-xl"
              >
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Meals
                </h2>
                {accordionState.meals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {accordionState.meals && (
                <div className="p-3 border-t space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Number of meals per day: {mealsPerDay}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      value={mealsPerDay}
                      onChange={(e) => setMealsPerDay(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                    </div>
                  </div>
                  
                  {mealsPerDay > 0 && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Cost per meal per person per day ({settings.primaryCurrency})
                        </label>
                        <input
                          type="number"
                          value={costPerMeal}
                          onChange={(e) => setCostPerMeal(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(costPerMeal, settings.primaryCurrency, settings.exchangeRate).secondary}
                        </p>
                      </div>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={includeMentorMeals}
                          onChange={(e) => setIncludeMentorMeals(e.target.checked)}
                          className="w-4 h-4"
                        />
                        Include mentor meals
                      </label>

                      <div className="p-2 bg-gray-50 rounded-lg text-xs">
                        <div className="text-gray-600">
                          {mealsPerDay} meals × {formatCurrency(costPerMeal, settings.primaryCurrency, settings.exchangeRate).primary} × {DATES.totalDays} days × {includeMentorMeals ? settings.students + settings.mentors : settings.students} people
                        </div>
                        <div className="font-semibold text-gray-900 mt-1">
                          Total: {formatCurrency(mealCost, settings.primaryCurrency, settings.exchangeRate).primary}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Activities */}
            <div className="bg-white rounded-xl shadow-sm">
              <button
                onClick={() => toggleAccordion('activities')}
                className="w-full p-3 flex justify-between items-center hover:bg-gray-50 rounded-t-xl"
              >
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Activities
                </h2>
                {accordionState.activities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {accordionState.activities && (
                <div className="p-3 border-t">
                  <div className="space-y-2 mb-3">
                    {activities.map((activity) => (
                      <div key={activity.id}>
                        {editingActivity?.id === activity.id ? (
                          <div className="p-3 border-2 border-blue-500 rounded-lg space-y-2">
                            <input
                              type="text"
                              value={editingActivity.name}
                              onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })}
                              placeholder="Name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="number"
                              value={editingActivity.pricePerPerson}
                              onChange={(e) => setEditingActivity({ ...editingActivity, pricePerPerson: parseFloat(e.target.value) || 0 })}
                              placeholder={`Price per person (${settings.primaryCurrency})`}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={editingActivity.notes}
                              onChange={(e) => setEditingActivity({ ...editingActivity, notes: e.target.value })}
                              placeholder="Notes"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateActivity(editingActivity)}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingActivity(null)}
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => { deleteActivity(activity.id); setEditingActivity(null); }}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 ml-auto"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`p-3 border-2 rounded-lg transition relative ${
                              activity.enabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="absolute top-2 right-2">
                              <button
                                onClick={() => setEditingActivity(activity)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Edit2 className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                            <div className="flex items-start gap-2 pr-8">
                              <input
                                type="checkbox"
                                checked={activity.enabled}
                                onChange={() => toggleActivity(activity.id)}
                                className="mt-0.5 w-4 h-4"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm text-gray-900">{activity.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>
                                {activity.enabled && (
                                  <div className="text-xs text-blue-600 mt-1 font-medium">
                                    {formatCurrency(activity.pricePerPerson * (settings.students + settings.mentors), settings.primaryCurrency, settings.exchangeRate).primary}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addActivity}
                    className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs flex items-center justify-center gap-1 mb-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add Activity
                  </button>
                  <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <div className="font-semibold text-gray-900">
                      Total: {formatCurrency(activitiesCost, settings.primaryCurrency, settings.exchangeRate).primary}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Expenses */}
            <div className="bg-white rounded-xl shadow-sm">
              <button
                onClick={() => toggleAccordion('customExpenses')}
                className="w-full p-3 flex justify-between items-center hover:bg-gray-50 rounded-t-xl"
              >
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Additional Expenses
                </h2>
                {accordionState.customExpenses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {accordionState.customExpenses && (
                <div className="p-3 border-t">
                  <div className="space-y-2 mb-3">
                    {customExpenses.map((expense) => (
                      <div key={expense.id} className="p-3 border-2 border-gray-200 rounded-lg">
                        {editingExpense?.id === expense.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingExpense.name}
                              onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
                              placeholder="Name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                value={editingExpense.amount}
                                onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                                placeholder={`Amount (${settings.primaryCurrency})`}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <select
                                value={editingExpense.frequency}
                                onChange={(e) => setEditingExpense({ ...editingExpense, frequency: e.target.value as 'once' | 'perDay' | 'custom' })}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="once">One-time</option>
                                <option value="perDay">Per day</option>
                                <option value="custom">Custom count</option>
                              </select>
                            </div>
                            {editingExpense.frequency === 'custom' && (
                              <input
                                type="number"
                                value={editingExpense.customCount}
                                onChange={(e) => setEditingExpense({ ...editingExpense, customCount: parseInt(e.target.value) || 1 })}
                                placeholder="Count"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateCustomExpense(editingExpense)}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingExpense(null)}
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-gray-900">{expense.name}</h3>
                              <div className="text-xs text-gray-600 mt-1">
                                {formatCurrency(expense.amount, settings.primaryCurrency, settings.exchangeRate).primary} × 
                                {expense.frequency === 'once' ? ' once' : expense.frequency === 'perDay' ? ` ${DATES.totalDays} days` : ` ${expense.customCount}x`}
                                {' '} × {settings.students + settings.mentors} people
                              </div>
                              <div className="text-xs text-blue-600 mt-1 font-medium">
                                Total: {formatCurrency(
                                  expense.amount * 
                                  (expense.frequency === 'once' ? 1 : expense.frequency === 'perDay' ? DATES.totalDays : expense.customCount) * 
                                  (settings.students + settings.mentors),
                                  settings.primaryCurrency,
                                  settings.exchangeRate
                                ).primary}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingExpense(expense)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Edit2 className="w-3 h-3 text-gray-600" />
                              </button>
                              <button
                                onClick={() => deleteCustomExpense(expense.id)}
                                className="p-1 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addCustomExpense}
                    className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Expense
                  </button>
                  {customExpensesCost > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg text-xs">
                      <div className="font-semibold text-gray-900">
                        Total: {formatCurrency(customExpensesCost, settings.primaryCurrency, settings.exchangeRate).primary}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Summary
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Users className="w-3 h-3" />
                  <span className="text-xs">
                    {settings.students} students + {settings.mentors} mentors
                  </span>
                </div>
                
                <div className="pt-2 border-t space-y-1.5">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Hotel:</span>
                      <span className="font-medium">{formatCurrency(hotelCost.total, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">{formatCurrency(hotelCost.total, settings.primaryCurrency, settings.exchangeRate).secondary}</div>
                  </div>
                  {includeTransport && (
                    <div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Transport:</span>
                        <span className="font-medium">{formatCurrency(transportCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right">{formatCurrency(transportCost, settings.primaryCurrency, settings.exchangeRate).secondary}</div>
                    </div>
                  )}
                  {mealCost > 0 && (
                    <div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Meals:</span>
                        <span className="font-medium">{formatCurrency(mealCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right">{formatCurrency(mealCost, settings.primaryCurrency, settings.exchangeRate).secondary}</div>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Activities:</span>
                      <span className="font-medium">{formatCurrency(activitiesCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">{formatCurrency(activitiesCost, settings.primaryCurrency, settings.exchangeRate).secondary}</div>
                  </div>
                  {flightsCost > 0 && (
                    <div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Flights:</span>
                        <span className="font-medium">{formatCurrency(flightsCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right">{formatCurrency(flightsCost, settings.primaryCurrency, settings.exchangeRate).secondary}</div>
                    </div>
                  )}
                  {customExpensesCost > 0 && (
                    <div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Custom:</span>
                        <span className="font-medium">{formatCurrency(customExpensesCost, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right">{formatCurrency(customExpensesCost, settings.primaryCurrency, settings.exchangeRate).secondary}</div>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-gray-900">Total Cost:</span>
                    <div className="text-right">
                      <div className="font-bold text-base text-gray-900">
                        {formatCurrency(totalCost, settings.primaryCurrency, settings.exchangeRate).primary}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(totalCost, settings.primaryCurrency, settings.exchangeRate).secondary}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(costPerStudent, settings.primaryCurrency, settings.exchangeRate).primary} per student
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-gray-900">Revenue:</span>
                    <div className="text-right">
                      <div className="font-bold text-base text-green-600">
                        {formatCurrency(totalRevenue, settings.primaryCurrency, settings.exchangeRate).primary}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(totalRevenue, settings.primaryCurrency, settings.exchangeRate).secondary}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {settings.students} × {formatCurrency(settings.pricePerStudent, settings.primaryCurrency, settings.exchangeRate).primary}
                  </div>
                </div>

                {settings.taxPercent > 0 && (
                  <>
                    <div className="pt-2 border-t bg-red-50 -mx-4 px-4 py-2 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm text-gray-900 flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Tax ({settings.taxPercent}%):
                        </span>
                        <div className="text-right">
                          <div className="font-bold text-base text-red-600">
                            -{formatCurrency(taxOnRevenue, settings.primaryCurrency, settings.exchangeRate).primary}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(taxOnRevenue, settings.primaryCurrency, settings.exchangeRate).secondary}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm text-gray-900">After tax:</span>
                        <div className="text-right">
                          <div className="font-bold text-base text-blue-600">
                            {formatCurrency(revenueAfterTax, settings.primaryCurrency, settings.exchangeRate).primary}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(revenueAfterTax, settings.primaryCurrency, settings.exchangeRate).secondary}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="pt-2 border-t bg-gradient-to-r from-blue-50 to-purple-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-gray-900 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Gross Profit:
                    </span>
                    <div className="text-right">
                      <div className={`font-bold text-lg ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {grossProfit >= 0 ? '+' : ''}{formatCurrency(grossProfit, settings.primaryCurrency, settings.exchangeRate).primary}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(grossProfit, settings.primaryCurrency, settings.exchangeRate).secondary}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-600">Margin:</span>
                    <span className={`font-medium ${marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {marginPercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs text-gray-700 mb-1 font-semibold">Distribution (4 shares):</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Ментор:</span>
                        <span className="font-medium text-green-600">{formatCurrency(netMentor, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Аяжан:</span>
                        <span className="font-medium text-green-600">{formatCurrency(netAyazhan, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Бекс:</span>
                        <span className="font-medium text-green-600">{formatCurrency(netBeks, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tair:</span>
                        <span className="font-medium text-green-600">{formatCurrency(netTair, settings.primaryCurrency, settings.exchangeRate).primary}</span>
                      </div>
                    </div>
                    <div className="border-t mt-2 pt-2">
                      <div className="flex justify-between font-bold text-sm">
                        <span>Net Profit:</span>
                        <span className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(netProfit, settings.primaryCurrency, settings.exchangeRate).primary}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {settings.pricePerStudent === 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-xs text-yellow-700 font-medium mb-0.5">
                        💡 Set student price
                      </div>
                      <div className="text-xs text-yellow-600">
                        Min: {formatCurrency(Math.ceil(totalCost / settings.students), settings.primaryCurrency, settings.exchangeRate).primary}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
