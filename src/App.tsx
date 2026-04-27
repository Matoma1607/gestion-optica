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
  ArrowRight,
  ClipboardList,
  Eye,
  Activity,
  Layers,
  Wrench,
  History,
  X,
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

type Stage = 'Logística' | 'Calibrado' | 'Antireflejo' | 'Superficie' | 'Control Final' | 'Armado';

type Status = 'Vencida' | 'En Riesgo' | 'A tiempo';

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

const STAGES: Stage[] = ['Logística', 'Calibrado', 'Antireflejo', 'Superficie', 'Control Final', 'Armado'];

const INITIAL_ORDERS: Order[] = [
  { id: '#10056', location: '24 de Septiembre', promisedTime: '12:10', stage: 'Logística', remainingTime: 15, status: 'Vencida' },
  { id: '#10112', location: '9 de Julio', promisedTime: '15:55', stage: 'Calibrado', remainingTime: 79, status: 'Vencida' },
  { id: '#10166', location: 'Aguilares', promisedTime: '13:45', stage: 'Antireflejo', remainingTime: 16, status: 'Vencida' },
  { id: '#10385', location: 'Solmar Alem', promisedTime: '16:00', stage: 'Armado', remainingTime: 84, status: 'A tiempo' },
  { id: '#10281', location: 'Solmar Mendoza', promisedTime: '14:20', stage: 'Superficie', remainingTime: 34, status: 'En Riesgo' },
  { id: '#10299', location: 'Junín', promisedTime: '12:30', stage: 'Control Final', remainingTime: 19, status: 'Vencida' },
  { id: '#10197', location: 'Lutz Ferrando', promisedTime: '15:15', stage: 'Antireflejo', remainingTime: 57, status: 'En Riesgo' },
  { id: '#10510', location: 'Maipú', promisedTime: '17:00', stage: 'Calibrado', remainingTime: 87, status: 'A tiempo' },
  { id: '#10017', location: 'Yerba Buena', promisedTime: '14:45', stage: 'Logística', remainingTime: 86, status: 'A tiempo' },
  { id: '#10104', location: 'Concepción', promisedTime: '15:52', stage: 'Armado', remainingTime: 52, status: 'En Riesgo' },
  { id: '#10082', location: '24 de Septiembre', promisedTime: '14:23', stage: 'Control Final', remainingTime: 23, status: 'Vencida' },
];

const LOGISTICS_OUT: { id: string; destination: string; exitTime: string; items: string[] }[] = [
  { id: '#10056', destination: 'Centro', exitTime: '12:10 p. m.', items: ['Multifocal Blue Cut', 'Armazón Acetato'] },
  { id: '#10112', destination: 'Norte', exitTime: '03:55 p. m.', items: ['Orgánico Blanco', 'Reparación Patilla'] },
  { id: '#10166', destination: 'Centro', exitTime: '03:55 p. m.', items: ['Policarbonato AR', 'Estuche Rígido'] },
  { id: '#10385', destination: 'Centro', exitTime: '04:00 p. m.', items: ['Lente de Contacto', 'Líquido Limpieza'] },
];

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
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg min-w-[210px] justify-center">
      <Clock size={16} className="text-brand-green animate-pulse" />
      <div className="flex items-baseline gap-1.5 font-mono">
        <span className="text-white font-black tracking-widest text-xl tabular-nums">
          {timeText}
        </span>
        <span className="text-brand-green/80 text-[10px] font-black uppercase tracking-tighter w-6">
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
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-3xl cursor-pointer transition-all border min-h-[160px] flex flex-col justify-between ${
        isSelected 
          ? 'bg-brand-blue border-transparent ring-4 ring-brand-blue/20 shadow-xl' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-lg'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className={`p-3 rounded-2xl ${isSelected ? 'bg-white/20 text-white' : `${colorClass.replace('bg-', 'bg-opacity-10 text-')}`}`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <span className={`text-3xl font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>{count}</span>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>Tareas</p>
        </div>
      </div>
      
      <div>
        <div className={`flex justify-between items-end mb-2 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
          <span className="text-xs font-black uppercase tracking-wider">{stage}</span>
          <span className="text-[10px] font-mono font-bold opacity-70">AVANCE {Math.round(progress)}%</span>
        </div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-white/10' : 'bg-slate-100'}`}>
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
  <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col h-full border border-white/5 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter italic">
          <Truck size={24} className="text-brand-green" />
          <span>TRABAJOS QUE SALIERON</span>
        </h3>
      </div>
      
      <div className="space-y-4 flex-1">
        {LOGISTICS_OUT.map((job: { id: string; destination: string; exitTime: string; items: string[] }, idx: number) => (
          <motion.div 
            key={job.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group flex flex-col bg-white/5 p-4 rounded-3xl border border-white/10 hover:bg-white/10 transition-all hover:border-brand-green/30 cursor-default gap-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-brand-green/20 flex items-center justify-center text-brand-green group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-black">ORDEN</span>
                  <span className="text-lg font-black text-brand-green tracking-tight">{job.id.replace('#', '')}</span>
                </div>
              </div>
              
              <div className="text-right flex flex-col">
                <span className="text-[10px] text-brand-green font-black uppercase tracking-widest px-2 py-0.5 bg-brand-green/10 rounded-md border border-brand-green/20">{job.destination}</span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 font-bold">{job.exitTime.replace(' p. m.', ' PM').replace(' a. m.', ' AM')}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3 mt-1">
              {job.items.map((item, i) => (
                <span key={i} className="text-[9px] bg-white/5 text-slate-300 px-2 py-1 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors uppercase font-bold tracking-wider">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={onOpenHistory}
        className="mt-8 w-full group relative py-4 flex items-center justify-center gap-3 text-sm font-black text-white transition-all overflow-hidden"
      >
        <div className="absolute inset-0 bg-brand-green/20 rounded-2xl group-hover:bg-brand-green/30 transition-colors"></div>
        <span className="relative z-10 uppercase tracking-widest text-brand-green">Ver Historial</span>
        <ArrowRight size={18} className="relative z-10 text-brand-green group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [filter, setFilter] = useState<'Todas' | 'Vencidas' | 'En Riesgo'>('Todas');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [orders] = useState<Order[]>(INITIAL_ORDERS);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filter !== 'Todas') {
      result = result.filter(order => order.status === filter);
    }
    if (selectedStage) {
      result = result.filter(order => order.stage === selectedStage);
    }
    return result;
  }, [orders, filter, selectedStage]);

  const stats = useMemo(() => {
    return STAGES.map(stage => ({
      stage,
      count: orders.filter(o => o.stage === stage).length,
      total: orders.length
    }));
  }, [orders]);

  const filterCounts = useMemo(() => ({
    Todas: orders.length,
    Vencidas: orders.filter(o => o.status === 'Vencida').length,
    'En Riesgo': orders.filter(o => o.status === 'En Riesgo').length,
  }), [orders]);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Vencida': return 'bg-brand-red text-white';
      case 'En Riesgo': return 'bg-brand-orange text-white';
      case 'A tiempo': return 'bg-brand-green text-white';
    }
  };

  const getStageIcon = (stage: Stage) => {
    switch (stage) {
      case 'Logística': return Truck;
      case 'Calibrado': return Wrench;
      case 'Antireflejo': return Eye;
      case 'Superficie': return Layers;
      case 'Control Final': return CheckCircle2;
      case 'Armado': return ClipboardList;
    }
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 w-full px-4 mt-6 space-y-6">
        
        {/* Top Section: Progress Cards (3x2) and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tarjetas de Etapas (3x2 Grid) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {stats.map((stat: { stage: string; count: number; total: number }, idx: number) => (
              <StageProgressCard 
                key={stat.stage} 
                stage={stat.stage} 
                count={stat.count} 
                total={stat.total}
                isSelected={selectedStage === stat.stage}
                onClick={() => setSelectedStage(selectedStage === stat.stage ? null : stat.stage as Stage)}
                icon={getStageIcon(stat.stage as Stage)}
                colorClass={
                  idx === 0 ? 'bg-blue-500' : 
                  idx === 1 ? 'bg-indigo-500' : 
                  idx === 2 ? 'bg-purple-500' : 
                  idx === 3 ? 'bg-pink-500' : 
                  idx === 4 ? 'bg-brand-green' : 'bg-brand-orange'
                }
              />
            ))}
          </div>

          {/* Panel Lateral de Logística */}
          <div className="lg:col-span-4 h-full">
            <LogisticsOutSection onOpenHistory={() => setShowHistory(true)} />
          </div>
        </div>

        {/* Bottom Section: Main Table Split in Two Panels */}
        <section className="space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="text-brand-blue" />
                Resumen Detallado de Órdenes Críticas
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-500 text-sm">Lista en tiempo real dividida para mayor visibilidad</p>
                {selectedStage && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                  >
                    Filtrando por: {selectedStage}
                  </motion.span>
                )}
              </div>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto">
              {(['Todas', 'Vencidas', 'En Riesgo'] as const).map((f: 'Todas' | 'Vencidas' | 'En Riesgo') => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    filter === f 
                      ? 'bg-white text-slate-900 shadow-md transform scale-105' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span>{f}</span>
                  {filterCounts[f] > 0 && (
                    <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black ${
                      f === 'Vencidas' ? 'bg-brand-red text-white' : 
                      f === 'En Riesgo' ? 'bg-brand-orange text-white' : 
                      'bg-slate-200 text-slate-600'
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
                <div key={panelIdx} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 w-24">Orden</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Local</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Etapa</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">T. Rest</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Estado</th>
                        </tr>
                      </thead>
                      <AnimatePresence mode="wait">
                        <motion.tbody 
                          key={`${panelIdx}-${filter}-${selectedStage}`}
                          className="divide-y divide-slate-50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {panelOrders.length > 0 ? (
                            panelOrders.map((order: Order, idx: number) => (
                              <motion.tr 
                                key={order.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="hover:bg-slate-50/80 transition-colors group"
                              >
                                <td className="px-6 py-4 font-mono text-xs font-bold text-brand-blue">{order.id}</td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{order.location}</span>
                                    <span className="text-[9px] text-slate-400 font-mono tracking-tighter flex items-center gap-1">
                                      <Clock size={8} /> {order.promisedTime}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 rounded-md text-slate-600 border border-slate-200">
                                    {order.stage}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-xs font-mono font-bold ${
                                    order.remainingTime < 20 ? 'text-brand-red' : 
                                    order.remainingTime < 60 ? 'text-brand-orange' : 'text-brand-green'
                                  }`}>
                                    {order.remainingTime}'
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            panelIdx === 0 && panelOrders.length === 0 && filteredOrders.length === 0 && (
                              <motion.tr
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                                  No hay órdenes.
                                </td>
                              </motion.tr>
                            )
                          )}
                        </motion.tbody>
                      </AnimatePresence>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="p-6 bg-slate-900 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></span>
              SINCRONIZACIÓN ACTIVA - ACTUALIZACIÓN CADA 60S
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-red"></span>
                <span>Vencida (&lt;30m)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-orange"></span>
                <span>Alerta (30-60m)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-green"></span>
                <span>Óptimo (&gt;60m)</span>
              </div>
            </div>
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
              <div className="p-8 bg-brand-blue text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 italic">
                    <History className="text-brand-green" /> HISTORIAL DE SALIDAS
                  </h2>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">Registros de las últimas 24 horas</p>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="relative z-10 bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-slate-50/50">
                {LOGISTICS_OUT.concat(LOGISTICS_OUT).map((job, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex flex-col bg-white p-5 rounded-3xl border border-slate-100 hover:border-brand-blue/20 transition-all shadow-sm group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:scale-105 transition-transform">
                          <CheckCircle2 size={24} className="text-brand-green" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Orden</p>
                          <p className="text-xl font-black text-brand-blue tracking-tight">{job.id.replace('#', '')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-brand-blue text-white px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm border border-brand-blue/10">
                          {job.destination}
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 mt-2 font-bold flex items-center justify-end gap-1">
                          <Clock size={10} /> {job.exitTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pt-4 border-t border-slate-50">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Contenido del paquete</p>
                      <div className="flex flex-wrap gap-2">
                        {job.items.map((item, i) => (
                          <span key={i} className="text-[9px] font-black text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg uppercase tracking-wider group-hover:bg-brand-blue group-hover:text-white group-hover:border-brand-blue transition-colors">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
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

      <footer className="mt-auto py-10 text-center text-slate-400 text-xs font-medium">
        <p>© 2026 Sistema de Gestión de Laboratorio Óptico v1.0.0-Beta</p>
      </footer>
    </div>
  );
}
