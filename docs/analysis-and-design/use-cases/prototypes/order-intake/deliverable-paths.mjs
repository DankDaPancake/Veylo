import { posix } from "node:path";

export function screenshotPath(screen) {
  const uc = screen.group === "Access" ? "UC07" : screen.group;
  return posix.join("prototypes", uc, screen.id + ".png");
}
