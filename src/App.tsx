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
];

const LOGISTICS_OUT: { id: string; destination: string; exitTime: string; items: string[] }[] = [
  { id: '#10056', destination: '24 de Septiembre', exitTime: '12:10 p. m.', items: ['Multifocal Blue Cut', 'Armazón Acetato'] },
  { id: '#10112', destination: 'Yerba Buena', exitTime: '03:55 p. m.', items: ['Orgánico Blanco', 'Reparación Patilla'] },
  { id: '#10166', destination: 'Aguilares', exitTime: '03:55 p. m.', items: ['Policarbonato AR', 'Estuche Rígido'] },
  { id: '#10385', destination: 'Solmar Alem', exitTime: '04:00 p. m.', items: ['Lente de Contacto', 'Líquido Limpieza'] },
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
            <h1 className="text-lg md:text-4xl font-black text-white tracking-tight uppercase italic leading-tight truncate">Monitor Central de Órdenes</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
              <div className="flex items-center gap-1.5 bg-brand-green/20 px-2 py-0.5 rounded-full border border-brand-green/30 shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></div>
                <span className="text-brand-green text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none">ACTIVO</span>
              </div>
              <RealTimeClock />
            </div>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full xl:w-auto overflow-x-auto scrollbar-hide shrink-0">
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
                <div key={panelIdx} className="bg-white rounded-[1.2rem] sm:rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 w-full h-full min-h-[100px]">
                  <div className="overflow-x-auto w-full scrollbar-hide">
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
                                  <span className="text-base md:text-xl font-black text-brand-blue tracking-tighter font-mono">#{order.id.replace('#', '')}</span>
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

const Header: React.FC = () => (
  <header className="flex flex-col md:flex-row justify-between items-center bg-brand-blue p-6 shadow-lg rounded-b-3xl">
    <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight text-center md:text-left">Panel de Control de Laboratorio Óptico</h1>
        <p className="text-brand-green font-medium text-sm flex items-center justify-center md:justify-start gap-1 uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Sistema de Gestión Beta
        </p>
      </div>
    </div>
    <RealTimeClock />
  </header>
);

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

function StageProgressCard({ stage, count, total, colorClass, icon: Icon, isSelected, onClick }: StageProgressCardProps) {
  const progress = (count / total) * 100;
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-2xl cursor-pointer transition-all border min-h-[120px] flex flex-col justify-between ${
        isSelected 
          ? 'bg-brand-blue border-transparent ring-4 ring-brand-blue/10 shadow-lg' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20 text-white' : `${colorClass.replace('bg-', 'bg-opacity-10 text-')}`}`}>
          <Icon size={18} />
        </div>
        <div className="text-right">
          <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>{count}</span>
          <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>Tareas</p>
        </div>
      </div>
      
      <div className="mt-2">
        <div className={`flex justify-between items-end mb-1.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
          <span className="text-[10px] font-black uppercase tracking-wider truncate mr-2">{stage}</span>
          <span className="text-[8px] font-mono font-bold opacity-70 shrink-0">{Math.round(progress)}%</span>
        </div>
        <div className={`w-full h-1 rounded-full overflow-hidden ${isSelected ? 'bg-white/10' : 'bg-slate-100'}`}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${isSelected ? 'bg-brand-green' : colorClass}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

const LogisticsOutSection: React.FC<{ onOpenHistory: () => void }> = ({ onOpenHistory }) => (
  <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter italic text-white/90">
          <Truck size={24} className="text-brand-green" />
          <span>TRABAJOS QUE SALIERON</span>
        </h3>
        <button 
          onClick={onOpenHistory}
          className="px-4 py-2 bg-brand-green/10 hover:bg-brand-green/20 rounded-xl text-[10px] font-black text-brand-green uppercase tracking-widest border border-brand-green/20 transition-all flex items-center gap-2"
        >
          Historial <History size={14} />
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {LOGISTICS_OUT.map((job, idx) => (
          <div key={job.id} className="min-w-[280px] snap-start">
            <SmartTooltip 
              text={`Envío a sucursal ${job.destination}`} 
              position="top" 
              className="w-full"
            >
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col bg-white/5 p-4 rounded-3xl border border-white/10 hover:bg-white/10 transition-all hover:border-brand-green/30 cursor-default gap-3"
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-2xl bg-brand-green/20 flex items-center justify-center text-brand-green group-hover:scale-110 transition-transform">
                      <Truck size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-black truncate">ORDEN</span>
                      <span className="text-lg font-black text-brand-green tracking-tight truncate">{job.id.replace('#', '')}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-0.5 whitespace-nowrap">Sucursal</span>
                      <span className="text-[10px] text-brand-green font-black uppercase tracking-widest px-2 py-0.5 bg-brand-green/10 rounded-md border border-brand-green/20 whitespace-nowrap">{job.destination}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </SmartTooltip>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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
      <Header />
      
      <main className="flex-1 w-full px-4 mt-6 space-y-8">
        
        {/* Top Section: Progress Cards and Logistics in horizontal strips */}
        <div className="space-y-8">
          
          {/* Tarjetas de Etapas (Laboratory Panel - Horizontal Scroll) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter italic text-slate-800">
                <Layers size={21} className="text-brand-blue" />
                <span>Estado de Laboratorio</span>
              </h3>
              <div className="text-[9px] font-black bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full uppercase tracking-widest border border-brand-blue/20">
                {stats.length} Procesos
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {stats.map((stat: { stage: string; count: number; total: number }, idx: number) => (
                <div key={stat.stage} className="min-w-[280px] md:min-w-[320px] snap-start">
                  <SmartTooltip 
                    text={`Pedidos esperando en ${stat.stage}`}
                    position="bottom"
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

          {/* Panel de Logística (Salidas Recientes - Compacto) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-12">
               <LogisticsOutSection onOpenHistory={() => setShowHistory(true)} />
            </div>
          </section>
        </div>

        {/* Breakdown Summary Section (Split into two panels) */}
        <section className="mt-12 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                <ClipboardList size={32} className="text-brand-blue" />
                Resumen de Órdenes
              </h2>
              <p className="text-slate-500 font-medium mt-1">Desglose detallado de todos los pedidos en curso.</p>
            </div>

            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
              {(['Todas', 'Vencidas', 'Retrasado'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                    filter === f 
                      ? (f === 'Vencidas' ? 'bg-brand-red text-white' : f === 'Retrasado' ? 'bg-brand-orange text-white' : 'bg-brand-blue text-white') + ' shadow-lg scale-105'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{f}</span>
                  {filterCounts[f] > 0 && (
                    <span className={`flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full text-[9px] font-black ${
                      filter === f ? 'bg-white/20 text-white' :
                      f === 'Vencidas' ? 'bg-brand-red text-white' : 
                      f === 'Retrasado' ? 'bg-brand-orange text-white' : 
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {filterCounts[f]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {[0, 1].map((panelIdx) => {
              const panelOrders = filteredOrders.filter((_, i) => i % 2 === panelIdx);
              return (
                <div key={panelIdx} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[400px]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Orden</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Local</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-center">T. Rest</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <AnimatePresence mode="popLayout" initial={false}>
                          {panelOrders.length > 0 ? (
                            panelOrders.map((order, idx) => (
                              <motion.tr 
                                key={order.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
                                className="hover:bg-slate-50/80 transition-colors group"
                              >
                                <td className="px-6 py-6">
                                  <span className="text-lg font-black text-brand-blue tracking-tight font-mono">#{order.id.replace('#', '')}</span>
                                </td>
                                <td className="px-6 py-6 font-bold text-slate-800 text-sm">
                                  {order.location}
                                </td>
                                <td className="px-6 py-6 text-center">
                                  <span className={`text-xl font-black ${
                                    order.remainingTime <= 0 ? 'text-brand-red animate-pulse' : 
                                    order.remainingTime <= 60 ? 'text-brand-orange' : 'text-brand-green'
                                  }`}>
                                    {order.remainingTime}'
                                  </span>
                                </td>
                                <td className="px-6 py-6 text-right">
                                  <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm inline-block ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <motion.tr
                              key={`empty-${panelIdx}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <td colSpan={4} className="py-20 text-center">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-300 italic">
                                  {panelIdx === 0 && filteredOrders.length === 0 ? 'Sin órdenes para mostrar' : ''}
                                </p>
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
        </section>

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

      <footer className="mt-auto py-10 text-center text-slate-400 text-xs font-medium">
        <p>© 2026 Sistema de Gestión de Laboratorio Óptico v1.0.0-Beta</p>
      </footer>
    </div>
  );
}
