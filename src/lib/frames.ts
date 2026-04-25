// ============================================================
// ASCII Animation Frames — Multiple Pet Types
// Clean, smooth, high-quality ASCII art
// ============================================================

export type PetType = 'cat' | 'dog' | 'bunny' | 'fox' | 'panda';

export const PET_INFO: Record<PetType, { name: string; emoji: string; desc: string }> = {
  cat:   { name: 'Cat',   emoji: '🐱', desc: 'Sassy, independent, loves naps' },
  dog:   { name: 'Dog',   emoji: '🐶', desc: 'Loyal, energetic, loves treats' },
  bunny: { name: 'Bunny', emoji: '🐰', desc: 'Shy, gentle, loves carrots' },
  fox:   { name: 'Fox',   emoji: '🦊', desc: 'Clever, mischievous, curious' },
  panda: { name: 'Panda', emoji: '🐼', desc: 'Chill, hungry, loves hugs' },
};

// ─── EYE STATES for cursor tracking ───
// {{LEYE}} and {{REYE}} are replaced based on cursor position
// Possible: o  -  ^  >  <  O  @  x  T

const FRAMES: Record<PetType, Record<string, string[]>> = {
  // ═══════════════════════════════════════════════
  // CAT
  // ═══════════════════════════════════════════════
  cat: {
    idle: [
`   /\\_/\\
  ( {{LEYE}}.{{REYE}} )
   > ^ <`,
`   /\\_/\\
  ( {{LEYE}}.{{REYE}} )
    > ^`,
`   /\\_/\\
  ( -.- )
   > ^ <`,
`   /\\_/\\
  ( {{LEYE}}.{{REYE}} )
   > ^ <`,
    ],
    eating: [
`   /\\_/\\    {{FOOD}}
  ( {{LEYE}}.{{REYE}} )  /
   >^ ^<`,
`   /\\_/\\   {{FOOD}}
  ( -.- ) ~/
   >^ ^<`,
`   /\\_/\\  {{FOOD}}
  ( ^.^ )~
   >^ ^<`,
`   /\\_/\\
  ( ^.^ )  nom!
   >^ ^<`,
    ],
    playing: [
`  /\\_/\\   {{TOY}}
 ( {{LEYE}}.{{REYE}} ) /
  > ^ <`,
`    /\\_/\\  {{TOY}}
   ( ^.^ )~
    > ^ <`,
`      /\\_/\\ {{TOY}}
     ( {{LEYE}}.{{REYE}} )/
      > ^ <`,
`    /\\_/\\{{TOY}}
   ( ^.^ )
    > ^ <`,
    ],
    bath: [
`   /\\_/\\  ~
  ( o.o ) ~ ~
   >   <  o o
  ~~~~~~~`,
`   /\\_/\\    ~
  ( -.- ) ~ ~
   >   < o o
  ~~~~~~~`,
`   /\\_/\\  ~  ~
  ( ^.^ ) ~
   >   <  o
  ~~~~~~~`,
`   /\\_/\\  ~
  ( -.- )  ~
   >   < o o o
  ~~~~~~~`,
    ],
    sick: [
`   /\\_/\\
  ( x.x )
   > ~ <
    +`,
`   /\\_/\\
  ( -.- )
   >   <
   + +`,
`   /\\_/\\
  ( T.T )
   > ~ <
    +`,
`   /\\_/\\
  ( x.x )
   >   <
   + + +`,
    ],
    discipline: [
`   /\\_/\\   {{ICON}}
  ( o.o )!
   > ^ <`,
`   /\\_/\\  {{ICON}}
  ( x.x )
   >   <`,
`   /\\_/\\   {{ICON}}
  ( -.- )
   > ^ <`,
`   /\\_/\\  {{ICON}}
  ( T.T )
   >   <`,
    ],
    sleeping: [
`   /\\_/\\
  ( -.- )  z
   > ^ <`,
`   /\\_/\\
  ( -.- )  z z
   > ^ <`,
`   /\\_/\\
  ( -.- )  z z z
   > ^ <`,
`   /\\_/\\
  ( -.- )  z z
   > ^ <`,
    ],
    happy: [
` * /\\_/\\ *
  ( ^.^ )
 * > ^ < *`,
`   /\\_/\\
  ( ^.^ )
 * > ^ < *`,
` * /\\_/\\ *
  ( ^.^ )
   > ^ <`,
`   /\\_/\\  ~
  ( ^.^ )
   > ^ <  ~`,
    ],
    vomit: [
`   /\\_/\\
  ( o.o )
  /> ^ <\\`,
`   /\\_/\\
  ( o.o )
 / >   < \\
   bleh`,
`   /\\_/\\
  ( x.x )
  /> ^ <\\`,
`   /\\_/\\
  ( o.o )
   > ^ <`,
    ],
    full: [
`   /\\_/\\
  ( o.o )
   > - <
   full!`,
`   /\\_/\\
  ( -.- )
   > - <
   ugh..`,
`   /\\_/\\
  ( o.o )
   > - <
   so full`,
`   /\\_/\\
  ( -.- )
   > - <
   no more`,
    ],
  },

  // ═══════════════════════════════════════════════
  // DOG
  // ═══════════════════════════════════════════════
  dog: {
    idle: [
`  |\\_/|
  ({{LEYE}}.{{REYE}})
  / > <\\
   \\|/`,
`  |\\_/|
  ({{LEYE}}.{{REYE}})  ~
  / > <\\
    |`,
`  |\\_/|
  (-.-) 
  / > <\\
   \\|/`,
`  |\\_/|
  ({{LEYE}}.{{REYE}})
  / > <\\  ~
    |`,
    ],
    eating: [
`  |\\_/|   {{FOOD}}
  ({{LEYE}}.{{REYE}}) /
  / > <\\`,
`  |\\_/|  {{FOOD}}
  (^.^)~
  / > <\\  ~`,
`  |\\_/|
  (^.^) nom!
  / > <\\  ~`,
`  |\\_/| {{FOOD}}
  (^.^)
  / > <\\ ~~`,
    ],
    playing: [
`  |\\_/|   {{TOY}}
  ({{LEYE}}.{{REYE}}) /
  / > <\\
   \\|/  ~`,
`    |\\_/| {{TOY}}
    (^.^)/
    / > <\\
      |  ~~`,
`      |\\_/|{{TOY}}
      (^.^)
      / > <\\
       \\|/ ~~`,
`    |\\_/|
    (^.^) {{TOY}}
    / > <\\
      | ~`,
    ],
    bath: [
`  |\\_/| ~
  (o.o) ~ ~
  / > <\\
  ~~~~~`,
`  |\\_/|  ~
  (-.-) ~
  / > <\\
  ~~~~~`,
`  |\\_/| ~ ~
  (^.^)
  / > <\\
  ~~~~~`,
`  |\\_/|  ~
  (-.-) ~ ~
  / > <\\
  ~~~~~`,
    ],
    sick: [
`  |\\_/|
  (x.x)
  / ~ <\\
   +`,
`  |\\_/|
  (-.-)
  /   <\\
  + +`,
`  |\\_/|
  (T.T)
  / ~ <\\
   +`,
`  |\\_/|
  (x.x)
  /   <\\
  + + +`,
    ],
    discipline: [
`  |\\_/| {{ICON}}
  (o.o)!
  / > <\\`,
`  |\\_/|{{ICON}}
  (x.x)
  /   <\\`,
`  |\\_/| {{ICON}}
  (-.-)
  / > <\\`,
`  |\\_/|{{ICON}}
  (T.T)
  /   <\\`,
    ],
    sleeping: [
`  |\\_/|
  (-.-) z
  / > <\\`,
`  |\\_/|
  (-.-) z z
  / > <\\`,
`  |\\_/|
  (-.-) z z z
  / > <\\`,
`  |\\_/|
  (-.-) z z
  / > <\\`,
    ],
    happy: [
` *|\\_/|*
  (^.^)
  / > <\\ ~~`,
`  |\\_/|
  (^.^) ~~
 */ > <\\*`,
` *|\\_/|* ~
  (^.^)
  / > <\\`,
`  |\\_/|
  (^.^) ~~~
  / > <\\`,
    ],
    vomit: [
`  |\\_/|
  (o.o)
  /> <\\`,
`  |\\_/|
  (o.o) bleh
 / >  < \\`,
`  |\\_/|
  (x.x)
  /> <\\`,
`  |\\_/|
  (o.o)
  / > <\\`,
    ],
    full: [
`  |\\_/|
  (o.o)
  / - <\\
  full!`,
`  |\\_/|
  (-.-)
  / - <\\
  ugh`,
`  |\\_/|
  (o.o)
  / - <\\
  so full`,
`  |\\_/|
  (-.-)
  / - <\\
  no more`,
    ],
  },

  // ═══════════════════════════════════════════════
  // BUNNY
  // ═══════════════════════════════════════════════
  bunny: {
    idle: [
`  (\\ /)
  ({{LEYE}}.{{REYE}})
  (")(")`,
`  (\\ /)
  ({{LEYE}}.{{REYE}})
  (")(") ~`,
`  (\\ /)
  (-.- )
  (")(")`,
`  (\\ /)
  ({{LEYE}}.{{REYE}})
  (")(")`,
    ],
    eating: [
`  (\\ /) {{FOOD}}
  ({{LEYE}}.{{REYE}})/
  (")(")`,
`  (\\ /){{FOOD}}
  (^.^)~
  (")(")`,
`  (\\ /)
  (^.^) nom!
  (")(")`,
`  (\\ /)
  (^.^)
  (")(")`,
    ],
    playing: [
`  (\\ /) {{TOY}}
  ({{LEYE}}.{{REYE}})/
  (")(")`,
`    (\\ /){{TOY}}
    (^.^)
    (")(")`,
`      (\\ /)
      (^.^) {{TOY}}
      (")(")`,
`    (\\ /)
    (^.^){{TOY}}
    (")(")`,
    ],
    bath: [
`  (\\ /) ~
  (o.o) ~ ~
  (")(")
  ~~~~~`,
`  (\\ /)  ~
  (-.-) ~
  (")(")
  ~~~~~`,
`  (\\ /) ~ ~
  (^.^)
  (")(")
  ~~~~~`,
`  (\\ /)  ~
  (-.-) ~ ~
  (")(")
  ~~~~~`,
    ],
    sick: [
`  (\\ /)
  (x.x)
  (")(")
   +`,
`  (\\ /)
  (-.-)
  (")(")
  + +`,
`  (\\ /)
  (T.T)
  (")(")
   +`,
`  (\\ /)
  (x.x)
  (")(")
  + + +`,
    ],
    discipline: [
`  (\\ /) {{ICON}}
  (o.o)!
  (")(")`,
`  (\\ /){{ICON}}
  (x.x)
  (")(")`,
`  (\\ /) {{ICON}}
  (-.-)
  (")(")`,
`  (\\ /){{ICON}}
  (T.T)
  (")(")`,
    ],
    sleeping: [
`  (\\ /)
  (-.-) z
  (")(")`,
`  (\\ /)
  (-.-) z z
  (")(")`,
`  (\\ /)
  (-.-) z z z
  (")(")`,
`  (\\ /)
  (-.-) z z
  (")(")`,
    ],
    happy: [
` *(\\ /)* 
  (^.^) 
 *(")(")* `,
`  (\\ /) ~
  (^.^)
  (")(") ~`,
` *(\\ /)*
  (^.^)
  (")(")`,
`  (\\ /)
  (^.^) ~~
  (")(")`,
    ],
    vomit: [
`  (\\ /)
  (o.o) 
 /(")(")\\`,
`  (\\ /)
  (x.x) bleh
  (")(")`,
`  (\\ /)
  (o.o)
 /(")(")\\`,
`  (\\ /)
  (o.o)
  (")(")`,
    ],
    full: [
`  (\\ /)
  (o.o)
  (")(")
  full!`,
`  (\\ /)
  (-.-)
  (")(")
  ugh`,
`  (\\ /)
  (o.o)
  (")(")
  stuffed`,
`  (\\ /)
  (-.-)
  (")(")
  no more`,
    ],
  },

  // ═══════════════════════════════════════════════
  // FOX
  // ═══════════════════════════════════════════════
  fox: {
    idle: [
`  /\\ /\\
 ( {{LEYE}} {{REYE}} )
  \\ w /
   | |`,
`  /\\ /\\
 ( {{LEYE}} {{REYE}} )  ~
  \\ w /
   | |`,
`  /\\ /\\
 ( - - )
  \\ w /
   | |`,
`  /\\ /\\
 ( {{LEYE}} {{REYE}} )
  \\ w /
   | |`,
    ],
    eating: [
`  /\\ /\\  {{FOOD}}
 ( {{LEYE}} {{REYE}} )/
  \\ w /
   | |`,
`  /\\ /\\ {{FOOD}}
 ( ^ ^ )~
  \\ w /
   | |`,
`  /\\ /\\
 ( ^ ^ ) nom!
  \\ w /
   | |`,
`  /\\ /\\
 ( ^ ^ )
  \\ w /
   | |`,
    ],
    playing: [
`  /\\ /\\ {{TOY}}
 ( {{LEYE}} {{REYE}} )/
  \\ w /
   | |`,
`    /\\ /\\{{TOY}}
   ( ^ ^ )
    \\ w /
     | |`,
`      /\\ /\\
     ( ^ ^ ){{TOY}}
      \\ w /
       | |`,
`    /\\ /\\
   ( ^ ^ ) {{TOY}}
    \\ w /
     | |`,
    ],
    bath: [
`  /\\ /\\ ~
 ( o o ) ~ ~
  \\ w /
  ~~~~~`,
`  /\\ /\\  ~
 ( - - ) ~
  \\ w /
  ~~~~~`,
`  /\\ /\\ ~ ~
 ( ^ ^ )
  \\ w /
  ~~~~~`,
`  /\\ /\\  ~
 ( - - ) ~ ~
  \\ w /
  ~~~~~`,
    ],
    sick: [
`  /\\ /\\
 ( x x )
  \\ ~ /
   +`,
`  /\\ /\\
 ( - - )
  \\ ~ /
  + +`,
`  /\\ /\\
 ( T T )
  \\ ~ /
   +`,
`  /\\ /\\
 ( x x )
  \\ ~ /
  + + +`,
    ],
    discipline: [
`  /\\ /\\ {{ICON}}
 ( o o )!
  \\ w /`,
`  /\\ /\\{{ICON}}
 ( x x )
  \\   /`,
`  /\\ /\\ {{ICON}}
 ( - - )
  \\ w /`,
`  /\\ /\\{{ICON}}
 ( T T )
  \\   /`,
    ],
    sleeping: [
`  /\\ /\\
 ( - - ) z
  \\ w /`,
`  /\\ /\\
 ( - - ) z z
  \\ w /`,
`  /\\ /\\
 ( - - ) z z z
  \\ w /`,
`  /\\ /\\
 ( - - ) z z
  \\ w /`,
    ],
    happy: [
` */\\ /\\*
 ( ^ ^ )
 *\\ w /*`,
`  /\\ /\\ ~
 ( ^ ^ )
  \\ w / ~`,
` */\\ /\\*
 ( ^ ^ )
  \\ w /`,
`  /\\ /\\
 ( ^ ^ ) ~~
  \\ w /`,
    ],
    vomit: [
`  /\\ /\\
 ( o o )
 /\\ w /\\`,
`  /\\ /\\
 ( x x ) bleh
  \\ w /`,
`  /\\ /\\
 ( o o )
 /\\ w /\\`,
`  /\\ /\\
 ( o o )
  \\ w /`,
    ],
    full: [
`  /\\ /\\
 ( o o )
  \\ - /
  full!`,
`  /\\ /\\
 ( - - )
  \\ - /
  ugh`,
`  /\\ /\\
 ( o o )
  \\ - /
  stuffed`,
`  /\\ /\\
 ( - - )
  \\ - /
  no more`,
    ],
  },

  // ═══════════════════════════════════════════════
  // PANDA
  // ═══════════════════════════════════════════════
  panda: {
    idle: [
`  .--.
 ({{LEYE}}  {{REYE}})
 /|  |\\
  d  b`,
`  .--.
 ({{LEYE}}  {{REYE}})
 /|  |\\  ~
  d  b`,
`  .--.
 (-  -)
 /|  |\\
  d  b`,
`  .--.
 ({{LEYE}}  {{REYE}})
 /|  |\\
  d  b`,
    ],
    eating: [
`  .--. {{FOOD}}
 ({{LEYE}}  {{REYE}})/
 /|  |\\
  d  b`,
`  .--.{{FOOD}}
 (^  ^)~
 /|  |\\
  d  b`,
`  .--.
 (^  ^) nom!
 /|  |\\
  d  b`,
`  .--.
 (^  ^)
 /|  |\\
  d  b`,
    ],
    playing: [
`  .--. {{TOY}}
 ({{LEYE}}  {{REYE}})/
 /|  |\\
  d  b`,
`    .--.{{TOY}}
   (^  ^)
   /|  |\\
    d  b`,
`      .--.
     (^  ^){{TOY}}
     /|  |\\
      d  b`,
`    .--.
   (^  ^) {{TOY}}
   /|  |\\
    d  b`,
    ],
    bath: [
`  .--. ~
 (o  o) ~ ~
 /|  |\\
 ~~~~~~`,
`  .--.  ~
 (-  -) ~
 /|  |\\
 ~~~~~~`,
`  .--. ~ ~
 (^  ^)
 /|  |\\
 ~~~~~~`,
`  .--.  ~
 (-  -) ~ ~
 /|  |\\
 ~~~~~~`,
    ],
    sick: [
`  .--.
 (x  x)
 /|  |\\
  + +`,
`  .--.
 (-  -)
 /|  |\\
 + + +`,
`  .--.
 (T  T)
 /|  |\\
  + +`,
`  .--.
 (x  x)
 /|  |\\
 + + +`,
    ],
    discipline: [
`  .--. {{ICON}}
 (o  o)!
 /|  |\\`,
`  .--.{{ICON}}
 (x  x)
 /|  |\\`,
`  .--. {{ICON}}
 (-  -)
 /|  |\\`,
`  .--.{{ICON}}
 (T  T)
 /|  |\\`,
    ],
    sleeping: [
`  .--.
 (-  -) z
 /|  |\\`,
`  .--.
 (-  -) z z
 /|  |\\`,
`  .--.
 (-  -) z z z
 /|  |\\`,
`  .--.
 (-  -) z z
 /|  |\\`,
    ],
    happy: [
` *.--.*
 (^  ^)
 /|  |\\`,
`  .--.
 (^  ^) ~~
 /|  |\\`,
` *.--.*
 (^  ^)
*/|  |\\*`,
`  .--.
 (^  ^) ~
 /|  |\\`,
    ],
    vomit: [
`  .--.
 (o  o)
//|  |\\\\`,
`  .--.
 (x  x) bleh
 /|  |\\`,
`  .--.
 (o  o)
//|  |\\\\`,
`  .--.
 (o  o)
 /|  |\\`,
    ],
    full: [
`  .--.
 (o  o)
 /|--|\\
 full!`,
`  .--.
 (-  -)
 /|--|\\
 ugh`,
`  .--.
 (o  o)
 /|--|\\
 stuffed`,
`  .--.
 (-  -)
 /|--|\\
 no more`,
    ],
  },
};

export function getFrames(pet: PetType, state: string): string[] {
  return FRAMES[pet]?.[state] || FRAMES[pet]?.idle || FRAMES.cat.idle;
}

// Eye directions based on cursor position relative to pet
export type EyeDirection = 'center' | 'left' | 'right' | 'up' | 'down';

const EYE_CHARS: Record<EyeDirection, { left: string; right: string }> = {
  center: { left: 'o', right: 'o' },
  left:   { left: '<', right: '<' },
  right:  { left: '>', right: '>' },
  up:     { left: '^', right: '^' },
  down:   { left: 'v', right: 'v' },
};

export function applyEyes(frame: string, direction: EyeDirection): string {
  const eyes = EYE_CHARS[direction];
  return frame.replace('{{LEYE}}', eyes.left).replace('{{REYE}}', eyes.right);
}

export function applyPlaceholders(frame: string, replacements: Record<string, string>): string {
  let result = frame;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  // Clean remaining placeholders
  result = result.replaceAll('{{LEYE}}', 'o').replaceAll('{{REYE}}', 'o');
  result = result.replaceAll('{{FOOD}}', '').replaceAll('{{TOY}}', '').replaceAll('{{ICON}}', '');
  return result;
}
