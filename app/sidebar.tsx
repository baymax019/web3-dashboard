"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Library,
  CircleUserRound,
  LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

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

  const mobileNavItem = (href: string, label: string, Icon: any) => (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-3 text-xs font-medium transition ${
        pathname === href
          ? "bg-white/10 text-white"
          : "text-zinc-500"
      }`}
    >
      <Icon size={20} />
      {label}
    </Link>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-white/10 bg-[#080c13] p-6 md:block">
        <h1 className="mb-12 text-2xl font-bold text-white">
          Web3 Dashboard
        </h1>

        <nav className="space-y-3">
          {navItem("/", "Dashboard", Home)}
          {navItem("/library", "Project Library", Library)}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <CircleUserRound size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Abi</p>
              <p className="text-xs text-zinc-500">
                Private Dashboard
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#080c13]/95 px-3 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2">
          {mobileNavItem("/", "Dashboard", Home)}
          {mobileNavItem("/library", "Library", Library)}

          <button
            onClick={logout}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-3 text-xs font-medium text-red-400"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}