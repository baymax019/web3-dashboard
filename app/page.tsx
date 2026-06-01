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

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [projectTwitter, setProjectTwitter] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [projectStatus, setProjectStatus] = useState("Running");

  useEffect(() => {
    const savedProjects = localStorage.getItem("projects");

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects, isLoaded]);

  const addProject = () => {
    if (!projectName) return;

    const newProject: Project = {
      id: Date.now(),
      name: projectName,
      link: projectLink,
      twitter: projectTwitter,
      joinDate,
      category: projectCategory,
      status: projectStatus,
    };

    setProjects([...projects, newProject]);

    setProjectName("");
    setProjectLink("");
    setProjectTwitter("");
    setJoinDate("");
    setProjectCategory("");
    setProjectStatus("Running");

    setShowForm(false);
  };

  const deleteProject = (id: number) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const getDaysActive = (joinDate: string) => {
    if (!joinDate) return "-";

    const startDate = new Date(joinDate);
    const today = new Date();

    const diffTime = today.getTime() - startDate.getTime();

    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-zinc-400">
            Manage your Web3 projects
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-white px-4 py-2 text-black"
        >
          + Add Project
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Add Project
          </h2>

          <input
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          />

          <input
            type="text"
            placeholder="Project Link"
            value={projectLink}
            onChange={(e) => setProjectLink(e.target.value)}
            className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          />

          <input
            type="text"
            placeholder="Twitter / X Link"
            value={projectTwitter}
            onChange={(e) => setProjectTwitter(e.target.value)}
            className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          />

          <input
            type="date"
            value={joinDate}
            onChange={(e) => setJoinDate(e.target.value)}
            className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          />

          <input
            type="text"
            placeholder="Category"
            value={projectCategory}
            onChange={(e) => setProjectCategory(e.target.value)}
            className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          />

          <select
            value={projectStatus}
            onChange={(e) => setProjectStatus(e.target.value)}
            className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          >
            <option>Running</option>
            <option>Pending</option>
            <option>Shutdown</option>
          </select>

          <div className="flex gap-3">
            <button
              onClick={addProject}
              className="rounded-lg bg-green-600 px-4 py-2"
            >
              Save
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg bg-zinc-700 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full">
          <thead className="bg-zinc-900">
            <tr>
              <th className="p-4 text-left">Project</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Days Active</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-t border-zinc-800"
              >
                <td className="p-4">{project.name}</td>

                <td className="p-4">{project.category}</td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </td>

                <td className="p-4">
                  {getDaysActive(project.joinDate)} days
                </td>

                <td className="p-4">
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="rounded-lg bg-red-500/20 px-3 py-1 text-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}