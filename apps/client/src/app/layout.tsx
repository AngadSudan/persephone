import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/General/(Color Manager)/ThemeController";
import { Toaster } from "react-hot-toast";
import PWARegister from "@/components/General/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Persephone",
  description: "Developer centric hiring platform",
  manifest: "/manifest.json",
  themeColor: "#000000",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192x192.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-color-mode="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <PWARegister />

        {/* 🔔 Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0f0f0f",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "monospace",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#0f0f0f",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#0f0f0f",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
