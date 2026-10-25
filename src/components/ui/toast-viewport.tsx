"use client";

import { useMotionPreference } from "@/lib/hooks/use-motion-preference";

// Adapted from React Bits SwipeToast; see docs/reactbits-micro-interactions.md.
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { IconButton } from "@/components/ui/button";
import { StatusMark, microSpring } from "@/components/ui/micro-motion";
import { subscribeToToasts, type ToastEvent } from "@/lib/feedback/toasts";

function SwipeNotification({ toast, dismiss }: { toast: ToastEvent; dismiss: (id: number) => void }) {
  const reduce = useMotionPreference();
  const drag = useDragControls();
  const fuse = useRef<HTMLSpanElement>(null);
  const timer = useRef<Animation | null>(null);
  const flags = useRef({ hover: false, focus: false, drag: false });
  const sync = useCallback(() => {
    const animation = timer.current;
    if (!animation) return;
    if (document.hidden || Object.values(flags.current).some(Boolean)) animation.pause();
    else if (animation.playState === "paused") animation.play();
  }, []);
  useEffect(() => {
    // Keep errors until dismissed, allowing time to read and recover.
    if (toast.tone === "error" || !fuse.current) return;
    const animation = fuse.current.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: 7000, easing: "linear", fill: "forwards" });
    timer.current = animation;
    animation.onfinish = () => dismiss(toast.id);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => { animation.onfinish = null; animation.cancel(); timer.current = null; document.removeEventListener("visibilitychange", sync); };
  }, [dismiss, sync, toast.id, toast.tone]);

  return <motion.article layout={!reduce} data-micro="swipe-toast" role={toast.tone === "error" ? "alert" : "status"}
    className="swipe-notification pointer-events-auto relative grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 overflow-hidden rounded-[var(--radius-lg)] border bg-surface-elevated p-4 shadow-[var(--shadow-2)]"
    initial={{ opacity: 0, y: reduce ? 0 : 32, scale: reduce ? 1 : 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduce ? 0 : 40, scale: reduce ? 1 : 0.96 }} transition={reduce ? { duration: 0 } : microSpring}
    drag={reduce ? false : "y"} dragControls={drag} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.08, bottom: 0.8 }} dragMomentum={false}
    onPointerDown={(event) => { if (event.button === 0 && !(event.target as HTMLElement).closest("button")) drag.start(event); }}
    onDragStart={() => { flags.current.drag = true; sync(); }}
    onDragEnd={(_, info) => { flags.current.drag = false; if (info.offset.y > 48 || (info.offset.y > 12 && info.velocity.y > 300)) dismiss(toast.id); else sync(); }}
    onPointerEnter={() => { flags.current.hover = true; sync(); }} onPointerLeave={() => { flags.current.hover = false; sync(); }}
    onFocusCapture={() => { flags.current.focus = true; sync(); }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { flags.current.focus = false; sync(); } }}
    onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); dismiss(toast.id); } }}>
    <span className={toast.tone === "success" ? "text-success" : "text-danger"}><StatusMark status={toast.tone === "success" ? "done" : "failed"} /></span>
    <div className="min-w-0"><p className="text-sm font-semibold">{toast.title}</p>{toast.message ? <p className="mt-1 text-xs leading-relaxed text-text-secondary">{toast.message}</p> : null}</div>
    <IconButton aria-label="Dismiss notification" size="sm" onClick={() => dismiss(toast.id)}><X aria-hidden className="size-4" /></IconButton>
    {toast.tone === "success" ? <span ref={fuse} aria-hidden className="toast-fuse absolute inset-x-0 bottom-0 h-0.5 origin-left bg-success" /> : null}
  </motion.article>;
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => subscribeToToasts((toast) => setToasts((current) => [...current, toast].slice(-4))), []);
  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  return <section aria-label="Notifications" className="pointer-events-none fixed inset-x-3 bottom-3 z-[100] grid max-h-[80dvh] justify-items-end gap-2 sm:left-auto sm:w-[24rem]"><AnimatePresence initial={false}>{toasts.map((toast) => <SwipeNotification key={toast.id} toast={toast} dismiss={dismiss} />)}</AnimatePresence></section>;
}
