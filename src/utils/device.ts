/** Short vibration on supported devices (Android WebView supports the Vibration API). */
export function haptic(pattern: number | number[] = 30): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    /* unsupported */
  }
}

type WakeLockLike = { release: () => Promise<void> };

/**
 * Keep the screen on during a workout where the Screen Wake Lock API exists.
 * Returns a release function. Re-acquires after the page becomes visible again.
 */
export function keepScreenAwake(): () => void {
  let lock: WakeLockLike | null = null;
  let active = true;
  const nav = (typeof navigator !== 'undefined' ? navigator : undefined) as
    | (Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLockLike> } })
    | undefined;

  const acquire = async () => {
    try {
      if (active && nav?.wakeLock && document.visibilityState === 'visible') lock = await nav.wakeLock.request('screen');
    } catch {
      /* denied or unsupported */
    }
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') acquire();
  };

  acquire();
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    active = false;
    document.removeEventListener('visibilitychange', onVisible);
    lock?.release().catch(() => {});
  };
}
