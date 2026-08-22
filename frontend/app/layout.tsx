import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CDB - Controle de Doping",
  description: "Sistema de controle de doping esportivo",
  applicationName: "CDB",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PWARegister />

        {process.env.NODE_ENV === "development" && (
          <div className="sticky top-0 z-[9999] bg-yellow-400 px-4 py-2 text-center text-sm font-black text-slate-950 shadow-md">
            ⚠ AMBIENTE LOCAL / DESENVOLVIMENTO
          </div>
        )}

        {children}
      </body>
    </html>
  );
}
