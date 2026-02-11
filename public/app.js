const statusEl = document.getElementById("status");
const wadSelect = document.getElementById("wad");
const startBtn = document.getElementById("start");
const fullscreenBtn = document.getElementById("fullscreen");
const helpBtn = document.getElementById("help");
const toggleLogBtn = document.getElementById("toggleLog");
const helpPanel = document.getElementById("helpPanel");
const logPanel = document.getElementById("logPanel");
const logEl = document.getElementById("log");
const canvasEl = document.getElementById("canvas");

const params = new URLSearchParams(location.search);
const wadFromUrl = params.get("wad");
if (wadFromUrl) wadSelect.value = wadFromUrl;

function appendLog(line) {
  const safe = String(line ?? "");
  logEl.textContent += (logEl.textContent ? "\n" : "") + safe;
  logEl.scrollTop = logEl.scrollHeight;
}

function setStatus(text) {
  statusEl.textContent = text;
  appendLog(text);
}

function toggleHelp(force) {
  const shouldShow = typeof force === "boolean" ? force : helpPanel.classList.contains("hidden");
  helpPanel.classList.toggle("hidden", !shouldShow);
}

function toggleLog(force) {
  const shouldShow = typeof force === "boolean" ? force : logPanel.classList.contains("hidden");
  logPanel.classList.toggle("hidden", !shouldShow);
}

toggleHelp(true);
toggleLog(true);

function requestFullscreen() {
  if (!document.fullscreenElement && canvasEl.requestFullscreen) canvasEl.requestFullscreen();
}

canvasEl.addEventListener("click", () => {
  canvasEl.focus();
  if (canvasEl.requestPointerLock) canvasEl.requestPointerLock();
});

function loadEngine() {
  const wadName = wadSelect.value;

  setStatus(`Loading: ${wadName}`);
  startBtn.disabled = true;
  wadSelect.disabled = true;

  const commonArgs = ["-iwad", wadName, "-window", "-nogui", "-nomusic", "-config", "default.cfg"];

  window.Module = {
    onRuntimeInitialized: () => {
      setStatus("Starting game");
      window.callMain(commonArgs);
      startBtn.textContent = "Restart";
      startBtn.disabled = false;
    },
    noInitialRun: true,
    preRun: () => {
      Module.FS.createPreloadedFile("", wadName, `/wad/${wadName}`, true, true);
      Module.FS.writeFile("default.cfg", "");
    },
    printErr: function (text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(" ");
      console.error(text);
      appendLog(text);
    },
    canvas: (() => {
      const canvas = canvasEl;
      canvas.addEventListener(
        "webglcontextlost",
        (e) => {
          alert("WebGL context lost. You will need to reload the page.");
          e.preventDefault();
        },
        false
      );
      return canvas;
    })(),
    print: function (text) {
      console.log(text);
      appendLog(text);
    },
    setStatus: function (text) {
      if (text) setStatus(text);
    },
    totalDependencies: 0,
    monitorRunDependencies: function (left) {
      this.totalDependencies = Math.max(this.totalDependencies, left);
      Module.setStatus(left ? `Preparing... (${this.totalDependencies - left}/${this.totalDependencies})` : "All downloads complete.");
    },
  };

  window.onerror = function () {
    Module.setStatus("Exception thrown, see JavaScript console");
    Module.setStatus = function (text) {
      if (text) Module.printErr("[post-exception status] " + text);
    };
  };

  const existing = document.getElementById("doomEngine");
  if (existing) existing.remove();

  const s = document.createElement("script");
  s.id = "doomEngine";
  s.src = "/engine/websockets-doom.js";
  s.async = true;
  s.onerror = () => {
    startBtn.disabled = false;
    wadSelect.disabled = false;
    setStatus("Failed to load engine. Ensure /public/engine contains websockets-doom.js + .wasm (+ .data/.worker.js if produced). ");
  };
  document.body.appendChild(s);
}

startBtn.addEventListener("click", loadEngine);
fullscreenBtn.addEventListener("click", requestFullscreen);
helpBtn.addEventListener("click", () => toggleHelp());
toggleLogBtn.addEventListener("click", () => toggleLog());

window.addEventListener(
  "keydown",
  (e) => {
    if (e.repeat) return;

    if (e.code === "KeyF") {
      e.preventDefault();
      e.stopPropagation();
      requestFullscreen();
      return;
    }

    if (e.code === "KeyH") {
      e.preventDefault();
      e.stopPropagation();
      toggleHelp();
      return;
    }

    if (e.code === "KeyL") {
      e.preventDefault();
      e.stopPropagation();
      toggleLog();
    }
  },
  true
);
