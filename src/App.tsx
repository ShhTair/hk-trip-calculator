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
      singles: studentSingles + mentorSingles
    };
  };

  // Calculate transport costs
  const calculateTransportCost = () => {
    if (!includeTransport) return 0;
    const totalPeople = settings.students + settings.mentors;
    return (TRANSPORT.mtr + TRANSPORT.ferry) * totalPeople;
  };

  // Calculate meal costs (full coverage for mentors!)
  const calculateMealCost = () => {
    const breakfastIncluded = selectedHotel.includesBreakfast;
    const totalPeople = settings.students + settings.mentors;
    
    switch (mealOption) {
      case 'all':
        return totalPeople * (
          (breakfastIncluded ? 0 : customMealPrice.breakfast) +
          customMealPrice.lunch +
          customMealPrice.dinner
        );
      case 'lunch-dinner':
        return totalPeople * (customMealPrice.lunch + customMealPrice.dinner);
      case 'breakfast':
        return breakfastIncluded ? 0 : totalPeople * customMealPrice.breakfast;
      default:
        return 0;
    }
  };

  // Calculate activities cost (mentors included!)
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

  const hotelCost = calculateHotelCost();
  const transportCost = calculateTransportCost();
  const mealCost = calculateMealCost();
  const activitiesCost = calculateActivitiesCost();
  const flightsCost = calculateFlightsCost();
  
  const totalCost = hotelCost.total + transportCost + mealCost + activitiesCost + flightsCost;
  
  // Mentor costs breakdown
  const mentorHotelCost = settings.mentors * selectedHotel.pricePerPerson;
  const mentorTransportCost = includeTransport ? settings.mentors * (TRANSPORT.mtr + TRANSPORT.ferry) : 0;
  const mentorMealCost = mealCost > 0 ? (mealCost / (settings.students + settings.mentors)) * settings.mentors : 0;
  const mentorActivitiesCost = activitiesCost > 0 ? (activitiesCost / (settings.students + settings.mentors)) * settings.mentors : 0;
  const mentorFlightsCost = flightsCost;
  
  const totalMentorCost = mentorHotelCost + mentorTransportCost + mentorMealCost + mentorActivitiesCost + mentorFlightsCost;
  
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
                <h1 className="text-3xl font-bold text-gray-900">Hong Kong Trip Calculator</h1>
                <p className="text-gray-600 text-sm">📅 {DATES.start} → {DATES.end} ({DATES.totalNights} ночей, {DATES.totalDays} дней)</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <SettingsIcon className="w-6 h-6 text-gray-600" />
            </button>
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

        {/* Summary Card (NEW!) */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Итоги конфигурации</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Даты</div>
              <div className="text-lg font-bold text-gray-900">{DATES.totalDays} дней</div>
              <div className="text-xs text-gray-600">{DATES.start} → {DATES.end}</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Группа</div>
              <div className="text-lg font-bold text-gray-900">{settings.students + settings.mentors} чел</div>
              <div className="text-xs text-gray-600">{settings.students} студ + {settings.mentors} мент</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Себестоимость / студента</div>
              <div className="text-lg font-bold text-blue-600">{formatCurrency(costPerStudent).hkd} HKD</div>
              <div className="text-xs text-gray-600">≈ {formatCurrency(costPerStudent).kzt} ₸</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Общий банк (от студентов)</div>
              <div className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue).hkd} HKD</div>
              <div className="text-xs text-gray-600">≈ {formatCurrency(totalRevenue).kzt} ₸</div>
            </div>

            {settings.taxPercent > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-red-200">
                <div className="text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Налог ({settings.taxPercent}%)
                </div>
                <div className="text-lg font-bold text-red-600">-{formatCurrency(taxAmount).hkd} HKD</div>
                <div className="text-xs text-gray-600">≈ -{formatCurrency(taxAmount).kzt} ₸</div>
              </div>
            )}

            {settings.taxPercent > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-200">
                <div className="text-xs text-gray-500 uppercase mb-1">Банк после налога</div>
                <div className="text-lg font-bold text-blue-600">{formatCurrency(revenueAfterTax).hkd} HKD</div>
                <div className="text-xs text-gray-600">≈ {formatCurrency(revenueAfterTax).kzt} ₸</div>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Маржа на студента</div>
              <div className={`text-lg font-bold ${marginPerStudent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {marginPerStudent >= 0 ? '+' : ''}{formatCurrency(marginPerStudent).hkd} HKD
              </div>
              <div className="text-xs text-gray-600">≈ {formatCurrency(marginPerStudent).kzt} ₸</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Маржа на группу</div>
              <div className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profit >= 0 ? '+' : ''}{formatCurrency(profit).hkd} HKD
              </div>
              <div className="text-xs text-gray-600">≈ {formatCurrency(profit).kzt} ₸</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Маржинальность</div>
              <div className={`text-lg font-bold ${marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {marginPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">{profit >= 0 ? 'Прибыль' : 'Убыток'}</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 uppercase mb-1">Расходы на менторов</div>
              <div className="text-lg font-bold text-orange-600">{formatCurrency(totalMentorCost).hkd} HKD</div>
              <div className="text-xs text-gray-600">≈ {formatCurrency(totalMentorCost).kzt} ₸</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flights */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Перелеты (только менторы)
                </h2>
                <button
                  onClick={addFlight}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </button>
              </div>
              
              <div className="space-y-3">
                {flights.map((flight) => (
                  <div key={flight.id} className="p-4 border-2 border-gray-200 rounded-lg">
                    {editingFlight?.id === flight.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingFlight.name}
                          onChange={(e) => setEditingFlight({ ...editingFlight, name: e.target.value })}
                          placeholder="Название"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editingFlight.route}
                            onChange={(e) => setEditingFlight({ ...editingFlight, route: e.target.value })}
                            placeholder="Маршрут (TSE → HKG)"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="date"
                            value={editingFlight.date}
                            onChange={(e) => setEditingFlight({ ...editingFlight, date: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="time"
                            value={editingFlight.time}
                            onChange={(e) => setEditingFlight({ ...editingFlight, time: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            value={editingFlight.price}
                            onChange={(e) => setEditingFlight({ ...editingFlight, price: parseInt(e.target.value) || 0 })}
                            placeholder="Цена (HKD)"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <input
                          type="text"
                          value={editingFlight.notes}
                          onChange={(e) => setEditingFlight({ ...editingFlight, notes: e.target.value })}
                          placeholder="Примечания"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateFlight(editingFlight)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={() => setEditingFlight(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{flight.name}</h3>
                          <div className="text-sm text-gray-600 mt-1">
                            {flight.route} • {flight.date} {flight.time}
                          </div>
                          {flight.notes && (
                            <div className="text-xs text-gray-500 mt-1">{flight.notes}</div>
                          )}
                          {flight.price > 0 && (
                            <div className="text-xs text-blue-600 mt-1 font-medium">
                              {formatCurrency(flight.price * settings.mentors).hkd} HKD ({settings.mentors} × {formatCurrency(flight.price).hkd})
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingFlight(flight)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteFlight(flight.id)}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {flightsCost > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="font-semibold text-gray-900">
                    Итого перелеты: {formatCurrency(flightsCost).hkd} HKD
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ≈ {formatCurrency(flightsCost).kzt} ₸
                  </div>
                </div>
              )}
            </div>

            {/* Hotel Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Hotel className="w-5 h-5" />
                  Отель
                </h2>
                <button
                  onClick={addHotel}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </button>
              </div>
              
              <div className="space-y-3">
                {hotels.map((hotel) => (
                  <div key={hotel.id}>
                    {editingHotel?.id === hotel.id ? (
                      <div className="p-4 border-2 border-blue-500 rounded-lg space-y-3">
                        <input
                          type="text"
                          value={editingHotel.name}
                          onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                          placeholder="Название отеля"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            value={editingHotel.pricePerPair}
                            onChange={(e) => setEditingHotel({ ...editingHotel, pricePerPair: parseInt(e.target.value) || 0 })}
                            placeholder="Цена за пару (HKD)"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            value={editingHotel.pricePerPerson}
                            onChange={(e) => setEditingHotel({ ...editingHotel, pricePerPerson: parseInt(e.target.value) || 0 })}
                            placeholder="Цена соло (HKD)"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <input
                          type="text"
                          value={editingHotel.url}
                          onChange={(e) => setEditingHotel({ ...editingHotel, url: e.target.value })}
                          placeholder="URL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={editingHotel.notes}
                          onChange={(e) => setEditingHotel({ ...editingHotel, notes: e.target.value })}
                          placeholder="Примечания"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={editingHotel.includesBreakfast}
                              onChange={(e) => setEditingHotel({ ...editingHotel, includesBreakfast: e.target.checked })}
                            />
                            Завтрак включен
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={editingHotel.includesTransfer}
                              onChange={(e) => setEditingHotel({ ...editingHotel, includesTransfer: e.target.checked })}
                            />
                            Трансфер включен
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateHotel(editingHotel)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={() => setEditingHotel(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            Отмена
                          </button>
                          {hotels.length > 1 && (
                            <button
                              onClick={() => { deleteHotel(hotel.id); setEditingHotel(null); }}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 ml-auto"
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setSelectedHotelId(hotel.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition relative ${
                          selectedHotelId === hotel.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingHotel(hotel); }}
                          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <div className="flex justify-between items-start mb-2 pr-8">
                          <div>
                            <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{hotel.notes}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{hotel.pricePerPair.toLocaleString()} HKD</div>
                            <div className="text-xs text-gray-500">per pair</div>
                            <div className="text-xs text-gray-500 mt-1">{hotel.pricePerPerson.toLocaleString()} HKD solo</div>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs text-green-600">
                          {hotel.includesBreakfast && <span>✓ Завтрак</span>}
                          {hotel.includesTransfer && <span>✓ Трансфер</span>}
                        </div>
                        {hotel.url && (
                          <a 
                            href={hotel.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline mt-2 block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🔗 Открыть сайт
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                <div className="text-gray-600">
                  <div>Номера: {hotelCost.pairs} пары + {hotelCost.singles} одиночных</div>
                  <div className="font-semibold text-gray-900 mt-2">
                    Итого отель: {formatCurrency(hotelCost.total).hkd} HKD
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ≈ {formatCurrency(hotelCost.total).kzt} ₸
                  </div>
                </div>
              </div>
            </div>

            {/* Transport */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Транспорт
              </h2>
              
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition">
                <input
                  type="checkbox"
                  checked={includeTransport}
                  onChange={(e) => setIncludeTransport(e.target.checked)}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">MTR + Buses + Ferry</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {TRANSPORT.mtr} HKD (MTR/Buses) + {TRANSPORT.ferry} HKD (Ferry) = {TRANSPORT.mtr + TRANSPORT.ferry} HKD на человека
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {((TRANSPORT.mtr + TRANSPORT.ferry) * (settings.students + settings.mentors)).toLocaleString()} HKD
                  </div>
                  <div className="text-xs text-gray-500">всего</div>
                </div>
              </label>
            </div>

            {/* Meals */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Питание (менторам тоже покрывается!)
              </h2>
              
              {selectedHotel.includesBreakfast && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  ✓ Завтрак включен в отель
                </div>
              )}
              
              <div className="space-y-3">
                <div
                  onClick={() => setMealOption('none')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    mealOption === 'none' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Студенты сами оплачивают</div>
                  <div className="text-sm text-gray-500 mt-1">Фудкорты, кафе (0 HKD)</div>
                </div>
                
                {!selectedHotel.includesBreakfast && (
                  <div
                    onClick={() => setMealOption('breakfast')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      mealOption === 'breakfast' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">Только завтрак</div>
                        <div className="text-sm text-gray-500 mt-1">За весь период</div>
                      </div>
                      <div className="text-right">
                        <input
                          type="number"
                          value={customMealPrice.breakfast}
                          onChange={(e) => setCustomMealPrice({ ...customMealPrice, breakfast: parseInt(e.target.value) || 0 })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                        <div className="text-xs text-gray-500 mt-1">HKD/чел</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div
                  onClick={() => setMealOption('lunch-dinner')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    mealOption === 'lunch-dinner' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-3">
                    Обед + Ужин {selectedHotel.includesBreakfast && '(завтрак в отеле)'}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Обед (весь период)</label>
                      <input
                        type="number"
                        value={customMealPrice.lunch}
                        onChange={(e) => setCustomMealPrice({ ...customMealPrice, lunch: parseInt(e.target.value) || 0 })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Ужин (весь период)</label>
                      <input
                        type="number"
                        value={customMealPrice.dinner}
                        onChange={(e) => setCustomMealPrice({ ...customMealPrice, dinner: parseInt(e.target.value) || 0 })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div
                  onClick={() => setMealOption('all')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    mealOption === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-3">Полный пансион (весь период)</div>
                  <div className="grid grid-cols-3 gap-2">
                    {!selectedHotel.includesBreakfast && (
                      <div>
                        <label className="text-xs text-gray-600">Завтрак</label>
                        <input
                          type="number"
                          value={customMealPrice.breakfast}
                          onChange={(e) => setCustomMealPrice({ ...customMealPrice, breakfast: parseInt(e.target.value) || 0 })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-600">Обед</label>
                      <input
                        type="number"
                        value={customMealPrice.lunch}
                        onChange={(e) => setCustomMealPrice({ ...customMealPrice, lunch: parseInt(e.target.value) || 0 })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Ужин</label>
                      <input
                        type="number"
                        value={customMealPrice.dinner}
                        onChange={(e) => setCustomMealPrice({ ...customMealPrice, dinner: parseInt(e.target.value) || 0 })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {mealCost > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <div className="font-semibold text-gray-900">
                    Итого питание: {formatCurrency(mealCost).hkd} HKD
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ≈ {formatCurrency(mealCost).kzt} ₸
                  </div>
                </div>
              )}
            </div>

            {/* Activities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Активности (менторам тоже!)
                </h2>
                <button
                  onClick={addActivity}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </button>
              </div>
              
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id}>
                    {editingActivity?.id === activity.id ? (
                      <div className="p-4 border-2 border-blue-500 rounded-lg space-y-3">
                        <input
                          type="text"
                          value={editingActivity.name}
                          onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })}
                          placeholder="Название"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          value={editingActivity.pricePerPerson}
                          onChange={(e) => setEditingActivity({ ...editingActivity, pricePerPerson: parseInt(e.target.value) || 0 })}
                          placeholder="Цена на человека (HKD)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={editingActivity.notes}
                          onChange={(e) => setEditingActivity({ ...editingActivity, notes: e.target.value })}
                          placeholder="Примечания"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={editingActivity.url || ''}
                          onChange={(e) => setEditingActivity({ ...editingActivity, url: e.target.value })}
                          placeholder="URL (опционально)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateActivity(editingActivity)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={() => setEditingActivity(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={() => { deleteActivity(activity.id); setEditingActivity(null); }}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 ml-auto"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`p-4 border-2 rounded-lg transition relative ${
                          activity.enabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={() => setEditingActivity(activity)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <div className="flex items-start gap-3 pr-16">
                          <input
                            type="checkbox"
                            checked={activity.enabled}
                            onChange={() => toggleActivity(activity.id)}
                            className="mt-1 w-5 h-5"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>
                            {activity.url && (
                              <a 
                                href={activity.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                              >
                                🔗 Подробнее
                              </a>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.pricePerPerson.toLocaleString()} HKD
                            </div>
                            <div className="text-xs text-gray-500">per person</div>
                            {activity.enabled && (
                              <div className="text-xs text-blue-600 mt-1 font-medium">
                                {(activity.pricePerPerson * (settings.students + settings.mentors)).toLocaleString()} HKD
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <div className="font-semibold text-gray-900">
                  Итого активности: {formatCurrency(activitiesCost).hkd} HKD
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ≈ {formatCurrency(activitiesCost).kzt} ₸
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Итого
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {settings.students} студентов + {settings.mentors} менторов
                  </span>
                </div>
                
                <div className="pt-3 border-t space-y-2">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Отель:</span>
                      <span className="font-medium">{formatCurrency(hotelCost.total).hkd} HKD</span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">≈ {formatCurrency(hotelCost.total).kzt} ₸</div>
                  </div>
                  {includeTransport && (
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Транспорт:</span>
                        <span className="font-medium">{formatCurrency(transportCost).hkd} HKD</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right">≈ {formatCurrency(transportCost).kzt} ₸</div>
                    </div>
                  )}
                  {mealCost > 0 && (
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Питание:</span>
                        <span className="font-medium">{formatCurrency(mealCost).hkd} HKD</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right">≈ {formatCurrency(mealCost).kzt} ₸</div>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Активности:</span>
                      <span className="font-medium">{formatCurrency(activitiesCost).hkd} HKD</span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">≈ {formatCurrency(activitiesCost).kzt} ₸</div>
                  </div>
                  {flightsCost > 0 && (
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Перелеты:</span>
                        <span className="font-medium">{formatCurrency(flightsCost).hkd} HKD</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right">≈ {formatCurrency(flightsCost).kzt} ₸</div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t bg-orange-50 -mx-6 px-6 py-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Расходы на менторов:</span>
                    <div className="text-right">
                      <div className="font-bold text-lg text-orange-600">
                        {formatCurrency(totalMentorCost).hkd} HKD
                      </div>
                      <div className="text-xs text-gray-500">
                        ≈ {formatCurrency(totalMentorCost).kzt} ₸
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Отель: {formatCurrency(mentorHotelCost).hkd} HKD</div>
                    {mentorTransportCost > 0 && <div>• Транспорт: {formatCurrency(mentorTransportCost).hkd} HKD</div>}
                    {mentorMealCost > 0 && <div>• Питание: {formatCurrency(mentorMealCost).hkd} HKD</div>}
                    {mentorActivitiesCost > 0 && <div>• Активности: {formatCurrency(mentorActivitiesCost).hkd} HKD</div>}
                    {mentorFlightsCost > 0 && <div>• Перелеты: {formatCurrency(mentorFlightsCost).hkd} HKD</div>}
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Себестоимость:</span>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">
                        {formatCurrency(totalCost).hkd} HKD
                      </div>
                      <div className="text-xs text-gray-500">
                        ≈ {formatCurrency(totalCost).kzt} ₸
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>{formatCurrency(costPerStudent).hkd} HKD / {formatCurrency(costPerStudent).kzt} ₸ на студента</div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Доход:</span>
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-600">
                        {formatCurrency(totalRevenue).hkd} HKD
                      </div>
                      <div className="text-xs text-gray-500">
                        ≈ {formatCurrency(totalRevenue).kzt} ₸
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {settings.students} × {formatCurrency(settings.pricePerStudent).hkd} HKD
                  </div>
                </div>

                {settings.taxPercent > 0 && (
                  <>
                    <div className="pt-3 border-t bg-red-50 -mx-6 px-6 py-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900 flex items-center gap-1">
                          <Percent className="w-4 h-4" />
                          Налог ({settings.taxPercent}%):
                        </span>
                        <div className="text-right">
                          <div className="font-bold text-lg text-red-600">
                            -{formatCurrency(taxAmount).hkd} HKD
                          </div>
                          <div className="text-xs text-gray-500">
                            ≈ -{formatCurrency(taxAmount).kzt} ₸
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">Доход после налога:</span>
                        <div className="text-right">
                          <div className="font-bold text-lg text-blue-600">
                            {formatCurrency(revenueAfterTax).hkd} HKD
                          </div>
                          <div className="text-xs text-gray-500">
                            ≈ {formatCurrency(revenueAfterTax).kzt} ₸
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="pt-3 border-t bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Прибыль:
                    </span>
                    <div className="text-right">
                      <div className={`font-bold text-xl ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '+' : ''}{formatCurrency(profit).hkd} HKD
                      </div>
                      <div className="text-xs text-gray-500">
                        ≈ {profit >= 0 ? '+' : ''}{formatCurrency(profit).kzt} ₸
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Маржа:</span>
                    <span className={`font-medium ${marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {marginPercent.toFixed(1)}%
                    </span>
                  </div>
                  
                  {settings.pricePerStudent === 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-xs text-yellow-700 font-medium mb-1">
                        💡 Установите цену для студентов
                      </div>
                      <div className="text-xs text-yellow-600">
                        Минимум: {formatCurrency(Math.ceil(totalCost / settings.students)).hkd} HKD / {formatCurrency(Math.ceil(totalCost / settings.students)).kzt} ₸
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
