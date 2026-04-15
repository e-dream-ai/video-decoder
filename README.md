# video-decoder

An experimental web video player for [Infinidream](https://infinidream.ai), built to explore whether newer browser APIs can give us a better playback experience than the standard `<video>` element.

This repository is a **prototype**, not a production component. It exists to answer questions like: how smooth can seeking and looping be if we demux and decode frames ourselves? Can we composite multiple dreams on the same GPU surface? What does a custom player cost us in complexity?

## Approach

Instead of handing an MP4 URL to `<video>` and letting the browser handle everything, this player does the pipeline explicitly:

1. **Demux** the MP4 container in the browser with [mp4box.js](https://github.com/gpac/mp4box.js) to extract encoded video samples.
2. **Decode** those samples with the [WebCodecs](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) `VideoDecoder` — a relatively new API that exposes the browser's hardware decoder directly to JavaScript.
3. **Render** decoded `VideoFrame`s to a `<canvas>` via a WebGL renderer, which gives us control over color, compositing, and presentation timing.

Together this bypasses the opaque behavior of `<video>` and lets us own buffering, frame scheduling, and rendering.

## Stack

- React 19 + Vite + TypeScript
- mp4box.js for MP4 demuxing
- WebCodecs API for hardware-accelerated decoding
- WebGL for frame rendering

## Layout

```
src/
  core/
    decoder.ts         demux + WebCodecs pipeline
    webgl-renderer.ts  canvas/WebGL frame renderer
    types.ts
  components/
    VideoPlayer.tsx    player component
    VideoCanvas.tsx    canvas wrapper
  demo/
    DemoApp.tsx        demo harness
  main.tsx
```

## Development

```bash
pnpm install
pnpm run dev     # vite dev server
pnpm run build   # type-check and production build
pnpm run lint
```

## Status

Exploratory. Nothing here is wired into the Infinidream frontend. If the approach proves out, the useful pieces will likely move into the main `frontend` repo; if it doesn't, this repo documents what we tried and why.
