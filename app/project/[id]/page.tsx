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

export default function ProjectDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [noteText, setNoteText] = useState("");
  const [taskText, setTaskText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

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

    setProject(projectData || null);
    setNotes(notesData || []);
    setTasks(tasksData || []);
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

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-zinc-400">
        Loading Project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-zinc-400">
        Project not found.
      </div>
    );
  }

  const logoUrl = getLogoUrl(project.link);

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <div className="mb-10">
        <p className="text-sm text-zinc-500">Project Detail</p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          {project.name}
        </h1>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/10 bg-[#080c13]">
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

            <div>
              <h2 className="text-4xl font-bold text-white">
                {project.name}
              </h2>

              <p className="mt-2 text-zinc-400">
                {project.category || "Uncategorized"}
              </p>

              <div className="mt-4">
                <span
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${getStatusStyle(
                    project.status
                  )}`}
                >
                  {project.status || "Running"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-[#080c13] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">Days Active</p>
                <Activity size={20} className="text-blue-400" />
              </div>

              <h3 className="mt-2 text-3xl font-bold text-blue-400">
                {getDaysActive(project.join_date)}
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#080c13] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">Tasks Done</p>
                <CheckCircle2 size={20} className="text-green-400" />
              </div>

              <h3 className="mt-2 text-3xl font-bold text-green-400">
                {completedTasks}/{tasks.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-2 text-zinc-500">
            <CalendarDays size={18} />
            <p className="text-sm">Join Date</p>
          </div>

          <p className="mt-3 text-lg font-semibold text-white">
            {project.join_date || "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-2 text-zinc-500">
            <ExternalLink size={18} />
            <p className="text-sm">Website</p>
          </div>

          <a
            href={project.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-lg font-semibold text-blue-400 hover:text-blue-300"
          >
            Open Website
          </a>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-2 text-zinc-500">
            <ExternalLink size={18} />
            <p className="text-sm">Twitter / X</p>
          </div>

          <a
            href={project.twitter || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-lg font-semibold text-blue-400 hover:text-blue-300"
          >
            Open Profile
          </a>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <div className="mb-6 flex items-center justify-between">
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

        <div className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Add task..."
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-[#080c13] p-4 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
          />

          <button
            onClick={addTask}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 font-semibold text-white hover:bg-green-500"
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
              className="flex items-center justify-between rounded-xl border border-white/10 bg-[#080c13] p-4"
            >
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                />

                <span
                  className={
                    task.completed
                      ? "text-zinc-500 line-through"
                      : "text-white"
                  }
                >
                  {task.text}
                </span>
              </label>

              <button
                onClick={() => deleteTask(task.id)}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
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
          className="mt-4 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-500"
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
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-zinc-500">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>

                <button
                  onClick={() => deleteNote(note.id)}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>

              <p className="whitespace-pre-wrap text-zinc-200">
                {note.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}