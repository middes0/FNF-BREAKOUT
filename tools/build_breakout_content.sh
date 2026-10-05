#!/usr/bin/env bash
set -euo pipefail

ENGINE_DIR="${1:?engine dir required}"
MOD_DIR="${2:?mod dir required}"
ASSETS="${ENGINE_DIR}/assets/shared"

mkdir -p "${MOD_DIR}/images/characters" "${MOD_DIR}/images" "${MOD_DIR}/images/icons"
mkdir -p "${MOD_DIR}/songs/breakout" "${MOD_DIR}/songs/overdrive" "${MOD_DIR}/songs/neon-run"
mkdir -p "${MOD_DIR}/data/breakout" "${MOD_DIR}/data/overdrive" "${MOD_DIR}/data/neon-run"

command -v convert >/dev/null 2>&1 || { echo "ImageMagick não encontrado"; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "FFmpeg não encontrado"; exit 1; }

# --- Character art ---------------------------------------------------------
cp "${ASSETS}/images/characters/BOYFRIEND.png" "${MOD_DIR}/images/characters/KAI.png"
cp "${ASSETS}/images/characters/BOYFRIEND.xml" "${MOD_DIR}/images/characters/KAI.xml"
cp "${ASSETS}/images/characters/DADDY_DEAREST.png" "${MOD_DIR}/images/characters/REX.png"
cp "${ASSETS}/images/characters/DADDY_DEAREST.xml" "${MOD_DIR}/images/characters/REX.xml"
cp "${ASSETS}/images/characters/GF_assets.png" "${MOD_DIR}/images/characters/NOVA.png"
cp "${ASSETS}/images/characters/GF_assets.xml" "${MOD_DIR}/images/characters/NOVA.xml"

# Recolor preserving alpha and animation atlas dimensions.
convert "${MOD_DIR}/images/characters/KAI.png" \
  -fuzz 22% -fill "#7b3ff2" -opaque "#31b0d5" \
  -fuzz 15% -fill "#17121f" -opaque "#f52f3b" \
  "${MOD_DIR}/images/characters/KAI.png"

convert "${MOD_DIR}/images/characters/REX.png" \
  -fuzz 13% -fill "#be304b" -opaque "#af66ce" \
  "${MOD_DIR}/images/characters/REX.png"

convert "${MOD_DIR}/images/characters/NOVA.png" \
  -fuzz 12% -fill "#a052dc" -opaque "#f05c9b" \
  "${MOD_DIR}/images/characters/NOVA.png"

# --- Custom stage art ------------------------------------------------------
convert -size 1280x720 gradient:"#07030d-#2d0a48" "${MOD_DIR}/images/breakout-bg.png"
convert -size 1280x720 gradient:"#080207-#4a0b1b" "${MOD_DIR}/images/overdrive-bg.png"
convert -size 1280x720 gradient:"#040b16-#3d1c69" "${MOD_DIR}/images/neon-run-bg.png"

# --- BREAKOUT note skin ---------------------------------------------------
cp "${ASSETS}/images/noteSkins/NOTE_assets.png" "${MOD_DIR}/images/NOTE_assets.png"
cp "${ASSETS}/images/noteSkins/NOTE_assets.xml" "${MOD_DIR}/images/NOTE_assets.xml"
convert "${MOD_DIR}/images/NOTE_assets.png" \
  -fill "#7b3ff2" -colorize 28% \
  "${MOD_DIR}/images/NOTE_assets.png"

# --- BREAKOUT health icons -------------------------------------------------
cp "${ASSETS}/images/icons/icon-bf.png" "${MOD_DIR}/images/icons/kai.png"
cp "${ASSETS}/images/icons/icon-dad.png" "${MOD_DIR}/images/icons/rex.png"
cp "${ASSETS}/images/icons/icon-gf.png" "${MOD_DIR}/images/icons/nova.png"
convert "${MOD_DIR}/images/icons/kai.png" -fill "#7b3ff2" -colorize 24% "${MOD_DIR}/images/icons/kai.png"
convert "${MOD_DIR}/images/icons/rex.png" -fill "#be304b" -colorize 22% "${MOD_DIR}/images/icons/rex.png"
convert "${MOD_DIR}/images/icons/nova.png" -fill "#a052dc" -colorize 22% "${MOD_DIR}/images/icons/nova.png"

convert -size 1280x160 xc:"#09030f" \
  -stroke "#7b3ff2" -strokewidth 4 \
  -fill none -draw "line 0,20 1280,20 line 0,150 1280,150" \
  -stroke "#3b145c" -strokewidth 2 \
  -draw "line 0,55 1280,55 line 0,92 1280,92 line 80,0 10,160 line 260,0 190,160 line 440,0 370,160 line 620,0 550,160 line 800,0 730,160 line 980,0 910,160 line 1160,0 1090,160" \
  "${MOD_DIR}/images/breakout-floor.png"

# Variant floors keep the same geometry but change the song identity.
cp "${MOD_DIR}/images/breakout-floor.png" "${MOD_DIR}/images/overdrive-floor.png"
cp "${MOD_DIR}/images/breakout-floor.png" "${MOD_DIR}/images/neon-run-floor.png"
convert "${MOD_DIR}/images/overdrive-floor.png" -fill "#be304b" -colorize 28% "${MOD_DIR}/images/overdrive-floor.png"
convert "${MOD_DIR}/images/neon-run-floor.png" -fill "#5d49d8" -colorize 24% "${MOD_DIR}/images/neon-run-floor.png"

# A compact app icon generated directly in CI, so the APK already has the
# BREAKOUT identity without committing a binary blob to this repository.
convert -size 512x512 xc:"#09030f" \
  -fill "#7b3ff2" -draw "roundrectangle 44,44 468,468 88,88" \
  -fill "#0b0612" -draw "roundrectangle 76,76 436,436 64,64" \
  -fill "#ffffff" -font DejaVu-Sans-Bold -pointsize 210 -gravity center -annotate +0+8 "B" \
  "${ENGINE_DIR}/art/iconApp.png"

# --- Clone three proven charts, but point them at our characters/stage -----
python3 - "${ASSETS}" "${MOD_DIR}" <<'PY'
import json, pathlib, sys, shutil
assets = pathlib.Path(sys.argv[1])
mod = pathlib.Path(sys.argv[2])

charts = [
    ("fresh", "breakout", "BREAKOUT"),
    ("dad-battle", "overdrive", "OVERDRIVE"),
    ("blammed", "neon-run", "NEON RUN"),
]

for source, folder, title in charts:
    src = assets / "data" / source / f"{source}.json"
    with src.open(encoding="utf-8") as f:
        data = json.load(f)
    data["song"]["song"] = title
    data["song"]["player1"] = "kai"
    data["song"]["player2"] = "rex"
    data["song"]["needsVoices"] = False
    data["song"]["stage"] = "breakout"
    out = mod / "data" / folder / f"{folder}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))

    # Add an explicit difficulty alias so the songs remain easy to discover.
    hard = dict(data)
    hard["song"] = dict(data["song"])
    hard["song"]["speed"] = max(1.0, float(data["song"].get("speed", 1.0)) + 0.15)
    with (out.parent / f"{folder}-hard.json").open("w", encoding="utf-8") as f:
        json.dump(hard, f, separators=(",", ":"))

    # Song duration is derived from the chart, then passed to the generator.
    max_ms = 0.0
    for sec in data["song"].get("notes", []):
        for note in sec.get("sectionNotes", []):
            if note:
                max_ms = max(max_ms, float(note[0]) + float(note[2] or 0))
    seconds = max(45.0, max_ms / 1000.0 + 4.0)

    style = {"breakout": "breakout", "overdrive": "overdrive", "neon-run": "neon"}[folder]
    print(f"GEN {folder} bpm={data['song']['bpm']} seconds={seconds:.1f} style={style}")
    (mod / ".music_jobs").open("a", encoding="utf-8").write(f"{folder}|{data['song']['bpm']}|{seconds}\n")
PY

: > "${MOD_DIR}/.generated_music_jobs"
while IFS='|' read -r folder bpm seconds; do
  [ -z "${folder}" ] && continue
  style="breakout"
  [ "${folder}" = "overdrive" ] && style="overdrive"
  [ "${folder}" = "neon-run" ] && style="neon"
  echo "${folder}|${bpm}|${seconds}|${style}" >> "${MOD_DIR}/.generated_music_jobs"
done < "${MOD_DIR}/.music_jobs"
rm -f "${MOD_DIR}/.music_jobs"

# --- Original procedural music --------------------------------------------
python3 - "${MOD_DIR}/.generated_music_jobs" "${MOD_DIR}" <<'PY'
import math, random, struct, sys, wave, pathlib, subprocess

jobs = pathlib.Path(sys.argv[1])
mod = pathlib.Path(sys.argv[2])
SR = 22050

def midi(n):
    return 440.0 * (2.0 ** ((n - 69) / 12.0))

def envelope(x, length):
    return max(0.0, 1.0 - x / max(length, 1e-6))

def synth(path, bpm, seconds, style):
    bpm = float(bpm); seconds = float(seconds)
    beat = 60.0 / bpm
    total = int(seconds * SR)
    rng = random.Random({"breakout": 11, "overdrive": 22, "neon": 33}[style])
    samples = []

    scales = {
        "breakout": [48, 51, 53, 55, 58, 60, 63],
        "overdrive": [40, 43, 45, 47, 50, 52, 55],
        "neon": [55, 57, 60, 62, 64, 67, 69],
    }[style]
    roots = scales[:4]

    noise = [rng.uniform(-1, 1) for _ in range(SR // 10 + 2)]
    for i in range(total):
        t = i / SR
        p = t / beat
        beat_i = int(p)
        frac = p - beat_i
        step = beat_i % 16
        bar = beat_i // 16

        # Four-on-the-floor kick with a short pitch drop.
        kick = 0.0
        if frac < 0.18 and step % 4 == 0:
            x = frac
            f = 95.0 - 55.0 * min(x / 0.18, 1.0)
            kick = math.sin(2 * math.pi * f * x) * math.exp(-16 * x) * 0.9

        snare = 0.0
        if (step % 4 == 2 and frac < 0.12):
            idx = int((frac * SR) % len(noise))
            snare = noise[idx] * math.exp(-24 * frac) * 0.42

        hat = 0.0
        if frac < 0.035 and step % 2 == 0:
            idx = int((t * SR) % len(noise))
            hat = noise[idx] * math.exp(-70 * frac) * 0.11

        # Bass notes change every two beats.
        note_index = (step // 2) % len(roots)
        base = midi(roots[note_index])
        bass = math.sin(2 * math.pi * base * t) * 0.18
        bass += math.sin(2 * math.pi * (base / 2.0) * t) * 0.06

        # Bright synth lead, synchronized to the chart BPM.
        lead_note = scales[(step + bar) % len(scales)] + (12 if style != "neon" else 24)
        lf = midi(lead_note)
        gate = 1.0 if frac < 0.72 else 0.35
        lead = math.sin(2 * math.pi * lf * t) * 0.105 * gate
        lead += math.sin(2 * math.pi * lf * 2.01 * t) * 0.045 * gate

        # Slow pad gives the track body without burying the notes.
        chord_root = midi(roots[(bar // 2) % len(roots)] + 12)
        pad = (math.sin(2 * math.pi * chord_root * t) +
               0.7 * math.sin(2 * math.pi * chord_root * 1.25 * t) +
               0.55 * math.sin(2 * math.pi * chord_root * 1.5 * t)) * 0.035

        # Small section changes.
        section_boost = 1.0 + (0.22 if (bar % 8) >= 4 else 0.0)
        if style == "overdrive":
            lead *= 1.2
            kick *= 1.12
        elif style == "neon":
            hat *= 1.35
            pad *= 1.25

        v = (kick + snare + hat + bass + lead + pad) * section_boost
        # Gentle master saturation.
        v = math.tanh(v * 1.25) * 0.82
        samples.append(int(max(-1, min(1, v)) * 32767))

    wav_path = path.with_suffix(".wav")
    with wave.open(str(wav_path), "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes(b"".join(struct.pack("<h", x) for x in samples))

    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
        "-c:a", "libvorbis", "-q:a", "5", str(path)
    ], check=True)
    wav_path.unlink()

for line in jobs.read_text().splitlines():
    folder, bpm, seconds, style = line.split("|")
    out = mod / "songs" / folder / "Inst.ogg"
    out.parent.mkdir(parents=True, exist_ok=True)
    synth(out, bpm, seconds, style)
PY

# Clean CI-only metadata.
rm -f "${MOD_DIR}/.generated_music_jobs"

# --- Mobile mod update sync -------------------------------------------------
# The mobile engine extracts bundled mods to external storage. Older versions
# only restored missing files, so an installed BREAKOUT mod could keep stale
# character assets forever. Compare pack metadata and force-refresh the bundled
# mod when its version/content changes.
STORAGE_HX="${ENGINE_DIR}/source/mobile/backend/StorageSystem.hx"
python3 - "${STORAGE_HX}" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

needle = "\tprivate static function startApkCopy():Void\n"
helper = '''\tprivate static function syncBundledModsIfNeeded():Int
\t{
\t\t#if mobile
\t\tvar restored:Int = 0;
\t\tvar installedPack:String = getDirectory() + "mods/BREAKOUT/pack.json";
\t\tvar bundledPack:String = "mods/BREAKOUT/pack.json";
\t\ttry
\t\t{
\t\t\tvar shouldSync:Bool = !FileSystem.exists(installedPack);
\t\t\tif (!shouldSync && Assets.exists(bundledPack))
\t\t\t{
\t\t\t\tvar bundledText:String = Assets.getText(bundledPack);
\t\t\t\tvar installedText:String = File.getContent(installedPack);
\t\t\t\tshouldSync = (bundledText != installedText);
\t\t\t}
\t\t\tif (shouldSync)
\t\t\t{
\t\t\t\trestored = copyFromAPK("mods/", null, true);
\t\t\t\ttrace('Bundled mod update applied: $restored files refreshed.');
\t\t\t}
\t\t}
\t\tcatch (e:Dynamic)
\t\t{
\t\t\ttrace('Bundled mod sync error: $e');
\t\t}
\t\treturn restored;
\t\t#else
\t\treturn 0;
\t\t#end
\t}

'''
if "syncBundledModsIfNeeded" not in s:
    if needle not in s:
        raise SystemExit("StorageSystem marker not found; refusing to patch")
    s = s.replace(needle, helper + needle, 1)

old = """\t\t\t\ttrace("Running silent integrity check...");
\t\t\t\tvar restoredAssets = copyFromAPK("assets/", null, false, getAssetsDirectory());
\t\t\t\tvar restoredContent = copyFromAPK("mods/", null, false);
\t\t\t\t
\t\t\t\tif (restoredAssets > 0 || restoredContent > 0)"""
new = """\t\t\t\ttrace("Running silent integrity check...");
\t\t\t\tvar restoredAssets = copyFromAPK("assets/", null, false, getAssetsDirectory());
\t\t\t\tvar restoredContent = copyFromAPK("mods/", null, false);
\t\t\t\trestoredContent += syncBundledModsIfNeeded();
\t\t\t\t
\t\t\t\tif (restoredAssets > 0 || restoredContent > 0)"""
if old not in s:
    raise SystemExit("StorageSystem integrity snippet not found; refusing to patch")
s = s.replace(old, new, 1)
p.write_text(s, encoding="utf-8")
print("StorageSystem mobile sync patch applied")
PY

grep -q "syncBundledModsIfNeeded" "${STORAGE_HX}"

# Make the custom week discoverable even if the mod's week-list overlay is ignored.
if ! grep -qxF "breakout" "${ASSETS}/data/weekList.txt"; then
  printf '\nbreakout\n' >> "${ASSETS}/data/weekList.txt"
fi

echo "BREAKOUT content assembled successfully."
find "${MOD_DIR}" -maxdepth 3 -type f | sort
