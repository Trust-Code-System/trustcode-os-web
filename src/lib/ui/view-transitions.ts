let active: ViewTransition | undefined;
let serial = 0;

/** One coordinator prevents a theme reveal and a route transition fighting. */
export function transitionView(kind: "theme" | "navigation", update: () => void | Promise<void>, reduced: boolean) {
  const generation = ++serial;
  active?.skipTransition();
  if (reduced || typeof document.startViewTransition !== "function") {
    active = undefined;
    delete document.documentElement.dataset.transitionKind;
    void update();
    return;
  }
  document.documentElement.dataset.transitionKind = kind;
  const transition = document.startViewTransition(async () => {
    if (generation === serial) await update();
  });
  active = transition;
  const cleanup = () => requestAnimationFrame(() => {
    if (generation === serial) {
      delete document.documentElement.dataset.transitionKind;
      active = undefined;
    }
  });
  void transition.ready.catch(() => undefined);
  void transition.finished.then(cleanup, cleanup);
}
