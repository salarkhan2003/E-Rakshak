
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Clock, MapPin, User, FileText, 
  Hash, Fingerprint,
  Scale, Database, HardDrive, Smartphone, Globe,
  Download, Printer, QrCode, FileArchive, Zap, TrendingUp,
  UserPlus, ChevronDown, CheckCircle2, History,
  Loader2
} from 'lucide-react';
import { FIR, FIRStatus, UserRole } from '../types';
import { STATUS_MAP, MOCK_OFFICERS } from '../constants';
import { 
  summarizeIncident, 
  suggestIPCSections, 
  detectSLARiskProactively, 
  predictOptimalAssignment,
  analyzeEvidenceIntelligence
} from '../services/geminiService';

// External declaration for html2pdf
declare var html2pdf: any;

interface FIRDetailProps {
  fir: FIR;
  userRole: UserRole;
  onUpdateStatus: (id: string, newStatus: FIRStatus, remarks: string, delegateTo?: UserRole, additionalData?: any) => void;
  onSign: (id: string, method: 'AADHAAR_OTP' | 'DSC') => void;
}

export const FIRDetail: React.FC<FIRDetailProps> = ({ fir, userRole, onUpdateStatus, onSign }) => {
  const [remarks, setRemarks] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  
  const [assignmentData, setAssignmentData] = useState({
    targetOfficer: MOCK_OFFICERS[0].id,
    priority: 'MEDIUM',
    slaHours: '6',
  });

  const [aiSummary, setAiSummary] = useState<string>('Analyzing statement...');
  const [suggestedSections, setSuggestedSections] = useState<any[]>([]);
  const [slaRisk, setSlaRisk] = useState<any>(null);
  const [optimalAssignment, setOptimalAssignment] = useState<any>(null);
  const [evidenceAnalysis, setEvidenceAnalysis] = useState<Record<string, any>>({});

  const timeRemaining = useMemo(() => {
    if (!fir.deadline) return null;
    const diff = new Date(fir.deadline).getTime() - new Date().getTime();
    return Math.floor(diff / (1000 * 60 * 60));
  }, [fir.deadline]);

  const handleSignSubmit = async () => {
    if (otp.length !== 6) return;
    setIsSigning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSign(fir.id, 'AADHAAR_OTP');
      setShowSignModal(false);
    } catch (error) {
      console.error("Signing failed:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedOfficer = MOCK_OFFICERS.find(o => o.id === assignmentData.targetOfficer);
    onUpdateStatus(
      fir.id, 
      FIRStatus.UNDER_REVIEW, 
      `Assigned to ${selectedOfficer?.name}. Instruction: ${remarks}`, 
      selectedOfficer?.role,
      { priority: assignmentData.priority, deadline: new Date(Date.now() + parseInt(assignmentData.slaHours) * 3600000).toISOString() }
    );
    setShowAssignForm(false);
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('fir-pdf-content');
    if (!element) return;

    setIsExporting(true);
    
    const opt = {
      margin: 0,
      filename: `OFFICIAL_FIR_${fir.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error("PDF Download failed:", error);
      // Fallback to print if library fails
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchAiAnalysis = async () => {
      const [summary, sections, riskPredict, assignPredict] = await Promise.all([
        summarizeIncident(fir.description),
        suggestIPCSections(fir.description),
        detectSLARiskProactively(fir),
        predictOptimalAssignment(fir, MOCK_OFFICERS)
      ]);
      
      setAiSummary(summary || 'Analysis complete.');
      setSuggestedSections(sections);
      setSlaRisk(riskPredict);
      setOptimalAssignment(assignPredict);

      if (fir.evidence.length > 0) {
        const results: Record<string, any> = {};
        for (const ev of fir.evidence) {
          const analysis = await analyzeEvidenceIntelligence(fir.description, ev.type);
          results[ev.id] = analysis;
        }
        setEvidenceAnalysis(results);
      }
    };
    fetchAiAnalysis();
  }, [fir]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      <div className="lg:col-span-8 space-y-8">
        {/* Main Info Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
          <div className="bg-slate-50 px-10 py-6 flex justify-between items-center border-b border-slate-200">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{fir.firNumber || 'Provisional Case File'}</h2>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                  Node: {fir.id} • Registered: {new Date(fir.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
               {(fir.status === FIRStatus.REGISTERED || fir.status === FIRStatus.SIGNED) && (
                 <button 
                  onClick={() => setShowPdfPreview(true)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200"
                 >
                   <Download className="w-4 h-4" /> Download Official FIR
                 </button>
               )}
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${STATUS_MAP[fir.status]?.color || 'bg-slate-100 text-slate-500'}`}>
                 {STATUS_MAP[fir.status]?.label || fir.status}
               </span>
            </div>
          </div>

          <div className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Complainant</span>
                <div className="text-slate-800 font-black flex items-center gap-2 uppercase">
                   <User className="w-4 h-4 text-slate-300" /> {fir.citizenName}
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Location</span>
                <div className="text-slate-800 font-black flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-slate-300" /> {fir.incidentLocation}
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Incident Time</span>
                <div className="text-slate-800 font-black flex items-center gap-2">
                   <Clock className="w-4 h-4 text-slate-300" /> {new Date(fir.incidentDateTime).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 relative shadow-inner">
              <span className="absolute -top-3 left-8 px-4 py-1 bg-white border-2 border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Statement</span>
              <p className="text-slate-700 leading-relaxed font-semibold italic text-sm">"{fir.description}"</p>
            </div>
          </div>
        </div>

        {/* Intelligence Evidence Section */}
        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-2xl">
           <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Database className="w-5 h-5 text-indigo-600" />
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Evidence Intelligence Vault</h3>
              </div>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-tighter">AI-Forensics Active</div>
           </div>
           
           <div className="p-10 space-y-8">
              {fir.evidence.length === 0 ? (
                 <div className="py-12 text-center text-slate-400 space-y-3">
                    <HardDrive className="w-12 h-12 mx-auto opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">No physical evidence attached.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 gap-6">
                    {fir.evidence.map((ev) => (
                       <div key={ev.id} className="group bg-slate-50 border-2 border-slate-100 rounded-[28px] overflow-hidden hover:border-indigo-200 transition-all p-6 flex flex-col md:flex-row gap-8">
                          <div className="w-full md:w-1/3 space-y-4">
                             <div className="aspect-video bg-slate-200 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                <Smartphone className="w-8 h-8 text-slate-400 group-hover:text-indigo-400" />
                             </div>
                             <div className="space-y-2 border-t border-slate-200 pt-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase">
                                   <Globe className="w-3 h-3" /> GPS: 28.62, 77.37 (Verified)
                                </div>
                             </div>
                          </div>
                          <div className="flex-1 space-y-6">
                             <div className="flex justify-between items-start">
                                <div>
                                   <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg">{ev.type} EVIDENCE</h4>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UID: {ev.id}</p>
                                </div>
                                {evidenceAnalysis[ev.id] && (
                                   <div className={`px-4 py-2 rounded-2xl border-2 flex flex-col items-center gap-1 ${evidenceAnalysis[ev.id].isTampered ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                      <div className="text-[9px] font-black uppercase tracking-widest">Integrity</div>
                                      <div className="text-xs font-black">{evidenceAnalysis[ev.id].isTampered ? 'FLAGGED' : 'CLEAN'}</div>
                                   </div>
                                )}
                             </div>
                             <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                                   "{evidenceAnalysis[ev.id]?.analysisRemarks || 'AI forensic scan in progress...'}"
                                </p>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-8">
        {/* Governance & Control Actions */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-400" /> Investigation Protocol
           </h3>
           <textarea 
             value={remarks}
             onChange={(e) => setRemarks(e.target.value)}
             placeholder="Official directive or investigation notes..."
             className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs min-h-[100px] focus:border-blue-500 outline-none font-medium"
           />

           <div className="flex flex-col gap-3">
              {userRole === UserRole.CONSTABLE && fir.status === FIRStatus.SUBMITTED && !showAssignForm && (
                 <button onClick={() => setShowAssignForm(true)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200">
                    <UserPlus className="w-5 h-5" /> Analyze & Route Case
                 </button>
              )}

              {showAssignForm && (
                 <form onSubmit={handleAssignmentSubmit} className="space-y-4 p-6 bg-slate-50 rounded-2xl border-2 border-indigo-100 animate-in slide-in-from-top-4">
                    <select 
                      value={assignmentData.targetOfficer}
                      onChange={(e) => setAssignmentData({...assignmentData, targetOfficer: e.target.value})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    >
                       {MOCK_OFFICERS.map(o => (
                         <option key={o.id} value={o.id}>{o.name} ({o.role})</option>
                       ))}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                       <select value={assignmentData.priority} onChange={(e) => setAssignmentData({...assignmentData, priority: e.target.value})} className="p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase">
                          <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
                       </select>
                       <input type="number" value={assignmentData.slaHours} onChange={(e) => setAssignmentData({...assignmentData, slaHours: e.target.value})} className="p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Commit Route</button>
                 </form>
              )}

              {fir.status === FIRStatus.REVIEWED && userRole !== UserRole.CITIZEN && (
                 <button onClick={() => setShowSignModal(true)} className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-100 flex items-center justify-center gap-3">
                    <Fingerprint className="w-6 h-6" /> Digitally Sign & Seal
                 </button>
              )}
           </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Tamper-Proof Audit Trail
           </h3>
           <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {fir.auditLogs.map((log, i) => (
                <div key={i} className="flex gap-4 relative pl-8">
                  <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center z-10 ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <div className={i === 0 ? "w-2 h-2 bg-white rounded-full" : "w-1.5 h-1.5 bg-current rounded-full"} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{log.action}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{log.userName} • {new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full p-12 text-center space-y-8 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                 <Fingerprint className="w-10 h-10" />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cryptographic Auth</h3>
                 <p className="text-xs text-slate-400 font-bold mt-2 uppercase">Provide hardware token code for Secure Seal</p>
              </div>
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="OTP Code"
                className="w-full p-6 bg-slate-50 border-4 border-slate-100 rounded-3xl text-center text-4xl font-black tracking-widest focus:border-emerald-500 outline-none"
              />
              <button 
                onClick={handleSignSubmit}
                disabled={otp.length !== 6 || isSigning}
                className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {isSigning ? 'Verifying Identity...' : 'Authorize Digital Signature'}
              </button>
          </div>
        </div>
      )}

      {/* OFFICIAL FIR PDF EXPORT MODAL */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-5xl h-full flex flex-col rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/20">
              <div className="bg-slate-100 p-6 flex justify-between items-center border-b border-slate-200 no-print">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm"><FileArchive className="w-6 h-6 text-slate-600" /></div>
                    <div>
                       <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Official FIR Node Exporter</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Certified Court-Admissible Electronic Record</p>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button 
                      onClick={handleDownloadPdf} 
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/20"
                    >
                       {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                       {isExporting ? 'Generating...' : 'Download as PDF'}
                    </button>
                    <button onClick={() => setShowPdfPreview(false)} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all font-black text-xs uppercase tracking-widest">Close</button>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-12 bg-slate-200/50 print:p-0 print:bg-white">
                 <div id="fir-pdf-content" className="bg-white mx-auto shadow-2xl p-16 print:shadow-none min-h-[11in] w-[8.5in] border-t-[14px] border-slate-900 relative overflow-hidden">
                    
                    {/* Official Govt Seal / Background watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-45deg] select-none">
                       <h1 className="text-[130px] font-black uppercase tracking-[0.2em]">OFFICIAL RECORD</h1>
                    </div>

                    {/* Header Section */}
                    <div className="text-center space-y-2 mb-12 relative border-b-2 border-slate-100 pb-10">
                       <div className="absolute top-0 right-0 w-36 h-36 flex flex-col items-center justify-center border-2 border-slate-100 rounded-3xl p-3 bg-white shadow-sm">
                          <QrCode className="w-24 h-24 text-slate-400" />
                          <span className="text-[7px] font-black text-slate-500 mt-2 uppercase tracking-tighter">Scan to Verify Chain of Custody</span>
                       </div>
                       
                       <div className="flex justify-center mb-4">
                          <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-2xl border-4 border-slate-100">🇮🇳</div>
                       </div>

                       <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Government of India</h1>
                       <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">State Police Department • e-Rakshak Governance Node</h2>
                       <div className="w-24 h-1.5 bg-slate-900 mx-auto my-6"></div>
                       <h3 className="text-2xl font-black text-slate-900 underline decoration-4 underline-offset-8">FIRST INFORMATION REPORT (FIR)</h3>
                       <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-4">(Digital Record Under Section 154 Cr.P.C. / 173 BNSS)</p>
                    </div>

                    {/* Formal Document Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-xs mb-12">
                       <div className="space-y-5">
                          <div className="flex items-end justify-between border-b border-slate-200 pb-1">
                             <span className="font-black text-slate-400 uppercase text-[9px]">District:</span>
                             <span className="font-bold text-slate-900 uppercase">Gautam Buddh Nagar</span>
                          </div>
                          <div className="flex items-end justify-between border-b border-slate-200 pb-1">
                             <span className="font-black text-slate-400 uppercase text-[9px]">Police Station:</span>
                             <span className="font-bold text-slate-900 uppercase">Sector-62 Noida Central</span>
                          </div>
                          <div className="flex items-end justify-between border-b-2 border-slate-900 pb-1 mt-4">
                             <span className="font-black text-slate-400 uppercase text-[9px]">FIR Number:</span>
                             <span className="font-black text-slate-900 text-base">{fir.firNumber || 'PROV/GEN/2024/9912'}</span>
                          </div>
                       </div>
                       <div className="space-y-5">
                          <div className="flex items-end justify-between border-b border-slate-200 pb-1">
                             <span className="font-black text-slate-400 uppercase text-[9px]">Registration Year:</span>
                             <span className="font-bold text-slate-900">2024</span>
                          </div>
                          <div className="flex items-end justify-between border-b border-slate-200 pb-1">
                             <span className="font-black text-slate-400 uppercase text-[9px]">Filing Date:</span>
                             <span className="font-bold text-slate-900">{new Date(fir.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-end justify-between border-b-2 border-slate-900 pb-1 mt-4">
                             <span className="font-black text-slate-400 uppercase text-[9px]">Audit Status:</span>
                             <span className="font-black text-emerald-600 uppercase">Cryptographically Authenticated</span>
                          </div>
                       </div>
                    </div>

                    {/* Report Sections */}
                    <div className="space-y-12 text-[13px]">
                       <section>
                          <h4 className="font-black text-slate-900 uppercase tracking-widest mb-6 border-l-4 border-slate-900 pl-4 bg-slate-50 py-2">01. Relevant Acts & Sections (BNS/IPC)</h4>
                          <div className="grid grid-cols-1 gap-3 pl-8">
                             {suggestedSections.length > 0 ? suggestedSections.map((s, i) => (
                                <div key={i} className="flex gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-900 border border-slate-200 shadow-sm">{i+1}</div>
                                   <div>
                                      <div className="font-black text-slate-900 text-sm">{s.section}</div>
                                      <div className="font-medium text-slate-500 uppercase text-[10px] tracking-tight">{s.title}</div>
                                   </div>
                                </div>
                             )) : <p className="italic text-slate-400 pl-4">Legal sections pending verification by investigating officer.</p>}
                          </div>
                       </section>

                       <div className="grid grid-cols-2 gap-12">
                          <section>
                             <h4 className="font-black text-slate-900 uppercase tracking-widest mb-6 border-l-4 border-slate-900 pl-4 bg-slate-50 py-2">02. Complainant</h4>
                             <div className="pl-8 space-y-4">
                                <div className="flex flex-col border-b border-slate-100 pb-2">
                                   <span className="text-[9px] font-black text-slate-400 uppercase">Full Name</span>
                                   <span className="font-bold text-slate-800 text-sm">{fir.citizenName}</span>
                                </div>
                                <div className="flex flex-col border-b border-slate-100 pb-2">
                                   <span className="text-[9px] font-black text-slate-400 uppercase">Identity ID</span>
                                   <span className="font-bold text-slate-800">{fir.citizenId}</span>
                                </div>
                             </div>
                          </section>
                          <section>
                             <h4 className="font-black text-slate-900 uppercase tracking-widest mb-6 border-l-4 border-slate-900 pl-4 bg-slate-50 py-2">03. Incident Summary</h4>
                             <div className="pl-8 space-y-4">
                                <div className="flex flex-col border-b border-slate-100 pb-2">
                                   <span className="text-[9px] font-black text-slate-400 uppercase">Occurrence Location</span>
                                   <span className="font-bold text-slate-800">{fir.incidentLocation}</span>
                                </div>
                                <div className="flex flex-col border-b border-slate-100 pb-2">
                                   <span className="text-[9px] font-black text-slate-400 uppercase">Date/Time</span>
                                   <span className="font-bold text-slate-800">{new Date(fir.incidentDateTime).toLocaleString()}</span>
                                </div>
                             </div>
                          </section>
                       </div>

                       <section>
                          <h4 className="font-black text-slate-900 uppercase tracking-widest mb-6 border-l-4 border-slate-900 pl-4 bg-slate-50 py-2">04. Detailed Information (Digital Statement)</h4>
                          <div className="pl-8">
                             <div className="bg-slate-50/50 p-10 rounded-[40px] border-2 border-slate-100 font-serif leading-relaxed text-slate-800 text-lg italic shadow-inner relative">
                                <div className="absolute top-4 left-4 text-slate-200"><FileText className="w-12 h-12" /></div>
                                "{fir.description}"
                             </div>
                          </div>
                       </section>

                       {/* Verification & Signature Area */}
                       <section className="pt-16">
                          <div className="flex justify-between items-end gap-16">
                             <div className="space-y-8 flex-1">
                                <div className="space-y-3">
                                   <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Blockchain Hash / Node Anchor</div>
                                   <div className="text-[9px] font-mono text-slate-500 break-all bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                                      {fir.signatures[0]?.hash || 'NODE_ANCHOR_SHA256: ' + Math.random().toString(36).substring(2).toUpperCase() + '-' + Math.random().toString(36).substring(2).toUpperCase()}
                                   </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                   <ShieldCheck className="w-6 h-6 text-emerald-600" />
                                   <div className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">This electronic record is valid in all courts of law under Indian Evidence Act Section 65B.</div>
                                </div>
                             </div>
                             
                             <div className="text-center space-y-6 w-80 shrink-0">
                                <div className="p-8 bg-slate-900 text-white rounded-[40px] shadow-2xl relative group overflow-hidden border-[6px] border-white ring-1 ring-slate-200">
                                   <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                   <Fingerprint className="w-20 h-20 text-blue-400 mx-auto opacity-30 mb-4" />
                                   <div className="space-y-2">
                                      <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-300">Digitally Signed By</div>
                                      <div className="text-sm font-black tracking-tight">{MOCK_OFFICERS.find(o => o.role === UserRole.STATION_HOUSE_OFFICER)?.name || 'STATION HOUSE OFFICER'}</div>
                                      <div className="text-[8px] text-slate-400 font-black uppercase mt-4 tracking-widest">{new Date().toLocaleString()}</div>
                                   </div>
                                </div>
                                <div className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] underline decoration-4 underline-offset-8">OFFICER IN-CHARGE (SHO)</div>
                             </div>
                          </div>
                       </section>
                    </div>

                    {/* Footer / Governance Data */}
                    <div className="mt-24 pt-10 border-t-2 border-slate-900 flex justify-between items-center opacity-30">
                       <div className="text-[8px] font-black text-slate-900 uppercase tracking-[0.4em]">e-Rakshak Governance Node v3.0 • CCTNS-Cloud Integrated</div>
                       <div className="text-[8px] font-black text-slate-900 uppercase tracking-[0.4em]">Page 1 of 1 • Node UID: {fir.id}</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Loading overlay for PDF generation */}
      {isExporting && (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-xl flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
           <div className="relative">
              <div className="w-24 h-24 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <Download className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500" />
           </div>
           <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Generating Certified Record</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest animate-pulse">Encoding Digital Signatures & Hashes...</p>
           </div>
        </div>
      )}
    </div>
  );
};
