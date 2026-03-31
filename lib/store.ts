// ============================================
// LOCAL STORAGE DATA STORE
// MVP Data Layer - to be replaced with Supabase
// ============================================

import {
  User,
  RTAPackage,
  ReviewComment,
  ChecklistResponse,
  ActivityLogEntry,
  PackageStatus,
  UserRole,
  WorkflowStage,
  WORKFLOW_STAGES,
  Discipline,
  Section,
  CommentStatus,
  PackageDocument,
  Notification,
} from './types';
import { CHECKLIST_TEMPLATES } from './checklists';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  CURRENT_USER: 'rta_current_user',
  PACKAGES: 'rta_packages',
  ACTIVITY_LOG: 'rta_activity_log',
  NOTIFICATIONS: 'rta_notifications',
};

// ============================================
// DEMO USERS
// ============================================

export const DEMO_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Ciptoko Maskur',
    email: 'ciptoko@sinarmasland.com',
    role: 'dept_head',
    department: 'TD Dept Head',
  },
  {
    id: 'USR-002',
    name: 'M Iqbal Fanshury',
    email: 'iqbal@sinarmasland.com',
    role: 'td_pic',
    department: 'PIC TD',
  },
  {
    id: 'USR-003',
    name: 'Mizan Qisthi',
    email: 'mizan@sinarmasland.com',
    role: 'qs_pic',
    department: 'QS & Cost Control',
  },
  {
    id: 'USR-004',
    name: 'Heri Prastiyo',
    email: 'heri@sinarmasland.com',
    role: 'construction_pic',
    department: 'Construction',
  },
  {
    id: 'USR-005',
    name: 'Ion Sutriputra',
    email: 'ion@sinarmasland.com',
    role: 'coordinator',
    department: 'Project Coordinator',
  },
  {
    id: 'USR-006',
    name: 'PT Konsultan Raya',
    email: 'konsultan@raya.com',
    role: 'consultant',
    department: 'External',
  },
];

export function getUsers(): User[] {
  return DEMO_USERS;
}

// ============================================
// SEED DATA
// ============================================

function createWorkflowStages(
  currentStage: PackageStatus
): WorkflowStage[] {
  const stageOrder = [
    'submitted',
    'completeness_check',
    'technical_review',
    'constructability_review',
    'qs_review',
    'consolidation',
    'final_approval',
    'published',
  ] as PackageStatus[];

  const currentIndex = stageOrder.indexOf(currentStage);

  return WORKFLOW_STAGES.map((ws, i) => {
    let status: WorkflowStage['status'] = 'pending';
    let startedAt: string | undefined;
    let completedAt: string | undefined;

    if (i < currentIndex) {
      status = 'completed';
      const base = new Date('2026-03-10T08:00:00');
      startedAt = new Date(
        base.getTime() + i * 2 * 24 * 60 * 60 * 1000
      ).toISOString();
      completedAt = new Date(
        base.getTime() + (i * 2 + 1) * 24 * 60 * 60 * 1000
      ).toISOString();
    } else if (i === currentIndex) {
      status = 'active';
      startedAt = new Date(
        Date.now() - 8 * 60 * 60 * 1000
      ).toISOString();
    }

    return {
      id: `WS-${String(i + 1).padStart(3, '0')}`,
      ...ws,
      status,
      startedAt,
      completedAt,
    };
  });
}

function generateSeedPackages(): RTAPackage[] {
  const packages: RTAPackage[] = [
    {
      id: 'PKG-001',
      packageId: 'PKG-2026-0001',
      title: 'Paket Perkerasan Jalan Seksi 1A - STA 0+000 s/d 2+500',
      description:
        'Dokumen desain perkerasan kaku dan lentur segmen awal seksi 1A termasuk detail transisi dan cross section.',
      section: '1A',
      discipline: 'highway',
      status: 'constructability_review',
      currentVersion: 'v2.0',
      submittedBy: 'USR-006',
      submittedAt: '2026-03-08T10:00:00Z',
      updatedAt: '2026-03-25T14:30:00Z',
      isFrozen: false,
      documents: [
        {
          id: 'DOC-001',
          name: 'DWG-HWY-001_Typical Cross Section.pdf',
          type: 'drawing',
          version: 'v2.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-20T10:00:00Z',
          fileSize: '12.4 MB',
        },
        {
          id: 'DOC-002',
          name: 'DWG-HWY-002_Pavement Structure.pdf',
          type: 'drawing',
          version: 'v2.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-20T10:05:00Z',
          fileSize: '8.7 MB',
        },
        {
          id: 'DOC-003',
          name: 'BOQ-HWY-001_Volume Perkerasan.xlsx',
          type: 'boq',
          version: 'v2.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-20T10:10:00Z',
          fileSize: '2.1 MB',
        },
      ],
      workflowStages: createWorkflowStages('constructability_review'),
      comments: [
        {
          id: 'CMT-001',
          packageId: 'PKG-001',
          documentId: 'DOC-001',
          author: 'USR-002',
          authorName: 'Budi Santoso, ST',
          authorRole: 'td_pic',
          content:
            'Detail tie-in di STA 1+200 belum jelas, perlu diperjelas batas perkerasan lama dan baru.',
          status: 'closed',
          discipline: 'highway',
          resolvedBy: 'USR-006',
          resolvedAt: '2026-03-18T09:00:00Z',
          closedBy: 'USR-002',
          closedAt: '2026-03-19T11:00:00Z',
          createdAt: '2026-03-15T14:00:00Z',
          replies: [
            {
              id: 'RPL-001',
              author: 'USR-006',
              authorName: 'PT Konsultan Raya',
              authorRole: 'consultant',
              content:
                'Sudah diperbaiki di v2.0, detail tie-in lengkap di sheet 3.',
              createdAt: '2026-03-18T09:00:00Z',
            },
          ],
        },
        {
          id: 'CMT-002',
          packageId: 'PKG-001',
          documentId: 'DOC-003',
          author: 'USR-002',
          authorName: 'Budi Santoso, ST',
          authorRole: 'td_pic',
          content:
            'Volume base course di BoQ tidak konsisten dengan gambar cross section. Mohon dicek ulang kalkulasi.',
          status: 'resolved',
          discipline: 'highway',
          resolvedBy: 'USR-006',
          resolvedAt: '2026-03-22T16:00:00Z',
          createdAt: '2026-03-16T10:00:00Z',
          replies: [
            {
              id: 'RPL-002',
              author: 'USR-006',
              authorName: 'PT Konsultan Raya',
              authorRole: 'consultant',
              content:
                'Volume sudah direvisi sesuai cross section terbaru. Selisih 450 m³ sudah dikoreksi.',
              createdAt: '2026-03-22T16:00:00Z',
            },
          ],
        },
        {
          id: 'CMT-003',
          packageId: 'PKG-001',
          author: 'USR-004',
          authorName: 'Heri Gunawan, ST',
          authorRole: 'construction_pic',
          content:
            'Perlu detail akses alat paver di area STA 0+800 - 1+000 karena sempitnya ROW di area tersebut.',
          status: 'open',
          discipline: 'method',
          createdAt: '2026-03-25T14:30:00Z',
          replies: [],
        },
      ],
      checklistResponses: [],
    },
    {
      id: 'PKG-002',
      packageId: 'PKG-2026-0002',
      title: 'Paket Sistem Drainase Seksi 1B - STA 2+500 s/d 5+000',
      description:
        'Desain sistem drainase melintang dan memanjang termasuk detail saluran, inlet/outlet, dan konsep dewatering.',
      section: '1B',
      discipline: 'drainage',
      status: 'qs_review',
      currentVersion: 'v1.0',
      submittedBy: 'USR-006',
      submittedAt: '2026-03-05T09:00:00Z',
      updatedAt: '2026-03-24T16:00:00Z',
      isFrozen: false,
      documents: [
        {
          id: 'DOC-004',
          name: 'DWG-DRN-001_Drainage Layout Plan.pdf',
          type: 'drawing',
          version: 'v1.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-05T09:00:00Z',
          fileSize: '15.2 MB',
        },
        {
          id: 'DOC-005',
          name: 'DWG-DRN-002_Typical Channel Section.pdf',
          type: 'drawing',
          version: 'v1.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-05T09:10:00Z',
          fileSize: '6.8 MB',
        },
      ],
      workflowStages: createWorkflowStages('qs_review'),
      comments: [
        {
          id: 'CMT-004',
          packageId: 'PKG-002',
          documentId: 'DOC-004',
          author: 'USR-002',
          authorName: 'Budi Santoso, ST',
          authorRole: 'td_pic',
          content:
            'Konektivitas outlet di STA 3+200 perlu ditinjau ulang, terdapat potensi backflow saat hujan deras.',
          status: 'closed',
          discipline: 'drainage',
          resolvedBy: 'USR-006',
          resolvedAt: '2026-03-12T10:00:00Z',
          closedBy: 'USR-002',
          closedAt: '2026-03-13T08:00:00Z',
          createdAt: '2026-03-10T11:00:00Z',
          replies: [],
        },
        {
          id: 'CMT-005',
          packageId: 'PKG-002',
          author: 'USR-003',
          authorName: 'Mizan Pratama, ST',
          authorRole: 'qs_pic',
          content:
            'Harga satuan grating di AHS perlu di-update sesuai survey harga terbaru. Selisih ~15% dari harga pasar.',
          status: 'open',
          discipline: 'drainage',
          createdAt: '2026-03-24T16:00:00Z',
          replies: [],
        },
      ],
      checklistResponses: [],
    },
    {
      id: 'PKG-003',
      packageId: 'PKG-2026-0003',
      title: 'Paket Struktur Jembatan Overpass Seksi 2A - STA 7+500',
      description:
        'Desain struktur jembatan overpass termasuk pondasi, abutment, pier, dan superstruktur.',
      section: '2A',
      discipline: 'structure',
      status: 'technical_review',
      currentVersion: 'v1.0',
      submittedBy: 'USR-006',
      submittedAt: '2026-03-18T08:00:00Z',
      updatedAt: '2026-03-23T10:00:00Z',
      isFrozen: false,
      documents: [
        {
          id: 'DOC-006',
          name: 'DWG-STR-001_Bridge General Arrangement.pdf',
          type: 'drawing',
          version: 'v1.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-18T08:00:00Z',
          fileSize: '22.1 MB',
        },
        {
          id: 'DOC-007',
          name: 'CALC-STR-001_Structural Analysis.pdf',
          type: 'specification',
          version: 'v1.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-18T08:15:00Z',
          fileSize: '5.4 MB',
        },
      ],
      workflowStages: createWorkflowStages('technical_review'),
      comments: [
        {
          id: 'CMT-006',
          packageId: 'PKG-003',
          author: 'USR-002',
          authorName: 'Budi Santoso, ST',
          authorRole: 'td_pic',
          content:
            'Detail wingwall dan headwall belum termasuk dalam gambar. Perlu dilengkapi sebelum lanjut ke review konstruksi.',
          status: 'open',
          discipline: 'structure',
          createdAt: '2026-03-23T10:00:00Z',
          replies: [],
        },
      ],
      checklistResponses: [],
    },
    {
      id: 'PKG-004',
      packageId: 'PKG-2026-0004',
      title: 'Paket Perbaikan Tanah Dasar Seksi 1A - STA 0+500 s/d 1+800',
      description:
        'Desain perkuatan tanah dasar menggunakan PVD dan preloading pada area tanah lunak.',
      section: '1A',
      discipline: 'geotechnical',
      status: 'published',
      currentVersion: 'v3.0',
      submittedBy: 'USR-006',
      submittedAt: '2026-02-15T08:00:00Z',
      updatedAt: '2026-03-20T16:00:00Z',
      isFrozen: true,
      documents: [
        {
          id: 'DOC-008',
          name: 'DWG-GEO-001_Soil Treatment Zoning.pdf',
          type: 'drawing',
          version: 'v3.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-15T08:00:00Z',
          fileSize: '18.5 MB',
        },
      ],
      workflowStages: createWorkflowStages('published'),
      comments: [
        {
          id: 'CMT-007',
          packageId: 'PKG-004',
          author: 'USR-004',
          authorName: 'Heri Gunawan, ST',
          authorRole: 'construction_pic',
          content:
            'Urutan PVD installation sudah jelas. Akses alat crane crawler feasible dari akses utara.',
          status: 'closed',
          discipline: 'method',
          resolvedBy: 'USR-006',
          resolvedAt: '2026-03-05T10:00:00Z',
          closedBy: 'USR-004',
          closedAt: '2026-03-06T09:00:00Z',
          createdAt: '2026-03-02T14:00:00Z',
          replies: [],
        },
      ],
      checklistResponses: [],
    },
    {
      id: 'PKG-005',
      packageId: 'PKG-2026-0005',
      title: 'Paket Perkerasan Lentur Seksi 2A - STA 5+000 s/d 8+000',
      description:
        'Desain perkerasan lentur (flexible pavement) dengan overlay pada segmen Seksi 2A.',
      section: '2A',
      discipline: 'highway',
      status: 'submitted',
      currentVersion: 'v1.0',
      submittedBy: 'USR-006',
      submittedAt: '2026-03-26T10:00:00Z',
      updatedAt: '2026-03-26T10:00:00Z',
      isFrozen: false,
      documents: [
        {
          id: 'DOC-009',
          name: 'DWG-HWY-003_Flexible Pavement Design.pdf',
          type: 'drawing',
          version: 'v1.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-26T10:00:00Z',
          fileSize: '14.3 MB',
        },
        {
          id: 'DOC-010',
          name: 'BOQ-HWY-002_Volume Perkerasan Lentur.xlsx',
          type: 'boq',
          version: 'v1.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-26T10:05:00Z',
          fileSize: '1.8 MB',
        },
      ],
      workflowStages: createWorkflowStages('submitted'),
      comments: [],
      checklistResponses: [],
    },
    {
      id: 'PKG-006',
      packageId: 'PKG-2026-0006',
      title: 'Paket Box Culvert Seksi 1B - STA 3+100 dan 4+200',
      description:
        'Desain box culvert ganda dan tunggal pada dua titik perlintasan air utama.',
      section: '1B',
      discipline: 'structure',
      status: 'final_approval',
      currentVersion: 'v2.0',
      submittedBy: 'USR-006',
      submittedAt: '2026-03-01T08:00:00Z',
      updatedAt: '2026-03-26T09:00:00Z',
      isFrozen: false,
      documents: [
        {
          id: 'DOC-011',
          name: 'DWG-STR-002_Box Culvert Detail.pdf',
          type: 'drawing',
          version: 'v2.0',
          uploadedBy: 'USR-006',
          uploadedAt: '2026-03-20T08:00:00Z',
          fileSize: '9.8 MB',
        },
      ],
      workflowStages: createWorkflowStages('final_approval'),
      comments: [
        {
          id: 'CMT-008',
          packageId: 'PKG-006',
          author: 'USR-003',
          authorName: 'Mizan Pratama, ST',
          authorRole: 'qs_pic',
          content:
            'Volume beton dan besi tulangan sudah match dengan gambar detail. AHS konsisten.',
          status: 'closed',
          discipline: 'structure',
          resolvedBy: 'USR-003',
          resolvedAt: '2026-03-22T10:00:00Z',
          closedBy: 'USR-003',
          closedAt: '2026-03-22T10:00:00Z',
          createdAt: '2026-03-21T14:00:00Z',
          replies: [],
        },
      ],
      checklistResponses: [],
    },
  ];

  return packages;
}

function generateSeedActivity(): ActivityLogEntry[] {
  return [
    {
      id: 'ACT-001',
      packageId: 'PKG-005',
      userId: 'USR-006',
      userName: 'PT Konsultan Raya',
      userRole: 'consultant',
      action: 'package_submitted',
      details:
        'Paket PKG-2026-0005 disubmit untuk review (v1.0)',
      timestamp: '2026-03-26T10:00:00Z',
    },
    {
      id: 'ACT-002',
      packageId: 'PKG-001',
      userId: 'USR-004',
      userName: 'Heri Gunawan, ST',
      userRole: 'construction_pic',
      action: 'comment_added',
      details: 'Komentar baru pada PKG-2026-0001: detail akses alat paver',
      timestamp: '2026-03-25T14:30:00Z',
    },
    {
      id: 'ACT-003',
      packageId: 'PKG-002',
      userId: 'USR-003',
      userName: 'Mizan Pratama, ST',
      userRole: 'qs_pic',
      action: 'review_started',
      details:
        'QS Review dimulai untuk PKG-2026-0002',
      timestamp: '2026-03-24T16:00:00Z',
    },
    {
      id: 'ACT-004',
      packageId: 'PKG-003',
      userId: 'USR-002',
      userName: 'Budi Santoso, ST',
      userRole: 'td_pic',
      action: 'comment_added',
      details:
        'Komentar baru pada PKG-2026-0003: detail wingwall/headwall',
      timestamp: '2026-03-23T10:00:00Z',
    },
    {
      id: 'ACT-005',
      packageId: 'PKG-006',
      userId: 'USR-002',
      userName: 'Budi Santoso, ST',
      userRole: 'td_pic',
      action: 'stage_completed',
      details: 'Consolidation selesai untuk PKG-2026-0006 → Final Approval',
      timestamp: '2026-03-26T09:00:00Z',
    },
    {
      id: 'ACT-006',
      packageId: 'PKG-004',
      userId: 'USR-001',
      userName: 'Ir. Ahmad Wijaya',
      userRole: 'dept_head',
      action: 'package_frozen',
      details:
        'PKG-2026-0004 di-freeze sebagai Frozen Version (v3.0)',
      timestamp: '2026-03-20T16:00:00Z',
    },
    {
      id: 'ACT-007',
      packageId: 'PKG-001',
      userId: 'USR-006',
      userName: 'PT Konsultan Raya',
      userRole: 'consultant',
      action: 'comment_resolved',
      details:
        'Komentar CMT-002 di-resolve: volume base course sudah dikoreksi',
      timestamp: '2026-03-22T16:00:00Z',
    },
    {
      id: 'ACT-008',
      packageId: 'PKG-002',
      userId: 'USR-004',
      userName: 'Heri Gunawan, ST',
      userRole: 'construction_pic',
      action: 'stage_completed',
      details: 'Constructability Review selesai untuk PKG-2026-0002',
      timestamp: '2026-03-22T11:00:00Z',
    },
  ];
}

// ============================================
// STORE API
// ============================================

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
  
  // Background Sync to Mac Disk (JSON files in /data)
  fetch('/api/storage', {
    method: 'POST',
    body: JSON.stringify({ key, data: value }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(err => console.debug('Sync ignore:', err));
}

// Initialize with Supabase data if available, otherwise use seed
export async function initializeStore(): Promise<void> {
  if (!isBrowser()) return;
  
  // Try to fetch packages from Supabase
  const { data: packages, error } = await supabase
    .from('rta_packages')
    .select('*, documents:package_documents(*), workflow_stages(*), comments:review_comments(*), checklist_responses(*)');

  if (packages && packages.length > 0) {
    setToStorage(STORAGE_KEYS.PACKAGES, packages);
  } else if (!localStorage.getItem(STORAGE_KEYS.PACKAGES)) {
    // Only seed if DB is empty and nothing in storage
    const seed = generateSeedPackages();
    setToStorage(STORAGE_KEYS.PACKAGES, seed);
    
    // Optional: Push seed data to Supabase if you want to start with dummy data
    // (Wait for user to confirm before doing bulk push)
  }

  // Same for activity log
  const { data: activity } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (activity && activity.length > 0) {
    setToStorage(STORAGE_KEYS.ACTIVITY_LOG, activity);
  } else if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG)) {
    setToStorage(STORAGE_KEYS.ACTIVITY_LOG, generateSeedActivity());
  }
}

// ---- Current User ----

export function getCurrentUser(): User | null {
  return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

export function getUserById(id: string): User | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}

// ---- Packages ----

export function getPackages(): RTAPackage[] {
  return getFromStorage<RTAPackage[]>(STORAGE_KEYS.PACKAGES, []);
}

export function getPackageById(id: string): RTAPackage | undefined {
  return getPackages().find((p) => p.id === id);
}

export function updatePackage(id: string, updates: Partial<RTAPackage>): void {
  const packages = getPackages();
  const index = packages.findIndex((p) => p.id === id);
  if (index !== -1) {
    packages[index] = { ...packages[index], ...updates, updatedAt: new Date().toISOString() };
    setToStorage(STORAGE_KEYS.PACKAGES, packages);
  }
}

export function createPackage(
  data: { 
    title: string; 
    description: string; 
    section: Section; 
    discipline: Discipline; 
    submittedBy: string; 
  }
): RTAPackage {
  const packages = getPackages();
  
  // Generate ID: PKG-2026-X
  const lastPkg = [...packages].sort((a,b) => b.packageId.localeCompare(a.packageId))[0];
  const lastNum = lastPkg ? parseInt(lastPkg.packageId.split('-')[2]) : 0;
  const packageId = `PKG-2026-${(lastNum + 1).toString().padStart(4, '0')}`;

  const initialStages: WorkflowStage[] = WORKFLOW_STAGES.map((s, i) => ({
    id: `stage-${Date.now()}-${i}`,
    stage: s.stage,
    label: s.label,
    order: s.order,
    assignedRole: s.assignedRole,
    slaHours: s.slaHours,
    status: i === 0 ? 'active' : 'pending',
    startedAt: i === 0 ? new Date().toISOString() : undefined,
  }));

  const newPackage: RTAPackage = {
    id: `pkg-${Date.now()}`,
    packageId,
    ...data,
    status: 'submitted',
    currentVersion: 'v1.0',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFrozen: false,
    documents: [],
    checklistResponses: [],
    comments: [],
    workflowStages: initialStages,
  };

  packages.unshift(newPackage); // Add to beginning
  setToStorage(STORAGE_KEYS.PACKAGES, packages);
  
  return newPackage;
}

export async function advanceWorkflow(packageId: string): Promise<RTAPackage | undefined> {
  const packages = getPackages();
  const pkg = packages.find((p) => p.id === packageId);
  if (!pkg) return undefined;

  const stageOrder: PackageStatus[] = [
    'submitted',
    'completeness_check',
    'technical_review',
    'constructability_review',
    'qs_review',
    'consolidation',
    'final_approval',
    'published',
  ];

  const currentIndex = stageOrder.indexOf(pkg.status);
  if (currentIndex === -1 || currentIndex >= stageOrder.length - 1)
    return undefined;

  // Check consolidation gate
  if (stageOrder[currentIndex] === 'consolidation') {
    const openComments = pkg.comments.filter(
      (c) => c.status !== 'closed'
    ).length;
    if (openComments > 0) return undefined;
  }

  const nextStatus = stageOrder[currentIndex + 1];

  // Update stages
  const stages = [...pkg.workflowStages];
  const currentStage = stages.find((s) => s.status === 'active');
  if (currentStage) {
    currentStage.status = 'completed';
    currentStage.completedAt = new Date().toISOString();
  }
  const nextStage = stages.find((s) => s.stage === nextStatus);
  if (nextStage) {
    nextStage.status = 'active';
    nextStage.startedAt = new Date().toISOString();
  }

  const isFrozen = nextStatus === 'published';
  const updatedPkg = {
    ...pkg,
    status: nextStatus,
    workflowStages: stages,
    isFrozen,
    updatedAt: new Date().toISOString(),
  };

  const index = packages.findIndex((p) => p.id === packageId);
  packages[index] = updatedPkg;
  setToStorage(STORAGE_KEYS.PACKAGES, packages);

  // Trigger Notification for the next role
  const nextStageObj = updatedPkg.workflowStages.find(s => s.status === 'active');
  if (nextStageObj) {
    // Notify all users with that role (except the one who just advanced it)
    const allUsers = getUsers();
    const targetUsers = allUsers.filter((u: User) => u.role === nextStageObj.assignedRole);
    
    for (const u of targetUsers) {
      await addNotification({
        userId: u.id,
        title: 'Draft Kedatangan Baru',
        message: `Paket ${updatedPkg.packageId} menunggu tinjauan: ${nextStageObj.label}`,
        packageId: packageId,
        type: 'info',
      });
    }
  }

  return updatedPkg;
}

export function rejectWorkflow(packageId: string): RTAPackage | undefined {
  const packages = getPackages();
  const pkg = packages.find((p) => p.id === packageId);
  if (!pkg) return undefined;

  // Move back to 'submitted' stage
  const nextStatus: PackageStatus = 'submitted';

  // Update stages
  const stages = [...pkg.workflowStages];
  // Reset all stages after 'submitted' to pending
  stages.forEach((s, i) => {
    if (i === 0) {
      s.status = 'active';
      s.startedAt = new Date().toISOString();
      s.completedAt = undefined;
    } else {
      s.status = 'pending';
      s.startedAt = undefined;
      s.completedAt = undefined;
    }
  });

  const updatedPkg = {
    ...pkg,
    status: nextStatus,
    workflowStages: stages,
    isFrozen: false,
    updatedAt: new Date().toISOString(),
  };

  const index = packages.findIndex((p) => p.id === packageId);
  packages[index] = updatedPkg;
  setToStorage(STORAGE_KEYS.PACKAGES, packages);

  return updatedPkg;
}

// ---- Documents ----

export async function addDocument(
  packageId: string,
  doc: Omit<PackageDocument, 'id' | 'uploadedAt'>
): Promise<PackageDocument> {
  const packages = getPackages();
  const pkgIndex = packages.findIndex((p) => p.id === packageId);
  if (pkgIndex === -1) throw new Error('Package not found');

  const newDoc: PackageDocument = {
    ...doc,
    id: `DOC-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
  };

  packages[pkgIndex].documents.push(newDoc);
  packages[pkgIndex].updatedAt = new Date().toISOString();
  setToStorage(STORAGE_KEYS.PACKAGES, packages);

  // Notify T&D PIC if uploaded by consultant
  const pkg = packages[pkgIndex];
  if (doc.type === 'specification' || doc.type === 'drawing' || doc.type === 'boq') {
    const allUsers = getUsers();
    const tdPics = allUsers.filter((u: User) => u.role === 'td_pic');
    for (const u of tdPics) {
      await addNotification({
        userId: u.id,
        title: 'Dokumen Baru Diupload',
        message: `Konsultan telah mengupload ${doc.name} untuk paket ${pkg.packageId}`,
        packageId: packageId,
        type: 'info',
      });
    }
  }

  return newDoc;
}

// ---- Comments ----

export function addComment(
  packageId: string,
  comment: Omit<ReviewComment, 'id' | 'replies'>
): ReviewComment {
  const packages = getPackages();
  const pkg = packages.find((p) => p.id === packageId);
  if (!pkg) throw new Error('Package not found');

  const newComment: ReviewComment = {
    ...comment,
    id: `CMT-${Date.now()}`,
    replies: [],
  };

  pkg.comments.push(newComment);
  pkg.updatedAt = new Date().toISOString();
  setToStorage(STORAGE_KEYS.PACKAGES, packages);

  return newComment;
}

export function updateCommentStatus(
  packageId: string,
  commentId: string,
  status: CommentStatus,
  userId: string
): void {
  const packages = getPackages();
  const pkg = packages.find((p) => p.id === packageId);
  if (!pkg) return;

  const comment = pkg.comments.find((c) => c.id === commentId);
  if (!comment) return;

  comment.status = status;
  if (status === 'resolved') {
    comment.resolvedBy = userId;
    comment.resolvedAt = new Date().toISOString();
  } else if (status === 'closed') {
    comment.closedBy = userId;
    comment.closedAt = new Date().toISOString();
  }

  pkg.updatedAt = new Date().toISOString();
  setToStorage(STORAGE_KEYS.PACKAGES, packages);
}

export function addReply(
  packageId: string,
  commentId: string,
  reply: Omit<ReviewComment['replies'][0], 'id'>
): void {
  const packages = getPackages();
  const pkg = packages.find((p) => p.id === packageId);
  if (!pkg) return;

  const comment = pkg.comments.find((c) => c.id === commentId);
  if (!comment) return;

  comment.replies.push({
    ...reply,
    id: `RPL-${Date.now()}`,
  });

  pkg.updatedAt = new Date().toISOString();
  setToStorage(STORAGE_KEYS.PACKAGES, packages);
}

// ---- Checklist Responses ----

export function saveChecklistResponse(
  packageId: string,
  response: Omit<ChecklistResponse, 'id'>
): void {
  const packages = getPackages();
  const pkg = packages.find((p) => p.id === packageId);
  if (!pkg) return;

  const existingIndex = pkg.checklistResponses.findIndex(
    (r) => r.checklistItemId === response.checklistItemId
  );

  const newResponse: ChecklistResponse = {
    ...response,
    id: existingIndex >= 0
      ? pkg.checklistResponses[existingIndex].id
      : `CHR-${Date.now()}`,
  };

  if (existingIndex >= 0) {
    pkg.checklistResponses[existingIndex] = newResponse;
  } else {
    pkg.checklistResponses.push(newResponse);
  }

  pkg.updatedAt = new Date().toISOString();
  setToStorage(STORAGE_KEYS.PACKAGES, packages);
}

// ---- Activity Log ----

export function getActivityLog(): ActivityLogEntry[] {
  return getFromStorage<ActivityLogEntry[]>(STORAGE_KEYS.ACTIVITY_LOG, []);
}

export function addActivity(
  entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>
): void {
  const log = getActivityLog();
  log.unshift({
    ...entry,
    id: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
  // Keep last 100
  setToStorage(STORAGE_KEYS.ACTIVITY_LOG, log.slice(0, 100));
}

// ---- Stats ----

export function getStats() {
  const packages = getPackages();

  const total = packages.length;
  const active = packages.filter(
    (p) => p.status !== 'published' && p.status !== 'draft'
  ).length;
  const published = packages.filter((p) => p.status === 'published').length;

  const totalComments = packages.reduce(
    (sum, p) => sum + p.comments.length,
    0
  );
  const openComments = packages.reduce(
    (sum, p) =>
      sum + p.comments.filter((c) => c.status === 'open').length,
    0
  );
  const closedComments = packages.reduce(
    (sum, p) =>
      sum + p.comments.filter((c) => c.status === 'closed').length,
    0
  );

  const slaCompliance = packages.length > 0
    ? Math.round(
        (packages.filter((p) => {
          const activeStage = p.workflowStages.find(
            (s) => s.status === 'active'
          );
          if (!activeStage || !activeStage.startedAt) return true;
          const elapsed =
            (Date.now() - new Date(activeStage.startedAt).getTime()) /
            (1000 * 60 * 60);
          return elapsed <= activeStage.slaHours;
        }).length /
          packages.length) *
          100
      )
    : 100;

  return {
    total,
    active,
    published,
    totalComments,
    openComments,
    closedComments,
    slaCompliance,
  };
}

// ---- Notifications ----

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) return [];
  
  // Map activity_log entries to Notifications for UI compatibility
  return (data || []).map(item => ({
    id: item.id,
    userId: item.user_id,
    title: item.action.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    message: item.details,
    packageId: item.package_id,
    type: 'info',
    createdAt: item.created_at,
    isRead: false
  }));
}

export async function addNotification(
  data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
): Promise<void> {
  // We'll use activity_log table for notifications to keep it synced
  await supabase.from('activity_log').insert([{
    package_id: data.packageId,
    user_id: data.userId,
    action: 'notification',
    details: data.message
  }]);
}

export function markNotificationAsRead(id: string): void {
  // Currently local-only as per MVP needs, but you can add Supabase sync here too
  const all = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  const index = all.findIndex((n) => n.id === id);
  if (index !== -1) {
    all[index].isRead = true;
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  }
}
