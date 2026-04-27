// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Activity,
  Layers,
  Wrench,
  Eye,
  ClipboardList,
  ArrowRight,
  LucideIcon,
  Search,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Tipos & Datos ---

type Location = 
  | '24 de Septiembre' | '9 de Julio' | 'Aguilares' | 'Solmar Alem' 
  | 'Solmar Mendoza' | 'Junín' | 'Lutz Ferrando' | 'Maipú' 
  | 'Yerba Buena' | 'Concepción';

type Stage = 'Logística' | 'Calibrado' | 'Antireflejo' | 'Superficie' | 'Control Final' | 'Armado';
type Status = 'Vencida' | 'En Riesgo' | 'A tiempo';

interface Order {
  id: string;
  location: Location;
  promisedTime: string;
  stage: Stage;
  remainingTime: number;
  status: Status;
}

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

const LOGISTICS_OUT = [
  { id: '#10056', destination: 'Centro', exitTime: '12:10 PM' },
  { id: '#10112', destination: 'Norte', exitTime: '03:55 PM' },
  { id: '#10166', destination: 'Centro', exitTime: '03:55 PM' },
  { id: '#10385', destination: 'Centro', exitTime: '04:00 PM' },
];

// --- Sub-componentes ---

const Header = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="flex flex-col md:flex-row justify-between items-center bg-[#0f172a] p-6 shadow-2xl rounded-b-[2.5rem]">
      <div className="flex items-center gap-4">
        <div className="bg-brand-blue p-3 rounded-2xl shadow-lg shadow-brand-blue/20">
          <Activity className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Control Lab Óptico</h1>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-brand-green text-[10px] font-bold uppercase tracking-widest">Sistema en línea</span>
          </div>
        </div>
      </div>
      <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-2xl">
        <Clock size={18} className="text-blue-400" />
        <span className="text-xl font-mono font-bold text-white tracking-widest">
          {time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </header>
  );
};

interface StageProgressCardProps {
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
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative min-h-[160px] p-5 rounded-3xl cursor-pointer transition-all border-2 overflow-hidden flex flex-col justify-between ${
        isSelected 
          ? 'bg-[#1e3a8a] border-brand-blue shadow-2xl scale-105 z-10' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
          <Icon size={22} />
        </div>
        <div className="text-right">
          <span className={`text-3xl font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>{count}</span>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>Tareas</p>
        </div>
      </div>

      <div className="mt-4">
        <p className={`font-black text-xs uppercase tracking-tighter mb-2 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
          {stage}
        </p>
        <div className={`h-2.5 w-full rounded-full overflow-hidden ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${isSelected ? 'bg-green-400' : colorClass}`}
          />
        </div>
        <div className={`flex justify-between mt-2 text-[10px] font-bold ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
          <span>AVANCE</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
      
      {isSelected && (
        <div className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
      )}
    </motion.div>
  );
}

const LogisticsOutSection = () => (
  <div className="bg-[#0f172a] text-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col h-full border border-white/5">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2">
        <Truck className="text-brand-green" size={24} />
        Logística Saliente
      </h3>
      <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hoy</span>
    </div>
    
    <div className="space-y-4 flex-1">
      {LOGISTICS_OUT.map((job, idx) => (
        <motion.div 
          key={job.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="group flex flex-col p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:border-brand-green/30"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-black text-brand-green uppercase tracking-widest">{job.id}</span>
            <span className="text-[10px] font-mono text-slate-500">{job.exitTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-100 uppercase tracking-tight">{job.destination}</span>
          </div>
        </motion.div>
      ))}
    </div>

    <button className="mt-8 py-4 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all group">
      Ver todo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

export default function App() {
  const [filter, setFilter] = useState<'Todas' | 'Vencidas' | 'En Riesgo'>('Todas');
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const filteredOrders = useMemo(() => {
    let res = INITIAL_ORDERS;
    if (filter !== 'Todas') res = res.filter(o => o.status === filter);
    if (selectedStage) res = res.filter(o => o.stage === selectedStage);
    return res;
  }, [filter, selectedStage]);

  const stats = useMemo(() => {
    return STAGES.map(s => ({
      stage: s,
      count: INITIAL_ORDERS.filter(o => o.stage === s).length,
      total: INITIAL_ORDERS.length
    }));
  }, []);

  const getStageIcon = (s: Stage) => {
    const icons = { Logística: Truck, Calibrado: Wrench, Antireflejo: Eye, Superficie: Layers, 'Control Final': CheckCircle2, Armado: ClipboardList };
    return icons[s];
  };

  const getStageColor = (idx: number) => {
    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500'];
    return colors[idx % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Header />
      
      <main className="max-w-[1600px] mx-auto px-6 mt-10">
        
        {/* Superior: Tarjetas y Logística divididos */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
          {/* Grid de Tarjetas (6 columnas en desktop) */}
          <div className="lg:w-3/4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 w-full">
            {stats.map((stat, idx) => (
              <StageProgressCard 
                key={stat.stage}
                {...stat}
                icon={getStageIcon(stat.stage as Stage)}
                colorClass={getStageColor(idx)}
                isSelected={selectedStage === stat.stage}
                onClick={() => setSelectedStage(selectedStage === stat.stage ? null : stat.stage as Stage)}
              />
            ))}
          </div>
          
          {/* Panel Lateral de Logística */}
          <div className="lg:w-1/4 w-full h-full lg:min-h-[400px]">
            <LogisticsOutSection />
          </div>
        </div>

        {/* Tabla Principal */}
        <section className="bg-white rounded-[3rem] shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-3xl bg-blue-50 flex items-center justify-center text-brand-blue">
                <Package size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Monitoreo Crítico</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumen de Órdenes</span>
                  {selectedStage && (
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter">Filtro: {selectedStage}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-[2rem]">
              {(['Todas', 'Vencidas', 'En Riesgo'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Orden</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Sede Local</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic font-mono">Prometida</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Fase Actual</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-center">Tiempo</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((o, idx) => (
                    <motion.tr 
                      key={o.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-blue-50/20 transition-all group"
                    >
                      <td className="px-10 py-6 font-black text-brand-blue font-mono">{o.id}</td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">{o.location}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><MapPin size={8}/> Tucumán</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-mono text-sm font-bold text-slate-500">{o.promisedTime}</td>
                      <td className="px-10 py-6">
                        <span className="text-[10px] font-black px-4 py-1.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200/60 uppercase tracking-widest">
                          {o.stage}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className={`text-sm font-mono font-black ${
                          o.remainingTime < 25 ? 'text-red-500 animate-pulse' : 'text-slate-800'
                        }`}>
                          {o.remainingTime}min
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className={`text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${
                          o.status === 'Vencida' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                          o.status === 'En Riesgo' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                          'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </section>
      </main>
      
      <footer className="mt-20 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        Panel de Control v1.0.2-Beta © 2026 LogisticLab
      </footer>
    </div>
  );
}