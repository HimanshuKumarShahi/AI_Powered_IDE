import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexusIDE — Local AI-Powered Developer Workstation",
  description:
    "A fully offline-capable, AI-powered IDE with dual Gemini/Llama AI, Monaco Editor, local code execution via Judge0, and native Git integration.",
  keywords: [
    "IDE", "AI IDE", "Monaco Editor", "Gemini", "Llama", "Judge0",
    "Local AI", "Code Editor", "NexusIDE",
  ],
  authors: [{ name: "NexusIDE" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Force dark mode — NexusIDE is dark-only by design
      className={`${geistSans.variable} ${geistMono.variable} dark h-full`}
    >
      <body className="h-full overflow-hidden bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
