"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const login = async () => {
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (!data.session) {
        setErrorMessage("Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setErrorMessage("Unable to login right now. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-md flex-col justify-center">
        <Link
          href="/"
          className="mb-5 flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft size={16} />
          Portfolio
        </Link>

        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#080c13] sm:h-16 sm:w-16">
              <Lock className="text-blue-400" size={26} />
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Abi Web3 Dashboard
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Private admin access
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#080c13] py-4 pl-12 pr-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") login();
                }}
                className="w-full rounded-xl border border-white/10 bg-[#080c13] py-4 pl-12 pr-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            <button
              onClick={login}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-zinc-600">
          Public portfolio is view-only. Admin access is private.
        </p>
      </div>
    </div>
  );
}