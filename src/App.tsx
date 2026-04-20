import { useState, useMemo, useEffect, type ReactNode, type CSSProperties } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  parseISO
} from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Zap, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  Leaf,
  Sun,
  Wind,
  Snowflake,
  Flower2
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '@/src/lib/utils';
import { MOCK_EVENTS } from '@/src/constants';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [inspiration, setInspiration] = useState<{ title: string; detail: string; loading: boolean; holidays: string[] }>({
    title: "Global Insight",
    detail: "Fetching the latest from the world pool...",
    loading: false,
    holidays: []
  });
  const [holidayDetail, setHolidayDetail] = useState<{ name: string; info: string; loading: boolean } | null>(null);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real-time insight and holidays from the internet via Gemini
  useEffect(() => {
    async function fetchInsightsAndHolidays() {
      setInspiration(prev => ({ ...prev, loading: true }));
      try {
        const dateStr = format(selectedDate, 'MMMM do, yyyy');
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `For the date ${dateStr}, identify:
1. A unique artistic or historical insight.
2. Any major public holidays or global observances.
Provide a JSON response with 'title', 'detail' (the insight), and 'holidays' (an array of holiday strings).`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                detail: { type: Type.STRING },
                holidays: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            }
          }
        });

        if (response.text) {
          const data = JSON.parse(response.text);
          setInspiration({ 
            title: data.title, 
            detail: data.detail, 
            loading: false,
            holidays: data.holidays || []
          });
        }
      } catch (error) {
        console.error("Gemini failed:", error);
        setInspiration({ 
          title: "Creative Pause", 
          detail: "The universe is quiet for a moment.", 
          loading: false,
          holidays: []
        });
      }
    }

    fetchInsightsAndHolidays();
    setHolidayDetail(null); // Reset when date changes
  }, [selectedDate]);

  const fetchHolidayDetail = async (holidayName: string) => {
    if (holidayDetail?.name === holidayName) return;
    setHolidayDetail({ name: holidayName, info: "", loading: true });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a sophisticated, brief editorial description of the origin and significance of the holiday: ${holidayName}. Focus on historical roots and cultural impact.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              info: { type: Type.STRING }
            }
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setHolidayDetail({ name: holidayName, info: data.info, loading: false });
      }
    } catch (error) {
      console.error("Holiday fetch failed:", error);
      setHolidayDetail({ name: holidayName, info: "The archives are silent on this observance.", loading: false });
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
  }, [startDate, endDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const selectedEvents = useMemo(() => {
    return MOCK_EVENTS.filter(event => isSameDay(parseISO(event.date), selectedDate));
  }, [selectedDate]);

  const getDayEvents = (date: Date) => {
    return MOCK_EVENTS.filter(event => isSameDay(parseISO(event.date), date));
  };

  const getSeason = (date: Date) => {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Autumn";
    return "Winter";
  };

  const season = getSeason(currentDate);

  const SEASON_STYLES = {
    Spring: { 
      bg: 'bg-season-spring-bg', 
      design: 'bg-spring-design',
      border: 'border-season-spring-border', 
      gridBg: 'bg-season-spring-border',
      primary: 'var(--color-season-spring-primary)',
      icon: <Flower2 className="w-4 h-4 opacity-40 animate-spin-slow" />,
      tag: "Vernal Awakening"
    },
    Summer: { 
      bg: 'bg-season-summer-bg', 
      design: 'bg-summer-design',
      border: 'border-season-summer-border', 
      gridBg: 'bg-season-summer-border',
      primary: 'var(--color-season-summer-primary)',
      icon: <Sun className="w-4 h-4 opacity-40 animate-spin-slow" />,
      tag: "Solstice Radiance"
    },
    Autumn: { 
      bg: 'bg-season-autumn-bg', 
      design: 'bg-autumn-design',
      border: 'border-season-autumn-border', 
      gridBg: 'bg-season-autumn-border',
      primary: 'var(--color-season-autumn-primary)',
      icon: <Wind className="w-4 h-4 opacity-40 animate-spin-slow" />,
      tag: "Equinox Harvest"
    },
    Winter: { 
      bg: 'bg-season-winter-bg', 
      design: 'bg-winter-design',
      border: 'border-season-winter-border', 
      gridBg: 'bg-season-winter-border',
      primary: 'var(--color-season-winter-primary)',
      icon: <Snowflake className="w-4 h-4 opacity-40 animate-spin-slow" />,
      tag: "Boreal Stillness"
    }
  };

  const { bg: seasonBg, design: seasonDesign, border: seasonBorder, gridBg: seasonGridBg, primary: seasonPrimary, icon: seasonIcon, tag: seasonTag } = SEASON_STYLES[season as keyof typeof SEASON_STYLES];

  return (
    <div 
      className={cn("flex h-screen w-full relative overflow-hidden text-ink font-sans transition-all duration-1000", seasonBg, seasonDesign)}
      style={{ '--color-primary': seasonPrimary } as CSSProperties}
    >
      {/* Sidebar with Real-time Clock */}
      <aside className={cn("w-24 border-r flex flex-col items-center justify-between py-12 z-10 transition-colors duration-1000", seasonBg, seasonBorder)}>
        <div className="flex flex-col items-center gap-4">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase vertical-text opacity-40">Live Chronos</div>
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-1 bg-primary rounded-full"
          />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <Clock className="w-4 h-4 text-primary mb-2" />
          <div className="text-xl serif italic font-black leading-none">{format(now, 'HH')}</div>
          <div className="text-xl serif italic font-black leading-none opacity-40">{format(now, 'mm')}</div>
          <div className="text-[10px] font-bold mt-4 serif italic">{format(currentDate, 'yyyy')}</div>
        </div>
        
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase vertical-text opacity-10">UTC {format(now, 'O')}</div>
      </aside>

      <main className="flex-1 flex flex-col relative text-ink">
        {/* Header */}
        <header className={cn("h-48 flex items-end px-12 pb-8 border-b relative z-10 backdrop-blur-xl transition-colors duration-1000", seasonBorder, seasonBg.replace('bg-', 'bg-') + '/80')}>
          <div className="flex-1">
            <h1 className="serif text-8xl leading-none font-black tracking-tighter">
              {format(currentDate, 'MMMM')}
            </h1>
            <p className="text-[10px] tracking-[0.3em] uppercase mt-4 opacity-40 font-bold">
              The {seasonTag} / {format(currentDate, 'yyyy')} Edition
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={prevMonth}
                className="w-10 h-10 rounded-full border border-ink flex items-center justify-center hover:bg-ink hover:text-surface transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 h-10 rounded-full border border-ink flex items-center justify-center hover:bg-ink hover:text-surface transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                Today
              </button>
              <button 
                onClick={nextMonth}
                className="w-10 h-10 rounded-full border border-ink flex items-center justify-center hover:bg-ink hover:text-surface transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-40">System Pulse</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="px-4 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Real-time Sync
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Calendar Section */}
          <div className="col-span-8 p-12 relative flex flex-col overflow-y-auto">
            <div className={cn("grid grid-cols-7 border transition-colors duration-1000", seasonBorder, seasonGridBg)}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={cn("p-4 text-center text-[10px] font-bold uppercase tracking-widest opacity-30 border-b transition-colors duration-1000", seasonBg, seasonBorder)}>
                  {day}
                </div>
              ))}
              {days.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const dayEvents = getDayEvents(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "h-32 p-4 flex flex-col justify-between cursor-pointer border-r border-b transition-all relative group duration-1000",
                      isCurrentMonth ? seasonBg : "opacity-20",
                      isSelected ? "bg-ink text-surface border-ink z-10" : isToday ? "bg-primary/5" : "",
                      seasonBorder
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "font-serif font-black text-xl leading-none",
                        isSelected ? "text-surface" : "text-ink"
                      )}>
                        {format(day, 'dd')}
                      </span>
                      {isToday && (
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {dayEvents.map(event => (
                        <div 
                          key={event.id}
                          className={cn(
                            "w-full h-1 rounded-full",
                            isSelected ? "bg-surface/30" : "bg-primary"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="absolute bottom-6 right-6 serif text-[320px] font-black leading-none text-ink opacity-[0.02] pointer-events-none select-none z-0 uppercase tracking-tighter">
              {format(currentDate, 'MM')}
            </div>
          </div>

          {/* Events & Global Insights Sidebar */}
          <div className={cn("col-span-4 border-l p-12 flex flex-col overflow-y-auto transition-colors duration-1000 backdrop-blur-sm", seasonBorder, seasonBg.replace('bg-', 'bg-') + '/40')}>
            <section className="mb-16 min-h-[140px]">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-ink">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">
                  {holidayDetail ? "Holiday Profile" : "Global Insight"}
                </h3>
                {holidayDetail ? (
                  <button 
                    onClick={() => setHolidayDetail(null)}
                    className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                  >
                    Back to Overview
                  </button>
                ) : (
                  seasonIcon
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {holidayDetail ? (
                  <motion.div
                    key={`holiday-${holidayDetail.name}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={cn("space-y-4", holidayDetail.loading && "opacity-50")}
                  >
                    <h4 className="serif text-3xl font-black leading-tight text-primary">
                      {holidayDetail.name}
                    </h4>
                    <p className="text-sm opacity-60 leading-relaxed font-serif italic">
                      {holidayDetail.loading ? "Consulting world archives..." : `"${holidayDetail.info}"`}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedDate.toISOString()}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={cn("space-y-4", inspiration.loading && "opacity-50")}
                  >
                    <h4 className="serif text-3xl font-black leading-tight">{inspiration.title}</h4>
                    <p className="text-sm opacity-60 leading-relaxed font-serif italic">
                      "{inspiration.detail}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="flex-1">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-10 pb-4 border-b border-ink">
                Scheduled Works
              </h3>
              
              <div className="space-y-12">
                <AnimatePresence mode="popLayout">
                  {/* Render Holidays */}
                  {inspiration.holidays.map((holiday, idx) => (
                    <motion.div
                      key={`holiday-card-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => fetchHolidayDetail(holiday)}
                      className={cn(
                        "group cursor-pointer p-4 -m-4 rounded-xl transition-all border border-transparent",
                        holidayDetail?.name === holiday ? "bg-primary/5 border-primary/20" : "hover:bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-primary">
                          Global Holiday
                        </span>
                        <Zap className={cn(
                          "w-3 h-3 transition-colors",
                          holidayDetail?.name === holiday ? "text-primary opacity-100" : "opacity-20 group-hover:opacity-40"
                        )} />
                      </div>
                      <h4 className="serif text-2xl font-black leading-tight mb-2 group-hover:text-primary transition-colors">{holiday}</h4>
                      <p className="text-[10px] opacity-40 leading-relaxed font-bold uppercase tracking-widest">
                        Click to explore heritage
                      </p>
                    </motion.div>
                  ))}

                  {/* Render Scheduled Events */}
                  {selectedEvents.length > 0 ? (
                    selectedEvents.map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group"
                      >
                        <span className={cn(
                          "text-[10px] font-bold block mb-2 tracking-widest uppercase",
                          isSameDay(selectedDate, new Date()) ? "text-primary" : "opacity-40"
                        )}>
                          {event.time}
                        </span>
                        <h4 className="serif text-2xl font-black leading-tight mb-2">{event.title}</h4>
                        <p className="text-xs opacity-50 leading-relaxed font-medium">
                          {event.description || "Exclusive review of scheduled works and strategic directions."}
                        </p>
                      </motion.div>
                    ))
                  ) : inspiration.holidays.length === 0 && (
                    <div className="opacity-30 italic text-sm serif">No personalized scheduled for this date.</div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <div className="mt-auto pt-12 flex items-center justify-between">
              <button className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-ink transition-colors shadow-2xl shadow-primary/20 group">
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <div className="flex items-center gap-4">
                <button className="p-2 opacity-20 hover:opacity-100 transition-opacity"><Search className="w-5 h-5" /></button>
                <button className="p-2 opacity-20 hover:opacity-100 transition-opacity"><Zap className="w-5 h-5" /></button>
                <button className="p-2 opacity-20 hover:opacity-100 transition-opacity"><Settings className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: ReactNode, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "flex flex-col items-center gap-1 transition-all relative",
      active ? "text-primary" : "text-on-surface-variant hover:text-primary/70"
    )}>
      {icon}
      <span className="font-label text-[10px] font-semibold uppercase tracking-[0.05em]">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full" 
        />
      )}
    </button>
  );
}
