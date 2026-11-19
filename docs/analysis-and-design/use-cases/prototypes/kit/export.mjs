#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const KIT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROTOTYPES_DIR = path.resolve(KIT_DIR, "..");
const INDEX_URL = pathToFileURL(path.join(KIT_DIR, "index.html")).href;

const SCREENS = [
  { id: "S09-01", file: "UC09/S09-01-plan-shift.png", w: 1440, h: 900 },
  { id: "S09-02", file: "UC09/S09-02-review-route.png", w: 1440, h: 900 },
  { id: "S09-03", file: "UC09/S09-03-published.png", w: 1440, h: 900 },
  { id: "S09-04", file: "UC09/S09-04-empty.png", w: 1440, h: 900 },
  { id: "S09-05", file: "UC09/S09-05-rider-capacity.png", w: 1440, h: 900 },
  { id: "S09-06", file: "UC09/S09-06-stale.png", w: 1440, h: 900 },
  { id: "S09-07", file: "UC09/S09-07-no-orders-selected.png", w: 1440, h: 900 },
  { id: "S10-01", file: "UC10/S10-01-adjust.png", w: 1440, h: 900 },
  { id: "S10-02", file: "UC10/S10-02-confirm.png", w: 1440, h: 900 },
  { id: "S10-03", file: "UC10/S10-03-updated.png", w: 1440, h: 900 },
  { id: "S10-04", file: "UC10/S10-04-completed.png", w: 1440, h: 900 },
  { id: "S10-05", file: "UC10/S10-05-blocked.png", w: 1440, h: 900 },
  { id: "S10-06", file: "UC10/S10-06-stale.png", w: 1440, h: 900 },
  { id: "S10-07", file: "UC10/S10-07-rider-unavailable.png", w: 1440, h: 900 },
  { id: "S14-01", file: "UC14/S14-01-stops.png", w: 360, h: 800 },
  { id: "S14-02", file: "UC14/S14-02-reasons.png", w: 360, h: 800 },
  { id: "S14-03", file: "UC14/S14-03-empty.png", w: 360, h: 800 },
  { id: "S14-04", file: "UC14/S14-04-fallback.png", w: 360, h: 800 },
  { id: "S14-05", file: "UC14/S14-05-overdue.png", w: 360, h: 800 },
  { id: "S14-06", file: "UC14/S14-06-tie.png", w: 360, h: 800 },
  { id: "S14-07", file: "UC14/S14-07-choice.png", w: 360, h: 800 },
  { id: "S14-08", file: "UC14/S14-08-priority.png", w: 360, h: 800 },
  { id: "S14-09", file: "UC14/S14-09-distance.png", w: 360, h: 800 }
];

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    "google-chrome",
    "chromium",
    "chromium-browser"
  ].filter(Boolean);
  for (const bin of candidates) {
    try {
      execFileSync(bin, ["--version"], { stdio: "ignore" });
      return bin;
    } catch {
      // try next
    }
  }
  throw new Error("No Chrome/Chromium binary found (set CHROME_BIN to override)");
}

const chrome = findChrome();
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "veylo-booyah21-"));
const failures = [];

try {
  for (const screen of SCREENS) {
    const outPath = path.join(PROTOTYPES_DIR, screen.file);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const url = `${INDEX_URL}?screen=${screen.id}&theme=light&standalone=1`;
    const commonArgs = [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${tmpDir}`,
      `--window-size=${screen.w},${screen.h}`,
      "--force-device-scale-factor=1",
      "--hide-scrollbars",
      "--virtual-time-budget=1200"
    ];

    execFileSync(chrome, [...commonArgs, `--screenshot=${outPath}`, url], {
      stdio: ["ignore", "ignore", "ignore"]
    });

    const dom = execFileSync(chrome, [...commonArgs, "--dump-dom", url], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });

    if (!dom.includes('data-layout-ok="true"')) {
      const match = dom.match(/data-layout-issues="([^"]*)"/);
      failures.push(`${screen.id}: ${match ? match[1] : "layout check failed"}`);
    }
    console.log(`Exported ${screen.file} (${screen.w}x${screen.h})`);
  }
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error("Layout failures:\n" + failures.join("\n"));
  process.exit(1);
}
console.log(`All ${SCREENS.length} screens exported cleanly with zero overflow or clipping.`);
