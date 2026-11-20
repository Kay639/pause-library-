const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "data.js");
const recordings = path.resolve(process.argv[2] || root);
const source = fs.readFileSync(sourcePath, "utf8");
const feelings = vm.runInNewContext(source + "\nFEELINGS");
const durations = new Map();

for (const feeling of feelings) {
  for (const [index, practice] of feeling.practices.entries()) {
    const field = index === 0 ? "audio" : "memberAudio";
    const recording = practice[field];
    if (!recording) continue;
    const key = JSON.stringify([field, recording]);
    if (durations.has(key)) continue;
    const input = index === 0 && /^https?:\/\//i.test(recording)
      ? recording
      : path.resolve(index === 0 ? root : recordings, recording);
    const seconds = Number(execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", input
    ], { encoding: "utf8" }).trim());
    if (!Number.isFinite(seconds) || seconds <= 0) throw new Error("Invalid duration for " + recording);
    durations.set(key, Math.max(1, Math.round(seconds / 60)));
  }
}

const updated = source.replace(/(\bminutes:\s*)\d+(?=[^\n]*\b(?:audio|memberAudio):)([^\n]*?\b(audio|memberAudio):\s*)("(?:[^"\\]|\\.)*")/g,
  (entry, minutes, spacing, field, quotedPath) => {
    const duration = durations.get(JSON.stringify([field, JSON.parse(quotedPath)]));
    return duration === undefined ? entry : minutes + duration + spacing + quotedPath;
  });
if (updated !== source) fs.writeFileSync(sourcePath, updated);
