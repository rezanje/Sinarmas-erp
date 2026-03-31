"use client";

import { useEffect, useState } from "react";
import { getPackages, getStats, getActivityLog, getCurrentUser } from "@/lib/store";
import {
  RTAPackage,
  ActivityLogEntry,
  STATUS_CONFIG,
  DISCIPLINE_CONFIG,
  SECTION_CONFIG,
  ROLE_CONFIG,
  User,
} from "@/lib/types";
import { timeAgo, getSLAStatus } from "@/lib/utils";
import {
  Package,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [packages, setPackages] = useState<RTAPackage[]>([]);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPackages(getPackages());
    setActivity(getActivityLog());
    setStats(getStats());
    setUser(getCurrentUser());
    setMounted(true);
  }, []);

  if (!mounted || !stats) return null;

  const activePackages = packages.filter(
    (p) => p.status !== "published" && p.status !== "draft"
  );

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Selamat datang, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
          Berikut ringkasan status Integrated RTA System hari ini.
        </p>
      </div>

      {/* Stat Cards */}
      <div
        className="stagger-children"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          icon={<Package size={20} />}
          label="Total Paket"
          value={stats.total}
          sublabel={`${stats.active} aktif, ${stats.published} published`}
          accent="blue"
        />
        <StatCard
          icon={<MessageSquare size={20} />}
          label="Komentar Terbuka"
          value={stats.openComments}
          sublabel={`${stats.closedComments}/${stats.totalComments} closed`}
          accent="amber"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="SLA Compliance"
          value={`${stats.slaCompliance}%`}
          sublabel="Target: 100%"
          accent="emerald"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Butuh Perhatian"
          value={
            packages.filter((p) => {
              const active = p.workflowStages.find(
                (s) => s.status === "active"
              );
              return (
                active?.startedAt &&
                getSLAStatus(active.startedAt, active.slaHours) === "overdue"
              );
            }).length
          }
          sublabel="Paket overdue SLA"
          accent="rose"
        />
      </div>

      {/* Main Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}
      >
        {/* Active Packages Status */}
        <div className="glass-card-static" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--accent-blue-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-blue)",
                }}
              >
                <FileCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                  Paket Aktif
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Status workflow saat ini
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/packages"
              style={{
                fontSize: 13,
                color: "var(--accent-primary)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activePackages.slice(0, 6).map((pkg) => {
              const disciplineConf = DISCIPLINE_CONFIG[pkg.discipline];
              const sectionConf = SECTION_CONFIG[pkg.section];
              const activeStage = pkg.workflowStages.find(
                (s) => s.status === "active"
              );
              const slaStatus = activeStage?.startedAt
                ? getSLAStatus(activeStage.startedAt, activeStage.slaHours)
                : "on_time";

              return (
                <Link
                  key={pkg.id}
                  href={`/dashboard/packages/${pkg.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.4)",
                      border: "1px solid var(--border-primary)",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                      e.currentTarget.style.borderColor = "rgba(225, 29, 72, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)";
                      e.currentTarget.style.borderColor = "var(--border-primary)";
                    }}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {disciplineConf.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {pkg.packageId}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {pkg.title}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        className="badge"
                        style={{
                          background: `${sectionConf.color}10`,
                          color: sectionConf.color,
                          border: `1px solid ${sectionConf.color}20`,
                          fontSize: 11,
                        }}
                      >
                        {sectionConf.label}
                      </span>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            slaStatus === "on_time"
                              ? "var(--accent-emerald)"
                              : slaStatus === "warning"
                              ? "var(--accent-amber)"
                              : "var(--accent-rose)",
                          boxShadow:
                            slaStatus === "overdue"
                              ? "0 0 8px rgba(244,63,94,0.5)"
                              : "none",
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
            {activePackages.length === 0 && (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
                 Tidak ada paket aktif saat ini.
              </div>
            )}
          </div>
        </div>

        {/* SLA Heatmap */}
        <div className="glass-card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            SLA Heatmap
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      padding: "6px 8px",
                    }}
                  >
                    Paket
                  </th>
                  {["Sub", "CC", "TR", "CR", "QS", "Con", "FA", "Pub"].map(
                    (s) => (
                      <th
                        key={s}
                        style={{
                          textAlign: "center",
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          padding: "6px 4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {packages.slice(0, 10).map((pkg) => (
                  <tr key={pkg.id}>
                    <td
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "4px 8px",
                        whiteSpace: "nowrap",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {pkg.packageId.replace("PKG-2026-", "")}
                    </td>
                    {pkg.workflowStages.map((stage) => {
                      let bg = "rgba(100, 116, 139, 0.05)";
                      let clr = "var(--text-muted)";
                      let icon = "–";

                      if (stage.status === "completed") {
                        bg = "var(--accent-emerald-dim)";
                        clr = "var(--accent-emerald)";
                        icon = "✓";
                      } else if (stage.status === "active") {
                        const sla = stage.startedAt
                          ? getSLAStatus(stage.startedAt, stage.slaHours)
                          : "on_time";
                        if (sla === "on_time") {
                          bg = "var(--accent-blue-dim)";
                          clr = "var(--accent-blue)";
                          icon = "●";
                        } else if (sla === "warning") {
                          bg = "var(--accent-amber-dim)";
                          clr = "var(--accent-amber)";
                          icon = "!";
                        } else {
                          bg = "var(--accent-rose-dim)";
                          clr = "var(--accent-rose)";
                          icon = "✕";
                        }
                      }

                      return (
                        <td
                          key={stage.id}
                          style={{
                            textAlign: "center",
                            padding: "4px",
                          }}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              background: bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              color: clr,
                              margin: "0 auto",
                              border: "1px solid rgba(0,0,0,0.02)",
                            }}
                          >
                            {icon}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              { color: "var(--accent-emerald)", label: "Selesai" },
              { color: "var(--accent-blue)", label: "Aktif" },
              { color: "var(--accent-amber)", label: "Peringatan" },
              { color: "var(--accent-rose)", label: "Overdue" },
            ].map((legend) => (
              <div
                key={legend.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: legend.color,
                  }}
                />
                {legend.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 20,
        }}
      >
        {/* Recent Activity */}
        <div className="glass-card-static" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              Aktivitas Terbaru
            </h3>
            <Link
              href="/dashboard/activity"
              style={{
                fontSize: 13,
                color: "var(--accent-primary)",
                textDecoration: "none",
              }}
            >
              Lihat Semua →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {activity.slice(0, 8).map((act, index) => {
              const roleConf = ROLE_CONFIG[act.userRole];
              return (
                <div
                  key={act.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: index === 7 ? "none" : "1px solid var(--border-primary)",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `${roleConf.color}08`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      color: roleConf.color,
                      border: `1px solid ${roleConf.color}15`,
                    }}
                  >
                    {act.userName
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        lineHeight: 1.4,
                      }}
                    >
                      {act.details}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{act.userName}</span>
                      <span>·</span>
                      <span>{timeAgo(act.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health / Quick Actions (Optional placeholder to balance grid) */}
        <div className="glass-card-static" style={{ padding: 24, background: "linear-gradient(135deg, white 0%, rgba(225, 29, 72, 0.02) 100%)" }}>
           <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Ringkasan Sistem
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-emerald-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-emerald)" }}>
                    <Package size={20} />
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Paket Selesai (Final)</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{stats.published} dokumen telah disahkan</div>
                </div>
            </div>
            
            <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                    <MessageSquare size={20} />
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Tanggapan Review</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{stats.closedComments} dari {stats.totalComments} isu ditutup</div>
                </div>
            </div>

            <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "white", border: "1px solid var(--border-primary)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Status Integrasi Database</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-emerald)" }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Live Sync Active (Supabase)</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                    Semua aktivitas sekarang disinkronkan secara real-time antar akun.
                </div>
            </div>

             <div style={{ marginTop: "auto" }}>
                <Link href="/dashboard/packages" className="btn btn-primary" style={{ width: "100%", textDecoration: "none" }}>
                    Kelola Semua Paket
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel: string;
  accent: string;
}) {
  const colors: Record<string, string> = {
    blue: "var(--accent-blue)",
    amber: "#d97706",
    emerald: "var(--accent-emerald)",
    rose: "var(--accent-primary)",
    violet: "var(--accent-violet)",
  };

  return (
    <div
      className={`glass-card-static stat-card ${accent}`}
      style={{ padding: "20px 20px 16px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}
        >
          {label}
        </span>
        <div style={{ color: colors[accent] || "var(--text-muted)" }}>
          {icon}
        </div>
      </div>
      <div
        className="animate-count-up"
        style={{
          fontSize: 32,
          fontWeight: 800,
          fontFamily: "'Outfit', sans-serif",
          color: colors[accent],
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
        {sublabel}
      </div>
    </div>
  );
}
