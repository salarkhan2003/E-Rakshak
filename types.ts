
export enum UserRole {
  CITIZEN = 'CITIZEN',
  CONSTABLE = 'CONSTABLE',
  SUB_INSPECTOR = 'SUB_INSPECTOR',
  STATION_HOUSE_OFFICER = 'SHO',
  SUPERVISORY_OFFICER = 'DSP_SP',
  ADMIN = 'ADMIN'
}

export enum FIRStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REVIEWED = 'REVIEWED',
  SIGNED = 'SIGNED',
  REGISTERED = 'REGISTERED',
  CLARIFICATION_REQUIRED = 'CLARIFICATION_REQUIRED',
  ESCALATED = 'ESCALATED'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  stationId?: string;
  badgeNumber?: string;
  aadhaarLinked: boolean;
  isDelegated?: boolean;
  delegatedFrom?: string;
  joiningDate?: string;
  lastTrainingDate?: string;
}

export interface Evidence {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  url: string;
  timestamp: string;
  // Intelligence fields
  metadata?: {
    location?: string;
    coordinates?: string;
    device?: string;
    filesize?: string;
  };
  intelligence?: {
    isTampered: boolean;
    tamperConfidence: number;
    relevanceScore: number;
    analysisRemarks: string;
  };
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  role: UserRole;
  timestamp: string;
  ipAddress: string;
  deviceInfo: string;
  remarks?: string;
}

export interface FIR {
  id: string;
  firNumber?: string;
  citizenId: string;
  citizenName: string;
  incidentType: string;
  incidentLocation: string;
  incidentDateTime: string;
  description: string;
  status: FIRStatus;
  evidence: Evidence[];
  auditLogs: AuditLog[];
  currentAssigneeId?: string;
  currentAssigneeRole: UserRole;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deadline?: string;
  isEscalated?: boolean;
  createdAt: string;
  updatedAt: string;
  isSynced?: boolean;
  signatures: {
    role: UserRole;
    userId: string;
    timestamp: string;
    method: 'AADHAAR_OTP' | 'DSC';
    hash: string;
  }[];
}

export interface CrimePattern {
  id: string;
  moType: string;
  relatedCaseIds: string[];
  description: string;
  frequency: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
