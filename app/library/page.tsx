"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Project = {
  id: number;
  name: string;
  link: string;
  twitter: string;
  joinDate: string;
  category: string;
  status: string;
};

export default function LibraryPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) setProjects(JSON.parse(savedProjects));
  }, []);

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  };

  const getLogoUrl = (url: string) => {
    const domain = getDomain(url);
    if (!domain) return "";

    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };

  const getDaysActive = (joinDate: string) => {
    if (!joinDate) return 0;

    const startDate = new Date(joinDate);
    const today = new Date();

    return Math.floor(
      (today.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const getStatusStyle = (status: string) => {
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
    <div className="min-h-screen bg-[#070b12] text-white">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Project Library</h1>
        <p className="mt-2 text-zinc-400">Browse all your Web3 projects</p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <p className="text-zinc-400">
            No projects yet. Add your first project from Dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const logoUrl = getLogoUrl(project.link);

            return (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-white/[0.07]"
              >
                <div className="mb-6 flex h-32 items-center justify-center rounded-2xl border border-white/10 bg-[#080c13]">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={project.name}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-blue-400">
                      {project.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {project.name}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                      {project.category || "Uncategorized"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${getStatusStyle(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="text-sm text-zinc-400">Days Active</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {getDaysActive(project.joinDate)} days
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}