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

# --- Character art (ORIGINAL, no FNF base sprites) -------------------------
rm -f "${MOD_DIR}/images/characters/KAI."{png,xml} "${MOD_DIR}/images/characters/REX."{png,xml} "${MOD_DIR}/images/characters/NOVA."{png,xml}

# Draw three original silhouettes directly with ImageMagick primitives.
convert -size 400x520 xc:none \
  -stroke "#08060d" -strokewidth 8 -fill "#09070d" -draw "ellipse 100,450 300,482" \
  -fill "#18141f" -draw "polygon 126,306 184,333 171,443 112,443" \
  -fill "#18141f" -draw "polygon 274,306 216,333 229,443 288,443" \
  -fill "#28212e" -draw "roundrectangle 104,438 178,474 8,8" \
  -fill "#28212e" -draw "roundrectangle 222,438 296,474 8,8" \
  -fill "#17121f" -draw "polygon 112,202 200,174 288,202 276,338 200,378 124,338" \
  -fill "#7b3ff2" -draw "polygon 122,210 169,193 181,332 132,338" \
  -fill "#b85eff" -draw "polygon 278,210 231,193 219,332 268,338" \
  -fill "#1a1522" -draw "polygon 118,238 55,288 69,309 145,268" \
  -fill "#1a1522" -draw "polygon 282,238 345,288 331,309 255,268" \
  -fill "#b85eff" -draw "circle 61,300 73,312 circle 339,300 351,312" \
  -fill "#7a4a34" -draw "ellipse 122,48 278,196" \
  -fill "#101016" -draw "polygon 123,111 136,45 177,67 199,28 222,65 267,41 280,111 246,90 228,112 202,81 177,113 153,89" \
  -fill "#7b3ff2" -draw "polygon 159,66 175,44 191,81 172,100" \
  -fill "#0d0b12" -draw "roundrectangle 136,123 264,147 10,10" \
  -fill "#f6efff" -stroke none -draw "circle 166,135 171,140 circle 234,135 239,140" \
  -fill none -stroke "#7b3ff2" -strokewidth 10 -draw "arc 91,85 309,175 180,360" \
  -fill "#b85eff" -stroke "#08060d" -strokewidth 6 -draw "circle 96,161 105,170 circle 295,161 304,170" \
  "${MOD_DIR}/images/characters/KAI-base.png"

convert -size 400x520 xc:none \
  -stroke "#08060d" -strokewidth 9 -fill "#09070d" -draw "ellipse 72,450 328,484" \
  -fill "#121017" -draw "polygon 130,328 188,346 176,448 116,448" \
  -fill "#121017" -draw "polygon 270,328 212,346 224,448 284,448" \
  -fill "#251d25" -draw "roundrectangle 106,440 184,478 9,9" \
  -fill "#251d25" -draw "roundrectangle 216,440 294,478 9,9" \
  -fill "#251019" -draw "polygon 96,204 200,174 304,204 283,352 200,386 117,352" \
  -fill "#8c2842" -draw "polygon 106,213 156,194 180,352 130,345" \
  -fill "#8c2842" -draw "polygon 294,213 244,194 220,352 270,345" \
  -fill "#24151d" -draw "polygon 118,235 57,204 44,230 113,271" \
  -fill "#24151d" -draw "polygon 282,235 343,204 356,230 287,271" \
  -fill "#8c2842" -draw "circle 51,217 65,231 circle 349,217 363,231" \
  -fill "#683f2e" -draw "ellipse 116,36 284,194" \
  -fill "#181219" -draw "polygon 117,106 120,45 160,72 184,39 205,67 236,42 280,106 258,78 237,102 211,67 184,102 160,76 138,106" \
  -fill "#0c0a0f" -draw "roundrectangle 122,116 278,141 9,9" \
  -fill "#ffdbdf" -stroke none -draw "circle 164,128 169,133 circle 236,128 241,133" \
  -fill none -stroke "#ef536e" -strokewidth 9 -draw "arc 135,55 265,185 205,340" \
  -fill "#8c2842" -stroke "#08060d" -strokewidth 6 -draw "circle 120,65 130,75 circle 270,65 280,75" \
  "${MOD_DIR}/images/characters/REX-base.png"

convert -size 400x520 xc:none \
  -stroke "#08060d" -strokewidth 9 -fill "#09070d" -draw "ellipse 108,430 292,464" \
  -fill "#0d0b12" -draw "circle 200,250 333,383" \
  -fill "#7b3ff2" -draw "polygon 110,200 72,165 89,225 polygon 290,200 328,165 311,225 polygon 110,300 72,335 89,275 polygon 290,300 328,335 311,275" \
  -fill "#18131f" -draw "circle 200,250 309,359" \
  -fill "#09080e" -draw "circle 200,250 284,334" \
  -fill "#161021" -draw "ellipse 146,204 254,296" \
  -fill "#f5ecff" -stroke none -draw "ellipse 168,232 192,266 ellipse 208,232 232,266" \
  -fill "#7b3ff2" -draw "circle 182,251 188,257 circle 222,251 228,257" \
  -fill none -stroke "#b85eff" -strokewidth 7 -draw "arc 170,258 230,312 210,330" \
  -fill none -stroke "#7b3ff2" -strokewidth 9 -draw "line 200,141 200,95" \
  -fill "#b85eff" -draw "circle 200,84 212,96" \
  -fill "#b85eff" -draw "circle 94,136 103,145 circle 306,136 315,145" \
  "${MOD_DIR}/images/characters/NOVA-base.png"

make_atlas() {
  local char="$1"
  local base="${MOD_DIR}/images/characters/${char}-base.png"
  shift
  local prefixes=()
  local angles=()
  while [ "$#" -gt 0 ]; do prefixes+=("$1"); angles+=("$2"); shift 2; done
  local frames=()
  local i f row rowpng
  for i in "${!prefixes[@]}"; do
    f="${MOD_DIR}/images/characters/${char}-${i}.png"
    convert "${base}" -background none -rotate "${angles[$i]}" -gravity center -crop 400x520+0+0 -repage "${f}"
    frames+=("${f}")
  done
  local rows=$(( (${#frames[@]} + 3) / 4 ))
  local rows_files=()
  for row in $(seq 0 $((rows-1))); do
    rowpng="${MOD_DIR}/images/characters/${char}-row-${row}.png"
    local list=()
    for i in 0 1 2 3; do
      local idx=$((row*4+i))
      if [ "${idx}" -lt "${#frames[@]}" ]; then
        list+=("${frames[$idx]}")
      else
        local blank="${MOD_DIR}/images/characters/${char}-blank.png"
        convert -size 400x520 xc:none "${blank}"
        list+=("${blank}")
      fi
    done
    convert "${list[@]}" +append "${rowpng}"
    rows_files+=("${rowpng}")
  done
  convert "${rows_files[@]}" -append "${MOD_DIR}/images/characters/${char}.png"
  {
    echo '<TextureAtlas imagePath="'"${char}"'.png">'
    for i in "${!prefixes[@]}"; do
      printf '<SubTexture name="%s0000" x="%d" y="%d" width="400" height="520"/>\n' "${prefixes[$i]}" $(( (i%4)*400 )) $(( (i/4)*520 ))
    done
    echo '</TextureAtlas>'
  } > "${MOD_DIR}/images/characters/${char}.xml"
  rm -f "${MOD_DIR}/images/characters/${char}-"* "${MOD_DIR}/images/characters/${char}-base.png"
}

make_atlas KAI \
  "KAI idle" 0 "KAI idle" 0 "KAI LEFT" -10 "KAI DOWN" 7 "KAI UP" -6 "KAI RIGHT" 10 \
  "KAI LEFT MISS" -16 "KAI DOWN MISS" 12 "KAI UP MISS" -11 "KAI RIGHT MISS" 16 "KAI HEY" -4 "KAI HURT" 14
make_atlas REX \
  "REX idle" 0 "REX idle" 0 "REX LEFT" -10 "REX DOWN" 7 "REX UP" -6 "REX RIGHT" 10
make_atlas NOVA \
  "NOVA idle" 0 "NOVA idle" 0 "NOVA LEFT" -10 "NOVA DOWN" 7 "NOVA UP" -6 "NOVA RIGHT" 10 "NOVA CHEER" -12 "NOVA SCARED" 4

cat > "${MOD_DIR}/characters/kai.json" <<'JSON'
{
  "animations": [
    {"offsets":[0,0],"loop":false,"fps":12,"anim":"idle","indices":[],"name":"KAI idle"},
    {"offsets":[-4,8],"loop":false,"fps":18,"anim":"singLEFT","indices":[],"name":"KAI LEFT"},
    {"offsets":[0,12],"loop":false,"fps":18,"anim":"singDOWN","indices":[],"name":"KAI DOWN"},
    {"offsets":[0,-10],"loop":false,"fps":18,"anim":"singUP","indices":[],"name":"KAI UP"},
    {"offsets":[4,8],"loop":false,"fps":18,"anim":"singRIGHT","indices":[],"name":"KAI RIGHT"},
    {"offsets":[-4,12],"loop":false,"fps":18,"anim":"singLEFTmiss","indices":[],"name":"KAI LEFT MISS"},
    {"offsets":[0,14],"loop":false,"fps":18,"anim":"singDOWNmiss","indices":[],"name":"KAI DOWN MISS"},
    {"offsets":[0,-8],"loop":false,"fps":18,"anim":"singUPmiss","indices":[],"name":"KAI UP MISS"},
    {"offsets":[4,12],"loop":false,"fps":18,"anim":"singRIGHTmiss","indices":[],"name":"KAI RIGHT MISS"},
    {"offsets":[0,0],"loop":false,"fps":18,"anim":"hey","indices":[],"name":"KAI HEY"},
    {"offsets":[6,14],"loop":false,"fps":18,"anim":"hurt","indices":[],"name":"KAI HURT"}
  ],
  "no_antialiasing":false,"image":"characters/KAI","position":[-20,300],"healthicon":"kai","flip_x":true,
  "healthbar_colors":[123,63,242],"camera_position":[0,0],"sing_duration":4,"scale":0.95
}
JSON
cat > "${MOD_DIR}/characters/rex.json" <<'JSON'
{
  "animations": [
    {"offsets":[0,0],"loop":false,"fps":12,"anim":"idle","indices":[],"name":"REX idle"},
    {"offsets":[0,0],"loop":false,"fps":18,"anim":"singLEFT","indices":[],"name":"REX LEFT"},
    {"offsets":[0,4],"loop":false,"fps":18,"anim":"singDOWN","indices":[],"name":"REX DOWN"},
    {"offsets":[0,-8],"loop":false,"fps":18,"anim":"singUP","indices":[],"name":"REX UP"},
    {"offsets":[0,0],"loop":false,"fps":18,"anim":"singRIGHT","indices":[],"name":"REX RIGHT"}
  ],
  "no_antialiasing":false,"image":"characters/REX","position":[0,20],"healthicon":"rex","flip_x":false,
  "healthbar_colors":[190,48,75],"camera_position":[0,0],"sing_duration":6.1,"scale":0.86
}
JSON
cat > "${MOD_DIR}/characters/nova.json" <<'JSON'
{
  "animations": [
    {"offsets":[0,0],"loop":false,"fps":12,"anim":"idle","indices":[],"name":"NOVA idle"},
    {"offsets":[0,0],"loop":false,"fps":18,"anim":"singLEFT","indices":[],"name":"NOVA LEFT"},
    {"offsets":[0,4],"loop":false,"fps":18,"anim":"singDOWN","indices":[],"name":"NOVA DOWN"},
    {"offsets":[0,-4],"loop":false,"fps":18,"anim":"singUP","indices":[],"name":"NOVA UP"},
    {"offsets":[0,0],"loop":false,"fps":18,"anim":"singRIGHT","indices":[],"name":"NOVA RIGHT"},
    {"offsets":[0,0],"loop":false,"fps":18,"anim":"cheer","indices":[],"name":"NOVA CHEER"},
    {"offsets":[0,0],"loop":true,"fps":12,"anim":"scared","indices":[],"name":"NOVA SCARED"}
  ],
  "no_antialiasing":false,"image":"characters/NOVA","position":[-30,0],"healthicon":"nova","flip_x":false,
  "healthbar_colors":[162,80,220],"camera_position":[0,0],"sing_duration":4,"scale":0.85
}
JSON

sed -i 's/"version": "0.3.1"/"version": "0.4.0"/' "${MOD_DIR}/pack.json"
sed -i 's/Três faixas, três identidades visuais e palco reativo./KAI, REX e NOVA com arte original. Música preservada nesta versão./' "${MOD_DIR}/pack.json"

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
