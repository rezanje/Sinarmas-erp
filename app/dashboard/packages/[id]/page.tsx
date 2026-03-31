"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getPackageById,
  getCurrentUser,
  advanceWorkflow,
  rejectWorkflow,
  addComment,
  updateCommentStatus,
  addReply,
  saveChecklistResponse,
  addActivity,
  addDocument,
} from "@/lib/store";
import { CHECKLIST_TEMPLATES, getChecklistByDiscipline } from "@/lib/checklists";
import {
  RTAPackage,
  User,
  STATUS_CONFIG,
  DISCIPLINE_CONFIG,
  SECTION_CONFIG,
  ROLE_CONFIG,
  ReviewComment,
  WorkflowStage,
  Discipline,
  ChecklistItem,
  PackageDocument,
} from "@/lib/types";
import { formatDateTime, getSLAStatus, timeAgo, getElapsedHours } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  MessageSquare,
  AlertTriangle,
  Send,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ArrowRight,
  XCircle,
  Eye,
  Download,
  X,
} from "lucide-react";
import Link from "next/link";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pkg, setPkg] = useState<RTAPackage | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"workflow" | "comments" | "checklist" | "documents">("workflow");
  const [mounted, setMounted] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PackageDocument | null>(null);

  const reload = useCallback(() => {
    const p = getPackageById(params.id as string);
    setPkg(p || null);
  }, [params.id]);

  useEffect(() => {
    reload();
    setUser(getCurrentUser());
    setMounted(true);
  }, [reload]);

  if (!mounted || !pkg || !user) return null;

  const statusConf = STATUS_CONFIG[pkg.status];
  const disciplineConf = DISCIPLINE_CONFIG[pkg.discipline];
  const sectionConf = SECTION_CONFIG[pkg.section];
  const openComments = pkg.comments.filter((c) => c.status === "open").length;
  const totalComments = pkg.comments.length;
  const closedComments = pkg.comments.filter((c) => c.status === "closed").length;
  const closedPercent = totalComments > 0 ? Math.round((closedComments / totalComments) * 100) : 100;

  const canAdvance = (() => {
    const activeStage = pkg.workflowStages.find((s) => s.status === "active");
    if (!activeStage) return false;
    if (pkg.status === "consolidation" && openComments > 0) return false;
    if (activeStage.assignedRole !== user.role && user.role !== "dept_head") return false;
    return true;
  })();

  const handleAdvance = async () => {
    const result = await advanceWorkflow(pkg.id);
    if (result) {
      addActivity({
        packageId: pkg.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "stage_completed",
        details: `Stage Approved: ${pkg.packageId} dipindahkan ke ${STATUS_CONFIG[result.status].label}`,
      });
      reload();
    }
  };

  const handleReject = () => {
    if (!confirm("Apakah anda yakin ingin me-reject paket ini dan mengembalikannya ke Konsultan?")) return;
    const result = rejectWorkflow(pkg.id);
    if (result) {
      addActivity({
        packageId: pkg.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "stage_rejected",
        details: `Stage Rejected: ${pkg.packageId} dikembalikan ke Konsultan untuk revisi`,
      });
      reload();
    }
  };

  const tabs = [
    { key: "workflow" as const, label: "Workflow", icon: <Clock size={16} /> },
    {
      key: "comments" as const,
      label: `Komentar (${totalComments})`,
      icon: <MessageSquare size={16} />,
      badge: openComments > 0 ? openComments : undefined,
    },
    {
      key: "checklist" as const,
      label: "Checklist",
      icon: <ClipboardCheck size={16} />,
    },
    {
      key: "documents" as const,
      label: `Dokumen (${pkg.documents.length})`,
      icon: <FileText size={16} />,
    },
  ];

  return (
    <>
    <div className="animate-fade-in">
      {/* Back + Header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/dashboard/packages"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Paket
        </Link>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 24 }}>{disciplineConf.emoji}</span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: disciplineConf.color,
                }}
              >
                {pkg.packageId}
              </span>
              {pkg.isFrozen && (
                <span className="badge badge-emerald">
                  <Lock size={12} /> Frozen Version
                </span>
              )}
            </div>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.4,
                marginBottom: 8,
              }}
            >
              {pkg.title}
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              {pkg.description}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 12,
              }}
            >
              <span
                className="badge"
                style={{
                  background: `${statusConf.color}15`,
                  color: statusConf.color,
                  border: `1px solid ${statusConf.color}25`,
                }}
              >
                {statusConf.label}
              </span>
              <span
                className="badge"
                style={{
                  background: `${sectionConf.color}15`,
                  color: sectionConf.color,
                  border: `1px solid ${sectionConf.color}25`,
                }}
              >
                {sectionConf.label}
              </span>
              <span className="badge badge-neutral">
                {pkg.currentVersion}
              </span>
              <span className="badge badge-neutral">
                📄 {pkg.documents.length} dokumen
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {canAdvance && !pkg.isFrozen && (
              <>
                <button 
                  className="btn btn-rose" 
                  onClick={handleReject}
                  style={{ background: "rgba(225, 29, 72, 0.1)", color: "var(--accent-rose)", border: "1px solid rgba(225, 29, 72, 0.2)" }}
                >
                  <XCircle size={16} />
                  Reject (Balik ke Konsultan)
                </button>
                <button className="btn btn-emerald" onClick={handleAdvance}>
                  <CheckCircle2 size={16} />
                  {pkg.status === "submitted" 
                    ? "Submit RTA" 
                    : pkg.status === "final_approval"
                    ? "Approve & Freeze"
                    : "Approve Stage"}
                </button>
              </>
            )}
            {pkg.status === "consolidation" && openComments > 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--accent-amber)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--accent-amber-dim)",
                  padding: "8px 12px",
                  borderRadius: 8,
                }}
              >
                <AlertTriangle size={14} />
                {openComments} komentar masih terbuka
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Closed Indicator */}
      <div
        className="glass-card-static"
        style={{ padding: "14px 20px", marginBottom: 20 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2
              size={20}
              style={{
                color:
                  closedPercent === 100
                    ? "var(--accent-emerald)"
                    : "var(--text-muted)",
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Comments Closed: {closedPercent}%
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              ({closedComments}/{totalComments})
            </span>
          </div>
          <div className="progress-bar" style={{ width: 200 }}>
            <div
              className={`progress-bar-fill ${
                closedPercent === 100 ? "emerald" : closedPercent >= 50 ? "amber" : "rose"
              }`}
              style={{ width: `${closedPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Workflow Stepper */}
      <div className="glass-card-static" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <div className="stepper">
          {pkg.workflowStages.map((stage, i) => (
            <div key={stage.id} className="step">
              {i < pkg.workflowStages.length - 1 && (
                <div className={`step-connector ${stage.status === "completed" ? "completed" : ""}`} />
              )}
              <div
                className={`step-icon ${stage.status}`}
                title={stage.label}
              >
                {stage.status === "completed" ? (
                  <Check size={16} />
                ) : stage.status === "active" ? (
                  stage.order
                ) : stage.status === "overdue" ? (
                  "!"
                ) : (
                  stage.order
                )}
              </div>
              <span className={`step-label ${stage.status}`}>
                {stage.label}
              </span>
              {stage.status === "active" && stage.startedAt && (
                <span
                  style={{
                    fontSize: 10,
                    marginTop: 4,
                    color:
                      getSLAStatus(stage.startedAt, stage.slaHours) === "on_time"
                        ? "var(--accent-emerald)"
                        : getSLAStatus(stage.startedAt, stage.slaHours) === "warning"
                        ? "var(--accent-amber)"
                        : "var(--accent-rose)",
                    fontWeight: 600,
                  }}
                >
                  {Math.round(getElapsedHours(stage.startedAt))}h / {stage.slaHours}h
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--border-primary)",
          marginBottom: 20,
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${
                activeTab === tab.key ? "var(--accent-blue)" : "transparent"
              }`,
              color:
                activeTab === tab.key
                  ? "var(--accent-blue)"
                  : "var(--text-muted)",
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                style={{
                  background: "var(--accent-rose)",
                  color: "white",
                  padding: "1px 7px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "workflow" && (
        <WorkflowTab stages={pkg.workflowStages} />
      )}
      {activeTab === "comments" && (
        <CommentsTab
          pkg={pkg}
          user={user}
          onUpdate={reload}
        />
      )}
      {activeTab === "checklist" && (
        <ChecklistTab
          pkg={pkg}
          user={user}
          onUpdate={reload}
        />
      )}
      {activeTab === "documents" && (
        <DocumentsTab
          pkg={pkg}
          user={user}
          onUpdate={reload}
          setPreviewDoc={setPreviewDoc}
        />
      )}
    </div>

    {/* PDF Preview Modal - TOP LEVEL FULLSCREEN */}
    {previewDoc && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(10, 10, 10, 0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px",
          animation: "fade-in 0.2s ease-out"
        }}
        onClick={() => setPreviewDoc(null)}
      >
        <div
          className="glass-card-static"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 0,
            overflow: "hidden",
            boxShadow: "0 25px 70px -12px rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            animation: "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: "16px 24px",
              background: "white",
              borderBottom: "1px solid var(--border-primary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
               <div style={{ fontSize: 24 }}>📄</div>
               <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>{previewDoc.name}</h3>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{previewDoc.fileSize} · Diupload {formatDateTime(previewDoc.uploadedAt)}</p>
               </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPreviewDoc(null)}
              style={{ width: 32, height: 32, padding: 0 }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Preview Content */}
          <div style={{ flex: 1, background: "#f1f5f9", position: "relative" }}>
            {previewDoc.name.toLowerCase().endsWith(".pdf") ? (
              <iframe
                 src={previewDoc.url || "https://www.antennahouse.com/hubfs/pdf-samples/guidelines.pdf#toolbar=0"}
                 style={{ width: "100%", height: "100%", border: "none" }}
                 title="PDF Preview"
              />
            ) : (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                 <div style={{ width: 80, height: 80, borderRadius: 20, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <Download size={32} color="var(--accent-blue)" />
                 </div>
                 <div style={{ textAlign: "center" }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700 }}>Pratinjau tidak tersedia</h4>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                      File .xlsx / .xls harus didownload untuk dilihat secara lengkap.
                    </p>
                 </div>
                 <a href={previewDoc.url} download={previewDoc.name} className="btn btn-primary">
                    Unduh Berkas Sekarang
                 </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ============================================
// Workflow Tab
// ============================================
function WorkflowTab({ stages }: { stages: WorkflowStage[] }) {
  return (
    <div className="glass-card-static" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
        Detail Workflow Stages
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stages.map((stage) => {
          const roleConf = ROLE_CONFIG[stage.assignedRole];
          const slaStatus = stage.startedAt
            ? getSLAStatus(stage.startedAt, stage.slaHours)
            : "on_time";

          return (
            <div
              key={stage.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 12,
                background:
                  stage.status === "active"
                    ? "var(--accent-blue-dim)"
                    : "var(--bg-tertiary)",
                border: `1px solid ${
                  stage.status === "active"
                    ? "rgba(59,130,246,0.2)"
                    : "var(--border-primary)"
                }`,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    stage.status === "completed"
                      ? "var(--accent-emerald-dim)"
                      : stage.status === "active"
                      ? "var(--accent-blue-dim)"
                      : "var(--bg-secondary)",
                  color:
                    stage.status === "completed"
                      ? "var(--accent-emerald)"
                      : stage.status === "active"
                      ? "var(--accent-blue)"
                      : "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                {stage.status === "completed" ? (
                  <Check size={16} />
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {stage.order}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  PIC: <span style={{ color: roleConf.color }}>{roleConf.label}</span>{" "}
                  · SLA: {stage.slaHours}h
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {stage.status === "completed" && stage.completedAt && (
                  <div style={{ fontSize: 12, color: "var(--accent-emerald)" }}>
                    ✓ {formatDateTime(stage.completedAt)}
                  </div>
                )}
                {stage.status === "active" && (
                  <span
                    className={`badge ${
                      slaStatus === "on_time"
                        ? "badge-emerald"
                        : slaStatus === "warning"
                        ? "badge-amber"
                        : "badge-rose"
                    }`}
                    style={{ fontSize: 11 }}
                  >
                    {slaStatus === "on_time"
                      ? "On Time"
                      : slaStatus === "warning"
                      ? "Warning"
                      : "Overdue"}
                  </span>
                )}
                {stage.status === "pending" && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Pending
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Comments Tab
// ============================================
function CommentsTab({
  pkg,
  user,
  onUpdate,
}: {
  pkg: RTAPackage;
  user: User;
  onUpdate: () => void;
}) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(pkg.id, {
      packageId: pkg.id,
      author: user.id,
      authorName: user.name,
      authorRole: user.role,
      content: newComment,
      status: "open",
      createdAt: new Date().toISOString(),
    });
    addActivity({
      packageId: pkg.id,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "comment_added",
      details: `Komentar baru pada ${pkg.packageId}`,
    });
    setNewComment("");
    onUpdate();
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;
    addReply(pkg.id, commentId, {
      author: user.id,
      authorName: user.name,
      authorRole: user.role,
      content: replyText,
      createdAt: new Date().toISOString(),
    });
    setReplyTo(null);
    setReplyText("");
    onUpdate();
  };

  const handleStatusChange = (commentId: string, status: "resolved" | "closed") => {
    updateCommentStatus(pkg.id, commentId, status, user.id);
    onUpdate();
  };

  return (
    <div>
      {/* Add new comment */}
      {!pkg.isFrozen && (
        <div className="glass-card-static" style={{ padding: 20, marginBottom: 16 }}>
          <textarea
            className="input"
            placeholder="Tulis komentar review..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              style={{ opacity: newComment.trim() ? 1 : 0.4 }}
            >
              <Send size={14} /> Kirim Komentar
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pkg.comments.length === 0 ? (
          <div
            className="glass-card-static"
            style={{ padding: 40, textAlign: "center" }}
          >
            <MessageSquare
              size={36}
              style={{
                color: "var(--text-muted)",
                margin: "0 auto 12px",
                opacity: 0.3,
              }}
            />
            <p style={{ color: "var(--text-muted)" }}>
              Belum ada komentar pada paket ini.
            </p>
          </div>
        ) : (
          pkg.comments.map((comment) => {
            const roleConf = ROLE_CONFIG[comment.authorRole];
            return (
              <div
                key={comment.id}
                className="glass-card-static"
                style={{ padding: 18, transition: "all 0.2s" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${roleConf.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: roleConf.color,
                      }}
                    >
                      {comment.authorName
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {comment.authorName}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                        }}
                      >
                        {roleConf.label} · {timeAgo(comment.createdAt)}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      comment.status === "open"
                        ? "badge-amber"
                        : comment.status === "resolved"
                        ? "badge-blue"
                        : "badge-emerald"
                    }`}
                    style={{ fontSize: 11 }}
                  >
                    {comment.status === "open"
                      ? "Open"
                      : comment.status === "resolved"
                      ? "Resolved"
                      : "Closed"}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "var(--text-secondary)",
                    marginBottom: 12,
                  }}
                >
                  {comment.content}
                </p>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div
                    style={{
                      marginLeft: 20,
                      borderLeft: "2px solid var(--border-primary)",
                      paddingLeft: 16,
                      marginBottom: 12,
                    }}
                  >
                    {comment.replies.map((reply) => {
                      const replyRole = ROLE_CONFIG[reply.authorRole];
                      return (
                        <div key={reply.id} style={{ marginBottom: 10 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: replyRole.color,
                              }}
                            >
                              {reply.authorName}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                              }}
                            >
                              {timeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--text-secondary)",
                              lineHeight: 1.5,
                            }}
                          >
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Action buttons */}
                {!pkg.isFrozen && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {replyTo === comment.id ? (
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <input
                          className="input"
                          placeholder="Balas komentar..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          style={{ flex: 1 }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleReply(comment.id);
                          }}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReply(comment.id)}
                        >
                          <Send size={12} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setReplyTo(null);
                            setReplyText("");
                          }}
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setReplyTo(comment.id)}
                        >
                          💬 Balas
                        </button>
                        {comment.status === "open" && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              handleStatusChange(comment.id, "resolved")
                            }
                            style={{ color: "var(--accent-blue)" }}
                          >
                            ✓ Resolve
                          </button>
                        )}
                        {comment.status === "resolved" && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              handleStatusChange(comment.id, "closed")
                            }
                            style={{ color: "var(--accent-emerald)" }}
                          >
                            ✓ Close
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================
// Checklist Tab
// ============================================
function ChecklistTab({
  pkg,
  user,
  onUpdate,
}: {
  pkg: RTAPackage;
  user: User;
  onUpdate: () => void;
}) {
  const disciplines: Discipline[] = [
    "highway",
    "drainage",
    "structure",
    "geotechnical",
    "method",
  ];

  const [activeDiscipline, setActiveDiscipline] = useState<Discipline>(
    pkg.discipline
  );

  const items = getChecklistByDiscipline(activeDiscipline);
  const responses = pkg.checklistResponses.filter(
    (r) => r.discipline === activeDiscipline
  );
  const checkedCount = responses.filter((r) => r.isChecked).length;
  const progress =
    items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  const handleToggle = (item: ChecklistItem, checked: boolean, notes: string) => {
    saveChecklistResponse(pkg.id, {
      packageId: pkg.id,
      checklistItemId: item.id,
      discipline: item.discipline,
      isChecked: checked,
      notes,
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString(),
    });
    onUpdate();
  };

  return (
    <div>
      {/* Discipline Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {disciplines.map((d) => {
          const conf = DISCIPLINE_CONFIG[d];
          const isActive = activeDiscipline === d;
          const dItems = getChecklistByDiscipline(d);
          const dResponses = pkg.checklistResponses.filter(
            (r) => r.discipline === d && r.isChecked
          );
          const dProgress =
            dItems.length > 0
              ? Math.round((dResponses.length / dItems.length) * 100)
              : 0;

          return (
            <button
              key={d}
              onClick={() => setActiveDiscipline(d)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${
                  isActive ? conf.color : "var(--border-primary)"
                }`,
                background: isActive ? `${conf.color}15` : "var(--bg-tertiary)",
                color: isActive ? conf.color : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                transition: "all 0.2s",
              }}
            >
              {conf.emoji} {conf.label}
              <span
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                }}
              >
                {dProgress}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="glass-card-static" style={{ padding: "16px 20px", marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {DISCIPLINE_CONFIG[activeDiscipline].emoji}{" "}
            {DISCIPLINE_CONFIG[activeDiscipline].label} Checklist
          </span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {checkedCount}/{items.length} item
          </span>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div
            className={`progress-bar-fill ${
              progress === 100 ? "emerald" : progress >= 50 ? "blue" : "amber"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => {
          const response = responses.find(
            (r) => r.checklistItemId === item.id
          );
          const isChecked = response?.isChecked || false;

          return (
            <ChecklistItemCard
              key={item.id}
              item={item}
              isChecked={isChecked}
              notes={response?.notes || ""}
              disabled={pkg.isFrozen}
              onToggle={handleToggle}
            />
          );
        })}
      </div>
    </div>
  );
}

function ChecklistItemCard({
  item,
  isChecked,
  notes,
  disabled,
  onToggle,
}: {
  item: ChecklistItem;
  isChecked: boolean;
  notes: string;
  disabled: boolean;
  onToggle: (item: ChecklistItem, checked: boolean, notes: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);

  const severityColors = {
    critical: { bg: "var(--accent-rose-dim)", color: "var(--accent-rose)" },
    major: { bg: "var(--accent-amber-dim)", color: "var(--accent-amber)" },
    minor: { bg: "var(--accent-blue-dim)", color: "var(--accent-blue)" },
  };

  const sev = severityColors[item.severity];

  return (
    <div
      className="glass-card-static"
      style={{
        padding: "14px 18px",
        borderLeft: `3px solid ${isChecked ? "var(--accent-emerald)" : sev.color}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <button
          onClick={() => {
            if (!disabled) onToggle(item, !isChecked, localNotes);
          }}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: `2px solid ${
              isChecked ? "var(--accent-emerald)" : "var(--border-hover)"
            }`,
            background: isChecked
              ? "var(--accent-emerald)"
              : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: disabled ? "default" : "pointer",
            flexShrink: 0,
            marginTop: 1,
            transition: "all 0.2s",
          }}
        >
          {isChecked && <Check size={14} color="white" />}
        </button>

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
                fontSize: 14,
                fontWeight: 600,
                textDecoration: isChecked ? "line-through" : "none",
                opacity: isChecked ? 0.6 : 1,
              }}
            >
              {item.item}
            </span>
            <span
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 6,
                background: sev.bg,
                color: sev.color,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {item.severity}
            </span>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            {item.description}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: 4,
          }}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && !disabled && (
        <div style={{ marginTop: 12, marginLeft: 34 }}>
          <textarea
            className="input"
            placeholder="Catatan reviewer..."
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            style={{ minHeight: 60 }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onToggle(item, isChecked, localNotes)}
            >
              Simpan Catatan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Documents Tab
// ============================================
function DocumentsTab({
  pkg,
  user,
  onUpdate,
  setPreviewDoc,
}: {
  pkg: RTAPackage;
  user: User;
  onUpdate: () => void;
  setPreviewDoc: (doc: PackageDocument | null) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  
  const typeIcons: Record<string, string> = {
    drawing: "📐",
    specification: "📋",
    boq: "📊",
    pdf: "📄",
    excel: "📈",
  };

  const canUpload = !pkg.isFrozen; // Semua akun bisa upload dokumen referensi

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const type = file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls") ? "boq" : "specification";
        
        await addDocument(pkg.id, {
          name: file.name,
          type: type,
          version: pkg.currentVersion,
          uploadedBy: user.id,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          url: data.url, // Real URL from server
        });

        addActivity({
          packageId: pkg.id,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "document_uploaded",
          details: `Dokumen baru diupload: ${file.name}`,
        });

        onUpdate();
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card-static" style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>
          Dokumen ({pkg.documents.length})
        </h3>
        
        {canUpload && !pkg.isFrozen && (
          <div style={{ position: "relative" }}>
            <input
              type="file"
              id="file-upload"
              style={{ display: "none" }}
              accept=".pdf,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className="btn btn-primary btn-sm"
              style={{ cursor: "pointer", opacity: isUploading ? 0.6 : 1 }}
            >
              {isUploading ? (
                <>Memproses...</>
              ) : (
                <>Upload Dokumen (.pdf, .xlsx)</>
              )}
            </label>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pkg.documents.length === 0 ? (
           <div style={{ padding: "40px 0", textAlign: "center", border: "2px dashed var(--border-primary)", borderRadius: 12 }}>
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Belum ada dokumen pendukung.</p>
           </div>
        ) : (
          pkg.documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.4)",
                border: "1px solid var(--border-primary)",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                {typeIcons[doc.type] || "📄"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {doc.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  <span className="badge badge-neutral" style={{ fontSize: 10 }}>{doc.version}</span>
                  <span style={{ margin: "0 8px" }}>·</span>
                  <span>{doc.fileSize}</span>
                  <span style={{ margin: "0 8px" }}>·</span>
                  <span>{formatDateTime(doc.uploadedAt)}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: 32, height: 32, padding: 0 }}
                  title="Preview"
                  onClick={() => setPreviewDoc(doc)}
                >
                  <Eye size={14} />
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: 32, height: 32, padding: 0 }}
                  title="Download"
                >
                  {doc.url ? (
                     <a href={doc.url} download={doc.name} style={{ color: "inherit" }} onClick={e => e.stopPropagation()}>
                        <Download size={14} />
                     </a>
                  ) : (
                     <Download size={14} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



