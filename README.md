# Interactive Educational Script Viewer

This repository is a Vite, React, and TypeScript proof of concept for turning plain Markdown lesson
scripts into a camera-driven classroom presentation.

## What it does

- Parses standard Markdown with `marked`.
- Converts each top-level heading, paragraph, blockquote, list, and code block into an independent
  presentation step.
- Uses Framer Motion to pan and zoom a virtual camera across a larger lesson canvas.
- Highlights the active step and fades inactive steps for a distraction-free spotlight mode.
- Supports two navigation styles:
  - **Step mode**: move through every block in sequence.
  - **Page mode**: jump between major Markdown sections.
- Uses a responsive layout:
  - compact screens render a single vertical column;
  - wide screens render a two-page open-book spread.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL and use the keyboard:

- `ArrowRight` or `Space`: next step/page based on the selected mode
- `ArrowLeft`: previous step/page based on the selected mode
- `ArrowDown` / `ArrowUp`: next/previous step
- `PageDown` / `PageUp`: next/previous page
- `M`: toggle step/page mode

## Library surface

The package entry is `src/lib/index.ts` and exports:

- `Viewer`
- `parseMarkdownScript`
- TypeScript types for the parsed script, pages, steps, and navigation mode

The current implementation is React-specific, but the parser and presentation model are isolated so
the rendering layer can later be adapted for Web Components or other host frameworks.

## Future extension points

- KaTeX for LaTeX math blocks.
- Mermaid for fenced diagram blocks.
- Step-level metadata for explicit zoom presets, presenter notes, or LMS integration.