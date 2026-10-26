"use client";

import React, { useState, useEffect } from 'react';
import { useCareNest } from '../../context/CareNestContext';
import { CaregiverProfile } from '../../types';
import { CaregiverDetailModal } from '../../components/caregivers/CaregiverDetailModal';
import {
  Heart,
  ShieldCheck,
  Clock,
  Pill,
  Users,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Star,
  ArrowRight,
  Phone,
  Sparkles,
  Calendar,
  Activity,
  Award,
  ChevronRight,
  ChevronLeft,
  Eye,
  Search,
  Plus,
  Play,
  Pause,
  Check,
  Stethoscope,
  Settings,
  Bell,
  ChevronDown,
  UserCheck,
  HeartHandshake,
  FileText,
  BadgeCheck,
  Zap,
  Shield,
  ShieldAlert,
  PhoneCall,
  Compass,
  CheckCircle2,
  AlertCircle,
  Quote,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';

interface CareVisitRow {
  patient: string;
  caregiver: string;
  service: string;
  vitalsOrTime: string;
  status: 'Active Visit' | 'Completed' | 'Scheduled' | 'En Route';
}

interface HeroSlide {
  id: number;
  badge: string;
  badgeIcon: any;
  titlePrimary: string;
  titleHighlight: string;
  description: string;
  primaryCtaText: string;
  primaryCtaAction: string;
  secondaryCtaText: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  themeColor: string;
}

export const LandingPageView: React.FC = () => {
  const {
    setActiveView,
    loginAsRole,
    setIsQuickBookingModalOpen,
    setTargetCaregiverForBooking,
    seniorMode,
    toggleSeniorMode,
    caregivers,
    reviews,
    addToast,
    updateSubscription,
  } = useCareNest();

  const [pricingTab, setPricingTab] = useState<'MONTHLY' | 'HOURLY'>('MONTHLY');

  // ----------------------------------------------------
  // 1. HERO SLIDER STATE & DATA
  // ----------------------------------------------------
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const heroSlides: HeroSlide[] = [
    {
      id: 0,
      badge: "Verified In-Home Caregivers & Geriatric Nurses",
      badgeIcon: ShieldCheck,
      titlePrimary: "Trusted Care for Aging Loved Ones,",
      titleHighlight: "Right at Home.",
      description: "Connect seniors aged 60+ with background-verified nurses and compassionate care attendants. Live vitals tracking, medicine routines, and total family peace of mind.",
      primaryCtaText: "Find a Caregiver",
      primaryCtaAction: "CAREGIVER_SEARCH",
      secondaryCtaText: "Explore Dashboard",
      stat1Value: "100%",
      stat1Label: "Police & Degree Verified",
      stat2Value: "15,000+",
      stat2Label: "Safe Home Visits",
      stat3Value: "4.9 ★",
      stat3Label: "Family Trust Rating",
      themeColor: "indigo"
    },
    {
      id: 1,
      badge: "Live Vitals & Daily Routine Monitoring",
      badgeIcon: Activity,
      titlePrimary: "Real-Time Senior Health Tracking.",
      titleHighlight: "Instant Peace of Mind.",
      description: "Attending nurses record blood pressure, glucose, hydration, and mobility exercises live. Family members receive instant updates from anywhere in the world.",
      primaryCtaText: "Track Daily Care",
      primaryCtaAction: "DAILY_CARE",
      secondaryCtaText: "View Live Vitals",
      stat1Value: "122/80",
      stat1Label: "Real-Time BP Sync",
      stat2Value: "3x / Day",
      stat2Label: "Care Routine Audits",
      stat3Value: "< 60s",
      stat3Label: "Family Alert Speed",
      themeColor: "sky"
    },
    {
      id: 2,
      badge: "Smart Medicine Reminders & Chaperone",
      badgeIcon: Pill,
      titlePrimary: "Never Miss a Critical Dosage.",
      titleHighlight: "Doctor Accompaniment.",
      description: "Automated dose reminders with 1-tap verification. Caregivers escort seniors safely to hospital consultations, lab blood tests, and routine clinics.",
      primaryCtaText: "Manage Medicines",
      primaryCtaAction: "MEDICINES",
      secondaryCtaText: "Book Doctor Escort",
      stat1Value: "99.8%",
      stat1Label: "On-Time Dosing Rate",
      stat2Value: "Zero",
      stat2Label: "Missed Prescriptions",
      stat3Value: "Door-to-Door",
      stat3Label: "Clinic Accompaniment",
      themeColor: "emerald"
    },
    {
      id: 3,
      badge: "Rapid 1-Click SOS & Emergency Coordination",
      badgeIcon: AlertTriangle,
      titlePrimary: "Immediate Help When Every",
      titleHighlight: "Second Truly Counts.",
      description: "Instant 1-tap SOS broadcasts emergency alerts to attending nurses, primary family contacts, and connects with 112/108 ambulance teams simultaneously.",
      primaryCtaText: "Emergency Response",
      primaryCtaAction: "EMERGENCY",
      secondaryCtaText: "View SOS Protocol",
      stat1Value: "1-Click",
      stat1Label: "Instant Broadcast SOS",
      stat2Value: "24 / 7",
      stat2Label: "Caregiver On-Call",
      stat3Value: "100%",
      stat3Label: "GPS Verified Locations",
      themeColor: "amber"
    }
  ];

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlay, heroSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // ----------------------------------------------------
  // 2. DEVICE MOCKUP INTERACTIVE STATES
  // ----------------------------------------------------
  const [mockSearch, setMockSearch] = useState('');
  const [visitList, setVisitList] = useState<CareVisitRow[]>([
    { patient: 'Ramesh Chandra (74)', caregiver: 'Sister Ananya Roy (GDA)', service: 'Post-op Mobility & Stroll', vitalsOrTime: 'BP 122/80 • 10:00 AM', status: 'Active Visit' },
    { patient: 'Savitri Devi (68)', caregiver: 'Nurse Rajesh Kumar', service: 'Diabetic Care & Insulin', vitalsOrTime: 'Sugar 110 mg/dL • 1:30 PM', status: 'Completed' },
    { patient: 'George Fernandez (79)', caregiver: 'Sunita Das (Companion)', service: 'Dementia & Memory Walk', vitalsOrTime: '4:00 PM Afternoon', status: 'Scheduled' },
    { patient: 'Nirmala Sen (72)', caregiver: 'Sister Kavita Rao', service: 'Knee Physio & Vitals', vitalsOrTime: '5:30 PM Evening', status: 'Scheduled' },
  ]);

  // Vitals interactive simulation
  const [vitalsReadings, setVitalsReadings] = useState({
    bpSys: 122,
    bpDia: 80,
    pulse: 74,
    sugar: 108,
    hydration: 1.4,
  });

  // Medicines interactive simulation
  const [medsList, setMedsList] = useState([
    { name: 'Metformin 500mg', time: '08:00 AM', taken: true, desc: 'With breakfast' },
    { name: 'Calcium + Vit D3', time: '01:30 PM', taken: true, desc: 'Post lunch' },
    { name: 'Telmisartan 40mg', time: '08:00 PM', taken: false, desc: 'Pre dinner' },
  ]);

  const handleAddCareVisit = () => {
    const nextNum = visitList.length + 1;
    const samplePatients = ['Dr. O. P. Verma (82)', 'Kamala Nair (71)', 'H. S. Gill (76)', 'Meenakshi Sundaram (69)'];
    const sampleCaregivers = ['Nurse Meera Nair (B.Sc)', 'Sister Pooja Sen (GDA)', 'Attendant David D\'Souza', 'Sister Anju Thomas'];
    const sampleServices = ['Medication & Vitals', 'Companion Stroll & Meals', 'Post-Stroke Physiotherapy', 'Geriatric Nursing Care'];

    const chosenPatient = samplePatients[nextNum % samplePatients.length];
    const chosenCaregiver = sampleCaregivers[nextNum % sampleCaregivers.length];
    const chosenService = sampleServices[nextNum % sampleServices.length];

    setVisitList(prev => [
      ...prev,
      {
        patient: chosenPatient,
        caregiver: chosenCaregiver,
        service: chosenService,
        vitalsOrTime: 'BP 124/82 • Scheduled',
        status: 'Scheduled',
      }
    ]);
    addToast('Caregiver Visit Booked', `${chosenCaregiver} assigned to ${chosenPatient}`, 'success');
  };

  const handleStatusCycle = (idx: number) => {
    setVisitList(prev => {
      const copy = [...prev];
      const current = copy[idx].status;
      if (current === 'Scheduled') copy[idx].status = 'En Route';
      else if (current === 'En Route') copy[idx].status = 'Active Visit';
      else if (current === 'Active Visit') copy[idx].status = 'Completed';
      else copy[idx].status = 'Scheduled';
      return copy;
    });
  };

  const handleToggleMed = (idx: number) => {
    setMedsList(prev => {
      const copy = [...prev];
      copy[idx].taken = !copy[idx].taken;
      return copy;
    });
  };

  const handleSimulateVitals = () => {
    setVitalsReadings(prev => ({
      bpSys: 120 + Math.floor(Math.random() * 8),
      bpDia: 78 + Math.floor(Math.random() * 6),
      pulse: 72 + Math.floor(Math.random() * 8),
      sugar: 105 + Math.floor(Math.random() * 10),
      hydration: +(prev.hydration + 0.1).toFixed(1) > 2 ? 1.4 : +(prev.hydration + 0.1).toFixed(1),
    }));
    addToast('Vitals Synchronized', 'New blood pressure & sugar logged from in-home nurse', 'info');
  };

  // ----------------------------------------------------
  // 3. CAREGIVER MATCHER & FILTER STATE
  // ----------------------------------------------------
  const [matchCondition, setMatchCondition] = useState('ALL');
  const [matchArea, setMatchArea] = useState('Indiranagar');
  const [matchShift, setMatchShift] = useState('DAY');

  const handleQuickMatch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveView('CAREGIVER_SEARCH');
  };

  // ----------------------------------------------------
  // 4. DAY IN THE LIFE TIMELINE STATE
  // ----------------------------------------------------
  const [activeDayTab, setActiveDayTab] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // ----------------------------------------------------
  // 5. CAREGIVER MODAL PREVIEW
  // ----------------------------------------------------
  const [modalCaregiver, setModalCaregiver] = useState<CaregiverProfile | null>(null);

  // ----------------------------------------------------
  // 6. FAQ ACCORDION STATE
  // ----------------------------------------------------
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How strictly are CareNest caregivers and nurses verified?",
      a: "Every caregiver undergoes a rigorous 4-step verification protocol: Government Aadhaar biometric identity verification, police criminal background verification, nursing council diploma/degree authentication, and in-person geriatric psychometric evaluation."
    },
    {
      q: "What happens if our assigned caregiver is sick or unavailable?",
      a: "CareNest guarantees a certified backup caregiver within 2 hours. Your senior's medical profile, medication timetable, and emergency notes are instantly synced with the backup attendant so care continues without interruption."
    },
    {
      q: "Can family members track daily care while living abroad or working?",
      a: "Yes! Family members have a dedicated Family Portal where every meal, hydration log, vital sign (BP, sugar, pulse), and medicine confirmation is updated live with photo notes and caregiver check-in timestamps."
    },
    {
      q: "Is CareNest a substitute for emergency hospital ambulance services?",
      a: "CareNest provides dedicated in-home care, nursing, and accompaniment. In life-threatening emergencies, our 1-click SOS instantly initiates protocols, alerts family, and directly coordinates with official emergency 112/108 response teams."
    },
    {
      q: "Can we book a caregiver for doctor visit accompaniment only?",
      a: "Absolutely! You can book verified companions specifically to chaperone your elderly parents to hospital consultations, lab tests, dialysis, or follow-up clinics with door-to-door transit assistance."
    }
  ];

  const currentHero = heroSlides[currentSlide];
  const BadgeIcon = currentHero.badgeIcon;

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">
      {/* ====================================================
          1. HERO SECTION WITH MULTI-SLIDE CAROUSEL
         ==================================================== */}
      <section className="relative pt-6 sm:pt-10 pb-14 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#f8faff] via-[#f1f4fe] to-[#f8faff]">
        {/* Soft Ambient Luminous Glow Blobs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-[30rem] h-[30rem] bg-violet-200/25 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          {/* Top Slide Navigation Pill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-2 rounded-full border border-slate-200/90 shadow-[0_2px_12px_rgba(79,70,229,0.06)] max-w-3xl mx-auto">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-0.5">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    currentSlide === idx
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <span className="text-[10px] opacity-75">0{idx + 1}</span>
                  <span className="hidden sm:inline">
                    {idx === 0 && 'Caregivers'}
                    {idx === 1 && 'Daily Vitals'}
                    {idx === 2 && 'Medicines'}
                    {idx === 3 && 'Emergency SOS'}
                  </span>
                </button>
              ))}
            </div>

            {/* Slider Controls (Play/Pause, Prev, Next) */}
            <div className="flex items-center gap-1.5 pr-1">
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                title={isAutoPlay ? 'Pause Auto-slide' : 'Play Auto-slide'}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-xs transition"
              >
                {isAutoPlay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-slate-600" />}
              </button>
              <button
                onClick={handlePrevSlide}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs transition"
                title="Previous Slide"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs transition"
                title="Next Slide"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Hero Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Dynamic Headline & Messaging */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left transition-all duration-300">
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-indigo-100 shadow-[0_2px_10px_rgba(79,70,229,0.06)] text-indigo-700 text-xs font-semibold">
                <BadgeIcon className="h-4 w-4 text-indigo-600" />
                <span>{currentHero.badge}</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 font-display tracking-tight leading-[1.12]">
                {currentHero.titlePrimary} <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600">
                  {currentHero.titleHighlight}
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                {currentHero.description}
              </p>

              {/* Glowing Action Pills */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setActiveView(currentHero.primaryCtaAction as any)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm sm:text-base rounded-full shadow-[0_10px_25px_-3px_rgba(79,70,229,0.5)] hover:shadow-[0_14px_30px_-3px_rgba(79,70,229,0.65)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>{currentHero.primaryCtaText}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => loginAsRole('FAMILY')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base rounded-full border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition flex items-center justify-center gap-2.5"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                    <Play className="h-3 w-3 fill-white ml-0.5" />
                  </span>
                  <span>{currentHero.secondaryCtaText}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-black text-indigo-700 font-display">{currentHero.stat1Value}</p>
                  <p className="text-xs text-slate-500 font-medium">{currentHero.stat1Label}</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800 font-display">{currentHero.stat2Value}</p>
                  <p className="text-xs text-slate-500 font-medium">{currentHero.stat2Label}</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-600 font-display">{currentHero.stat3Value}</p>
                  <p className="text-xs text-slate-500 font-medium">{currentHero.stat3Label}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Laptop Mockup Reflecting Active Slide */}
            <div className="lg:col-span-7 relative">
              <div className="relative mx-auto rounded-3xl p-3 sm:p-5 bg-gradient-to-tr from-slate-200/70 via-indigo-100/50 to-slate-200/70 backdrop-blur-md border border-white/60 shadow-[0_20px_50px_rgba(79,70,229,0.12)]">
                {/* Floating Micro-pill indicator */}
                <div className="absolute top-6 right-8 hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-200/60 shadow-sm z-0">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span>CareNest Hub Live: {heroSlides[currentSlide].badge.split('&')[0]}</span>
                </div>

                {/* Laptop Outer Frame */}
                <div className="relative z-10 mx-auto bg-slate-900 rounded-[22px] p-2.5 sm:p-3 shadow-2xl border-4 border-slate-800">
                  {/* Laptop Camera Hole */}
                  <div className="flex items-center justify-center pb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-700 ring-2 ring-slate-800 inline-block" />
                  </div>

                  {/* Laptop Screen Content */}
                  <div className="bg-[#f8faff] rounded-xl overflow-hidden shadow-inner text-slate-800 text-xs border border-slate-200 min-h-[460px]">
                    {/* Top Screen Bar */}
                    <div className="bg-white border-b border-slate-200/90 px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold">
                          <Heart className="h-3.5 w-3.5 fill-white" />
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block font-display">CareNest</span>
                          <span className="text-[7px] uppercase tracking-wider text-slate-400 font-bold block">HOME CARE HUB</span>
                        </div>
                      </div>

                      {/* Screen Tab Indicators - Fully Clickable & Openable */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-[10px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(0)}
                          className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                            currentSlide === 0 ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Visits
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(1)}
                          className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                            currentSlide === 1 ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Vitals
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(2)}
                          className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                            currentSlide === 2 ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Medicines
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSlide(3)}
                          className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                            currentSlide === 3 ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          SOS
                        </button>
                      </div>

                      {/* Attending Nurse Profile & Direct Tab Opener */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveView(currentHero.primaryCtaAction as any)}
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[9px] font-bold transition shadow-xs"
                          title="Open this full tab page"
                        >
                          <span>Open Tab</span>
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        </button>
                        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px]">
                          <div className="h-4 w-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[8px]">
                            AR
                          </div>
                          <span className="font-bold text-slate-800">Sister Ananya</span>
                          <BadgeCheck className="h-3 w-3 text-indigo-600" />
                        </div>
                      </div>
                    </div>

                    {/* DYNAMIC SCREEN CONTENT BASED ON SLIDE */}
                    <div className="p-4 space-y-4">
                      {/* VIEW 0: CAREGIVER VISITS & SCHEDULE */}
                      {currentSlide === 0 && (
                        <div className="space-y-3.5 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-extrabold text-slate-900 font-display">Today's In-Home Caregiver Visits</h3>
                              <p className="text-[10px] text-slate-500">Live monitoring of senior visits, vitals & attendant check-ins</p>
                            </div>
                            <button
                              onClick={() => {
                                setIsQuickBookingModalOpen(true);
                              }}
                              className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-[10px] rounded-full shadow-sm flex items-center gap-1 transition active:scale-95"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Book Caregiver</span>
                            </button>
                          </div>

                          {/* 4 Mini KPI Cards */}
                          <div className="grid grid-cols-4 gap-2 text-left">
                            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60">
                              <p className="text-[8px] font-bold text-amber-800 uppercase">Caregivers</p>
                              <p className="text-xs font-black text-slate-900 mt-0.5">14 Active</p>
                            </div>
                            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200/60">
                              <p className="text-[8px] font-bold text-sky-800 uppercase">Senior Vitals</p>
                              <p className="text-xs font-black text-slate-900 mt-0.5">BP 122/80</p>
                            </div>
                            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/60">
                              <p className="text-[8px] font-bold text-emerald-800 uppercase">Meds Taken</p>
                              <p className="text-xs font-black text-slate-900 mt-0.5">100% On-Time</p>
                            </div>
                            <div className="p-2 rounded-xl bg-violet-50 border border-violet-200/60">
                              <p className="text-[8px] font-bold text-violet-800 uppercase">Visits Today</p>
                              <p className="text-xs font-black text-slate-900 mt-0.5">28 Safe</p>
                            </div>
                          </div>

                          {/* Care Visits Table */}
                          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                            <table className="w-full text-left border-collapse text-[10px]">
                              <thead>
                                <tr className="border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase bg-slate-50/70">
                                  <th className="py-1.5 px-3">Senior</th>
                                  <th className="py-1.5 px-3">Caregiver</th>
                                  <th className="py-1.5 px-3">Service</th>
                                  <th className="py-1.5 px-3">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {visitList.slice(0, 4).map((row, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                                    <td className="py-1.5 px-3 font-bold text-slate-900">{row.patient}</td>
                                    <td className="py-1.5 px-3 text-slate-700 font-semibold">{row.caregiver}</td>
                                    <td className="py-1.5 px-3 text-slate-500">{row.service}</td>
                                    <td className="py-1.5 px-3">
                                      <button
                                        onClick={() => handleStatusCycle(idx)}
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition ${
                                          row.status === 'Active Visit'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : row.status === 'Completed'
                                            ? 'bg-sky-100 text-sky-800'
                                            : row.status === 'En Route'
                                            ? 'bg-violet-100 text-violet-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {row.status}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* VIEW 1: DAILY HEALTH VITALS & SENSORS */}
                      {currentSlide === 1 && (
                        <div className="space-y-3.5 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-extrabold text-slate-900 font-display">Senior Daily Vitals Hub</h3>
                              <p className="text-[10px] text-slate-500">Continuous telemetry sync for Ramesh Chandra (Age 74)</p>
                            </div>
                            <button
                              onClick={handleSimulateVitals}
                              className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] rounded-full shadow-sm flex items-center gap-1 transition active:scale-95"
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Simulate Log</span>
                            </button>
                          </div>

                          {/* Big Vitals Gauges */}
                          <div className="grid grid-cols-3 gap-2.5">
                            <div className="p-3 rounded-2xl bg-white border border-sky-100 shadow-sm text-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase block">Blood Pressure</span>
                              <div className="text-xl font-black text-sky-600 my-1 font-display">
                                {vitalsReadings.bpSys}/{vitalsReadings.bpDia}
                              </div>
                              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Normal Range</span>
                            </div>

                            <div className="p-3 rounded-2xl bg-white border border-rose-100 shadow-sm text-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase block">Heart Pulse</span>
                              <div className="text-xl font-black text-indigo-600 my-1 font-display flex items-center justify-center gap-1">
                                <Activity className="h-4 w-4 text-indigo-500 animate-pulse" />
                                <span>{vitalsReadings.pulse} bpm</span>
                              </div>
                              <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Rhythm Steady</span>
                            </div>

                            <div className="p-3 rounded-2xl bg-white border border-amber-100 shadow-sm text-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase block">Fasting Sugar</span>
                              <div className="text-xl font-black text-amber-600 my-1 font-display">
                                {vitalsReadings.sugar} mg/dL
                              </div>
                              <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Post-Meal Safe</span>
                            </div>
                          </div>

                          {/* Hydration & Mobility Summary */}
                          <div className="p-3 rounded-2xl bg-slate-100/70 border border-slate-200/80 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                                💧
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block">Hydration Target</span>
                                <span className="text-[9px] text-slate-500">{vitalsReadings.hydration}L logged of 1.8L goal</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                                Physio: 20m Done
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* VIEW 2: SMART MEDICINES SCHEDULE */}
                      {currentSlide === 2 && (
                        <div className="space-y-3.5 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-extrabold text-slate-900 font-display">Prescription & Dose Verifier</h3>
                              <p className="text-[10px] text-slate-500">1-Tap Caregiver & Family Confirmation</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                              All Morning Doses Taken
                            </span>
                          </div>

                          <div className="space-y-2">
                            {medsList.map((med, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                                  med.taken ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white border-slate-200 shadow-xs'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${med.taken ? 'bg-emerald-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                                    <Pill className="h-3.5 w-3.5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 text-[11px]">{med.name}</p>
                                    <p className="text-[9px] text-slate-500">{med.time} • {med.desc}</p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleToggleMed(idx)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                                    med.taken
                                      ? 'bg-emerald-200/80 text-emerald-900'
                                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                                  }`}
                                >
                                  {med.taken ? '✓ Confirmed' : 'Mark Taken'}
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[10px] text-indigo-900 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-indigo-600 shrink-0" />
                            <span>Next Scheduled: Telmisartan at 08:00 PM (Caregiver Ananya notified)</span>
                          </div>
                        </div>
                      )}

                      {/* VIEW 3: RAPID 1-CLICK SOS EMERGENCY HUB */}
                      {currentSlide === 3 && (
                        <div className="space-y-3.5 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-extrabold text-slate-900 font-display">Rapid Emergency Assistance</h3>
                              <p className="text-[10px] text-slate-500">Coordinated GPS triage & family notifications</p>
                            </div>
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full">
                              Network Ready
                            </span>
                          </div>

                          {/* Amber/Slate Emergency Hub Card */}
                          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white space-y-3 shadow-md border border-slate-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-amber-400 animate-ping" />
                                <span className="text-xs font-bold text-amber-300">CareNest SOS Active Protocol</span>
                              </div>
                              <span className="text-[10px] text-slate-400">GPS: 12.9716° N, 77.5946° E</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                                <span className="text-amber-300 font-bold block">Assigned Nurse:</span>
                                <span>Sister Ananya (4 mins away)</span>
                              </div>
                              <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                                <span className="text-amber-300 font-bold block">Family Contact:</span>
                                <span>Vikram Chandra (Notified)</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-slate-300">Immediate Ambulance Hotline:</span>
                              <span className="text-xs font-black text-amber-300">112 / 108 Verified</span>
                            </div>
                          </div>

                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10px] flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                            <span>Pressing the SOS button instantly places a priority conference call to your primary family caregiver.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Laptop Base Ledge */}
                  <div className="mt-2.5 h-2 w-32 mx-auto bg-slate-700 rounded-b-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          2. INSTANT CAREGIVER MATCHER & FILTER BAR
         ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-12 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-5px_rgba(79,70,229,0.12)] border border-slate-200/90">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Instant Caregiver Matcher</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Find the Perfect Caregiver in Bengaluru
              </h2>
            </div>

            <form onSubmit={handleQuickMatch} className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-2xl text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Senior's Condition</label>
                <select
                  value={matchCondition}
                  onChange={(e) => setMatchCondition(e.target.value)}
                  className="w-full p-2.5 rounded-full border border-slate-200 text-slate-800 bg-slate-50 font-medium focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">All Care (General Assisted)</option>
                  <option value="POST_OP">Post-Surgery & Mobility</option>
                  <option value="DIABETIC">Diabetic Care & Insulin</option>
                  <option value="DEMENTIA">Dementia & Alzheimer's</option>
                  <option value="PARKINSONS">Parkinson's & Physio</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Bengaluru Area</label>
                <select
                  value={matchArea}
                  onChange={(e) => setMatchArea(e.target.value)}
                  className="w-full p-2.5 rounded-full border border-slate-200 text-slate-800 bg-slate-50 font-medium focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Indiranagar">Indiranagar & Domlur</option>
                  <option value="Koramangala">Koramangala & HSR</option>
                  <option value="Whitefield">Whitefield & Marathahalli</option>
                  <option value="Jayanagar">Jayanagar & JP Nagar</option>
                  <option value="Malleshwaram">Malleshwaram & Rajajinagar</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Required Schedule</label>
                <select
                  value={matchShift}
                  onChange={(e) => setMatchShift(e.target.value)}
                  className="w-full p-2.5 rounded-full border border-slate-200 text-slate-800 bg-slate-50 font-medium focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="DAY">Day Shift (8 to 12 Hours)</option>
                  <option value="NIGHT">Night Care (8 to 10 Hours)</option>
                  <option value="24HR">24/7 Live-In Attendant</option>
                  <option value="VISIT">2-Hour Routine Checkup</option>
                </select>
              </div>
            </form>

            <button
              onClick={() => setActiveView('CAREGIVER_SEARCH')}
              className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.35)] transition transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="h-4 w-4" />
              <span>Match Caregivers →</span>
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================
          3. FEATURED TOP-RATED CAREGIVERS SHOWCASE
         ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 rounded-full">
              Verified Healthcare Attendants
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">
              Meet Our Certified In-Home Caregivers
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl">
              100% police cleared, hospital certified, and rigorously trained in gentle geriatric care.
            </p>
          </div>

          <button
            onClick={() => setActiveView('CAREGIVER_SEARCH')}
            className="self-start sm:self-auto px-5 py-2.5 rounded-full border border-slate-300 text-slate-800 hover:bg-slate-100 font-bold text-xs transition flex items-center gap-1.5"
          >
            <span>View All {caregivers.length} Caregivers</span>
            <ChevronRight className="h-4 w-4 text-indigo-600" />
          </button>
        </div>

        {/* Caregiver Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {caregivers.slice(0, 4).map((cg) => {
            const isVerified = cg.verificationStatus === 'VERIFIED';
            return (
              <div
                key={cg.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 shadow-soft-sm hover:shadow-[0_12px_35px_-4px_rgba(79,70,229,0.15)] transition p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Photo & Badge */}
                  <div className="relative">
                    <img
                      src={cg.avatarUrl}
                      alt={cg.fullName}
                      className="h-48 w-full object-cover rounded-2xl border border-slate-100 shadow-inner group-hover:scale-[1.02] transition-transform"
                    />
                    {isVerified && (
                      <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-indigo-600/95 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-sm">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Name & Details */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900">{cg.fullName}</h3>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{cg.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {cg.experienceYears} yrs clinical exp • {cg.serviceAreas[0]}
                    </p>
                  </div>

                  {/* Bio snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {cg.bio}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cg.skills.slice(0, 2).map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing & Booking */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Starts at</span>
                    <span className="text-base font-black text-indigo-700">₹{cg.hourlyRate}</span>
                    <span className="text-[10px] text-slate-500"> / hr</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setModalCaregiver(cg)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setTargetCaregiverForBooking(cg);
                        setIsQuickBookingModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================
          4. "A DAY WITH CARENEST" INTERACTIVE SCHEDULE TIMELINE
         ==================================================== */}
      <section className="bg-slate-100/70 py-16 sm:py-24 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 rounded-full">
              Holistic Daily Rhythm
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">
              A Day in the Life with a CareNest Caregiver
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              See how our visiting nurses and companions turn everyday moments into safe, joyful routines.
            </p>

            {/* Time Slot Tabs */}
            <div className="inline-flex p-1.5 rounded-full bg-white border border-slate-200 shadow-xs gap-1 pt-2">
              <button
                onClick={() => setActiveDayTab('morning')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  activeDayTab === 'morning' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌅 Morning (08:00 AM)
              </button>
              <button
                onClick={() => setActiveDayTab('afternoon')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  activeDayTab === 'afternoon' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ☀️ Afternoon (01:00 PM)
              </button>
              <button
                onClick={() => setActiveDayTab('evening')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  activeDayTab === 'evening' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌇 Evening (05:30 PM)
              </button>
              <button
                onClick={() => setActiveDayTab('night')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  activeDayTab === 'night' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌙 Night (09:00 PM)
              </button>
            </div>
          </div>

          {/* Active Time Slot Detail Box */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-soft-sm max-w-4xl mx-auto">
            {activeDayTab === 'morning' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">08:00 AM – 10:30 AM</span>
                  <h3 className="text-2xl font-black text-slate-900 font-display">Gentle Wakeup, Vitals & Medication</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Caregiver arrives on time, assists with gentle morning hygiene, tests blood pressure and fasting blood sugar, serves prescribed warm breakfast, and verifies all morning doses with digital photo logging.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Morning BP and glucose check</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Assisted stroll in terrace/garden</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Family notification update sent</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-gradient-to-tr from-amber-50 to-indigo-50 p-6 border border-amber-100 text-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold mx-auto shadow-md">
                    <Activity className="h-7 w-7" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Live Health Journal Entry</h4>
                  <p className="text-xs text-slate-500">"Mr. Ramesh had oats with almonds. BP 122/80 mmHg recorded. Cheerful mood."</p>
                  <span className="inline-block text-[10px] font-bold bg-white text-slate-700 px-3 py-1 rounded-full border border-slate-200">Logged by Sister Ananya</span>
                </div>
              </div>
            )}

            {activeDayTab === 'afternoon' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">01:00 PM – 03:30 PM</span>
                  <h3 className="text-2xl font-black text-slate-900 font-display">Nutritious Lunch & Cognitive Engagement</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Assisting with low-sodium wholesome lunch, administering post-lunch supplements, and engaging in light memory exercises, crossword puzzles, or listening to classic old songs.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Hydration tracker: 1.2L achieved</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Dementia & memory companionship</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Restful afternoon nap assistance</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-gradient-to-tr from-sky-50 to-indigo-50 p-6 border border-sky-100 text-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold mx-auto shadow-md">
                    <HeartHandshake className="h-7 w-7" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Cognitive Wellness</h4>
                  <p className="text-xs text-slate-500">"Played two rounds of classic carrom board. Shared stories from his engineering days."</p>
                  <span className="inline-block text-[10px] font-bold bg-white text-slate-700 px-3 py-1 rounded-full border border-slate-200">Companion Check-In</span>
                </div>
              </div>
            )}

            {activeDayTab === 'evening' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">05:30 PM – 07:30 PM</span>
                  <h3 className="text-2xl font-black text-slate-900 font-display">Physiotherapy, Stroll & Doctor Visits</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Knee flexion exercises guided by certified GDA attendant, evening tea, or accompanying senior in a pre-booked cab to the clinic for doctor checkup.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> 15 mins prescribed knee rehab</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Chaperoned clinic consultation</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Doctor notes uploaded for family</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-gradient-to-tr from-indigo-50 to-violet-50 p-6 border border-indigo-100 text-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold mx-auto shadow-md">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Clinic Accompaniment</h4>
                  <p className="text-xs text-slate-500">"Accompanied to Dr. Murthy's clinic. Prescriptions updated and blood drawn smoothly."</p>
                  <span className="inline-block text-[10px] font-bold bg-white text-slate-700 px-3 py-1 rounded-full border border-slate-200">Doctor Report Attached</span>
                </div>
              </div>
            )}

            {activeDayTab === 'night' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">09:00 PM – Overnight</span>
                  <h3 className="text-2xl font-black text-slate-900 font-display">Night Medication & Fall Prevention</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Light evening dinner, night diabetic/cardiac dosage administration, fall-prevention bedroom check, and night nurse stationed for elderly assistance.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Night medication dosage verified</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Washroom assist & pathway lighting</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> 24/7 SOS alert active on bedside</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 p-6 border border-slate-800 text-white text-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold mx-auto shadow-md">
                    <Shield className="h-7 w-7" />
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Safe Sleep Protocol</h4>
                  <p className="text-xs text-slate-300">"All doors secured, night lamp on, emergency pendant within arm's reach."</p>
                  <span className="inline-block text-[10px] font-bold bg-white/20 text-indigo-200 px-3 py-1 rounded-full border border-white/20">Night Nurse Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================
          5. SENIOR MODE VS FAMILY PORTAL TOGGLE
         ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-indigo-50 via-white to-violet-50 border border-indigo-100 shadow-soft-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 bg-white border border-indigo-200 px-3.5 py-1 rounded-full shadow-xs">
              Universal Age-Friendly Design
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Designed for Seniors Aged 60+, Loved by Working Families
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              CareNest features an instant <strong>Senior Accessibility Mode</strong> with extra-large buttons, voice prompts, and simplified screens — alongside a deep monitoring dashboard for busy working children.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={toggleSeniorMode}
              className={`px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm transition flex items-center gap-2 ${
                seniorMode
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>{seniorMode ? 'Senior Mode is ON (Click to Reset)' : 'Try Senior Mode UI'}</span>
            </button>

            <button
              onClick={() => loginAsRole('FAMILY')}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span>Open Family Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================
          6. 4-STEP CAREGIVER VERIFICATION GUARANTEE
         ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 rounded-full">
            Zero Compromise Safety
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">
            The CareNest 4-Step Trust Guarantee
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            We reject 78% of caregiver applicants. Only the most qualified and vetted individuals enter your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1. National Biometric ID</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time Aadhaar biometric match and cross-check against permanent address verification records.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Police Clearance Check</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Certified state police department verification confirming zero prior criminal convictions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Nursing Credentials Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authenticated GDA certification, B.Sc nursing diplomas, and verified hospital clinical work histories.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">4. Geriatric Empathy Screen</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In-person psychological assessment testing patience, gentle handling, and dementia communication skills.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================
          7. TRANSPARENT PRICING & MEMBERSHIP
         ==================================================== */}
      {/* ====================================================
          7. TRANSPARENT PRICING & MEMBERSHIP
         ==================================================== */}
      <section className="bg-slate-50/70 py-16 sm:py-24 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header directly matching reference */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Simple, Transparent Monthly Plans
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Choose a plan that fits your family's needs. Get access to trusted caregivers, care coordination and more.
            </p>
          </div>

          {/* Toggle for Monthly Plans vs Hourly Caregiver Visits */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-slate-200/80 rounded-full text-xs font-bold shadow-inner">
              <button
                onClick={() => setPricingTab('MONTHLY')}
                className={`px-5 py-2 rounded-full transition ${
                  pricingTab === 'MONTHLY'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Plans (From ₹349/mo)
              </button>
              <button
                onClick={() => setPricingTab('HOURLY')}
                className={`px-5 py-2 rounded-full transition ${
                  pricingTab === 'HOURLY'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hourly & Shift Attendant Rates
              </button>
            </div>
          </div>

          {pricingTab === 'MONTHLY' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch pt-2">
              {/* Card 1: CareNest Basic */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between relative transition duration-200">
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-[#e8f1ff] flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2.8L3.2 10.3a1 1 0 0 0-.2.7v9.5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V11a1 1 0 0 0-.2-.7L12 2.8z"
                        fill="#2563eb"
                      />
                      <path
                        d="M12 11.2c-.8-1-2.1-1.1-2.9-.2-.8.8-.7 2.1.2 3l2.7 2.6 2.7-2.6c.9-.9 1-2.2.2-3-.8-.9-2.1-.8-2.9.2z"
                        fill="white"
                      />
                    </svg>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      CareNest Basic
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="text-center flex items-baseline justify-center gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#3a3ee6]">
                      ₹349
                    </span>
                    <span className="text-sm sm:text-base font-medium text-slate-500">
                      /month
                    </span>
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-600 text-center leading-relaxed min-h-[38px] max-w-xs mx-auto">
                    Essential elderly-care support for you and your family.
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Medication and appointment reminders</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Daily well-being check-ins</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Family care dashboard</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => {
                      updateSubscription({
                        id: `sub-${Date.now()}`,
                        userId: 'user-family-1',
                        planName: 'CareNest Basic',
                        monthlyRateINR: 349,
                        status: 'ACTIVE',
                        renewalDate: new Date(Date.now() + 86400000 * 30).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        }),
                        paymentMethod: 'UPI AutoPay (vikram@oksbi)',
                        features: [
                          'Medication and appointment reminders',
                          'Daily well-being check-ins',
                          'Family care dashboard',
                        ],
                      });
                      setActiveView('SUBSCRIPTION');
                    }}
                    className="w-full py-3 px-6 rounded-full border-2 border-[#583beb] text-[#583beb] hover:bg-[#583beb]/5 font-bold text-xs sm:text-sm transition text-center active:scale-[0.99]"
                  >
                    Choose CareNest Basic
                  </button>
                </div>
              </div>

              {/* Card 2: CareNest Plus (Most Popular) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#583beb] shadow-[0_12px_40px_rgba(88,59,235,0.12)] flex flex-col justify-between relative transition duration-200">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#583beb] text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
                  MOST POPULAR
                </div>

                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-[#ede8ff] flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-[#583beb]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 6.2c-.85-1.1-2.3-1.3-3.3-.4-1.1.9-1.2 2.5-.2 3.6L12 13.2l3.5-3.8c1-1.1.9-2.7-.2-3.6-1-.9-2.45-.7-3.3.4z" />
                      <path d="M6.2 11.2c-.6.4-1.2 1.2-1.2 2.2 0 2.4 2 4.4 4.5 5.4l.6-1.6c-1.8-.8-3.1-2.2-3.1-3.8 0-.6.3-1.1.7-1.4l-1.5-.8z" />
                      <path d="M17.8 11.2l-1.5.8c.4.3.7.8.7 1.4 0 1.6-1.3 3-3.1 3.8l.6 1.6c2.5-1 4.5-3 4.5-5.4 0-1-.6-1.8-1.2-2.2z" />
                    </svg>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      CareNest Plus
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="text-center flex items-baseline justify-center gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#3a3ee6]">
                      ₹699
                    </span>
                    <span className="text-sm sm:text-base font-medium text-slate-500">
                      /month
                    </span>
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-600 text-center leading-relaxed min-h-[38px] max-w-xs mx-auto">
                    More support, more peace of mind for your loved ones.
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Everything in CareNest Basic</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Caregiver search and booking coordination</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Family care updates</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Priority support</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => {
                      updateSubscription({
                        id: `sub-${Date.now()}`,
                        userId: 'user-family-1',
                        planName: 'CareNest Plus',
                        monthlyRateINR: 699,
                        status: 'ACTIVE',
                        renewalDate: new Date(Date.now() + 86400000 * 30).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        }),
                        paymentMethod: 'UPI AutoPay (vikram@oksbi)',
                        features: [
                          'Everything in CareNest Basic',
                          'Caregiver search and booking coordination',
                          'Family care updates',
                          'Priority support',
                        ],
                      });
                      setActiveView('SUBSCRIPTION');
                    }}
                    className="w-full py-3 px-6 rounded-full bg-[#583beb] hover:bg-[#482fe0] text-white font-bold text-xs sm:text-sm shadow-md transition text-center active:scale-[0.99]"
                  >
                    Choose CareNest Plus
                  </button>
                </div>
              </div>

              {/* Card 3: CareNest Premium */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between relative transition duration-200">
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-[#ffede2] flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                      <path d="M12 2.5L4 5.5v6c0 5.3 3.4 10.3 8 11.5 4.6-1.2 8-6.2 8-11.5v-6l-8-3z" fill="#d8521d" />
                      <path d="M10.8 8h2.4v2.8H16v2.4h-2.8V16h-2.4v-2.8H8v-2.4h2.8V8z" fill="white" />
                    </svg>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      CareNest Premium
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="text-center flex items-baseline justify-center gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#3a3ee6]">
                      ₹1,099
                    </span>
                    <span className="text-sm sm:text-base font-medium text-slate-500">
                      /month
                    </span>
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-600 text-center leading-relaxed min-h-[38px] max-w-xs mx-auto">
                    Comprehensive care support for round-the-clock peace of mind.
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Everything in CareNest Plus</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Dedicated care coordinator</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Weekly care summaries</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">Priority emergency assistance coordination</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => {
                      updateSubscription({
                        id: `sub-${Date.now()}`,
                        userId: 'user-family-1',
                        planName: 'CareNest Premium',
                        monthlyRateINR: 1099,
                        status: 'ACTIVE',
                        renewalDate: new Date(Date.now() + 86400000 * 30).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        }),
                        paymentMethod: 'UPI AutoPay (vikram@oksbi)',
                        features: [
                          'Everything in CareNest Plus',
                          'Dedicated care coordinator',
                          'Weekly care summaries',
                          'Priority emergency assistance coordination',
                        ],
                      });
                      setActiveView('SUBSCRIPTION');
                    }}
                    className="w-full py-3 px-6 rounded-full border-2 border-[#583beb] text-[#583beb] hover:bg-[#583beb]/5 font-bold text-xs sm:text-sm transition text-center active:scale-[0.99]"
                  >
                    Choose CareNest Premium
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-2">
              {/* Hourly Plan 1 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">On-Demand Hours</span>
                  <h3 className="text-xl font-black text-slate-900">Hourly Caregiver Visit</h3>
                  <div className="text-3xl font-black text-indigo-700 font-display">
                    ₹350 <span className="text-xs font-normal text-slate-500">/ hour</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ideal for doctor visits, 2-hour wound dressings, or light companion strolls.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Minimum 2 hours per visit</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Certified GDA nurse attendant</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Instant digital vital logging</li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveView('CAREGIVER_SEARCH')}
                  className="w-full py-3 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition"
                >
                  Book Hourly Care
                </button>
              </div>

              {/* Hourly Plan 2: 12-Hour */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-600 shadow-[0_12px_40px_rgba(79,70,229,0.15)] space-y-6 flex flex-col justify-between relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] uppercase font-black px-3.5 py-1 rounded-full shadow-sm">
                  Most Popular Shift
                </span>
                <div className="space-y-4 pt-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase">Daily Shift</span>
                  <h3 className="text-xl font-black text-slate-900">12-Hour Day Attendant</h3>
                  <div className="text-3xl font-black text-indigo-700 font-display">
                    ₹1,800 <span className="text-xs font-normal text-slate-500">/ day</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Full day support for bathing, meals, medication, physiotherapy, and doctor visits.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Continuous 12-hour duty</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Dedicated assigned nurse</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Backup replacement guarantee</li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveView('CAREGIVER_SEARCH')}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md transition"
                >
                  Book 12-Hour Attendant
                </button>
              </div>

              {/* Hourly Plan 3: Live-In */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Continuous Support</span>
                  <h3 className="text-xl font-black text-slate-900">24/7 Live-In Attendant</h3>
                  <div className="text-3xl font-black text-indigo-700 font-display">
                    ₹3,200 <span className="text-xs font-normal text-slate-500">/ day</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Full-time residing nurse for bedridden, dementia, or post-stroke intensive care.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Round-the-clock home resident</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Vital signs & catheter management</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Emergency SOS link included</li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveView('CAREGIVER_SEARCH')}
                  className="w-full py-3 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition"
                >
                  Inquire Live-In Care
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================
          8. FAMILY TESTIMONIALS & CASE STORIES
         ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 rounded-full">
            Real Family Stories
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Loved by Over 1,200 Families in Bengaluru
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Hear from sons, daughters, and doctors who trust CareNest for their parents' health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              "Living in California while my 79-year-old mother is in Indiranagar was constant anxiety. With CareNest, Sister Ananya visits daily, logs her insulin, and sends photos. It gave my family our sleep back."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="font-bold text-slate-900 text-xs">Vikram S. Chandra</p>
              <p className="text-[10px] text-slate-500">Software Architect • Mother cared for in Indiranagar</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              "After my father's hip replacement surgery, Nurse Rajesh Kumar helped with gentle rehabilitation strolls and wound care. The verification reports gave us complete confidence to invite him into our home."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="font-bold text-slate-900 text-xs">Pooja Nair</p>
              <p className="text-[10px] text-slate-500">Senior Director • Father cared for in Koramangala</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              "The senior accessibility mode is fantastic. My mother cannot read small fonts, but with CareNest's large buttons and voice reminders, she proudly presses 'Mark Taken' for her morning blood pressure tablets."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <p className="font-bold text-slate-900 text-xs">Aditya Rao</p>
              <p className="text-[10px] text-slate-500">Fintech Product Lead • Jayanagar, Bengaluru</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          9. FAQ ACCORDION
         ==================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================
          10. FINAL CALL TO ACTION BANNER
         ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-indigo-900/40">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-300">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Care at Home. Peace of Mind for Families.</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-white">
              Give Your Loved Ones the Care They Truly Deserve.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Book a verified geriatric nurse or companion attendant today in Bengaluru. Safe, insured, and background-cleared.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setActiveView('CAREGIVER_SEARCH')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm sm:text-base rounded-full shadow-[0_8px_25px_rgba(79,70,229,0.5)] transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Find a Verified Caregiver</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveView('SUBSCRIPTION')}
                className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base rounded-full border border-white/20 transition"
              >
                Explore Membership Plans (From ₹349/mo)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <CaregiverDetailModal
        caregiver={modalCaregiver}
        onClose={() => setModalCaregiver(null)}
      />
    </div>
  );
};
