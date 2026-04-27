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
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Tipos e Interfaces ---

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
  id: string;
  location: Location;
  promisedTime: string;
  stage: Stage;
  remainingTime: number;
  status: Status;
}

// --- Constantes de Datos ---

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

const RealTimeClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm">
      <Clock size={16} className="text-white" />
      <span className="font-mono font-bold text-white tracking-widest text-lg">
        {time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
};

const Header: React.FC = () => (
  <header className="flex flex-col md:flex-row justify-between items-center bg-brand-blue p-6 shadow-lg rounded-b-3xl">
    <div className="flex items-center gap-4">
      <div className="bg-white p-3 rounded-2xl">
        <Activity className="text-brand-blue" size={32} />
      </div>
      <div>
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Panel de Control Óptico</h1>
        <p className="text-brand-green font-bold text-[10px] uppercase tracking-[0.2em]">Logística en Tiempo Real</p>
      </div>
    </div>
    <RealTimeClock />
  </header>
);

interface CardProps {
  stage: string;
  count: number;
  total: number;
  colorClass: string;
  icon: LucideIcon;
  isSelected?: boolean;
  onClick?: () => void;
}

const StageProgressCard: React.FC<CardProps> = ({ stage, count, total, colorClass, icon: Icon, isSelected, onClick }) => {
  const progress = (count / total) * 100;
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-[2rem] cursor-pointer transition-all border min-h-[140px] flex flex-col justify-between ${
        isSelected 
          ? 'bg-brand-blue border-transparent ring-4 ring-brand-blue/10 shadow-xl' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className={`p-3 rounded-2xl ${isSelected ? 'bg-white/20 text-white' : `${colorClass.replace('bg-', 'bg-opacity-10 text-')}`}`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <span className={`text-3xl font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>{count}</span>
          <p className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>Tareas</p>
        </div>
      </div>
      <div>
        <p className={`text-[11px] font-black uppercase mb-2 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>{stage}</p>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-white/10' : 'bg-slate-100'}`}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${isSelected ? 'bg-brand-green' : colorClass}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const LogisticsOutSection: React.FC = () => (
  <div className="bg-slate-900 text-white p-7 rounded-[2.5rem] shadow-2xl h-full border border-white/5 relative overflow-hidden flex flex-col">
    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter italic">
          <Truck size={24} className="text-brand-green" />
          <span>LOGÍSTICA SALIENTE</span>
        </h3>
        <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hoy</span>
      </div>
      
      <div className="space-y-4 flex-1">
        {LOGISTICS_OUT.map((job) => (
          <div key={job.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-brand-green/10 transition-all cursor-default">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand-green text-slate-900 flex items-center justify-center font-black text-xs">
                OK
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold font-mono tracking-tighter">#{job.id.replace('#','')}</p>
                <p className="text-xs font-black uppercase tracking-wider">{job.destination}</p>
              </div>
            </div>
            <p className="text-xs font-mono text-brand-green font-bold">{job.exitTime}</p>
          </div>
        ))}
      </div>

      <button className="mt-8 py-4 bg-brand-green/10 text-brand-green rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-green text-center transition-all hover:text-slate-900 flex items-center justify-center gap-2">
        Ver todo <ArrowRight size={14} />
      </button>
    </div>
  </div>
);

// --- Componente Principal ---

export default function App() {
  const [filter, setFilter] = useState<'Todas' | 'Vencidas' | 'En Riesgo'>('Todas');
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  
  const filteredOrders = useMemo(() => {
    let result = INITIAL_ORDERS;
    if (filter !== 'Todas') result = result.filter(o => o.status === filter);
    if (selectedStage) result = result.filter(o => o.stage === selectedStage);
    return result;
  }, [filter, selectedStage]);

  const stats = useMemo(() => {
    return STAGES.map(stage => ({
      stage,
      count: INITIAL_ORDERS.filter(o => o.stage === stage).length,
      total: INITIAL_ORDERS.length
    }));
  }, []);

  const getStageIcon = (stage: Stage): LucideIcon => {
    const icons: Record<Stage, LucideIcon> = {
      'Logística': Truck, 'Calibrado': Wrench, 'Antireflejo': Eye,
      'Superficie': Layers, 'Control Final': CheckCircle2, 'Armado': ClipboardList
    };
    return icons[stage];
  };

  const getStatusColor = (status: Status) => {
    const colors = {
      'Vencida': 'bg-brand-red text-white',
      'En Riesgo': 'bg-brand-orange text-white',
      'A tiempo': 'bg-brand-green text-white'
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col bg-slate-50 font-sans">
      <Header />
      
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 mt-8 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {stats.map((s, i) => (
              <StageProgressCard 
                key={s.stage}
                stage={s.stage}
                count={s.count}
                total={s.total}
                isSelected={selectedStage === s.stage}
                onClick={() => setSelectedStage(selectedStage === s.stage ? null : s.stage as Stage)}
                icon={getStageIcon(s.stage as Stage)}
                colorClass={['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-brand-green', 'bg-brand-orange'][i]}
              />
            ))}
          </div>
          <div className="lg:col-span-4 h-full min-h-[400px]">
            <LogisticsOutSection />
          </div>
        </div>

        <section className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-3">
              <ClipboardList className="text-brand-blue" />
              Resumen de Órdenes Críticas
              {selectedStage && <span className="ml-4 bg-brand-blue text-white text-[9px] px-2 py-1 rounded tracking-widest">{selectedStage}</span>}
            </h2>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              {(['Todas', 'Vencidas', 'En Riesgo'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${filter === f ? 'bg-white text-brand-blue shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Orden</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Local</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Promesa</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Etapa</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Restante</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((o) => (
                    <motion.tr key={o.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 font-mono text-sm font-bold text-brand-blue">{o.id}</td>
                      <td className="px-8 py-5 font-black text-xs text-slate-700 uppercase tracking-wider">{o.location}</td>
                      <td className="px-8 py-5 font-mono text-xs text-slate-500 italic">{o.promisedTime}</td>
                      <td className="px-8 py-5"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">{o.stage}</span></td>
                      <td className="px-8 py-5 font-mono font-black text-brand-red text-sm">{o.remainingTime} min</td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter ${getStatusColor(o.status)}`}>
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

      <footer className="mt-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        Sistema Control Óptico Beta v1.0
      </footer>
    </div>
  );
}