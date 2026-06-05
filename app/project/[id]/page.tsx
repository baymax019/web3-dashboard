"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ExternalLink,
  CalendarDays,
  Activity,
  CheckCircle2,
  StickyNote,
  Trash2,
  Plus,
  CalendarCheck,
  FileText,
  RefreshCw,
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

type Note = {
  id: number;
  project_id: number;
  text: string;
  created_at: string;
};

type Task = {
  id: number;
  project_id: number;
  text: string;
  completed: boolean;
  created_at: string;
};

type Attendance = {
  id: number;
  project_id: number;
  check_date: string;
  checked_at: string;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [noteText, setNoteText] = useState("");
  const [taskText, setTaskText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDescription, setIsGeneratingDescription] =
    useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const fetchProjectData = async () => {
    setIsLoading(true);

    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    const { data: notesData } = await supabase
      .from("notes")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    const { data: attendanceData } = await supabase
      .from("attendances")
      .select("*")
      .eq("project_id", id)
      .order("checked_at", { ascending: false });

    setProject(projectData || null);
    setNotes(notesData || []);
    setTasks(tasksData || []);
    setAttendances(attendanceData || []);
    setIsLoading(false);
  };

  const recordAttendance = async () => {
    const today = getToday();

    const { error } = await supabase
      .from("attendances")
      .upsert(
        {
          project_id: id,
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

    await fetchProjectData();
  };

  const openProject = async () => {
    if (!project?.link) return;

    window.open(project.link, "_blank", "noopener,noreferrer");

    await recordAttendance();
  };

  const generateDescription = async () => {
    if (!project?.link || !project) return;

    setIsGeneratingDescription(true);

    try {
      const response = await fetch("/api/fetch-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: project.link,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.description) {
        alert(
          result.error ||
            "No description found from this website metadata."
        );
        setIsGeneratingDescription(false);
        return;
      }

      const { error } = await supabase
        .from("projects")
        .update({
          description: result.description,
        })
        .eq("id", id);

      if (error) {
        console.error(error);
        alert("Failed to save description to Supabase.");
        setIsGeneratingDescription(false);
        return;
      }

      setProject({
        ...project,
        description: result.description,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate description.");
    }

    setIsGeneratingDescription(false);
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

  const addNote = async () => {
    if (!noteText.trim()) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({
        project_id: id,
        text: noteText,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setNotes([data, ...notes]);
    setNoteText("");
  };

  const deleteNote = async (noteId: number) => {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      console.error(error);
      return;
    }

    setNotes(notes.filter((note) => note.id !== noteId));
  };

  const addTask = async () => {
    if (!taskText.trim()) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: id,
        text: taskText,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setTasks([...tasks, data]);
    setTaskText("");
  };

  const toggleTask = async (task: Task) => {
    const newCompleted = !task.completed;

    const { error } = await supabase
      .from("tasks")
      .update({ completed: newCompleted })
      .eq("id", task.id);

    if (error) {
      console.error(error);
      return;
    }

    setTasks(
      tasks.map((item) =>
        item.id === task.id
          ? { ...item, completed: newCompleted }
          : item
      )
    );
  };

  const deleteTask = async (taskId: number) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error(error);
      return;
    }

    setTasks(tasks.filter((task) => task.id !== taskId));
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

  const completedTasks = tasks.filter((task) => task.completed).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks / tasks.length) * 100);

  const today = getToday();

  const checkedToday = attendances.some(
    (attendance) => attendance.check_date === today
  );

  const lastCheckIn =
    attendances.length > 0 ? attendances[0].check_date : null;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-zinc-400">
        Loading Project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-zinc-400">
        Project not found.
      </div>
    );
  }

  const logoUrl = getLogoUrl(project.link);

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:mb-8 sm:p-8">
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
                  Project Detail
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                    project.status
                  )}`}
                >
                  {project.status || "Running"}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    checkedToday
                      ? "border-green-500/40 bg-green-500/10 text-green-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {checkedToday ? "Checked Today" : "Not Checked Today"}
                </span>
              </div>

              <h1 className="truncate text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {project.name}
              </h1>

              <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                {project.category || "Uncategorized"}
              </p>
            </div>
          </div>

          <button
            onClick={openProject}
            disabled={!project.link}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
          >
            <ExternalLink size={18} />
            Open Project & Check-in
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-6 lg:grid-cols-4">
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

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          <div className="flex items-center gap-2 text-zinc-500">
            <CalendarCheck size={17} />
            <p className="text-xs sm:text-sm">Check-ins</p>
          </div>

          <p className="mt-3 text-sm font-semibold text-green-400 sm:text-lg">
            {attendances.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          <div className="flex items-center gap-2 text-zinc-500">
            <CalendarCheck size={17} />
            <p className="text-xs sm:text-sm">Last Check-in</p>
          </div>

          <p className="mt-3 text-sm font-semibold text-white sm:text-lg">
            {lastCheckIn || "-"}
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-zinc-500">
              <FileText size={18} />
              <p className="text-sm">Project Description</p>
            </div>

            <button
              onClick={generateDescription}
              disabled={!project.link || isGeneratingDescription}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <RefreshCw
                size={14}
                className={
                  isGeneratingDescription ? "animate-spin" : ""
                }
              />
              {isGeneratingDescription
                ? "Generating..."
                : project.description
                ? "Refresh"
                : "Generate"}
            </button>
          </div>

          {project.description ? (
            <p className="text-sm leading-relaxed text-zinc-200 sm:text-base">
              {project.description}
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-zinc-500 sm:text-base">
              No description yet. Click Generate to fetch description from
              the project website.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-zinc-500">
            <ExternalLink size={18} />
            <p className="text-sm">Twitter / X</p>
          </div>

          <a
            href={project.twitter || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-base font-semibold text-blue-400 hover:text-blue-300 sm:text-lg"
          >
            Open Profile
          </a>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:mb-8 sm:p-8">
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400" size={24} />
              <h2 className="text-2xl font-bold text-white">
                Tasks
              </h2>
            </div>

            <p className="mt-1 text-sm text-zinc-400">
              Track project actions and campaign requirements
            </p>
          </div>

          <span className="text-sm text-zinc-400">
            {progress}% Complete
          </span>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-[#080c13]">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Add task..."
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
          />

          <button
            onClick={addTask}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-semibold text-white hover:bg-green-500 sm:w-auto"
          >
            <Plus size={18} />
            Add
          </button>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-[#080c13] p-5 text-zinc-500">
              No tasks yet.
            </p>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#080c13] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <label className="flex cursor-pointer items-start gap-3 sm:items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  className="mt-1 sm:mt-0"
                />

                <span
                  className={`text-sm sm:text-base ${
                    task.completed
                      ? "text-zinc-500 line-through"
                      : "text-white"
                  }`}
                >
                  {task.text}
                </span>
              </label>

              <button
                onClick={() => deleteTask(task.id)}
                className="flex w-fit items-center gap-2 text-sm text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <StickyNote className="text-blue-400" size={24} />

          <h2 className="text-2xl font-bold text-white">
            Project Notes
          </h2>
        </div>

        <p className="mt-1 text-sm text-zinc-400">
          Save progress, campaign info, rewards, or anything important
        </p>

        <textarea
          placeholder="Write your progress, completed tasks, campaign notes..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          className="mt-6 min-h-[130px] w-full rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
        />

        <button
          onClick={addNote}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-500 sm:w-auto"
        >
          <Plus size={18} />
          Add Note
        </button>

        <div className="mt-8 space-y-4">
          {notes.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-[#080c13] p-5 text-zinc-500">
              No notes yet.
            </p>
          )}

          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-white/10 bg-[#080c13] p-5"
            >
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-zinc-500">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>

                <button
                  onClick={() => deleteNote(note.id)}
                  className="flex w-fit items-center gap-2 text-sm text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200 sm:text-base">
                {note.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}