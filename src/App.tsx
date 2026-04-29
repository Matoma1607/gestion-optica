import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Truck, 
  Settings, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Filter,
  ClipboardList,
  Eye,
  Activity,
  Layers,
  Wrench,
  History,
  X,
  Maximize2,
  ExternalLink,
  ArrowRight,
  Box,
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types & Constants ---

type Location = 
  | '24 de Septiembre' 
  | '9 de Julio' 
  | 'Aguilares' 
  | 'Solmar Alem' 
  | 'Solmar Mendoza' 
  | 'Junín' 
  | 'Lutz Ferrando' 
  | 'Maipú' 
  | 'Yerba Buena' 
  | 'Concepción';

type Stage = 
  | 'General'
  | 'Calibrado' 
  | 'Cristales' 
  | 'Logística' 
  | 'Opticenter' 
  | 'Lutz Ferrand' 
  | 'Casa Central' 
  | 'Yerba Buena' 
  | 'Solmar 2' 
  | 'Concepción' 
  | 'Moto 1' 
  | 'Moto 2' 
  | 'Armazones' 
  | 'Superficie' 
  | 'Antireflejo';

type Status = 'Vencida' | 'Retrasado' | 'A tiempo';

interface Order {
  id: string; // #0000 format
  location: Location;
  promisedTime: string; // HH:MM
  stage: Stage;
  remainingTime: number; // in minutes (for sorting/filtering logic)
  status: Status;
}

const LOCATIONS: Location[] = [
  '24 de Septiembre', '9 de Julio', 'Aguilares', 'Solmar Alem', 'Solmar Mendoza', 
  'Junín', 'Lutz Ferrando', 'Maipú', 'Yerba Buena', 'Concepción'
];

const STAGES: Stage[] = [
  'General',
  'Calibrado',
  'Cristales',
  'Logística',
  'Opticenter',
  'Lutz Ferrand',
  'Casa Central',
  'Yerba Buena',
  'Solmar 2',
  'Concepción',
  'Moto 1',
  'Moto 2',
  'Armazones',
  'Superficie',
  'Antireflejo'
];

const INITIAL_ORDERS: Order[] = [
  { id: '#10056', location: '24 de Septiembre', promisedTime: '12:10', stage: 'Logística', remainingTime: -5, status: 'Vencida' },
  { id: '#10112', location: '9 de Julio', promisedTime: '15:55', stage: 'Calibrado', remainingTime: 79, status: 'A tiempo' },
  { id: '#10166', location: 'Aguilares', promisedTime: '13:45', stage: 'Antireflejo', remainingTime: 45, status: 'Retrasado' },
  { id: '#10385', location: 'Solmar Alem', promisedTime: '16:00', stage: 'Yerba Buena', remainingTime: 84, status: 'A tiempo' },
  { id: '#10281', location: 'Solmar Mendoza', promisedTime: '14:20', stage: 'Superficie', remainingTime: 34, status: 'Retrasado' },
  { id: '#10299', location: 'Junín', promisedTime: '12:30', stage: 'Cristales', remainingTime: 0, status: 'Vencida' },
  { id: '#10197', location: 'Lutz Ferrando', promisedTime: '15:15', stage: 'Antireflejo', remainingTime: 57, status: 'Retrasado' },
  { id: '#10510', location: 'Maipú', promisedTime: '17:00', stage: 'Calibrado', remainingTime: 120, status: 'A tiempo' },
  { id: '#10017', location: 'Yerba Buena', promisedTime: '14:45', stage: 'Casa Central', remainingTime: 86, status: 'A tiempo' },
  { id: '#10104', location: 'Concepción', promisedTime: '15:52', stage: 'Concepción', remainingTime: 52, status: 'Retrasado' },
  { id: '#10082', location: '24 de Septiembre', promisedTime: '14:23', stage: 'Moto 1', remainingTime: 15, status: 'Retrasado' },
  { id: '#10621', location: '9 de Julio', promisedTime: '18:10', stage: 'Moto 2', remainingTime: 145, status: 'A tiempo' },
  { id: '#10744', location: 'Aguilares', promisedTime: '19:30', stage: 'Armazones', remainingTime: 230, status: 'A tiempo' },
  { id: '#10812', location: 'Solmar Alem', promisedTime: '11:15', stage: 'Opticenter', remainingTime: -120, status: 'Vencida' },
  { id: '#10915', location: 'Yerba Buena', promisedTime: '16:45', stage: 'Solmar 2', remainingTime: 35, status: 'Retrasado' },
  { id: '#10999', location: 'Lutz Ferrando', promisedTime: '15:20', stage: 'Lutz Ferrand', remainingTime: 25, status: 'Retrasado' },
  { id: '#11022', location: 'Solmar Mendoza', promisedTime: '14:00', stage: 'Cristales', remainingTime: -15, status: 'Vencida' },
  { id: '#11045', location: 'Lutz Ferrando', promisedTime: '16:30', stage: 'Calibrado', remainingTime: 45, status: 'Retrasado' },
  { id: '#11056', location: 'Junín', promisedTime: '18:00', stage: 'Antireflejo', remainingTime: 120, status: 'A tiempo' },
  { id: '#11078', location: 'Maipú', promisedTime: '13:00', stage: 'Superficie', remainingTime: -30, status: 'Vencida' },
  { id: '#11102', location: 'Concepción', promisedTime: '17:15', stage: 'Yerba Buena', remainingTime: 60, status: 'A tiempo' },
  { id: '#11134', location: 'Solmar Alem', promisedTime: '15:00', stage: 'Calibrado', remainingTime: 10, status: 'Retrasado' },
  { id: '#11156', location: '24 de Septiembre', promisedTime: '19:00', stage: 'Armazones', remainingTime: 180, status: 'A tiempo' },
  { id: '#11189', location: 'Aguilares', promisedTime: '14:45', stage: 'Calibrado', remainingTime: 15, status: 'Retrasado' },
  { id: '#11210', location: '9 de Julio', promisedTime: '16:15', stage: 'Cristales', remainingTime: 50, status: 'A tiempo' },
  { id: '#11245', location: 'Solmar Mendoza', promisedTime: '12:45', stage: 'Logística', remainingTime: -60, status: 'Vencida' },
  { id: '#11301', location: 'Lutz Ferrando', promisedTime: '17:30', stage: 'Calibrado', remainingTime: 105, status: 'A tiempo' },
  { id: '#11342', location: 'Yerba Buena', promisedTime: '16:00', stage: 'Antireflejo', remainingTime: 15, status: 'Retrasado' },
  { id: '#11400', location: 'Maipú', promisedTime: '10:00', stage: 'Calibrado', remainingTime: -120, status: 'Vencida' },
  { id: '#11401', location: '24 de Septiembre', promisedTime: '10:15', stage: 'Superficie', remainingTime: 45, status: 'A tiempo' },
  { id: '#11402', location: '9 de Julio', promisedTime: '10:30', stage: 'Cristales', remainingTime: 15, status: 'Retrasado' },
  { id: '#11403', location: 'Aguilares', promisedTime: '10:45', stage: 'Antireflejo', remainingTime: 120, status: 'A tiempo' },
  { id: '#11404', location: 'Solmar Alem', promisedTime: '11:00', stage: 'Logística', remainingTime: 30, status: 'Retrasado' },
  { id: '#11405', location: 'Solmar Mendoza', promisedTime: '11:15', stage: 'Calibrado', remainingTime: 60, status: 'A tiempo' },
  { id: '#11406', location: 'Junín', promisedTime: '11:30', stage: 'Superficie', remainingTime: -10, status: 'Vencida' },
  { id: '#11407', location: 'Lutz Ferrando', promisedTime: '11:45', stage: 'Cristales', remainingTime: 20, status: 'Retrasado' },
  { id: '#11408', location: 'Maipú', promisedTime: '12:00', stage: 'Antireflejo', remainingTime: 90, status: 'A tiempo' },
  { id: '#11409', location: 'Yerba Buena', promisedTime: '12:15', stage: 'Logística', remainingTime: 15, status: 'Retrasado' },
  { id: '#11410', location: 'Concepción', promisedTime: '12:30', stage: 'Calibrado', remainingTime: 180, status: 'A tiempo' },
  { id: '#11411', location: '24 de Septiembre', promisedTime: '12:45', stage: 'Superficie', remainingTime: -45, status: 'Vencida' },
];

const LOGISTICS_OUT: { id: string; destination: string; exitTime: string; items: string[] }[] = [
  { id: '#10056', destination: '24 de Septiembre', exitTime: '12:10 p. m.', items: ['Multifocal Blue Cut', 'Armazón Acetato'] },
  { id: '#10112', destination: 'Yerba Buena', exitTime: '03:55 p. m.', items: ['Orgánico Blanco', 'Reparación Patilla'] },
  { id: '#10166', destination: 'Aguilares', exitTime: '03:55 p. m.', items: ['Policarbonato AR', 'Estuche Rígido'] },
  { id: '#10385', destination: 'Solmar Alem', exitTime: '04:00 p. m.', items: ['Lente de Contacto', 'Líquido Limpieza'] },
  { id: '#11022', destination: 'Solmar Mendoza', exitTime: '02:00 p. m.', items: ['Cristal Mineral', 'Armazón Metal'] },
  { id: '#11245', destination: 'Lutz Ferrando', exitTime: '04:30 p. m.', items: ['Lente Contacto Color', 'Solución Limpieza'] },
  { id: '#11300', destination: 'Concepción', exitTime: '05:00 p. m.', items: ['Multifocal Varilux', 'Limpieza Ultrasonido'] },
];

const SmartTooltip: React.FC<{ text: string; children: React.ReactNode; position?: 'top' | 'bottom' | 'side'; className?: string }> = ({ text, children, position = 'top', className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative ${className}`} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-[100] px-4 py-2 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-2xl border border-white/10 whitespace-nowrap pointer-events-none flex items-center gap-2
              ${position === 'top' ? 'bottom-full mb-3 left-1/2 -translate-x-1/2' : 
                position === 'bottom' ? 'top-full mt-3 left-1/2 -translate-x-1/2' : 
                'bottom-full mb-3 left-1/2 -translate-x-1/2 lg:bottom-auto lg:mb-0 lg:right-full lg:mr-4 lg:top-1/2 lg:-translate-y-1/2 lg:left-auto lg:translate-x-0'
              }`}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></div>
            {text}
            <div className={`absolute border-[6px] border-transparent
              ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-t-brand-blue' : 
                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-brand-blue' : 
                'top-full left-1/2 -translate-x-1/2 border-t-brand-blue lg:top-1/2 lg:-translate-y-1/2 lg:left-full lg:translate-x-0 lg:border-t-transparent lg:border-l-brand-blue'
              }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// --- Views ---

const MonitorView: React.FC<{
  orders: Order[];
  getStatusColor: (status: Status) => string;
}> = ({ orders, getStatusColor }) => {
  const [filter, setFilter] = useState<'Todas' | 'Vencidas' | 'Retrasado'>('Todas');
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesFilter = filter === 'Todas' || o.status === filter;
      const matchesStage = !selectedStage || o.stage === selectedStage;
      return matchesFilter && matchesStage;
    });
  }, [orders, filter, selectedStage]);

  const filterCounts = useMemo(() => ({
    Todas: orders.length,
    Vencidas: orders.filter(o => o.status === 'Vencida').length,
    'Retrasado': orders.filter(o => o.status === 'Retrasado').length,
  }), [orders]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Header del Monitor */}
      <header className="p-4 md:p-8 border-b border-white/10 flex flex-col xl:flex-row justify-between items-center bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50 gap-4 md:gap-6">
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="h-10 w-10 md:h-14 md:w-14 shrink-0 rounded-xl md:rounded-[1.5rem] bg-brand-blue flex items-center justify-center text-white shadow-2xl shadow-brand-blue/40 border border-white/20">
            <ClipboardList size={22} className="md:w-8 md:h-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1.5 bg-brand-green/20 px-2 py-0.5 rounded-full border border-brand-green/30 shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></div>
                <span className="text-brand-green text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none">ACTIVO</span>
              </div>
              <RealTimeClock />
            </div>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full xl:w-auto overflow-x-auto shrink-0">
          {(['Todas', 'Vencidas', 'Retrasado'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 xl:flex-none px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-sm font-black transition-all whitespace-nowrap flex items-center justify-center gap-2 sm:gap-3 ${
                filter === f 
                  ? (f === 'Vencidas' ? 'bg-brand-red text-white' : f === 'Retrasado' ? 'bg-brand-orange text-white' : 'bg-white text-brand-blue') + ' shadow-2xl scale-105 z-10'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{f}</span>
              {filterCounts[f] > 0 && (
                <span className={`flex items-center justify-center min-w-[18px] sm:min-w-[22px] h-4.5 sm:h-5.5 px-1.5 sm:px-2 rounded-full text-[9px] sm:text-xs font-black ${
                  filter === f ? 'bg-white/20 text-white' :
                  f === 'Vencidas' ? 'bg-brand-red text-white' : 
                  f === 'Retrasado' ? 'bg-brand-orange text-white' : 
                  'bg-white/20 text-white'
                }`}>
                  {filterCounts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Tablas del Monitor Divididas */}
      <main className="flex-1 p-2 sm:p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-[1900px] mx-auto pb-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-start">
            {[0, 1].map((panelIdx) => {
              const panelOrders = filteredOrders.filter((_, i) => i % 2 === panelIdx);
              return (
                <div key={panelIdx} className="bg-white rounded-[1.2rem] sm:rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 w-full h-full min-h-[500px]">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[450px] sm:min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic w-20 md:w-24">Orden</th>
                          <th className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Sucursal</th>
                          <th className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-center w-20 md:w-24">T. Rest</th>
                          <th className="px-4 md:px-6 py-4 md:py-5 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-right w-28 md:w-32">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <AnimatePresence mode="popLayout" initial={false}>
                          {panelOrders.length > 0 ? (
                            panelOrders.map((order, idx) => (
                              <motion.tr 
                                key={order.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ 
                                  duration: 0.15, 
                                  delay: Math.min(idx * 0.02, 0.2),
                                  layout: { duration: 0.2 }
                                }}
                                className="hover:bg-slate-50 transition-colors group"
                              >
                                <td className="px-4 md:px-6 py-4 md:py-5">
                                  <span className="text-base md:text-xl font-black text-brand-blue tracking-tighter font-mono">{order.id.replace('#', '')}</span>
                                </td>
                                <td className="px-4 md:px-6 py-4 md:py-5">
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-black text-slate-800 text-xs md:text-base tracking-tight truncate">{order.location}</span>
                                    <span className="text-[9px] md:text-[10px] text-brand-blue font-bold uppercase tracking-tight truncate opacity-70">
                                      {order.stage}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 md:px-6 py-4 md:py-5 text-center">
                                  <span className={`text-lg md:text-2xl font-black ${
                                    order.remainingTime <= 0 ? 'text-brand-red animate-pulse' : 
                                    order.remainingTime <= 60 ? 'text-brand-orange' : 'text-brand-green'
                                  }`}>
                                    {order.remainingTime}'
                                  </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 md:py-5 text-right">
                                  <span className={`text-[8px] md:text-[9px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full uppercase tracking-widest shadow-md inline-block whitespace-nowrap ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <motion.tr
                              key="empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td colSpan={4} className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest italic text-[10px]">
                                {panelIdx === 0 ? 'Sin órdenes en esta sección' : ''}
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
          
          {selectedStage && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setSelectedStage(null)}
                className="bg-brand-blue text-white px-10 py-4 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-brand-blue/90 transition-all shadow-xl flex items-center gap-4"
              >
                Limpiar Filtro: {selectedStage} <X size={20} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---

const RealTimeClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeParts = (date: Date) => {
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    const [time, period] = timeStr.split(' ');
    return { time, period };
  };

  const { time: timeText, period } = formatTimeParts(time);

  return (
    <div className="flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-md px-3 md:px-5 py-2 md:py-2.5 rounded-full border border-white/20 shadow-lg min-w-[150px] md:min-w-[210px] justify-center">
      <Clock size={14} className="text-brand-green animate-pulse md:w-4 md:h-4" />
      <div className="flex items-baseline gap-1 md:gap-1.5 font-mono">
        <span className="text-white font-black tracking-widest text-sm md:text-xl tabular-nums">
          {timeText}
        </span>
        <span className="text-brand-green/80 text-[8px] md:text-[10px] font-black uppercase tracking-tighter w-4 md:w-6">
          {period}
        </span>
      </div>
    </div>
  );
};

interface StageProgressCardProps {
  key?: React.Key;
  stage: string;
  count: number;
  total: number;
  colorClass: string;
  icon: LucideIcon;
  isSelected?: boolean;
  onClick?: () => void;
}

function StageProgressCard({ stage, count, colorClass, icon: Icon, isSelected, onClick }: StageProgressCardProps & { count: number }) {
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative p-1.5 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group aspect-square w-[60px] shrink-0 ${
        isSelected 
          ? 'bg-brand-blue shadow-lg shadow-brand-blue/20' 
          : 'bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-blue/20'
      }`}
    >
      {/* Task Count Badge */}
      {count > 0 && (
        <div className={`absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 text-[7px] font-black z-10 shadow-sm border ${
          isSelected 
            ? 'bg-brand-green text-brand-blue border-white/20' 
            : 'bg-brand-blue text-white border-white/10'
        }`}>
          {count}
        </div>
      )}

      {/* Main Icon Box */}
      <div className={`p-1 rounded-lg transition-all group-hover:scale-110 ${
        isSelected 
          ? 'bg-white/20 text-white' 
          : `${colorClass.replace('bg-', 'bg-opacity-10 text-')}`
      }`}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      
      {/* Label */}
      <span className={`text-[7px] font-black uppercase tracking-tighter text-center leading-[1] transition-colors line-clamp-2 w-full px-0.5 ${
        isSelected ? 'text-white' : 'text-slate-600'
      }`}>
        {stage}
      </span>
    </motion.div>
  );
}

const LogisticsOutSection: React.FC<{ onOpenHistory: () => void }> = ({ onOpenHistory }) => (
  <div className="bg-slate-900 text-white p-2 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden h-[60px] flex flex-col shrink-0">
    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-green/10 blur-xl rounded-full -mr-4 -mt-4"></div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[7px] font-black text-brand-green uppercase tracking-[0.2em] italic flex items-center gap-1">
          <Truck size={10} />
          Salidas
        </span>
        <button 
          onClick={onOpenHistory}
          className="text-white/40 hover:text-white transition-all relative group/hist"
          title="Abrir historial"
        >
          <History size={10} />
          <span className="absolute right-full mr-2 top-0 px-1.5 py-0.5 bg-brand-blue text-[6px] font-black text-white uppercase tracking-tighter rounded border border-white/10 opacity-0 group-hover/hist:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
            Abrir historial
          </span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
        <div className="flex flex-col gap-1.5 py-1">
          {LOGISTICS_OUT.map((job) => (
            <div key={job.id} className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
              <div className="w-7 h-7 bg-brand-green/20 rounded flex items-center justify-center shrink-0">
                <Truck size={12} className="text-brand-green" />
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex items-baseline justify-between">
                   <span className="text-xs font-black text-brand-green leading-none">{job.id.replace('#', '')}</span>
                   <span className="text-[6px] font-black text-brand-green uppercase tracking-tighter bg-brand-green/10 px-1 py-0.5 rounded border border-brand-green/20 truncate ml-2">
                     {job.destination}
                   </span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CompactOrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Vencida': return 'bg-brand-red text-white border-brand-red/20 shadow-brand-red/10';
      case 'Retrasado': return 'bg-brand-orange text-white border-brand-orange/20 shadow-brand-orange/10';
      default: return 'bg-brand-green text-white border-brand-green/20 shadow-brand-green/10';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 rounded-xl p-1.5 shadow-none hover:bg-slate-50 transition-all group relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-sm font-black text-brand-blue font-mono tracking-tighter">
          {order.id.replace('#', '')}
        </span>
        <span className={`text-[7px] font-black px-1 py-0.5 rounded uppercase tracking-tighter shadow-sm border ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>
      
      <div className="flex items-end justify-between gap-1">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-slate-800 leading-none truncate">{order.location}</span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter truncate">{order.stage}</span>
        </div>
        
        <div className="flex items-baseline gap-0.5 text-right shrink-0">
          <span className={`text-sm font-black italic tabular-nums ${
            order.remainingTime <= 0 ? 'text-brand-red' : 
            order.remainingTime <= 60 ? 'text-brand-orange' : 'text-brand-green'
          }`}>
            {order.remainingTime}
          </span>
          <span className="text-[8px] font-bold text-slate-300 italic">'</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App Component ---

export default function App() {
  const [filter, setFilter] = useState<'Todas' | 'Vencidas' | 'Retrasado'>('Todas');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [orders] = useState<Order[]>(INITIAL_ORDERS);

  // Router logic
  const [view, setView] = useState<'dashboard' | 'monitor'>('dashboard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'monitor') {
      setView('monitor');
    }
  }, []);

  const handleOpenMonitor = () => {
    window.open(window.location.pathname + '?view=monitor', '_blank');
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Vencida': return 'bg-brand-red text-white';
      case 'Retrasado': return 'bg-brand-orange text-white';
      default: return 'bg-brand-green text-white';
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filter !== 'Todas') {
      const statusToFilter = filter === 'Vencidas' ? 'Vencida' : filter;
      result = result.filter(order => order.status === statusToFilter);
    }
    if (selectedStage) {
      result = result.filter(order => order.stage === selectedStage);
    }
    return result;
  }, [orders, filter, selectedStage]);

  const stats = useMemo(() => {
    return STAGES.map(stage => {
      if (stage === 'General') {
        return {
          stage,
          count: orders.length,
          total: orders.length
        };
      }
      return {
        stage,
        count: orders.filter(o => o.stage === stage).length,
        total: orders.length
      };
    });
  }, [orders]);

  const filterCounts = useMemo(() => ({
    Todas: orders.length,
    Vencidas: orders.filter(o => o.status === 'Vencida').length,
    'Retrasado': orders.filter(o => o.status === 'Retrasado').length,
  }), [orders]);

  if (view === 'monitor') {
    return <MonitorView orders={orders} getStatusColor={getStatusColor} />;
  }

  const getStageIcon = (stage: Stage) => {
    switch (stage) {
      case 'General': return Activity;
      case 'Logística': return Truck;
      case 'Calibrado': return Wrench;
      case 'Cristales': return Eye;
      case 'Antireflejo': return Zap;
      case 'Superficie': return Layers;
      case 'Opticenter':
      case 'Lutz Ferrand':
      case 'Casa Central':
      case 'Yerba Buena':
      case 'Solmar 2':
      case 'Concepción':
        return MapPin;
      case 'Moto 1':
      case 'Moto 2':
        return Truck;
      case 'Armazones': return ClipboardList;
      default: return ClipboardList;
    }
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col bg-slate-50">
      
      <main className="flex-1 w-full px-4 pt-4 pb-12">
        <div className="max-w-[1900px] mx-auto space-y-8">
          {/* Top Section: Navigation & Logistics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 items-center">
            <section className="overflow-hidden">
              <div className="flex items-center gap-2 overflow-x-auto pt-1 snap-x scrollbar-thin scrollbar-thumb-slate-200 uppercase tracking-widest">
                {stats.map((stat: { stage: string; count: number; total: number }, idx: number) => (
                  <div key={stat.stage} className="snap-start flex-shrink-0">
                    <SmartTooltip 
                      text={`${stat.count} tareas en ${stat.stage}`}
                      position="top"
                    >
                      <StageProgressCard 
                        stage={stat.stage} 
                        count={stat.count} 
                        total={stat.total}
                        isSelected={selectedStage === stat.stage || (stat.stage === 'General' && !selectedStage)}
                        onClick={() => {
                          if (stat.stage === 'General') {
                            setSelectedStage(null);
                          } else {
                            setSelectedStage(selectedStage === stat.stage ? null : stat.stage as Stage);
                          }
                        }}
                        icon={getStageIcon(stat.stage as Stage)}
                        colorClass={
                          stat.stage === 'General' ? 'bg-brand-blue' :
                          idx % 6 === 0 ? 'bg-blue-500' : 
                          idx % 6 === 1 ? 'bg-indigo-500' : 
                          idx % 6 === 2 ? 'bg-purple-500' : 
                          idx % 6 === 3 ? 'bg-pink-500' : 
                          idx % 6 === 4 ? 'bg-brand-green' : 'bg-brand-orange'
                        }
                      />
                    </SmartTooltip>
                  </div>
                ))}
              </div>
            </section>

            <LogisticsOutSection onOpenHistory={() => setShowHistory(true)} />
          </div>
          
          {/* Main Content Sections: Panel 1 & Panel 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 relative items-start">
            {/* Artificial Vertical Divider for visual consistency */}
            <div className="hidden xl:block absolute left-1/2 top-4 bottom-4 w-px bg-slate-200/50 -translate-x-1/2"></div>
            
            {/* Panel 1 */}
            <section className="space-y-4">
              <div className="bg-white rounded-[2.5rem] shadow-none overflow-hidden border border-slate-200/60 flex flex-col min-h-[500px]">
                <div className="flex-1 p-4 overflow-y-auto max-h-[1400px] scrollbar-thin scrollbar-thumb-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Sub-Panel 1A */}
                    <div className="space-y-2">
                      {filteredOrders.filter((_, i) => i % 4 === 0).map((order) => (
                        <CompactOrderCard key={order.id} order={order} />
                      ))}
                    </div>
                    {/* Sub-Panel 1B */}
                    <div className="space-y-2">
                      {filteredOrders.filter((_, i) => i % 4 === 1).map((order) => (
                        <CompactOrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  </div>
                  {filteredOrders.filter((_, i) => i % 4 === 0 || i % 4 === 1).length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-20">
                      <Box size={40} className="text-slate-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Sin datos</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Panel 2 */}
            <section className="space-y-4 flex flex-col h-full overflow-hidden">
              <div className="bg-white rounded-[2.5rem] shadow-none overflow-hidden border border-slate-200/60 flex flex-col min-h-[500px]">
                <div className="flex-1 p-4 overflow-y-auto max-h-[1400px] scrollbar-thin scrollbar-thumb-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Sub-Panel 2A */}
                    <div className="space-y-2">
                      {filteredOrders.filter((_, i) => i % 4 === 2).map((order) => (
                        <CompactOrderCard key={order.id} order={order} />
                      ))}
                    </div>
                    {/* Sub-Panel 2B */}
                    <div className="space-y-2">
                      {filteredOrders.filter((_, i) => i % 4 === 3).map((order) => (
                        <CompactOrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  </div>
                  {filteredOrders.filter((_, i) => i % 4 === 2 || i % 4 === 3).length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-20">
                      <Box size={40} className="text-slate-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Sin datos</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>


      {/* History Modal Overlay */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-brand-blue/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 md:p-8 bg-brand-blue text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10 min-w-0">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3 italic">
                    <History className="text-brand-green shrink-0" /> <span className="truncate">HISTORIAL DE SALIDAS</span>
                  </h2>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1 truncate">Registros de las últimas 24 horas</p>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="relative z-10 bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all ml-4 shrink-0"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-slate-50/50">
                {LOGISTICS_OUT.concat(LOGISTICS_OUT).map((job, idx) => (
                  <SmartTooltip key={idx} text="Registro histórico del envío">
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex flex-col bg-white p-4 md:p-5 rounded-3xl border border-slate-100 hover:border-brand-blue/20 transition-all shadow-sm group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 md:gap-4 min-w-0">
                          <div className="h-10 md:h-12 w-10 md:w-12 shrink-0 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:scale-105 transition-transform">
                            <Truck size={20} className="text-brand-green" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">Orden de Salida</p>
                            <p className="text-lg md:text-xl font-black text-brand-blue tracking-tight truncate">{job.id.replace('#', '')}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 whitespace-nowrap">Sucursal Destino</p>
                          <span className="inline-block text-[10px] bg-brand-blue text-white px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm border border-brand-blue/10 whitespace-nowrap">
                            {job.destination}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </SmartTooltip>
                ))}
              </div>

              <div className="p-6 bg-white border-t border-slate-100 text-center">
                <button 
                  onClick={() => setShowHistory(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Cerrar Historial
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Breakdown Summary Section (Persistent Table Below) */}

    </div>
  );
}
