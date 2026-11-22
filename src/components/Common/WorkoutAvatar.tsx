import React, { useMemo } from 'react';
import { AvatarAnimationType, AnchorPosition } from '../../types';

import type { ExtraAvatarAnimationType } from '../../types';
export type { ExtraAvatarAnimationType };
export type WorkoutAvatarAnimation = AvatarAnimationType | ExtraAvatarAnimationType;

interface WorkoutAvatarProps {
  animationType?: WorkoutAvatarAnimation;
  // library also uses 'Behind Back', 'Loop on Thighs', 'Loop on Ankles' (no fixture is drawn for those)
  anchorPosition?: AnchorPosition | (string & {});
  exerciseName?: string;
  bandColorHex?: string;
  size?: 'sm' | 'md' | 'lg';
  isPaused?: boolean;
}

/* ========================================================================== */
/*  KINEMATIC RIG                                                              */
/*  Every exercise is two key poses (rest -> peak). Joint angles are solved   */
/*  (2-bone IK where a hand/foot is planted or gripping) and baked into        */
/*  nested <g> rotations: each bone group rotates about its exact pivot, and   */
/*  children inherit it, so Shoulder->Elbow->Wrist and Hip->Knee->Ankle are   */
/*  true articulated chains. Angles: 0deg = +x, 90deg = down, -90deg = up.     */
/*  The cubic-bezier(0.4, 0, 0.2, 1) easing is baked into the keyframe stop    */
/*  spacing, so bands, hands and planted feet track each other exactly.        */
/* ========================================================================== */
type Pt = { x: number; y: number };
type Rel = { rx: number; ry: number }; // target relative to the shoulder
type Limb = Pt | Rel | [number, number]; // IK target, or explicit absolute [upper, lower] angles
type Side = 'N' | 'F'; // N = near (side view) / screen-left (front view), F = far / screen-right
type BoneId =
  | 'tor' | 'ch' | 'hd'
  | 'uaN' | 'faN' | 'hnN' | 'uaF' | 'faF' | 'hnF'
  | 'thN' | 'shN' | 'ftN' | 'thF' | 'shF' | 'ftF';

interface Pose {
  hip: Pt;
  torso: number; // pelvis -> lumbar absolute angle
  chest?: number; // lumbar -> shoulders (defaults to torso)
  head?: number; // neck absolute angle (defaults to chest)
  arm: Limb;
  armF?: Limb;
  leg: Limb;
  legF?: Limb;
  foot?: number;
  footF?: number;
  hand?: number; // absolute hand angle (defaults to forearm + wrist)
  handF?: number;
  wrist?: number;
}

type JointKey = 'handN' | 'handF' | 'ankleN' | 'ankleF' | 'footN' | 'toeN' | 'back' | 'hip' | 'shoulder';
type Anchor = Pt | { j: JointKey; dx?: number; dy?: number };
interface BandSpec { a: Anchor; b: Anchor; natural: number; bulge?: 1 | -1; floorA?: boolean }
interface GlowSpec { b: BoneId; t: number; r: number; dy?: number; inv?: boolean }
interface LoopSpec { b: BoneId; t: number }

interface Spec {
  view?: 'side' | 'front';
  rest: Pose;
  peak: Pose;
  /** Optional closed multi-pose loop (first and last pose identical, `at` in % of the cycle). Overrides rest/peak sampling. */
  seq?: { at: number; pose: Pose }[];
  elbow?: [1 | -1, 1 | -1];
  knee?: [1 | -1, 1 | -1];
  ts?: number; // torso length scale (hinged front views)
  neck?: number;
  bands?: BandSpec[];
  glows?: GlowSpec[];
  loops?: LoopSpec[];
  anchors?: Pt[]; // red door anchors
  bar?: 'front' | 'side';
  barX?: number;
  handles?: boolean;
  bandsOnTop?: boolean;
  dur?: number;
  /** Static scenery drawn behind the athlete (bench, box, table, door frame, dip bar). */
  props?: PropSpec[];
}

interface PropSpec { kind: 'bench' | 'box' | 'table' | 'post' | 'dipbar'; x: number; y: number; w?: number }

const TH = 44, SH = 42, UA = 29, FA = 26, HND = 7, LUMBAR = 26, CHEST = 30, NECK = 24;
const FOOT_SIDE = 17, FOOT_FRONT = 10;
const D2R = Math.PI / 180;
const P = (x: number, y: number): Pt => ({ x, y });
const R = (rx: number, ry: number): Rel => ({ rx, ry });
const vec = (deg: number, l: number): Pt => ({ x: Math.cos(deg * D2R) * l, y: Math.sin(deg * D2R) * l });
const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
const rotate = (v: Pt, deg: number): Pt => {
  const c = Math.cos(deg * D2R), s = Math.sin(deg * D2R);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
};
const lerp = (a: number, b: number, s: number) => a + (b - a) * s;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const norm180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;
const f1 = (n: number) => n.toFixed(1);

// cubic-bezier(0.4, 0, 0.2, 1) solved numerically
const bezier = (x1: number, y1: number, x2: number, y2: number) => (t: number) => {
  let lo = 0, hi = 1, u = t;
  for (let i = 0; i < 28; i++) {
    const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    if (x < t) lo = u; else hi = u;
    u = (lo + hi) / 2;
  }
  return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
};
const EASE = bezier(0.4, 0, 0.2, 1);

const isRel = (l: Limb): l is Rel => !Array.isArray(l) && 'rx' in l;
const isPt = (l: Limb): l is Pt => !Array.isArray(l) && 'x' in l;

// 2-bone IK. bend = +1 / -1 chooses which side the elbow/knee points to.
const ik2 = (root: Pt, target: Pt, a: number, b: number, bend: 1 | -1): [number, number] => {
  const dx = target.x - root.x, dy = target.y - root.y;
  const d = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 0.5, (a + b) * 0.998);
  const phi = Math.atan2(dy, dx);
  const alpha = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
  const beta = Math.acos(clamp((b * b + d * d - a * a) / (2 * b * d), -1, 1));
  return [(phi + bend * alpha) / D2R, (phi - bend * beta) / D2R];
};
const solveLimb = (start: Pt, limb: Limb, a: number, b: number, bend: 1 | -1): [number, number] => {
  if (Array.isArray(limb)) return limb;
  const t = isRel(limb) ? P(start.x + limb.rx, start.y + limb.ry) : limb;
  return ik2(start, t, a, b, bend);
};
const lerpLimb = (a: Limb, b: Limb, s: number): Limb => {
  if (Array.isArray(a) && Array.isArray(b)) return [lerp(a[0], b[0], s), lerp(a[1], b[1], s)];
  if (isRel(a) && isRel(b)) return R(lerp(a.rx, b.rx, s), lerp(a.ry, b.ry, s));
  if (isPt(a) && isPt(b)) return P(lerp(a.x, b.x, s), lerp(a.y, b.y, s));
  return a;
};

const ORDER: BoneId[] = ['tor', 'ch', 'hd', 'uaN', 'faN', 'hnN', 'uaF', 'faF', 'hnF', 'thN', 'shN', 'ftN', 'thF', 'shF', 'ftF'];
const PARENT: Record<BoneId, BoneId | null> = {
  tor: null, ch: 'tor', hd: 'ch',
  uaN: 'ch', faN: 'uaN', hnN: 'faN', uaF: 'ch', faF: 'uaF', hnF: 'faF',
  thN: null, shN: 'thN', ftN: 'shN', thF: null, shF: 'thF', ftF: 'shF',
};
const OFFS = {
  side: { hip: { N: P(0, 0), F: P(2.5, 0) }, sh: { N: P(0, 0), F: P(2.5, -0.5) } },
  front: { hip: { N: P(-7, 0), F: P(7, 0) }, sh: { N: P(-17, 0), F: P(17, 0) } },
};

interface NPose {
  hip: Pt; torso: number; chest: number; head: number;
  arm: Limb; armF: Limb; leg: Limb; legF: Limb;
  foot: number; footF: number; hand?: number; handF?: number; wrist: number;
}
const normPose = (p: Pose): NPose => ({
  hip: p.hip, torso: p.torso, chest: p.chest ?? p.torso, head: p.head ?? p.chest ?? p.torso,
  arm: p.arm, armF: p.armF ?? p.arm, leg: p.leg, legF: p.legF ?? p.leg,
  foot: p.foot ?? 0, footF: p.footF ?? p.foot ?? 0, hand: p.hand, handF: p.handF ?? p.hand,
  wrist: p.wrist ?? 0,
});
const lerpPose = (a: NPose, b: NPose, s: number): NPose => ({
  hip: P(lerp(a.hip.x, b.hip.x, s), lerp(a.hip.y, b.hip.y, s)),
  torso: lerp(a.torso, b.torso, s), chest: lerp(a.chest, b.chest, s), head: lerp(a.head, b.head, s),
  arm: lerpLimb(a.arm, b.arm, s), armF: lerpLimb(a.armF, b.armF, s),
  leg: lerpLimb(a.leg, b.leg, s), legF: lerpLimb(a.legF, b.legF, s),
  foot: lerp(a.foot, b.foot, s), footF: lerp(a.footF, b.footF, s),
  hand: a.hand !== undefined && b.hand !== undefined ? lerp(a.hand, b.hand, s) : undefined,
  handF: a.handF !== undefined && b.handF !== undefined ? lerp(a.handF, b.handF, s) : undefined,
  wrist: lerp(a.wrist, b.wrist, s),
});

const lengthsFor = (spec: Spec): Record<BoneId, number> => {
  const ts = spec.ts ?? 1;
  const foot = spec.view === 'front' ? FOOT_FRONT : FOOT_SIDE;
  return {
    tor: LUMBAR * ts, ch: CHEST * ts, hd: spec.neck ?? NECK,
    uaN: UA, faN: FA, hnN: HND, uaF: UA, faF: FA, hnF: HND,
    thN: TH, shN: SH, ftN: foot, thF: TH, shF: SH, ftF: foot,
  };
};

interface Solved { abs: Record<BoneId, number>; st: Record<BoneId, Pt>; en: Record<BoneId, Pt> }

const solve = (spec: Spec, p: NPose): Solved => {
  const Ln = lengthsFor(spec);
  const o = OFFS[spec.view ?? 'side'];
  const abs = {} as Record<BoneId, number>;
  const st = {} as Record<BoneId, Pt>;
  const en = {} as Record<BoneId, Pt>;
  const put = (id: BoneId, start: Pt, angle: number) => {
    abs[id] = angle; st[id] = start; en[id] = add(start, vec(angle, Ln[id]));
  };
  put('tor', p.hip, p.torso);
  put('ch', en.tor, p.chest);
  put('hd', en.ch, p.head);
  (['N', 'F'] as Side[]).forEach((sd, i) => {
    const off = rotate(o.sh[sd], abs.ch + 90);
    const shStart = add(en.ch, off);
    const [ua, fa] = solveLimb(shStart, sd === 'N' ? p.arm : p.armF, UA, FA, spec.elbow?.[i] ?? 1);
    put(`ua${sd}` as BoneId, shStart, ua);
    put(`fa${sd}` as BoneId, en[`ua${sd}` as BoneId], fa);
    const hAbs = (sd === 'N' ? p.hand : p.handF) ?? fa + p.wrist;
    put(`hn${sd}` as BoneId, en[`fa${sd}` as BoneId], hAbs);
    const hipStart = add(p.hip, o.hip[sd]);
    const [th, sh] = solveLimb(hipStart, sd === 'N' ? p.leg : p.legF, TH, SH, spec.knee?.[i] ?? -1);
    put(`th${sd}` as BoneId, hipStart, th);
    put(`sh${sd}` as BoneId, en[`th${sd}` as BoneId], sh);
    put(`ft${sd}` as BoneId, en[`sh${sd}` as BoneId], sd === 'N' ? p.foot : p.footF);
  });
  return { abs, st, en };
};

const jointOf = (S: Solved, j: JointKey, spec: Spec): Pt => {
  const front = spec.view === 'front';
  switch (j) {
    case 'handN': return S.en.hnN;
    case 'handF': return S.en.hnF;
    case 'ankleN': return S.st.ftN;
    case 'ankleF': return S.st.ftF;
    // point on the floor under the shoe (follows foot rotation, so toes/ball stay planted)
    case 'footN': return add(S.st.ftN, rotate(front ? P(10, 0) : P(6, 5), S.abs.ftN));
    case 'toeN': return add(S.st.ftN, rotate(front ? P(10, 0) : P(13, 5), S.abs.ftN));
    case 'hip': return S.st.tor;
    case 'shoulder': return S.en.ch;
    case 'back': {
      const mid = add(S.st.ch, vec(S.abs.ch, CHEST * (spec.ts ?? 1) * 0.45));
      const u = vec(S.abs.ch, 1);
      return add(mid, P(u.y * 11, -u.x * 11));
    }
  }
};
const resolveAnchor = (a: Anchor, S: Solved, spec: Spec): Pt =>
  'j' in a ? add(jointOf(S, a.j, spec), P(a.dx ?? 0, a.dy ?? 0)) : a;

const bandGeom = (A: Pt, B: Pt, natural: number, bulge: number) => {
  const dx = B.x - A.x, dy = B.y - A.y;
  const L = Math.max(Math.hypot(dx, dy), 0.5);
  const sag = Math.min(Math.max(0, natural - L) * 0.55, L * 0.6 + 6);
  const cx = (A.x + B.x) / 2 + (-dy / L) * sag * bulge;
  const cy = (A.y + B.y) / 2 + (dx / L) * sag * bulge;
  const w = clamp(5.6 * Math.sqrt(natural / L), 2.6, 6.6);
  return { d: `M ${f1(A.x)} ${f1(A.y)} Q ${f1(cx)} ${f1(cy)} ${f1(B.x)} ${f1(B.y)}`, w };
};

/* keyframe stops: concentric 0-45%, hold 45-58%, eccentric 58-100% */
const NSTEP = 6;
const STOPS: { pct: number; s: number }[] = (() => {
  const out: { pct: number; s: number }[] = [];
  for (let i = 0; i <= NSTEP; i++) out.push({ pct: (45 * i) / NSTEP, s: EASE(i / NSTEP) });
  out.push({ pct: 58, s: 1 });
  for (let j = 1; j <= NSTEP; j++) out.push({ pct: 58 + (42 * j) / NSTEP, s: 1 - EASE(j / NSTEP) });
  return out;
})();

interface Motion {
  css: string;
  rest: Solved;
  has: Set<string>;
  ns: string;
  bandRest: { d: string; w: number }[];
}

interface Stop { pct: number; pose: NPose; s: number }
const makeStops = (spec: Spec): Stop[] => {
  const restN = normPose(spec.rest), peakN = normPose(spec.peak);
  if (!spec.seq) return STOPS.map((st) => ({ pct: st.pct, pose: lerpPose(restN, peakN, st.s), s: st.s }));
  const out: Stop[] = [];
  const N = 5;
  for (let i = 0; i < spec.seq.length - 1; i++) {
    const a = normPose(spec.seq[i].pose), b = normPose(spec.seq[i + 1].pose);
    const t0 = spec.seq[i].at, t1 = spec.seq[i + 1].at;
    for (let j = i === 0 ? 0 : 1; j <= N; j++) out.push({ pct: t0 + ((t1 - t0) * j) / N, pose: lerpPose(a, b, EASE(j / N)), s: 0.6 });
  }
  return out;
};

const buildMotion = (spec: Spec, ns: string): Motion => {
  const stops = makeStops(spec);
  const rest = solve(spec, normPose(spec.seq ? spec.seq[0].pose : spec.rest));
  const samples = stops.map((st) => solve(spec, st.pose));
  const has = new Set<string>();
  const blocks: string[] = [];
  const emit = (name: string, fn: (k: number) => string, active: boolean) => {
    if (!active) return;
    has.add(name);
    blocks.push(`@keyframes ${ns}-${name}{${stops.map((st, k) => `${st.pct.toFixed(2)}%{${fn(k)};animation-timing-function:linear}`).join('')}}`);
  };
  // bone rotations (relative to parent), unwrapped for continuity
  ORDER.forEach((id) => {
    const par = PARENT[id];
    const rel = samples.map((S) => S.abs[id] - (par ? S.abs[par] : 0));
    const un: number[] = [rel[0]];
    for (let k = 1; k < rel.length; k++) un.push(un[k - 1] + norm180(rel[k] - rel[k - 1]));
    const delta = un.map((v) => v - un[0]);
    emit(id, (k) => `transform:rotate(${delta[k].toFixed(2)}deg)`, Math.max(...delta.map(Math.abs)) > 0.1);
  });
  // pelvis translation (root)
  const dx = samples.map((S) => S.st.tor.x - rest.st.tor.x), dy = samples.map((S) => S.st.tor.y - rest.st.tor.y);
  emit('root', (k) => `transform:translate(${dx[k].toFixed(2)}px,${dy[k].toFixed(2)}px)`,
    Math.max(...dx.map(Math.abs), ...dy.map(Math.abs)) > 0.1);
  // bands
  const bandRest: { d: string; w: number }[] = [];
  (spec.bands ?? []).forEach((b, i) => {
    const geo = samples.map((S) => bandGeom(resolveAnchor(b.a, S, spec), resolveAnchor(b.b, S, spec), b.natural, b.bulge ?? 1));
    bandRest.push(geo[0]);
    emit(`b${i}`, (k) => `d:path("${geo[k].d}");stroke-width:${geo[k].w.toFixed(2)}`, true);
    emit(`b${i}h`, (k) => `d:path("${geo[k].d}");stroke-width:${(geo[k].w * 0.28).toFixed(2)}`, true);
  });
  // muscle contraction glow
  (spec.glows ?? []).forEach((g, i) =>
    emit(`g${i}`, (k) => `opacity:${(0.12 + 0.88 * (g.inv ? 1 - stops[k].s : stops[k].s)).toFixed(2)}`, true));
  return { css: blocks.join('\n'), rest, has, ns, bandRest };
};

/* ========================================================================== */
/*  EXERCISE DEFINITIONS (rest pose -> peak pose)                              */
/*  Side views face right (+x). Front views: N = screen-left, F = screen-right.*/
/* ========================================================================== */
const SS = { hip: P(139.5, 151), torso: -90, leg: P(137, 236) as Limb, legF: P(142, 236) as Limb, foot: 0 }; // side standing
const FS = { hip: P(140, 144), torso: -90, leg: P(131, 229) as Limb, legF: P(149, 229) as Limb, foot: 90 }; // front standing
const KNEEL = { leg: [90, 180] as Limb, legF: [90, 180] as Limb, foot: 180 };
const FRONT_KNEES: [1 | -1, 1 | -1] = [1, -1];
const FLOOR_BAND = (j: 'footN' | 'toeN', natural: number, to: JointKey = 'handN', dx = 0): BandSpec =>
  ({ a: { j, dx }, b: { j: to }, natural, floorA: true });

const pull = (grip: number, peakShoulderY: number, band: boolean, bicepGlow: number): Spec => {
  const hand = -90;
  const arms = { arm: P(140 - grip, 36) as Limb, armF: P(140 + grip, 36) as Limb, hand, foot: 90 };
  return {
    view: 'front', elbow: [-1, 1], knee: FRONT_KNEES, bar: 'front', dur: 2.8,
    rest: { hip: P(140, 144), torso: -90, leg: [90, 90], ...arms },
    peak: { hip: P(140, peakShoulderY + 56), torso: -90, leg: [90, 90], ...arms },
    bands: band ? [{ a: P(140, 33), b: { j: 'ankleN', dx: 7, dy: 12 }, natural: 130 }] : [],
    glows: [{ b: 'ch', t: 0.5, r: 20 }, { b: 'uaN', t: 0.5, r: bicepGlow }, { b: 'uaF', t: 0.5, r: bicepGlow }],
  };
};

const SPECS: Record<string, Spec> = {
  'pullup-assisted': pull(26, 42, true, 10),
  'pullup-strict': pull(26, 42, false, 10),
  'chinup-assisted': pull(17, 40, true, 14),

  'hanging-leg-raise': {
    view: 'side', elbow: [-1, -1], bar: 'side', barX: 144, dur: 2.6,
    rest: { hip: P(140, 146), torso: -90, arm: P(144, 36), armF: P(146, 36), hand: -90, leg: [90, 90], foot: 30 },
    peak: { hip: P(140, 146), torso: -97, chest: -88, head: -92, arm: P(144, 36), armF: P(146, 36), hand: -90, leg: [-2, -2], foot: -15 },
    glows: [{ b: 'tor', t: 0.6, r: 15, dy: 6 }, { b: 'thN', t: 0.3, r: 13 }, { b: 'thF', t: 0.3, r: 13 }],
  },

  squat: {
    view: 'side', handles: true, dur: 2.8,
    rest: { ...SS, head: -90, arm: [55, -110] },
    peak: { hip: P(96, 184), torso: -64, chest: -58, head: -75, leg: P(137, 236), legF: P(142, 236), foot: 0, arm: [87, -78] },
    bands: [FLOOR_BAND('footN', 118)],
    glows: [{ b: 'thN', t: 0.45, r: 14 }, { b: 'tor', t: 0.3, r: 15, dy: -6 }],
  },
  'squat-press': {
    view: 'side', handles: true, dur: 3,
    rest: { hip: P(96, 184), torso: -64, chest: -58, head: -75, leg: P(137, 236), legF: P(142, 236), foot: 0, arm: [87, -78] },
    peak: { ...SS, head: -90, arm: [-86, -90] },
    bands: [FLOOR_BAND('footN', 110)],
    glows: [{ b: 'thN', t: 0.45, r: 14 }, { b: 'uaN', t: 0.3, r: 12 }, { b: 'tor', t: 0.3, r: 15, dy: -6 }],
  },

  pushup: {
    view: 'side', dur: 2.6,
    rest: { hip: P(161.8, 200.4), torso: -18.06, head: -32, arm: P(215, 237), armF: P(215, 237), hand: 0, leg: P(80, 227), foot: 70 },
    peak: { hip: P(165.4, 216.1), torso: -7.3, head: -22, arm: P(215, 237), armF: P(215, 237), hand: 0, leg: P(80, 227), foot: 70 },
    bands: [{ a: { j: 'handN' }, b: { j: 'back' }, natural: 52 }],
    glows: [{ b: 'ch', t: 0.55, r: 15, dy: 6 }, { b: 'uaN', t: 0.5, r: 11, dy: 3 }],
  },

  'bicep-curl': {
    view: 'side', handles: true, dur: 2.4,
    rest: { ...SS, arm: [93, 90] },
    peak: { ...SS, arm: [93, -40], wrist: -10 },
    bands: [FLOOR_BAND('footN', 78)],
    glows: [{ b: 'uaN', t: 0.55, r: 12, dy: -3 }, { b: 'faN', t: 0.3, r: 10 }],
  },

  'tricep-pushdown': {
    view: 'side', handles: true, anchors: [P(178, 20)], dur: 2.4,
    rest: { ...SS, torso: -84, chest: -82, head: -84, arm: [93, -10] },
    peak: { ...SS, torso: -84, chest: -82, head: -84, arm: [93, 92], wrist: 4 },
    bands: [{ a: P(178, 27), b: { j: 'handN' }, natural: 85 }],
    glows: [{ b: 'uaN', t: 0.5, r: 12, dy: 3 }, { b: 'faN', t: 0.2, r: 9, dy: 2 }],
  },

  'tricep-overhead': {
    view: 'side', handles: true, dur: 2.6,
    rest: { ...SS, arm: [-88, 118] },
    peak: { ...SS, arm: [-88, -92] },
    bands: [FLOOR_BAND('footN', 125, 'handN', -9)],
    glows: [{ b: 'uaN', t: 0.5, r: 12, dy: 3 }, { b: 'faN', t: 0.25, r: 9, dy: 2 }],
  },

  'chest-press': {
    view: 'side', handles: true, anchors: [P(38, 106)], dur: 2.4,
    rest: { hip: P(137, 156), torso: -82, chest: -80, head: -80, leg: P(160, 236), legF: P(116, 236), foot: 0, arm: R(14, 10) },
    peak: { hip: P(137, 156), torso: -82, chest: -80, head: -80, leg: P(160, 236), legF: P(116, 236), foot: 0, arm: R(54, 6) },
    bands: [{ a: P(44, 106), b: { j: 'handN' }, natural: 95 }],
    glows: [{ b: 'ch', t: 0.7, r: 14, dy: 5 }, { b: 'uaN', t: 0.5, r: 11, dy: 3 }],
  },

  'chest-fly': {
    view: 'front', handles: true, anchors: [P(18, 92), P(262, 92)], knee: FRONT_KNEES, dur: 2.6,
    rest: { ...FS, arm: [175, -168], armF: [5, -12] },
    peak: { ...FS, arm: [108, -38], armF: [72, -142] },
    bands: [{ a: P(24, 92), b: { j: 'handN' }, natural: 52 }, { a: P(256, 92), b: { j: 'handF' }, natural: 52 }],
    glows: [{ b: 'ch', t: 0.85, r: 16 }, { b: 'uaN', t: 0.3, r: 10 }, { b: 'uaF', t: 0.3, r: 10 }],
  },

  'lat-pulldown': {
    view: 'side', handles: true, anchors: [P(190, 20)], dur: 2.6,
    rest: { hip: P(140, 192), torso: -88, chest: -88, head: -88, ...KNEEL, arm: [-75, -80] },
    peak: { hip: P(140, 192), torso: -90, chest: -96, head: -95, ...KNEEL, arm: [70, -75] },
    bands: [{ a: P(190, 27), b: { j: 'handN' }, natural: 60 }],
    glows: [{ b: 'ch', t: 0.45, r: 16, dy: -6 }, { b: 'uaN', t: 0.5, r: 11 }],
  },

  'bent-over-row': {
    view: 'side', handles: true, dur: 2.3,
    rest: { hip: P(112, 160), torso: -45, chest: -40, head: -35, leg: P(140, 236), legF: P(145, 236), foot: 0, arm: [90, 88] },
    peak: { hip: P(112, 160), torso: -45, chest: -40, head: -35, leg: P(140, 236), legF: P(145, 236), foot: 0, arm: [150, 100] },
    bands: [FLOOR_BAND('footN', 52)],
    glows: [{ b: 'ch', t: 0.6, r: 16, dy: -7 }, { b: 'uaN', t: 0.5, r: 10, dy: 3 }],
  },

  deadlift: {
    view: 'side', handles: true, dur: 2.8,
    rest: { hip: P(104, 172), torso: -36, chest: -30, head: -32, leg: P(141, 236), legF: P(146, 236), foot: 0, arm: [90, 90] },
    peak: { hip: P(141, 151), torso: -92, chest: -91, head: -90, leg: P(141, 236), legF: P(146, 236), foot: 0, arm: [92, 90] },
    bands: [FLOOR_BAND('footN', 60)],
    glows: [{ b: 'tor', t: 0.3, r: 16, dy: -6 }, { b: 'thN', t: 0.25, r: 14, dy: 3 }, { b: 'ch', t: 0.5, r: 14, dy: -6 }],
  },

  'overhead-press': {
    view: 'front', handles: true, knee: FRONT_KNEES, elbow: [-1, 1], dur: 2.5,
    rest: { ...FS, arm: P(114, 84), armF: P(166, 84) },
    peak: { ...FS, arm: P(120, 34), armF: P(160, 34) },
    bands: [{ ...FLOOR_BAND('footN', 85) }, { ...FLOOR_BAND('footN', 85, 'handF', 18) }],
    glows: [{ b: 'uaN', t: 0.15, r: 12 }, { b: 'uaF', t: 0.15, r: 12 }, { b: 'faN', t: 0.5, r: 8 }],
  },

  'lateral-raise': {
    view: 'front', handles: true, knee: FRONT_KNEES, dur: 2.5,
    rest: { ...FS, arm: [100, 88], armF: [80, 92] },
    peak: { ...FS, arm: [183, 172], armF: [-3, 8] },
    bands: [{ ...FLOOR_BAND('footN', 85) }, { ...FLOOR_BAND('footN', 85, 'handF', 18) }],
    glows: [{ b: 'uaN', t: 0.25, r: 12 }, { b: 'uaF', t: 0.25, r: 12 }],
  },

  'face-pull': {
    view: 'side', handles: true, anchors: [P(236, 26)], dur: 2.4,
    rest: { hip: P(118, 151), torso: -90, leg: P(116, 236), legF: P(121, 236), foot: 0, arm: [-12, -8] },
    peak: { hip: P(118, 151), torso: -94, chest: -92, head: -92, leg: P(116, 236), legF: P(121, 236), foot: 0, arm: [-185, -75] },
    bands: [{ a: P(236, 33), b: { j: 'handN' }, natural: 75 }],
    glows: [{ b: 'ch', t: 0.9, r: 13, dy: -6 }, { b: 'uaN', t: 0.25, r: 11, dy: 3 }],
  },

  'glute-bridge': {
    view: 'side', dur: 2.6,
    rest: { hip: P(136, 229), torso: 180, head: 180, arm: [6, 4], leg: P(190, 236), legF: P(194, 236), foot: 0 },
    peak: { hip: P(133, 211), torso: 161.2, head: 180, arm: [6, 4], leg: P(190, 236), legF: P(194, 236), foot: 0 },
    loops: [{ b: 'thN', t: 0.78 }, { b: 'thF', t: 0.78 }],
    glows: [{ b: 'thN', t: 0.05, r: 17 }, { b: 'tor', t: 0.3, r: 14, dy: -6 }],
  },

  'glute-kickback': {
    view: 'side', dur: 2.4,
    rest: { hip: P(139.5, 150.5), torso: -84, chest: -82, head: -84, leg: [90, 90], legF: P(144, 236), foot: 0, footF: 0, arm: [85, 20] },
    peak: { hip: P(139.5, 150.5), torso: -78, chest: -76, head: -80, leg: [122, 134], legF: P(144, 236), foot: 60, footF: 0, arm: [85, 20] },
    bands: [{ a: { j: 'ankleN', dy: 2 }, b: { j: 'ankleF', dy: 2 }, natural: 24 }],
    loops: [{ b: 'shN', t: 0.96 }, { b: 'shF', t: 0.96 }],
    glows: [{ b: 'thN', t: 0.1, r: 16 }, { b: 'tor', t: 0.3, r: 13, dy: -6 }],
  },

  lunge: {
    view: 'side', handles: true, dur: 2.6,
    rest: { hip: P(130, 162), torso: -90, leg: P(170, 236), legF: P(88, 223), foot: 0, footF: 72, arm: [92, 90] },
    peak: { hip: P(128, 196), torso: -90, leg: P(170, 236), legF: P(88, 223), foot: 0, footF: 72, arm: [92, 90] },
    bands: [FLOOR_BAND('footN', 75)],
    glows: [{ b: 'thN', t: 0.5, r: 14 }, { b: 'thF', t: 0.15, r: 14 }],
  },

  'calf-raise': {
    view: 'side', handles: true, dur: 2.2,
    rest: { hip: P(138, 151), torso: -90, leg: P(136, 236), legF: P(141, 236), foot: 0, arm: [92, 90] },
    peak: { hip: P(145, 142), torso: -90, leg: P(147.3, 227.2), legF: P(152.3, 227.2), foot: 62, arm: [92, 90] },
    bands: [FLOOR_BAND('toeN', 80)],
    glows: [{ b: 'shN', t: 0.35, r: 12, dy: 4 }, { b: 'shF', t: 0.35, r: 10, dy: 4 }],
  },

  'reverse-fly': {
    view: 'front', ts: 0.62, neck: 12, knee: FRONT_KNEES, bandsOnTop: true, dur: 2.4,
    rest: { hip: P(140, 152), torso: -90, leg: P(131, 229), legF: P(149, 229), foot: 90, arm: [84, 80], armF: [96, 100] },
    peak: { hip: P(140, 152), torso: -90, leg: P(131, 229), legF: P(149, 229), foot: 90, arm: [183, 176], armF: [-3, 4] },
    bands: [{ a: { j: 'handN' }, b: { j: 'handF' }, natural: 34 }],
    glows: [{ b: 'uaN', t: 0.15, r: 12 }, { b: 'uaF', t: 0.15, r: 12 }, { b: 'ch', t: 0.6, r: 14 }],
  },

  woodchopper: {
    view: 'front', handles: true, anchors: [P(238, 22)], knee: FRONT_KNEES, elbow: [1, 1], dur: 2.8,
    rest: { hip: P(140, 146), torso: -90, chest: -80, head: -75, leg: P(122, 229), legF: P(158, 229), foot: 90, arm: P(162, 58), armF: P(167, 62) },
    peak: { hip: P(140, 146), torso: -96, chest: -106, head: -110, leg: P(122, 229), legF: P(158, 229), foot: 90, arm: P(110, 132), armF: P(116, 134) },
    bands: [{ a: P(238, 29), b: { j: 'handN' }, natural: 80 }],
    glows: [{ b: 'ch', t: 0.2, r: 16 }, { b: 'tor', t: 0.5, r: 15 }],
  },

  'pallof-press': {
    view: 'side', handles: true, anchors: [P(36, 113)], dur: 2.4,
    rest: { ...SS, arm: R(14, 18) },
    peak: { ...SS, arm: R(54, 18) },
    bands: [{ a: P(42, 113), b: { j: 'handN' }, natural: 105 }],
    glows: [{ b: 'tor', t: 0.6, r: 14, dy: 5 }, { b: 'ch', t: 0.3, r: 13, dy: 5 }, { b: 'uaN', t: 0.5, r: 10 }],
  },

  'ab-crunch': {
    view: 'side', handles: true, anchors: [P(196, 22)], dur: 2.4,
    rest: { hip: P(140, 192), torso: -90, chest: -90, head: -90, ...KNEEL, arm: R(12, -30) },
    peak: { hip: P(140, 192), torso: -78, chest: -42, head: -26, ...KNEEL, arm: R(30.7, -10.1) },
    bands: [{ a: P(196, 29), b: { j: 'handN' }, natural: 85 }],
    glows: [{ b: 'ch', t: 0.45, r: 16, dy: 6 }, { b: 'tor', t: 0.7, r: 13, dy: 6 }],
  },
};

/* -------------------------------------------------------------------------- */
/*  LIBRARY EXTENSIONS: movements 8, 12, 13, 15, 19, 20, 22-25, 30-32, 35, plus */
/*  the knee-raise regression of #4.                                           */
/* -------------------------------------------------------------------------- */
const HINGE = { hip: P(112, 158), leg: P(141, 236) as Limb, legF: P(146, 236) as Limb, foot: 0 }; // straight-leg hinge
const curlSpec = (peakFa: number, wristPeak: number, glows: GlowSpec[]): Spec => ({
  view: 'side', handles: true, dur: 2.4,
  rest: { ...SS, arm: [93, 90] },
  peak: { ...SS, arm: [93, peakFa], wrist: wristPeak },
  bands: [FLOOR_BAND('footN', 78)],
  glows,
});

Object.assign(SPECS, {
  'hanging-knee-raise': {
    view: 'side', elbow: [-1, -1], bar: 'side', barX: 144, dur: 2.6,
    rest: { hip: P(140, 146), torso: -90, arm: P(144, 36), armF: P(146, 36), hand: -90, leg: [90, 90], foot: 30 },
    peak: { hip: P(140, 146), torso: -98, chest: -88, head: -92, arm: P(144, 36), armF: P(146, 36), hand: -90, leg: [-2, 92], foot: 55 },
    glows: [{ b: 'tor', t: 0.6, r: 15, dy: 6 }, { b: 'thN', t: 0.3, r: 13 }, { b: 'thF', t: 0.3, r: 13 }],
  },

  'spine-decompression-hang': {
    view: 'front', elbow: [-1, 1], knee: FRONT_KNEES, bar: 'front', dur: 3.6,
    rest: { hip: P(140, 140), torso: -90, arm: P(114, 36), armF: P(166, 36), hand: -90, leg: [92, 88], legF: [88, 92], foot: 90 },
    peak: { hip: P(140, 146), torso: -90, arm: P(114, 36), armF: P(166, 36), hand: -90, leg: [88, 92], legF: [92, 88], foot: 90 },
    glows: [{ b: 'ch', t: 0.45, r: 20 }, { b: 'tor', t: 0.5, r: 14 }],
  },

  'archer-pushup': {
    view: 'side', dur: 3,
    rest: { hip: P(161.8, 200.4), torso: -18.06, head: -32, arm: P(215, 237), armF: P(222, 237), hand: 0, leg: P(80, 227), foot: 70 },
    peak: { hip: P(165.4, 216.1), torso: -7.3, head: -22, arm: P(215, 237), armF: P(268, 237), hand: 0, leg: P(80, 227), foot: 70 },
    bands: [{ a: { j: 'handN' }, b: { j: 'back' }, natural: 52 }, { a: { j: 'handF' }, b: { j: 'back' }, natural: 52 }],
    glows: [{ b: 'ch', t: 0.55, r: 16, dy: 6 }, { b: 'uaN', t: 0.5, r: 12, dy: 3 }, { b: 'tor', t: 0.5, r: 12 }],
  },

  'incline-press': {
    view: 'side', handles: true, anchors: [P(36, 214)], dur: 2.6,
    rest: { hip: P(137, 156), torso: -78, chest: -74, head: -76, leg: P(160, 236), legF: P(116, 236), foot: 0, arm: R(14, 22) },
    peak: { hip: P(137, 156), torso: -78, chest: -74, head: -76, leg: P(160, 236), legF: P(116, 236), foot: 0, arm: R(36, -40) },
    bands: [{ a: P(42, 214), b: { j: 'handN' }, natural: 120 }],
    glows: [{ b: 'ch', t: 0.85, r: 14, dy: 5 }, { b: 'uaN', t: 0.1, r: 12 }],
  },

  'single-arm-row': {
    view: 'side', handles: true, anchors: [P(256, 112)], dur: 2.4,
    rest: { hip: P(100, 162), torso: -55, chest: -50, head: -45, leg: P(132, 236), legF: P(88, 236), foot: 0, arm: [12, 8], armF: [80, 70] },
    peak: { hip: P(100, 162), torso: -55, chest: -50, head: -45, leg: P(132, 236), legF: P(88, 236), foot: 0, arm: [165, 108], armF: [80, 70] },
    bands: [{ a: P(250, 112), b: { j: 'handN' }, natural: 60 }],
    glows: [{ b: 'ch', t: 0.55, r: 17, dy: -7 }, { b: 'uaN', t: 0.5, r: 11, dy: 3 }],
  },

  'front-raise': {
    view: 'side', handles: true, dur: 2.6,
    rest: { ...SS, arm: [90, 90], armF: [0, -2] },
    peak: { ...SS, arm: [0, -2], armF: [90, 90] },
    bands: [FLOOR_BAND('footN', 85), FLOOR_BAND('footN', 85, 'handF')],
    glows: [{ b: 'uaN', t: 0.2, r: 12, dy: -3 }, { b: 'uaF', t: 0.2, r: 11, dy: -3, inv: true }],
  },

  'mid-face-pull': {
    view: 'side', handles: true, anchors: [P(238, 96)], dur: 2.4,
    rest: { hip: P(118, 151), torso: -90, leg: P(116, 236), legF: P(121, 236), foot: 0, arm: [-2, 0] },
    peak: { hip: P(118, 151), torso: -94, chest: -92, head: -92, leg: P(116, 236), legF: P(121, 236), foot: 0, arm: [-185, -75] },
    bands: [{ a: P(232, 96), b: { j: 'handN' }, natural: 55 }],
    glows: [{ b: 'ch', t: 0.9, r: 13, dy: -6 }, { b: 'uaN', t: 0.25, r: 11, dy: 3 }],
  },

  'hammer-curl': curlSpec(-34, 0, [{ b: 'faN', t: 0.4, r: 12 }, { b: 'uaN', t: 0.55, r: 11, dy: -3 }]),
  'reverse-curl': curlSpec(-40, 14, [{ b: 'faN', t: 0.35, r: 13, dy: -3 }, { b: 'uaN', t: 0.55, r: 10, dy: -3 }]),

  'concentration-curl': {
    view: 'side', handles: true, dur: 2.6,
    rest: { hip: P(140, 192), torso: -55, chest: -50, head: -45, ...KNEEL, arm: [95, 92] },
    peak: { hip: P(140, 192), torso: -55, chest: -50, head: -45, ...KNEEL, arm: [95, -40], wrist: -8 },
    bands: [{ a: P(124, 241), b: { j: 'handN' }, natural: 60, floorA: true }],
    glows: [{ b: 'uaN', t: 0.55, r: 13, dy: -3 }, { b: 'faN', t: 0.3, r: 9 }],
  },

  'behind-back-curl': {
    view: 'side', handles: true, anchors: [P(34, 216)], dur: 2.6,
    rest: { ...SS, torso: -88, head: -88, arm: [128, 126] },
    peak: { ...SS, torso: -88, head: -88, arm: [128, 5] },
    bands: [{ a: P(40, 216), b: { j: 'handN' }, natural: 90 }],
    glows: [{ b: 'uaN', t: 0.55, r: 13, dy: -3 }, { b: 'faN', t: 0.3, r: 9 }],
  },

  'reverse-lunge': {
    view: 'side', handles: true, dur: 2.8,
    rest: { hip: P(139.5, 151.5), torso: -90, leg: P(152, 236), legF: P(142, 236), foot: 0, footF: 0, arm: [92, 90] },
    peak: { hip: P(108, 196), torso: -90, leg: P(152, 236), legF: P(74, 223), foot: 0, footF: 72, arm: [92, 90] },
    bands: [FLOOR_BAND('footN', 75)],
    glows: [{ b: 'thN', t: 0.5, r: 14 }, { b: 'thF', t: 0.15, r: 14 }],
  },

  rdl: {
    view: 'side', handles: true, dur: 2.8,
    rest: { ...HINGE, torso: -32, chest: -28, head: -30, arm: [90, 90] },
    peak: { ...HINGE, hip: P(141, 151), torso: -92, chest: -91, head: -90, arm: [92, 90] },
    bands: [FLOOR_BAND('footN', 60)],
    glows: [{ b: 'thN', t: 0.3, r: 14, dy: 4 }, { b: 'tor', t: 0.3, r: 15, dy: -6 }],
  },

  'good-morning': {
    view: 'side', dur: 2.8,
    rest: { ...HINGE, torso: -32, chest: -28, head: -30, arm: [117, -48] },
    peak: { ...HINGE, hip: P(141, 151), torso: -90, chest: -90, head: -90, arm: [55, -110] },
    bands: [{ a: { j: 'footN' }, b: { j: 'shoulder', dx: -4 }, natural: 78, floorA: true }],
    glows: [{ b: 'ch', t: 0.3, r: 15, dy: -7 }, { b: 'tor', t: 0.3, r: 14, dy: -6 }, { b: 'thN', t: 0.3, r: 13, dy: 4 }],
  },

  'monster-walk': {
    view: 'front', knee: FRONT_KNEES, dur: 2.4,
    rest: { hip: P(140, 152), torso: -90, leg: P(122, 229), legF: P(158, 229), foot: 90, arm: [98, 92], armF: [82, 88] },
    peak: { hip: P(129, 152), torso: -90, leg: P(100, 229), legF: P(158, 229), foot: 90, arm: [98, 92], armF: [82, 88] },
    bands: [{ a: { j: 'ankleN', dy: 2 }, b: { j: 'ankleF', dy: 2 }, natural: 40 }],
    loops: [{ b: 'shN', t: 0.96 }, { b: 'shF', t: 0.96 }],
    glows: [{ b: 'thN', t: 0.15, r: 15 }, { b: 'thF', t: 0.15, r: 15 }],
  },
} as Record<string, Spec>);

/* -------------------------------------------------------------------------- */
/*  BODYWEIGHT / NO-EQUIPMENT RIGS                                             */
/*  Prone/plank poses are derived from fixed segment lengths so hands and toes */
/*  stay planted: plank shoulder-to-ankle = 142 px (torso 56 + leg 86).        */
/* -------------------------------------------------------------------------- */
const HAND_Y = 237.5;
const PLANK_TOP = { hip: P(161.8, 200.4), torso: -18.06, head: -32, arm: P(215, HAND_Y) as Limb, armF: P(215, HAND_Y) as Limb, hand: 0, leg: P(80, 227) as Limb, foot: 70 };
const PLANK_BOT = { hip: P(165.4, 216.1), torso: -7.3, head: -22, arm: P(215, HAND_Y) as Limb, armF: P(215, HAND_Y) as Limb, hand: 0, leg: P(80, 227) as Limb, foot: 70 };
const PIKE_TOP = { hip: P(151.4, 144.9), torso: 45, head: 62, arm: P(205, 237) as Limb, armF: P(205, 237) as Limb, hand: 0, leg: P(135, 226) as Limb, foot: 60 };
const PIKE_BOT = { hip: P(162, 150), torso: 56, head: 72, arm: P(205, 237) as Limb, armF: P(205, 237) as Limb, hand: 0, leg: P(135, 226) as Limb, foot: 60 };
const shiftPlank = <T extends { hip: Pt; arm: Limb; armF: Limb; leg: Limb }>(p: T, dx: number): T =>
  ({ ...p, hip: P(p.hip.x + dx, p.hip.y), arm: P((p.arm as Pt).x + dx, (p.arm as Pt).y), armF: P((p.armF as Pt).x + dx, (p.armF as Pt).y), leg: P((p.leg as Pt).x + dx, (p.leg as Pt).y) });
const noBands = (s: Spec): Spec => ({ ...s, bands: [], loops: [], handles: false, anchors: undefined });

Object.assign(SPECS, {
  /* 4-phase: stand -> squat + hands down -> jump to plank -> push-up -> plank -> frog hop in -> vertical leap -> stand */
  burpee: (() => {
    const HX = 185;
    const STAND: Pose = { hip: P(139.5, 151), torso: -90, head: -90, arm: P(140, 148), leg: P(137, 236), legF: P(142, 236), foot: 0 };
    const SQUAT: Pose = { hip: P(118, 207), torso: -24, chest: -18, head: -10, arm: P(HX, HAND_Y), leg: P(150, 236), foot: 0 };
    const PL: Pose = { ...shiftPlank(PLANK_TOP, HX - 215) };
    const BT: Pose = { ...shiftPlank(PLANK_BOT, HX - 215) };
    const JUMP: Pose = { hip: P(139.5, 127), torso: -90, head: -92, arm: P(142, 19), leg: P(139.5, 212), foot: 60 };
    return {
      view: 'side', dur: 4.4,
      rest: STAND, peak: SQUAT,
      seq: [
        { at: 0, pose: STAND }, { at: 14, pose: SQUAT }, { at: 28, pose: PL }, { at: 42, pose: BT },
        { at: 56, pose: PL }, { at: 68, pose: SQUAT }, { at: 82, pose: JUMP }, { at: 94, pose: STAND }, { at: 100, pose: STAND },
      ],
      glows: [{ b: 'thN', t: 0.45, r: 14 }, { b: 'ch', t: 0.55, r: 15, dy: 6 }, { b: 'tor', t: 0.5, r: 13 }],
    } as Spec;
  })(),

  'mountain-climbers': {
    view: 'side', dur: 1.6,
    rest: { ...PLANK_TOP, leg: P(80, 227), legF: P(166, 222), foot: 70, footF: 80 },
    peak: { ...PLANK_TOP, leg: P(166, 222), legF: P(80, 227), foot: 80, footF: 70 },
    glows: [{ b: 'tor', t: 0.5, r: 14, dy: 6 }, { b: 'thN', t: 0.25, r: 12 }, { b: 'thF', t: 0.25, r: 12 }, { b: 'ch', t: 0.5, r: 12, dy: 6 }],
  },

  'plank-shoulder-tap': {
    view: 'side', elbow: [-1, 1], dur: 2.4,
    rest: { ...PLANK_TOP, arm: P(215, 237.8), armF: P(215, 237.8) },
    peak: { ...PLANK_TOP, arm: P(224, 190), hand: -40, armF: P(215, 237.8) },
    glows: [{ b: 'tor', t: 0.5, r: 14, dy: 6 }, { b: 'uaF', t: 0.5, r: 12 }, { b: 'ch', t: 0.5, r: 12, dy: 6 }],
  },

  /* supine: head left, feet right. Opposite elbow drives to the opposite knee while the other leg extends. */
  'bicycle-crunch': {
    view: 'side', dur: 2.2,
    rest: { hip: P(136, 229), torso: 180, chest: 195, head: 205, arm: [250, 140], armF: [210, 125], leg: [-100, 20], legF: [-25, -20], foot: 60, footF: -40 },
    peak: { hip: P(136, 229), torso: 180, chest: 195, head: 205, arm: [210, 125], armF: [250, 140], leg: [-25, -20], legF: [-100, 20], foot: -40, footF: 60 },
    glows: [{ b: 'ch', t: 0.5, r: 15, dy: 5 }, { b: 'tor', t: 0.6, r: 13, dy: 5 }],
  },

  'v-up': {
    view: 'side', dur: 2.6,
    rest: { hip: P(134, 229), torso: 180, chest: 180, head: 180, arm: [178, 178], leg: [0, 0], foot: 0 },
    peak: { hip: P(134, 229), torso: 255, chest: 255, head: 245, arm: [358, 358], leg: [-40, -40], foot: -30 },
    glows: [{ b: 'tor', t: 0.6, r: 16, dy: 6 }, { b: 'ch', t: 0.3, r: 14, dy: 6 }, { b: 'thN', t: 0.3, r: 12 }],
  },

  /* inverted V: hands fixed, hips high, crown of the head travels in a diagonal arc toward the floor */
  'pike-pushup': {
    view: 'side', dur: 2.8,
    rest: PIKE_TOP, peak: PIKE_BOT,
    glows: [{ b: 'uaN', t: 0.15, r: 14 }, { b: 'uaF', t: 0.15, r: 13 }, { b: 'ch', t: 0.8, r: 13, dy: -5 }],
  },

  'pushup-downward-dog': (() => {
    const T = shiftPlank(PLANK_TOP, -10), B = shiftPlank(PLANK_BOT, -10);
    const TOP: Pose = { ...T, arm: P(205, 237.8), armF: P(205, 237.8) };
    const BOT: Pose = { ...B, arm: P(205, 237.8), armF: P(205, 237.8) };
    return {
      view: 'side', dur: 4,
      rest: TOP, peak: BOT,
      seq: [{ at: 0, pose: TOP }, { at: 20, pose: BOT }, { at: 40, pose: TOP }, { at: 62, pose: PIKE_TOP }, { at: 74, pose: PIKE_TOP }, { at: 100, pose: TOP }],
      glows: [{ b: 'ch', t: 0.55, r: 15, dy: 6 }, { b: 'uaN', t: 0.5, r: 12 }, { b: 'uaF', t: 0.2, r: 11 }],
    } as Spec;
  })(),

  'diamond-pushup': {
    view: 'side', dur: 2.8,
    rest: { ...PLANK_TOP, arm: P(207, 237.3), armF: P(207, 237.3) },
    peak: { ...PLANK_BOT, arm: P(207, 237.3), armF: P(207, 237.3) },
    glows: [{ b: 'uaN', t: 0.5, r: 15, dy: 3 }, { b: 'uaF', t: 0.5, r: 13, dy: 3 }, { b: 'ch', t: 0.55, r: 12, dy: 6 }],
  },

  /* prone: face down, head right, feet left; chest, arms and legs lift together */
  'superman-pulse': {
    view: 'side', dur: 1.8,
    rest: { hip: P(110, 227), torso: 0, chest: 0, head: 0, arm: [0, 0], leg: [180, 180], foot: 180 },
    peak: { hip: P(110, 227), torso: -6, chest: -20, head: -28, arm: [-20, -20], leg: [200, 200], foot: 200 },
    glows: [{ b: 'ch', t: 0.5, r: 15, dy: -6 }, { b: 'tor', t: 0.5, r: 14, dy: -6 }, { b: 'thN', t: 0.4, r: 12, dy: -4 }],
  },

  'jump-squat': {
    view: 'side', dur: 2,
    rest: { hip: P(96, 184), torso: -64, chest: -58, head: -75, leg: P(137, 236), legF: P(142, 236), foot: 0, arm: P(90, 162) },
    peak: { hip: P(139.5, 122), torso: -90, head: -92, leg: P(139, 207), legF: P(139, 207), foot: 60, arm: P(142, 12) },
    glows: [{ b: 'thN', t: 0.45, r: 15 }, { b: 'tor', t: 0.3, r: 14, dy: -6 }, { b: 'shN', t: 0.35, r: 10, dy: 4 }],
  },

  'sumo-squat': {
    view: 'front', elbow: [1, -1], knee: FRONT_KNEES, dur: 2.6,
    rest: { hip: P(140, 150), torso: -90, leg: P(110, 229), legF: P(170, 229), foot: 90, arm: P(137, 106), armF: P(143, 106) },
    peak: { hip: P(140, 186), torso: -90, leg: P(110, 229), legF: P(170, 229), foot: 90, arm: P(137, 142), armF: P(143, 142) },
    glows: [{ b: 'thN', t: 0.45, r: 15 }, { b: 'thF', t: 0.45, r: 15 }, { b: 'tor', t: 0.5, r: 14 }],
  },
} as Record<string, Spec>);

SPECS['dead-hang'] = SPECS['spine-decompression-hang'];
SPECS['chinup-strict'] = pull(17, 40, false, 14); // no assist band
SPECS['archer-pushup-bodyweight'] = noBands(SPECS['archer-pushup']);
SPECS['pushup-standard'] = noBands(SPECS.pushup);
SPECS['air-squat'] = noBands({ ...SPECS.squat, rest: { ...SPECS.squat.rest, arm: [-4, -4] }, peak: { ...SPECS.squat.peak, arm: [-4, -4] } });
SPECS['reverse-lunge-bodyweight'] = noBands({ ...SPECS['reverse-lunge'], rest: { ...SPECS['reverse-lunge'].rest, arm: [70, 10] }, peak: { ...SPECS['reverse-lunge'].peak, arm: [70, 10] } });
SPECS['calf-raise-bodyweight'] = noBands(SPECS['calf-raise']);
SPECS['glute-bridge-bodyweight'] = noBands(SPECS['glute-bridge']);

/* -------------------------------------------------------------------------- */
/*  DEDICATED RIGS: one accurate movement per exercise (no shared stand-ins).  */
/* -------------------------------------------------------------------------- */
const FLOOR = 241;
// straight body line of `len` from a planted point at angle `a` (deg)
const along = (from: Pt, a: number, len: number): Pt => add(from, vec(a, len));

Object.assign(SPECS, {
  /* prone, head right: both heels curl toward the glutes against a low door anchor */
  'prone-leg-curl': {
    view: 'side', anchors: [P(36, 214)], elbow: [-1, -1], dur: 2.6,
    rest: { hip: P(116, 226), torso: -3, chest: -12, head: -16, arm: P(222, 238), hand: 0, leg: [180, 180], foot: 95 },
    peak: { hip: P(116, 226), torso: -3, chest: -12, head: -16, arm: P(222, 238), hand: 0, leg: [180, 292], foot: 205 },
    bands: [{ a: P(42, 214), b: { j: 'ankleN' }, natural: 62 }],
    glows: [{ b: 'thN', t: 0.55, r: 14, dy: -4 }, { b: 'tor', t: 0.05, r: 13, dy: -5 }],
  },

  /* bridge held, heels slide out to straight legs and pull back in */
  'slider-leg-curl': {
    view: 'side', dur: 2.8,
    rest: { hip: P(136, 214), torso: 164, head: 180, arm: [6, 4], leg: P(219, 236), legF: P(222, 236), foot: -70 },
    peak: { hip: P(133, 210), torso: 160, head: 180, arm: [6, 4], leg: P(186, 236), legF: P(190, 236), foot: -15 },
    glows: [{ b: 'thN', t: 0.55, r: 15, dy: 4 }, { b: 'tor', t: 0.1, r: 13 }],
  },

  /* kneeling, ankles anchored: body falls forward as one plank, hands catch, push back up */
  'nordic-negative': (() => {
    const K = P(112, 236);
    const at = (lean: number, arm: Limb): Pose => {
      const a = -90 + lean; // knee -> hip direction
      const hip = along(K, a, TH);
      return { hip, torso: a, chest: a, head: a - 4, leg: [a + 180, 180], foot: 180, arm };
    };
    const UP = at(0, R(14, 26)), DOWN = at(58, R(14, 26)), CATCH = at(68, P(232, 238)), PUSH = at(44, R(18, 30));
    return {
      view: 'side', anchors: [P(36, 214)], dur: 5,
      rest: UP, peak: DOWN,
      seq: [{ at: 0, pose: UP }, { at: 8, pose: UP }, { at: 58, pose: DOWN }, { at: 66, pose: CATCH }, { at: 80, pose: PUSH }, { at: 100, pose: UP }],
      bands: [{ a: P(42, 214), b: { j: 'ankleN' }, natural: 70 }],
      glows: [{ b: 'thN', t: 0.5, r: 15, dy: -4 }, { b: 'tor', t: 0.2, r: 12 }],
    } as Spec;
  })(),

  /* hinge on one leg while the free leg extends back in line with the torso */
  'single-leg-rdl': {
    view: 'side', handles: true, dur: 3,
    rest: { hip: P(139.5, 151), torso: -90, head: -90, leg: P(141, 236), legF: [94, 92], foot: 0, footF: 20, arm: [92, 90] },
    peak: { hip: P(126, 158), torso: -12, chest: -10, head: -14, leg: P(141, 236), legF: [186, 186], foot: 0, footF: 270, arm: [90, 90] },
    bands: [FLOOR_BAND('footN', 70)],
    glows: [{ b: 'thN', t: 0.35, r: 14, dy: 4 }, { b: 'tor', t: 0.1, r: 14 }],
  },

  /* one foot planted, the other hooked behind */
  'single-leg-calf-raise': {
    view: 'side', dur: 2.2,
    rest: { hip: P(138, 151), torso: -90, leg: P(136, 236), legF: [96, 160], foot: 0, footF: 200, arm: [92, 90] },
    peak: { hip: P(145, 142), torso: -90, leg: P(147.3, 227.2), legF: [96, 160], foot: 62, footF: 200, arm: [92, 90] },
    glows: [{ b: 'shN', t: 0.35, r: 12, dy: 4 }],
  },

  /* rear foot on a bench, straight drop of the hips */
  'bulgarian-split-squat': {
    view: 'side', props: [{ kind: 'bench', x: 26, y: 196, w: 62 }], dur: 2.8,
    rest: { hip: P(128, 152), torso: -88, head: -88, leg: P(168, 236), legF: P(76, 194), foot: 0, footF: 150, arm: [92, 90] },
    peak: { hip: P(118, 190), torso: -80, chest: -82, head: -84, leg: P(168, 236), legF: P(76, 194), foot: 0, footF: 150, arm: [94, 88] },
    glows: [{ b: 'thN', t: 0.5, r: 15 }, { b: 'tor', t: 0.05, r: 13 }],
  },

  /* step onto a box, stand tall, step back down */
  'step-up': (() => {
    const BOX = 194;
    const STAND: Pose = { hip: P(104, 151), torso: -90, head: -90, leg: P(102, 236), legF: P(107, 236), foot: 0, arm: [92, 90] };
    const FOOT_UP: Pose = { hip: P(112, 152), torso: -84, head: -86, leg: P(172, BOX - 5), legF: P(107, 236), foot: 0, footF: 0, arm: [100, 92], armF: [80, 86] };
    const DRIVE: Pose = { hip: P(150, 128), torso: -78, head: -82, leg: P(172, BOX - 5), legF: P(140, 200), foot: 0, footF: 60, arm: [80, 86], armF: [100, 92] };
    const TOP: Pose = { hip: P(170, 105), torso: -90, head: -90, leg: P(172, BOX - 5), legF: P(176, BOX - 5), foot: 0, footF: 0, arm: [92, 90] };
    return {
      view: 'side', props: [{ kind: 'box', x: 150, y: BOX, w: 70 }], dur: 4.2,
      rest: STAND, peak: TOP,
      seq: [{ at: 0, pose: STAND }, { at: 16, pose: FOOT_UP }, { at: 32, pose: DRIVE }, { at: 44, pose: TOP }, { at: 56, pose: TOP },
        { at: 70, pose: DRIVE }, { at: 84, pose: FOOT_UP }, { at: 100, pose: STAND }],
      glows: [{ b: 'thN', t: 0.5, r: 15 }, { b: 'tor', t: 0.05, r: 13 }],
    } as Spec;
  })(),

  /* front view: wide stance, sit into one hip, other leg stays straight */
  'side-lunge': {
    view: 'front', knee: FRONT_KNEES, elbow: [1, -1], dur: 2.8,
    rest: { hip: P(140, 147), torso: -90, leg: P(104, 229), legF: P(176, 229), foot: 90, arm: P(134, 120), armF: P(146, 120) },
    peak: { hip: P(110, 181), torso: -84, chest: -86, leg: P(104, 229), legF: P(176, 229), foot: 90, arm: P(118, 150), armF: P(130, 152) },
    glows: [{ b: 'thN', t: 0.45, r: 15 }, { b: 'thF', t: 0.4, r: 11 }],
  },

  /* single-leg squat holding a door frame, free leg straight out front */
  'pistol-assisted': {
    view: 'side', props: [{ kind: 'post', x: 186, y: 30 }], elbow: [1, 1], dur: 3.2,
    rest: { hip: P(139.5, 151), torso: -90, head: -90, leg: P(138, 236), legF: [80, 84], foot: 0, footF: 10, arm: P(184, 128), armF: P(184, 132), hand: -90 },
    peak: { hip: P(108, 202), torso: -58, chest: -54, head: -62, leg: P(138, 236), legF: [-6, -6], foot: 0, footF: -70, arm: P(184, 160), armF: P(184, 164), hand: -90 },
    glows: [{ b: 'thN', t: 0.5, r: 15 }, { b: 'tor', t: 0.05, r: 13 }],
  },

  /* front view: hands rise close to the chin, elbows lead high and wide */
  'upright-row': {
    view: 'front', handles: true, knee: FRONT_KNEES, elbow: [1, -1], dur: 2.5,
    rest: { ...FS, arm: P(134, 150), armF: P(146, 150), hand: 90, handF: 90 },
    peak: { ...FS, arm: P(134, 98), armF: P(146, 98), hand: -90, handF: -90 },
    bands: [{ ...FLOOR_BAND('footN', 70, 'handN', 9) }, { ...FLOOR_BAND('footN', 70, 'handF', 9) }],
    glows: [{ b: 'uaN', t: 0.15, r: 12 }, { b: 'uaF', t: 0.15, r: 12 }, { b: 'ch', t: 0.92, r: 12 }],
  },

  /* front view: straight arms pull the band apart at chest height */
  'pull-apart': {
    view: 'front', knee: FRONT_KNEES, elbow: [1, -1], bandsOnTop: true, dur: 2.4,
    rest: { ...FS, arm: P(132, 104), armF: P(148, 104), hand: 0, handF: 180 },
    peak: { ...FS, arm: P(70, 92), armF: P(210, 92), hand: 180, handF: 0 },
    bands: [{ a: { j: 'handN' }, b: { j: 'handF' }, natural: 30 }],
    glows: [{ b: 'uaN', t: 0.1, r: 12 }, { b: 'uaF', t: 0.1, r: 12 }, { b: 'ch', t: 0.75, r: 14 }],
  },

  /* arms locked overhead through a full squat */
  'overhead-squat': {
    view: 'side', handles: true, dur: 3,
    rest: { ...SS, head: -90, arm: [-96, -96] },
    peak: { hip: P(98, 186), torso: -66, chest: -62, head: -74, leg: P(137, 236), legF: P(142, 236), foot: 0, arm: [-104, -104] },
    bands: [FLOOR_BAND('footN', 150)],
    glows: [{ b: 'thN', t: 0.45, r: 14 }, { b: 'uaN', t: 0.2, r: 11 }, { b: 'tor', t: 0.3, r: 14, dy: -6 }],
  },

  /* support on a straight bar, lean in and dip until the bar meets the hips */
  'bar-dip': {
    view: 'side', props: [{ kind: 'dipbar', x: 168, y: 128 }], elbow: [-1, -1], dur: 2.8,
    rest: { hip: P(146, 118), torso: -76, head: -82, arm: P(166, 120), hand: 0, leg: [100, 150], foot: 150 },
    peak: { hip: P(126, 152), torso: -52, head: -60, arm: P(166, 120), hand: 0, leg: [118, 168], foot: 168 },
    bands: [{ a: P(168, 128), b: { j: 'hip', dx: -8, dy: 43 }, natural: 40 }],
    glows: [{ b: 'uaN', t: 0.5, r: 13, dy: 3 }, { b: 'ch', t: 0.6, r: 13, dy: 6 }],
  },

  /* hands on a bench behind, legs out, hips drop straight down */
  'bench-dip': {
    view: 'side', props: [{ kind: 'bench', x: 46, y: 196, w: 62 }], elbow: [-1, -1], dur: 2.6,
    rest: { hip: P(122, 196), torso: -95, head: -88, arm: P(104, 194), hand: 180, leg: P(198, 236), legF: P(202, 236), foot: -40 },
    peak: { hip: P(119, 226), torso: -92, head: -86, arm: P(104, 194), hand: 180, leg: P(198, 236), legF: P(202, 236), foot: -40 },
    glows: [{ b: 'uaN', t: 0.5, r: 13, dy: 3 }, { b: 'ch', t: 0.85, r: 11 }],
  },

  /* hinged torso, upper arm pinned, forearm extends straight back */
  'tricep-kickback': {
    view: 'side', handles: true, anchors: [], dur: 2.4,
    rest: { hip: P(110, 160), torso: -42, chest: -38, head: -30, leg: P(140, 236), legF: P(146, 236), foot: 0, arm: [150, 88], armF: [100, 92] },
    peak: { hip: P(110, 160), torso: -42, chest: -38, head: -30, leg: P(140, 236), legF: P(146, 236), foot: 0, arm: [152, 154], armF: [100, 92] },
    bands: [FLOOR_BAND('footN', 62)],
    glows: [{ b: 'uaN', t: 0.5, r: 12, dy: 3 }],
  },

  /* feet by the frame, lean back on straight arms, row the chest to the frame */
  'doorframe-row': (() => {
    const A = P(176, 236), HAND = P(200, 112);
    const pose = (lean: number): Pose => {
      const a = -90 - lean;
      const hip = along(A, a, TH + SH - 1);
      return { hip, torso: a, head: a + 2, leg: A, legF: P(A.x + 4, A.y), foot: 0, arm: HAND, hand: -90 };
    };
    return {
      view: 'side', props: [{ kind: 'post', x: 202, y: 18 }], elbow: [1, 1], dur: 2.6,
      rest: pose(16), peak: pose(4),
      glows: [{ b: 'ch', t: 0.5, r: 16, dy: -7 }, { b: 'uaN', t: 0.5, r: 11, dy: 3 }],
    } as Spec;
  })(),

  /* under a table, heels down, body straight: pull the chest to the table edge */
  'table-row': (() => {
    const A = P(58, 236), HAND = P(192, 126);
    const pose = (a: number): Pose => ({ hip: along(A, a, TH + SH - 1), torso: a, head: a - 6, leg: A, legF: P(A.x + 3, A.y), foot: -80, arm: HAND, hand: -90 });
    return {
      view: 'side', props: [{ kind: 'table', x: 170, y: 118, w: 100 }], elbow: [1, 1], dur: 2.6,
      rest: pose(-21), peak: pose(-38),
      glows: [{ b: 'ch', t: 0.5, r: 16, dy: 7 }, { b: 'uaN', t: 0.5, r: 11, dy: 3 }],
    } as Spec;
  })(),

  /* jump to the top, then a slow 4-second lowering */
  'negative-pullup': (() => {
    const base = pull(26, 42, false, 10);
    return { ...base, dur: 5.6, seq: [{ at: 0, pose: base.rest }, { at: 10, pose: base.peak }, { at: 20, pose: base.peak }, { at: 92, pose: base.rest }, { at: 100, pose: base.rest }] } as Spec;
  })(),

  /* hands on a bench: same push-up, steeper body angle */
  'incline-pushup': (() => {
    const A = P(75, 228), HAND = P(203, 191);
    const pose = (a: number): Pose => ({ hip: along(A, a, TH + SH), torso: a, head: a - 10, leg: A, foot: 70, arm: HAND, hand: 0 });
    return {
      view: 'side', props: [{ kind: 'bench', x: 186, y: 196, w: 70 }], dur: 2.6,
      rest: pose(-39), peak: pose(-28),
      glows: [{ b: 'ch', t: 0.55, r: 15, dy: 6 }, { b: 'uaN', t: 0.5, r: 11, dy: 3 }],
    } as Spec;
  })(),

  /* knees down, feet up, straight line knee to shoulder */
  'knee-pushup': (() => {
    const K = P(110, 236), HAND = P(207, 237.5);
    const pose = (a: number): Pose => ({ hip: along(K, a, TH), torso: a, head: a - 12, leg: [a + 180, 212], foot: 236, arm: HAND, hand: 0 });
    return {
      view: 'side', dur: 2.6,
      rest: pose(-32.6), peak: pose(-11),
      glows: [{ b: 'ch', t: 0.55, r: 15, dy: 6 }, { b: 'uaN', t: 0.5, r: 11, dy: 3 }],
    } as Spec;
  })(),

  /* straight-arm plank: shoulders slide forward past the hands and back */
  'planche-lean': {
    view: 'side', dur: 3,
    rest: { ...PLANK_TOP },
    peak: { hip: P(179.8, 203.6), torso: -18, head: -30, arm: P(215, HAND_Y), armF: P(215, HAND_Y), hand: 0, leg: P(98, 230), foot: 50 },
    glows: [{ b: 'uaN', t: 0.15, r: 13 }, { b: 'ch', t: 0.6, r: 13, dy: 6 }, { b: 'tor', t: 0.5, r: 12, dy: 6 }],
  },

  /* tuck front lever: from a dead hang, hips rise until the back is level */
  'front-lever-raise': {
    view: 'side', elbow: [-1, -1], bar: 'side', barX: 144, dur: 3.2,
    rest: { hip: P(140, 146), torso: -90, head: -90, arm: P(144, 36), armF: P(146, 36), hand: -90, leg: [90, 90], foot: 30 },
    peak: { hip: P(177, 86), torso: -180, head: -186, arm: P(144, 36), armF: P(146, 36), hand: -90, leg: [158, 22], foot: 22 },
    bands: [{ a: P(150, 36), b: { j: 'hip' }, natural: 100 }],
    glows: [{ b: 'ch', t: 0.4, r: 16, dy: -6 }, { b: 'tor', t: 0.5, r: 14 }, { b: 'uaN', t: 0.3, r: 11 }],
  },

  /* slow plank knee drive: one knee pulls all the way to the chest, hips stay level */
  'plank-knee-crunch': {
    view: 'side', dur: 2.6,
    rest: { ...PLANK_TOP, leg: P(80, 227), legF: P(80, 227), foot: 70, footF: 70 },
    peak: { ...PLANK_TOP, hip: P(163, 196), torso: -22, head: -36, leg: P(80, 227), legF: P(184, 214), foot: 70, footF: 95 },
    glows: [{ b: 'tor', t: 0.5, r: 15, dy: 6 }, { b: 'thF', t: 0.25, r: 12 }],
  },

  /* supine, shoulders lifted, straight legs alternate up and down */
  'leg-scissors': {
    view: 'side', dur: 1.6,
    rest: { hip: P(134, 229), torso: 180, chest: 190, head: 198, arm: [6, 4], leg: [-42, -42], legF: [-12, -12], foot: -42, footF: -12 },
    peak: { hip: P(134, 229), torso: 180, chest: 190, head: 198, arm: [6, 4], leg: [-12, -12], legF: [-42, -42], foot: -12, footF: -42 },
    glows: [{ b: 'tor', t: 0.5, r: 15, dy: 5 }, { b: 'thN', t: 0.15, r: 12 }],
  },

  /* supine, knees bent, arms by the ears: curl the shoulders up */
  'long-arm-crunch': {
    view: 'side', dur: 2.4,
    rest: { hip: P(136, 229), torso: 180, chest: 180, head: 180, arm: [181, 181], leg: P(182, 236), legF: P(186, 236), foot: 0 },
    peak: { hip: P(136, 229), torso: 182, chest: 212, head: 218, arm: [222, 222], leg: P(182, 236), legF: P(186, 236), foot: 0 },
    glows: [{ b: 'ch', t: 0.4, r: 15, dy: 5 }, { b: 'tor', t: 0.6, r: 13, dy: 5 }],
  },

  /* front view side plank on one hand: top arm reaches up, then threads under the body */
  'side-plank-rotation': {
    view: 'front', knee: FRONT_KNEES, elbow: [1, -1], dur: 3,
    rest: { hip: P(134.5, 193), torso: -30, head: -30, leg: P(60, 236), legF: P(64, 232), foot: 0, footF: 0, arm: [-92, -92], armF: P(196, 236), handF: 0 },
    peak: { hip: P(140, 200), torso: -26, chest: -14, head: -4, leg: P(60, 236), legF: P(64, 232), foot: 0, footF: 0, arm: [118, 150], armF: P(196, 236), handF: 0 },
    glows: [{ b: 'tor', t: 0.5, r: 15 }, { b: 'ch', t: 0.3, r: 13 }],
  },
} as Record<string, Spec>);

/** exerciseDatabase `id` -> animation key (all 56 library exercises). Use as `avatarAnimation: EXERCISE_ANIMATION_MAP[id]`. */
export const EXERCISE_ANIMATION_MAP: Record<string, WorkoutAvatarAnimation> = {
  'bar-pullup-assisted': 'pullup-assisted', 'bar-band-lat-pulldown': 'lat-pulldown', 'bent-over-row-feet': 'bent-over-row',
  'single-arm-lat-row': 'single-arm-row', 'bar-dead-hang': 'dead-hang', 'reverse-fly-band': 'reverse-fly',
  'bar-pullup-strict': 'pullup-strict', 'bodyweight-superman-pulses': 'superman-pulse', 'bar-chinup-assisted': 'chinup-assisted',
  'bar-chinup-strict': 'chinup-strict', 'bodyweight-archer-pushup': 'archer-pushup-bodyweight', 'door-high-lat-pulldown': 'lat-pulldown',
  'behind-back-bicep-curl': 'behind-back-curl', 'tube-concentration-curl': 'concentration-curl', 'hammer-curl-band': 'hammer-curl',
  'standing-bicep-curl': 'bicep-curl', 'banded-archer-pushup': 'archer-pushup', 'chest-pushup-banded': 'pushup',
  'incline-chest-press': 'incline-press', 'chest-fly-middle': 'chest-fly', 'bodyweight-pushup-downward-dog': 'pushup-downward-dog',
  'bodyweight-pushup-standard': 'pushup-standard', 'chest-press-standing': 'chest-press', 'bodyweight-bicycle-crunches': 'bicycle-crunch',
  'bodyweight-mountain-climbers': 'mountain-climbers', 'bar-hanging-leg-raise': 'hanging-knee-raise', 'band-woodchopper-high-low': 'woodchopper',
  'kneeling-cable-crunch-band': 'ab-crunch', 'pallof-press-anti-rotation': 'pallof-press', 'bodyweight-plank-shoulder-taps': 'plank-shoulder-tap',
  'bodyweight-v-ups': 'v-up', 'reverse-bicep-curl-band': 'reverse-curl', 'bodyweight-full-burpees': 'burpee', 'band-thruster': 'squat-press',
  'bodyweight-glute-bridge': 'glute-bridge-bodyweight', 'glute-bridge-loop': 'glute-bridge', 'lateral-band-walk': 'monster-walk',
  'standing-glute-kickback': 'glute-kickback', 'bodyweight-sumo-squat-pulse': 'sumo-squat', 'band-good-morning': 'good-morning',
  'chris-heria-deadlift': 'deadlift', 'romanian-deadlift-band': 'rdl', 'bodyweight-reverse-lunge': 'reverse-lunge-bodyweight',
  'banded-lunges': 'reverse-lunge', 'bodyweight-jump-squats': 'jump-squat', 'bodyweight-standing-calf-raise': 'calf-raise-bodyweight',
  'banded-squat-front': 'squat', 'tube-calf-raise': 'calf-raise', 'bodyweight-air-squat': 'air-squat', 'front-raise-band': 'front-raise',
  'bar-band-face-pull': 'face-pull', 'lateral-deltoid-raise': 'lateral-raise', 'seated-face-pull': 'mid-face-pull',
  'bodyweight-pike-pushup': 'pike-pushup', 'overhead-shoulder-press': 'overhead-press', 'bar-band-tricep-pushdown': 'tricep-pushdown',
  'bodyweight-diamond-pushup': 'diamond-pushup', 'tricep-pushdown-band': 'tricep-pushdown', 'overhead-tricep-extension': 'tricep-overhead',
};

/* ========================================================================== */
/*  SHAPES                                                                     */
/* ========================================================================== */
const capsule = (len: number, w0: number, w1: number) =>
  `M 0 ${-w0 / 2} L ${len} ${-w1 / 2} A ${w1 / 2} ${w1 / 2} 0 0 1 ${len} ${w1 / 2} L 0 ${w0 / 2} A ${w0 / 2} ${w0 / 2} 0 0 1 0 ${-w0 / 2} Z`;
const trap = (x0: number, x1: number, w0: number, w1: number) =>
  `M ${x0} ${-w0 / 2} L ${x1} ${-w1 / 2} L ${x1} ${w1 / 2} L ${x0} ${w0 / 2} Z`;
const arcPt = (cx: number, cy: number, r: number, deg: number) => `${f1(cx + r * Math.cos(deg * D2R))} ${f1(cy + r * Math.sin(deg * D2R))}`;

const Ring: React.FC<{ r?: number }> = ({ r = 4 }) => (
  <circle cx="0" cy="0" r={r} fill="#FFD54F" stroke="#0F172A" strokeWidth="1.5" />
);

const Head: React.FC<{ len: number; side: boolean }> = ({ len, side }) => {
  const r = 12.5;
  const hair = side
    ? `M ${arcPt(len, 0, r, -112)} A ${r} ${r} 0 0 1 ${arcPt(len, 0, r, 48)} Z`
    : `M ${arcPt(len, 0, r, -74)} A ${r} ${r} 0 0 1 ${arcPt(len, 0, r, 74)} Z`;
  return (
    <>
      <path d={capsule(len, 9, 8)} fill="url(#avatarSkinWarm)" />
      <circle cx={len} cy="0" r={r} fill="url(#avatarSkinWarm)" stroke="#FFCC80" strokeWidth="1" />
      {side ? (
        <>
          <path d={`M ${len + 1.5} ${r - 0.8} L ${len - 0.5} ${r + 4} L ${len - 3.5} ${r - 0.8} Z`} fill="#FFCC80" />
          <circle cx={len + 2} cy={r - 4.6} r="1.2" fill="#0F172A" />
        </>
      ) : (
        <>
          <circle cx={len - 1} cy="-4.2" r="1.2" fill="#0F172A" />
          <circle cx={len - 1} cy="4.2" r="1.2" fill="#0F172A" />
        </>
      )}
      <path d={hair} fill="#0F172A" />
    </>
  );
};

/* ========================================================================== */
/*  RECURSIVE ARTICULATED BONE RENDERER                                        */
/*  <g class=anim style=transform-origin:joint> -> bone art -> child bones     */
/* ========================================================================== */
const SKIN_NEAR = 'url(#avatarSkinWarm)';
const SKIN_FAR = 'url(#avatarSkinShadow)';

interface RenderCtx { spec: Spec; S: Solved; m: Motion; L: Record<BoneId, number> }

const renderBone = (id: BoneId, c: RenderCtx): React.ReactNode => {
  const { spec, S, m, L } = c;
  const front = spec.view === 'front';
  const sd = id.endsWith('F') ? 'F' : 'N';
  const far = !front && sd === 'F';
  const skin = far ? SKIN_FAR : SKIN_NEAR;
  const len = L[id];
  const st = S.st[id];
  const ang = S.abs[id];
  const ringR = far ? 3.2 : 4;
  const cls = m.has.has(id) ? `${m.ns}-${id}` : undefined;
  const frame = `translate(${f1(st.x)} ${f1(st.y)}) rotate(${f1(ang)})`;

  const glows = (spec.glows ?? []).map((g, i) => ({ g, i })).filter(({ g }) => g.b === id);
  const loops = (spec.loops ?? []).filter((l) => l.b === id);
  const glowEls = glows.map(({ g, i }) => (
    <circle key={`g${i}`} cx={f1(g.t * len)} cy={g.dy ?? 0} r={g.r} fill="url(#muscleGlow)" className={`${m.ns}-g${i}`} style={{ opacity: 0.12, pointerEvents: 'none' }} />
  ));
  const loopEls = loops.map((l, i) => (
    <g key={`l${i}`}>
      <rect x={f1(l.t * len - 2.8)} y="-9" width="5.6" height="18" rx="2.8" fill="none" stroke="#2979FF" strokeWidth="3.4" />
      <line x1={f1(l.t * len)} y1="-7" x2={f1(l.t * len)} y2="7" stroke="#00E5FF" strokeWidth="1" opacity="0.8" />
    </g>
  ));
  const wrap = (art: React.ReactNode, kids: React.ReactNode = null, after: React.ReactNode = null, before: React.ReactNode = null) => (
    <g key={id} className={cls} style={{ transformOrigin: `${f1(st.x)}px ${f1(st.y)}px`, transformBox: 'view-box' }}>
      {before}
      <g transform={frame}>{art}{glowEls}{loopEls}{after}</g>
      {kids}
    </g>
  );

  switch (id) {
    case 'tor': {
      const art = front ? (
        <>
          <rect x="-13" y="-17" width="29" height="34" rx="9" fill="url(#avatarShortsDark)" stroke="#020617" strokeWidth="1" />
          <path d={trap(10, len, 30, 28)} fill="url(#avatarTopGold)" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <rect x="-13" y="-13" width="29" height="29" rx="10" fill="url(#avatarShortsDark)" stroke="#020617" strokeWidth="1" />
          <path d={trap(10, len, 26, 25)} fill="url(#avatarTopGold)" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
        </>
      );
      return wrap(art, renderBone('ch', c), <Ring r={4.4} />);
    }
    case 'ch': {
      const art = front ? (
        <>
          <path d={trap(0, len, 28, 41)} fill="url(#avatarTopGold)" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={`M ${len - 1} -8 Q ${len - 8} 0 ${len - 1} 8`} fill="none" stroke="#D97706" strokeWidth="1.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d={trap(0, len, 25, 29)} fill="url(#avatarTopGold)" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={`M 4 -9 Q ${len * 0.55} -12 ${len - 2} -8`} fill="none" stroke="#FFD54F" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
        </>
      );
      const kids = (
        <>
          {renderBone('hd', c)}
          {renderBone('uaN', c)}
        </>
      );
      return wrap(art, kids, <Ring r={4.4} />, renderBone('uaF', c));
    }
    case 'hd':
      return wrap(<Head len={len} side={!front} />);
    case 'uaN': case 'uaF':
      return wrap(<path d={capsule(len, 14, 11)} fill={skin} stroke="#E6A860" strokeWidth="0.8" />, renderBone(`fa${sd}` as BoneId, c), <Ring r={ringR} />);
    case 'faN': case 'faF':
      return wrap(<path d={capsule(len, 11, 8.5)} fill={skin} stroke="#E6A860" strokeWidth="0.8" />, renderBone(`hn${sd}` as BoneId, c), <Ring r={ringR - 0.3} />);
    case 'hnN': case 'hnF':
      return wrap(
        <>
          <path d={capsule(len, 8.5, 9)} fill={skin} stroke="#E6A860" strokeWidth="0.8" />
          <circle cx={len - 0.5} cy="0" r="5.2" fill={skin} stroke="#E6A860" strokeWidth="0.8" />
          {spec.handles && <rect x={len - 2.2} y="-7.5" width="4.4" height="15" rx="2.2" fill="#2979FF" stroke="#0F172A" strokeWidth="1" />}
        </>,
        null,
        <Ring r={ringR - 0.6} />,
      );
    case 'thN': case 'thF':
      return wrap(
        <>
          <path d={capsule(len, 20, 14)} fill={skin} stroke="#E6A860" strokeWidth="0.8" />
          <path d={capsule(len * 0.5, 22, 18.5)} fill="url(#avatarShortsDark)" stroke="#020617" strokeWidth="0.8" />
        </>,
        renderBone(`sh${sd}` as BoneId, c),
        <Ring r={ringR + 0.4} />,
      );
    case 'shN': case 'shF':
      return wrap(<path d={capsule(len, 14, 9)} fill={SKIN_FAR === skin ? skin : 'url(#avatarSkinShadow)'} stroke="#E6A860" strokeWidth="0.8" />, renderBone(`ft${sd}` as BoneId, c), <Ring r={ringR} />);
    case 'ftN': case 'ftF':
      return wrap(
        front ? (
          <>
            <ellipse cx="4.5" cy="0" rx="6.5" ry="7" fill="#0F172A" />
            <path d="M 10.5 -5.5 L 10.5 5.5" stroke="#F8FAFC" strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d={`M -6 -3 L 9 -3 Q 18 -2 19.5 3 L 19.5 5.5 L -6 5.5 Z`} fill="#0F172A" stroke="#020617" strokeWidth="0.8" strokeLinejoin="round" />
            <rect x="-6" y="3.7" width="25.5" height="1.8" rx="0.9" fill="#F8FAFC" />
          </>
        ),
        null,
        <Ring r={ringR - 0.4} />,
      );
  }
};

/* ========================================================================== */
/*  FIXTURES                                                                   */
/* ========================================================================== */
const PullUpBarFront: React.FC = () => (
  <g id="pullup-bar-fixture">
    <path d="M 32 10 L 56 26 L 32 42 Z" fill="url(#mountRed)" stroke="#EF9A9A" strokeWidth="1.5" />
    <circle cx="40" cy="26" r="3.2" fill="#FFEAEA" stroke="#B71C1C" strokeWidth="1.2" />
    <path d="M 248 10 L 224 26 L 248 42 Z" fill="url(#mountRed)" stroke="#EF9A9A" strokeWidth="1.5" />
    <circle cx="240" cy="26" r="3.2" fill="#FFEAEA" stroke="#B71C1C" strokeWidth="1.2" />
    <rect x="48" y="22" width="184" height="11" rx="5.5" fill="url(#barMetalRed)" stroke="#B71C1C" strokeWidth="1.5" />
    <rect x="88" y="23" width="30" height="9" rx="2" fill="#C62828" stroke="#EF5350" strokeWidth="1" opacity="0.9" />
    <rect x="162" y="23" width="30" height="9" rx="2" fill="#C62828" stroke="#EF5350" strokeWidth="1" opacity="0.9" />
  </g>
);

const PullUpBarSide: React.FC<{ x: number }> = ({ x }) => (
  <g id="pullup-bar-fixture-side">
    <rect x="30" y="8" width="12" height="42" rx="4" fill="url(#mountRed)" stroke="#EF9A9A" strokeWidth="1.5" />
    <circle cx="36" cy="18" r="2.8" fill="#FFEAEA" stroke="#B71C1C" strokeWidth="1.2" />
    <circle cx="36" cy="40" r="2.8" fill="#FFEAEA" stroke="#B71C1C" strokeWidth="1.2" />
    <rect x="40" y="24" width={x - 40} height="11" rx="3" fill="url(#barMetalRed)" stroke="#B71C1C" strokeWidth="1.5" />
    <circle cx={x} cy="29.5" r="7" fill="url(#barMetalRed)" stroke="#B71C1C" strokeWidth="1.5" />
    <circle cx={x - 2} cy="27.5" r="2.2" fill="#EF5350" opacity="0.9" />
  </g>
);

const PROP_FILL = '#2B3441', PROP_TOP = '#3D4858', PROP_EDGE = '#5B6B80';
const Prop: React.FC<{ p: PropSpec }> = ({ p }) => {
  const w = p.w ?? 12;
  switch (p.kind) {
    case 'bench':
      return (
        <g>
          <rect x={p.x + 5} y={p.y + 6} width="5" height={FLOOR - p.y - 6} fill={PROP_FILL} />
          <rect x={p.x + w - 10} y={p.y + 6} width="5" height={FLOOR - p.y - 6} fill={PROP_FILL} />
          <rect x={p.x} y={p.y} width={w} height="9" rx="3" fill={PROP_TOP} stroke={PROP_EDGE} strokeWidth="1.2" />
        </g>
      );
    case 'box':
      return <rect x={p.x} y={p.y} width={w} height={FLOOR - p.y} rx="4" fill={PROP_FILL} stroke={PROP_EDGE} strokeWidth="1.2" />;
    case 'table':
      return (
        <g>
          <rect x={p.x + w - 12} y={p.y + 7} width="6" height={FLOOR - p.y - 7} fill={PROP_FILL} />
          <rect x={p.x} y={p.y} width={w} height="8" rx="2.5" fill={PROP_TOP} stroke={PROP_EDGE} strokeWidth="1.2" />
        </g>
      );
    case 'post':
      return <rect x={p.x} y={p.y} width={w} height={FLOOR - p.y} rx="3" fill={PROP_TOP} stroke={PROP_EDGE} strokeWidth="1.2" />;
    case 'dipbar':
      return (
        <g>
          <rect x={p.x - 3} y={p.y} width="6" height={FLOOR - p.y} fill={PROP_FILL} />
          <circle cx={p.x} cy={p.y} r="7" fill="url(#barMetalRed)" stroke="#B71C1C" strokeWidth="1.5" />
          <circle cx={p.x - 2} cy={p.y - 2} r="2.2" fill="#EF5350" opacity="0.9" />
        </g>
      );
  }
};

const DoorAnchor: React.FC<{ p: Pt }> = ({ p }) =>
  p.y < 60 ? (
    <g>
      <rect x={p.x - 10} y={p.y - 8} width="20" height="14" rx="4" fill="url(#mountRed)" stroke="#B71C1C" strokeWidth="1.5" />
      <circle cx={p.x} cy={p.y - 1} r="3.5" fill="#FFEAEA" />
      <rect x={p.x - 4} y={p.y + 6} width="8" height="6" rx="2" fill="#E53935" />
    </g>
  ) : (
    <g>
      <rect x={p.x - 6} y={p.y - 22} width="12" height="44" rx="4" fill="url(#mountRed)" stroke="#B71C1C" strokeWidth="1.5" />
      <circle cx={p.x} cy={p.y} r="4" fill="#FFEAEA" />
      <rect x={p.x + (p.x < 140 ? 6 : -12)} y={p.y - 4} width="6" height="8" rx="2" fill="#E53935" />
    </g>
  );

/* ========================================================================== */
/*  COMPONENT                                                                  */
/* ========================================================================== */
export const WorkoutAvatar: React.FC<WorkoutAvatarProps> = ({
  animationType,
  anchorPosition = 'Under Feet',
  exerciseName = '',
  bandColorHex = '#6EA8FF',
  size = 'md',
  isPaused = false,
}) => {
  // Dimension presets
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-44 h-44',
    lg: 'w-64 h-64 md:w-72 md:h-72',
  }[size];

  // Dynamic resistance band color matching equipment / stealth theme
  const bandColor = bandColorHex || '#E2F952';

  // Resolve best animation fallback based on name or anchor if undefined
  const resolvedAnim: WorkoutAvatarAnimation = animationType || (() => {
    const lower = exerciseName.toLowerCase();
    const has = (...k: string[]) => k.some((x) => lower.includes(x));
    if (has('burpee')) return 'burpee';
    if (has('mountain')) return 'mountain-climbers';
    if (has('v-up', 'v up', 'jackknife')) return 'v-up';
    if (has('bicycle')) return 'bicycle-crunch';
    if (has('shoulder tap')) return 'plank-shoulder-tap';
    if (has('downward dog')) return 'pushup-downward-dog';
    if (has('pike')) return 'pike-pushup';
    if (has('diamond')) return 'diamond-pushup';
    if (has('superman')) return 'superman-pulse';
    if (has('jump squat')) return 'jump-squat';
    if (has('sumo')) return 'sumo-squat';
    if (has('dead hang')) return 'dead-hang';
    if (has('standard') && has('push')) return 'pushup-standard';
    if (has('alternating') && has('lunge')) return 'reverse-lunge-bodyweight';
    if (has('floor') && has('calf')) return 'calf-raise-bodyweight';
    if (has('bodyweight') && has('bridge')) return 'glute-bridge-bodyweight';
    if (has('bodyweight', 'tempo') && has('squat')) return 'air-squat';
    if (has('decompression')) return 'dead-hang';
    if (has('hanging', 'leg raise', 'knee raise')) return has('straight') ? 'hanging-leg-raise' : has('knee') ? 'hanging-knee-raise' : 'hanging-leg-raise';
    if (has('monster')) return 'monster-walk';
    if (has('chin-up', 'chin up', 'chinup')) return has('assist', 'band') || !has('strict') ? 'chinup-assisted' : 'chinup-strict';
    if (has('strict') && has('pull-up', 'pull up', 'pullup')) return 'pullup-strict';
    if (has('pull-up', 'pull up', 'pullup', 'hang')) return 'pullup-assisted';
    if (has('archer')) return has('band') ? 'archer-pushup' : 'archer-pushup-bodyweight';
    if (has('hammer')) return 'hammer-curl';
    if (has('concentration')) return 'concentration-curl';
    if (has('behind-the-back', 'behind the back')) return 'behind-back-curl';
    if (has('reverse') && has('curl')) return 'reverse-curl';
    if (has('bicep', 'curl')) return 'bicep-curl';
    if (has('overhead') && has('tricep', 'extension')) return 'tricep-overhead';
    if (has('pushdown', 'tricep')) return 'tricep-pushdown';
    if (has('reverse fly', 'rear delt')) return 'reverse-fly';
    if (has('fly')) return 'chest-fly';
    if (has('incline')) return 'incline-press';
    if (has('chest press')) return 'chest-press';
    if (has('pushup', 'push-up', 'push up')) return 'pushup';
    if (has('thruster') || (has('squat') && has('press'))) return 'squat-press';
    if (has('reverse') && has('lunge')) return 'reverse-lunge';
    if (has('lunge')) return 'lunge';
    if (has('calf')) return 'calf-raise';
    if (has('kickback')) return 'glute-kickback';
    if (has('bridge', 'thrust')) return 'glute-bridge';
    if (has('good morning', 'good-morning')) return 'good-morning';
    if (has('rdl', 'romanian')) return 'rdl';
    if (has('squat', 'walk')) return 'squat';
    if (has('pulldown', 'lat pull')) return 'lat-pulldown';
    if (has('face pull')) return has('mid') ? 'mid-face-pull' : 'face-pull';
    if (has('single-arm', 'single arm', 'staggered') && has('row')) return 'single-arm-row';
    if (has('row')) return 'bent-over-row';
    if (has('overhead', 'shoulder press')) return 'overhead-press';
    if (has('front') && has('raise')) return 'front-raise';
    if (has('lateral')) return 'lateral-raise';
    if (has('deadlift')) return 'deadlift';
    if (has('woodchop', 'wood chop', 'chopper')) return 'woodchopper';
    if (has('pallof')) return 'pallof-press';
    if (has('crunch')) return 'ab-crunch';
    return 'bicep-curl';
  })();

  const spec = SPECS[resolvedAnim] ?? SPECS['bicep-curl'];
  const ns = `wa-${resolvedAnim}`;
  const m = useMemo(() => buildMotion(spec, ns), [spec, ns]);
  const S = m.rest;
  const L = useMemo(() => lengthsFor(spec), [spec]);
  const ctx: RenderCtx = { spec, S, m, L };
  const dur = spec.dur ?? 2.6;

  // Fixtures: the exercise decides what it needs; anchorPosition can request one for exercises that have none.
  const barRequested = anchorPosition === 'Bar' || anchorPosition === 'Pull-Up Bar';
  const sideBarX = spec.bar === 'side' ? spec.barX ?? 144 : barRequested && spec.view !== 'front' && spec.anchors ? spec.anchors[0].x : undefined;
  const showBarFront = spec.bar === 'front' || (!spec.bar && barRequested && spec.view === 'front');
  const extraAnchors: Pt[] = spec.anchors || barRequested ? [] : anchorPosition === 'Door High' ? [P(166, 20)] : anchorPosition === 'Door Middle' ? [P(40, 125)] : anchorPosition === 'Door Low' ? [P(36, 214)] : [];
  const anchors = sideBarX !== undefined && barRequested ? [] : [...(spec.anchors ?? []), ...extraAnchors];

  const cssClasses = Array.from(m.has)
    .map((n) => `.${ns}-${n}{animation:${ns}-${n} ${dur}s cubic-bezier(0.4, 0, 0.2, 1) infinite;}`)
    .join('\n');

  const bandEls = (spec.bands ?? []).map((b, i) => {
    const g = m.bandRest[i];
    return (
      <g key={`band${i}`}>
        <path d={g.d} fill="none" stroke={bandColor} strokeWidth={g.w} strokeLinecap="round" className={`${ns}-b${i}`} />
        <path d={g.d} fill="none" stroke="#FFFFFF" strokeWidth={g.w * 0.28} strokeLinecap="round" opacity="0.4" className={`${ns}-b${i}h`} />
      </g>
    );
  });
  const floorLoops = (spec.bands ?? []).filter((b) => b.floorA).map((b, i) => {
    const p = resolveAnchor(b.a, S, spec);
    return (
      <g key={`fl${i}`}>
        <ellipse cx={f1(p.x)} cy={f1(p.y)} rx="17" ry="3.6" fill="none" stroke={bandColor} strokeWidth="4.4" />
        <ellipse cx={f1(p.x)} cy={f1(p.y - 0.8)} rx="14" ry="2.2" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" />
      </g>
    );
  });

  return (
    <div className={`relative ${sizeClasses} mx-auto flex items-center justify-center overflow-hidden rounded-3xl bg-hy-surface border border-hy-elevated shadow-inner`}>
      {/* Background Soft Glow */}
      <div
        className="absolute inset-4 rounded-full opacity-10 blur-2xl transition-colors duration-700 pointer-events-none"
        style={{ backgroundColor: bandColor }}
      />

      <svg
        viewBox="0 0 280 280"
        className={`${ns}-svg w-full h-full drop-shadow-xl overflow-visible`}
        role="img"
        aria-label={exerciseName || resolvedAnim}
      >
        <defs>
          {/* HIGH-CONTRAST PULL-UP BAR METALLIC RED GRADIENT */}
          <linearGradient id="barMetalRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF5350" />
            <stop offset="35%" stopColor="#E53935" />
            <stop offset="70%" stopColor="#C62828" />
            <stop offset="100%" stopColor="#B71C1C" />
          </linearGradient>

          <linearGradient id="mountRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E53935" />
            <stop offset="100%" stopColor="#B71C1C" />
          </linearGradient>

          {/* HIGH-CONTRAST RESISTANCE BAND GRADIENT */}
          <linearGradient id="bandBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E2F952" />
            <stop offset="100%" stopColor="#B0CE18" />
          </linearGradient>

          {/* HIGH-CONTRAST AVATAR PALETTE (Gold/Amber Top & Warm Natural Limbs) */}
          <linearGradient id="avatarTopGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="40%" stopColor="#FFB300" />
            <stop offset="85%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>

          <linearGradient id="avatarSkinWarm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF3E0" />
            <stop offset="50%" stopColor="#FFE0B2" />
            <stop offset="100%" stopColor="#FFCC80" />
          </linearGradient>

          <linearGradient id="avatarSkinShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFCC80" />
            <stop offset="100%" stopColor="#FFA726" />
          </linearGradient>

          <linearGradient id="avatarShortsDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#262626" />
            <stop offset="60%" stopColor="#181818" />
            <stop offset="100%" stopColor="#0D0D0D" />
          </linearGradient>

          {/* Floor Mat Base */}
          <linearGradient id="floorMat" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E1E1E" stopOpacity="0.05" />
            <stop offset="25%" stopColor="#242424" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#242424" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1E1E1E" stopOpacity="0.05" />
          </linearGradient>

          {/* Muscle Activation Glow Gradient */}
          <radialGradient id="muscleGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E2F952" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#E2F952" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E2F952" stopOpacity="0" />
          </radialGradient>

          {/* Articulated multi-pivot keyframes, generated from the kinematic rig above.
              Each bone rotates about its own joint (transform-origin = exact joint coordinate);
              stops are sampled from cubic-bezier(0.4, 0, 0.2, 1) with planted feet / gripped hands solved by IK. */}
          <style>{`
            ${m.css}
            ${cssClasses}
            .${ns}-svg * { animation-play-state: ${isPaused ? 'paused' : 'running'}; }
            @media (prefers-reduced-motion: reduce) { .${ns}-svg * { animation-play-state: paused; } }
          `}</style>
        </defs>

        {/* FLOOR MAT BASE */}
        <ellipse cx="140" cy="245" rx="100" ry="15" fill="url(#floorMat)" />
        <ellipse cx="140" cy="245" rx="80" ry="10" fill="#1A2026" stroke="#242C35" strokeWidth="1.5" />

        {/* RED EQUIPMENT: BARS + DOOR ANCHORS */}
        {showBarFront && <PullUpBarFront />}
        {sideBarX !== undefined && <PullUpBarSide x={sideBarX} />}
        {anchors.map((a, i) => <DoorAnchor key={`anc${i}`} p={a} />)}
        {(spec.props ?? []).map((pr, i) => <Prop key={`prop${i}`} p={pr} />)}

        {/* BLUE: foot / toe anchored band loops lie on the mat */}
        {floorLoops}

        {/* ATHLETE: legs -> bands -> torso, head & arms (bands on top for hand-to-hand loops) */}
        <g id="athlete">
          <g className={m.has.has('root') ? `${ns}-root` : undefined}>
            {renderBone('thF', ctx)}
            {renderBone('thN', ctx)}
          </g>
          {!spec.bandsOnTop && bandEls}
          <g className={m.has.has('root') ? `${ns}-root` : undefined}>
            {renderBone('tor', ctx)}
          </g>
          {spec.bandsOnTop && bandEls}
        </g>
      </svg>
    </div>
  );
};
