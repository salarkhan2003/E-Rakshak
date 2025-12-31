
import React, { useState } from 'react';
import { 
  Users, Building2, ShieldAlert, History, 
  Settings2, Activity, Map, UserPlus, X, 
  Check, ShieldCheck, BadgeCheck, AlertCircle, 
  ChevronDown, Search, Filter, Clock, Calendar, BookOpen
} from 'lucide-react';
import { MOCK_STATIONS, ROLE_CONFIG } from '../constants';
import { UserRole } from '../types';

interface OfficerEntry {
  id: string;
  name: string;
  badge: string;
  role: UserRole;
  station: string;
  status: 'Active' | 'On Leave' | 'Suspended';
  joiningDate: string;
  lastTrainingDate: string;
}

const INITIAL_OFFICERS: OfficerEntry[] = [
  { id: '1', name: 'Vikram Rathore', badge: 'UP-82-9912', role: UserRole.STATION_HOUSE_OFFICER, station: MOCK_STATIONS[0], status: 'Active', joiningDate: '2015-06-12', lastTrainingDate: '2024-01-20' },
  { id: '2', name: 'Ajay Kumar', badge: 'UP-82-SI-11', role: UserRole.SUB_INSPECTOR, station: MOCK_STATIONS[1], status: 'Active', joiningDate: '2018-11-05', lastTrainingDate: '2023-11-15' },
  { id: '3', name: 'Sanjay Dutt', badge: 'UP-82-C-44', role: UserRole.CONSTABLE, station: MOCK_STATIONS[0], status: 'Active', joiningDate: '2021-02-14', lastTrainingDate: '2024-03-05' },
];

export const AdminPanel: React.FC = () => {
  const [officers, setOfficers] = useState<OfficerEntry[]>(INITIAL_OFFICERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    badge: '',
    role: UserRole.CONSTABLE,
    station: MOCK_STATIONS[0],
    joiningDate: new Date().toISOString().split('T')[0],
    lastTrainingDate: new Date().toISOString().split('T')[0]
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: OfficerEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...newOfficer,
      status: 'Active'
    };
    setOfficers([entry, ...officers]);
    setNewOfficer({ 
      name: '', 
      badge: '', 
      role: UserRole.CONSTABLE, 
      station: MOCK_STATIONS[0],
      joiningDate: new Date().toISOString().split('T')[0],
      lastTrainingDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">System Administration</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">State-wide e-Rakshak Node Control</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> Provision New Officer
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
            <Check className="w-5 h-5" />
          </div>
          <p className="text-sm font-black text-emerald-800 uppercase tracking-tight">Officer provisioned successfully. Credentials dispatched to encrypted terminal.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Officer Management Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" /> Active Service Personnel
              </h3>
              <div className="flex gap-2">
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                   <input type="text" placeholder="Search badge..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-blue-500 transition-all w-40" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity & Badge</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank / Experience</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Station</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {officers.map((officer) => (
                    <tr key={officer.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            {officer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{officer.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{officer.badge}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${ROLE_CONFIG[officer.role].color.replace('bg-', 'bg-opacity-10 text-').replace('600', '700')} border border-current/20`}>
                            {ROLE_CONFIG[officer.role].label}
                          </span>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase mt-1">
                            <Calendar className="w-2.5 h-2.5" /> Joined: {officer.joiningDate}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase">
                            <BookOpen className="w-2.5 h-2.5" /> Trained: {officer.lastTrainingDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-[11px] font-bold text-slate-600">{officer.station}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${officer.status === 'Active' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-300'}`}></div>
                          <span className="text-[10px] font-black text-slate-500 uppercase">{officer.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Node Health Status</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {MOCK_STATIONS.map((station, i) => (
                  <div key={i} className="p-5 flex justify-between items-center hover:bg-slate-50/50 transition">
                    <div>
                      <div className="font-black text-slate-800 text-[11px] uppercase tracking-tight">{station}</div>
                      <div className="text-[9px] text-slate-400 font-mono">NODE_UID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-700 uppercase">{10 + i * 2} Terminals</div>
                        <div className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1 justify-end">
                          <Activity className="w-2.5 h-2.5" /> Synchronized
                        </div>
                      </div>
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Auth Security Logs</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { event: 'Bulk Export (JSON)', user: 'SP_KUMAR', time: '10m ago', risk: 'Low' },
                  { event: 'Failed TOTP Challenge', user: 'ADMN_02', time: '1h ago', risk: 'Medium' },
                  { event: 'DSC Rotation Success', user: 'SYSTEM', time: '4h ago', risk: 'Low' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <History className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{log.event}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">{log.user} • {log.time}</div>
                      </div>
                    </div>
                    <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest ${log.risk === 'Medium' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                      {log.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Global Control Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-8 space-y-8">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-slate-400" /> Global Protocol Config
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">SLA Breach Threshold (Hours)</label>
                <div className="relative">
                   <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                   <input type="number" defaultValue={2} className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-800 outline-none focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Ledger Retention (Days)</label>
                <input type="number" defaultValue={365} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-800 outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">UIDAI OTP Sync</span>
                  <div className="w-11 h-6 bg-emerald-500 rounded-full relative shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" /></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">Geo-Fencing Mode</span>
                  <div className="w-11 h-6 bg-slate-300 rounded-full relative shadow-inner"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                </div>
              </div>
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
              Apply Hardened Settings
            </button>
          </div>

          <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 relative overflow-hidden shadow-2xl shadow-slate-300">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 border border-blue-500/20 rounded-2xl text-blue-400">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">System Integrity</div>
                <div className="text-xl font-black tracking-tighter">100% HARDENED</div>
              </div>
            </div>
            <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic border-l-2 border-blue-500/30 pl-4">
              "Node encryption active. All regional station databases successfully mirrored to the central state cluster at 03:00 UTC."
            </p>
          </div>
        </div>
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-xl w-full overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="p-10 space-y-8 h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center sticky top-0 bg-white pb-4 z-10">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center shadow-inner">
                       <UserPlus className="w-7 h-7" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Provision Officer</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Authorized Identity Creation</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-slate-100 rounded-2xl transition-all group"
                 >
                    <X className="w-6 h-6 text-slate-300 group-hover:text-slate-900" />
                 </button>
              </div>

              <form onSubmit={handleAddOfficer} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Officer Name</label>
                    <input 
                      type="text" 
                      required
                      value={newOfficer.name}
                      onChange={(e) => setNewOfficer({...newOfficer, name: e.target.value})}
                      placeholder="e.g. Inspector Arya"
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Service Badge Number</label>
                    <input 
                      type="text" 
                      required
                      value={newOfficer.badge}
                      onChange={(e) => setNewOfficer({...newOfficer, badge: e.target.value})}
                      placeholder="e.g. UP-82-SI-11"
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Date of Joining</label>
                    <input 
                      type="date" 
                      required
                      value={newOfficer.joiningDate}
                      onChange={(e) => setNewOfficer({...newOfficer, joiningDate: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Last Training Date</label>
                    <input 
                      type="date" 
                      required
                      value={newOfficer.lastTrainingDate}
                      onChange={(e) => setNewOfficer({...newOfficer, lastTrainingDate: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Organizational Rank / Role</label>
                  <div className="relative group">
                    <select 
                      value={newOfficer.role}
                      onChange={(e) => setNewOfficer({...newOfficer, role: e.target.value as UserRole})}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      {Object.values(UserRole).filter(r => r !== UserRole.CITIZEN).map(role => (
                        <option key={role} value={role}>{ROLE_CONFIG[role].label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Node Assignment (Station)</label>
                  <div className="relative group">
                    <select 
                      value={newOfficer.station}
                      onChange={(e) => setNewOfficer({...newOfficer, station: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      {MOCK_STATIONS.map(station => (
                        <option key={station} value={station}>{station}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
                   <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Protocol Notice</p>
                      <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed">
                         Provisioning an officer grants access to restricted law enforcement nodes. All actions by this ID will be logged in the immutable system ledger.
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 sticky bottom-0 bg-white">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="py-4 bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]"
                  >
                    Confirm & Provision
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
