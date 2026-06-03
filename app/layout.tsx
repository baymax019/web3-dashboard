import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abi Web3 Dashboard",
  description: "Web3 Project Tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-[#070b12] text-white">
        <div className="flex min-h-screen bg-[#070b12]">
          <Sidebar />

          <main className="ml-64 min-h-screen flex-1 bg-[#070b12] p-10 text-white">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}