import React, { useState, useEffect, useRef } from 'react';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Users, 
  Briefcase, 
  Search, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  Car, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ChevronDown, 
  ArrowRight, 
  Smartphone, 
  Maximize2, 
  Send, 
  X, 
  Navigation,
  Check,
  Compass,
  Crosshair,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

declare const L: any;

interface Driver {
  id: string;
  name: string;
  rating: number;
  trips: number;
  car: string;
  color: string;
  badge: string;
  priceIQD: number;
  image: string;
  phone: string;
  plate: string;
}

interface Trip {
  id: string;
  mode: 'scheduled' | 'instant';
  fromDistrict: string;
  coords: { lat: number; lng: number };
  flightDate: string;
  flightTime: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  driver: Driver;
  status: 'confirmed' | 'on_way' | 'arrived' | 'completed';
  createdAt: string;
}

const BAGHDAD_DISTRICTS = [
  { name: 'المنصور', lat: 33.3128, lng: 44.3361, distanceMins: 35, basePrice: 35000 },
  { name: 'الكرخ - الحارثية', lat: 33.3190, lng: 44.3500, distanceMins: 30, basePrice: 30000 },
  { name: 'الكرادة', lat: 33.3056, lng: 44.4014, distanceMins: 45, basePrice: 40000 },
  { name: 'الزعفرانية / الدورة', lat: 33.2500, lng: 44.4167, distanceMins: 40, basePrice: 42000 },
  { name: 'الاعظمية', lat: 33.3667, lng: 44.3833, distanceMins: 50, basePrice: 45000 },
  { name: 'الجادرية', lat: 33.2833, lng: 44.3833, distanceMins: 40, basePrice: 40000 },
  { name: 'زيونة / البلديات', lat: 33.3333, lng: 44.4333, distanceMins: 55, basePrice: 50000 },
  { name: 'الكاظمية', lat: 33.3833, lng: 44.3333, distanceMins: 35, basePrice: 35000 },
  { name: 'الغزالية / الخضراء', lat: 33.3333, lng: 44.2833, distanceMins: 25, basePrice: 28000 },
  { name: 'الباب الشرقي / مركز العاصمة', lat: 33.3386, lng: 44.3939, distanceMins: 40, basePrice: 38000 },
];

const AIRPORT_COORDS = { lat: 33.2625, lng: 44.2344 };

const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'كابتن علي كريم',
    rating: 4.95,
    trips: 148,
    car: 'تويوتا كامري 2022',
    color: 'أبيض لؤلؤي',
    badge: 'باج المطار معتمد • تكييف ممتاز',
    priceIQD: 40000,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+964 771 234 5678',
    plate: 'بغداد 14 أ 89234'
  },
  {
    id: 'd2',
    name: 'كابتن أحمد جبار',
    rating: 4.92,
    trips: 210,
    car: 'هيونداي النترا 2023',
    color: 'فضي معدني',
    badge: 'باج المطار معتمد • مقاعد جلدية',
    priceIQD: 38000,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+964 782 345 6789',
    plate: 'بغداد 22 ب 44102'
  },
  {
    id: 'd3',
    name: 'كابتن مصطفى الركابي',
    rating: 4.98,
    trips: 340,
    car: 'تويوتا أفرالون VIP',
    color: 'أسود ملكي',
    badge: 'باج VIP معتمد • خدمة رجال أعمال',
    priceIQD: 55000,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+964 750 987 6543',
    plate: 'بغداد 05 ج 1109'
  },
  {
    id: 'd4',
    name: 'كابتن حيدر التميمي',
    rating: 4.89,
    trips: 96,
    car: 'كيا أوبتيما 2021',
    color: 'رصاصي',
    badge: 'باج المطار معتمد • مساحة حقائب واسعة',
    priceIQD: 37000,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    phone: '+964 773 456 7890',
    plate: 'بغداد 18 د 7765'
  }
];

export default function App() {
  const [bookingMode, setBookingMode] = useState<'scheduled' | 'instant'>('scheduled');
  const [selectedDistrictName, setSelectedDistrictName] = useState(BAGHDAD_DISTRICTS[0].name);
  const [selectedCoords, setSelectedCoords] = useState<{lat: number; lng: number}>(
    { lat: BAGHDAD_DISTRICTS[0].lat, lng: BAGHDAD_DISTRICTS[0].lng }
  );

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [flightTime, setFlightTime] = useState('09:00 صباحاً');
  
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(3);
  const [showDrivers, setShowDrivers] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'main' | 'trips' | 'map' | 'ai'>('main');
  
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: 'TR-8921',
      mode: 'scheduled',
      fromDistrict: 'المنصور',
      coords: { lat: 33.3128, lng: 44.3361 },
      flightDate: '4 تشرين الأول 2026',
      flightTime: '06:30 مساءً',
      pickupTime: '03:30 عصراً',
      passengers: 2,
      luggage: 2,
      driver: MOCK_DRIVERS[0],
      status: 'on_way',
      createdAt: 'منذ 20 دقيقة'
    }
  ]);

  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<Driver | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeTrackingTrip, setActiveTrackingTrip] = useState<Trip | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponses, setAiResponses] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'أهلاً بك في تكسي مطار بغداد الدولي. المسار الرسمي المعتمد. كيف يمكنني مساعدتك اليوم في رحلتك؟' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const currentDistrictObj = BAGHDAD_DISTRICTS.find(d => d.name === selectedDistrictName) || BAGHDAD_DISTRICTS[0];

  useEffect(() => {
    if (activeScreen !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedCoords.lat, selectedCoords.lng],
        zoom: 13,
        zoomControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      const airportIcon = L.divIcon({
        className: 'custom-airport-pin',
        html: `<div style="background: #0d9488; color: #ffffff; padding: 6px 12px; border-radius: 12px; font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px rgba(13,148,136,0.4); display: flex; align-items: center; gap: 4px; white-space: nowrap;">✈️ مطار بغداد</div>`,
        iconSize: [110, 36],
        iconAnchor: [55, 18]
      });
      L.marker([AIRPORT_COORDS.lat, AIRPORT_COORDS.lng], { icon: airportIcon }).addTo(map);

      const pickupIcon = L.divIcon({
        className: 'custom-pickup-pin',
        html: `<div style="background: #2dd4bf; color: #020617; padding: 6px 12px; border-radius: 12px; font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px rgba(45,212,191,0.5); display: flex; align-items: center; gap: 4px; white-space: nowrap;">📍 نقطة الركوب</div>`,
        iconSize: [110, 36],
        iconAnchor: [55, 18]
      });

      const marker = L.marker([selectedCoords.lat, selectedCoords.lng], { icon: pickupIcon, draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        setSelectedCoords({ lat: pos.lat, lng: pos.lng });
        let nearest = BAGHDAD_DISTRICTS[0];
        let minDist = 999999;
        BAGHDAD_DISTRICTS.forEach(d => {
          const dist = Math.hypot(d.lat - pos.lat, d.lng - pos.lng);
          if (dist < minDist) {
            minDist = dist;
            nearest = d;
          }
        });
        setSelectedDistrictName(nearest.name);
        setGpsMessage(`تم تحديث موقعك إلى قرب ${nearest.name}`);
      });

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setSelectedCoords({ lat, lng });

        let nearest = BAGHDAD_DISTRICTS[0];
        let minDist = 999999;
        BAGHDAD_DISTRICTS.forEach(d => {
          const dist = Math.hypot(d.lat - lat, d.lng - lng);
          if (dist < minDist) {
            minDist = dist;
            nearest = d;
          }
        });
        setSelectedDistrictName(nearest.name);
        setGpsMessage(`تم تثبيت نقطة الركوب في ${nearest.name}`);
      });

      mapInstanceRef.current = map;
    } else {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([selectedCoords.lat, selectedCoords.lng], 13);
      }, 100);
    }
  }, [selectedCoords, activeScreen]);

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('متصفحك لا يدعم تحديد الموقع الجغرافي GPS');
      return;
    }

    setGpsLoading(true);
    setGpsMessage('جاري الاتصال بالأقمار الصناعية لتحديد موقعك في بغداد...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGpsLoading(false);
        setSelectedCoords({ lat, lng });

        let nearest = BAGHDAD_DISTRICTS[0];
        let minDist = 999999;
        BAGHDAD_DISTRICTS.forEach(d => {
          const dist = Math.hypot(d.lat - lat, d.lng - lng);
          if (dist < minDist) {
            minDist = dist;
            nearest = d;
          }
        });
        setSelectedDistrictName(nearest.name);
        setGpsMessage(`📍 تم رصد موقعك بدقة في ${nearest.name}`);
      },
      () => {
        setGpsLoading(false);
        setGpsMessage('تعذر الحصول على إذن GPS. تم تعيين موقعك الافتراضي في المنصور.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const getPickupTime = () => '06:00 صباحاً';

  const formattedDateString = selectedDate.toLocaleDateString('ar-IQ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleConfirmBooking = (driver: Driver) => {
    const newTrip: Trip = {
      id: 'TR-' + Math.floor(1000 + Math.random() * 9000),
      mode: bookingMode,
      fromDistrict: selectedDistrictName,
      coords: selectedCoords,
      flightDate: formattedDateString,
      flightTime,
      pickupTime: bookingMode === 'scheduled' ? getPickupTime() : 'خلال 10 دقائق',
      passengers,
      luggage,
      driver,
      status: 'confirmed',
      createdAt: 'الآن'
    };

    setTrips([newTrip, ...trips]);
    setSelectedDriverForBooking(null);
    setBookingSuccess(true);
    setActiveTrackingTrip(newTrip);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userText = aiPrompt;
    setAiPrompt('');
    setAiResponses(prev => [...prev, { role: 'user', text: userText }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          context: { selectedDistrictName, flightTime, bookingMode }
        })
      });
      const data = await res.json();
      setAiResponses(prev => [...prev, { role: 'ai', text: data.response || 'عذراً، حدث خطأ في الرد.' }]);
    } catch {
      setAiResponses(prev => [...prev, { role: 'ai', text: 'نوصي بالتواجد قبل ساعتين من موعد الطيران.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-6 font-['Cairo',sans-serif]">
      
      {/* Top Bar Controls for Demo */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="font-semibold text-slate-300">مطار بغداد الدولي • خط Cairo العصري</span>
        </div>
        <button 
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg transition"
        >
          {isPhoneFrame ? <Maximize2 size={13} /> : <Smartphone size={13} />}
          <span>{isPhoneFrame ? 'عرض كامل' : 'الهاتف'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className={`w-full transition-all duration-300 ${isPhoneFrame ? 'max-w-[430px] rounded-[42px] border-[8px] border-slate-800 shadow-2xl bg-slate-950 overflow-hidden relative min-h-[920px] flex flex-col' : 'max-w-2xl bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden'}`}>
        
        {/* Notch in Phone Frame */}
        {isPhoneFrame && (
          <div className="bg-slate-950 pt-2 pb-1 px-6 flex justify-between items-center text-xs text-slate-400 select-none z-30">
            <span className="font-bold text-white">10:52</span>
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-teal-400"></div>
              <div className="w-3 h-1 bg-slate-700 rounded-full"></div>
            </div>
            <div className="flex items-center gap-1 text-white">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-teal-400 rounded-2xs"></div>
              </div>
            </div>
          </div>
        )}

        {/* Header - No duplicate tabs, clean top-left trips button */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveScreen('main')}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition"
            >
              <ArrowRight size={18} />
            </button>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                تكسي مطار بغداد الدولي
                <ShieldCheck size={16} className="text-teal-400 fill-teal-400/20" />
              </h2>
              <p className="text-[11px] text-slate-400 font-normal">المسار الرسمي لمطار بغداد الدولي</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveScreen('ai')}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 flex items-center justify-center transition"
              title="المساعد الذكي"
            >
              <Sparkles size={16} />
            </button>
            <button 
              onClick={() => setActiveScreen('trips')}
              className="relative px-3 py-1.5 bg-teal-950/80 border border-teal-500/40 text-teal-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plane size={14} />
              <span>رحلتي</span>
              {trips.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                  {trips.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">

          {activeScreen === 'main' && (
            <>
              {/* Mode Selector */}
              <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl grid grid-cols-2 gap-1.5 shadow-md">
                <button
                  onClick={() => setBookingMode('scheduled')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${bookingMode === 'scheduled' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
                >
                  <CalendarIcon size={14} />
                  <span>حجز مجدول لموعد طائرة</span>
                </button>
                <button
                  onClick={() => setBookingMode('instant')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${bookingMode === 'instant' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
                >
                  <Car size={14} />
                  <span>طلب فوري الآن</span>
                </button>
              </div>

              {/* Route Visual Box & GPS Location */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block shadow-[0_0_8px_rgba(45,212,191,0.5)]"></span>
                    <span className="text-xs font-bold text-white">نقطة الركوب في بغداد</span>
                  </div>
                  <button
                    onClick={handleGetGPSLocation}
                    disabled={gpsLoading}
                    className="px-3 py-1.5 bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 border border-teal-500/30 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition"
                  >
                    <Crosshair size={13} className={gpsLoading ? 'animate-spin' : ''} />
                    <span>{gpsLoading ? 'جاري التحديد...' : 'تحديد موقعي GPS'}</span>
                  </button>
                </div>

                {gpsMessage && (
                  <div className="bg-slate-950 border border-teal-500/30 rounded-xl p-2.5 text-[11px] text-teal-200 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
                    <span>{gpsMessage}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">المنطقة أو الحي:</label>
                    <div className="relative">
                      <select
                        value={selectedDistrictName}
                        onChange={(e) => {
                          const name = e.target.value;
                          setSelectedDistrictName(name);
                          const found = BAGHDAD_DISTRICTS.find(d => d.name === name);
                          if (found) {
                            setSelectedCoords({ lat: found.lat, lng: found.lng });
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-teal-500 transition appearance-none cursor-pointer"
                      >
                        {BAGHDAD_DISTRICTS.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name} (الأجرة: {d.basePrice.toLocaleString()} د.ع)
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-teal-400 shrink-0" />
                      <span>المسافة للمطار: ~{currentDistrictObj.distanceMins} دقيقة</span>
                    </div>
                    <button
                      onClick={() => setActiveScreen('map')}
                      className="underline font-semibold text-teal-400 hover:text-teal-300 text-[11px]"
                    >
                      فتح الخريطة 🗺️
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">إلى:</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plane size={16} className="text-teal-400 rotate-45" />
                        <span>مطار بغداد الدولي (صالة المسافرين)</span>
                      </div>
                      <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded-md font-semibold border border-teal-500/30">بوابة معتمدة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Date & Time Structured Calendar Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
                
                {bookingMode === 'scheduled' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon size={15} className="text-teal-400" />
                        تاريخ وموعد إقلاع الطائرة
                      </span>
                      <button
                        onClick={() => setShowCalendarModal(true)}
                        className="text-[11px] text-teal-400 hover:underline font-semibold"
                      >
                        فتح التقويم المنظم 📅
                      </button>
                    </label>

                    {/* Date Picker Button Trigger */}
                    <div 
                      onClick={() => setShowCalendarModal(true)}
                      className="w-full bg-slate-950 border border-slate-700 hover:border-teal-500 rounded-xl px-3.5 py-3 text-xs font-semibold text-white flex items-center justify-between cursor-pointer transition shadow-inner"
                    >
                      <div className="flex items-center gap-2.5">
                        <CalendarIcon size={16} className="text-teal-400" />
                        <span>{formattedDateString}</span>
                      </div>
                      <span className="text-[10px] bg-teal-950 text-teal-300 px-2.5 py-1 rounded-lg border border-teal-500/30">تغيير التاريخ</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">وقت الإقلاع:</label>
                        <input 
                          type="text"
                          value={flightTime}
                          onChange={(e) => setFlightTime(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-teal-500"
                          placeholder="مثلاً 09:00 صباحاً"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">وصول الكابتن:</label>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-teal-300 flex items-center">
                          <span>{getPickupTime()} (تلقائي)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-teal-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
                      <ShieldCheck size={16} className="text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">تنبيه أمان:</strong> سيصلك الكابتن قبل موعد الإقلاع بـ 3 ساعات لضمان وصولك المريح دون عجلة.
                      </div>
                    </div>
                  </div>
                )}

                {/* Passengers & Luggage */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Users size={13} className="text-teal-400" />
                        الركاب
                      </div>
                      <div className="text-xs font-semibold text-white mt-0.5">مسافرين</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center justify-center transition"
                      >-</button>
                      <span className="w-5 text-center font-bold text-sm text-teal-400">{passengers}</span>
                      <button 
                        onClick={() => setPassengers(passengers + 1)}
                        className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center justify-center transition"
                      >+</button>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Briefcase size={13} className="text-teal-400" />
                        الحقائب
                      </div>
                      <div className="text-xs font-semibold text-white mt-0.5">حقائب السفر</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setLuggage(Math.max(0, luggage - 1))}
                        className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center justify-center transition"
                      >-</button>
                      <span className="w-5 text-center font-bold text-sm text-teal-400">{luggage}</span>
                      <button 
                        onClick={() => setLuggage(luggage + 1)}
                        className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center justify-center transition"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* PRIMARY ACTION BUTTON: Amber Gold (#F59E0B) as requested */}
                <button
                  onClick={() => setShowDrivers(true)}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition transform active:scale-95"
                >
                  <Search size={18} className="stroke-[2.5]" />
                  <span>عرض الكباتن المتاحين والأسعار</span>
                </button>
              </div>

              {/* Available Drivers List */}
              {showDrivers && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Car size={15} className="text-teal-400" />
                      الكباتن المتاحون في {selectedDistrictName}
                    </h3>
                    <span className="text-[10px] text-teal-300 bg-teal-950 px-2.5 py-0.5 rounded-full font-semibold border border-teal-500/30">معتمدون رسمياً</span>
                  </div>

                  <div className="space-y-3">
                    {MOCK_DRIVERS.map((driver) => {
                      const finalPrice = currentDistrictObj.basePrice + (driver.id === 'd3' ? 15000 : driver.id === 'd1' ? 2000 : 0);

                      return (
                        <div 
                          key={driver.id}
                          className="bg-slate-900 border border-slate-800 hover:border-teal-500/60 rounded-2xl p-4 shadow-xl transition space-y-3 relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-3 relative z-10">
                            <div className="flex items-center gap-3">
                              <img 
                                src={driver.image} 
                                alt={driver.name} 
                                className="w-13 h-13 rounded-2xl object-cover border-2 border-teal-500/50 shadow-md" 
                              />
                              <div>
                                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                                  {driver.name}
                                  <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
                                </h4>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span className="text-teal-400 font-bold flex items-center gap-0.5">
                                    <Star size={12} className="fill-teal-400" />
                                    {driver.rating}
                                  </span>
                                  <span>({driver.trips} مشوار)</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-left">
                              {/* Price in Teal/Turquoise */}
                              <span className="text-xs font-black text-teal-300 bg-teal-950 border border-teal-500/40 px-3 py-1 rounded-xl block">
                                {finalPrice.toLocaleString()} د.ع
                              </span>
                              <span className="text-[10px] text-slate-400 mt-1 block">أجرة رسمية</span>
                            </div>
                          </div>

                          <div className="bg-slate-950 rounded-xl p-2.5 text-[11px] space-y-1 relative z-10 border border-slate-800">
                            <div className="font-medium text-slate-200 flex items-center justify-between">
                              <span>🚗 {driver.car}</span>
                              <span className="text-slate-400">{driver.color}</span>
                            </div>
                            <div className="text-teal-300 font-medium flex items-center gap-1">
                              <span>🛡️</span>
                              <span>{driver.badge}</span>
                            </div>
                          </div>

                          <div className="pt-1 flex items-center gap-2 relative z-10">
                            <button
                              onClick={() => setSelectedDriverForBooking(driver)}
                              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
                            >
                              <CheckCircle2 size={15} />
                              <span>احجز الآن مع الكابتن</span>
                            </button>
                            <a
                              href={`tel:${driver.phone}`}
                              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl flex items-center justify-center transition border border-slate-700"
                              title="اتصال"
                            >
                              <Phone size={16} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Map Screen */}
          {activeScreen === 'map' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Compass size={16} className="text-teal-400" />
                  خريطة بغداد التفاعلية وموقع الركوب
                </h3>
                <button
                  onClick={handleGetGPSLocation}
                  className="px-3 py-1 bg-teal-950 text-teal-300 border border-teal-500/40 rounded-xl text-[11px] font-semibold flex items-center gap-1"
                >
                  <Crosshair size={12} />
                  <span>تحديث GPS</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-300 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                📍 انقر في أي مكان على الخريطة أو اسحب الدبوس لتحديد موقعك بدقة في بغداد.
              </div>

              <div 
                ref={mapContainerRef} 
                className="w-full h-[400px] rounded-2xl border-2 border-slate-800 shadow-2xl relative overflow-hidden z-10"
              ></div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">المنطقة المحددة:</span>
                  <strong className="text-teal-300">{selectedDistrictName}</strong>
                </div>
                <button
                  onClick={() => setActiveScreen('main')}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs mt-1"
                >
                  تثبيت والمتابعة للحجز ✓
                </button>
              </div>
            </div>
          )}

          {/* Trips Screen */}
          {activeScreen === 'trips' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-teal-400" />
                سجل الرحلات النشطة ({trips.length})
              </h3>

              {trips.length === 0 ? (
                <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-3">
                  <Plane size={36} className="text-slate-500 mx-auto rotate-45" />
                  <p className="text-xs text-slate-400">لا توجد رحلات حالياً.</p>
                  <button onClick={() => setActiveScreen('main')} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold">
                    احجز الآن
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <div key={trip.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <span className="px-2.5 py-0.5 bg-teal-950 border border-teal-500/40 text-teal-300 rounded-lg text-xs font-black">
                          {trip.id}
                        </span>
                        <span className="px-2.5 py-0.5 bg-slate-800 text-teal-300 rounded-full text-[10px] font-bold">
                          ✓ مؤكد
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">تاريخ الرحلة:</span>
                          <strong className="text-white">{trip.flightDate}</strong>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">وقت وصول الكابتن:</span>
                          <strong className="text-teal-400">{trip.pickupTime}</strong>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3">
                          <img src={trip.driver.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-teal-500/40" />
                          <div>
                            <div className="font-bold text-xs text-white">{trip.driver.name}</div>
                            <div className="text-[10px] text-slate-400">{trip.driver.car} • {trip.driver.plate}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTrackingTrip(trip)}
                          className="px-3 py-1.5 bg-teal-950 text-teal-300 border border-teal-500/40 rounded-xl text-[11px] font-semibold"
                        >
                          تتبع الحية
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Screen */}
          {activeScreen === 'ai' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-950 rounded-xl flex items-center justify-center text-teal-400 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">المساعد الذكي لتكسي المطار</h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">استفسر عن مواعيد الطيران وحالة الطريق.</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {aiResponses.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-teal-600 text-white font-medium rounded-br-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 animate-pulse">
                      جاري الرد...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleAskAI} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="اسأل المساعد..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
                <button type="submit" className="px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold transition flex items-center justify-center shadow">
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Structured Calendar Modal */}
        {showCalendarModal && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <CalendarIcon size={18} className="text-teal-400" />
                  اختر تاريخ إقلاع الرحلة
                </h3>
                <button 
                  onClick={() => setShowCalendarModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-white">
                  <span>تشرين الأول 2026</span>
                  <div className="flex gap-1">
                    <button className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"><ChevronRight size={14} /></button>
                    <button className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"><ChevronLeft size={14} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 pb-1">
                  <span>سبت</span>
                  <span>أحد</span>
                  <span>إثنين</span>
                  <span>ثلاثاء</span>
                  <span>أربعاء</span>
                  <span>خميس</span>
                  <span>جمعة</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                  {Array.from({ length: 31 }, (_, i) => {
                    const dayNum = i + 1;
                    const isSelected = selectedDate.getDate() === dayNum;
                    return (
                      <button
                        key={dayNum}
                        onClick={() => {
                          const d = new Date(selectedDate);
                          d.setDate(dayNum);
                          setSelectedDate(d);
                          setShowCalendarModal(false);
                        }}
                        className={`py-2 rounded-xl font-semibold transition ${isSelected ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-900 hover:bg-slate-800 text-slate-200'}`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setShowCalendarModal(false)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs transition"
              >
                تأكيد التاريخ وتحديد الوقت ✓
              </button>
            </div>
          </div>
        )}

        {/* Driver Booking Confirmation Modal */}
        {selectedDriverForBooking && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-teal-400" />
                  تأكيد حجز تكسي مطار بغداد
                </h3>
                <button 
                  onClick={() => setSelectedDriverForBooking(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <img src={selectedDriverForBooking.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-teal-500/50" />
                  <div>
                    <div className="font-bold text-white">{selectedDriverForBooking.name}</div>
                    <div className="text-[11px] text-teal-400 mt-0.5">{selectedDriverForBooking.car}</div>
                    <div className="text-[10px] text-slate-400">{selectedDriverForBooking.badge}</div>
                  </div>
                </div>

                <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">نقطة الركوب (GPS):</span>
                    <strong className="text-white">{selectedDistrictName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">تاريخ الرحلة:</span>
                    <strong className="text-teal-300">{formattedDateString}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">وصول الكابتن:</span>
                    <strong className="text-teal-400">{getPickupTime()}</strong>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-black">
                    <span className="text-slate-200">الأجرة الإجمالية:</span>
                    <span className="text-teal-400">{(currentDistrictObj.basePrice + (selectedDriverForBooking.id === 'd3' ? 15000 : 2000)).toLocaleString()} د.ع</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSelectedDriverForBooking(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleConfirmBooking(selectedDriverForBooking)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-amber-500/30"
                >
                  تأكيد الحجز النهائي ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Success Modal */}
        {bookingSuccess && activeTrackingTrip && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 text-center">
              <div className="w-16 h-16 bg-teal-950 border border-teal-500/50 rounded-full flex items-center justify-center mx-auto text-teal-400">
                <Check size={32} className="stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-base text-white">تم حجز رحلتك بنجاح!</h3>
                <p className="text-xs text-slate-400">رقم الحجز: <strong className="text-teal-400">{activeTrackingTrip.id}</strong></p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-right space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <img src={activeTrackingTrip.driver.image} alt="" className="w-11 h-11 rounded-xl object-cover border border-teal-500/50" />
                  <div>
                    <div className="font-bold text-white">{activeTrackingTrip.driver.name}</div>
                    <div className="text-[11px] text-teal-400">{activeTrackingTrip.driver.car} ({activeTrackingTrip.driver.plate})</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setBookingSuccess(false);
                    setActiveScreen('trips');
                  }}
                  className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-xl text-xs shadow-lg shadow-teal-600/30"
                >
                  عرض تفاصيل رحلتي
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Tracking Modal */}
        {activeTrackingTrip && !bookingSuccess && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Navigation size={18} className="text-teal-400 animate-spin" />
                  تتبع رحلة المطار ({activeTrackingTrip.id})
                </h3>
                <button onClick={() => setActiveTrackingTrip(null)} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>

              <div className="w-full h-44 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="absolute w-3/4 h-1 bg-teal-500/50 rounded-full"></div>
                <div className="absolute left-6 top-8 bg-teal-600 text-white p-2 rounded-xl shadow-lg text-[10px] font-bold">
                  موقعك (GPS)
                </div>
                <div className="absolute right-6 bottom-8 bg-slate-800 text-teal-300 border border-teal-500/40 p-2 rounded-xl shadow-lg text-[10px] font-bold">
                  مطار بغداد
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border-2 border-teal-400 p-2 rounded-xl shadow-2xl text-teal-300 flex items-center gap-1.5 text-xs font-bold animate-bounce">
                  <Car size={14} />
                  <span>الكابتن في الطريق (10 دقيقة)</span>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex justify-between"><span className="text-slate-400">الكابتن:</span><span className="font-bold text-white">{activeTrackingTrip.driver.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">السيارة:</span><span className="font-bold text-teal-400">{activeTrackingTrip.driver.car}</span></div>
              </div>

              <div className="flex gap-2 pt-1">
                <a href={`tel:${activeTrackingTrip.driver.phone}`} className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                  <Phone size={15} /> الاتصال بالكابتن
                </a>
                <button onClick={() => setActiveTrackingTrip(null)} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs">
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {isPhoneFrame && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full pointer-events-none"></div>
        )}

      </div>
    </div>
  );
}
