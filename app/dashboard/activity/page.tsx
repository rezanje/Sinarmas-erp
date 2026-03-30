"use client";

import { useEffect, useState } from "react";
import { getActivityLog, getPackages } from "@/lib/store";
import { ActivityLogEntry, ROLE_CONFIG } from "@/lib/types";
import { timeAgo, formatDateTime } from "@/lib/utils";
import {
  Activity,
  FileText,
  MessageSquare,
  CheckCircle2,
  Send,
  Lock,
  AlertCircle,
  Search,
} from "lucide-react";
import Link from "next/link";

const ACTION_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; label: string }
> = {
  package_submitted: {
    icon: <Send size={14} />,
    color: "var(--accent-blue)",
    label: "Paket Disubmit",
  },
  comment_added: {
    icon: <MessageSquare size={14} />,
    color: "var(--accent-amber)",
    label: "Komentar Baru",
  },
  comment_resolved: {
    icon: <CheckCircle2 size={14} />,
    color: "var(--accent-blue)",
    label: "Komentar Resolved",
  },
  review_started: {
    icon: <FileText size={14} />,
    color: "var(--accent-violet)",
    label: "Review Dimulai",
  },
  stage_completed: {
    icon: <CheckCircle2 size={14} />,
    color: "var(--accent-emerald)",
    label: "Stage Selesai",
  },
  package_frozen: {
    icon: <Lock size={14} />,
    color: "var(--accent-emerald)",
    label: "Paket Di-Freeze",
  },
  revision_required: {
    icon: <AlertCircle size={14} />,
    color: "var(--accent-rose)",
    label: "Revisi Diperlukan",
  },
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setActivities(getActivityLog());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filtered = activities.filter((act) => {
    const matchSearch =
      search === "" ||
      act.details.toLowerCase().includes(search.toLowerCase()) ||
      act.userName.toLowerCase().includes(search.toLowerCase());
    const matchAction =
      filterAction === "all" || act.action === filterAction;
    return matchSearch && matchAction;
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
          Activity Log
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
            marginTop: 4,
          }}
        >
          Audit trail semua aktivitas dalam sistem
        </p>
      </div>

      {/* Filters */}
      <div
        className="glass-card-static"
        style={{
          padding: "14px 20px",
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
            gap: 8,
            flex: 1,
            minWidth: 200,
          }}
        >
          <Search size={16} style={{ color: "var(--text-muted)" }} />
          <input
            className="input"
            placeholder="Cari aktivitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              padding: "6px 0",
            }}
          />
        </div>
        <select
          className="input"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          style={{ width: "auto", padding: "7px 12px", fontSize: 13 }}
        >
          <option value="all">Semua Aksi</option>
          {Object.entries(ACTION_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
      </div>

      {/* Activity List */}
      <div className="glass-card-static" style={{ padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filtered.map((act, index) => {
            const actionConf = ACTION_CONFIG[act.action] || {
              icon: <Activity size={14} />,
              color: "var(--text-muted)",
              label: act.action,
            };
            const roleConf = ROLE_CONFIG[act.userRole];

            return (
              <div
                key={act.id}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom:
                    index < filtered.length - 1
                      ? "1px solid var(--border-primary)"
                      : "none",
                  position: "relative",
                }}
              >
                {/* Timeline dot */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${actionConf.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: actionConf.color,
                    flexShrink: 0,
                  }}
                >
                  {actionConf.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: actionConf.color,
                      }}
                    >
                      {actionConf.label}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      ·
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {timeAgo(act.timestamp)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      marginBottom: 4,
                    }}
                  >
                    {act.details}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                    }}
                  >
                    <span
                      style={{
                        color: roleConf.color,
                        fontWeight: 500,
                      }}
                    >
                      {act.userName}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {formatDateTime(act.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Link to package */}
                {act.packageId && (
                  <Link
                    href={`/dashboard/packages/${act.packageId}`}
                    className="btn btn-ghost btn-sm"
                    style={{
                      alignSelf: "center",
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    Lihat →
                  </Link>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "var(--text-muted)",
              }}
            >
              Tidak ada aktivitas ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
