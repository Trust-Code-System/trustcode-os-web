"use client";

import { AnimatePresence, motion, type MotionStyle } from "motion/react";
import { Check, LoaderCircle } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useMotionPreference } from "@/lib/hooks/use-motion-preference";

// Original adaptation of sucodee's Code Input and React Bits Code Slots.
// React Bits notice is retained at /licenses/react-bits.txt.
export type CodeInputStatus = "idle" | "checking" | "error" | "success";
type CodeInputProps = { value: string; onChange: (value: string) => void; onComplete?: (value: string) => void; status?: CodeInputStatus; length?: number; label?: string; disabled?: boolean; name?: string };

export function CodeInput({ value, onChange, onComplete, status = "idle", length = 6, label = "Verification code", disabled = false, name }: CodeInputProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState(0);
  const reduced = useMotionPreference();
  const clean = value.replace(/\D/g, "").slice(0, length);
  const busy = disabled || status === "checking" || status === "success";
  const selectSlot = (index: number) => {
    input.current?.focus();
    const position = Math.min(index, clean.length);
    input.current?.setSelectionRange(position, Math.min(position + 1, clean.length));
    setCursor(position);
  };
  return <div className="code-input-field">
    <span className="code-input-label" id={`${id}-label`}>{label}</span>
    <motion.div layout className="code-input-capsule" data-status={status} data-focused={focused} style={{ "--code-length": length } as MotionStyle} animate={status === "error" && !reduced ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }} transition={reduced ? { duration: 0 } : { duration: .32 }}>
      <input ref={input} className="code-input-native" type="text" name={name} value={clean} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={length} aria-labelledby={`${id}-label`} aria-describedby={`${id}-status`} aria-invalid={status === "error"} disabled={disabled} readOnly={status === "success" || status === "checking"} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onSelect={(event) => setCursor(event.currentTarget.selectionStart ?? clean.length)} onPaste={(event) => { if (busy) return; event.preventDefault(); const next = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length); onChange(next); setCursor(next.length); if (next.length === length && next !== clean) onComplete?.(next); }} onChange={(event) => {
        const next = event.target.value.replace(/\D/g, "").slice(0, length);
        const position = event.target.selectionStart ?? next.length;
        onChange(next);
        setCursor(position);
        if (next.length === length && next !== clean) onComplete?.(next);
      }} />
      <div className="code-input-slots" aria-hidden>{Array.from({ length }, (_, index) => <span className="code-input-slot" key={index} data-active={focused && Math.min(cursor, length - 1) === index && !busy} data-filled={Boolean(clean[index])} onPointerDown={(event) => { event.preventDefault(); if (!busy) selectSlot(index); }}>
        <AnimatePresence initial={false} mode="popLayout">{clean[index] ? <motion.span key={`${index}-${clean[index]}`} initial={{ opacity: 0, y: reduced ? 0 : 13, scale: reduced ? 1 : .75 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : -10 }} transition={{ type: "spring", stiffness: 400, damping: 27 }}>{clean[index]}</motion.span> : null}</AnimatePresence>
        {focused && Math.min(cursor, length - 1) === index && !clean[index] && !busy && <span className="code-input-caret" />}
      </span>)}</div>
      <AnimatePresence>{status === "checking" || status === "success" ? <motion.div className="code-input-result" initial={{ opacity: 0, scaleX: reduced ? 1 : .65 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0, scaleX: reduced ? 1 : .8 }} transition={{ type: "spring", stiffness: 240, damping: 25 }}>{status === "success" ? <><motion.span initial={{ scale: reduced ? 1 : .5 }} animate={{ scale: 1 }}><Check size={19} strokeWidth={2.5} /></motion.span>Verified</> : <><LoaderCircle className="code-input-loader" size={18} />Checking</>}</motion.div> : null}</AnimatePresence>
      {status === "success" && !reduced && <div className="code-input-confetti" aria-hidden>{Array.from({ length: 14 }, (_, index) => <motion.i key={index} initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }} animate={{ opacity: 0, x: Math.cos(index / 14 * Math.PI * 2) * (70 + index % 3 * 15), y: Math.sin(index / 14 * Math.PI * 2) * 65, rotate: index * 39 }} transition={{ duration: .8, ease: "easeOut", delay: .1 }} />)}</div>}
    </motion.div>
    <p className="code-input-status" id={`${id}-status`} aria-live="polite">{status === "error" ? "That code wasn’t accepted. Edit a digit or try again." : status === "success" ? "Code accepted." : status === "checking" ? "Checking the code…" : `${clean.length} of ${length} digits entered`}</p>
  </div>;
}
