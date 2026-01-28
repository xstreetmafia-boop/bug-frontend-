export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugPriority = 'low' | 'medium' | 'high' | 'urgent';
export type BugStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface Bug {
  id: string;
  title: string;
  description: string;
  severity: BugSeverity;
  priority: BugPriority;
  status: BugStatus;
  reportedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BugFormData {
  title: string;
  description: string;
  severity: BugSeverity;
  priority: BugPriority;
  reportedBy: string;
}
