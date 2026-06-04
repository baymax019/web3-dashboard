"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  PlayCircle,
  Clock,
  Power,
  Plus,
  Trash2,
  Info,
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
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [projectName, setProjectName] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [projectTwitter, setProjectTwitter] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [projectStatus, setProjectStatus] = useState("Running");

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

  const addProject = async () => {
    if (!projectName.trim()) return;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: projectName,
        link: projectLink,
        twitter: projectTwitter,
        join_date: joinDate || null,
        category: projectCategory,
        status: projectStatus,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProjects([data, ...projects]);

    setProjectName("");
    setProjectLink("");
    setProjectTwitter("");
    setJoinDate("");
    setProjectCategory("");
    setProjectStatus("Running");
    setShowForm(false);
  };

  const deleteProject = async (id: number) => {
    const confirmDelete = window.confirm(
      "Delete this project?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setProjects(
      projects.filter((project) => project.id !== id)
    );
  };

  const updateStatus = async (
    id: number,
    status: string
  ) => {
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setProjects(
      projects.map((project) =>
        project.id === id
          ? { ...project, status }
          : project
      )
    );
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
    if (!joinDate) return "-";

    const start = new Date(joinDate);
    const today = new Date();

    return Math.floor(
      (today.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const statusStyle = (status: string | null) => {
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
  const runningProjects = projects.filter(
    (p) => p.status === "Running"
  ).length;
  const pendingProjects = projects.filter(
    (p) => p.status === "Pending"
  ).length;
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
    <div className="min-h-screen bg-[#070b12] text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-400">
            Manage your Web3 projects
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className={`rounded-2xl border ${card.border} bg-white/[0.04] p-6`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">
                  {card.label}
                </p>
                <Icon className={card.color} size={24} />
              </div>

              <h2
                className={`mt-4 text-4xl font-bold ${card.color}`}
              >
                {card.value}
              </h2>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="mb-10 rounded-2xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="mb-6 text-2xl font-bold">
            Add Project
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            <input
              placeholder="Project Name"
              value={projectName}
              onChange={(e) =>
                setProjectName(e.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
            />

            <input
              placeholder="Project Link"
              value={projectLink}
              onChange={(e) =>
                setProjectLink(e.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
            />

            <input
              placeholder="Twitter / X Link"
              value={projectTwitter}
              onChange={(e) =>
                setProjectTwitter(e.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
            />

            <input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none focus:border-blue-500"
            />

            <input
              placeholder="Category"
              value={projectCategory}
              onChange={(e) =>
                setProjectCategory(e.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
            />

            <select
              value={projectStatus}
              onChange={(e) =>
                setProjectStatus(e.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none focus:border-blue-500"
            >
              <option>Running</option>
              <option>Pending</option>
              <option>Shutdown</option>
            </select>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={addProject}
              className="rounded-xl bg-green-600 px-5 py-3 font-semibold hover:bg-green-500"
            >
              Save Project
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-white/10 px-5 py-3 font-semibold hover:bg-white/15"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/[0.04]">
            <tr>
              <th className="p-5 text-left text-sm text-zinc-400">
                Project
              </th>
              <th className="p-5 text-left text-sm text-zinc-400">
                Category
              </th>
              <th className="p-5 text-left text-sm text-zinc-400">
                Status
              </th>
              <th className="p-5 text-left text-sm text-zinc-400">
                Days Active
              </th>
              <th className="p-5 text-left text-sm text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-zinc-500"
                >
                  Loading projects...
                </td>
              </tr>
            )}

            {!isLoading && projects.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-zinc-500"
                >
                  No projects yet. Add your first Web3 project.
                </td>
              </tr>
            )}

            {projects.map((project) => {
              const logoUrl = getLogoUrl(project.link);

              return (
                <tr
                  key={project.id}
                  className="border-b border-white/10 last:border-none"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={project.name}
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 font-bold text-blue-400">
                          {project.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <span className="font-semibold">
                        {project.name}
                      </span>
                    </div>
                  </td>

                  <td className="p-5 text-zinc-300">
                    {project.category || "-"}
                  </td>

                  <td className="p-5">
                    <select
                      value={project.status || "Running"}
                      onChange={(e) =>
                        updateStatus(
                          project.id,
                          e.target.value
                        )
                      }
                      className={`rounded-xl border px-4 py-2 outline-none ${statusStyle(
                        project.status
                      )}`}
                    >
                      <option>Running</option>
                      <option>Pending</option>
                      <option>Shutdown</option>
                    </select>
                  </td>

                  <td className="p-5 text-zinc-300">
                    {getDaysActive(project.join_date)} days
                  </td>

                  <td className="p-5">
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 text-sm text-blue-200">
        <Info size={18} />
        <span>
          This dashboard is now connected to Supabase.
        </span>
      </div>
    </div>
  );
}