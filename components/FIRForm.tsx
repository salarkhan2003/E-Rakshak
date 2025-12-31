
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, Paperclip, Send, BrainCircuit, X, Sparkles, Mic, Square, Loader2, Info, CheckCircle2, AlertCircle, Wand2 } from 'lucide-react';
import { FIRStatus } from '../types';
import { helpDraftFIR, processVoiceIncident, validateFIRCompleteness } from '../services/geminiService';

interface FIRFormProps {
  onSubmit: (data: any) => void;
}

const TRIGGER_KEYWORDS = [
  'stolen', 'theft', 'robbery', 'assault', 'hit', 'accident', 'fraud', 'missing', 
  'threat', 'harassment', 'burglary', 'cheating', 'money', 'scam', 'snatched', 
  'weapon', 'gun', 'knife', 'injury', 'fight'
];

export const FIRForm: React.FC<FIRFormProps> = ({ onSubmit }) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [evidence, setEvidence] = useState<File[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [completeness, setCompleteness] = useState<{ score: number, missingDetails: string[] } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Contextual Trigger Detection
  const detectedTriggers = useMemo(() => {
    if (description.length < 5) return [];
    const lowerDesc = description.toLowerCase();
    return TRIGGER_KEYWORDS.filter(keyword => lowerDesc.includes(keyword));
  }, [description]);

  // Debounced validation
  useEffect(() => {
    if (description.length < 30) {
      setCompleteness(null);
      return;
    }
    const timer = setTimeout(async () => {
      const result = await validateFIRCompleteness(description);
      setCompleteness(result);
    }, 2000);
    return () => clearTimeout(timer);
  }, [description]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setIsDrafting(true);
        
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          const result = await processVoiceIncident(base64Audio);
          if (result) setDescription(result);
          setIsDrafting(false);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleAiDraft = async () => {
    if (!description || description.length < 10) {
      alert("Please provide at least a few words or keywords first.");
      return;
    }
    setIsDrafting(true);
    const professionalDraft = await helpDraftFIR(description);
    setDescription(professionalDraft || description);
    setIsDrafting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completeness && completeness.score < 50) {
      if (!confirm("AI analysis suggests this FIR is legally incomplete. Do you still wish to submit?")) return;
    }
    onSubmit({
      description,
      location,
      incidentType,
      evidence: evidence.map(f => f.name),
      status: FIRStatus.SUBMITTED,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 h-fit">
        <div className="bg-slate-900 text-white p-8 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight uppercase">Digital FIR Filing</h2>
            <p className="text-slate-400 text-xs font-bold mt-1 tracking-widest uppercase">Certified Legal Instrument Portal</p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
             <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black border border-blue-500/30 tracking-tighter uppercase">AI Assisted Mode</div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Offense Classification</label>
              <select 
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="">Select Category</option>
                <option value="THEFT">Theft / Burglary</option>
                <option value="ASSAULT">Physical Assault</option>
                <option value="FRAUD">Financial Fraud / Cyber</option>
                <option value="MISSING">Missing Person</option>
                <option value="HARASSMENT">Harassment</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Place of Occurence</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Village, Town, City or GPS"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incident Details (Type or use Voice)</label>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border-2 ${
                    isRecording 
                      ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shadow-sm'
                  }`}
                >
                  {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Mic className="w-3 h-3" />}
                  {isRecording ? 'Listening...' : 'Record Voice'}
                </button>
              </div>
            </div>

            <div className="relative group">
              <textarea 
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly state what happened (e.g., 'stolen wallet at bus stand'). AI will help you write the full report."
                className={`w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-medium text-slate-700 focus:border-blue-500 outline-none transition-all resize-none shadow-inner ${isDrafting ? 'opacity-40 blur-[2px]' : ''}`}
                required
              />

              {/* AI "Write for Me" Assistant Chip */}
              {(detectedTriggers.length > 0 || description.length > 10) && !isDrafting && (
                <div className="absolute bottom-6 right-6 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
                  <button
                    type="button"
                    onClick={handleAiDraft}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-2xl shadow-blue-500/40 font-black text-[10px] uppercase tracking-widest group transition-all"
                  >
                    <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Write Professional FIR with AI
                  </button>
                </div>
              )}

              {/* Keyword Bubbles */}
              {detectedTriggers.length > 0 && (
                <div className="absolute top-4 right-4 flex flex-wrap justify-end gap-1.5 pointer-events-none">
                  {detectedTriggers.map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-600 text-[8px] font-black uppercase rounded-lg border border-blue-200 animate-in fade-in scale-95 transition-all">
                      {t} detected
                    </span>
                  ))}
                </div>
              )}

              {isDrafting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-md px-8 py-5 rounded-3xl shadow-2xl border border-blue-100 flex flex-col items-center gap-3 animate-pulse">
                     <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <Sparkles className="w-6 h-6 animate-spin duration-[3000ms]" />
                     </div>
                     <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Gemini AI Generating Report...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Prompt Suggestions */}
            {!description && (
              <div className="flex flex-wrap gap-2 animate-in fade-in duration-700">
                <span className="text-[9px] font-black text-slate-400 uppercase self-center mr-2">Quick Start:</span>
                {['Bike Theft', 'Burglary', 'Cyber Fraud', 'Mobile Snatched'].map((prompt) => (
                  <button 
                    key={prompt}
                    type="button"
                    onClick={() => setDescription(`I want to report a ${prompt.toLowerCase()} incident that occurred recently...`)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-bold rounded-xl transition-colors border border-slate-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
             <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidence Vault</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 cursor-pointer hover:border-blue-300 transition-all flex flex-col items-center gap-2 group">
                  <Camera className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[9px] font-black text-slate-500 uppercase">Attach Media</span>
                  <input type="file" multiple className="hidden" onChange={(e) => e.target.files && setEvidence(prev => [...prev, ...Array.from(e.target.files!)])} />
                </label>
                <label className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 cursor-pointer hover:border-blue-300 transition-all flex flex-col items-center gap-2 group">
                  <Paperclip className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[9px] font-black text-slate-500 uppercase">Attach Docs</span>
                  <input type="file" multiple className="hidden" onChange={(e) => e.target.files && setEvidence(prev => [...prev, ...Array.from(e.target.files!)])} />
                </label>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex flex-col justify-center shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                 <AlertCircle className="w-4 h-4 text-amber-600" />
                 <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Legal Notice</span>
              </div>
              <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed italic">
                 "False Information Reports are punishable offenses under BNS/IPC. Ensure all AI-generated text accurately reflects the facts of your case before submission."
              </p>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Send className="w-5 h-5" />
            Finalize & Submit FIR
          </button>
        </form>
      </div>

      {/* Side Intelligence Panel */}
      <div className="space-y-6">
         <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-600" /> Legal IQ Score
               </h3>
               {completeness && (
                 <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-xs font-black ${completeness.score > 70 ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}`}>
                    {completeness.score}%
                 </div>
               )}
            </div>

            {!completeness ? (
               <div className="py-10 text-center space-y-3 opacity-40">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                     <Info className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter case details to trigger legal completeness engine...</p>
               </div>
            ) : (
               <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Missing Legal Pillars</span>
                     <div className="space-y-1.5">
                        {completeness.missingDetails.map((m, i) => (
                           <div key={i} className="flex items-start gap-2 text-[10px] text-rose-500 font-bold bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
                              <X className="w-3 h-3 mt-0.5 shrink-0" />
                              <span>{m}</span>
                           </div>
                        ))}
                        {completeness.missingDetails.length === 0 && (
                           <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Ready for registration</span>
                           </div>
                        )}
                     </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Jurisdictional Node</span>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                              <CheckCircle2 className="w-4 h-4" />
                           </div>
                           <div className="min-w-0">
                              <div className="text-[10px] font-black text-slate-800 uppercase truncate">Regional Grid Alpha</div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase">Sector-62 Noida Cluster</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>

         <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-[2000ms]">
               <BrainCircuit className="w-32 h-32" />
            </div>
            <div className="relative z-10">
               <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Wand2 className="w-5 h-5" /> Smart FIR Assistant
               </h3>
               <p className="text-[11px] font-medium text-blue-100 leading-relaxed italic border-l-2 border-white/20 pl-4 mb-4">
                  "Our AI detects keywords in your manual text or voice transcription to help draft professional, court-admissible statements automatically."
               </p>
               <div className="text-[9px] font-black uppercase tracking-widest bg-white/10 p-2 rounded-lg text-white/60">
                  Status: AI-Assistant Operational
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
