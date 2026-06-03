"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, CircleUserRound } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItem = (href: string, label: string, Icon: any) => (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
        pathname === href
          ? "bg-white/10 text-white"
          : "text-zinc-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-[#080c13] p-6">
      <h1 className="mb-12 text-2xl font-bold text-white">
        Web3 Dashboard
      </h1>

      <nav className="space-y-3">
        {navItem("/", "Dashboard", Home)}
        {navItem("/library", "Project Library", Library)}
      </nav>

      <div className="absolute bottom-6 left-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <CircleUserRound size={20} />
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Abi</p>
          <p className="text-xs text-zinc-500">Web3 Builder</p>
        </div>
      </div>
    </aside>
  );
}