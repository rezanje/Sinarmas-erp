import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Integrated RTA System | PT Trans Bumi Serbaraja",
  description:
    "Platform kolaborasi digital untuk review Rencana Teknik Akhir (RTA) jalan tol. Single Source of Truth dengan SLA monitoring dan workflow terpadu.",
  keywords: [
    "RTA",
    "Rencana Teknik Akhir",
    "Jalan Tol",
    "Sinarmas Land",
    "Trans Bumi Serbaraja",
    "Review Desain",
    "Konstruksi",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
