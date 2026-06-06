"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Activity,
  ArrowUpRight,
  Home,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type Project = {
  id: number;
  name: string;
  link: string | null;
  twitter: string | null;
  join_date: string | null;
  category: string | null;
  status: string | null;
  description: string | null;
};

export default function PublicLibraryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }

    setProjects(data || []);
    setIsLoading(false);
  };

  const getDomain = (url: string | null) => {
    if (!url) return "";

    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  };

  const getLogoUrl = (url: string | null) => {
    const domain = getDomain(url);
    if (!domain) return "";

    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };

  const getDaysActive = (joinDate: string | null) => {
    if (!joinDate) return 0;

    const startDate = new Date(joinDate);
    const today = new Date();

    return Math.floor(
      (today.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const getStatusStyle = (status: string | null) => {
    switch (status) {
      case "Running":
        return "border-green-500/40 bg-green-500/10 text-green-400";
      case "Pending":
        return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
      case "Shutdown":
        return "border-red-500/40 bg-red-500/10 text-red-400";
      default:
        return "border-zinc-700 bg-zinc-800 text-zinc-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] px-4 py-6 text-white sm:px-6 lg:px-10">
      <header className="mx-auto mb-10 flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold sm:text-2xl">
          Abi Web3 Portfolio
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.08]"
        >
          <Home size={16} />
          Home
        </Link>
      </header>

      <main className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Project Library
          </h1>

          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Public view-only archive of Web3 projects.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-zinc-400">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-zinc-400">No public projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const logoUrl = getLogoUrl(project.link);

              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-white/[0.07] sm:p-6"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#080c13] sm:h-20 sm:w-20">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={project.name}
                            className="h-11 w-11 rounded-xl object-cover sm:h-14 sm:w-14"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-blue-400">
                            {project.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold text-white">
                          {project.name}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                          {project.category || "Uncategorized"}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight
                      size={20}
                      className="shrink-0 text-zinc-500 transition group-hover:text-blue-400"
                    />
                  </div>

                  <div className="mb-5">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${getStatusStyle(
                        project.status
                      )}`}
                    >
                      {project.status || "Running"}
                    </span>
                  </div>

                  <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                    {project.description ||
                      "No public description available yet."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    <div className="rounded-xl border border-white/10 bg-[#080c13] p-3">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <CalendarDays size={15} />
                        <p className="text-xs">Join Date</p>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-white">
                        {project.join_date || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#080c13] p-3">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Activity size={15} />
                        <p className="text-xs">Active</p>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-blue-400">
                        {getDaysActive(project.join_date)} days
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}