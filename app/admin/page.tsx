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
  ExternalLink,
  CalendarCheck,
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
};

type Attendance = {
  id: number;
  project_id: number;
  check_date: string;
  checked_at: string;
};

type AttendanceSummary = {
  total: number;
  lastCheckIn: string | null;
  checkedToday: boolean;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<number, AttendanceSummary>
  >({});
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

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

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
    await fetchAttendances();
    setIsLoading(false);
  };

  const fetchAttendances = async () => {
    const { data, error } = await supabase
      .from("attendances")
      .select("*")
      .order("checked_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const today = getToday();
    const summary: Record<number, AttendanceSummary> = {};

    (data || []).forEach((attendance: Attendance) => {
      if (!summary[attendance.project_id]) {
        summary[attendance.project_id] = {
          total: 0,
          lastCheckIn: null,
          checkedToday: false,
        };
      }

      summary[attendance.project_id].total += 1;

      if (!summary[attendance.project_id].lastCheckIn) {
        summary[attendance.project_id].lastCheckIn =
          attendance.check_date;
      }

      if (attendance.check_date === today) {
        summary[attendance.project_id].checkedToday = true;
      }
    });

    setAttendanceMap(summary);
  };

  const recordAttendance = async (projectId: number) => {
    const today = getToday();

    const { error } = await supabase
      .from("attendances")
      .upsert(
        {
          project_id: projectId,
          check_date: today,
          checked_at: new Date().toISOString(),
        },
        {
          onConflict: "project_id,check_date",
        }
      );

    if (error) {
      console.error(error);
      return;
    }

    await fetchAttendances();
  };

  const openProject = async (project: Project) => {
    if (!project.link) return;

    window.open(project.link, "_blank", "noopener,noreferrer");

    await recordAttendance(project.id);
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
    const confirmDelete = window.confirm("Delete this project?");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setProjects(projects.filter((project) => project.id !== id));
    await fetchAttendances();
  };

  const updateStatus = async (id: number, status: string) => {
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
        project.id === id ? { ...project, status } : project
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

  const attendanceStyle = (checkedToday: boolean) => {
    return checkedToday
      ? "border-green-500/40 bg-green-500/10 text-green-400"
      : "border-zinc-700 bg-zinc-800 text-zinc-400";
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
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Manage your Web3 projects
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200 sm:w-auto"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className={`rounded-2xl border ${card.border} bg-white/[0.04] p-4 sm:p-6`}
            >
              <div className="flex items-center justify-between">
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
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
          <h2 className="mb-6 text-2xl font-bold">
            Add Project
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
            />

            <input
              placeholder="Project Link"
              value={projectLink}
              onChange={(e) => setProjectLink(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
            />

            <input
              placeholder="Twitter / X Link"
              value={projectTwitter}
              onChange={(e) => setProjectTwitter(e.target.value)}
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
              onChange={(e) => setProjectCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
            />

            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none focus:border-blue-500"
            >
              <option>Running</option>
              <option>Pending</option>
              <option>Shutdown</option>
            </select>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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

      {/* Mobile Project Cards */}
      <div className="space-y-4 md:hidden">
        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-zinc-500">
            Loading projects...
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-zinc-500">
            No projects yet. Add your first Web3 project.
          </div>
        )}

        {projects.map((project) => {
          const logoUrl = getLogoUrl(project.link);
          const attendance = attendanceMap[project.id];
          const checkedToday = attendance?.checkedToday || false;

          return (
            <div
              key={project.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="mb-5 flex items-start gap-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={project.name}
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 font-bold text-blue-400">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-white">
                    {project.name}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {project.category || "-"}
                  </p>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-[#080c13] p-3">
                  <p className="text-xs text-zinc-500">Days</p>
                  <p className="mt-1 font-semibold text-white">
                    {getDaysActive(project.join_date)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#080c13] p-3">
                  <p className="text-xs text-zinc-500">Check-ins</p>
                  <p className="mt-1 font-semibold text-green-400">
                    {attendance?.total || 0}
                  </p>
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                <select
                  value={project.status || "Running"}
                  onChange={(e) =>
                    updateStatus(project.id, e.target.value)
                  }
                  className={`rounded-xl border px-3 py-2 text-sm outline-none ${statusStyle(
                    project.status
                  )}`}
                >
                  <option>Running</option>
                  <option>Pending</option>
                  <option>Shutdown</option>
                </select>

                <span
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${attendanceStyle(
                    checkedToday
                  )}`}
                >
                  <CalendarCheck size={15} />
                  {checkedToday ? "Checked" : "Not Today"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openProject(project)}
                  disabled={!project.link}
                  className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-400 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ExternalLink size={16} />
                  Open
                </button>

                <button
                  onClick={() => deleteProject(project.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] md:block">
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
                Attendance
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
                  colSpan={6}
                  className="p-10 text-center text-zinc-500"
                >
                  Loading projects...
                </td>
              </tr>
            )}

            {!isLoading && projects.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-zinc-500"
                >
                  No projects yet. Add your first Web3 project.
                </td>
              </tr>
            )}

            {projects.map((project) => {
              const logoUrl = getLogoUrl(project.link);
              const attendance = attendanceMap[project.id];
              const checkedToday =
                attendance?.checkedToday || false;

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
                          {project.name.charAt(0).toUpperCase()}
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
                        updateStatus(project.id, e.target.value)
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
                    <div className="flex flex-col gap-2">
                      <span
                        className={`inline-flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-sm ${attendanceStyle(
                          checkedToday
                        )}`}
                      >
                        <CalendarCheck size={15} />
                        {checkedToday ? "Checked Today" : "Not Today"}
                      </span>

                      <span className="text-xs text-zinc-500">
                        Total: {attendance?.total || 0}
                      </span>
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openProject(project)}
                        disabled={!project.link}
                        className="flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-blue-400 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ExternalLink size={16} />
                        Open
                      </button>

                      <button
                        onClick={() => deleteProject(project.id)}
                        className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-200 sm:p-5">
        <Info size={18} className="mt-0.5 shrink-0" />
        <span>
          Click Open to visit a project and automatically record today&apos;s
          attendance.
        </span>
      </div>
    </div>
  );
}