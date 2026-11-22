/**
 * Complete written instructions for every exercise: someone who has never seen
 * the movement should be able to do it correctly from this text alone.
 *
 *   setup   – where to put the band, your feet and your hands before the first rep
 *   steps   – one rep, in order, with the position to stop at
 *   breathe – when to breathe in and out
 *   feel    – where you should feel the work (and a warning sign if you feel it elsewhere)
 */
export interface HowTo {
  setup: string;
  steps: string[];
  breathe: string;
  feel: string;
}

export const HOW_TO: Record<string, HowTo> = {
  /* ------------------------------------------------------------------ BAR */
  'bar-pullup-assisted': {
    setup: 'Loop a long band over the pull-up bar and pull one end through the other so it tightens around the bar. Grab the bar with palms facing away, hands a little wider than your shoulders, then put one knee (or both feet) into the hanging loop.',
    steps: [
      'Start from a full hang with straight arms. Pull your shoulders down away from your ears before you bend your elbows.',
      'Drive your elbows down toward your back pockets and pull your chest toward the bar.',
      'Stop when your chin is clearly above the bar. Keep your legs still: no kicking.',
      'Lower yourself slowly, about 3 seconds, until your arms are completely straight again.',
    ],
    breathe: 'Breathe out as you pull up, breathe in as you lower.',
    feel: 'The large muscles at the sides of your back (lats) and the front of your upper arms. If your neck takes over, you shrugged; pull the shoulders down first.',
  },
  'bar-chinup-assisted': {
    setup: 'Loop a long band over the bar so it tightens around it, and place one knee or both feet in the loop. Grab the bar with palms facing you, hands about shoulder-width apart.',
    steps: [
      'Hang with straight arms and pull your shoulders down and slightly back.',
      'Pull your elbows down in front of your ribs and lift your chest toward your hands.',
      'Stop when your chin passes above the bar.',
      'Lower slowly for about 3 seconds until your elbows are fully straight.',
    ],
    breathe: 'Breathe out on the way up, in on the way down.',
    feel: 'Your biceps working hard together with your lats.',
  },
  'bar-pullup-strict': {
    setup: 'Grab the bar with palms facing away, hands slightly wider than shoulder-width. Hang with straight arms, legs together and slightly in front of you, stomach tight.',
    steps: [
      'Pull your shoulder blades down and back so your body lifts an inch with straight arms.',
      'Bend your elbows and drive them down to your sides, bringing your chest toward the bar.',
      'Get your chin over the bar without craning your neck forward.',
      'Lower under control until your arms are straight. Do not swing into the next rep.',
    ],
    breathe: 'Breathe out as you pull, in as you lower.',
    feel: 'Your lats and upper back first, biceps second. A swinging body means the reps are too fast or too many.',
  },
  'bar-hanging-leg-raise': {
    setup: 'Hang from the bar with palms facing away, hands shoulder-width apart, arms straight. Squeeze the bar and pull your shoulders slightly down so you are not hanging loosely.',
    steps: [
      'Brace your stomach as if about to be poked in the belly.',
      'Bend your knees and lift them up toward your chest by curling your hips upward.',
      'Stop when your knees are at least hip height (higher is better), pause for a moment.',
      'Lower your legs slowly without letting your body swing. Straighten your legs fully between reps for the harder version.',
    ],
    breathe: 'Breathe out as the knees come up, in as they lower.',
    feel: 'Your lower stomach. If you feel only the front of your hips, curl your pelvis up more at the top.',
  },
  'bar-band-lat-pulldown': {
    setup: 'Loop a long band over the pull-up bar so both ends hang down. Kneel underneath it, upright, and hold one side of the loop in each hand with arms reaching up and slightly forward.',
    steps: [
      'Sit tall on your knees with your stomach tight; lean back only very slightly.',
      'Pull your elbows down and back toward your sides, bringing your hands down to the height of your chin or upper chest.',
      'Squeeze your shoulder blades together and down for one second.',
      'Let your arms rise slowly until they are straight overhead again.',
    ],
    breathe: 'Breathe out as you pull down, in as your arms go back up.',
    feel: 'The sides of your back under your armpits.',
  },
  'bar-band-face-pull': {
    setup: 'Loop the band over the pull-up bar. Hold one end in each hand, palms facing down, and step back until the band is tight with your arms straight out in front of you at head height.',
    steps: [
      'Stand tall with your feet hip-width apart and stomach braced.',
      'Pull the band toward your face, leading with your elbows, which stay high and wide.',
      'At the end, your hands are beside your ears and your elbows are level with your shoulders, like flexing in a double-biceps pose.',
      'Pause, then let your arms straighten slowly back to the start.',
    ],
    breathe: 'Breathe out as you pull, in as you return.',
    feel: 'The backs of your shoulders and between your shoulder blades.',
  },
  'bar-band-tricep-pushdown': {
    setup: 'Loop the band over the pull-up bar so it hangs in front of you. Hold it with both hands at chest height, elbows bent and tucked against your sides. Lean forward very slightly from the hips.',
    steps: [
      'Keep your upper arms glued to your sides for the whole set.',
      'Push your hands down until your arms are completely straight.',
      'Squeeze the backs of your arms for one second at the bottom.',
      'Let your hands rise slowly back to chest height; only your forearms move.',
    ],
    breathe: 'Breathe out as you push down, in as you return.',
    feel: 'The back of your upper arms (triceps). If your shoulders move, lighten the band.',
  },
  'bar-dead-hang': {
    setup: 'Grab the bar with palms facing away, hands shoulder-width apart. Step off whatever you used to reach it.',
    steps: [
      'Let your body hang straight down with your arms fully straight.',
      'Relax your legs and let your hips and lower back stretch down.',
      'Keep a firm grip and keep your shoulders from crunching up into your ears: a tiny engagement is enough.',
      'Hold for the target time, then step down gently.',
    ],
    breathe: 'Slow, deep breaths throughout. Do not hold your breath.',
    feel: 'A stretch through your shoulders, back and spine, and your grip working.',
  },

  /* ----------------------------------------------------------- PUSH (BANDS) */
  'chest-press-standing': {
    setup: 'Anchor the band in a door at chest height. Face away from the door, hold one end in each hand at chest level with elbows bent, and step forward into a split stance until the band is tight.',
    steps: [
      'Brace your stomach and keep your chest up.',
      'Press both hands straight forward until your arms are straight and your hands meet in front of your chest.',
      'Squeeze your chest for one second.',
      'Let your hands come back slowly until they are just in front of your chest again.',
    ],
    breathe: 'Breathe out as you press, in as you return.',
    feel: 'Your chest, the front of your shoulders and the backs of your arms.',
  },
  'chest-fly-middle': {
    setup: 'Anchor the band at chest height in a door and face away. Hold one end in each hand with your arms open wide to the sides at shoulder height, elbows slightly bent. Step forward into a split stance until the band pulls back on your arms.',
    steps: [
      'Lock your elbows in that slightly bent position; they do not bend or straighten during the rep.',
      'Sweep your arms forward in a wide arc, like hugging a big tree.',
      'Bring your hands together in front of your chest and squeeze.',
      'Open your arms slowly back out until you feel a stretch across your chest.',
    ],
    breathe: 'Breathe out as your arms close, in as they open.',
    feel: 'Across the middle of your chest.',
  },
  'chest-pushup-banded': {
    setup: 'Hold one end of a long band in each hand and wrap the band across your upper back, just under your shoulder blades. Get into a push-up position with your hands on the band ends, under your shoulders.',
    steps: [
      'Make a straight line from head to heels: squeeze your glutes and brace your stomach.',
      'Bend your elbows and lower your chest until it is about a fist from the floor. Elbows point back at about 45°, not straight out.',
      'Push the floor away hard until your arms are straight against the band.',
      'Keep the body line straight on every rep.',
    ],
    breathe: 'Breathe in on the way down, out as you push up.',
    feel: 'Your chest, front shoulders and triceps. If your lower back aches, your hips are sagging.',
  },
  'banded-archer-pushup': {
    setup: 'Wrap a long band across your upper back and hold the ends under your hands. Set your hands about twice shoulder-width apart, fingers pointing forward or slightly out, in a wide push-up position.',
    steps: [
      'Shift your weight toward one hand and bend that elbow, lowering your chest toward that hand.',
      'Keep the other arm straight and long out to the side; it only helps a little.',
      'Push back up through the bent arm to the middle.',
      'Repeat to the other side. One left and one right is two reps.',
    ],
    breathe: 'Breathe in as you lower, out as you push up.',
    feel: 'Mostly the chest and triceps on the bent-arm side.',
  },
  'incline-chest-press': {
    setup: 'Anchor the band low in a door, near the floor. Face away, hold one end in each hand at shoulder height, and step forward until the band is tight.',
    steps: [
      'Stand tall in a split stance with your stomach braced.',
      'Press your hands forward and upward at an angle, finishing at about eye level with straight arms.',
      'Squeeze your upper chest at the top.',
      'Lower your hands slowly back to shoulder height.',
    ],
    breathe: 'Breathe out as you press, in as you return.',
    feel: 'The upper part of your chest and front of your shoulders.',
  },

  /* ----------------------------------------------------------- PULL (BANDS) */
  'bent-over-row-feet': {
    setup: 'Stand on the middle of a long band with feet hip-width apart. Hold one end in each hand. Bend your knees slightly and hinge forward from your hips until your back is at about 45°, keeping your back flat.',
    steps: [
      'Let your arms hang straight down toward your knees.',
      'Pull both hands toward your lower ribs, driving your elbows back past your body.',
      'Squeeze your shoulder blades together for one second.',
      'Lower your hands slowly until your arms are straight. Your back angle stays the same throughout.',
    ],
    breathe: 'Breathe out as you row, in as you lower.',
    feel: 'Your mid-back and lats. If your lower back burns, hinge a little less and keep it flat.',
  },
  'single-arm-lat-row': {
    setup: 'Anchor the band at chest height in a door and face it. Hold the band in one hand and step back into a staggered stance (the leg on the same side as the working arm goes back). Lean forward slightly from the hips and rest your free hand on your front thigh.',
    steps: [
      'Start with the working arm straight, reaching toward the anchor.',
      'Pull your elbow back past your ribs, keeping it close to your body.',
      'Squeeze your back muscles; your torso does not twist.',
      'Let the arm reach forward slowly again. Finish the set, then switch sides.',
    ],
    breathe: 'Breathe out as you pull, in as you reach.',
    feel: 'The side of your back on the working arm.',
  },
  'seated-face-pull': {
    setup: 'Anchor the band in a door at face height and face it. Hold one end in each hand with palms facing down and step back until the band is tight with straight arms.',
    steps: [
      'Pull the band toward your forehead with your elbows high and wide.',
      'As your hands reach your face, rotate your forearms up so your knuckles point to the ceiling: a goalpost position.',
      'Hold that position for one second, shoulder blades squeezed.',
      'Reverse slowly: rotate back down, then straighten your arms.',
    ],
    breathe: 'Breathe out as you pull and rotate, in as you return.',
    feel: 'The backs of your shoulders and the small muscles around your shoulder blades.',
  },
  'reverse-fly-band': {
    setup: 'Hold a band in front of you at chest height with both hands, palms facing down, hands about shoulder-width apart and arms straight. (If you use a door anchor, anchor it at chest height and face it.)',
    steps: [
      'Stand tall with your knees soft and your stomach braced.',
      'Keeping your arms straight, open them out to the sides until they form a T.',
      'Squeeze your shoulder blades together for one second.',
      'Bring your arms back to the front slowly, controlling the band.',
    ],
    breathe: 'Breathe out as you open, in as you return.',
    feel: 'The backs of your shoulders and upper back.',
  },
  'door-high-lat-pulldown': {
    setup: 'Anchor the band at the top of a door. Kneel or sit facing the door, holding one end in each hand with arms straight up and slightly forward. Move back until the band is tight.',
    steps: [
      'Sit tall and brace your stomach.',
      'Pull your elbows down to your sides, bringing your hands to your upper chest.',
      'Squeeze your lats for one second.',
      'Let your arms return overhead slowly until straight.',
    ],
    breathe: 'Breathe out as you pull, in as you return.',
    feel: 'The sides of your back.',
  },

  /* ----------------------------------------------------------- SHOULDERS */
  'overhead-shoulder-press': {
    setup: 'Stand on the middle of a long band, feet hip-width apart. Hold one end in each hand at shoulder height, palms facing forward, elbows under your wrists.',
    steps: [
      'Squeeze your glutes and brace your stomach so your lower back does not arch.',
      'Press both hands straight up until your arms are straight overhead, biceps beside your ears.',
      'Pause at the top.',
      'Lower slowly back to shoulder height.',
    ],
    breathe: 'Breathe out as you press, in as you lower.',
    feel: 'Your shoulders and the backs of your arms.',
  },
  'lateral-deltoid-raise': {
    setup: 'Stand on the middle of a long band with feet hip-width apart. Hold one end in each hand at your sides, palms facing in, elbows slightly bent.',
    steps: [
      'Raise your arms out to the sides, leading with your elbows.',
      'Stop at shoulder height; your hands are level with or slightly below your elbows.',
      'Pause for a moment.',
      'Lower slowly to your sides. Do not shrug your shoulders up.',
    ],
    breathe: 'Breathe out as you raise, in as you lower.',
    feel: 'The outside of your shoulders. If your neck works, lower the band height or use a lighter band.',
  },
  'front-raise-band': {
    setup: 'Stand on the middle of a long band, feet hip-width apart. Hold one end in each hand in front of your thighs, palms facing your legs.',
    steps: [
      'Keep your arm straight with a soft elbow and raise one hand forward and up to shoulder height.',
      'Pause for a moment at shoulder height.',
      'Lower it slowly, then raise the other arm.',
      'Keep your body still; do not lean back to lift.',
    ],
    breathe: 'Breathe out as each arm rises, in as it lowers.',
    feel: 'The front of your shoulders.',
  },
  'band-upright-row': {
    setup: 'Stand on the middle of a long band with feet hip-width apart. Hold the band with both hands in front of your thighs, hands about shoulder-width apart, palms facing you.',
    steps: [
      'Pull your hands straight up along the front of your body, leading with your elbows.',
      'Stop when your elbows reach shoulder height; your hands are around chest height.',
      'Pause, then lower slowly.',
      'Keep your wrists below your elbows the whole time.',
    ],
    breathe: 'Breathe out as you pull up, in as you lower.',
    feel: 'Your side shoulders and upper traps. Stop the rep lower if you feel pinching in the shoulder.',
  },
  'band-pull-apart': {
    setup: 'Hold a band in front of you at chest height with both hands, palms facing down, hands shoulder-width apart, arms straight.',
    steps: [
      'Stand tall with ribs down and stomach braced.',
      'Pull the band apart by moving your straight arms out to the sides.',
      'Keep going until the band touches your chest and your arms make a T.',
      'Return slowly to the start without letting the band snap back.',
    ],
    breathe: 'Breathe out as you pull apart, in as you return.',
    feel: 'Between your shoulder blades and the backs of your shoulders.',
  },

  /* ----------------------------------------------------------- ARMS */
  'standing-bicep-curl': {
    setup: 'Stand on the middle of a long band, feet hip-width apart. Hold one end in each hand with arms straight at your sides, palms facing forward.',
    steps: [
      'Pin your elbows to your sides.',
      'Curl your hands up toward your shoulders by bending only at the elbows.',
      'Squeeze your biceps at the top.',
      'Lower slowly until your arms are completely straight.',
    ],
    breathe: 'Breathe out as you curl, in as you lower.',
    feel: 'The front of your upper arm. If your back sways, use a lighter band.',
  },
  'hammer-curl-band': {
    setup: 'Stand on the middle of the band. Hold one end in each hand at your sides with palms facing each other, thumbs pointing forward.',
    steps: [
      'Keep your elbows against your sides and your thumbs pointing up the whole time.',
      'Curl your hands up toward your shoulders.',
      'Pause at the top.',
      'Lower slowly until your arms are straight.',
    ],
    breathe: 'Breathe out as you curl, in as you lower.',
    feel: 'The front and outer side of your upper arm and the top of your forearm.',
  },
  'tube-concentration-curl': {
    setup: 'Kneel on one knee with the other foot flat on the floor in front of you. Put the band under that front foot. Hold the band in the hand on the same side, and rest the back of that upper arm against the inside of your front thigh, just above the knee.',
    steps: [
      'Let the arm hang straight down toward the floor.',
      'Curl your hand up toward your shoulder while your elbow stays braced on your thigh.',
      'Squeeze hard at the top for one second.',
      'Lower slowly until your arm is straight. Finish the set, then switch sides.',
    ],
    breathe: 'Breathe out as you curl, in as you lower.',
    feel: 'An intense squeeze in the biceps of the working arm.',
  },
  'behind-back-bicep-curl': {
    setup: 'Anchor the band low in a door and face away from it. Hold the band in one hand and step forward until your arm is pulled slightly behind your body with the band tight.',
    steps: [
      'Stand tall, elbow pointing down and slightly behind your hip.',
      'Curl your hand toward your shoulder without letting the elbow move forward.',
      'Squeeze the biceps at the top.',
      'Lower slowly until the arm is straight and slightly behind you again. Switch sides after the set.',
    ],
    breathe: 'Breathe out as you curl, in as you lower.',
    feel: 'A deep stretch and squeeze in the long head of the biceps.',
  },
  'reverse-bicep-curl-band': {
    setup: 'Stand on the middle of the band. Hold one end in each hand at your sides with palms facing backward (knuckles forward).',
    steps: [
      'Keep your elbows by your sides and your wrists straight.',
      'Curl your hands up toward your shoulders, knuckles leading.',
      'Pause at the top.',
      'Lower slowly to straight arms.',
    ],
    breathe: 'Breathe out as you curl, in as you lower.',
    feel: 'The top of your forearms and the outer part of the upper arm.',
  },
  'overhead-tricep-extension': {
    setup: 'Stand on one end of the band with your back foot in a split stance. Hold the other end with both hands behind your head, elbows bent and pointing at the ceiling.',
    steps: [
      'Keep your upper arms beside your head; only your forearms move.',
      'Straighten your arms to press your hands up toward the ceiling.',
      'Squeeze the backs of your arms at the top.',
      'Bend your elbows slowly to lower your hands behind your head.',
    ],
    breathe: 'Breathe out as you straighten, in as you lower.',
    feel: 'The backs of your upper arms, with a stretch at the bottom.',
  },
  'tricep-pushdown-band': {
    setup: 'Anchor the band at the top of a door. Face the door, hold the band with both hands at chest height, elbows bent and tucked into your sides.',
    steps: [
      'Keep your upper arms still against your sides.',
      'Push your hands down until your arms are straight.',
      'Squeeze for one second at the bottom.',
      'Let your hands rise slowly to chest height.',
    ],
    breathe: 'Breathe out as you push down, in as you return.',
    feel: 'The backs of your upper arms.',
  },
  'band-tricep-kickback': {
    setup: 'Anchor the band low in a door (or stand on it with your front foot). Hold it in one hand and hinge forward with a flat back. Lift the upper arm so it lines up with your torso, elbow bent at 90°.',
    steps: [
      'Keep the upper arm still, tight against your side.',
      'Straighten the elbow so your hand moves back behind you.',
      'Squeeze the back of the arm when it is fully straight.',
      'Bend the elbow slowly back to 90°. Switch arms after the set.',
    ],
    breathe: 'Breathe out as you straighten, in as you bend.',
    feel: 'The back of the working arm only.',
  },

  /* ----------------------------------------------------------- LEGS (BANDS) */
  'band-thruster': {
    setup: 'Stand on the middle of a long band with feet shoulder-width apart. Hold the ends at shoulder height, palms facing forward, elbows down.',
    steps: [
      'Sit your hips back and down into a squat until your thighs are about parallel to the floor, chest up.',
      'Drive up through your whole foot.',
      'As you stand, use that momentum to press your hands straight overhead.',
      'Lower your hands to your shoulders as you sit into the next squat.',
    ],
    breathe: 'Breathe in as you squat, out hard as you stand and press.',
    feel: 'Legs, glutes and shoulders: it should raise your heart rate quickly.',
  },
  'banded-squat-front': {
    setup: 'Stand on the band with feet shoulder-width apart, toes slightly out. Bring the band ends up to the front of your shoulders and hold them there, elbows pointing forward.',
    steps: [
      'Keep your chest up and elbows high.',
      'Sit your hips back and down, knees tracking over your toes, until your thighs are about parallel to the floor.',
      'Push through your whole foot to stand up tall.',
      'Squeeze your glutes at the top.',
    ],
    breathe: 'Breathe in on the way down, out on the way up.',
    feel: 'The front of your thighs and your glutes.',
  },
  'romanian-deadlift-band': {
    setup: 'Stand on the band with feet hip-width apart. Hold the ends in front of your thighs with straight arms. Bend your knees slightly and keep that bend the whole set.',
    steps: [
      'Push your hips straight back as if closing a car door with your backside.',
      'Let your hands slide down the front of your legs, back flat, until you feel a strong stretch in the backs of your thighs (usually mid-shin).',
      'Drive your hips forward to stand up tall.',
      'Squeeze your glutes at the top without leaning back.',
    ],
    breathe: 'Breathe in as you hinge down, out as you stand.',
    feel: 'A stretch then a squeeze in the backs of your thighs and your glutes. Not in your lower back.',
  },
  'band-good-morning': {
    setup: 'Stand on the band with feet hip-width apart and loop the other end behind your neck, resting on your upper back. Hold it at your shoulders. Soften your knees.',
    steps: [
      'Brace your stomach and keep your back flat.',
      'Push your hips back and bow forward until your chest is nearly parallel to the floor.',
      'Drive your hips forward to stand back up.',
      'Squeeze your glutes at the top.',
    ],
    breathe: 'Breathe in on the way down, out on the way up.',
    feel: 'The backs of your thighs and glutes. Stop higher if your back starts to round.',
  },
  'banded-lunges': {
    setup: 'Stand on the band with one foot and hold the ends at your shoulders or sides. Stand tall.',
    steps: [
      'Step the other foot back about two feet.',
      'Lower until your back knee nearly touches the floor; your front knee stays over your ankle.',
      'Push through the front heel to return to standing.',
      'Finish the set on one side, then switch the band to the other foot.',
    ],
    breathe: 'Breathe in as you lower, out as you stand.',
    feel: 'The front thigh and glute of the front leg.',
  },
  'chris-heria-deadlift': {
    setup: 'Stand on the middle of a long band with feet hip-width apart. Bend your knees and hips to grab the ends just outside your shins, back flat, chest up.',
    steps: [
      'Brace your stomach and pull the slack out of the band.',
      'Push the floor away through your whole foot, standing up as your hips and chest rise together.',
      'Finish tall with glutes squeezed and shoulders back.',
      'Lower by pushing your hips back and bending your knees until your hands reach shin height.',
    ],
    breathe: 'Big breath in before you lift, out as you finish standing.',
    feel: 'Glutes, hamstrings and back working together.',
  },
  'band-single-leg-rdl': {
    setup: 'Stand on the band with one foot. Hold the band ends in both hands in front of your thigh. Bend that knee slightly.',
    steps: [
      'Hinge forward at the hip while your free leg lifts straight behind you.',
      'Keep your hips level, as if your belt buckle points at the floor.',
      'Lower until your body and back leg are nearly parallel to the floor.',
      'Drive the standing hip forward to come back up. Switch legs after the set.',
    ],
    breathe: 'Breathe in as you hinge, out as you stand.',
    feel: 'The back of the standing thigh and glute, plus your balance muscles.',
  },
  'band-overhead-squat': {
    setup: 'Stand on the band with feet shoulder-width apart. Press the band ends overhead with straight arms, hands wider than shoulders.',
    steps: [
      'Keep your arms locked overhead and slightly behind your ears.',
      'Sit into a squat until your thighs are parallel to the floor; keep your chest up.',
      'Stand back up without letting the arms drift forward.',
      'Reset tall before the next rep.',
    ],
    breathe: 'Breathe in as you squat, out as you stand.',
    feel: 'Legs, upper back and shoulders. If the arms fall forward, use less depth.',
  },
  'tube-calf-raise': {
    setup: 'Stand on the band with the balls of your feet and hold the ends at your shoulders or sides. Stand tall.',
    steps: [
      'Rise up onto the balls of your feet as high as you can.',
      'Hold the top for one second.',
      'Lower your heels slowly all the way down.',
      'Keep your knees straight but not locked.',
    ],
    breathe: 'Breathe out as you rise, in as you lower.',
    feel: 'Your calves.',
  },
  'glute-bridge-loop': {
    setup: 'Put a mini loop band just above your knees. Lie on your back, knees bent, feet flat and hip-width apart about a foot from your hips. Arms on the floor by your sides.',
    steps: [
      'Press your knees out against the band.',
      'Push through your heels to lift your hips until your body is a straight line from shoulders to knees.',
      'Squeeze your glutes hard for one second at the top.',
      'Lower slowly, keeping the knees pushed out.',
    ],
    breathe: 'Breathe out as you lift, in as you lower.',
    feel: 'Your glutes, including the outer part. Not your lower back.',
  },
  'lateral-band-walk': {
    setup: 'Put a mini loop band around your legs just above the knees (or around the ankles for harder). Stand with feet hip-width apart, knees slightly bent in a quarter squat.',
    steps: [
      'Step one foot out to the side about a foot.',
      'Bring the other foot halfway in, keeping tension on the band.',
      'Keep stepping in one direction for the target steps, then go back.',
      'Stay low and keep your toes pointing forward.',
    ],
    breathe: 'Breathe steadily.',
    feel: 'The outer side of your hips.',
  },
  'standing-glute-kickback': {
    setup: 'Put a mini loop band around your ankles. Stand tall, holding a wall or chair for balance.',
    steps: [
      'Brace your stomach.',
      'Push one leg straight back against the band, squeezing your glute.',
      'Stop before your lower back arches.',
      'Return slowly. Finish the set, then switch legs.',
    ],
    breathe: 'Breathe out as you kick back, in as you return.',
    feel: 'The glute of the moving leg.',
  },

  /* ----------------------------------------------------------- CORE (BANDS) */
  'band-woodchopper-high-low': {
    setup: 'Anchor the band high in a door. Stand side-on to the door, feet wider than shoulders. Hold the band with both hands above the shoulder closest to the door.',
    steps: [
      'Brace your stomach.',
      'Pull the band down diagonally across your body toward the opposite hip, rotating your torso and pivoting the back foot.',
      'Keep your arms long throughout.',
      'Return slowly up to the start. Switch sides after the set.',
    ],
    breathe: 'Breathe out as you chop down, in as you return.',
    feel: 'Your sides (obliques) and deep core.',
  },
  'pallof-press-anti-rotation': {
    setup: 'Anchor the band at chest height and stand side-on to it. Hold the band at your chest with both hands and step away until it pulls sideways.',
    steps: [
      'Stand with feet shoulder-width apart, knees soft, stomach braced.',
      'Press your hands straight out in front of your chest.',
      'Hold there for 2 seconds without letting your body rotate toward the anchor.',
      'Bring your hands back to your chest. Switch sides after the set.',
    ],
    breathe: 'Breathe out as you press, keep breathing during the hold.',
    feel: 'Your deep core and obliques resisting the twist.',
  },
  'kneeling-cable-crunch-band': {
    setup: 'Anchor the band at the top of a door. Kneel facing it, holding the band at either side of your head.',
    steps: [
      'Keep your hips still above your knees.',
      'Curl your ribs toward your hips, rounding your back, bringing your elbows toward your thighs.',
      'Squeeze your stomach at the bottom.',
      'Uncurl slowly back to upright.',
    ],
    breathe: 'Breathe out as you crunch, in as you rise.',
    feel: 'Your upper and middle stomach.',
  },

  /* ----------------------------------------------------------- BODYWEIGHT PUSH */
  'bodyweight-pushup-standard': {
    setup: 'Place your hands on the floor slightly wider than your shoulders. Step your feet back so you are on your toes with a straight body.',
    steps: [
      'Squeeze your glutes and brace your stomach so your body is a straight line.',
      'Lower your chest until it is about a fist from the floor, elbows at 45°.',
      'Push the floor away until your arms are straight.',
      'Keep your head in line with your body; look slightly ahead of your hands.',
    ],
    breathe: 'Breathe in as you lower, out as you push up.',
    feel: 'Chest, front shoulders and triceps.',
  },
  'bodyweight-diamond-pushup': {
    setup: 'Get into a push-up position with your hands together under your chest, thumbs and index fingers touching to form a diamond.',
    steps: [
      'Keep your body in one straight line.',
      'Lower your chest toward your hands, elbows tucked back along your ribs.',
      'Push back up until your arms are straight.',
      'If needed, do them from your knees.',
    ],
    breathe: 'Breathe in as you lower, out as you push.',
    feel: 'The backs of your arms and the inner chest.',
  },
  'bodyweight-pike-pushup': {
    setup: 'Start in a push-up position, then walk your feet in and lift your hips high into an upside-down V.',
    steps: [
      'Bend your elbows and lower the top of your head toward the floor just in front of your hands.',
      'Elbows bend back, not out to the sides.',
      'Push back up to straight arms.',
      'Keep your hips high the whole time.',
    ],
    breathe: 'Breathe in as you lower, out as you press.',
    feel: 'Your shoulders and triceps.',
  },
  'bodyweight-pushup-downward-dog': {
    setup: 'Start in a high plank: hands flat under your shoulders, fingers spread, arms straight, feet hip-width apart on your toes, body straight from head to heels.',
    steps: [
      'Do one push-up: chest down, then push back up.',
      'From the top, push your hips up and back into a downward dog, heels reaching toward the floor.',
      'Hold for a breath, feeling the stretch in your calves and shoulders.',
      'Shift forward to the plank and start the next rep.',
    ],
    breathe: 'Breathe in down, out up, and out again as you move into the dog.',
    feel: 'Chest and shoulders, then a stretch through the back of the legs.',
  },
  'bodyweight-archer-pushup': {
    setup: 'Set your hands about twice shoulder-width apart in a push-up position.',
    steps: [
      'Shift your weight toward one hand and lower your chest toward it, bending that elbow.',
      'Keep the other arm straight out to the side.',
      'Push back up to the middle.',
      'Alternate sides each rep.',
    ],
    breathe: 'Breathe in as you lower, out as you push.',
    feel: 'Chest and triceps on the working side.',
  },
  'bodyweight-incline-pushup': {
    setup: 'Place your hands on a sturdy bench, table or step at shoulder width. Walk your feet back until your body is a straight line.',
    steps: [
      'Brace your stomach and glutes.',
      'Lower your chest to the edge of the surface.',
      'Push back up to straight arms.',
      'The higher the surface, the easier it is.',
    ],
    breathe: 'Breathe in as you lower, out as you push.',
    feel: 'Chest, front shoulders and triceps.',
  },
  'bodyweight-knee-pushup': {
    setup: 'Start on your hands and knees. Walk your hands forward until there is a straight line from your knees to your head.',
    steps: [
      'Keep your hips in line with your body.',
      'Lower your chest toward the floor.',
      'Push back up to straight arms.',
      'Cross your feet behind you to keep balanced.',
    ],
    breathe: 'Breathe in as you lower, out as you push.',
    feel: 'Chest and triceps.',
  },
  'bodyweight-bench-dip': {
    setup: 'Sit on the edge of a sturdy bench or chair. Place your hands beside your hips, fingers forward. Slide your hips forward off the edge and straighten your legs with heels on the floor.',
    steps: [
      'Keep your back close to the bench.',
      'Bend your elbows straight back to lower your hips until your upper arms are about parallel to the floor.',
      'Push through your palms to straighten your arms.',
      'Bend your knees to make it easier.',
    ],
    breathe: 'Breathe in as you lower, out as you push up.',
    feel: 'The backs of your arms. Stop higher if your shoulders hurt.',
  },
  'bar-band-assisted-dip': {
    setup: 'Hold the bar in front of you at hip height, hands shoulder-width apart, arms straight, body above the bar. Loop a band over the bar and put your knees into it for support.',
    steps: [
      'Lean slightly forward over the bar.',
      'Bend your elbows to lower your chest toward the bar, elbows pointing back.',
      'Push down into the bar to straighten your arms.',
      'Keep your shoulders down and stable.',
    ],
    breathe: 'Breathe in as you lower, out as you press.',
    feel: 'Triceps, chest and front shoulders.',
  },
  'bar-band-planche-lean': {
    setup: 'Start in a high plank with hands on the floor, fingers angled out. Optionally loop a band around your hips and anchor it in front for support.',
    steps: [
      'Lock your arms straight.',
      'Lean your shoulders forward past your hands while staying on your toes.',
      'Push the floor away and round your upper back slightly.',
      'Hold for the target time.',
    ],
    breathe: 'Breathe steadily during the hold.',
    feel: 'The front of your shoulders and your wrists.',
  },


  /* ----------------------------------------------------------- BODYWEIGHT PULL */
  'bar-chinup-strict': {
    setup: 'Grab the bar with palms facing you, hands about shoulder-width apart. Hang with your arms completely straight, legs together and stomach tight.',
    steps: [
      'Pull your shoulders down away from your ears so your body lifts slightly with straight arms.',
      'Bend your elbows and drive them down in front of your ribs, pulling your chest toward the bar.',
      'Keep going until your chin is clearly above the bar. Do not kick or swing.',
      'Lower yourself slowly, about 3 seconds, until your arms are fully straight again.',
    ],
    breathe: 'Breathe out as you pull up, breathe in as you lower.',
    feel: 'Your biceps and the large muscles at the sides of your back.',
  },
  'bar-negative-pullup': {
    setup: 'Put a sturdy chair or box under the bar. Grab the bar with palms facing away, hands slightly wider than your shoulders, and step or jump up so your chin is above the bar.',
    steps: [
      'Take your feet off the support and hold the top position for one second, elbows tight to your sides.',
      'Lower yourself as slowly as you can, aiming for 4 to 5 seconds on the way down.',
      'Keep your shoulders pulled down and your body still the whole way.',
      'Finish at a full hang with straight arms, then step back up onto the support for the next rep.',
    ],
    breathe: 'Breathe out in a slow, steady stream as you lower. Breathe in while you reset at the top.',
    feel: 'Your lats and biceps working the entire way down. If you drop fast at the end, do fewer reps and lower slower.',
  },
  'bodyweight-doorframe-row': {
    setup: 'Stand in an open doorway facing one side of the frame. Grab the frame with both hands at chest height, one hand above the other. Walk your feet in until your toes are close to the frame, then lean back until your arms are straight.',
    steps: [
      'Keep your body in one straight line from heels to head, stomach and glutes tight.',
      'Pull your chest toward the frame by bending your elbows and driving them back past your ribs.',
      'Squeeze your shoulder blades together for one second when your chest is close to your hands.',
      'Straighten your arms slowly to lean back again. Walk your feet closer to the frame to make it harder.',
    ],
    breathe: 'Breathe out as you pull in, breathe in as you lean back.',
    feel: 'Your upper back and the backs of your shoulders.',
  },
  'bodyweight-table-row': {
    setup: 'Use a sturdy table that will not tip. Lie on your back underneath it with your chest under the edge. Grab the edge with both hands, shoulder-width apart, and straighten your arms. Dig your heels into the floor and lift your hips so your body is straight.',
    steps: [
      'Keep your body rigid like a plank from heels to head.',
      'Pull your chest up to the edge of the table, elbows driving down and back.',
      'Squeeze your shoulder blades together at the top for one second.',
      'Lower yourself slowly until your arms are straight. Bend your knees and put your feet flat to make it easier.',
    ],
    breathe: 'Breathe out as you pull up, breathe in as you lower.',
    feel: 'Your mid and upper back. If your hips sag, squeeze your glutes harder.',
  },
  'bodyweight-superman-pulses': {
    setup: 'Lie face down on a mat with your legs straight and arms stretched out in front of you, palms facing down. Rest your forehead on the floor.',
    steps: [
      'Squeeze your glutes and lift your arms, chest and legs a few inches off the floor at the same time.',
      'Keep your eyes on the floor so your neck stays long.',
      'Pull your elbows back toward your ribs as if doing a pull-down, then reach your arms forward again. That is one rep.',
      'Keep your chest and legs lifted for the whole set, then lower everything slowly.',
    ],
    breathe: 'Breathe out as you pull your elbows back, breathe in as you reach forward.',
    feel: 'Your lower back, glutes and the muscles between your shoulder blades.',
  },
  'bar-band-front-lever-raise': {
    setup: 'Loop a long band over the bar and sit your hips in the loop so it supports your weight. Grab the bar with palms facing away, hands shoulder-width apart, and hang with straight arms.',
    steps: [
      'Pull your shoulders down and squeeze the bar hard. Your arms stay straight for the whole rep.',
      'Tuck your knees toward your chest and lean back, lifting your hips until your back is level with the floor and your face points up.',
      'Hold that position for one second.',
      'Lower slowly back to the hang without swinging.',
    ],
    breathe: 'Breathe out as you lift, breathe in as you lower.',
    feel: 'Your lats pressing the bar down and your whole core working hard.',
  },

  /* ----------------------------------------------------------- BODYWEIGHT LEGS */
  'bodyweight-air-squat': {
    setup: 'Stand with your feet shoulder-width apart and your toes turned out slightly. Reach your arms straight out in front of you for balance.',
    steps: [
      'Push your hips back and bend your knees, lowering slowly for about 3 seconds.',
      'Keep your chest up, your heels on the floor and your knees pointing the same way as your toes.',
      'Stop when your thighs are about parallel to the floor, or as low as you can go with a flat back.',
      'Push through your whole foot to stand up tall, squeezing your glutes at the top.',
    ],
    breathe: 'Breathe in as you lower, breathe out as you stand.',
    feel: 'The front of your thighs and your glutes.',
  },
  'bodyweight-sumo-squat-pulse': {
    setup: 'Stand with your feet about twice shoulder-width apart and your toes turned out at roughly 45°. Clasp your hands together at your chest.',
    steps: [
      'Bend your knees and sit straight down between your feet, pushing your knees out over your toes.',
      'Stop when your thighs are about parallel to the floor. Keep your back upright.',
      'Pulse: rise two or three inches and sink back down, three times, staying low.',
      'Stand all the way up and squeeze your glutes. That is one rep.',
    ],
    breathe: 'Breathe in as you sink down, breathe out in short breaths during the pulses and as you stand.',
    feel: 'Your inner thighs and glutes.',
  },
  'bodyweight-reverse-lunge': {
    setup: 'Stand tall with your feet hip-width apart and your hands on your hips or in front of your chest.',
    steps: [
      'Take a big step backward with one foot, landing on the ball of that foot.',
      'Bend both knees and lower straight down until your back knee almost touches the floor. Your front knee stays above your ankle.',
      'Push through the heel of your front foot to bring the back foot forward and stand up.',
      'Repeat with the other leg. One left and one right is two reps.',
    ],
    breathe: 'Breathe in as you lower, breathe out as you stand.',
    feel: 'The front thigh and glute of the front leg.',
  },
  'bodyweight-jump-squats': {
    setup: 'Stand with your feet shoulder-width apart and your arms at your sides. Make sure you have room above you and a non-slip floor.',
    steps: [
      'Squat down quickly to about half depth, swinging your arms back.',
      'Explode straight up, swinging your arms up and straightening your legs fully.',
      'Land softly on the balls of your feet, then let your heels come down as you bend your knees to absorb the landing.',
      'Go straight into the next squat and jump.',
    ],
    breathe: 'Breathe in as you squat, breathe out as you jump.',
    feel: 'Your legs and glutes, with your heart rate rising fast. Landing loudly means you need to land softer.',
  },
  'bodyweight-glute-bridge': {
    setup: 'Lie on your back with your knees bent and feet flat on the floor, hip-width apart, heels about a foot from your hips. Rest your arms by your sides, palms down.',
    steps: [
      'Press your heels into the floor and squeeze your glutes.',
      'Lift your hips until your shoulders, hips and knees make a straight line.',
      'Hold the top for two seconds, squeezing your glutes as hard as you can.',
      'Lower your hips slowly to just above the floor and repeat.',
    ],
    breathe: 'Breathe out as you lift, breathe in as you lower.',
    feel: 'Your glutes. If you feel it in your lower back, tuck your tailbone slightly and do not lift so high.',
  },
  'bodyweight-standing-calf-raise': {
    setup: 'Stand tall with your feet hip-width apart and toes pointing forward. Hold a wall or chair lightly for balance. For more range, stand with the balls of your feet on a step.',
    steps: [
      'Rise up onto the balls of your feet as high as you can.',
      'Hold the top for one second.',
      'Lower your heels slowly, taking about 2 seconds.',
      'Keep your knees straight and your body tall throughout.',
    ],
    breathe: 'Breathe out as you rise, breathe in as you lower.',
    feel: 'Your calves.',
  },
  'bodyweight-single-leg-calf-raise': {
    setup: 'Stand on one foot next to a wall and rest a hand on it for balance. Hook the other foot behind your standing ankle.',
    steps: [
      'Rise up onto the ball of your standing foot as high as you can.',
      'Hold the top for one second.',
      'Lower your heel slowly all the way down.',
      'Finish the reps, then switch to the other leg.',
    ],
    breathe: 'Breathe out as you rise, breathe in as you lower.',
    feel: 'The calf of the standing leg.',
  },
  'band-lying-leg-curl': {
    setup: 'Anchor a long band low in a door, close to the floor. Lie face down with your feet toward the door and loop the band around both ankles. Move away until the band is tight with your legs straight. Rest on your forearms.',
    steps: [
      'Keep your hips pressed into the floor.',
      'Bend your knees and pull your heels toward your glutes as far as you can.',
      'Squeeze the backs of your thighs for one second.',
      'Straighten your legs slowly against the band.',
    ],
    breathe: 'Breathe out as you curl, breathe in as you straighten.',
    feel: 'The backs of your thighs (hamstrings).',
  },
  'bodyweight-slider-leg-curl': {
    setup: 'Lie on your back on a smooth floor with your knees bent and heels on a towel or sliders. Arms flat by your sides.',
    steps: [
      'Lift your hips into a bridge so your body is straight from shoulders to knees.',
      'Keeping your hips up, slide your heels away from you until your legs are almost straight.',
      'Pull your heels back toward your hips by bending your knees, still keeping your hips up.',
      'Lower your hips only after the last rep. To make it easier, let your hips touch down between reps.',
    ],
    breathe: 'Breathe in as your feet slide out, breathe out as you pull them back.',
    feel: 'A strong burn in the backs of your thighs.',
  },
  'bodyweight-nordic-negative': {
    setup: 'Kneel on a cushion with your ankles held down by a partner, or hooked under a heavy couch or a band anchored low. Kneel upright with your body straight from knees to head and your hands in front of your chest.',
    steps: [
      'Squeeze your glutes and keep your hips straight; do not bend at the waist.',
      'Lean forward as one straight piece, lowering as slowly as you can.',
      'When you can no longer control it, catch yourself with your hands in a push-up position.',
      'Push off the floor just enough to get back to upright, using your hamstrings as much as you can.',
    ],
    breathe: 'Breathe out slowly as you lower, breathe in as you come back up.',
    feel: 'The backs of your thighs working very hard. This is advanced: start with a few reps.',
  },
  'bodyweight-bulgarian-split-squat': {
    setup: 'Stand about two feet in front of a bench or sturdy chair, facing away from it. Reach one foot back and rest the top of that foot on the bench.',
    steps: [
      'Stand tall with most of your weight on your front foot.',
      'Bend your front knee and lower your hips straight down until your back knee nearly touches the floor.',
      'Keep your front knee over your ankle and your chest up.',
      'Push through your front heel to stand back up. Finish the set, then switch legs.',
    ],
    breathe: 'Breathe in as you lower, breathe out as you stand.',
    feel: 'The front thigh and glute of the front leg. If your front heel lifts, move the front foot further forward.',
  },
  'bodyweight-step-up': {
    setup: 'Stand facing a sturdy box, bench or step about knee height. Make sure it will not slide.',
    steps: [
      'Place your whole right foot on the box.',
      'Lean slightly forward and push through your right heel to stand up on the box. Try not to push off with the back foot.',
      'Stand tall at the top with both feet on the box.',
      'Step back down with the left foot first, then the right. Alternate the leading leg each rep.',
    ],
    breathe: 'Breathe out as you step up, breathe in as you step down.',
    feel: 'The front thigh and glute of the leg on the box.',
  },
  'bodyweight-side-lunge': {
    setup: 'Stand with your feet about twice shoulder-width apart, toes pointing forward. Clasp your hands at your chest.',
    steps: [
      'Shift your weight to your right side, bending your right knee and pushing your hips back.',
      'Keep your left leg straight and both feet flat on the floor.',
      'Lower until your right thigh is close to parallel to the floor.',
      'Push through your right foot to return to the middle, then lunge to the left.',
    ],
    breathe: 'Breathe in as you lunge, breathe out as you push back.',
    feel: 'The thigh and glute of the bent leg and a stretch in the inner thigh of the straight leg.',
  },
  'bodyweight-pistol-squat-assisted': {
    setup: 'Stand on one leg next to a door frame or sturdy pole and hold it with both hands. Lift the other foot slightly off the floor in front of you.',
    steps: [
      'Push your hips back and bend your standing knee, reaching your free leg straight out in front.',
      'Lower as far as you can control, using your hands on the frame only as much as you need.',
      'Keep your standing heel flat on the floor.',
      'Push through that heel to stand back up. Finish the set, then switch legs.',
    ],
    breathe: 'Breathe in as you lower, breathe out as you stand.',
    feel: 'The thigh and glute of the standing leg.',
  },

  /* ----------------------------------------------------------- CORE */
  'bodyweight-bicycle-crunches': {
    setup: 'Lie on your back with your hands lightly behind your head, elbows wide. Lift your shoulders and both feet off the floor, knees bent at 90°.',
    steps: [
      'Bring your right knee toward your chest while you straighten your left leg out at a low angle.',
      'Rotate your upper body so your left elbow moves toward your right knee.',
      'Switch: bring the left knee in, straighten the right leg, and turn your right elbow toward it.',
      'Move slowly and twist from your ribs, not your neck. Each side counts as one rep.',
    ],
    breathe: 'Breathe out each time you twist.',
    feel: 'The sides of your waist and your front abs. Do not pull on your head with your hands.',
  },
  'bodyweight-v-ups': {
    setup: 'Lie flat on your back with your legs straight together and your arms stretched overhead on the floor.',
    steps: [
      'Brace your stomach and press your lower back into the floor.',
      'Lift your straight legs and your upper body at the same time, reaching your hands toward your toes.',
      'At the top your body makes a V, balancing on your seat.',
      'Lower slowly back down without letting your back slam into the floor. Bend your knees to make it easier.',
    ],
    breathe: 'Breathe out as you fold up, breathe in as you lower.',
    feel: 'Your whole stomach, especially the lower part.',
  },
  'bodyweight-mountain-climbers': {
    setup: 'Start in a high plank: hands under your shoulders, arms straight, body straight from head to heels.',
    steps: [
      'Drive your right knee toward your left elbow, crossing under your body.',
      'Return the right foot to the plank as you drive the left knee toward your right elbow.',
      'Keep switching at a steady, quick pace.',
      'Keep your hips level with your shoulders; do not bounce them up.',
    ],
    breathe: 'Breathe steadily; do not hold your breath.',
    feel: 'Your core, the sides of your waist and your shoulders, with your heart rate rising.',
  },
  'bodyweight-plank-shoulder-taps': {
    setup: 'Start in a high plank with your hands under your shoulders and your feet a little wider than hip-width apart.',
    steps: [
      'Brace your stomach and squeeze your glutes.',
      'Lift your right hand and tap your left shoulder.',
      'Put the hand back down, then tap your right shoulder with your left hand.',
      'Keep your hips completely still: imagine a glass of water balanced on your lower back.',
    ],
    breathe: 'Breathe steadily throughout.',
    feel: 'Your core working to stop your hips from rocking, and your shoulders.',
  },
  'bodyweight-full-burpees': {
    setup: 'Stand with your feet shoulder-width apart and enough floor space in front of you to lie down.',
    steps: [
      'Squat down and place your hands on the floor in front of your feet.',
      'Jump your feet back into a high plank and do one push-up.',
      'Jump your feet back in toward your hands.',
      'Stand and jump straight up, reaching your arms overhead. Land softly and go straight into the next rep.',
    ],
    breathe: 'Breathe out on the push-up and on the jump; keep breathing steadily between them.',
    feel: 'Your whole body, with your heart rate high.',
  },
  'bodyweight-leg-scissors': {
    setup: 'Lie on your back with your legs straight and your hands under your hips, palms down. Lift your head and shoulders slightly off the floor.',
    steps: [
      'Press your lower back into the floor and lift both legs a few inches off the floor.',
      'Raise one leg higher while the other stays low.',
      'Switch them in a smooth scissor motion, keeping both legs straight.',
      'Keep going for the target time without letting your lower back arch.',
    ],
    breathe: 'Breathe steadily; do not hold your breath.',
    feel: 'Your lower stomach. Lift the legs higher if your back starts to arch.',
  },
  'bodyweight-long-arm-crunch': {
    setup: 'Lie on your back with your knees bent and feet flat on the floor. Stretch your arms straight overhead with your biceps beside your ears.',
    steps: [
      'Keep your arms straight and in line with your ears for the whole set.',
      'Curl your head, shoulders and arms up off the floor by tightening your stomach.',
      'Hold the top for one second.',
      'Lower back down slowly.',
    ],
    breathe: 'Breathe out as you curl up, breathe in as you lower.',
    feel: 'Your upper stomach. The long arms make it harder than a normal crunch.',
  },
  'bodyweight-plank': {
    setup: 'Kneel on a mat and place your forearms on the floor, elbows directly under your shoulders, hands flat or loosely clasped. Step your feet back one at a time so you are on your toes, feet hip-width apart.',
    steps: [
      'Make one straight line from your heels to your head: not hips up, not hips sagging.',
      'Squeeze your glutes and brace your stomach as if expecting a punch.',
      'Push the floor away with your forearms so your upper back does not sink between your shoulders.',
      'Look at the floor just in front of your hands and hold for the target time. Drop to your knees if your form breaks.',
    ],
    breathe: 'Breathe slowly in through your nose and out through your mouth for the whole hold.',
    feel: 'Your whole stomach, glutes and shoulders. Lower-back pain means your hips are sagging.',
  },
  'bodyweight-side-plank-rotation': {
    setup: 'Lie on your side and prop yourself up on your forearm, elbow under your shoulder. Stack your feet and lift your hips so your body is straight. Reach your top arm straight up to the ceiling.',
    steps: [
      'Keeping your hips lifted, rotate your chest toward the floor and thread your top arm under your body.',
      'Reach through as far as you comfortably can.',
      'Rotate back open and reach the top arm to the ceiling again.',
      'Finish the reps, then switch sides. Drop the bottom knee to the floor to make it easier.',
    ],
    breathe: 'Breathe out as you thread the arm under, breathe in as you open up.',
    feel: 'The sides of your waist and your supporting shoulder.',
  },
  'bodyweight-plank-crunch': {
    setup: 'Start in a high plank with your hands under your shoulders and body straight.',
    steps: [
      'Bring your right knee slowly toward your right elbow, rounding your back slightly.',
      'Squeeze your stomach for one second.',
      'Return the foot to the plank.',
      'Repeat with the left knee. Keep your hips low and move with control, not speed.',
    ],
    breathe: 'Breathe out as the knee comes in, breathe in as it goes back.',
    feel: 'Your stomach and the sides of your waist, with your shoulders holding you up.',
  },
};
