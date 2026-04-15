"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import type { AssetType } from "@/lib/channel";
import {
  createAssetAction,
  publishAssetAction,
  type CreateAssetInput,
} from "./actions";

interface StudentOption {
  id: string;
  name: string;
}

type Privacy = "keep_private" | "request_consent";
type Stage = "idle" | "creating" | "uploading" | "publishing" | "done" | "error";

const TYPES: { value: AssetType; label: string }[] = [
  { value: "monologue", label: "Monologue" },
  { value: "scene", label: "Scene" },
  { value: "showcase", label: "Showcase" },
  { value: "catalog", label: "Catalog" },
];

const RUBRIC_KEYS = ["diction", "presence", "emotion", "technique"] as const;
type RubricKey = (typeof RUBRIC_KEYS)[number];

function muxUpload(
  url: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Mux upload failed: ${xhr.status} ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.send(file);
  });
}

export function UploadForm({ students }: { students: StudentOption[] }) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [type, setType] = useState<AssetType>("monologue");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("keep_private");
  const [rubric, setRubric] = useState<Record<RubricKey, number>>({
    diction: 70,
    presence: 70,
    emotion: 70,
    technique: 70,
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setMessage("Please pick a video file.");
      return;
    }
    setFile(f);
    setMessage(null);
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  };

  const reset = () => {
    setFile(null);
    setTitle("");
    setNote("");
    setProgress(0);
    setStage("idle");
    setMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please pick a video file first.");
      return;
    }
    if (!title.trim()) {
      setMessage("Title is required.");
      return;
    }
    if (!studentId) {
      setMessage("Select a student.");
      return;
    }
    setMessage(null);
    setStage("creating");

    const payload: CreateAssetInput = {
      student_id: studentId,
      type,
      title: title.trim(),
      note: note.trim() || undefined,
      rubric,
    };

    const created = await createAssetAction(payload);
    if (!created.ok || !created.data) {
      setStage("error");
      setMessage(created.error ?? "Failed to create asset.");
      return;
    }
    const { asset_id, mux_upload_url } = created.data;

    setStage("uploading");
    try {
      await muxUpload(mux_upload_url, file, setProgress);
    } catch (err) {
      setStage("error");
      setMessage((err as Error).message);
      return;
    }

    if (privacy === "request_consent") {
      setStage("publishing");
      const pub = await publishAssetAction(asset_id);
      if (!pub.ok) {
        setStage("error");
        setMessage(pub.error ?? "Upload complete, but consent request failed.");
        return;
      }
    }

    setStage("done");
    setMessage(
      privacy === "request_consent"
        ? "Uploaded. Parent consent email queued."
        : "Uploaded. Kept private."
    );
  };

  const busy = stage === "creating" || stage === "uploading" || stage === "publishing";

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-5 gap-6">
      {/* Drop zone */}
      <div className="lg:col-span-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          aria-label="Drop video file or click to browse"
          className={`h-[420px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-10 cursor-pointer transition-colors ${
            dragging
              ? "border-[#E8C872] bg-[#E8C872]/5"
              : "border-[#2A2A36] bg-[#15151C] hover:border-[#E8C872]/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="space-y-3 w-full max-w-md">
              <div className="text-[10px] tracking-[0.28em] text-[#E8C872] uppercase">
                Selected
              </div>
              <div className="serif text-xl font-bold break-words">{file.name}</div>
              <div className="text-xs text-[#8A8A96]">
                {(file.size / (1024 * 1024)).toFixed(1)} MB · {file.type || "video"}
              </div>
              {progress > 0 && (
                <div className="pt-4">
                  <div className="h-2 bg-[#0B0B0F] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#E8C872] transition-[width]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-[#8A8A96] font-mono">
                    {progress}%{" "}
                    {stage === "uploading"
                      ? "uploading to Mux"
                      : stage === "publishing"
                        ? "requesting consent"
                        : stage === "done"
                          ? "done"
                          : ""}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div
                className="w-16 h-16 rounded-full grid place-items-center mb-4"
                style={{
                  background:
                    "radial-gradient(circle, rgba(232,200,114,0.25), transparent 70%)",
                }}
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#E8C872" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 16V4M6 10l6-6 6 6M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="serif text-xl font-bold">Drop a video here</div>
              <div className="text-sm text-[#8A8A96] mt-1">or click to browse (MP4, MOV)</div>
            </>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="student" className="text-xs uppercase tracking-[0.2em] text-[#8A8A96]">
              Student
            </label>
            <select
              id="student"
              name="student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="h-12 bg-[#15151C] border border-[#2A2A36] rounded-lg px-3 text-[#F5F5F7] focus:outline-none focus:border-[#E8C872]/70"
              disabled={busy}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="type" className="text-xs uppercase tracking-[0.2em] text-[#8A8A96]">Type</label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
              className="h-12 bg-[#15151C] border border-[#2A2A36] rounded-lg px-3 text-[#F5F5F7] focus:outline-none focus:border-[#E8C872]/70"
              disabled={busy}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <Input
            name="title"
            label="Title"
            placeholder="e.g. Hamlet — Act III Soliloquy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="note" className="text-xs uppercase tracking-[0.2em] text-[#8A8A96]">
              Instructor note (private)
            </label>
            <textarea
              id="note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What to focus on in the next class"
              className="bg-[#15151C] border border-[#2A2A36] rounded-lg px-3 py-2 text-[#F5F5F7] focus:outline-none focus:border-[#E8C872]/70 resize-y"
              disabled={busy}
            />
          </div>
        </div>

        <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-5 space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-[#8A8A96] mb-2">Rubric</div>
          {RUBRIC_KEYS.map((k) => (
            <div key={k}>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor={`rubric-${k}`} className="text-[#C9C9D1] capitalize">{k}</label>
                <span className="text-[#E8C872] font-mono">{rubric[k]}</span>
              </div>
              <input
                id={`rubric-${k}`}
                type="range"
                min={0}
                max={100}
                value={rubric[k]}
                onChange={(e) =>
                  setRubric((r) => ({ ...r, [k]: Number(e.target.value) }))
                }
                disabled={busy}
                className="w-full accent-[#E8C872]"
              />
            </div>
          ))}
        </div>

        <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-[#8A8A96] mb-3">Privacy</div>
          <div className="space-y-2">
            {(
              [
                { v: "keep_private", label: "Keep private", desc: "Only instructors can view." },
                { v: "request_consent", label: "Request parent consent", desc: "Email parent a signed link; publish when signed." },
              ] as const
            ).map((o) => (
              <label
                key={o.v}
                className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  privacy === o.v
                    ? "border-[#E8C872] bg-[#E8C872]/5"
                    : "border-[#2A2A36] hover:border-[#E8C872]/30"
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  className="mt-1 accent-[#E8C872]"
                  checked={privacy === o.v}
                  onChange={() => setPrivacy(o.v)}
                  disabled={busy}
                />
                <div>
                  <div className="text-sm font-medium text-white">{o.label}</div>
                  <div className="text-xs text-[#8A8A96]">{o.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {message && (
          <div
            role="status"
            className={`text-sm p-3 rounded-lg border ${
              stage === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-300"
                : stage === "done"
                  ? "border-[#E8C872]/40 bg-[#E8C872]/10 text-[#E8C872]"
                  : "border-[#2A2A36] bg-[#15151C] text-[#C9C9D1]"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={busy || !file}>
            {stage === "creating"
              ? "Creating…"
              : stage === "uploading"
                ? `Uploading ${progress}%`
                : stage === "publishing"
                  ? "Requesting consent…"
                  : "Upload video"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={reset} disabled={busy}>
            Reset
          </Button>
        </div>
      </div>
    </form>
  );
}
