"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ExternalLink,
  CalendarDays,
  Activity,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

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

export default function PublicProjectDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("public_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }

    setProject(data || null);
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b12] px-6 text-center text-zinc-400">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b12] px-6 text-center text-zinc-400">
        Project not found.
      </div>
    );
  }

  const logoUrl = getLogoUrl(project.link);
  const domain = getDomain(project.link);

  return (
    <div className="min-h-screen bg-[#070b12] px-4 py-6 text-white sm:px-6 lg:px-10">
      <header className="mx-auto mb-10 flex max-w-5xl items-center justify-between gap-4">
        <Link
          href="/library"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.08]"
        >
          <ArrowLeft size={16} />
          Library
        </Link>

        <Link href="/" className="text-sm font-semibold text-zinc-400 hover:text-white">
          Abi Web3 Portfolio
        </Link>
      </header>

      <main className="mx-auto max-w-5xl">
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:mb-8 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-[#080c13] sm:h-24 sm:w-24">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={project.name}
                    className="h-14 w-14 rounded-2xl object-cover sm:h-16 sm:w-16"
                  />
                ) : (
                  <span className="text-3xl font-bold text-blue-400 sm:text-4xl">
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                    Public Project
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                      project.status
                    )}`}
                  >
                    {project.status || "Running"}
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {project.name}
                </h1>

                <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                  {project.category || "Uncategorized"}
                </p>
              </div>
            </div>

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-semibold text-black hover:bg-zinc-200 lg:w-auto"
              >
                <ExternalLink size={18} />
                Visit Project
              </a>
            )}
          </div>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
            <div className="flex items-center gap-2 text-zinc-500">
              <CalendarDays size={17} />
              <p className="text-xs sm:text-sm">Join Date</p>
            </div>

            <p className="mt-3 text-sm font-semibold text-white sm:text-lg">
              {project.join_date || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
            <div className="flex items-center gap-2 text-zinc-500">
              <Activity size={17} />
              <p className="text-xs sm:text-sm">Days Active</p>
            </div>

            <p className="mt-3 text-sm font-semibold text-blue-400 sm:text-lg">
              {getDaysActive(project.join_date)} days
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6 lg:col-span-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <ExternalLink size={17} />
              <p className="text-xs sm:text-sm">Website</p>
            </div>

            <p className="mt-3 truncate text-sm font-semibold text-white sm:text-lg">
              {domain || "-"}
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:mb-8 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-zinc-500">
            <FileText size={18} />
            <p className="text-sm">Project Description</p>
          </div>

          <p className="text-sm leading-relaxed text-zinc-200 sm:text-base">
            {project.description ||
              "No public description available for this project yet."}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-500/50 hover:bg-white/[0.07]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Website</p>
                  <p className="mt-2 font-semibold text-blue-400">
                    Visit official project
                  </p>
                </div>

                <ExternalLink className="text-zinc-500" size={20} />
              </div>
            </a>
          )}

          {project.twitter && (
            <a
              href={project.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-500/50 hover:bg-white/[0.07]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Twitter / X</p>
                  <p className="mt-2 font-semibold text-blue-400">
                    Open profile
                  </p>
                </div>

                <ExternalLink className="text-zinc-500" size={20} />
              </div>
            </a>
          )}
        </section>
      </main>
    </div>
  );
}