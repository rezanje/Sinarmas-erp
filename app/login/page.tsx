"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_USERS, setCurrentUser, initializeStore } from "@/lib/store";
import { ROLE_CONFIG, UserRole } from "@/lib/types";
import {
  Shield,
  HardHat,
  Calculator,
  LayoutDashboard,
  Users,
  FileCheck,
} from "lucide-react";

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  dept_head: <Shield size={24} />,
  td_pic: <FileCheck size={24} />,
  qs_pic: <Calculator size={24} />,
  construction_pic: <HardHat size={24} />,
  coordinator: <LayoutDashboard size={24} />,
  consultant: <Users size={24} />,
};

export default function LoginPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!selectedUser) return;
    setIsLoading(true);
    initializeStore();
    const user = DEMO_USERS.find((u) => u.id === selectedUser);
    if (user) {
      setCurrentUser(user);
      setTimeout(() => router.push("/dashboard"), 400);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(225,29,72,0.05) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(225,29,72,0.05) 0%, transparent 50%), var(--bg-primary)",
      }}
    >
      <div
        className="animate-fade-in"
        style={{ width: "100%", maxWidth: 520 }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Sinar_Mas_Land_Logo.png" 
            alt="Sinar Mas Land Logo" 
            style={{ height: 64, objectFit: "contain", margin: "0 auto 20px", display: "block" }} 
          />
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            <span className="gradient-text">Integrated RTA System</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            PT Trans Bumi Serbaraja — Sinarmas Land
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Single Source of Truth untuk Review Rencana Teknik Akhir
          </p>
        </div>

        {/* Role Selector */}
        <div className="glass-card-static" style={{ padding: 28 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 16,
            }}
          >
            Pilih Role Demo
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {DEMO_USERS.map((user) => {
              const config = ROLE_CONFIG[user.role];
              const isSelected = selectedUser === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `1.5px solid ${
                      isSelected ? config.color : "var(--border-primary)"
                    }`,
                    background: isSelected
                      ? `${config.color}15`
                      : "var(--bg-tertiary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    color: isSelected ? config.color : "var(--text-secondary)",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: isSelected
                        ? `${config.color}25`
                        : "var(--bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: isSelected
                        ? config.color
                        : "var(--text-muted)",
                    }}
                  >
                    {ROLE_ICONS[user.role]}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isSelected
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
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
                        color: isSelected
                          ? config.color
                          : "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {config.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleLogin}
            disabled={!selectedUser || isLoading}
            style={{
              width: "100%",
              marginTop: 20,
              padding: "14px 20px",
              fontSize: 15,
              opacity: !selectedUser ? 0.4 : 1,
              cursor: !selectedUser ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? (
              <>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                Memuat Dashboard...
              </>
            ) : (
              "Masuk ke Sistem →"
            )}
          </button>
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 24,
          }}
        >
          Demo Mode — Data disimpan di localStorage browser
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
