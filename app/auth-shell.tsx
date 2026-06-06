"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Sidebar from "./sidebar";

export default function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isLoginPage = pathname === "/login";
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("SESSION ERROR:", error);
      }

      const hasSession = !!data.session;

      // PUBLIC pages are always view-only and do NOT require login
      if (!isAdminPage && !isLoginPage) {
        setIsLoggedIn(hasSession);
        setIsChecking(false);
        return;
      }

      // LOGIN page: if already logged in, go to admin
      if (isLoginPage && hasSession) {
        setIsLoggedIn(true);
        setIsChecking(false);
        router.push("/admin");
        return;
      }

      // ADMIN pages: require login
      if (isAdminPage && !hasSession) {
        setIsLoggedIn(false);
        setIsChecking(false);
        router.push("/login");
        return;
      }

      setIsLoggedIn(hasSession);
      setIsChecking(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = !!session;

      setIsLoggedIn(hasSession);

      if (!hasSession && isAdminPage) {
        router.push("/login");
      }

      if (hasSession && isLoginPage) {
        router.push("/admin");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, isAdminPage, isLoginPage]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b12] px-6 text-center text-zinc-400">
        Checking session...
      </div>
    );
  }

  // Public pages: no sidebar, no login required
  if (!isAdminPage) {
    return <>{children}</>;
  }

  // Admin pages: must be logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#070b12]">
      <Sidebar />

      <main className="min-h-screen bg-[#070b12] px-4 py-6 pb-28 text-white sm:px-6 md:ml-64 md:p-10">
        {children}
      </main>
    </div>
  );
}