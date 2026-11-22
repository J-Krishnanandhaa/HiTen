import { useEffect, useRef } from 'react';

/**
 * Phone back button / back gesture support.
 *
 * Every open screen or sheet adds one browser-history entry. Pressing back pops the
 * top entry and closes only that screen, so the app never exits from inside a view.
 * Closing a screen with its own button removes its entry quietly.
 * On Android, MainActivity sends the system back press to the WebView history.
 */
interface Entry { close: () => void }

const stack: Entry[] = [];
let ignorePops = 0;
let installed = false;

const install = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('popstate', () => {
    if (ignorePops > 0) {
      ignorePops--;
      return;
    }
    stack.pop()?.close();
  });
};

/** While `open` is true, the back button calls `onBack` instead of leaving the app. */
export function useBackClose(open: boolean, onBack: () => void): void {
  const ref = useRef(onBack);
  ref.current = onBack;

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    install();
    const entry: Entry = { close: () => ref.current() };
    stack.push(entry);
    try { window.history.pushState({ hyten: stack.length }, ''); } catch { /* history unavailable */ }
    return () => {
      const i = stack.indexOf(entry);
      if (i === -1) return; // already consumed by a back press
      stack.splice(i, 1);
      ignorePops++;
      try { window.history.back(); } catch { ignorePops--; }
    };
  }, [open]);
}
