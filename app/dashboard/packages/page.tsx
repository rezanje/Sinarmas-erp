"use client";

import { useEffect, useState } from "react";
import { getPackages, createPackage, getCurrentUser, addActivity } from "@/lib/store";
import {
  RTAPackage,
  STATUS_CONFIG,
  DISCIPLINE_CONFIG,
  SECTION_CONFIG,
  User,
  Section,
  Discipline,
} from "@/lib/types";
import { formatDate, getSLAStatus } from "@/lib/utils";
import { Search, Filter, Lock, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<RTAPackage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSection, setFilterSection] = useState<string>("all");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSection, setNewSection] = useState<Section>("1A");
  const [newDiscipline, setNewDiscipline] = useState<Discipline>("highway");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPackages(getPackages());
    setUser(getCurrentUser());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filtered = packages.filter((pkg) => {
    const matchSearch =
      search === "" ||
      pkg.title.toLowerCase().includes(search.toLowerCase()) ||
      pkg.packageId.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" || pkg.status === filterStatus;
    const matchSection =
      filterSection === "all" || pkg.section === filterSection;
    const matchDiscipline =
      filterDiscipline === "all" || pkg.discipline === filterDiscipline;
    return matchSearch && matchStatus && matchSection && matchDiscipline;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;

    setIsSubmitting(true);
    
    // Simulate slight delay for DX
    setTimeout(() => {
      const pkg = createPackage({
        title: newTitle,
        description: newDesc,
        section: newSection,
        discipline: newDiscipline,
        submittedBy: user.id,
      });

      addActivity({
        packageId: pkg.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "package_created",
        details: `Paket baru dibuat: ${pkg.packageId} - ${pkg.title}`,
      });

      setIsSubmitting(false);
      setIsModalOpen(false);
      
      // Refresh list or redirect
      router.push(`/dashboard/packages/${pkg.id}`);
    }, 800);
  };

  const isConsultant = user?.role === "consultant";

  return (
    <div className="animate-fade-in" style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Paket Dokumen RTA
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            {filtered.length} dari {packages.length} paket terdaftar
          </p>
        </div>

        {isConsultant && (
          <button 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8,
              boxShadow: "0 10px 20px -5px rgba(225, 29, 72, 0.3)"
            }}
          >
            <Plus size={18} />
            <span>Tambah Paket Baru</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div
        className="glass-card-static"
        style={{
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flex: 1,
            minWidth: 200,
          }}
        >
          <Search size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            className="input"
            placeholder="Cari berdasarkan ID atau judul paket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              padding: "6px 0",
              fontSize: 14,
              boxShadow: "none",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            className="input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: "auto", minWidth: 140, padding: "8px 12px", fontSize: 13 }}
          >
            <option value="all">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            style={{ width: "auto", minWidth: 120, padding: "8px 12px", fontSize: 13 }}
          >
            <option value="all">Semua Seksi</option>
            {Object.entries(SECTION_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            style={{ width: "auto", minWidth: 160, padding: "8px 12px", fontSize: 13 }}
          >
            <option value="all">Semua Disiplin</option>
            {Object.entries(DISCIPLINE_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>
                {val.emoji} {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Package Cards Grid */}
      <div
        className="stagger-children"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 20,
        }}
      >
        {filtered.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "80px 20px",
              background: "white",
              borderRadius: 16,
              border: "1px dashed var(--border-primary)"
            }}
          >
            <Search size={48} style={{ margin: "0 auto 16px", opacity: 0.1, color: "var(--text-primary)" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Hasil tidak ditemukan</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
              Coba sesuaikan kata kunci atau filter pencarian Anda.
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
            animation: "fade-in 0.2s ease-out"
          }}
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            className="glass-card-static"
            style={{
              width: "100%",
              maxWidth: 500,
              padding: 32,
              animation: "slide-up 0.3s ease-out",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Daftarkan Paket RTA Baru</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>
                    JUDUL PAKET
                  </label>
                  <input
                    className="input"
                    placeholder="Contoh: RTA Geoteknik Jembatan Seksi 1A"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>
                    DESKRIPSI (OPTIONAL)
                  </label>
                  <textarea
                    className="input"
                    placeholder="Penjelasan singkat mengenai paket dokumen ini..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    style={{ minHeight: 80 }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>
                      SEKSI
                    </label>
                    <select
                      className="input"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value as Section)}
                    >
                      {Object.entries(SECTION_CONFIG).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>
                      DISIPLIN
                    </label>
                    <select
                      className="input"
                      value={newDiscipline}
                      onChange={(e) => setNewDiscipline(e.target.value as Discipline)}
                    >
                      {Object.entries(DISCIPLINE_CONFIG).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                  <button 
                    type="button"
                    className="btn btn-ghost" 
                    style={{ flex: 1 }}
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary" 
                    style={{ flex: 2 }}
                    disabled={isSubmitting || !newTitle.trim()}
                  >
                    {isSubmitting ? "Memproses..." : "Buat Paket Sekarang"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageCard({ pkg }: { pkg: RTAPackage }) {
  const statusConf = STATUS_CONFIG[pkg.status];
  const disciplineConf = DISCIPLINE_CONFIG[pkg.discipline];
  const sectionConf = SECTION_CONFIG[pkg.section];
  const activeStage = pkg.workflowStages.find((s) => s.status === "active");
  const completedStages = pkg.workflowStages.filter(
    (s) => s.status === "completed"
  ).length;
  const totalStages = pkg.workflowStages.length;
  const progress = Math.round((completedStages / totalStages) * 100);

  const openComments = pkg.comments.filter((c) => c.status === "open").length;
  const totalComments = pkg.comments.length;

  const slaStatus = activeStage?.startedAt
    ? getSLAStatus(activeStage.startedAt, activeStage.slaHours)
    : "on_time";

  return (
    <Link
      href={`/dashboard/packages/${pkg.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        className="glass-card"
        style={{
          padding: 24,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.2s, box-shadow 0.2s",
          background: "white"
        }}
      >
        {/* Frozen badge */}
        {pkg.isFrozen && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: "var(--accent-emerald)",
              fontWeight: 700,
              background: "var(--accent-emerald-dim)",
              padding: "4px 8px",
              borderRadius: 6
            }}
          >
            <Lock size={12} />
            Published
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 24 }}>{disciplineConf.emoji}</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: disciplineConf.color,
                letterSpacing: "0.02em"
              }}
            >
              {pkg.packageId}
            </span>
          </div>
          <h3
            className="truncate-2"
            style={{
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.5,
              color: "var(--text-primary)",
              minHeight: "2.25rem"
            }}
          >
            {pkg.title}
          </h3>
        </div>

        {/* Badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 18,
          }}
        >
          <span
            className="badge"
            style={{
              background: `${statusConf.color}08`,
              color: statusConf.color,
              border: `1px solid ${statusConf.color}15`,
              fontSize: 11,
              fontWeight: 600
            }}
          >
            {statusConf.label}
          </span>
          <span
            className="badge"
            style={{
              background: `${sectionConf.color}08`,
              color: sectionConf.color,
              border: `1px solid ${sectionConf.color}15`,
              fontSize: 11,
              fontWeight: 600
            }}
          >
            {sectionConf.label}
          </span>
          <span className="badge badge-neutral" style={{ fontSize: 11, background: "rgba(0,0,0,0.03)" }}>
            {pkg.currentVersion}
          </span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Workflow Progress</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              {progress}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div
              className={`progress-bar-fill ${
                progress === 100 ? "emerald" : "blue"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, display: "flex", justifyContent: "space-between" }}>
             <span>{completedStages} dari {totalStages} tahap selesai</span>
          </div>
        </div>

        {/* Footer meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 16,
            borderTop: "1px solid var(--border-primary)",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ opacity: 0.6 }}>💬</span> {openComments > 0 ? (
                <span style={{ color: "var(--accent-amber)", fontWeight: 600 }}>{openComments} open</span>
              ) : (
                <span>{totalComments} closed</span>
              )}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ opacity: 0.6 }}>📄</span> {pkg.documents.length}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {slaStatus !== "on_time" &&
              pkg.status !== "published" && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      slaStatus === "warning"
                        ? "var(--accent-amber)"
                        : "var(--accent-rose)",
                    boxShadow: `0 0 8px ${slaStatus === "warning" ? "rgba(245, 158, 11, 0.4)" : "rgba(225, 29, 72, 0.4)"}`
                  }}
                />
              )}
            <span style={{ fontWeight: 500 }}>{formatDate(pkg.updatedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
