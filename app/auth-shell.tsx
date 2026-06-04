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

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("SESSION ERROR:", error);
      }

      const hasSession = !!data.session;

      if (!hasSession && !isLoginPage) {
        setIsLoggedIn(false);
        setIsChecking(false);
        router.push("/login");
        return;
      }

      if (hasSession && isLoginPage) {
        setIsLoggedIn(true);
        setIsChecking(false);
        router.push("/");
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

      if (!hasSession && pathname !== "/login") {
        router.push("/login");
      }

      if (hasSession && pathname === "/login") {
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, isLoginPage]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b12] text-zinc-400">
        Checking session...
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#070b12]">
      <Sidebar />

      <main className="ml-64 min-h-screen flex-1 bg-[#070b12] p-10 text-white">
        {children}
      </main>
    </div>
  );
}