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
rm -f "\${MOD_DIR}/images/characters/KAI."{png,xml} "\${MOD_DIR}/images/characters/REX."{png,xml} "\${MOD_DIR}/images/characters/NOVA."{png,xml}

python3 - "\${MOD_DIR}/images/characters" <<'PY'
from pathlib import Path
import math, subprocess, sys

out=Path(sys.argv[1]); W,H,COLS=400,520,4

def svg(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><g stroke="#08060d" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>'

KAI='''<ellipse cx="200" cy="468" rx="102" ry="18" fill="#09070d" stroke="none" opacity=".5"/>
<path d="M128 315L111 443L171 443L187 350Z" fill="#18141f"/><path d="M272 315L289 443L229 443L213 350Z" fill="#18141f"/>
<path d="M104 438L174 438L181 472L109 472Z" fill="#28212e"/><path d="M296 438L226 438L219 472L291 472Z" fill="#28212e"/>
<path d="M110 205Q200 174 290 205L275 337Q200 379 125 337Z" fill="#17121f"/>
<path d="M122 212L168 194L181 332L132 338Z" fill="#7b3ff2"/><path d="M278 212L232 194L219 332L268 338Z" fill="#b85eff"/>
<path d="M118 238L55 289L69 309L145 269Z" fill="#1a1522"/><path d="M282 238L345 289L331 309L255 269Z" fill="#1a1522"/>
<circle cx="61" cy="300" r="13" fill="#b85eff"/><circle cx="339" cy="300" r="13" fill="#b85eff"/>
<ellipse cx="200" cy="122" rx="78" ry="74" fill="#7a4a34"/>
<path d="M123 111L136 45L177 67L199 28L222 65L267 41L280 111L246 90L228 112L202 81L177 113L153 89Z" fill="#101016"/>
<path d="M159 66L175 44L191 81L172 100Z" fill="#7b3ff2"/>
<rect x="136" y="123" width="128" height="24" rx="10" fill="#0d0b12"/><circle cx="166" cy="135" r="5" fill="#f6efff" stroke="none"/><circle cx="234" cy="135" r="5" fill="#f6efff" stroke="none"/>
<path d="M172 170Q200 187 228 170" fill="none" stroke="#1d0e12"/><path d="M125 105Q91 119 100 161" fill="none" stroke="#7b3ff2" stroke-width="10"/><path d="M275 105Q309 119 300 161" fill="none" stroke="#7b3ff2" stroke-width="10"/><circle cx="100" cy="161" r="8" fill="#b85eff"/><circle cx="300" cy="161" r="8" fill="#b85eff"/>'''

REX='''<ellipse cx="200" cy="469" rx="125" ry="21" fill="#09070d" stroke="none" opacity=".5"/>
<path d="M131 330L116 448L176 448L188 360Z" fill="#121017"/><path d="M269 330L284 448L224 448L212 360Z" fill="#121017"/>
<path d="M102 440L178 440L185 477L107 477Z" fill="#251d25"/><path d="M298 440L222 440L215 477L293 477Z" fill="#251d25"/>
<path d="M96 206Q200 174 304 206L283 353Q200 386 117 353Z" fill="#251019"/>
<path d="M106 214L156 194L180 353L130 346Z" fill="#8c2842"/><path d="M294 214L244 194L220 353L270 346Z" fill="#8c2842"/>
<path d="M118 235L57 204L44 230L113 271Z" fill="#24151d"/><path d="M282 235L343 204L356 230L287 271Z" fill="#24151d"/>
<circle cx="51" cy="217" r="14" fill="#8c2842"/><circle cx="349" cy="217" r="14" fill="#8c2842"/>
<ellipse cx="200" cy="115" rx="84" ry="79" fill="#683f2e"/>
<path d="M117 106Q118 31 200 18Q282 31 283 106L258 78L237 102L211 67L184 102L160 76L138 106Z" fill="#181219"/>
<rect x="122" y="116" width="156" height="25" rx="9" fill="#0c0a0f"/><circle cx="164" cy="128" r="5" fill="#ffdbdf" stroke="none"/><circle cx="236" cy="128" r="5" fill="#ffdbdf" stroke="none"/>
<path d="M160 165Q200 188 240 165" fill="none" stroke="#281015" stroke-width="8"/><path d="M151 152L131 165M249 152L269 165" stroke="#321018" stroke-width="6"/>
<path d="M104 187L82 150L100 136L126 172Z" fill="#20131a"/><path d="M296 187L318 150L300 136L274 172Z" fill="#20131a"/>'''

NOVA='''<ellipse cx="200" cy="447" rx="84" ry="17" fill="#09070d" stroke="none" opacity=".45"/>
<path d="M110 199L76 166L91 222Z" fill="#7b3ff2"/><path d="M290 199L324 166L309 222Z" fill="#7b3ff2"/><path d="M110 301L76 334L91 278Z" fill="#7b3ff2"/><path d="M290 301L324 334L309 278Z" fill="#7b3ff2"/>
<circle cx="200" cy="250" r="133" fill="#0d0b12"/><circle cx="200" cy="250" r="109" fill="#18131f" stroke="#b85eff" stroke-width="11"/>
<circle cx="200" cy="250" r="84" fill="#09080e"/><ellipse cx="200" cy="250" rx="54" ry="48" fill="#161021"/>
<ellipse cx="180" cy="249" rx="12" ry="16" fill="#f5ecff"/><ellipse cx="220" cy="249" rx="12" ry="16" fill="#f5ecff"/><circle cx="182" cy="251" r="6" fill="#7b3ff2" stroke="none"/><circle cx="222" cy="251" r="6" fill="#7b3ff2" stroke="none"/>
<path d="M176 283Q200 300 224 283" fill="none" stroke="#b85eff" stroke-width="7"/><path d="M200 141V94" stroke="#7b3ff2" stroke-width="9"/><circle cx="200" cy="84" r="12" fill="#b85eff"/>
<path d="M123 174L96 141M277 174L304 141M123 326L96 359M277 326L304 359" fill="none" stroke="#b85eff" stroke-width="7"/><circle cx="90" cy="136" r="9" fill="#7b3ff2"/><circle cx="310" cy="136" r="9" fill="#7b3ff2"/>'''

bases={"KAI":svg(KAI),"REX":svg(REX),"NOVA":svg(NOVA)}
specs={"KAI":[("idle","KAI idle"),("idle","KAI idle"),("left","KAI LEFT"),("down","KAI DOWN"),("up","KAI UP"),("right","KAI RIGHT"),("leftmiss","KAI LEFT MISS"),("downmiss","KAI DOWN MISS"),("upmiss","KAI UP MISS"),("rightmiss","KAI RIGHT MISS"),("hey","KAI HEY"),("hurt","KAI HURT")],"REX":[("idle","REX idle"),("idle","REX idle"),("left","REX LEFT"),("down","REX DOWN"),("up","REX UP"),("right","REX RIGHT")],"NOVA":[("idle","NOVA idle"),("idle","NOVA idle"),("left","NOVA LEFT"),("down","NOVA DOWN"),("up","NOVA UP"),("right","NOVA RIGHT"),("cheer","NOVA CHEER"),("scared","NOVA SCARED")]}
angles={"idle":0,"left":-10,"down":7,"up":-6,"right":10,"leftmiss":-16,"downmiss":12,"upmiss":-11,"rightmiss":16,"hey":-4,"hurt":14,"cheer":-12,"scared":4}

for char,frames in specs.items():
    base=out/f"{char}-base.svg"; base.write_text(bases[char],encoding="utf-8")
    subprocess.run(["convert","-background","none",str(base),str(out/f"{char}-base.png")],check=True)
    pngs=[]; xml=[]; rows=math.ceil(len(frames)/COLS)
    for i,(pose,prefix) in enumerate(frames):
        f=out/f"{char}-{i}.png"
        subprocess.run(["convert",str(out/f"{char}-base.png"),"-background","none","-rotate",str(angles[pose]),"-gravity","center","-crop",f"{W}x{H}+0+0","-repage",str(f)],check=True)
        pngs.append(str(f)); xml.append(f'<SubTexture name="{prefix}0000" x="{(i%COLS)*W}" y="{(i//COLS)*H}" width="{W}" height="{H}"/>')
    rows_png=[]
    for row in range(rows):
        rf=pngs[row*COLS:(row+1)*COLS]
        while len(rf)<COLS:
            blank=out/f"{char}-blank.png"; subprocess.run(["convert","-size",f"{W}x{H}","xc:none",str(blank)],check=True); rf.append(str(blank))
        rowpng=out/f"{char}-row-{row}.png"; subprocess.run(["convert",*rf,"+append",str(rowpng)],check=True); rows_png.append(str(rowpng))
    subprocess.run(["convert",*rows_png,"-append",str(out/f"{char}.png")],check=True)
    (out/f"{char}.xml").write_text(f'<TextureAtlas imagePath="{char}.png">\\n'+"\\n".join(xml)+"\\n</TextureAtlas>\\n",encoding="utf-8")
    for p in out.glob(f"{char}-*"): p.unlink(missing_ok=True)

PY

# Overwrite the character definitions and MOD version so the generated package
# never depends on the old Boyfriend/Daddy/GF animation names.
python3 - "\${MOD_DIR}/characters" "\${MOD_DIR}/pack.json" <<'PY'
import json, pathlib, sys
c=pathlib.Path(sys.argv[1]); p=pathlib.Path(sys.argv[2])
def base(anims,image,pos,icon,color,flip,scale,sing):
    return {"animations":anims,"no_antialiasing":False,"image":image,"position":pos,"healthicon":icon,"flip_x":flip,"healthbar_colors":color,"camera_position":[0,0],"sing_duration":sing,"scale":scale}
def a(anim,name,off=[0,0],fps=18,loop=False): return {"offsets":off,"loop":loop,"fps":fps,"anim":anim,"indices":[],"name":name}
kai=[a("idle","KAI idle",fps=12),a("singLEFT","KAI LEFT",[-4,8]),a("singDOWN","KAI DOWN",[0,12]),a("singUP","KAI UP",[0,-10]),a("singRIGHT","KAI RIGHT",[4,8]),a("singLEFTmiss","KAI LEFT MISS",[-4,12]),a("singDOWNmiss","KAI DOWN MISS",[0,14]),a("singUPmiss","KAI UP MISS",[0,-8]),a("singRIGHTmiss","KAI RIGHT MISS",[4,12]),a("hey","KAI HEY"),a("hurt","KAI HURT",[6,14])]
rex=[a("idle","REX idle",fps=12),a("singLEFT","REX LEFT"),a("singDOWN","REX DOWN",[0,4]),a("singUP","REX UP",[0,-8]),a("singRIGHT","REX RIGHT")]
nova=[a("idle","NOVA idle",fps=12),a("singLEFT","NOVA LEFT"),a("singDOWN","NOVA DOWN",[0,4]),a("singUP","NOVA UP",[0,-4]),a("singRIGHT","NOVA RIGHT"),a("cheer","NOVA CHEER"),a("scared","NOVA SCARED",loop=True,fps=12)]
defs={"kai":base(kai,"characters/KAI",[-20,300],"kai",[123,63,242],True,.95,4),"rex":base(rex,"characters/REX",[0,20],"rex",[190,48,75],False,.86,6.1),"nova":base(nova,"characters/NOVA",[-30,0],"nova",[162,80,220],False,.85,4)}
for k,v in defs.items(): (c/f"{k}.json").write_text(json.dumps(v,indent=2)+"\\n",encoding="utf-8")
pack=json.loads(p.read_text(encoding="utf-8")); pack["version"]="0.4.0"; pack["description"]="BREAKOUT — KAI, REX e NOVA com arte original. Música preservada nesta versão."; p.write_text(json.dumps(pack,indent=2)+"\\n",encoding="utf-8")
PY

find "\${MOD_DIR}/images/characters" -maxdepth 1 -type f ! -name 'KAI.png' ! -name 'KAI.xml' ! -name 'REX.png' ! -name 'REX.xml' ! -name 'NOVA.png' ! -name 'NOVA.xml' -delete

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
