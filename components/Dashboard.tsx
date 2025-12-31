
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { 
  Clock, ShieldCheck, AlertCircle, FileText, BrainCircuit, 
  Users, Building2, TrendingUp, Calendar, Rocket, 
  ChevronRight, ArrowUpRight, ShieldAlert, Zap, Filter
} from 'lucide-react';
import { predictLoadForecasting } from '../services/geminiService';

const data = [
  { name: 'Mon', count: 12 },
  { name: 'Tue', count: 18 },
  { name: 'Wed', count: 15 },
  { name: 'Thu', count: 22 },
  { name: 'Fri', count: 30 },
  { name: 'Sat', count: 25 },
  { name: 'Sun', count: 10 },
];

const pieData = [
  { name: 'On Time', value: 85, color: '#10b981' },
  { name: 'Delayed', value: 10, color: '#f59e0b' },
  { name: 'Breached', value: 5, color: '#ef4444' },
];

export const Dashboard: React.FC = () => {
  const [forecast, setForecast] = useState<any>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['Holi Festival', 'State Election']);

  const handleLaunchForecasting = async () => {
    setLoadingForecast(true);
    try {
      const result = await predictLoadForecasting("PS-SECTOR62", selectedEvents);
      setForecast(result);
    } catch (error) {
      console.error("Forecasting launch failed:", error);
    } finally {
      setLoadingForecast(false);
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Operational Command</h2>
           <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Real-time Station Monitoring & Governance</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Node Cluster Active
           </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pending Signature', value: '14', icon: <Clock className="text-amber-500" />, sub: '+2 since morning', color: 'border-amber-200 bg-amber-50/30' },
          { label: 'Total Registered', value: '1,284', icon: <ShieldCheck className="text-emerald-500" />, sub: 'This month', color: 'border-emerald-200 bg-emerald-50/30' },
          { label: 'SLA Risk Index', value: 'Low', icon: <AlertCircle className="text-blue-500" />, sub: 'Optimal performance', color: 'border-blue-200 bg-blue-50/30' },
          { label: 'Station Force', value: '42', icon: <Users className="text-indigo-500" />, sub: '85% Duty Strength', color: 'border-indigo-200 bg-indigo-50/30' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-[28px] border-2 shadow-sm transition-all hover:shadow-xl ${stat.color}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{stat.label}</span>
              <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">{stat.icon}</div>
            </div>
            <div className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Load Forecasting AI Panel */}
        <div className="lg:col-span-4 bg-slate-900 rounded-[32px] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-[3000ms]">
              <BrainCircuit className="w-32 h-32" />
           </div>
           
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-blue-600/20 rounded-2xl"><TrendingUp className="w-5 h-5 text-blue-400" /></div>
                 <h3 className="text-sm font-black uppercase tracking-widest">AI Load Forecasting</h3>
              </div>
           </div>

           {!forecast && !loadingForecast ? (
              <div className="py-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="space-y-4">
                    <p className="text-[11px] font-medium text-slate-400 italic leading-relaxed">
                       "Analyze upcoming regional events to predict FIR spikes, hotspots, and optimal resource deployment."
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {selectedEvents.map(e => (
                          <span key={e} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase text-blue-300">{e}</span>
                       ))}
                    </div>
                 </div>
                 <button 
                  onClick={handleLaunchForecasting}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-3 group/btn"
                 >
                    <Rocket className="w-5 h-5 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform" />
                    Launch Prediction
                 </button>
              </div>
           ) : loadingForecast ? (
             <div className="py-20 flex flex-col items-center gap-6">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                   <Rocket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-400" />
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 animate-pulse">Running Neural Models</p>
                   <p className="text-[8px] text-slate-500 font-bold uppercase mt-2">Processing Event Grid PS-SECTOR62</p>
                </div>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-end">
                   <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Score</div>
                      <div className="text-4xl font-black text-rose-500">{forecast.riskScore}%</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Predicted Volume</div>
                      <div className="text-lg font-black">{forecast.predictedVolume}</div>
                   </div>
                </div>
                <div className="space-y-3 pt-6 border-t border-white/5">
                   <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Governance Recommendations</div>
                   <ul className="space-y-3">
                      {forecast.recommendations?.map((r: string, i: number) => (
                        <li key={i} className="flex gap-3 text-[11px] font-medium text-slate-300 leading-relaxed italic border-l-2 border-blue-500/30 pl-4">
                           {r}
                        </li>
                      ))}
                   </ul>
                </div>
                <button 
                  onClick={() => setForecast(null)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Recalculate Model
                </button>
             </div>
           )}
           <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase bg-white/5 p-3 rounded-xl border border-white/5">
              <Calendar className="w-3 h-3" /> Analysis Horizon: 14 Days
           </div>
        </div>

        {/* Charts & Analytics */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl flex flex-col">
              <div className="flex justify-between items-start mb-10">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Registration Flow (Current Week)
                 </h3>
                 <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-100"></div>
                 </div>
              </div>
              <div className="flex-1 min-h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                       <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl flex flex-col">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4" /> SLA Compliance Status
              </h3>
              <div className="flex-1 flex flex-col justify-center">
                 <div className="h-48 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={pieData}
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={8}
                             dataKey="value"
                          >
                             {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius: '16px'}} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {pieData.map((p, i) => (
                       <div key={i} className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] font-black text-slate-800 tracking-tighter mb-1">{p.value}%</div>
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.name}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Root-Cause Analytics & Monitoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Delay Root-Cause Analytics</h3>
               </div>
               <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                  Full Report <ArrowUpRight className="w-3 h-3" />
               </button>
            </div>
            <div className="p-8 space-y-6">
               {[
                  { factor: 'Staffing Constraints', score: 65, status: 'Critical', color: 'bg-rose-500' },
                  { factor: 'Evidence Processing', score: 24, status: 'Normal', color: 'bg-emerald-500' },
                  { factor: 'Inter-District Transfer', score: 42, status: 'High', color: 'bg-amber-500' },
                  { factor: 'Forensic Backlog', score: 31, status: 'Moderate', color: 'bg-blue-500' },
               ].map((f, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                        <span className="text-slate-600">{f.factor}</span>
                        <span className={f.status === 'Critical' ? 'text-rose-600' : 'text-slate-400'}>{f.status} ({f.score}%)</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${f.color}`} style={{width: `${f.score}%`}}></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
               <Building2 className="w-5 h-5 text-slate-400" />
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Station Governance Overview</h3>
            </div>
            <div className="p-8 overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-100">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Station</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Health</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {[
                        { name: 'PS Noida Sector 62', pending: 4, health: 98 },
                        { name: 'PS Botanical Garden', pending: 12, health: 72 },
                        { name: 'PS Greater Noida West', pending: 2, health: 100 },
                     ].map((s, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                           <td className="py-5 font-black text-slate-800 text-xs uppercase tracking-tight">{s.name}</td>
                           <td className="py-5 font-bold text-slate-600 text-xs">{s.pending} Nodes</td>
                           <td className="py-5">
                              <div className="flex items-center gap-3">
                                 <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${s.health > 90 ? 'bg-emerald-500' : s.health > 80 ? 'bg-blue-500' : 'bg-rose-500'}`} style={{width: `${s.health}%` }} />
                                 </div>
                                 <span className="text-[10px] font-black text-slate-800">{s.health}%</span>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};
