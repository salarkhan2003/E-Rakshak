
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Bell, Search, Menu, LogOut, ChevronRight, 
  Home, FilePlus, List, BarChart2, Shield, Settings,
  AlertCircle, LayoutDashboard, Filter, ArrowUpDown,
  CheckCircle, Clock, FileSearch, User as UserIcon, Wifi, WifiOff, CloudSync,
  BrainCircuit, MapPin, MessageCircle, X, Send, Sparkles, Loader2
} from 'lucide-react';
import { UserRole, FIR, FIRStatus, User } from './types';
import { Dashboard } from './components/Dashboard';
import { FIRForm } from './components/FIRForm';
import { FIRDetail } from './components/FIRDetail';
import { AdminPanel } from './components/AdminPanel';
import { CrimeAnalytics } from './components/CrimeAnalytics';
import { STATUS_MAP } from './constants';
import { getChatbotResponse } from './services/geminiService';

type ViewType = 'DASHBOARD' | 'FILE_FIR' | 'LIST' | 'DETAIL' | 'ANALYTICS' | 'ADMIN_CONTROLS' | 'CRIME_ANALYTICS';

const MOCK_USERS: Record<string, User> = {
  [UserRole.CITIZEN]: {
    id: 'CIT-99',
    name: 'Rahul Kumar',
    role: UserRole.CITIZEN,
    aadhaarLinked: true
  },
  [UserRole.CONSTABLE]: {
    id: 'C-01',
    name: 'Const. Ramesh Singh',
    role: UserRole.CONSTABLE,
    stationId: "West End Station - District B",
    badgeNumber: 'UP-82-C-01',
    aadhaarLinked: true
  },
  [UserRole.SUB_INSPECTOR]: {
    id: 'SI-92',
    name: 'SI Ajay Kumar',
    role: UserRole.SUB_INSPECTOR,
    stationId: "West End Station - District B",
    badgeNumber: 'UP-82-SI-11',
    aadhaarLinked: true
  },
  [UserRole.STATION_HOUSE_OFFICER]: {
    id: 'OFF-1284',
    name: 'Inspector Vikram Rathore',
    role: UserRole.STATION_HOUSE_OFFICER,
    stationId: "Central Police Station - District A",
    badgeNumber: 'UP-82-9912',
    aadhaarLinked: true
  },
  [UserRole.ADMIN]: {
    id: 'ADMN-01',
    name: 'Nikhil (System Admin)',
    role: UserRole.ADMIN,
    aadhaarLinked: false
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User>(MOCK_USERS[UserRole.STATION_HOUSE_OFFICER]);
  const [view, setView] = useState<ViewType>('DASHBOARD');
  const [firs, setFirs] = useState<FIR[]>([]);
  const [selectedFir, setSelectedFir] = useState<FIR | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Namaste! I am Rakshak AI. How can I assist you with the State Police Digital Portal today?' }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [filterStatus, setFilterStatus] = useState<FIRStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'ID'>('DATE_DESC');

  // Load from Storage (Offline Support)
  useEffect(() => {
    const savedFirs = localStorage.getItem('eRakshak_firs');
    if (savedFirs) {
      try {
        setFirs(JSON.parse(savedFirs));
      } catch (e) {
        console.error("Failed to parse FIRs from local storage", e);
      }
    } else {
      const timestamp = new Date().toISOString();
      setFirs([
        {
          id: 'FIR-2024-001',
          firNumber: 'UP-62-2024-0881',
          citizenId: 'CIT-99',
          citizenName: 'Rahul Kumar',
          incidentType: 'BURGLARY',
          incidentLocation: 'Sector 62, Noida, UP',
          incidentDateTime: '2024-11-20T14:30:00Z',
          description: 'Verified break-in at residential property. Gold ornaments and cash reported missing. Digital fingerprints collected from scene.',
          status: FIRStatus.SIGNED, // Set to SIGNED so download is available immediately
          evidence: [
            { id: 'EV-101', type: 'IMAGE', url: 'evidence.png', timestamp: new Date().toISOString() }
          ],
          auditLogs: [
            { id: '2', action: 'Digitally Signed by SHO', userId: 'OFF-1284', userName: 'Insp. Vikram Rathore', role: UserRole.STATION_HOUSE_OFFICER, timestamp, ipAddress: '10.0.1.25', deviceInfo: 'Station Terminal' },
            { id: '1', action: 'FIR Submitted Digitally', userId: 'CIT-99', userName: 'Rahul Kumar', role: UserRole.CITIZEN, timestamp: new Date(Date.now() - 86400000).toISOString(), ipAddress: '102.12.33.1', deviceInfo: 'Citizen Portal' }
          ],
          currentAssigneeRole: UserRole.STATION_HOUSE_OFFICER,
          deadline: new Date(Date.now() + 6 * 3600000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: timestamp,
          isSynced: true,
          signatures: [
             {
               role: UserRole.STATION_HOUSE_OFFICER,
               userId: 'OFF-1284',
               timestamp,
               method: 'AADHAAR_OTP',
               hash: 'SHA256:E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855'
             }
          ]
        },
        {
          id: 'FIR-2024-002',
          firNumber: 'PENDING',
          citizenId: 'CIT-12',
          citizenName: 'Priya Singh',
          incidentType: 'THEFT',
          incidentLocation: 'Metro Station, Sector 18',
          incidentDateTime: new Date().toISOString(),
          description: 'Mobile phone snatched while boarding the train.',
          status: FIRStatus.SUBMITTED,
          evidence: [],
          auditLogs: [{ id: '1', action: 'FIR Submitted Digitally', userId: 'CIT-12', userName: 'Priya Singh', role: UserRole.CITIZEN, timestamp: new Date().toISOString(), ipAddress: '102.12.33.1', deviceInfo: 'Mobile App' }],
          currentAssigneeRole: UserRole.CONSTABLE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSynced: true,
          signatures: []
        }
      ]);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && firs.some(f => !f.isSynced)) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        setFirs(prev => prev.map(f => ({ ...f, isSynced: true })));
        setIsSyncing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    localStorage.setItem('eRakshak_firs', JSON.stringify(firs));
  }, [firs, isOnline]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const switchRole = (role: UserRole) => {
    const newUser = MOCK_USERS[role];
    setUser(newUser);
    if (role === UserRole.CITIZEN) setView('LIST');
    else if (role === UserRole.ADMIN) setView('ADMIN_CONTROLS');
    else setView('DASHBOARD');
  };

  const handleUpdateStatus = (id: string, newStatus: FIRStatus, remarks: string, delegateTo?: UserRole, additionalData?: any) => {
    const timestamp = new Date().toISOString();
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      action: `Workflow: ${newStatus}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      timestamp,
      ipAddress: '10.0.1.25',
      deviceInfo: 'Department Terminal',
      remarks
    };

    setFirs(prev => prev.map(f => f.id === id ? {
      ...f,
      ...additionalData,
      status: newStatus,
      updatedAt: timestamp,
      currentAssigneeRole: delegateTo || f.currentAssigneeRole,
      isSynced: false,
      auditLogs: [newLog, ...f.auditLogs]
    } : f));

    if (selectedFir?.id === id) {
      setSelectedFir(prev => prev ? { 
        ...prev, 
        ...additionalData, 
        status: newStatus, 
        auditLogs: [newLog, ...prev.auditLogs],
        currentAssigneeRole: delegateTo || prev.currentAssigneeRole
      } : null);
    }
  };

  const handleSign = (id: string, method: 'AADHAAR_OTP' | 'DSC') => {
    const timestamp = new Date().toISOString();
    setFirs(prev => prev.map(f => f.id === id ? {
      ...f,
      status: FIRStatus.SIGNED,
      updatedAt: timestamp,
      isSynced: false,
      signatures: [...f.signatures, {
        role: user.role,
        userId: user.id,
        timestamp,
        method,
        hash: 'SHA256:' + Math.random().toString(36).substring(7)
      }]
    } : f));
    setView('LIST');
  };

  const handleNewFir = (data: any) => {
    const newFir: FIR = {
      id: `FIR-2024-${String(firs.length + 1).padStart(3, '0')}`,
      citizenId: user.id,
      citizenName: user.name,
      incidentType: data.incidentType,
      incidentLocation: data.location,
      incidentDateTime: data.timestamp,
      description: data.description,
      status: FIRStatus.SUBMITTED,
      currentAssigneeRole: UserRole.CONSTABLE,
      deadline: new Date(Date.now() + 6 * 3600000).toISOString(), 
      evidence: data.evidence.map((name: string, i: number) => ({ id: `EV-${Date.now()}-${i}`, type: 'IMAGE', url: name, timestamp: new Date().toISOString() })),
      auditLogs: [{ id: '1', action: 'FIR Submitted Digitally', userId: user.id, userName: user.name, role: UserRole.CITIZEN, timestamp: new Date().toISOString(), ipAddress: '102.12.33.1', deviceInfo: 'Citizen Portal' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSynced: false,
      signatures: []
    };
    setFirs([newFir, ...firs]);
    setView('LIST');
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setIsChatTyping(true);

    const botMsg = await getChatbotResponse(userMsg, []);
    setChatHistory(prev => [...prev, { role: 'bot', text: botMsg }]);
    setIsChatTyping(false);
  };

  const filteredAndSortedFirs = useMemo(() => {
    let result = firs.filter(f => {
      if (user.role === UserRole.CITIZEN) return f.citizenId === user.id;
      return true;
    });

    if (filterStatus !== 'ALL') result = result.filter(f => f.status === filterStatus);

    result.sort((a, b) => {
      if (sortBy === 'DATE_DESC') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'DATE_ASC') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.id.localeCompare(b.id);
    });

    return result;
  }, [firs, user.role, user.id, filterStatus, sortBy]);

  const navItems = useMemo(() => {
    const all = [
      { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: [UserRole.SUB_INSPECTOR, UserRole.STATION_HOUSE_OFFICER, UserRole.SUPERVISORY_OFFICER, UserRole.ADMIN] },
      { id: 'LIST', label: user.role === UserRole.CITIZEN ? 'My Filings' : 'FIR Repository', icon: <List className="w-5 h-5" />, roles: [UserRole.CITIZEN, UserRole.CONSTABLE, UserRole.SUB_INSPECTOR, UserRole.STATION_HOUSE_OFFICER, UserRole.SUPERVISORY_OFFICER, UserRole.ADMIN] },
      { id: 'CRIME_ANALYTICS', label: 'Crime Intelligence', icon: <BrainCircuit className="w-5 h-5" />, roles: [UserRole.STATION_HOUSE_OFFICER, UserRole.SUPERVISORY_OFFICER, UserRole.ADMIN] },
      { id: 'FILE_FIR', label: 'File Digital FIR', icon: <FilePlus className="w-5 h-5" />, roles: [UserRole.CITIZEN] },
      { id: 'ADMIN_CONTROLS', label: 'System Admin', icon: <Settings className="w-5 h-5" />, roles: [UserRole.ADMIN] },
    ];
    return all.filter(item => item.roles.includes(user.role));
  }, [user.role]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800 shrink-0 z-40`}>
        <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-800/50">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-900/40">
            <Shield className="w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden animate-in fade-in slide-in-from-left-2">
              <h1 className="font-black text-white text-xl tracking-tighter uppercase italic">e-Rakshak</h1>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Govt of India</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group relative ${view === item.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/40' : 'hover:bg-slate-800/50 hover:text-white'}`}
            >
              <span className={`shrink-0 transition-colors ${view === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                {item.icon}
              </span>
              {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className={`p-4 bg-slate-800/40 rounded-3xl border border-white/5 ${!isSidebarOpen && 'p-2'}`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-black text-white shrink-0 border border-white/10 ring-2 ring-slate-900 shadow-xl">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-white truncate tracking-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-8">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'System Online' : 'Offline Mode'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
               {[UserRole.CITIZEN, UserRole.CONSTABLE, UserRole.STATION_HOUSE_OFFICER, UserRole.ADMIN].map(r => (
                 <button 
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${user.role === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {r === UserRole.STATION_HOUSE_OFFICER ? 'SHO' : r}
                 </button>
               ))}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-10">
          <div className="max-w-7xl mx-auto">
            {view === 'DASHBOARD' && <Dashboard />}
            {view === 'FILE_FIR' && <FIRForm onSubmit={handleNewFir} />}
            {view === 'ADMIN_CONTROLS' && <AdminPanel />}
            {view === 'CRIME_ANALYTICS' && <CrimeAnalytics firs={firs} />}
            {view === 'LIST' && (
              <div className="space-y-8">
                 <div className="flex items-end justify-between">
                    <div>
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Case Management</h2>
                    </div>
                    <div className="flex items-center gap-3">
                       <select 
                         value={filterStatus}
                         onChange={(e) => setFilterStatus(e.target.value as any)}
                         className="text-[10px] font-black uppercase tracking-widest outline-none bg-white border border-slate-200 rounded-xl px-4 py-2"
                       >
                         <option value="ALL">All Status</option>
                         {Object.values(FIRStatus).map(s => <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    {filteredAndSortedFirs.map(fir => {
                      const statusData = STATUS_MAP[fir.status] || { label: fir.status, color: 'bg-slate-100 text-slate-700' };
                      return (
                      <div 
                        key={fir.id} 
                        onClick={() => { setSelectedFir(fir); setView('DETAIL'); }}
                        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-2xl transition-all cursor-pointer flex justify-between items-center group"
                      >
                        <div className="flex items-start gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${fir.status === FIRStatus.SIGNED || fir.status === FIRStatus.REGISTERED ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                              <FileSearch className="w-7 h-7" />
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <h3 className="font-black text-slate-800 text-lg uppercase group-hover:text-blue-600 transition-colors">{fir.incidentType}</h3>
                                 <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-mono text-slate-500">{fir.id}</div>
                              </div>
                              <p className="text-sm text-slate-500 line-clamp-1 italic mb-2 font-medium">"{fir.description}"</p>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex gap-4">
                                 <span className="flex items-center gap-1.5"><UserIcon className="w-3 h-3" /> {fir.citizenName}</span>
                                 <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {fir.incidentLocation}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusData.color}`}>
                              {statusData.label}
                           </span>
                           {fir.priority && (
                              <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">{fir.priority} PRIORITY</span>
                           )}
                        </div>
                      </div>
                      );
                    })}
                 </div>
              </div>
            )}
            {view === 'DETAIL' && selectedFir && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button onClick={() => setView('LIST')} className="mb-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all group">
                    <ChevronRight className="w-4 h-4 rotate-180" /> RETURN TO REPOSITORY
                  </button>
                  <FIRDetail 
                    fir={selectedFir} 
                    userRole={user.role}
                    onUpdateStatus={handleUpdateStatus} 
                    onSign={handleSign} 
                  />
               </div>
            )}
          </div>
        </div>
      </main>

      {/* RAKSHAK AI Chatbot Overlay */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
         {isChatOpen && (
           <div className="bg-white w-96 h-[500px] rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
              <div className="bg-slate-900 p-6 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg"><BrainCircuit className="w-6 h-6" /></div>
                    <div>
                       <h3 className="text-white font-black text-sm uppercase tracking-tight">Rakshak AI</h3>
                       <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active & Secure</p>
                    </div>
                 </div>
                 <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                 {chatHistory.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-none'}`}>
                          {m.text}
                       </div>
                    </div>
                 ))}
                 {isChatTyping && (
                    <div className="flex justify-start">
                       <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none">
                          <div className="flex gap-1">
                             <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                             <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                             <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                       </div>
                    </div>
                 )}
                 <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-slate-100 bg-white">
                 <div className="relative">
                    <input 
                       type="text" 
                       value={chatMessage}
                       onChange={(e) => setChatMessage(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                       placeholder="Ask about FIR status, legal help..." 
                       className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-medium focus:border-blue-500 outline-none transition-all"
                    />
                    <button onClick={handleSendChatMessage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all"><Send className="w-4 h-4" /></button>
                 </div>
              </div>
           </div>
         )}
         <button 
           onClick={() => setIsChatOpen(!isChatOpen)}
           className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all group border-4 border-white"
         >
            {isChatOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />}
         </button>
      </div>
    </div>
  );
};

export default App;
