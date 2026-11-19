// Embed captures only after the complete manifest matches the PNG dimensions and hashes.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { assertPngDimensions, screens } from "./export.mjs";

const documentPath = new URL("../../UC-F04-F08-Delivery-Reporting.md", import.meta.url);
const invalid = [];
const hashes = new Map();
for (const screen of screens) {
  const { png } = screen;
  try {
    const image = readFileSync(new URL(png, import.meta.url));
    assertPngDimensions(image, screen);
    const hash = createHash("sha256").update(image).digest("hex");
    if (hashes.has(hash)) throw new Error(`Capture duplicates ${hashes.get(hash)}.`);
    hashes.set(hash, png);
  } catch (error) {
    invalid.push(`${png}: ${error.code === "ENOENT" ? "missing" : error.message}`);
  }
}
if (invalid.length) {
  console.error(`${invalid.length}/${screens.length} captures are missing or invalid. First: ${invalid[0]}`);
  process.exit(1);
}

let markdown = readFileSync(documentPath, "utf8");
for (const { id, png } of screens) {
  const anchor = `<a id="${id.toLowerCase()}"></a>`;
  const evidence = `![${id} — ${id.slice(7).replaceAll("-", " ")}](prototypes/delivery-execution-reporting/${png})`;
  const index = markdown.indexOf(anchor);
  if (index < 0) throw new Error(`Missing evidence anchor for ${id}`);
  const end = markdown.indexOf("\n\n", markdown.indexOf("\n\n", index) + 2);
  const old = markdown.slice(end + 2).split("\n", 1)[0];
  if (old !== "_PNG capture pending browser verification._" && old !== evidence) {
    throw new Error(`Unexpected evidence entry for ${id}`);
  }
  markdown = markdown.slice(0, end + 2) + evidence + markdown.slice(end + 2 + old.length);
}
markdown = markdown.replace(/\d+\/\d+ PNGs embedded\. (?:PNG capture and reviewer walkthrough pending|Reviewer walkthrough pending)\./,
  `${screens.length}/${screens.length} PNGs embedded. Reviewer walkthrough pending.`);
writeFileSync(documentPath, markdown, "utf8");
console.log(`Embedded ${screens.length} distinct, dimension-checked PNGs in the UC specification.`);
