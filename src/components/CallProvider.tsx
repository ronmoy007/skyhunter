"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthProvider";
import { Ringer } from "@/lib/ringtone";

/*
  App-wide voice calling over WebRTC.

  Signaling rides on the same HTTP-polling model the rest of chat uses (there's
  no socket server): the caller's SDP offer and the callee's SDP answer are
  stored via /api/calls and discovered by polling /api/calls/poll. We use
  non-trickle ICE — each side waits for candidate gathering to finish and bundles
  the candidates into its SDP — so only two blobs are ever exchanged. Once the
  answer lands, audio flows browser-to-browser; nothing but signaling touches the
  server.

  STUN only (Google's public servers). That covers most networks; calls between
  two peers both behind symmetric NATs (no TURN relay) may fail to connect.
*/

type Phase = "idle" | "outgoing" | "incoming" | "active";

type PollCall = {
  id: string;
  conversationId: string;
  caller: string;
  callerName: string;
  callee: string;
  calleeName: string;
  status: "ringing" | "active" | "ended" | "declined" | "missed";
  offer: string | null;
  answer: string | null;
};

type CallContextValue = {
  phase: Phase;
  peerName: string;
  muted: boolean;
  seconds: number;
  startCall: (conversationId: string, peerName?: string) => void;
  accept: () => void;
  decline: () => void;
  hangup: () => void;
  toggleMute: () => void;
};

const CallContext = createContext<CallContextValue | null>(null);

const POLL_MS = 2000;
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

function createPeer(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: ICE_SERVERS });
}

// Resolve once ICE gathering has finished (or after a short timeout, so a slow
// STUN server can't stall call setup forever).
function waitForIce(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", done);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", done);
    setTimeout(resolve, 2000);
  });
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const me = (user?.email ?? "").toLowerCase();

  const [phase, setPhase] = useState<Phase>("idle");
  const [peerName, setPeerName] = useState("");
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [notice, setNotice] = useState("");

  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ringerRef = useRef<Ringer | null>(null);
  // The call we're actively part of (outgoing/active), with our role.
  const sessionRef = useRef<{
    id: string;
    role: "caller" | "callee";
    appliedRemote: boolean;
  } | null>(null);
  // A ringing call addressed to us that we haven't answered yet.
  const incomingRef = useRef<PollCall | null>(null);
  // Calls we've finished with, so a lingering poll result can't re-open them.
  const ignoredRef = useRef<Set<string>>(new Set());
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meRef = useRef(me);
  meRef.current = me;

  const ringer = useCallback((): Ringer => {
    if (!ringerRef.current) ringerRef.current = new Ringer();
    return ringerRef.current;
  }, []);

  const flashNotice = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3500);
  }, []);

  const stopDuration = useCallback(() => {
    if (durationRef.current) {
      clearInterval(durationRef.current);
      durationRef.current = null;
    }
  }, []);

  const startDuration = useCallback(() => {
    stopDuration();
    setSeconds(0);
    durationRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, [stopDuration]);

  const onTrack = useCallback((e: RTCTrackEvent) => {
    const audio = remoteAudioRef.current;
    if (audio && e.streams[0]) {
      audio.srcObject = e.streams[0];
      audio.play().catch(() => {});
    }
  }, []);

  // Tear everything down and return to idle. Doesn't post to the server — the
  // caller of this decides whether to notify the peer first.
  const cleanup = useCallback(() => {
    ringer().stop();
    stopDuration();
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {
        /* already closed */
      }
      pcRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    sessionRef.current = null;
    incomingRef.current = null;
    setMuted(false);
    setSeconds(0);
    setPeerName("");
    setPhase("idle");
  }, [ringer, stopDuration]);

  const getMic = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      streamRef.current = stream;
      return stream;
    } catch {
      return null;
    }
  }, []);

  // --- outgoing --------------------------------------------------------------
  const startCall = useCallback(
    async (conversationId: string, name?: string) => {
      if (phase !== "idle" || !meRef.current) return;
      const stream = await getMic();
      if (!stream) {
        flashNotice("Microphone access is needed to make a call.");
        return;
      }
      const pc = createPeer();
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.ontrack = onTrack;
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") {
          flashNotice("Call connection failed.");
          hangupRef.current();
        }
      };

      let offer: RTCSessionDescriptionInit;
      try {
        offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await waitForIce(pc);
      } catch {
        cleanup();
        flashNotice("Could not start the call.");
        return;
      }

      let res: { ok?: boolean; callId?: string; calleeName?: string; error?: string };
      try {
        res = await fetch("/api/calls/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            offer: pc.localDescription,
          }),
        }).then((r) => r.json());
      } catch {
        cleanup();
        flashNotice("Could not reach the server.");
        return;
      }
      if (!res.ok || !res.callId) {
        cleanup();
        flashNotice(res.error || "Could not start the call.");
        return;
      }

      sessionRef.current = { id: res.callId, role: "caller", appliedRemote: false };
      setPeerName(res.calleeName || name || "Member");
      setPhase("outgoing");
      ringer().start();
    },
    [phase, getMic, onTrack, cleanup, flashNotice, ringer],
  );

  // --- incoming --------------------------------------------------------------
  const accept = useCallback(async () => {
    const call = incomingRef.current;
    if (!call || !call.offer) return;
    ringer().stop();
    const stream = await getMic();
    if (!stream) {
      // Can't take the call without a mic — decline it so the caller isn't left
      // ringing.
      declineRef.current();
      flashNotice("Microphone access is needed to answer.");
      return;
    }
    const pc = createPeer();
    pcRef.current = pc;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.ontrack = onTrack;
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") {
        flashNotice("Call connection failed.");
        hangupRef.current();
      }
    };

    try {
      await pc.setRemoteDescription(JSON.parse(call.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await waitForIce(pc);
      const res = await fetch(`/api/calls/${call.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "answer", answer: pc.localDescription }),
      }).then((r) => r.json());
      if (!res.ok) throw new Error(res.error || "answer failed");
    } catch {
      cleanup();
      flashNotice("Could not answer the call.");
      return;
    }

    sessionRef.current = { id: call.id, role: "callee", appliedRemote: true };
    incomingRef.current = null;
    setPeerName(call.callerName || "Member");
    setPhase("active");
    startDuration();
  }, [ringer, getMic, onTrack, cleanup, flashNotice, startDuration]);

  const decline = useCallback(() => {
    const call = incomingRef.current;
    ringer().stop();
    if (call) {
      ignoredRef.current.add(call.id);
      fetch(`/api/calls/${call.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hangup", reason: "declined" }),
      }).catch(() => {});
    }
    cleanup();
  }, [ringer, cleanup]);

  const hangup = useCallback(() => {
    const s = sessionRef.current;
    if (s) {
      ignoredRef.current.add(s.id);
      fetch(`/api/calls/${s.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hangup", reason: "ended" }),
      }).catch(() => {});
    }
    cleanup();
  }, [cleanup]);

  // Stable refs so the pc event handlers above can reach the latest callbacks
  // without being recreated (and re-attached) on every render.
  const hangupRef = useRef(hangup);
  hangupRef.current = hangup;
  const declineRef = useRef(decline);
  declineRef.current = decline;

  const toggleMute = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    setMuted((m) => {
      const next = !m;
      stream.getAudioTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  }, []);

  // --- the poll loop: drives ringing + tracks the peer's state ---------------
  useEffect(() => {
    if (!me) {
      cleanup();
      return;
    }
    let alive = true;

    const poll = async () => {
      let call: PollCall | null = null;
      try {
        const r = await fetch("/api/calls/poll", { cache: "no-store" }).then(
          (x) => x.json(),
        );
        if (!r.ok) return;
        call = r.call;
      } catch {
        return;
      }
      if (!alive) return;

      const s = sessionRef.current;
      if (s) {
        // We're in a call. Watch for the answer (caller) and for the peer
        // hanging up.
        if (!call || call.id !== s.id) return;
        if (call.status === "active") {
          if (s.role === "caller" && !s.appliedRemote && call.answer) {
            try {
              await pcRef.current?.setRemoteDescription(JSON.parse(call.answer));
              s.appliedRemote = true;
              ringer().stop();
              setPhase("active");
              startDuration();
            } catch {
              /* next poll retries */
            }
          }
        } else if (
          call.status === "ended" ||
          call.status === "declined" ||
          call.status === "missed"
        ) {
          ignoredRef.current.add(call.id);
          flashNotice(
            call.status === "missed" || call.status === "declined"
              ? "No answer."
              : "Call ended.",
          );
          cleanup();
        }
        return;
      }

      // Not in a call yet — look for an incoming ring for us.
      if (
        call &&
        call.status === "ringing" &&
        call.callee === meRef.current &&
        !ignoredRef.current.has(call.id)
      ) {
        if (incomingRef.current?.id === call.id) return; // already ringing
        incomingRef.current = call;
        setPeerName(call.callerName || "Member");
        setPhase("incoming");
        ringer().start();
        return;
      }

      // We were showing an incoming ring but the caller gave up / canceled.
      if (
        incomingRef.current &&
        (!call ||
          call.id !== incomingRef.current.id ||
          call.status !== "ringing")
      ) {
        ringer().stop();
        incomingRef.current = null;
        setPhase("idle");
      }
    };

    poll();
    const t = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  // Tidy up media on unmount.
  useEffect(() => cleanup, [cleanup]);

  const value: CallContextValue = {
    phase,
    peerName,
    muted,
    seconds,
    startCall,
    accept,
    decline,
    hangup,
    toggleMute,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      {/* Remote audio sink — hidden, always mounted so ontrack has a target. */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
      <CallOverlay
        phase={phase}
        peerName={peerName}
        muted={muted}
        seconds={seconds}
        notice={notice}
        onAccept={accept}
        onDecline={decline}
        onHangup={hangup}
        onToggleMute={toggleMute}
      />
    </CallContext.Provider>
  );
}

export function useCall(): CallContextValue {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
}

// ---- UI --------------------------------------------------------------------

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.1 2.2z" />
    </svg>
  );
}

function CallOverlay({
  phase,
  peerName,
  muted,
  seconds,
  notice,
  onAccept,
  onDecline,
  onHangup,
  onToggleMute,
}: {
  phase: Phase;
  peerName: string;
  muted: boolean;
  seconds: number;
  notice: string;
  onAccept: () => void;
  onDecline: () => void;
  onHangup: () => void;
  onToggleMute: () => void;
}) {
  const initial = (peerName || "?").slice(0, 1).toUpperCase();

  // Incoming call: a centered ringing card with Accept / Decline.
  if (phase === "incoming") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-steel-line bg-abyss p-6 text-center shadow-2xl">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-500 text-2xl font-semibold text-white ring-4 ring-violet-500/30">
            <span className="absolute inset-0 inline-flex animate-ping rounded-full bg-violet-500/30" />
            <span className="relative">{initial}</span>
          </div>
          <p className="mt-4 text-lg font-semibold text-chrome">{peerName}</p>
          <p className="mt-1 text-sm text-fog">Incoming voice call…</p>
          <div className="mt-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={onDecline}
              className="flex flex-col items-center gap-1.5 text-fog transition-colors hover:text-chrome"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-105">
                <PhoneIcon className="h-6 w-6 rotate-[135deg]" />
              </span>
              <span className="text-xs">Decline</span>
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="flex flex-col items-center gap-1.5 text-fog transition-colors hover:text-chrome"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform hover:scale-105">
                <PhoneIcon className="h-6 w-6" />
              </span>
              <span className="text-xs">Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Outgoing or active: a compact floating panel.
  if (phase === "outgoing" || phase === "active") {
    const active = phase === "active";
    return (
      <div className="fixed bottom-4 right-4 z-[100] w-72 rounded-2xl border border-steel-line bg-abyss p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500 text-lg font-semibold text-white">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-chrome">{peerName}</p>
            <p className="text-xs text-fog">
              {active ? (
                <span className="text-emerald-400">{fmt(seconds)}</span>
              ) : (
                <span className="animate-pulse">Ringing…</span>
              )}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4">
          {active && (
            <button
              type="button"
              onClick={onToggleMute}
              title={muted ? "Unmute" : "Mute"}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                muted
                  ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
                  : "border-steel-line text-fog hover:text-chrome"
              }`}
            >
              {muted ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 3l18 18" strokeLinecap="round" />
                  <path d="M9 9v3a3 3 0 004.5 2.6M15 12V6a3 3 0 00-5.9-.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 11a5 5 0 01-.6 2.4M12 19v2M8 21h8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z" strokeLinejoin="round" />
                  <path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onHangup}
            title="Hang up"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-105"
          >
            <PhoneIcon className="h-5 w-5 rotate-[135deg]" />
          </button>
        </div>
      </div>
    );
  }

  // Idle: only the transient "Call ended / No answer" notice, if any.
  if (notice) {
    return (
      <div className="fixed bottom-4 right-4 z-[100] rounded-xl border border-steel-line bg-abyss px-4 py-2.5 text-sm text-fog shadow-xl">
        {notice}
      </div>
    );
  }
  return null;
}
