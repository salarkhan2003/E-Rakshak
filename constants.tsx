
import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  User, 
  Settings, 
  BarChart3, 
  Clock, 
  AlertCircle,
  Search,
  CheckCircle2,
  FileSearch,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { UserRole, FIRStatus } from './types';

export const ROLE_CONFIG = {
  [UserRole.CITIZEN]: {
    label: 'Citizen',
    color: 'bg-blue-600',
    icon: <User className="w-5 h-5" />,
    features: ['File FIR', 'Track Status', 'Download Certificate']
  },
  [UserRole.CONSTABLE]: {
    label: 'Constable',
    color: 'bg-indigo-600',
    icon: <ShieldCheck className="w-5 h-5" />,
    features: ['Verification', 'Field Reports']
  },
  [UserRole.SUB_INSPECTOR]: {
    label: 'Sub-Inspector',
    color: 'bg-amber-600',
    icon: <ShieldCheck className="w-5 h-5" />,
    features: ['Review', 'Initial Approval']
  },
  [UserRole.STATION_HOUSE_OFFICER]: {
    label: 'Station House Officer',
    color: 'bg-emerald-600',
    icon: <ShieldCheck className="w-5 h-5" />,
    features: ['Final Signature', 'Resource Management']
  },
  [UserRole.SUPERVISORY_OFFICER]: {
    label: 'DSP / SP',
    color: 'bg-rose-600',
    icon: <ShieldCheck className="w-5 h-5" />,
    features: ['Oversight', 'Policy Enforcement']
  },
  [UserRole.ADMIN]: {
    label: 'Administrator',
    color: 'bg-slate-800',
    icon: <Settings className="w-5 h-5" />,
    features: ['System Configuration', 'Audit Access']
  }
};

export const STATUS_MAP = {
  [FIRStatus.SUBMITTED]: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: <FileText className="w-4 h-4" /> },
  [FIRStatus.UNDER_REVIEW]: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-4 h-4" /> },
  [FIRStatus.REVIEWED]: { label: 'Reviewed', color: 'bg-indigo-100 text-indigo-700', icon: <FileSearch className="w-4 h-4" /> },
  [FIRStatus.SIGNED]: { label: 'Digitally Signed', color: 'bg-emerald-100 text-emerald-700', icon: <ShieldCheck className="w-4 h-4" /> },
  [FIRStatus.REGISTERED]: { label: 'Registered', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> },
  [FIRStatus.CLARIFICATION_REQUIRED]: { label: 'Clarification Needed', color: 'bg-rose-100 text-rose-700', icon: <AlertCircle className="w-4 h-4" /> },
  [FIRStatus.ESCALATED]: { label: 'Escalated', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-4 h-4" /> }
};

export const MOCK_STATIONS = [
  "Central Police Station - District A",
  "West End Station - District B",
  "Sector 12 Outpost - District C",
  "Highways Patrol Unit"
];

export const MOCK_OFFICERS = [
  { id: 'SI-92', name: 'SI Ajay Kumar', role: UserRole.SUB_INSPECTOR },
  { id: 'OFF-1284', name: 'Insp. Vikram Rathore', role: UserRole.STATION_HOUSE_OFFICER },
  { id: 'SI-104', name: 'SI Meena Sharma', role: UserRole.SUB_INSPECTOR },
  { id: 'DSP-01', name: 'DSP Rajesh Singh', role: UserRole.SUPERVISORY_OFFICER },
];
