import { useState, useEffect } from 'react';
import { Calculator, Users, Hotel, Utensils, Sparkles, DollarSign, TrendingUp, Settings as SettingsIcon, MapPin, Plane, Plus, Edit2, Trash2, Camera, Percent, PieChart, ChevronDown, ChevronUp, X } from 'lucide-react';

interface Settings {
  students: number;
  mentors: number;
  pricePerStudent: number;
  taxPercent: number;
  exchangeRate: number;
  mentorMealsPerDay: number;
  mentorCostPerMeal: number;
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

interface MarginDistribution {
  mentor: number;
  ayazhan: number;
  beks: number;
  tair: number;
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

// Simple price formatter - shows HKD with KZT below
const formatPrice = (hkdAmount: number, exchangeRate: number) => {
  return {
    hkd: hkdAmount.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' HKD',
    kzt: '₸' + (hkdAmount * exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })
  };
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

// LocalStorage helpers with debouncing
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, 500);
};

function App() {
  const [settings, setSettings] = useState<Settings>(() => loadFromStorage('hk-trip-settings', {
    students: 24,
    mentors: 2,
    pricePerStudent: 0,
    taxPercent: 3,
    exchangeRate: 59,
    mentorMealsPerDay: 0,
    mentorCostPerMeal: 100
  }));

  const [marginDistribution, setMarginDistribution] = useState<MarginDistribution>(() => loadFromStorage('hk-trip-margin', {
    mentor: 25,
    ayazhan: 25,
    beks: 25,
    tair: 25
  }));

  const [taxConfig, setTaxConfig] = useState<TaxConfig>(() => loadFromStorage('hk-trip-tax', {
    mentor: 17,
    ayazhan: 17,
    beks: 17,
    tair: 0
  }));

  const [hotels, setHotels] = useState<Hotel[]>(() => loadFromStorage('hk-trip-hotels', INITIAL_HOTELS));
  const [selectedHotelId, setSelectedHotelId] = useState<string>(() => loadFromStorage('hk-trip-selected-hotel', 'dorsett'));
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const [activities, setActivities] = useState<Activity[]>(() => loadFromStorage('hk-trip-activities', INITIAL_ACTIVITIES));
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [flights, setFlights] = useState<Flight[]>(() => loadFromStorage('hk-trip-flights', [
    {
      id: 'mentor-flight',
      name: 'Mentor Round-trip Flight',
      route: 'TSE ⇄ HKG',
      date: '2026-03-20',
      time: '10:00',
      price: 0,
      notes: 'Total round-trip cost per mentor'
    }
  ]));
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  const [mealsPerDay, setMealsPerDay] = useState(() => loadFromStorage('hk-trip-meals-per-day', 0));
  const [costPerMeal, setCostPerMeal] = useState(() => loadFromStorage('hk-trip-cost-per-meal', 100));

  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>(() => loadFromStorage('hk-trip-custom-expenses', []));
  const [editingExpense, setEditingExpense] = useState<CustomExpense | null>(null);

  const [includeTransport, setIncludeTransport] = useState(() => loadFromStorage('hk-trip-include-transport', true));
  const [showSettings, setShowSettings] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Accordion states
  const [accordionState, setAccordionState] = useState(() => loadFromStorage('hk-trip-accordion', {
    flights: true,
    hotel: true,
    transport: true,
    meals: true,
    activities: true,
    customExpenses: true
  }));

  // Auto-save to localStorage
  useEffect(() => { saveToStorage('hk-trip-settings', settings); }, [settings]);
  useEffect(() => { saveToStorage('hk-trip-margin', marginDistribution); }, [marginDistribution]);
  useEffect(() => { saveToStorage('hk-trip-tax', taxConfig); }, [taxConfig]);
  useEffect(() => { saveToStorage('hk-trip-hotels', hotels); }, [hotels]);
  useEffect(() => { saveToStorage('hk-trip-selected-hotel', selectedHotelId); }, [selectedHotelId]);
  useEffect(() => { saveToStorage('hk-trip-activities', activities); }, [activities]);
  useEffect(() => { saveToStorage('hk-trip-flights', flights); }, [flights]);
  useEffect(() => { saveToStorage('hk-trip-meals-per-day', mealsPerDay); }, [mealsPerDay]);
  useEffect(() => { saveToStorage('hk-trip-cost-per-meal', costPerMeal); }, [costPerMeal]);
  useEffect(() => { saveToStorage('hk-trip-custom-expenses', customExpenses); }, [customExpenses]);
  useEffect(() => { saveToStorage('hk-trip-include-transport', includeTransport); }, [includeTransport]);
  useEffect(() => { saveToStorage('hk-trip-accordion', accordionState); }, [accordionState]);

  const selectedHotel = hotels.find(h => h.id === selectedHotelId) || hotels[0];

  const toggleAccordion = (section: keyof typeof accordionState) => {
    setAccordionState(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Auto-calculate Tair's share to ensure 100% total
  useEffect(() => {
    const total = marginDistribution.mentor + marginDistribution.ayazhan + marginDistribution.beks;
    if (total <= 100) {
      setMarginDistribution(prev => ({ ...prev, tair: 100 - total }));
    }
  }, [marginDistribution.mentor, marginDistribution.ayazhan, marginDistribution.beks]);

  // Calculate hotel costs
  const calculateHotelCost = () => {
    const studentPairs = Math.floor(settings.students / 2);
    const studentSingles = settings.students % 2;
    const mentorRooms = settings.mentors; // Each mentor gets their own pair room (queen bed)
    
    // Students in pairs + odd student in pair room (queen bed) + each mentor in pair room (queen bed)
    const totalPairRooms = studentPairs + studentSingles + mentorRooms;
    const totalCost = totalPairRooms * selectedHotel.pricePerPair;
    
    return {
      total: totalCost,
      pairs: studentPairs,
      soloRooms: studentSingles + mentorRooms, // Rooms with 1 person (but still pair/queen size)
      totalRooms: totalPairRooms
    };
  };

  // Calculate transport costs
  const calculateTransportCost = () => {
    if (!includeTransport) return 0;
    const totalPeople = settings.students + settings.mentors;
    return (TRANSPORT.mtr + TRANSPORT.ferry) * totalPeople;
  };

  // Calculate meal costs (for STUDENTS only, mentor meals separate!)
  const calculateMealCost = () => {
    return mealsPerDay * costPerMeal * DATES.totalDays * settings.students;
  };

  // Calculate MENTOR meal costs separately
  const calculateMentorMealCost = () => {
    return settings.mentorMealsPerDay * settings.mentorCostPerMeal * DATES.totalDays * settings.mentors;
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
  const mentorMealCost = calculateMentorMealCost();
  const activitiesCost = calculateActivitiesCost();
  const flightsCost = calculateFlightsCost();
  const customExpensesCost = calculateCustomExpensesCost();
  
  const totalCost = hotelCost.total + transportCost + mealCost + mentorMealCost + activitiesCost + flightsCost + customExpensesCost;
  
  // Revenue (only students pay)
  const totalRevenue = settings.students * settings.pricePerStudent;
  
  // Tax calculation
  const taxOnRevenue = (totalRevenue * settings.taxPercent) / 100;
  const revenueAfterTax = totalRevenue - taxOnRevenue;
  
  // Profit before margin distribution
  const grossProfit = revenueAfterTax - totalCost;
  
  // Margin distribution (customizable shares)
  const marginMentor = (grossProfit * marginDistribution.mentor) / 100;
  const marginAyazhan = (grossProfit * marginDistribution.ayazhan) / 100;
  const marginBeks = (grossProfit * marginDistribution.beks) / 100;
  const marginTair = (grossProfit * marginDistribution.tair) / 100;
  
  // Tax on each share
  const taxOnMentorShare = (marginMentor * taxConfig.mentor) / 100;
  const taxOnAyazhanShare = (marginAyazhan * taxConfig.ayazhan) / 100;
  const taxOnBeksShare = (marginBeks * taxConfig.beks) / 100;
  const taxOnTairShare = (marginTair * taxConfig.tair) / 100;
  
  // Net amounts for each person
  const netMentor = marginMentor - taxOnMentorShare;
  const netAyazhan = marginAyazhan - taxOnAyazhanShare;
  const netBeks = marginBeks - taxOnBeksShare;
  const netTair = marginTair - taxOnTairShare;
  
  const totalTaxOnShares = taxOnMentorShare + taxOnAyazhanShare + taxOnBeksShare + taxOnTairShare;
  const netProfit = grossProfit - totalTaxOnShares;
  
  const marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  
  // Cost per student
  const costPerStudent = settings.students > 0 ? totalCost / settings.students : 0;

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
                    <span>{settings.students} students × {formatPrice(settings.pricePerStudent, settings.exchangeRate).hkd}</span>
                    <span className="font-bold">{formatPrice(totalRevenue, settings.exchangeRate).hkd}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    ({formatPrice(totalRevenue, settings.exchangeRate).kzt})
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
                      <span className="font-bold text-red-600">-{formatPrice(taxOnRevenue, settings.exchangeRate).hkd}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      ({formatPrice(taxOnRevenue, settings.exchangeRate).kzt})
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-300">
                    <div className="flex justify-between font-bold">
                      <span>Revenue after tax</span>
                      <span className="text-blue-600">{formatPrice(revenueAfterTax, settings.exchangeRate).hkd}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Costs */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-orange-800 mb-2">💸 All Costs (Itemized)</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div>• Hotel ({hotelCost.totalRooms} room{hotelCost.totalRooms !== 1 ? 's' : ''})</div>
                      <div className="text-xs text-gray-500 ml-3 mt-0.5">
                        {hotelCost.pairs} pair{hotelCost.pairs !== 1 ? 's' : ''} (students together){hotelCost.soloRooms > 0 ? `, ${hotelCost.soloRooms} solo (${settings.students % 2 > 0 ? '1 student + ' : ''}${settings.mentors} mentor${settings.mentors !== 1 ? 's' : ''})` : ''}
                      </div>
                    </div>
                    <span className="ml-2">{formatPrice(hotelCost.total, settings.exchangeRate).hkd}</span>
                  </div>
                  {flightsCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Flights ({settings.mentors} mentors)</span>
                      <span>{formatPrice(flightsCost, settings.exchangeRate).hkd}</span>
                    </div>
                  )}
                  {mentorMealCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Mentor Meals ({settings.mentorMealsPerDay}/day × {settings.mentors} mentors × {DATES.totalDays} days)</span>
                      <span>{formatPrice(mentorMealCost, settings.exchangeRate).hkd}</span>
                    </div>
                  )}
                  {transportCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Transport (MTR + Ferry)</span>
                      <span>{formatPrice(transportCost, settings.exchangeRate).hkd}</span>
                    </div>
                  )}
                  {mealCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Student Meals ({mealsPerDay}/day × {settings.students} students × {DATES.totalDays} days)</span>
                      <span>{formatPrice(mealCost, settings.exchangeRate).hkd}</span>
                    </div>
                  )}
                  {activitiesCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Activities ({activities.filter(a => a.enabled).length} items)</span>
                      <span>{formatPrice(activitiesCost, settings.exchangeRate).hkd}</span>
                    </div>
                  )}
                  {customExpensesCost > 0 && (
                    <div className="flex justify-between">
                      <span>• Custom Expenses ({customExpenses.length} items)</span>
                      <span>{formatPrice(customExpensesCost, settings.exchangeRate).hkd}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-orange-300">
                  <div className="flex justify-between font-bold">
                    <span>Total Costs</span>
                    <span className="text-orange-600">{formatPrice(totalCost, settings.exchangeRate).hkd}</span>
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
                      {grossProfit >= 0 ? '+' : ''}{formatPrice(grossProfit, settings.exchangeRate).hkd}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    ({formatPrice(grossProfit, settings.exchangeRate).kzt})
                  </div>
                </div>
              </div>

              {/* Margin Distribution */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-purple-800 mb-2">🎯 Margin Distribution (Customizable Shares)</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Total shares: {marginDistribution.mentor + marginDistribution.ayazhan + marginDistribution.beks + marginDistribution.tair}%</span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-purple-300 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Ментор (Mentor) - {marginDistribution.mentor}%</span>
                        <span className="text-gray-600">Tax: {taxConfig.mentor}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Share: {formatPrice(marginMentor, settings.exchangeRate).hkd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">- Tax: {formatPrice(taxOnMentorShare, settings.exchangeRate).hkd}</span>
                        <span className="font-bold text-green-600">= {formatPrice(netMentor, settings.exchangeRate).hkd}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Аяжан (Ayazhan) - {marginDistribution.ayazhan}%</span>
                        <span className="text-gray-600">Tax: {taxConfig.ayazhan}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Share: {formatPrice(marginAyazhan, settings.exchangeRate).hkd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">- Tax: {formatPrice(taxOnAyazhanShare, settings.exchangeRate).hkd}</span>
                        <span className="font-bold text-green-600">= {formatPrice(netAyazhan, settings.exchangeRate).hkd}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Бекс (Beks) - {marginDistribution.beks}%</span>
                        <span className="text-gray-600">Tax: {taxConfig.beks}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Share: {formatPrice(marginBeks, settings.exchangeRate).hkd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">- Tax: {formatPrice(taxOnBeksShare, settings.exchangeRate).hkd}</span>
                        <span className="font-bold text-green-600">= {formatPrice(netBeks, settings.exchangeRate).hkd}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Tair (You) - {marginDistribution.tair}%</span>
                        <span className="text-gray-600">Tax: {taxConfig.tair}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Share: {formatPrice(marginTair, settings.exchangeRate).hkd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">- Tax: {formatPrice(taxOnTairShare, settings.exchangeRate).hkd}</span>
                        <span className="font-bold text-green-600">= {formatPrice(netTair, settings.exchangeRate).hkd}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-purple-400">
                    <div className="flex justify-between font-bold">
                      <span>Total tax on shares</span>
                      <span className="text-red-600">-{formatPrice(totalTaxOnShares, settings.exchangeRate).hkd}</span>
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
                      {netProfit >= 0 ? '+' : ''}{formatPrice(netProfit, settings.exchangeRate).hkd}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ({formatPrice(netProfit, settings.exchangeRate).kzt})
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
            <div className="flex gap-2 items-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <div className="text-xs text-gray-600 mb-1">Exchange Rate</div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">1 HKD =</span>
                  <input
                    type="number"
                    value={settings.exchangeRate}
                    onChange={(e) => {
                      const newRate = parseFloat(e.target.value) || 59;
                      setSettings({ ...settings, exchangeRate: newRate });
                    }}
                    step="0.01"
                    className="w-16 px-2 py-1 border border-blue-300 rounded text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">KZT</span>
                </div>
              </div>
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
                  Price per student (HKD)
                </label>
                <input
                  type="number"
                  value={settings.pricePerStudent}
                  onChange={(e) => setSettings({ ...settings, pricePerStudent: parseFloat(e.target.value) || 0 })}
                  placeholder="Price (HKD)"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <div className="text-xs text-gray-600 mt-1">
                  ≈ {formatPrice(settings.pricePerStudent, settings.exchangeRate).kzt}
                </div>
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
            </div>

            {/* Margin Distribution */}
            <div className="border-t pt-3 mb-4">
              <h3 className="text-sm font-bold mb-2">💰 Margin Distribution (%)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Ментор (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={marginDistribution.mentor}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                      setMarginDistribution({ ...marginDistribution, mentor: val });
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Аяжан (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={marginDistribution.ayazhan}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                      setMarginDistribution({ ...marginDistribution, ayazhan: val });
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Бекс (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={marginDistribution.beks}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                      setMarginDistribution({ ...marginDistribution, beks: val });
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tair (auto)</label>
                  <input
                    type="number"
                    value={marginDistribution.tair}
                    disabled
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Total: {marginDistribution.mentor + marginDistribution.ayazhan + marginDistribution.beks + marginDistribution.tair}% 
                {(marginDistribution.mentor + marginDistribution.ayazhan + marginDistribution.beks + marginDistribution.tair) === 100 ? ' ✅' : ' ⚠️ Must equal 100%'}
              </div>
            </div>

            {/* Tax Config */}
            <div className="border-t pt-3">
              <h3 className="text-sm font-bold mb-2">📊 Individual Tax Rates (%)</h3>
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
              <div className="text-base font-bold text-blue-600">{formatPrice(costPerStudent, settings.exchangeRate).hkd}</div>
              <div className="text-xs text-gray-600">{formatPrice(costPerStudent, settings.exchangeRate).kzt}</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Revenue</div>
              <div className="text-base font-bold text-green-600">{formatPrice(totalRevenue, settings.exchangeRate).hkd}</div>
              <div className="text-xs text-gray-600">{formatPrice(totalRevenue, settings.exchangeRate).kzt}</div>
            </div>

            {settings.taxPercent > 0 && (
              <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-red-200">
                <div className="text-xs text-gray-500 uppercase mb-1">Tax {settings.taxPercent}%</div>
                <div className="text-base font-bold text-red-600">-{formatPrice(taxOnRevenue, settings.exchangeRate).hkd}</div>
                <div className="text-xs text-gray-600">{formatPrice(taxOnRevenue, settings.exchangeRate).kzt}</div>
              </div>
            )}

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Margin</div>
              <div className={`text-base font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {grossProfit >= 0 ? '+' : ''}{formatPrice(grossProfit, settings.exchangeRate).hkd}
              </div>
              <div className="text-xs text-gray-600">{marginPercent.toFixed(1)}%</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-green-200">
              <div className="text-xs text-gray-500 uppercase mb-1">Net Profit</div>
              <div className={`text-base font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit >= 0 ? '+' : ''}{formatPrice(netProfit, settings.exchangeRate).hkd}
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
                              <div>
                                <input
                                  type="number"
                                  value={editingFlight.price}
                                  onChange={(e) => setEditingFlight({ ...editingFlight, price: parseFloat(e.target.value) || 0 })}
                                  placeholder="Price (HKD)"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <div className="text-xs text-gray-600 mt-1">
                                  ≈ {formatPrice(editingFlight.price, settings.exchangeRate).kzt}
                                </div>
                              </div>
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
                                <div className="text-xs mt-1">
                                  <div className="text-blue-600 font-medium">
                                    Total: {formatPrice(flight.price * settings.mentors, settings.exchangeRate).hkd} ({settings.mentors} × {formatPrice(flight.price, settings.exchangeRate).hkd})
                                  </div>
                                  <div className="text-gray-600">
                                    ≈ {formatPrice(flight.price * settings.mentors, settings.exchangeRate).kzt}
                                  </div>
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
                        Total flights: {formatPrice(flightsCost, settings.exchangeRate).hkd}
                      </div>
                      <div className="text-gray-500 mt-0.5">
                        {formatPrice(flightsCost, settings.exchangeRate).kzt}
                      </div>
                    </div>
                  )}
                  
                  {/* MENTOR MEALS - RIGHT NEXT TO FLIGHTS! */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      Mentor Meals (per mentor per day)
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Meals/day</label>
                        <input
                          type="number"
                          min="0"
                          max="3"
                          value={settings.mentorMealsPerDay}
                          onChange={(e) => setSettings({ ...settings, mentorMealsPerDay: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Cost/meal (HKD)</label>
                        <input
                          type="number"
                          value={settings.mentorCostPerMeal}
                          onChange={(e) => setSettings({ ...settings, mentorCostPerMeal: parseFloat(e.target.value) || 0 })}
                          placeholder="Cost (HKD)"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <div className="text-xs text-gray-600 mt-1">
                          ≈ {formatPrice(settings.mentorCostPerMeal, settings.exchangeRate).kzt}
                        </div>
                      </div>
                    </div>
                    {mentorMealCost > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <div className="font-semibold">
                          Total: {formatPrice(mentorMealCost, settings.exchangeRate).hkd}
                        </div>
                        <div className="text-gray-600">
                          ≈ {formatPrice(mentorMealCost, settings.exchangeRate).kzt}
                        </div>
                        <div className="text-gray-600 text-xs mt-1">
                          {settings.mentorMealsPerDay} meals/day × {settings.mentorCostPerMeal} HKD × {DATES.totalDays} days × {settings.mentors} mentors
                        </div>
                      </div>
                    )}
                  </div>
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
                              <div>
                                <input
                                  type="number"
                                  value={editingHotel.pricePerPair}
                                  onChange={(e) => setEditingHotel({ ...editingHotel, pricePerPair: parseFloat(e.target.value) || 0 })}
                                  placeholder="Price/pair (HKD)"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <div className="text-xs text-gray-600 mt-1">
                                  ≈ {formatPrice(editingHotel.pricePerPair, settings.exchangeRate).kzt}
                                </div>
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={editingHotel.pricePerPerson}
                                  onChange={(e) => setEditingHotel({ ...editingHotel, pricePerPerson: parseFloat(e.target.value) || 0 })}
                                  placeholder="Price/solo (HKD)"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <div className="text-xs text-gray-600 mt-1">
                                  ≈ {formatPrice(editingHotel.pricePerPerson, settings.exchangeRate).kzt}
                                </div>
                              </div>
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
                                <h3 className="font-bold text-sm">{hotel.name}</h3>
                                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                  <div>
                                    <div>Pair: {formatPrice(hotel.pricePerPair, settings.exchangeRate).hkd}</div>
                                    <div className="text-gray-500">≈ {formatPrice(hotel.pricePerPair, settings.exchangeRate).kzt}</div>
                                  </div>
                                  <div>
                                    <div>Solo: {formatPrice(hotel.pricePerPerson, settings.exchangeRate).hkd}</div>
                                    <div className="text-gray-500">≈ {formatPrice(hotel.pricePerPerson, settings.exchangeRate).kzt}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {hotel.notes && <div className="text-xs text-gray-500 mt-1">{hotel.notes}</div>}
                            <div className="flex gap-2 mt-2">
                              {hotel.includesBreakfast && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">🍳 Breakfast</span>
                              )}
                              {hotel.includesTransfer && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">🚐 Transfer</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addHotel}
                    className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Hotel
                  </button>
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
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={includeTransport}
                      onChange={(e) => setIncludeTransport(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Include MTR & Ferry costs</span>
                  </label>
                  
                  {includeTransport && (
                    <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                      <div>MTR/Buses: {TRANSPORT.mtr} HKD per person</div>
                      <div>Ferry: {TRANSPORT.ferry} HKD per person</div>
                      <div className="font-semibold pt-2 border-t">
                        Total: {formatPrice(transportCost, settings.exchangeRate).hkd}
                      </div>
                      <div className="text-gray-500">
                        ≈ {formatPrice(transportCost, settings.exchangeRate).kzt}
                      </div>
                      <div className="text-gray-500">
                        ({settings.students + settings.mentors} people × {TRANSPORT.mtr + TRANSPORT.ferry} HKD)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Meals (Students Only!) */}
            <div className="bg-white rounded-xl shadow-sm">
              <button
                onClick={() => toggleAccordion('meals')}
                className="w-full p-3 flex justify-between items-center hover:bg-gray-50 rounded-t-xl"
              >
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Student Meals
                </h2>
                {accordionState.meals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {accordionState.meals && (
                <div className="p-3 border-t">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Meals per day</label>
                      <input
                        type="number"
                        min="0"
                        value={mealsPerDay}
                        onChange={(e) => setMealsPerDay(parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Cost per meal (HKD)</label>
                      <input
                        type="number"
                        value={costPerMeal}
                        onChange={(e) => setCostPerMeal(parseFloat(e.target.value) || 0)}
                        placeholder="Cost (HKD)"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <div className="text-xs text-gray-600 mt-1">
                        ≈ {formatPrice(costPerMeal, settings.exchangeRate).kzt}
                      </div>
                    </div>
                  </div>
                  
                  {mealCost > 0 && (
                    <div className="bg-gray-50 rounded-lg p-2 text-xs">
                      <div className="font-semibold">
                        Total: {formatPrice(mealCost, settings.exchangeRate).hkd}
                      </div>
                      <div className="text-gray-500">
                        ≈ {formatPrice(mealCost, settings.exchangeRate).kzt}
                      </div>
                      <div className="text-gray-500 mt-0.5">
                        {mealsPerDay} meals/day × {costPerMeal} HKD × {DATES.totalDays} days × {settings.students} students
                      </div>
                    </div>
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
                              placeholder="Activity name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <div>
                              <input
                                type="number"
                                value={editingActivity.pricePerPerson}
                                onChange={(e) => setEditingActivity({ ...editingActivity, pricePerPerson: parseFloat(e.target.value) || 0 })}
                                placeholder="Price per person (HKD)"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-xs text-gray-600 mt-1">
                                ≈ {formatPrice(editingActivity.pricePerPerson, settings.exchangeRate).kzt}
                              </div>
                            </div>
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
                          <div className="flex items-center gap-2 p-2 border-2 border-gray-200 rounded-lg">
                            <input
                              type="checkbox"
                              checked={activity.enabled}
                              onChange={() => toggleActivity(activity.id)}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-semibold">{activity.name}</div>
                              <div className="text-xs text-gray-600">
                                <div>{formatPrice(activity.pricePerPerson, settings.exchangeRate).hkd}/person</div>
                                <div className="text-gray-500">≈ {formatPrice(activity.pricePerPerson, settings.exchangeRate).kzt}</div>
                              </div>
                              {activity.notes && <div className="text-xs text-gray-500 mt-1">{activity.notes}</div>}
                            </div>
                            <button
                              onClick={() => setEditingActivity(activity)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="w-3 h-3 text-gray-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addActivity}
                    className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Activity
                  </button>
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
                  <DollarSign className="w-4 h-4" />
                  Custom Expenses
                </h2>
                {accordionState.customExpenses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {accordionState.customExpenses && (
                <div className="p-3 border-t">
                  {customExpenses.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {customExpenses.map((expense) => (
                        <div key={expense.id}>
                          {editingExpense?.id === expense.id ? (
                            <div className="p-3 border-2 border-blue-500 rounded-lg space-y-2">
                              <input
                                type="text"
                                value={editingExpense.name}
                                onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
                                placeholder="Expense name"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div>
                                <input
                                  type="number"
                                  value={editingExpense.amount}
                                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                                  placeholder="Amount (HKD)"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <div className="text-xs text-gray-600 mt-1">
                                  ≈ {formatPrice(editingExpense.amount, settings.exchangeRate).kzt}
                                </div>
                              </div>
                              <select
                                value={editingExpense.frequency}
                                onChange={(e) => setEditingExpense({ ...editingExpense, frequency: e.target.value as any })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="once">Once (total)</option>
                                <option value="perDay">Per day</option>
                                <option value="custom">Custom multiplier</option>
                              </select>
                              {editingExpense.frequency === 'custom' && (
                                <input
                                  type="number"
                                  value={editingExpense.customCount}
                                  onChange={(e) => setEditingExpense({ ...editingExpense, customCount: parseInt(e.target.value) || 1 })}
                                  placeholder="Multiplier"
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
                                <button
                                  onClick={() => { deleteCustomExpense(expense.id); setEditingExpense(null); }}
                                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 ml-auto"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-2 border-2 border-gray-200 rounded-lg">
                              <div>
                                <div className="text-sm font-semibold">{expense.name}</div>
                                <div className="text-xs text-gray-600">
                                  <div>{formatPrice(expense.amount, settings.exchangeRate).hkd} × {
                                    expense.frequency === 'once' ? '1' :
                                    expense.frequency === 'perDay' ? `${DATES.totalDays} days` :
                                    expense.customCount
                                  } × {settings.students + settings.mentors} people</div>
                                  <div className="text-gray-500">≈ {formatPrice(expense.amount, settings.exchangeRate).kzt} per unit</div>
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
                  )}
                  <button
                    onClick={addCustomExpense}
                    className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Custom Expense
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Breakdown */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Cost Breakdown
              </h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between pb-2 border-b">
                  <div>
                    <span className="text-gray-600">Hotel</span>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {hotelCost.totalRooms} room{hotelCost.totalRooms !== 1 ? 's' : ''}: {hotelCost.pairs} pair{hotelCost.pairs !== 1 ? 's' : ''} (students together){hotelCost.soloRooms > 0 ? `, ${hotelCost.soloRooms} solo (${settings.students % 2 > 0 ? '1 student + ' : ''}${settings.mentors} mentor${settings.mentors !== 1 ? 's' : ''})` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(hotelCost.total, settings.exchangeRate).hkd}</div>
                    <div className="text-xs text-gray-500">{formatPrice(hotelCost.total, settings.exchangeRate).kzt}</div>
                  </div>
                </div>
                
                {flightsCost > 0 && (
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-gray-600">Flights</span>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(flightsCost, settings.exchangeRate).hkd}</div>
                      <div className="text-xs text-gray-500">{formatPrice(flightsCost, settings.exchangeRate).kzt}</div>
                    </div>
                  </div>
                )}
                
                {mentorMealCost > 0 && (
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-gray-600">Mentor Meals</span>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(mentorMealCost, settings.exchangeRate).hkd}</div>
                      <div className="text-xs text-gray-500">{formatPrice(mentorMealCost, settings.exchangeRate).kzt}</div>
                    </div>
                  </div>
                )}
                
                {transportCost > 0 && (
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-gray-600">Transport</span>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(transportCost, settings.exchangeRate).hkd}</div>
                      <div className="text-xs text-gray-500">{formatPrice(transportCost, settings.exchangeRate).kzt}</div>
                    </div>
                  </div>
                )}
                
                {mealCost > 0 && (
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-gray-600">Student Meals</span>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(mealCost, settings.exchangeRate).hkd}</div>
                      <div className="text-xs text-gray-500">{formatPrice(mealCost, settings.exchangeRate).kzt}</div>
                    </div>
                  </div>
                )}
                
                {activitiesCost > 0 && (
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-gray-600">Activities</span>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(activitiesCost, settings.exchangeRate).hkd}</div>
                      <div className="text-xs text-gray-500">{formatPrice(activitiesCost, settings.exchangeRate).kzt}</div>
                    </div>
                  </div>
                )}
                
                {customExpensesCost > 0 && (
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-gray-600">Custom Expenses</span>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(customExpensesCost, settings.exchangeRate).hkd}</div>
                      <div className="text-xs text-gray-500">{formatPrice(customExpensesCost, settings.exchangeRate).kzt}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-2 text-lg font-bold">
                  <span>Total Cost</span>
                  <div className="text-right">
                    <div className="text-orange-600">{formatPrice(totalCost, settings.exchangeRate).hkd}</div>
                    <div className="text-sm text-gray-500">{formatPrice(totalCost, settings.exchangeRate).kzt}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-sm p-4 border-2 border-green-200">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-600" />
                Margin Distribution
              </h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between pb-2 border-b border-green-200">
                  <span className="font-medium">Ментор ({marginDistribution.mentor}%)</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatPrice(netMentor, settings.exchangeRate).hkd}</div>
                    <div className="text-xs text-gray-500">{formatPrice(netMentor, settings.exchangeRate).kzt}</div>
                  </div>
                </div>
                
                <div className="flex justify-between pb-2 border-b border-green-200">
                  <span className="font-medium">Аяжан ({marginDistribution.ayazhan}%)</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatPrice(netAyazhan, settings.exchangeRate).hkd}</div>
                    <div className="text-xs text-gray-500">{formatPrice(netAyazhan, settings.exchangeRate).kzt}</div>
                  </div>
                </div>
                
                <div className="flex justify-between pb-2 border-b border-green-200">
                  <span className="font-medium">Бекс ({marginDistribution.beks}%)</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatPrice(netBeks, settings.exchangeRate).hkd}</div>
                    <div className="text-xs text-gray-500">{formatPrice(netBeks, settings.exchangeRate).kzt}</div>
                  </div>
                </div>
                
                <div className="flex justify-between pb-2 border-b border-green-200">
                  <span className="font-medium">Tair ({marginDistribution.tair}%)</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatPrice(netTair, settings.exchangeRate).hkd}</div>
                    <div className="text-xs text-gray-500">{formatPrice(netTair, settings.exchangeRate).kzt}</div>
                  </div>
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
