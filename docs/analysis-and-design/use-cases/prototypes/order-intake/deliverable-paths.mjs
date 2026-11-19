import { posix } from "node:path";

export function screenshotPath(screen, theme) {
  const uc = screen.group === "Access" ? "UC07" : screen.group;
  return posix.join("prototypes", uc, theme === "dark" ? "dark" : "", screen.id + ".png");
}
