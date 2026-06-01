"use client";

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

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const getDaysActive = (joinDate: string) => {
    if (!joinDate) return 0;

    const startDate = new Date(joinDate);
    const today = new Date();

    const diffTime =
      today.getTime() - startDate.getTime();

    return Math.floor(
      diffTime / (1000 * 60 * 60 * 24)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running":
        return "bg-green-500/20 text-green-400";

      case "Pending":
        return "bg-yellow-500/20 text-yellow-400";

      case "Shutdown":
        return "bg-red-500/20 text-red-400";

      default:
        return "bg-zinc-500/20 text-zinc-400";
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">
        Project Library
      </h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600"
          >
            <div className="mb-5 flex h-24 items-center justify-center rounded-lg bg-zinc-800 text-3xl font-bold">
              {project.name.charAt(0)}
            </div>

            <h2 className="text-xl font-semibold">
              {project.name}
            </h2>

            <p className="mt-2 text-zinc-400">
              {project.category}
            </p>

            <div className="mt-4">
              <span
                className={`rounded-full px-3 py-1 text-sm ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              {getDaysActive(project.joinDate)} Days Active
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}