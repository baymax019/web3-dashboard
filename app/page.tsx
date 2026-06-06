"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Briefcase,
  PlayCircle,
  Clock,
  Power,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";

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

export default function PublicDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("public_projects")
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
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
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

  const totalProjects = projects.length;
  const runningProjects = projects.filter((p) => p.status === "Running").length;
  const pendingProjects = projects.filter((p) => p.status === "Pending").length;
  const shutdownProjects = projects.filter(
    (p) => p.status === "Shutdown"
  ).length;

  const statCards = [
    {
      label: "Total Projects",
      value: totalProjects,
      color: "text-blue-400",
      border: "border-blue-500/50",
      icon: Briefcase,
    },
    {
      label: "Running",
      value: runningProjects,
      color: "text-green-400",
      border: "border-green-500/50",
      icon: PlayCircle,
    },
    {
      label: "Pending",
      value: pendingProjects,
      color: "text-yellow-400",
      border: "border-yellow-500/50",
      icon: Clock,
    },
    {
      label: "Shutdown",
      value: shutdownProjects,
      color: "text-red-400",
      border: "border-red-500/50",
      icon: Power,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] px-4 py-5 text-white sm:px-6 sm:py-6 lg:px-10">
      <header className="mx-auto mb-8 flex max-w-7xl items-center justify-between gap-3 sm:mb-10">
        <Link href="/" className="text-lg font-bold sm:text-2xl">
          Abi Web3 Portfolio
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/library"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.08] sm:px-4 sm:text-sm"
          >
            Library
          </Link>

          <Link
            href="/admin"
            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-zinc-200 sm:px-4 sm:text-sm"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:mb-10 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300 sm:text-sm">
                <ShieldCheck size={16} />
                Public View Only
              </div>

              <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
                Web3 Projects I&apos;m Tracking & Building Around
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                A public portfolio view of Web3 projects, campaigns, and
                ecosystems I have worked on or actively tracked.
              </p>
            </div>

            <Link
              href="/library"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-semibold text-black hover:bg-zinc-200 sm:w-fit"
            >
              View Library
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:mb-10 sm:gap-4 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className={`rounded-2xl border ${card.border} bg-white/[0.04] p-4 sm:p-6`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-zinc-400 sm:text-sm">
                    {card.label}
                  </p>
                  <Icon className={card.color} size={22} />
                </div>

                <h2
                  className={`mt-4 text-3xl font-bold sm:text-4xl ${card.color}`}
                >
                  {card.value}
                </h2>
              </div>
            );
          })}
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Featured Projects</h2>
            <p className="mt-1 text-sm text-zinc-400">
              View-only snapshot of current project activity.
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-zinc-400">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-zinc-400">
              No public projects yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.slice(0, 6).map((project) => {
                const logoUrl = getLogoUrl(project.link);

                return (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-white/[0.07]"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#080c13]">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={project.name}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-blue-400">
                              {project.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-white">
                            {project.name}
                          </h3>

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

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${getStatusStyle(
                          project.status
                        )}`}
                      >
                        {project.status || "Running"}
                      </span>

                      <span className="rounded-full border border-white/10 bg-[#080c13] px-3 py-1 text-xs text-zinc-400">
                        {getDaysActive(project.join_date)} days
                      </span>
                    </div>

                    <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">
                      {project.description ||
                        "No public description available yet."}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}