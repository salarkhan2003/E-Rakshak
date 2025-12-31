
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { BrainCircuit, TrendingUp, AlertTriangle, ShieldAlert, Target, Search, Map as MapIcon, Layers } from 'lucide-react';
import { detectCrimePatterns } from '../services/geminiService';
import { FIR } from '../types';

interface CrimeAnalyticsProps {
  firs: FIR[];
}

export const CrimeAnalytics: React.FC<CrimeAnalyticsProps> = ({ firs }) => {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      setLoading(true);
      const results = await detectCrimePatterns(firs);
      setPatterns(results);
      setLoading(false);
    };
    fetchPatterns();
  }, [firs]);

  const chartData = [
    { name: 'Jan', theft: 40, assault: 24, fraud: 10 },
    { name: 'Feb', theft: 30, assault: 13, fraud: 22 },
    { name: 'Mar', theft: 20, assault: 98, fraud: 15 },
    { name: 'Apr', theft: 27, assault: 39, fraud: 25 },
    { name: 'May', theft: 18, assault: 48, fraud: 30 },
    { name: 'Jun', theft: 23, assault: 38, fraud: 45 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Investigation Intelligence</h2>
           <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Cross-Case Pattern & MO Analysis Engine</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-200">
              <BrainCircuit className="w-4 h-4" /> AI Monitoring Active
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Analysis Results */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                    <Target className="w-5 h-5 text-indigo-600" /> Detected Crime Patterns
                 </h3>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{patterns.length} Active Linkages</span>
              </div>
              <div className="p-8 space-y-6">
                 {loading ? (
                    <div className="py-20 text-center space-y-4">
                       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Repository for MO Similarities...</p>
                    </div>
                 ) : patterns.length === 0 ? (
                    <div className="py-20 text-center opacity-40 grayscale space-y-4">
                       <Search className="w-12 h-12 mx-auto" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No significant crime patterns detected in current dataset.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {patterns.map((p, i) => (
                          <div key={i} className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 hover:border-indigo-200 transition-all group relative overflow-hidden">
                             <div className={`absolute top-0 right-0 w-1 h-full ${p.threatLevel === 'CRITICAL' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                             <div className="flex justify-between items-start mb-4">
                                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                                   {p.moType}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${p.threatLevel === 'CRITICAL' ? 'text-rose-600' : 'text-indigo-600'}`}>
                                   {p.threatLevel}
                                </span>
                             </div>
                             <p className="text-xs font-bold text-slate-700 leading-relaxed line-clamp-3 mb-4">
                                {p.description}
                             </p>
                             <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2">
                                   <Layers className="w-4 h-4 text-slate-400" />
                                   <span className="text-[10px] font-black text-slate-400 uppercase">{p.relatedCaseIds.length} Linked Cases</span>
                                </div>
                                <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Review Linkage</button>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-2xl">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 mb-10">
                 <TrendingUp className="w-5 h-5 text-blue-600" /> Regional Offense Distribution (6M)
              </h3>
              <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorTheft" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} />
                       <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                       <Area type="monotone" dataKey="theft" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTheft)" strokeWidth={3} />
                       <Area type="monotone" dataKey="assault" stroke="#ef4444" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" />
                       <Area type="monotone" dataKey="fraud" stroke="#6366f1" fillOpacity={0} strokeWidth={3} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Right Col: Hotspot Intelligence */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <MapIcon className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-3">
                 <MapIcon className="w-6 h-6 text-blue-400" />
                 <h3 className="text-sm font-black uppercase tracking-widest">Active Hotspot Alerts</h3>
              </div>
              <div className="space-y-4">
                 {[
                    { loc: 'Sector 62 Cluster', risk: 'High', trend: '+12%' },
                    { loc: 'Transport Nagar', risk: 'Medium', trend: '-2%' },
                    { loc: 'Metro Line East', risk: 'Critical', trend: '+45%' },
                 ].map((h, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                       <div>
                          <div className="text-[11px] font-black uppercase tracking-tight">{h.loc}</div>
                          <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${h.risk === 'Critical' ? 'text-rose-400' : 'text-blue-400'}`}>{h.risk} Vigilance</div>
                       </div>
                       <div className="text-right">
                          <div className={`text-[11px] font-black ${h.trend.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'}`}>{h.trend}</div>
                          <div className="text-[8px] text-slate-500 font-bold uppercase">6H Delta</div>
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40">
                 Dispatch Area Advisory
              </button>
           </div>

           <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-2xl space-y-8">
              <div className="flex items-center gap-3">
                 <ShieldAlert className="w-5 h-5 text-rose-600" />
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Investigation Risk Flags</h3>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                       <span>Repeat Offender Linkage</span>
                       <span className="text-rose-600">78%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="w-[78%] h-full bg-rose-500 rounded-full"></div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                       <span>Identity Fraud Probability</span>
                       <span className="text-amber-500">12%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="w-[12%] h-full bg-amber-500 rounded-full"></div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                       <span>Weapon Involvement MO</span>
                       <span className="text-indigo-600">34%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="w-[34%] h-full bg-indigo-500 rounded-full"></div>
                    </div>
                 </div>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                    "AI Analysis based on current repository of 1,284 verified registration nodes."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
