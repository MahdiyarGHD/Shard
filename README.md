# Shard

**Browser-based file splitter and joiner.** Fully client-side, secure, and efficient. Split large files into chunks and reassemble them without uploading anything to a server.

## Features

- **File Splitting** — Split any file into configurable-sized chunks (MB), download chunks individually or all at once.
- **File Joining** — Reassemble chunks back into the original file; chunks are automatically sorted by part number.
- **Password Protection** - You can set a password that will be required to reassemble files.
- **SHA-256 Checksum** — Verify the integrity of the joined file with a SHA-256 hash.
- **Drag-and-drop** — Drag files directly onto the drop zones.
- **Persian / English UI** — Full bilingual support with automatic RTL layout for Persian.
- **Dark Mode** — Minimalistic dark-mode aesthetic with Tailwind CSS.
- **No server** — Everything happens in the browser; no data is ever uploaded.

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vazirmatn](https://github.com/rastikerdar/vazirmatn) font (embedded, no CDN)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

The output is in the `dist/` directory — a static site you can deploy anywhere.
