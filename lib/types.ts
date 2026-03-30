// ============================================
// INTEGRATED RTA SYSTEM - DOMAIN TYPES
// ============================================

export type UserRole =
  | 'dept_head'
  | 'td_pic'
  | 'qs_pic'
  | 'construction_pic'
  | 'coordinator'
  | 'consultant';

export type PackageStatus =
  | 'draft'
  | 'submitted'
  | 'completeness_check'
  | 'technical_review'
  | 'constructability_review'
  | 'qs_review'
  | 'consolidation'
  | 'final_approval'
  | 'published'
  | 'revision_required';

export type CommentStatus = 'open' | 'resolved' | 'closed';

export type Discipline =
  | 'highway'
  | 'drainage'
  | 'structure'
  | 'geotechnical'
  | 'method';

export type Section = '1A' | '1B' | '2A';

export type SLAStatus = 'on_time' | 'warning' | 'overdue';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
}

export interface RTAPackage {
  id: string;
  packageId: string; // e.g., "PKG-2026-0001"
  title: string;
  description: string;
  section: Section;
  discipline: Discipline;
  status: PackageStatus;
  currentVersion: string; // e.g., "v1.0"
  submittedBy: string; // User ID
  submittedAt: string;
  updatedAt: string;
  isFrozen: boolean;
  documents: PackageDocument[];
  workflowStages: WorkflowStage[];
  comments: ReviewComment[];
  checklistResponses: ChecklistResponse[];
}

export interface PackageDocument {
  id: string;
  name: string;
  type: string; // drawing, specification, boq
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  url?: string;
}

export interface WorkflowStage {
  id: string;
  stage: PackageStatus;
  label: string;
  order: number;
  assignedTo?: string; // User ID
  assignedRole: UserRole;
  slaHours: number; // Target SLA in working hours
  startedAt?: string;
  completedAt?: string;
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'overdue';
  notes?: string;
}

export interface ReviewComment {
  id: string;
  packageId: string;
  documentId?: string;
  author: string; // User ID
  authorName: string;
  authorRole: UserRole;
  content: string;
  status: CommentStatus;
  discipline?: Discipline;
  resolvedBy?: string;
  resolvedAt?: string;
  closedBy?: string;
  closedAt?: string;
  createdAt: string;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  author: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  discipline: Discipline;
  category: string;
  item: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface ChecklistResponse {
  id: string;
  packageId: string;
  checklistItemId: string;
  discipline: Discipline;
  isChecked: boolean;
  notes: string;
  reviewedBy: string;
  reviewedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  packageId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  packageId?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// ============================================
// WORKFLOW STAGE DEFINITIONS
// ============================================

export const WORKFLOW_STAGES: Omit<WorkflowStage, 'id' | 'startedAt' | 'completedAt' | 'status' | 'notes'>[] = [
  {
    stage: 'submitted',
    label: 'Submission',
    order: 1,
    assignedRole: 'consultant',
    slaHours: 0,
  },
  {
    stage: 'completeness_check',
    label: 'Completeness Check',
    order: 2,
    assignedRole: 'td_pic',
    slaHours: 16, // 1-2 HK
  },
  {
    stage: 'technical_review',
    label: 'Technical Review (T&D)',
    order: 3,
    assignedRole: 'td_pic',
    slaHours: 24, // 2-3 HK
  },
  {
    stage: 'constructability_review',
    label: 'Constructability Review',
    order: 4,
    assignedRole: 'construction_pic',
    slaHours: 24, // 2-3 HK
  },
  {
    stage: 'qs_review',
    label: 'QS Review',
    order: 5,
    assignedRole: 'qs_pic',
    slaHours: 24, // 2-3 HK
  },
  {
    stage: 'consolidation',
    label: 'Consolidation',
    order: 6,
    assignedRole: 'td_pic',
    slaHours: 8, // Auto
  },
  {
    stage: 'final_approval',
    label: 'Final Approval',
    order: 7,
    assignedRole: 'dept_head',
    slaHours: 8,
  },
  {
    stage: 'published',
    label: 'Publish & Distribute',
    order: 8,
    assignedRole: 'coordinator',
    slaHours: 4,
  },
];

// ============================================
// DISCIPLINE LABELS & ICONS
// ============================================

export const DISCIPLINE_CONFIG: Record<
  Discipline,
  { label: string; emoji: string; color: string }
> = {
  highway: { label: 'Highway', emoji: '🛣️', color: '#3b82f6' },
  drainage: { label: 'Drainase', emoji: '💧', color: '#06b6d4' },
  structure: { label: 'Struktur', emoji: '🏗️', color: '#8b5cf6' },
  geotechnical: { label: 'Geoteknik', emoji: '⛰️', color: '#f59e0b' },
  method: { label: 'Metode Pelaksanaan', emoji: '🔧', color: '#ef4444' },
};

export const SECTION_CONFIG: Record<Section, { label: string; color: string }> = {
  '1A': { label: 'Seksi 1A', color: '#3b82f6' },
  '1B': { label: 'Seksi 1B', color: '#8b5cf6' },
  '2A': { label: 'Seksi 2A', color: '#f59e0b' },
};

export const ROLE_CONFIG: Record<
  UserRole,
  { label: string; department: string; color: string }
> = {
  dept_head: { label: 'Department Head', department: 'T&D', color: '#ef4444' },
  td_pic: { label: 'T&D PIC', department: 'T&D', color: '#3b82f6' },
  qs_pic: { label: 'QS & Cost Control', department: 'QS', color: '#10b981' },
  construction_pic: {
    label: 'Construction PIC',
    department: 'Construction',
    color: '#f59e0b',
  },
  coordinator: {
    label: 'Project Coordinator',
    department: 'PMO',
    color: '#8b5cf6',
  },
  consultant: {
    label: 'Konsultan',
    department: 'External',
    color: '#6b7280',
  },
};

export const STATUS_CONFIG: Record<
  PackageStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: 'Draft', color: '#6b7280', bgColor: '#374151' },
  submitted: { label: 'Submitted', color: '#3b82f6', bgColor: '#1e3a5f' },
  completeness_check: {
    label: 'Completeness Check',
    color: '#06b6d4',
    bgColor: '#164e63',
  },
  technical_review: {
    label: 'Technical Review',
    color: '#8b5cf6',
    bgColor: '#4c1d95',
  },
  constructability_review: {
    label: 'Constructability Review',
    color: '#f59e0b',
    bgColor: '#78350f',
  },
  qs_review: { label: 'QS Review', color: '#10b981', bgColor: '#064e3b' },
  consolidation: {
    label: 'Consolidation',
    color: '#ec4899',
    bgColor: '#831843',
  },
  final_approval: {
    label: 'Final Approval',
    color: '#ef4444',
    bgColor: '#7f1d1d',
  },
  published: { label: 'Published ✓', color: '#22c55e', bgColor: '#14532d' },
  revision_required: {
    label: 'Revision Required',
    color: '#f97316',
    bgColor: '#7c2d12',
  },
};
