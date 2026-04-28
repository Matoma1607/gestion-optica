import React, { useState, useEffect, useMemo } from "react";
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
  LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types & Constants ---

type Location =
  | "24 de Septiembre"
  | "9 de Julio"
  | "Aguilares"
  | "Solmar Alem"
  | "Solmar Mendoza"
  | "Junín"
  | "Lutz Ferrando"
  | "Maipú"
  | "Yerba Buena"
  | "Concepción";

type Stage =
  | "General"
  | "Calibrado"
  | "Cristales"
  | "Logística"
  | "Opticenter"
  | "Lutz Ferrand"
  | "Casa Central"
  | "Yerba Buena"
  | "Solmar 2"
  | "Concepción"
  | "Moto 1"
  | "Moto 2"
  | "Armazones"
  | "Superficie"
  | "Antireflejo";

type Status = "Vencida" | "Retrasado" | "A tiempo";

interface Order {
  id: string; // #0000 format
  location: Location;
  promisedTime: string; // HH:MM
  stage: Stage;
  remainingTime: number; // in minutes (for sorting/filtering logic)
  status: Status;
}

const LOCATIONS: Location[] = [
  "24 de Septiembre",
  "9 de Julio",
  "Aguilares",
  "Solmar Alem",
  "Solmar Mendoza",
  "Junín",
  "Lutz Ferrando",
  "Maipú",
  "Yerba Buena",
  "Concepción",
];

const STAGES: Stage[] = [
  "General",
  "Calibrado",
  "Cristales",
  "Logística",
  "Opticenter",
  "Lutz Ferrand",
  "Casa Central",
  "Yerba Buena",
  "Solmar 2",
  "Concepción",
  "Moto 1",
  "Moto 2",
  "Armazones",
  "Superficie",
  "Antireflejo",
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "#10056",
    location: "24 de Septiembre",
    promisedTime: "12:10",
    stage: "Logística",
    remainingTime: -5,
    status: "Vencida",
  },
  {
    id: "#10112",
    location: "9 de Julio",
    promisedTime: "15:55",
    stage: "Calibrado",
    remainingTime: 79,
    status: "A tiempo",
  },
  {
    id: "#10166",
    location: "Aguilares",
    promisedTime: "13:45",
    stage: "Antireflejo",
    remainingTime: 45,
    status: "Retrasado",
  },
  {
    id: "#10385",
    location: "Solmar Alem",
    promisedTime: "16:00",
    stage: "Yerba Buena",
    remainingTime: 84,
    status: "A tiempo",
  },
  {
    id: "#10281",
    location: "Solmar Mendoza",
    promisedTime: "14:20",
    stage: "Superficie",
    remainingTime: 34,
    status: "Retrasado",
  },
  {
    id: "#10299",
    location: "Junín",
    promisedTime: "12:30",
    stage: "Cristales",
    remainingTime: 0,
    status: "Vencida",
  },
  {
    id: "#10197",
    location: "Lutz Ferrando",
    promisedTime: "15:15",
    stage: "Antireflejo",
    remainingTime: 57,
    status: "Retrasado",
  },
  {
    id: "#10510",
    location: "Maipú",
    promisedTime: "17:00",
    stage: "Calibrado",
    remainingTime: 120,
    status: "A tiempo",
  },
  {
    id: "#10017",
    location: "Yerba Buena",
    promisedTime: "14:45",
    stage: "Casa Central",
    remainingTime: 86,
    status: "A tiempo",
  },
  {
    id: "#10104",
    location: "Concepción",
    promisedTime: "15:52",
    stage: "Concepción",
    remainingTime: 52,
    status: "Retrasado",
  },
  {
    id: "#10082",
    location: "24 de Septiembre",
    promisedTime: "14:23",
    stage: "Moto 1",
    remainingTime: 15,
    status: "Retrasado",
  },
  {
    id: "#10621",
    location: "9 de Julio",
    promisedTime: "18:10",
    stage: "Moto 2",
    remainingTime: 145,
    status: "A tiempo",
  },
  {
    id: "#10744",
    location: "Aguilares",
    promisedTime: "19:30",
    stage: "Armazones",
    remainingTime: 230,
    status: "A tiempo",
  },
  {
    id: "#10812",
    location: "Solmar Alem",
    promisedTime: "11:15",
    stage: "Opticenter",
    remainingTime: -120,
    status: "Vencida",
  },
  {
    id: "#10915",
    location: "Yerba Buena",
    promisedTime: "16:45",
    stage: "Solmar 2",
    remainingTime: 35,
    status: "Retrasado",
  },
  {
    id: "#10999",
    location: "Lutz Ferrando",
    promisedTime: "15:20",
    stage: "Lutz Ferrand",
    remainingTime: 25,
    status: "Retrasado",
  },
];

const LOGISTICS_OUT: {
  id: string;
  destination: string;
  exitTime: string;
  items: string[];
}[] = [
  {
    id: "#10056",
    destination: "24 de Septiembre",
    exitTime: "12:10 p. m.",
    items: ["Multifocal Blue Cut", "Armazón Acetato"],
  },
  {
    id: "#10112",
    destination: "Yerba Buena",
    exitTime: "03:55 p. m.",
    items: ["Orgánico Blanco", "Reparación Patilla"],
  },
  {
    id: "#10166",
    destination: "Aguilares",
    exitTime: "03:55 p. m.",
    items: ["Policarbonato AR", "Estuche Rígido"],
  },
  {
    id: "#10385",
    destination: "Solmar Alem",
    exitTime: "04:00 p. m.",
    items: ["Lente de Contacto", "Líquido Limpieza"],
  },
];

const SmartTooltip: React.FC<{
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "side";
  className?: string;
}> = ({ text, children, position = "top", className = "" }) => {
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
              ${
                position === "top"
                  ? "bottom-full mb-3 left-1/2 -translate-x-1/2"
                  : position === "bottom"
                    ? "top-full mt-3 left-1/2 -translate-x-1/2"
                    : "bottom-full mb-3 left-1/2 -translate-x-1/2 lg:bottom-auto lg:mb-0 lg:right-full lg:mr-4 lg:top-1/2 lg:-translate-y-1/2 lg:left-auto lg:translate-x-0"
              }`}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></div>
            {text}
            <div
              className={`absolute border-[6px] border-transparent
              ${
                position === "top"
                  ? "top-full left-1/2 -translate-x-1/2 border-t-brand-blue"
                  : position === "bottom"
                    ? "bottom-full left-1/2 -translate-x-1/2 border-b-brand-blue"
                    : "top-full left-1/2 -translate-x-1/2 border-t-brand-blue lg:top-1/2 lg:-translate-y-1/2 lg:left-full lg:translate-x-0 lg:border-t-transparent lg:border-l-brand-blue"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FullSummaryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  filter: "Todas" | "Vencidas" | "Retrasado";
  setFilter: (f: "Todas" | "Vencidas" | "Retrasado") => void;
  selectedStage: Stage | null;
  setSelectedStage: (s: Stage | null) => void;
  filterCounts: Record<string, number>;
  getStatusColor: (status: Status) => string;
}> = ({
  isOpen,
  onClose,
  orders,
  filter,
  setFilter,
  selectedStage,
  setSelectedStage,
  filterCounts,
  getStatusColor,
}) => {
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter = filter === "Todas" || o.status === filter;
      const matchesStage = !selectedStage || o.stage === selectedStage;
      return matchesFilter && matchesStage;
    });
  }, [orders, filter, selectedStage]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex flex-col"
        >
          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-brand-blue flex items-center justify-center text-white shadow-xl shadow-brand-blue/20">
                <ClipboardList size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
                  Resumen de Órdenes Críticas
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    Monitor en Tiempo Real
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 flex-1 md:flex-none">
                {(["Todas", "Vencidas", "Retrasado"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                      filter === f
                        ? (f === "Vencidas"
                            ? "bg-brand-red text-white"
                            : f === "Retrasado"
                              ? "bg-brand-orange text-white"
                              : "bg-white text-brand-blue") +
                          " shadow-lg scale-105"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    <span>{f}</span>
                    {filterCounts[f] > 0 && (
                      <span
                        className={`flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full text-[9px] font-black ${
                          filter === f
                            ? "bg-white/20 text-white"
                            : f === "Vencidas"
                              ? "bg-brand-red text-white"
                              : f === "Retrasado"
                                ? "bg-brand-orange text-white"
                                : "bg-white/20 text-white"
                        }`}
                      >
                        {filterCounts[f]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className="bg-white/5 hover:bg-brand-red text-white p-3 rounded-2xl transition-all border border-white/10 hover:border-brand-red/50 group"
              >
                <X
                  size={24}
                  className="group-hover:rotate-90 transition-transform"
                />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">
                        Orden
                      </th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">
                        Local
                      </th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">
                        Etapa Actual
                      </th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-center">
                        T. Restante
                      </th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-right">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="px-8 py-6">
                            <span className="text-lg font-black text-brand-blue tracking-tight font-mono">
                              #{order.id.replace("#", "")}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-base">
                                {order.location}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-wide">
                                <Clock size={10} className="text-brand-blue" />{" "}
                                Prometido: {order.promisedTime}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border border-slate-200">
                              {order.stage}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span
                              className={`text-xl font-black ${
                                order.remainingTime <= 0
                                  ? "text-brand-red animate-pulse"
                                  : order.remainingTime <= 60
                                    ? "text-brand-orange"
                                    : "text-brand-green"
                              }`}
                            >
                              {order.remainingTime}{" "}
                              <span className="text-xs uppercase ml-1">
                                min
                              </span>
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span
                              className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-30">
                            <ClipboardList size={48} />
                            <p className="text-sm font-black uppercase tracking-widest">
                              Sin órdenes para mostrar
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedStage && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setSelectedStage(null)}
                    className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-blue/90 transition-all shadow-xl shadow-brand-blue/20 flex items-center gap-3"
                  >
                    Borrar Filtro de Etapa ({selectedStage}) <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MonitorView: React.FC<{
  orders: Order[];
  getStatusColor: (status: Status) => string;
}> = ({ orders, getStatusColor }) => {
  const [filter, setFilter] = useState<"Todas" | "Vencidas" | "Retrasado">(
    "Todas",
  );
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter = filter === "Todas" || o.status === filter;
      const matchesStage = !selectedStage || o.stage === selectedStage;
      return matchesFilter && matchesStage;
    });
  }, [orders, filter, selectedStage]);

  const filterCounts = useMemo(
    () => ({
      Todas: orders.length,
      Vencidas: orders.filter((o) => o.status === "Vencida").length,
      Retrasado: orders.filter((o) => o.status === "Retrasado").length,
    }),
    [orders],
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Header del Monitor */}
      <header className="p-6 md:p-8 border-b border-white/10 flex flex-col lg:flex-row justify-between items-center bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50 gap-6">
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <div className="h-14 w-14 shrink-0 rounded-[1.5rem] bg-brand-blue flex items-center justify-center text-white shadow-2xl shadow-brand-blue/40 border border-white/20">
            <ClipboardList size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase italic leading-none">
              Monitor Central de Órdenes
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 bg-brand-green/20 px-2 py-0.5 rounded-full border border-brand-green/30">
                <div className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></div>
                <span className="text-brand-green text-[10px] font-black uppercase tracking-widest">
                  SISTEMA ACTIVO
                </span>
              </div>
              <RealTimeClock />
            </div>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full lg:w-auto overflow-x-auto scrollbar-hide">
          {(["Todas", "Vencidas", "Retrasado"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 lg:flex-none px-6 lg:px-8 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap flex items-center justify-center gap-3 ${
                filter === f
                  ? (f === "Vencidas"
                      ? "bg-brand-red text-white"
                      : f === "Retrasado"
                        ? "bg-brand-orange text-white"
                        : "bg-white text-brand-blue") +
                    " shadow-2xl scale-105 z-10"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{f}</span>
              {filterCounts[f] > 0 && (
                <span
                  className={`flex items-center justify-center min-w-[22px] h-5.5 px-2 rounded-full text-xs font-black ${
                    filter === f
                      ? "bg-white/20 text-white"
                      : f === "Vencidas"
                        ? "bg-brand-red text-white"
                        : f === "Retrasado"
                          ? "bg-brand-orange text-white"
                          : "bg-white/20 text-white"
                  }`}
                >
                  {filterCounts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Tablas del Monitor Divididas */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-[1900px] mx-auto min-h-full">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {[0, 1].map((panelIdx) => {
              const panelOrders = filteredOrders.filter(
                (_, i) => i % 2 === panelIdx,
              );
              return (
                <div
                  key={`${panelIdx}-${filter}`}
                  className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 h-fit"
                >
                  <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic w-24">
                            Orden
                          </th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">
                            Sucursal
                          </th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-center w-24">
                            T. Rest
                          </th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-right w-32">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 relative">
                        <AnimatePresence mode="popLayout" initial={false}>
                          {panelOrders.length > 0 ? (
                            panelOrders.map((order, idx) => (
                              <motion.tr
                                key={order.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10, scale: 0.98 }}
                                transition={{
                                  duration: 0.2,
                                  delay: idx * 0.03,
                                  layout: { duration: 0.3 },
                                }}
                                className="hover:bg-slate-50 transition-colors group"
                              >
                                <td className="px-6 py-5">
                                  <span className="text-xl font-black text-brand-blue tracking-tighter font-mono">
                                    #{order.id.replace("#", "")}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-black text-slate-800 text-base tracking-tight truncate">
                                      {order.location}
                                    </span>
                                    <span className="text-[10px] text-brand-blue font-bold uppercase tracking-tight truncate opacity-70">
                                      {order.stage}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <span
                                    className={`text-2xl font-black ${
                                      order.remainingTime <= 0
                                        ? "text-brand-red animate-pulse"
                                        : order.remainingTime <= 60
                                          ? "text-brand-orange"
                                          : "text-brand-green"
                                    }`}
                                  >
                                    {order.remainingTime}'
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                  <span
                                    className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md inline-block whitespace-nowrap ${getStatusColor(order.status)}`}
                                  >
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
                              <td
                                colSpan={4}
                                className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest italic"
                              >
                                {panelIdx === 0
                                  ? "Sin órdenes en esta sección"
                                  : ""}
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
    const timeStr = date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const [time, period] = timeStr.split(" ");
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
        <h1 className="text-2xl font-bold text-white tracking-tight text-center md:text-left">
          Panel de Control de Laboratorio Óptico
        </h1>
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

function StageProgressCard({
  stage,
  count,
  total,
  colorClass,
  icon: Icon,
  isSelected,
  onClick,
}: StageProgressCardProps) {
  const progress = (count / total) * 100;
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-3xl cursor-pointer transition-all border min-h-[160px] flex flex-col justify-between ${
        isSelected
          ? "bg-brand-blue border-transparent ring-4 ring-brand-blue/20 shadow-xl"
          : "bg-white border-slate-100 shadow-sm hover:shadow-lg"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div
          className={`p-3 rounded-2xl ${isSelected ? "bg-white/20 text-white" : `${colorClass.replace("bg-", "bg-opacity-10 text-")}`}`}
        >
          <Icon size={24} />
        </div>
        <div className="text-right">
          <span
            className={`text-3xl font-black ${isSelected ? "text-white" : "text-slate-800"}`}
          >
            {count}
          </span>
          <p
            className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-blue-200" : "text-slate-400"}`}
          >
            Tareas
          </p>
        </div>
      </div>

      <div>
        <div
          className={`flex justify-between items-end mb-2 ${isSelected ? "text-blue-100" : "text-slate-500"}`}
        >
          <span className="text-xs font-black uppercase tracking-wider">
            {stage}
          </span>
          <span className="text-[10px] font-mono font-bold opacity-70">
            AVANCE {Math.round(progress)}%
          </span>
        </div>
        <div
          className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? "bg-white/10" : "bg-slate-100"}`}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${isSelected ? "bg-brand-green" : colorClass}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

const LogisticsOutSection: React.FC<{ onOpenHistory: () => void }> = ({
  onOpenHistory,
}) => (
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
        {LOGISTICS_OUT.map((job, idx) => (
          <SmartTooltip
            key={job.id}
            text={`Envío a sucursal ${job.destination}`}
            position="side"
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
                    <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-black truncate">
                      ORDEN
                    </span>
                    <span className="text-lg font-black text-brand-green tracking-tight truncate">
                      {job.id.replace("#", "")}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-0.5 whitespace-nowrap">
                      Sucursal
                    </span>
                    <span className="text-[10px] text-brand-green font-black uppercase tracking-widest px-2 py-0.5 bg-brand-green/10 rounded-md border border-brand-green/20 whitespace-nowrap">
                      {job.destination}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </SmartTooltip>
        ))}
      </div>

      <SmartTooltip
        text="Consulta el registro histórico de salidas"
        position="bottom"
      >
        <button
          onClick={onOpenHistory}
          className="mt-8 w-full group relative py-4 flex items-center justify-center gap-3 text-sm font-black text-white transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-brand-green/20 rounded-2xl group-hover:bg-brand-green/30 transition-colors"></div>
          <span className="relative z-10 uppercase tracking-widest text-brand-green">
            Ver Historial
          </span>
          <ArrowRight
            size={18}
            className="relative z-10 text-brand-green group-hover:translate-x-1 transition-transform"
          />
        </button>
      </SmartTooltip>
    </div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [filter, setFilter] = useState<"Todas" | "Vencidas" | "Retrasado">(
    "Todas",
  );
  const [showHistory, setShowHistory] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [orders] = useState<Order[]>(INITIAL_ORDERS);

  // Router logic
  const [view, setView] = useState<"dashboard" | "monitor">("dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "monitor") {
      setView("monitor");
    }
  }, []);

  const handleOpenMonitor = () => {
    window.open(window.location.pathname + "?view=monitor", "_blank");
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Vencida":
        return "bg-brand-red text-white";
      case "Retrasado":
        return "bg-brand-orange text-white";
      default:
        return "bg-brand-green text-white";
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filter !== "Todas") {
      const statusToFilter = filter === "Vencidas" ? "Vencida" : filter;
      result = result.filter((order) => order.status === statusToFilter);
    }
    if (selectedStage) {
      result = result.filter((order) => order.stage === selectedStage);
    }
    return result;
  }, [orders, filter, selectedStage]);

  const stats = useMemo(() => {
    return STAGES.map((stage) => {
      if (stage === "General") {
        return {
          stage,
          count: orders.length,
          total: orders.length,
        };
      }
      return {
        stage,
        count: orders.filter((o) => o.stage === stage).length,
        total: orders.length,
      };
    });
  }, [orders]);

  const filterCounts = useMemo(
    () => ({
      Todas: orders.length,
      Vencidas: orders.filter((o) => o.status === "Vencida").length,
      Retrasado: orders.filter((o) => o.status === "Retrasado").length,
    }),
    [orders],
  );

  if (view === "monitor") {
    return <MonitorView orders={orders} getStatusColor={getStatusColor} />;
  }

  const getStageIcon = (stage: Stage) => {
    switch (stage) {
      case "General":
        return Activity;
      case "Logística":
        return Truck;
      case "Calibrado":
        return Wrench;
      case "Cristales":
        return Eye;
      case "Antireflejo":
        return Zap;
      case "Superficie":
        return Layers;
      case "Opticenter":
      case "Lutz Ferrand":
      case "Casa Central":
      case "Yerba Buena":
      case "Solmar 2":
      case "Concepción":
        return MapPin;
      case "Moto 1":
      case "Moto 2":
        return Truck;
      case "Armazones":
        return ClipboardList;
      default:
        return ClipboardList;
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
            {stats.map(
              (
                stat: { stage: string; count: number; total: number },
                idx: number,
              ) => (
                <SmartTooltip
                  key={stat.stage}
                  text={`Pedidos esperando en ${stat.stage}`}
                  position="bottom"
                >
                  <StageProgressCard
                    stage={stat.stage}
                    count={stat.count}
                    total={stat.total}
                    isSelected={
                      selectedStage === stat.stage ||
                      (stat.stage === "General" && !selectedStage)
                    }
                    onClick={() => {
                      if (stat.stage === "General") {
                        setSelectedStage(null);
                      } else {
                        setSelectedStage(
                          selectedStage === stat.stage
                            ? null
                            : (stat.stage as Stage),
                        );
                      }
                    }}
                    icon={getStageIcon(stat.stage as Stage)}
                    colorClass={
                      stat.stage === "General"
                        ? "bg-brand-blue"
                        : idx % 6 === 0
                          ? "bg-blue-500"
                          : idx % 6 === 1
                            ? "bg-indigo-500"
                            : idx % 6 === 2
                              ? "bg-purple-500"
                              : idx % 6 === 3
                                ? "bg-pink-500"
                                : idx % 6 === 4
                                  ? "bg-brand-green"
                                  : "bg-brand-orange"
                    }
                  />
                </SmartTooltip>
              ),
            )}
          </div>

          {/* Panel Lateral de Logística */}
          <div className="lg:col-span-4 h-full">
            <LogisticsOutSection onOpenHistory={() => setShowHistory(true)} />
          </div>
        </div>

        {/* Bottom Section: Main Access to Monitor */}
        <section className="mt-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenMonitor}
            className="w-full bg-brand-blue p-8 md:p-12 rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group relative overflow-hidden text-white border border-white/10"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="relative z-10 flex items-center gap-8 min-w-0">
              <div className="h-20 w-20 shrink-0 rounded-[2rem] bg-white/10 flex items-center justify-center text-white border border-white/20 group-hover:bg-brand-green group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-brand-green/40">
                <ExternalLink size={36} />
              </div>
              <div className="text-left min-w-0">
                <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-tight">
                  Monitor de Órdenes Detallado
                </h2>
                <p className="text-white/60 text-lg font-medium mt-2 max-w-xl">
                  Abre el panel de control extendido en una nueva pestaña para
                  visualizar en un monitor secundario con máxima claridad.
                </p>
              </div>
            </div>
            <div className="relative z-10 shrink-0">
              <div className="px-10 py-5 bg-white text-brand-blue rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_20px_40px_-5px_rgba(255,255,255,0.3)] group-hover:bg-brand-green group-hover:text-white transition-all flex items-center gap-4">
                Abrir Monitor Central <ArrowRight size={24} />
              </div>
            </div>
          </motion.button>
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
                    <History className="text-brand-green shrink-0" />{" "}
                    <span className="truncate">HISTORIAL DE SALIDAS</span>
                  </h2>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1 truncate">
                    Registros de las últimas 24 horas
                  </p>
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
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">
                              Orden de Salida
                            </p>
                            <p className="text-lg md:text-xl font-black text-brand-blue tracking-tight truncate">
                              {job.id.replace("#", "")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 whitespace-nowrap">
                            Sucursal Destino
                          </p>
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

      <FullSummaryModal
        isOpen={showFullSummary}
        onClose={() => setShowFullSummary(false)}
        orders={orders}
        filter={filter}
        setFilter={setFilter}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        filterCounts={filterCounts}
        getStatusColor={getStatusColor}
      />

      <footer className="mt-auto py-10 text-center text-slate-400 text-xs font-medium">
        <p>© 2026 Sistema de Gestión de Laboratorio Óptico v1.0.0-Beta</p>
      </footer>
    </div>
  );
}
