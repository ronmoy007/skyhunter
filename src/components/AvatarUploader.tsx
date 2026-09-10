"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

// Resizes an image file to a square data URL, cropped to cover.
function resizeToDataUrl(file: File, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();
    reader.onload = () => {
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no canvas"));
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AvatarUploader({
  initialUrl,
  initials,
}: {
  initialUrl: string;
  initials: string;
}) {
  const router = useRouter();
  const { refresh } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(dataUrl: string) {
    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: dataUrl }),
    });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Upload failed.");
      return false;
    }
    setUrl(dataUrl);
    await refresh(); // update navbar avatar
    router.refresh(); // update completion meter
    return true;
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await resizeToDataUrl(file, 256);
      await save(dataUrl);
    } catch {
      setError("Couldn't process that image.");
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove() {
    setBusy(true);
    setError("");
    await save("");
    setUrl("");
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Your avatar"
            className="h-20 w-20 rounded-full object-cover ring-2 ring-steel-line"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-2xl font-semibold text-white">
            {initials}
          </span>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          className="hidden"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
          >
            {busy ? "Saving…" : url ? "Change photo" : "Upload photo"}
          </button>
          {url && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-lg border border-steel-line px-4 py-2 text-sm font-medium text-mist transition-colors hover:text-chrome disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-fog">JPG, PNG or WebP. Square looks best.</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
