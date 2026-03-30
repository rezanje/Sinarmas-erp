// ============================================
// REVIEW CHECKLISTS - Per Discipline
// Updated Based on Integrated RTA Major Checklist Points
// ============================================

import { ChecklistItem, Discipline } from './types';

let idCounter = 0;
const cid = () => `CL-${String(++idCounter).padStart(3, '0')}`;

export const CHECKLIST_TEMPLATES: ChecklistItem[] = [
  // ========================
  // HIGHWAY
  // ========================
  {
    id: cid(),
    discipline: 'highway',
    category: 'QS (BoQ) Review',
    item: 'Typical cross section lengkap + STA coverage jelas',
    description: 'Lebar lajur/bahu/median; kiri-kanan terpetakan dengan benar sesuai standar.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'highway',
    category: 'QS (BoQ) Review',
    item: 'Struktur lapisan terkunci',
    description: 'Jenis layer + tebal tiap layer + lebar efektif tiap layer sudah sesuai spesifikasi.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'highway',
    category: 'QS (BoQ) Review',
    item: 'Detail transisi/area khusus tersedia',
    description: 'Pengecekan area widening/taper/tie-in/perubahan tipe perkerasan.',
    severity: 'major',
  },
  {
    id: cid(),
    discipline: 'highway',
    category: 'Construction Review',
    item: 'Construction sequencing & staging plan tersedia',
    description: 'Urutan kerja earthwork-drainase-pavement per zona/STA buildable.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'highway',
    category: 'Construction Review',
    item: 'Traffic management / access plan tersedia',
    description: 'Rencana pemeliharaan akses warga atau jalan eksisting selama konstruksi.',
    severity: 'major',
  },

  // ========================
  // DRAINASE
  // ========================
  {
    id: cid(),
    discipline: 'drainage',
    category: 'QS (BoQ) Review',
    item: 'Tipikal saluran utama lengkap',
    description: 'Dimensi + bedding/LC + cover/grating (bila ada) sudah terdetail.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'drainage',
    category: 'QS (BoQ) Review',
    item: 'Konektivitas sistem drainase jelas',
    description: 'Detail inlet/outlet/manhole/spacing + outlet pembuangan ke existing.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'drainage',
    category: 'QS (BoQ) Review',
    item: 'Lokasi & boundary drainase jelas',
    description: 'Penentuan STA, sisi kiri/kanan, dan titik crossing/culvert.',
    severity: 'major',
  },
  {
    id: cid(),
    discipline: 'drainage',
    category: 'Construction Review',
    item: 'Temporary drainage & dewatering concept',
    description: 'Terdapat bypass, discharge point, dan proteksi aliran sementara.',
    severity: 'major',
  },

  // ========================
  // STRUKTUR
  // ========================
  {
    id: cid(),
    discipline: 'structure',
    category: 'QS (BoQ) Review',
    item: 'Tipe & dimensi tipikal struktur terkunci',
    description: 'Span dan ukuran elemen utama struktur sudah sesuai standar teknis.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'structure',
    category: 'QS (BoQ) Review',
    item: 'Elemen pelengkap tersedia',
    description: 'Cek wingwall, headwall, apron, approach slab, dan parapet.',
    severity: 'major',
  },
  {
    id: cid(),
    discipline: 'structure',
    category: 'QS (BoQ) Review',
    item: 'Boundary & jumlah unit jelas',
    description: 'Jumlah unit, lokasi STA, dan limit pekerjaan terdefinisi dengan baik.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'structure',
    category: 'Construction Review',
    item: 'Interface detail (approach/tie-in/transition)',
    description: 'Cegah rework saat konstruksi dengan detail interface yang akurat.',
    severity: 'major',
  },

  // ========================
  // GEOTEKNIK
  // ========================
  {
    id: cid(),
    discipline: 'geotechnical',
    category: 'QS (BoQ) Review',
    item: 'Jenis perkuatan & parameter tipikal terkunci',
    description: 'Sesuai spacing, panjang, layer count, dan parameter teknis lainnya.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'geotechnical',
    category: 'QS (BoQ) Review',
    item: 'Area/STA penerapan & tebal/tinggi desain',
    description: 'Zoning treatment tanah dasar harus terdefinisi dengan jelas.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'geotechnical',
    category: 'QS (BoQ) Review',
    item: 'Detail transisi antar zona geoteknik',
    description: 'Pengecekan batas perubahan treatment antar zona.',
    severity: 'major',
  },
  {
    id: cid(),
    discipline: 'geotechnical',
    category: 'Construction Review',
    item: 'Zoning treatment + STA limit jelas',
    description: 'Area perkuatan/perbaikan tanah terpetakan di lapangan.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'geotechnical',
    category: 'Construction Review',
    item: 'Metode pelaksanaan perbaikan tanah',
    description: 'Urutan kerja, alat utama, dan QC control point teridentifikasi.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'geotechnical',
    category: 'Construction Review',
    item: 'Schedule allowance & monitoring requirement',
    description: 'Waiting time konsolidasi dan ketersediaan instrumentasi.',
    severity: 'major',
  },

  // ========================
  // METHOD (KESELURUHAN)
  // ========================
  {
    id: cid(),
    discipline: 'method',
    category: 'Integrasi',
    item: 'Construction sequence logis antar disiplin',
    description: 'Tidak ada konflik antar pekerjaan Highway, Drainase, dan Struktur.',
    severity: 'critical',
  },
  {
    id: cid(),
    discipline: 'method',
    category: 'Integrasi',
    item: 'Desain buildable dengan alat yang tersedia',
    description: 'Verifikasi metode konstruksi sesuai realita ketersediaan alat di site.',
    severity: 'critical',
  },
];

export function getChecklistByDiscipline(
  discipline: Discipline
): ChecklistItem[] {
  return CHECKLIST_TEMPLATES.filter((c) => c.discipline === discipline);
}

export function getAllDisciplines(): Discipline[] {
  return ['highway', 'drainage', 'structure', 'geotechnical', 'method'];
}
