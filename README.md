# System Shutdown

A lightweight Windows shutdown scheduler built with [Tauri v2](https://v2.tauri.app/) (Rust + vanilla HTML/CSS/JS).

Set a timer or pick a specific time to shut down your machine. ~8MB standalone executable, instant startup.

## Features

- **Timer-based shutdown** — set hours and minutes
- **Specific time shutdown** — pick an exact time (e.g. 11:30 PM)
- **Quick presets** — 15m, 30m, 1h, 2h
- **Live countdown** with animated ring
- **Cancel shutdown** instantly
- **Keyboard shortcuts** — Enter to start, Escape to cancel
- **Frameless dark UI** with rounded corners

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install) (via rustup)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the "Desktop development with C++" workload

## Development

```bash
# Install dependencies
npm install

# Run in dev mode
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

Output:
- `src-tauri/target/release/tauri-shutdown.exe` — standalone executable (~8MB)
- `src-tauri/target/release/bundle/nsis/` — NSIS installer (~2MB)

## Project Structure

```
├── src/                    # Frontend
│   ├── index.html          # UI markup
│   ├── styles.css          # All styles (dark theme, no dependencies)
│   └── main.js             # Timer logic, IPC calls to Rust backend
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── lib.rs          # Tauri commands (schedule_shutdown, cancel_shutdown)
│   │   └── main.rs         # Entry point
│   ├── capabilities/       # Tauri v2 permissions
│   ├── icons/              # App icons
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Window config, bundle settings
├── package.json
└── .gitignore
```

## How It Works

The frontend invokes two Tauri commands via IPC:

- `schedule_shutdown(seconds)` — runs `shutdown /s /t <seconds>` (async, non-blocking)
- `cancel_shutdown()` — runs `shutdown /a`

Both commands use `tokio::process::Command` so the UI never freezes.

## Acknowledgments

This project was developed with assistance from [Command Code](https://commandcode.ai), an AI-powered coding assistant.
