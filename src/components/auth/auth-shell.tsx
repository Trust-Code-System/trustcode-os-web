"use client";

import { ArrowLeft, ArrowUpRight, AtSign, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { BrandLogo, BrandMark } from "@/components/brand/brand-logo";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useMotionPreference } from "@/lib/hooks/use-motion-preference";

export function AuthShell({ children }: { children: ReactNode }) {
  const [focused, setFocused] = useState<"email" | "password" | "none">("none");
  const [pulse, setPulse] = useState(0);
  const reduced = useMotionPreference();
  return <main id="main-content" className="auth-screen auth-reference" data-auth-focus={focused} onFocusCapture={(event) => { if (event.target instanceof HTMLInputElement) setFocused(event.target.type === "password" ? "password" : "email"); }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused("none"); }} onInputCapture={(event) => { if (event.target instanceof HTMLInputElement) setPulse((value) => value + 1); }}>
    <div className="auth-reference-frame">
      <aside className="auth-reference-story" aria-label="About TrustCode OS">
        <Link href="https://trustcodesystem.tech/" aria-label="TrustCode company website" className="auth-reference-logo"><BrandLogo /></Link>
        <div className="auth-contour-scene" aria-hidden>
          <svg viewBox="0 0 500 430" fill="none" className="auth-contours">{Array.from({ length: 23 }, (_, index) => <path key={index} d={`M ${-160 + index * 9} 450 C ${45 + index * 8} ${100 - index * 3}, ${420 - index * 5} ${450 + index * 3}, ${530 + index * 5} ${20 - index * 8}`} stroke="currentColor" strokeOpacity={.1 + index / 90} strokeWidth=".7" />)}</svg>
          <div className="auth-scene-orbit orbit-one" /><div className="auth-scene-orbit orbit-two" />
          <motion.div className="auth-scene-mark" animate={{ y: reduced ? 0 : focused === "none" ? 0 : -6, rotate: reduced ? 0 : focused === "email" ? -5 : 0 }} transition={{ type: "spring", stiffness: 160, damping: 23 }}><BrandMark className="size-16" /><span className="auth-scene-lock">{focused === "email" ? <AtSign size={14} /> : <LockKeyhole size={14} />}</span></motion.div>
          <motion.span key={pulse} className="auth-typing-ripple" initial={{ opacity: 0, scale: .8 }} animate={pulse && !reduced ? { opacity: [0, .45, 0], scale: [1, 1.65, 2] } : { opacity: 0, scale: 1 }} transition={{ duration: .55 }} />
          <span className="auth-scene-caption"><ShieldCheck size={12} />Your team’s secure workspace</span>
        </div>
        <div className="auth-reference-message"><h2>Software you can stake<br />your business on.</h2><p>Clients, projects, and the details in between.<br />A little clarity for the work ahead.</p><span>TRUSTCODE SYSTEM LIMITED</span></div>
      </aside>
      <section className="auth-reference-access" aria-label="Account access">
        <header className="auth-reference-toolbar"><Link href="https://trustcodesystem.tech/"><ArrowLeft aria-hidden size={12} />Home</Link><ThemeSwitcher /></header>
        <div className="auth-form-panel"><div className="auth-form-content"><div className="auth-mobile-brand"><BrandLogo /></div><span className="auth-kicker"><LockKeyhole aria-hidden size={12} />TRUSTCODE OS</span>{children}<div className="auth-input-activity" aria-hidden><span className={focused !== "none" ? "is-active" : ""} /><span>{focused === "password" ? "Your password stays private" : focused === "email" ? "Your work starts here" : "One secure place for your team"}</span></div></div><p className="auth-help">Need access? Open your email invitation or contact your workspace administrator.</p></div>
      </section>
    </div>
    <footer className="auth-footer"><span>© {new Date().getFullYear()} TrustCode System Limited</span><a href="mailto:hello@trustcodesystem.tech">Get in touch <ArrowUpRight aria-hidden size={11} /></a></footer>
  </main>;
}
