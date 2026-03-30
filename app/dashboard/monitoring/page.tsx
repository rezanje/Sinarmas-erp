"use client";

import { useEffect, useState } from "react";
import { getPackages, DEMO_USERS } from "@/lib/store";
import {
  RTAPackage,
  DISCIPLINE_CONFIG,
  SECTION_CONFIG,
  STATUS_CONFIG,
  ROLE_CONFIG,
  User,
} from "@/lib/types";
import { getSLAStatus, getElapsedHours, formatDate } from "@/lib/utils";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function MonitoringPage() {
  const [packages, setPackages] = useState<RTAPackage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPackages(getPackages());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activePackages = packages.filter(
    (p) => p.status !== "published" && p.status !== "draft"
  );

  // Bottleneck analysis
  const stageBottlenecks = packages.reduce((acc, pkg) => {
    pkg.workflowStages.forEach((stage) => {
      if (stage.status === "active" && stage.startedAt) {
        const sla = getSLAStatus(stage.startedAt, stage.slaHours);
        if (sla === "overdue" || sla === "warning") {
          const key = stage.label;
          if (!acc[key]) acc[key] = { overdue: 0, warning: 0 };
          if (sla === "overdue") acc[key].overdue++;
          else acc[key].warning++;
        }
      }
    });
    return acc;
  }, {} as Record<string, { overdue: number; warning: number }>);

  // PIC performance
  const picPerformance: {
    name: string;
    role: string;
    color: string;
    reviewsCompleted: number;
    avgHours: number;
  }[] = [];

  const reviewerIds = ["USR-002", "USR-003", "USR-004"];
  reviewerIds.forEach((userId) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (!user) return;

    const roleConf = ROLE_CONFIG[user.role];
    let totalHours = 0;
    let count = 0;

    packages.forEach((pkg) => {
      pkg.workflowStages.forEach((stage) => {
        if (
          stage.assignedRole === user.role &&
          stage.status === "completed" &&
          stage.startedAt &&
          stage.completedAt
        ) {
          const hours =
            (new Date(stage.completedAt).getTime() -
              new Date(stage.startedAt).getTime()) /
            (1000 * 60 * 60);
          totalHours += hours;
          count++;
        }
      });
    });

    picPerformance.push({
      name: user.name,
      role: roleConf.label,
      color: roleConf.color,
      reviewsCompleted: count,
      avgHours: count > 0 ? Math.round(totalHours / count) : 0,
    });
  });

  // Section stats
  const sectionStats = (["1A", "1B", "2A"] as const).map((section) => {
    const sectionPkgs = packages.filter((p) => p.section === section);
    const published = sectionPkgs.filter(
      (p) => p.status === "published"
    ).length;
    const active = sectionPkgs.filter(
      (p) => p.status !== "published" && p.status !== "draft"
    ).length;
    return {
      section,
      ...SECTION_CONFIG[section],
      total: sectionPkgs.length,
      published,
      active,
    };
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          SLA Monitoring
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
            marginTop: 4,
          }}
        >
          Real-time monitoring SLA dan bottleneck detection
        </p>
      </div>

      {/* Summary stats */}
      <div
        className="stagger-children"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div className="glass-card-static stat-card emerald" style={{ padding: "18px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              On Time
            </span>
            <CheckCircle2 size={18} style={{ color: "var(--accent-emerald)" }} />
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: "'Outfit'",
              color: "var(--accent-emerald)",
            }}
          >
            {activePackages.filter((p) => {
              const active = p.workflowStages.find((s) => s.status === "active");
              return (
                !active?.startedAt ||
                getSLAStatus(active.startedAt, active.slaHours) === "on_time"
              );
            }).length}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>paket</span>
        </div>

        <div className="glass-card-static stat-card amber" style={{ padding: "18px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Warning
            </span>
            <Clock size={18} style={{ color: "var(--accent-amber)" }} />
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: "'Outfit'",
              color: "var(--accent-amber)",
            }}
          >
            {activePackages.filter((p) => {
              const active = p.workflowStages.find((s) => s.status === "active");
              return (
                active?.startedAt &&
                getSLAStatus(active.startedAt, active.slaHours) === "warning"
              );
            }).length}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>paket</span>
        </div>

        <div className="glass-card-static stat-card rose" style={{ padding: "18px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Overdue
            </span>
            <AlertTriangle size={18} style={{ color: "var(--accent-rose)" }} />
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: "'Outfit'",
              color: "var(--accent-rose)",
            }}
          >
            {activePackages.filter((p) => {
              const active = p.workflowStages.find((s) => s.status === "active");
              return (
                active?.startedAt &&
                getSLAStatus(active.startedAt, active.slaHours) === "overdue"
              );
            }).length}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>paket</span>
        </div>

        <div className="glass-card-static stat-card blue" style={{ padding: "18px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Published
            </span>
            <TrendingUp size={18} style={{ color: "var(--accent-blue)" }} />
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: "'Outfit'",
              color: "var(--accent-blue)",
            }}
          >
            {packages.filter((p) => p.status === "published").length}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>paket</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}
      >
        {/* SLA Detail Grid */}
        <div className="glass-card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            <Clock
              size={18}
              style={{
                display: "inline",
                marginRight: 8,
                verticalAlign: "middle",
              }}
            />
            SLA Detail per Paket
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activePackages.map((pkg) => {
              const activeStage = pkg.workflowStages.find(
                (s) => s.status === "active"
              );
              const sla = activeStage?.startedAt
                ? getSLAStatus(activeStage.startedAt, activeStage.slaHours)
                : "on_time";
              const elapsed = activeStage?.startedAt
                ? Math.round(getElapsedHours(activeStage.startedAt))
                : 0;
              const remaining = activeStage
                ? Math.max(0, activeStage.slaHours - elapsed)
                : 0;
              const percentUsed = activeStage
                ? Math.min(100, Math.round((elapsed / activeStage.slaHours) * 100))
                : 0;

              return (
                <Link
                  key={pkg.id}
                  href={`/dashboard/packages/${pkg.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 10,
                      background: "var(--bg-tertiary)",
                      border: `1px solid ${
                        sla === "overdue"
                          ? "rgba(244,63,94,0.3)"
                          : sla === "warning"
                          ? "rgba(245,158,11,0.2)"
                          : "var(--border-primary)"
                      }`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{DISCIPLINE_CONFIG[pkg.discipline].emoji}</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          {pkg.packageId}
                        </span>
                      </div>
                      <span
                        className={`badge ${
                          sla === "on_time"
                            ? "badge-emerald"
                            : sla === "warning"
                            ? "badge-amber"
                            : "badge-rose"
                        }`}
                        style={{ fontSize: 11 }}
                      >
                        {sla === "on_time"
                          ? "On Time"
                          : sla === "warning"
                          ? `⚠ ${remaining}h left`
                          : `🔴 ${elapsed - (activeStage?.slaHours || 0)}h over`}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginBottom: 8,
                      }}
                    >
                      Current: {activeStage?.label || "—"} · {elapsed}h /{" "}
                      {activeStage?.slaHours || 0}h
                    </div>
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div
                        className={`progress-bar-fill ${
                          sla === "on_time"
                            ? "emerald"
                            : sla === "warning"
                            ? "amber"
                            : "rose"
                        }`}
                        style={{
                          width: `${Math.min(percentUsed, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
            {activePackages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 30,
                  color: "var(--text-muted)",
                }}
              >
                Semua paket sudah published ✓
              </div>
            )}
          </div>
        </div>

        {/* PIC Performance */}
        <div className="glass-card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            <Users
              size={18}
              style={{
                display: "inline",
                marginRight: 8,
                verticalAlign: "middle",
              }}
            />
            PIC Performance
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {picPerformance.map((pic) => (
              <div
                key={pic.name}
                style={{
                  padding: "16px",
                  borderRadius: 12,
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `${pic.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: pic.color,
                    }}
                  >
                    {pic.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {pic.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: pic.color,
                      }}
                    >
                      {pic.role}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      Reviews Selesai
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "var(--accent-emerald)",
                        fontFamily: "'Outfit'",
                      }}
                    >
                      {pic.reviewsCompleted}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      Rata-rata Lead Time
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "var(--accent-blue)",
                        fontFamily: "'Outfit'",
                      }}
                    >
                      {pic.avgHours}h
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Overview */}
      <div className="glass-card-static" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          <BarChart3
            size={18}
            style={{
              display: "inline",
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          Overview per Seksi
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {sectionStats.map((stat) => {
            const publishedPercent =
              stat.total > 0
                ? Math.round((stat.published / stat.total) * 100)
                : 0;
            return (
              <div
                key={stat.section}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-primary)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: stat.color,
                    marginBottom: 12,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    fontFamily: "'Outfit'",
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {stat.total}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 12,
                  }}
                >
                  paket total
                </div>
                <div className="progress-bar" style={{ marginBottom: 8 }}>
                  <div
                    className="progress-bar-fill emerald"
                    style={{ width: `${publishedPercent}%` }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--accent-emerald)" }}>
                    {stat.published} published
                  </span>
                  <span style={{ color: "var(--accent-blue)" }}>
                    {stat.active} aktif
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottleneck alert */}
      {Object.keys(stageBottlenecks).length > 0 && (
        <div
          className="glass-card-static"
          style={{ padding: 24, marginTop: 20 }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 16,
              color: "var(--accent-rose)",
            }}
          >
            <AlertTriangle
              size={18}
              style={{
                display: "inline",
                marginRight: 8,
                verticalAlign: "middle",
              }}
            />
            Bottleneck Detected
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(stageBottlenecks).map(([stage, counts]) => (
              <div
                key={stage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "var(--accent-rose-dim)",
                  border: "1px solid rgba(244,63,94,0.2)",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 14 }}>{stage}</span>
                <div style={{ display: "flex", gap: 10 }}>
                  {counts.overdue > 0 && (
                    <span className="badge badge-rose" style={{ fontSize: 11 }}>
                      {counts.overdue} overdue
                    </span>
                  )}
                  {counts.warning > 0 && (
                    <span className="badge badge-amber" style={{ fontSize: 11 }}>
                      {counts.warning} warning
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
