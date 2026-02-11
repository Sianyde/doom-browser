# doom-browser-server

## What this is

A minimal Node.js + Express static server intended to host a browser DOOM build (typically a WebAssembly build) and its assets.

This repo currently provides:

- `server.js`: Express static file server
- `public/`: Place your browser build files here

## Run

1) Install dependencies

```bash
npm install
```

2) Start the server

```bash
npm run start
```

3) Open in your browser

- `http://127.0.0.1:3000/`
- Health endpoint: `http://127.0.0.1:3000/health`

## Adding a DOOM browser build

Copy your build output into `public/`. Typical files:

- `public/index.html`
- `public/*.js`
- `public/*.wasm`
- `public/DOOM.WAD` (or `doom1.wad`, depending on the port)

This server sets `Content-Type: application/wasm` for `.wasm` and enables cross-origin isolation headers by default (needed for some WASM builds with threads).

### Disabling cross-origin isolation headers

If you need to disable COI headers:

- PowerShell:

```powershell
$env:COI=0; npm run start
```

## Notes about WAD files

Commercial WADs are copyrighted. This repo ignores `*.wad` by default in `.gitignore`.
