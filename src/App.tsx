import { useState, useEffect } from 'react';
import { Calculator, Users, Hotel, Utensils, Sparkles, DollarSign, TrendingUp, Settings as SettingsIcon, MapPin } from 'lucide-react';

interface Settings {
  students: number;
  mentors: number;
  pricePerStudent: number;
}

interface Hotel {
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

interface Transport {
  mtr: number;
  ferry: number;
}

interface Meals {
  breakfast: number;
  lunch: number;
  dinner: number;
  perDay: number;
}

const DATES = {
  start: '2026-03-20',
  end: '2026-03-29',
  totalNights: 8,
  totalDays: 9
};

const HKD_TO_KZT = 64.55; // Exchange rate from table

const formatCurrency = (hkd: number) => {
  const kzt = hkd * HKD_TO_KZT;
  return {
    hkd: hkd.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    kzt: kzt.toLocaleString('en-US', { maximumFractionDigits: 0 })
  };
};

const HOTELS: Hotel[] = [
  {
    name: 'The BEACON',
    pricePerPerson: 3876,
    pricePerPair: 7752,
    includesBreakfast: false,
    includesTransfer: false,
    url: 'https://book-directonline.com/properties/TheBeaconDirect',
    notes: 'Without Breakfast'
  },
  {
    name: 'Dorsett Mongkok',
    pricePerPerson: 4451.5,
    pricePerPair: 8903,
    includesBreakfast: true,
    includesTransfer: true,
    url: 'https://www.book-secure.com/index.php?s=results&property=cnhon27154',
    notes: 'With Breakfast + Airport Transfer for group'
  }
];

const ACTIVITIES: Activity[] = [
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
  dinner: 1000,
  perDay: 300
};

function App() {
  const [settings, setSettings] = useState<Settings>({
    students: 24,
    mentors: 2,
    pricePerStudent: 0
  });

  const [selectedHotel, setSelectedHotel] = useState<Hotel>(HOTELS[1]); // Dorsett as default
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);
  
  const [mealOption, setMealOption] = useState<'none' | 'breakfast' | 'lunch-dinner' | 'all'>('none');
  const [customMealPrice, setCustomMealPrice] = useState({
    breakfast: MEALS_BASE.breakfast,
    lunch: MEALS_BASE.lunch,
    dinner: MEALS_BASE.dinner
  });

  const [includeTransport, setIncludeTransport] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  // Calculate hotel costs
  const calculateHotelCost = () => {
    const totalPeople = settings.students + settings.mentors;
    
    // Students in pairs
    const studentPairs = Math.floor(settings.students / 2);
    const studentSingles = settings.students % 2;
    
    // Mentors solo
    const mentorSingles = settings.mentors;
    
    const pairsCost = studentPairs * selectedHotel.pricePerPair;
    const singlesCost = (studentSingles + mentorSingles) * selectedHotel.pricePerPerson;
    
    return {
      total: pairsCost + singlesCost,
      pairs: studentPairs,
      singles: studentSingles + mentorSingles,
      perPerson: selectedHotel.pricePerPerson
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
    const totalPeople = settings.students + settings.mentors;
    
    // If hotel includes breakfast, don't charge for it
    const breakfastIncluded = selectedHotel.includesBreakfast;
    
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

  // Calculate activities cost
  const calculateActivitiesCost = () => {
    const totalPeople = settings.students + settings.mentors;
    return activities
      .filter(a => a.enabled)
      .reduce((sum, activity) => sum + (activity.pricePerPerson * totalPeople), 0);
  };

  const hotelCost = calculateHotelCost();
  const transportCost = calculateTransportCost();
  const mealCost = calculateMealCost();
  const activitiesCost = calculateActivitiesCost();
  
  const totalCost = hotelCost.total + transportCost + mealCost + activitiesCost;
  
  // Revenue (only students pay)
  const totalRevenue = settings.students * settings.pricePerStudent;
  
  // Profit
  const profit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  
  // Cost per person
  const costPerStudent = settings.students > 0 ? totalCost / settings.students : 0;
  const costPerMentor = totalCost / (settings.students + settings.mentors);

  const toggleActivity = (id: string) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    
    setAiResponse('🤖 Анализирую твой запрос...');
    
    setTimeout(() => {
      const suggestions = [];
      
      if (aiPrompt.toLowerCase().includes('цена') || aiPrompt.toLowerCase().includes('стоимость')) {
        const breakEvenPrice = Math.ceil(totalCost / settings.students);
        const recommended = Math.ceil(breakEvenPrice * 1.1);
        suggestions.push(`💰 Минимальная цена (без прибыли): ${breakEvenPrice.toLocaleString()} HKD`);
        suggestions.push(`✅ Рекомендуемая цена (+10% маржа): ${recommended.toLocaleString()} HKD`);
      }
      
      if (aiPrompt.toLowerCase().includes('диснейленд')) {
        const withoutDisney = totalCost - (752 * (settings.students + settings.mentors));
        suggestions.push(`🏰 Без Диснейленда: ${withoutDisney.toLocaleString()} HKD`);
        suggestions.push(`💾 Экономия: ${(totalCost - withoutDisney).toLocaleString()} HKD`);
      }
      
      if (aiPrompt.toLowerCase().includes('отель') || aiPrompt.toLowerCase().includes('hotel')) {
        suggestions.push(`🏨 Текущий отель: ${selectedHotel.name}`);
        suggestions.push(`💵 ${selectedHotel.pricePerPerson.toLocaleString()} HKD за человека`);
        if (selectedHotel.includesBreakfast) suggestions.push(`✓ Завтрак включен`);
        if (selectedHotel.includesTransfer) suggestions.push(`✓ Трансфер включен`);
      }
      
      suggestions.push(`\n📊 Текущие показатели:`);
      suggestions.push(`• Себестоимость: ${totalCost.toLocaleString()} HKD`);
      suggestions.push(`• На студента: ${costPerStudent.toFixed(0)} HKD`);
      suggestions.push(`• Прибыль: ${profit >= 0 ? '+' : ''}${profit.toLocaleString()} HKD`);
      suggestions.push(`• Маржа: ${marginPercent.toFixed(1)}%`);
      
      setAiResponse(suggestions.join('\n'));
    }, 800);
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                Отель
              </h2>
              
              <div className="space-y-3">
                {HOTELS.map((hotel, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedHotel(hotel)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedHotel.name === hotel.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
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
                Питание
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
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Активности
              </h2>
              
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 border-2 rounded-lg transition ${
                      activity.enabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
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

            {/* AI Assistant */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                AI Помощник
              </h2>
              
              <div className="space-y-3">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Например: 'Какую цену поставить для прибыли 20,000 HKD?'"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                />
                
                <button
                  onClick={handleAiAssist}
                  disabled={!aiPrompt.trim()}
                  className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Спросить AI
                </button>
                
                {aiResponse && (
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                      {aiResponse}
                    </pre>
                  </div>
                )}
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
                
                <div className="pt-3 border-t space-y-2 text-sm">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Отель:</span>
                      <span className="font-medium">{formatCurrency(hotelCost.total).hkd} HKD</span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">≈ {formatCurrency(hotelCost.total).kzt} ₸</div>
                  </div>
                  {includeTransport && (
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Транспорт:</span>
                        <span className="font-medium">{formatCurrency(transportCost).hkd} HKD</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right">≈ {formatCurrency(transportCost).kzt} ₸</div>
                    </div>
                  )}
                  {mealCost > 0 && (
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Питание:</span>
                        <span className="font-medium">{formatCurrency(mealCost).hkd} HKD</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right">≈ {formatCurrency(mealCost).kzt} ₸</div>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Активности:</span>
                      <span className="font-medium">{formatCurrency(activitiesCost).hkd} HKD</span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">≈ {formatCurrency(activitiesCost).kzt} ₸</div>
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
                    <div>{formatCurrency(costPerMentor).hkd} HKD / {formatCurrency(costPerMentor).kzt} ₸ на человека (среднее)</div>
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
