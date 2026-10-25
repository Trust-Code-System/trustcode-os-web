"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { advanceSidebar, sidebarGeometry } from "./sidebar-spring";

export function useFoldingSidebar() {
  const frameRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [folded, setFolded] = useState(false);
  const state = useRef({ position: 0, velocity: 0, target: 0, raf: 0, last: 0, reduced: false });
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const ignoreClick = useRef(false);

  const paint = useCallback(() => {
    const root = frameRef.current;
    if (!root) return;
    const geometry = sidebarGeometry(state.current.position);
    root.style.setProperty("--sidebar-space", `${geometry.space.toFixed(2)}px`);
    root.style.setProperty("--sidebar-angle", `${geometry.angle.toFixed(2)}deg`);
    root.style.setProperty("--sidebar-blur", `${(geometry.lift * 7).toFixed(2)}px`);
    root.style.setProperty("--sidebar-lift", geometry.lift.toFixed(3));
    root.dataset.sidebarProgress = geometry.fold.toFixed(4);
    root.dataset.sidebarState = geometry.fold < 0.001 ? "open" : geometry.fold > 0.999 ? "folded" : "folding";
  }, []);

  const animate = useCallback(() => {
    const model = state.current;
    cancelAnimationFrame(model.raf);
    if (model.reduced) {
      model.position = model.target;
      model.velocity = 0;
      model.raf = 0;
      paint();
      return;
    }
    model.last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min((now - model.last) / 1000, 0.064);
      model.last = now;
      const next = advanceSidebar(model.position, model.velocity, model.target, delta);
      model.position = next.position;
      model.velocity = next.velocity;
      if (Math.abs(model.position - model.target) < 0.0004 && Math.abs(model.velocity) < 0.004) {
        model.position = model.target;
        model.velocity = 0;
        model.raf = 0;
        paint();
      } else {
        paint();
        model.raf = requestAnimationFrame(tick);
      }
    };
    model.raf = requestAnimationFrame(tick);
  }, [paint]);

  const request = useCallback((close: boolean) => {
    if (close && frameRef.current?.querySelector("aside")?.contains(document.activeElement)) toggleRef.current?.focus();
    state.current.target = close ? 1 : 0;
    setFolded(close);
    animate();
  }, [animate]);
  const toggle = useCallback(() => request(state.current.target === 0), [request]);

  useEffect(() => {
    const model = state.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      model.reduced = preference.matches;
      if (model.reduced) animate();
    };
    update();
    paint();
    preference.addEventListener("change", update);
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target;
      const editing = target instanceof HTMLElement && (target.isContentEditable || Boolean(target.closest("input,textarea,select")));
      if (!editing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b" && window.matchMedia("(min-width: 1024px)").matches) {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", keyboard);
    return () => {
      cancelAnimationFrame(model.raf);
      preference.removeEventListener("change", update);
      window.removeEventListener("keydown", keyboard);
    };
  }, [animate, paint, toggle]);

  const handleProps = {
    onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
      if (event.button !== 0) return;
      ignoreClick.current = false;
      drag.current = { x: event.clientX, start: state.current.position, moved: false };
      cancelAnimationFrame(state.current.raf);
      state.current.raf = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
      const gesture = drag.current;
      if (!gesture) return;
      const distance = event.clientX - gesture.x;
      gesture.moved ||= Math.abs(distance) > 4;
      state.current.position = Math.max(0, Math.min(1, gesture.start - distance / 256));
      state.current.velocity = 0;
      if (!state.current.raf) state.current.raf = requestAnimationFrame(() => { state.current.raf = 0; paint(); });
    },
    onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
      const gesture = drag.current;
      drag.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
      if (gesture?.moved) {
        ignoreClick.current = true;
        request(state.current.position > 0.5);
      } else animate();
    },
    onPointerCancel() { drag.current = null; request(state.current.target === 1); },
    onClick() {
      if (ignoreClick.current) { ignoreClick.current = false; return; }
      toggle();
    },
  };
  return { frameRef, toggleRef, folded, toggle, handleProps };
}
