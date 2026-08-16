import * as Tone from "tone";

// A calm, slightly moody lounge loop meant for focused gameplay — chess and
// quiz both reward concentration, so this stays soft and atmospheric rather
// than melodic-hooky or distracting. Everything here is synthesized live in
// the browser; nothing is a sampled or downloaded recording, so there's no
// licensing concern and no audio file to ship or maintain.
//
// Structure: a slow 4-chord pad progression (Am → F → C → G) that repeats
// every 8 bars underneath everything, a sparse plucked arpeggio riding over
// it for gentle movement, and an occasional soft bell hit for texture. All
// three layers run through a shared reverb + lowpass filter for warmth.
//
// This is a module-level singleton by design — one shared audio engine, not
// one per component instance — since only one gameplay screen (a chess
// match or a quiz round) is ever on screen at a time. If that assumption
// ever changes (e.g. a mini-player that persists across navigation), this
// would need to move into a proper context instead.

let initialized = false;
let started = false;
let masterVolume: Tone.Volume | null = null;
let padSynth: Tone.PolySynth<Tone.Synth> | null = null;
let arpSynth: Tone.Synth | null = null;
let bellSynth: Tone.MetalSynth | null = null;
let padLoop: Tone.Loop | null = null;
let arpLoop: Tone.Loop | null = null;
let bellLoop: Tone.Loop | null = null;

const CHORDS: string[][] = [
  ["A2", "C4", "E4", "A4"], // Am
  ["F2", "A3", "C4", "F4"], // F
  ["C3", "E3", "G3", "C4"], // C
  ["G2", "B3", "D4", "G4"], // G
];
const ARP_NOTES = ["A3", "C4", "E4", "A4", "E4", "C4"];

function build() {
  if (initialized) return;
  initialized = true;

  masterVolume = new Tone.Volume(-14).toDestination();
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.35 }).connect(masterVolume);
  const filter = new Tone.Filter(1800, "lowpass").connect(reverb);

  padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 2.5, decay: 1, sustain: 0.8, release: 4 },
    volume: -6,
  }).connect(filter);

  arpSynth = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.8 },
    volume: -16,
  }).connect(reverb);

  bellSynth = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 1.2, release: 0.3 },
    harmonicity: 3.1,
    modulationIndex: 12,
    resonance: 2000,
    octaves: 1.2,
  } as ConstructorParameters<typeof Tone.MetalSynth>[0]).connect(reverb);
  bellSynth.volume.value = -26;

  Tone.getTransport().bpm.value = 72;

  let chordIndex = 0;
  padLoop = new Tone.Loop((time) => {
    padSynth?.triggerAttackRelease(CHORDS[chordIndex % CHORDS.length]!, "2m", time);
    chordIndex++;
  }, "2m");

  let arpIndex = 0;
  arpLoop = new Tone.Loop((time) => {
    // Skip roughly a third of the beats — a sparse, unhurried feel reads as
    // "ambient" rather than a busy melody competing for attention.
    if (Math.random() > 0.35) {
      arpSynth?.triggerAttackRelease(ARP_NOTES[arpIndex % ARP_NOTES.length]!, "8n", time);
    }
    arpIndex++;
  }, "2n");

  bellLoop = new Tone.Loop((time) => {
    if (Math.random() > 0.7) {
      bellSynth?.triggerAttackRelease("C6", "8n", time);
    }
  }, "1m");
}

// Browsers block audio until a real user gesture happens — this can only
// ever succeed from inside a click/tap handler (the toggle button), never
// on page load automatically.
export async function startBackgroundMusic(volume: number) {
  build();
  await Tone.start();
  if (masterVolume) masterVolume.volume.value = Tone.gainToDb(Math.max(0.0001, volume));
  padLoop?.start(0);
  arpLoop?.start("1m");
  bellLoop?.start("2m");
  Tone.getTransport().start();
  started = true;
}

export function stopBackgroundMusic() {
  if (!started) return;
  padLoop?.stop();
  arpLoop?.stop();
  bellLoop?.stop();
  Tone.getTransport().stop();
  started = false;
}

export function setBackgroundMusicVolume(volume: number) {
  if (masterVolume) masterVolume.volume.value = Tone.gainToDb(Math.max(0.0001, volume));
}

export function isBackgroundMusicStarted() {
  return started;
}