import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Abi Web3 Dashboard",
  description: "Personal Web3 Project Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-zinc-950 text-white">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r border-zinc-800 p-6">
            <h1 className="mb-10 text-xl font-bold">
              Web3 Dashboard
            </h1>

            <nav className="space-y-2">
              <Link
                href="/"
                className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
              >
                Dashboard
              </Link>

              <Link
                href="/library"
                className="block rounded-lg px-4 py-3 hover:bg-zinc-800"
              >
                Project Library
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}