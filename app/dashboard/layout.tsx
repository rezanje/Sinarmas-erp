"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, setCurrentUser } from "@/lib/store";
import { User, ROLE_CONFIG } from "@/lib/types";
import {
  LayoutDashboard,
  Package,
  Activity,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { getNotifications, markNotificationAsRead, initializeStore } from "@/lib/store";
import { Notification } from "@/lib/types";
import { timeAgo as formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", id: "nav-dashboard" },
  { href: "/dashboard/packages", icon: Package, label: "Paket Dokumen", id: "nav-packages" },
  { href: "/dashboard/monitoring", icon: BarChart3, label: "SLA Monitoring", id: "nav-monitoring" },
  { href: "/dashboard/activity", icon: Activity, label: "Activity Log", id: "nav-activity" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeStore(); // Bawa data dari Supabase pas buka dashboard
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setMounted(true);
    }
    init();
  }, [router]);

  const handleLogout = () => {
    setCurrentUser(null);
    router.replace("/login");
  };

  if (!mounted || !user) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-primary)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid var(--border-primary)",
            borderTopColor: "var(--accent-blue)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const roleConfig = ROLE_CONFIG[user.role];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Sinar_Mas_Land_Logo.png" 
                alt="Sinar Mas Land"
                style={{ height: 32, objectFit: "contain" }}
              />
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  RTA System
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Trans Bumi Serbaraja
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
              className="mobile-close-btn"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: "12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                id={item.id}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div
          style={{
            padding: "16px 14px",
            borderTop: "1px solid var(--border-primary)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--bg-tertiary)",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: `${roleConfig.color}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color: roleConfig.color,
                flexShrink: 0,
              }}
            >
              {user.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: roleConfig.color,
                }}
              >
                {roleConfig.label}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="nav-link"
            style={{ width: "100%", color: "var(--accent-rose)" }}
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          marginLeft: "var(--sidebar-width)",
          minHeight: "100vh",
          transition: "margin 0.3s",
        }}
      >
        {/* Top Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            padding: "12px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: 4,
              }}
              className="mobile-menu-btn"
            >
              <Menu size={22} />
            </button>
            <div>
              <Breadcrumb pathname={pathname} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NotificationDropdown user={user} />
            <div
              className="badge"
              style={{
                background: `${roleConfig.color}15`,
                color: roleConfig.color,
                border: `1px solid ${roleConfig.color}30`,
              }}
            >
              {roleConfig.label}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "24px 28px 40px" }}>{children}</main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .mobile-close-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function NotificationDropdown({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const data = await getNotifications(user.id);
      setNotifications(data);
    };
    load();
    // Poll every 30 seconds for new notifications in this demo
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkRead = async (id: string, packageId?: string) => {
    // For now we just update locally as markNotificationAsRead is not yet fully async in DB
    // but the next refresh will sync it.
    markNotificationAsRead(id);
    const data = await getNotifications(user.id);
    setNotifications(data);
    if (packageId) {
      setIsOpen(false);
      router.push(`/dashboard/packages/${packageId}`);
    }
  };

  const handleMarkAllRead = async () => {
    notifications.forEach((n) => markNotificationAsRead(n.id));
    const data = await getNotifications(user.id);
    setNotifications(data);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={handleToggle}
        className="btn btn-ghost btn-sm"
        style={{ position: "relative", padding: "8px" }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent-rose)",
              boxShadow: "0 0 0 2px white",
            }}
          />
        )}
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="glass-card-static"
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 10,
              width: 320,
              maxHeight: 400,
              overflowY: "auto",
              zIndex: 101,
              padding: 0,
              animation: "slide-up 0.2s ease-out",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border-primary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.5)",
              }}
            >
              <h4 style={{ fontSize: 13, fontWeight: 700 }}>Notifikasi</h4>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    fontSize: 11,
                    color: "var(--accent-blue)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Baca Semua
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "32px 16px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <Clock size={24} style={{ opacity: 0.2, marginBottom: 8 }} />
                  <p style={{ fontSize: 13 }}>Belum ada pemberitahuan.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id, n.packageId)}
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid var(--border-primary)",
                      cursor: "pointer",
                      background: n.isRead ? "transparent" : "rgba(225, 29, 72, 0.03)",
                      transition: "background 0.2s",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.02)")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = n.isRead
                        ? "transparent"
                        : "rgba(225, 29, 72, 0.03)")
                    }
                  >
                    {!n.isRead && (
                      <div
                        style={{
                          position: "absolute",
                          left: 6,
                          top: "50%",
                          marginTop: -3,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--accent-rose)",
                        }}
                      />
                    )}
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: n.isRead ? 500 : 700,
                        marginBottom: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: n.isRead ? "var(--text-secondary)" : "var(--text-primary)",
                      }}
                    >
                      {n.title}
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      {n.message}
                    </p>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        marginTop: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Clock size={10} />
                      {formatTimeAgo(n.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);

  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    packages: "Paket Dokumen",
    monitoring: "SLA Monitoring",
    activity: "Activity Log",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "var(--text-muted)",
      }}
    >
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1;
        const label = labels[part] || part;
        return (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <ChevronRight size={14} />}
            <span
              style={{
                color: isLast ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: isLast ? 600 : 400,
              }}
            >
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
