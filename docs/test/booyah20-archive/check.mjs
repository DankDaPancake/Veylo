// Run the existing prototype verifier/exporter with the available sandboxed Chrome.
import { chromium } from "../../analysis-and-design/use-cases/prototypes/order-intake/node_modules/playwright/index.mjs";
const launch = chromium.launch.bind(chromium);
chromium.launch = (options = {}) => launch({ ...options, executablePath: "/usr/bin/google-chrome", chromiumSandbox: true });
await import(process.argv[2] === "--pdf"
  ? "../../analysis-and-design/use-cases/prototypes/order-intake/export.mjs"
  : "../../analysis-and-design/use-cases/prototypes/order-intake/verify.mjs");
