import { useState } from 'react';
import { Calculator, Users, Hotel, Utensils, Sparkles, DollarSign, TrendingUp, Settings as SettingsIcon, MapPin, Plane, Plus, Edit2, Trash2, Camera, Percent, PieChart } from 'lucide-react';

interface Settings {
  students: number;
  mentors: number;
  pricePerStudent: number;
  taxPercent: number;
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

interface Meals {
  breakfast: number;
  lunch: number;
  dinner: number;
}

const DATES = {
  start: '2026-03-20',
  end: '2026-03-29',
  totalNights: 8,
  totalDays: 9
};

const HKD_TO_KZT = 64.55;

const formatCurrency = (hkd: number) => {
  const kzt = hkd * HKD_TO_KZT;
  return {
    hkd: hkd.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    kzt: kzt.toLocaleString('en-US', { maximumFractionDigits: 0 })
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
    id: 'lantau-island',
    name: 'Lantau Island (Ngong Ping 360 + Big Buddha)',
    pricePerPerson: 365,
    enabled: true,
    notes: 'Crystal Cabin Round Route',
    url: 'https://webstore.np360.com.hk/en/p/cable-car-ticket'
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

const MEALS_BASE: Meals = {
  breakfast: 1000,
  lunch: 1000,
  dinner: 1000
};

function App() {
  const [settings, setSettings] = useState<Settings>({
    students: 24,
    mentors: 2,
    pricePerStudent: 0,
    taxPercent: 0
  });

  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('dorsett');
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [flights, setFlights] = useState<Flight[]>([
    {
      id: 'outbound',
      name: 'Астана → Гонконг',
      route: 'TSE → HKG',
      date: '2026-03-20',
      time: '10:00',
      price: 0,
      notes: 'Только для менторов'
    },
    {
      id: 'return',
      name: 'Гонконг → Астана',
      route: 'HKG → TSE',
      date: '2026-03-29',
      time: '18:00',
      price: 0,
      notes: 'Только для менторов'
    }
  ]);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  const [mealOption, setMealOption] = useState<'none' | 'breakfast' | 'lunch-dinner' | 'all'>('none');
  const [customMealPrice, setCustomMealPrice] = useState<Meals>(MEALS_BASE);

  const [includeTransport, setIncludeTransport] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const selectedHotel = hotels.find(h => h.id === selectedHotelId) || hotels[0];

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
      singles: studentSingles + mentorSingles,
      studentsCost: pairsCost + (studentSingles * selectedHotel.pricePerPerson),
      mentorsCost: mentorSingles * selectedHotel.pricePerPerson
    };
  };

  // Calculate transport costs
  const calculateTransportCost = () => {
    if (!includeTransport) return { total: 0, studentsCost: 0, mentorsCost: 0 };
    const perPerson = TRANSPORT.mtr + TRANSPORT.ferry;
    return {
      total: perPerson * (settings.students + settings.mentors),
      studentsCost: perPerson * settings.students,
      mentorsCost: perPerson * settings.mentors
    };
  };

  // Calculate meal costs
  const calculateMealCost = () => {
    const breakfastIncluded = selectedHotel.includesBreakfast;
    const totalPeople = settings.students + settings.mentors;
    
    let total = 0;
    switch (mealOption) {
      case 'all':
        total = totalPeople * (
          (breakfastIncluded ? 0 : customMealPrice.breakfast) +
          customMealPrice.lunch +
          customMealPrice.dinner
        );
        break;
      case 'lunch-dinner':
        total = totalPeople * (customMealPrice.lunch + customMealPrice.dinner);
        break;
      case 'breakfast':
        total = breakfastIncluded ? 0 : totalPeople * customMealPrice.breakfast;
        break;
      default:
        total = 0;
    }

    const perPerson = totalPeople > 0 ? total / totalPeople : 0;
    return {
      total,
      studentsCost: perPerson * settings.students,
      mentorsCost: perPerson * settings.mentors
    };
  };

  // Calculate activities cost
  const calculateActivitiesCost = () => {
    const totalPeople = settings.students + settings.mentors;
    const total = activities
      .filter(a => a.enabled)
      .reduce((sum, activity) => sum + (activity.pricePerPerson * totalPeople), 0);
    
    const perPerson = totalPeople > 0 ? total / totalPeople : 0;
    return {
      total,
      studentsCost: perPerson * settings.students,
      mentorsCost: perPerson * settings.mentors
    };
  };

  // Calculate flights cost
  const calculateFlightsCost = () => {
    const total = flights.reduce((sum, flight) => sum + (flight.price * settings.mentors), 0);
    return {
      total,
      studentsCost: 0,
      mentorsCost: total
    };
  };

  const hotelCost = calculateHotelCost();
  const transportCost = calculateTransportCost();
  const mealCost = calculateMealCost();
  const activitiesCost = calculateActivitiesCost();
  const flightsCost = calculateFlightsCost();
  
  const totalCost = hotelCost.total + transportCost.total + mealCost.total + activitiesCost.total + flightsCost.total;
  const totalMentorCost = hotelCost.mentorsCost + transportCost.mentorsCost + mealCost.mentorsCost + activitiesCost.mentorsCost + flightsCost.mentorsCost;
  const totalStudentsCost = hotelCost.studentsCost + transportCost.studentsCost + mealCost.studentsCost + activitiesCost.studentsCost + flightsCost.studentsCost;
  
  // Revenue (only students pay)
  const totalRevenue = settings.students * settings.pricePerStudent;
  
  // Tax calculation
  const taxAmount = (totalRevenue * settings.taxPercent) / 100;
  const revenueAfterTax = totalRevenue - taxAmount;
  
  // Profit
  const profit = revenueAfterTax - totalCost;
  const marginPercent = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  
  // Cost per student (includes mentor costs share!)
  const costPerStudent = settings.students > 0 ? totalCost / settings.students : 0;
  const marginPerStudent = settings.students > 0 ? profit / settings.students : 0;

  const toggleActivity = (id: string) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const addHotel = () => {
    const newHotel: Hotel = {
      id: `hotel-${Date.now()}`,
      name: 'Новый отель',
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
      name: 'Новая активность',
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
      name: 'Новый рейс',
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hong Kong Trip Calculator v2</h1>
                <p className="text-gray-600 text-sm">📅 {DATES.start} → {DATES.end} ({DATES.totalNights} ночей, {DATES.totalDays} дней)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
              >
                <PieChart className="w-4 h-4" />
                {showBreakdown ? 'Скрыть' : 'Показать'} детали
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <SettingsIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Настройки
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество студентов
                </label>
                <input
                  type="number"
                  value={settings.students}
                  onChange={(e) => setSettings({ ...settings, students: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество менторов
                </label>
                <input
                  type="number"
                  value={settings.mentors}
                  onChange={(e) => setSettings({ ...settings, mentors: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Едут бесплатно (включены в расходы)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена для студента (HKD)
                </label>
                <input
                  type="number"
                  value={settings.pricePerStudent}
                  onChange={(e) => setSettings({ ...settings, pricePerStudent: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  Налог (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxPercent}
                  onChange={(e) => setSettings({ ...settings, taxPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Вычитается из выручки</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Breakdown Panel */}
        {showBreakdown && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 mb-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Детализация Расходов</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Cost Breakdown */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Разбивка по Категориям</h3>
                
                <div className="space-y-4">
                  {/* Hotel */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900">🏨 Отель</div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{formatCurrency(hotelCost.total).hkd} HKD</div>
                        <div className="text-xs text-gray-500">{((hotelCost.total / totalCost) * 100).toFixed(1)}% от общих расходов</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Студенты:</span>
                        <span>{formatCurrency(hotelCost.studentsCost).hkd} HKD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Менторы:</span>
                        <span className="text-orange-600">{formatCurrency(hotelCost.mentorsCost).hkd} HKD</span>
                      </div>
                    </div>
                  </div>

                  {/* Transport */}
                  {transportCost.total > 0 && (
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-900">🚇 Транспорт</div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{formatCurrency(transportCost.total).hkd} HKD</div>
                          <div className="text-xs text-gray-500">{((transportCost.total / totalCost) * 100).toFixed(1)}% от общих расходов</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Студенты:</span>
                          <span>{formatCurrency(transportCost.studentsCost).hkd} HKD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Менторы:</span>
                          <span className="text-orange-600">{formatCurrency(transportCost.mentorsCost).hkd} HKD</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meals */}
                  {mealCost.total > 0 && (
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-900">🍽️ Питание</div>
                        <div className="text-right">
                          <div className="font-bold text-yellow-600">{formatCurrency(mealCost.total).hkd} HKD</div>
                          <div className="text-xs text-gray-500">{((mealCost.total / totalCost) * 100).toFixed(1)}% от общих расходов</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Студенты:</span>
                          <span>{formatCurrency(mealCost.studentsCost).hkd} HKD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Менторы:</span>
                          <span className="text-orange-600">{formatCurrency(mealCost.mentorsCost).hkd} HKD</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activities */}
                  {activitiesCost.total > 0 && (
                    <div className="border-l-4 border-purple-500 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-900">🎭 Активности</div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600">{formatCurrency(activitiesCost.total).hkd} HKD</div>
                          <div className="text-xs text-gray-500">{((activitiesCost.total / totalCost) * 100).toFixed(1)}% от общих расходов</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Студенты:</span>
                          <span>{formatCurrency(activitiesCost.studentsCost).hkd} HKD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Менторы:</span>
                          <span className="text-orange-600">{formatCurrency(activitiesCost.mentorsCost).hkd} HKD</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flights */}
                  {flightsCost.total > 0 && (
                    <div className="border-l-4 border-red-500 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-900">✈️ Перелеты</div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">{formatCurrency(flightsCost.total).hkd} HKD</div>
                          <div className="text-xs text-gray-500">{((flightsCost.total / totalCost) * 100).toFixed(1)}% от общих расходов</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Только менторы:</span>
                          <span className="text-orange-600">{formatCurrency(flightsCost.mentorsCost).hkd} HKD</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Итого Расходы:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost).hkd} HKD</div>
                      <div className="text-sm text-gray-500">≈ {formatCurrency(totalCost).kzt} ₸</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Financial Summary */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Финансовая Сводка</h3>
                
                <div className="space-y-4">
                  {/* Revenue */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Выручка (от студентов)</div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue).hkd} HKD</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.students} студентов × {formatCurrency(settings.pricePerStudent).hkd} HKD
                    </div>
                  </div>

                  {/* Tax */}
                  {settings.taxPercent > 0 && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Percent className="w-4 h-4" />
                        Налог ({settings.taxPercent}%)
                      </div>
                      <div className="text-2xl font-bold text-red-600">-{formatCurrency(taxAmount).hkd} HKD</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Вычитается из выручки
                      </div>
                    </div>
                  )}

                  {/* Revenue After Tax */}
                  {settings.taxPercent > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Выручка после налога</div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(revenueAfterTax).hkd} HKD</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ≈ {formatCurrency(revenueAfterTax).kzt} ₸
                      </div>
                    </div>
                  )}

                  {/* Total Costs */}
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Общие Расходы</div>
                    <div className="text-2xl font-bold text-orange-600">-{formatCurrency(totalCost).hkd} HKD</div>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      <div>• Студенты: {formatCurrency(totalStudentsCost).hkd} HKD</div>
                      <div>• Менторы: {formatCurrency(totalMentorCost).hkd} HKD</div>
                    </div>
                  </div>

                  {/* Profit */}
                  <div className={`rounded-lg p-4 ${profit >= 0 ? 'bg-gradient-to-br from-green-100 to-emerald-100' : 'bg-gradient-to-br from-red-100 to-pink-100'}`}>
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {profit >= 0 ? 'Чистая Прибыль' : 'Убыток'}
                    </div>
                    <div className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profit >= 0 ? '+' : ''}{formatCurrency(profit).hkd} HKD
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ≈ {profit >= 0 ? '+' : ''}{formatCurrency(profit).kzt} ₸
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-300 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Маржинальность:</span>
                        <span className="font-bold">{marginPercent.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>На студента:</span>
                        <span className="font-bold">{profit >= 0 ? '+' : ''}{formatCurrency(marginPerStudent).hkd} HKD</span>
                      </div>
                    </div>
                  </div>

                  {/* Cost per Student */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Себестоимость на студента</div>
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(costPerStudent).hkd} HKD</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Включая долю расходов на менторов
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the components remain the same... */}
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">Hong Kong Trip Calculator v2 with Detailed Breakdown</p>
        </div>
      </div>
    </div>
  );
}

export default App;
