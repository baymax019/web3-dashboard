"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Wifi } from "lucide-react";
import { supabase } from "../../lib/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [debugMessage, setDebugMessage] = useState("");

  const testConnection = async () => {
    setDebugMessage("");
    setErrorMessage("");
    setIsTesting(true);

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/projects?select=id&limit=1`, {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();

        setDebugMessage(
          `Database test failed. Status: ${response.status}. Response: ${text}`
        );

        setIsTesting(false);
        return;
      }

      setDebugMessage(
        "Database connection OK. Supabase URL and key are readable."
      );
    } catch (error) {
      console.error("CONNECTION TEST ERROR:", error);

      setDebugMessage(
        "Connection test failed. Browser cannot reach Supabase. Check .env.local URL/key, internet, VPN, adblock, or browser extension."
      );
    }

    setIsTesting(false);
  };

  const login = async () => {
    setErrorMessage("");
    setDebugMessage("");

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
        setErrorMessage("Login failed. No session returned.");
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("LOGIN FETCH ERROR:", error);

      setErrorMessage(
        "Failed to fetch Supabase Auth. Database may work, but Auth request is blocked or misconfigured."
      );

      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b12] px-6 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#080c13]">
            <Lock className="text-blue-400" size={28} />
          </div>

          <h1 className="text-3xl font-bold">
            Abi Web3 Dashboard
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Login to access your private tracker
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-[#080c13] p-4 text-xs text-zinc-400">
          <p className="mb-2 font-semibold text-zinc-300">
            ENV Check
          </p>

          <p>
            URL:{" "}
            <span className="text-blue-300">
              {supabaseUrl || "MISSING"}
            </span>
          </p>

          <p className="mt-1">
            KEY:{" "}
            <span className="text-blue-300">
              {supabaseKey
                ? `${supabaseKey.slice(0, 12)}...${supabaseKey.slice(-6)}`
                : "MISSING"}
            </span>
          </p>

          <button
            onClick={testConnection}
            disabled={isTesting}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 font-semibold text-blue-300 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isTesting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Wifi size={16} />
            )}

            {isTesting ? "Testing..." : "Test Supabase Connection"}
          </button>

          {debugMessage && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-zinc-300">
              {debugMessage}
            </div>
          )}
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
                if (event.key === "Enter") {
                  login();
                }
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
            {isLoading && (
              <Loader2 size={18} className="animate-spin" />
            )}

            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}