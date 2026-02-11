import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST ?? "127.0.0.1";

// Some WASM builds (especially with threads) require cross-origin isolation.
// Keep enabled by default; if it breaks your embedding setup, set COI=0.
const enableCOI = (process.env.COI ?? "1") !== "0";
if (enableCOI) {
  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });
}

const publicDir = path.join(__dirname, "public");

app.use(
  express.static(publicDir, {
    // Ensure correct content-type for .wasm in environments that miss it
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".wasm")) {
        res.setHeader("Content-Type", "application/wasm");
      }
    },
  })
);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Serving static files from: ${publicDir}`);
  console.log(`COI headers: ${enableCOI ? "enabled" : "disabled"}`);
});
