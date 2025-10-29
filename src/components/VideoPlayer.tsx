import { useState, useCallback, useRef, useEffect } from "react";
import { VideoCanvas } from "./VideoCanvas";
import { VideoDecoderEngine } from "../core/decoder";
import { WebGLRenderer } from "../core/webgl-renderer";
import type { VideoPlayerProps, VideoMetadata } from "../core/types";

export function VideoPlayer({
  src,
  width = 640,
  height = 360,
  decodeFps = 30,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [frameCount, setFrameCount] = useState(0);

  const decoderRef = useRef<VideoDecoderEngine | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const frameQueueRef = useRef<VideoFrame[]>([]);
  const renderTimerRef = useRef<number | null>(null);

  const handleCanvasReady = useCallback((renderer: WebGLRenderer) => {
    rendererRef.current = renderer;
  }, []);

  const handleFrameDecoded = useCallback((frame: VideoFrame) => {
    frameQueueRef.current.push(frame);
  }, []);

  const handleMetadata = useCallback((meta: VideoMetadata) => {
    console.log("Video metadata:", meta);
    setMetadata(meta);
  }, []);

  const startRenderLoop = useCallback(() => {
    if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    if (!decodeFps || decodeFps <= 0) return;

    const frameInterval = 1000 / decodeFps;
    console.log(
      `Render interval: ${frameInterval.toFixed(2)} ms (${decodeFps} fps)`
    );

    renderTimerRef.current = window.setInterval(() => {
      const renderer = rendererRef.current;
      if (!renderer || !decoderRef.current) return;

      const queueTarget = 3;
      while (frameQueueRef.current.length < queueTarget) {
        if (!decoderRef.current.decodeNextFrame()) break;
      }

      const nextFrame = frameQueueRef.current.shift();
      if (nextFrame) {
        renderer.draw(nextFrame);
        nextFrame.close();
        setFrameCount((prev) => prev + 1);
      }
    }, frameInterval);
  }, [decodeFps]);

  useEffect(() => {
    if (isPlaying) startRenderLoop();
    else if (renderTimerRef.current) {
      clearInterval(renderTimerRef.current);
    }

    return () => {
      if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    };
  }, [isPlaying, startRenderLoop]);

  const loadAndPlay = async () => {
    setIsLoading(true);
    setError(null);
    setFrameCount(0);

    try {
      if (decoderRef.current) decoderRef.current.close();

      const decoder = new VideoDecoderEngine(
        handleFrameDecoded,
        handleMetadata
      );
      decoderRef.current = decoder;

      await decoder.loadVideo(src);

      setIsLoading(false);
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to load video:", err);
      setError(err instanceof Error ? err.message : "Failed to load video");
      setIsLoading(false);
    }
  };

  const pause = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (decoderRef.current) decoderRef.current.close();
      frameQueueRef.current.forEach((f) => f.close());
      frameQueueRef.current = [];
      if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    };
  }, []);

  return (
    <div style={{ display: "inline-block" }}>
      <VideoCanvas
        width={width}
        height={height}
        onCanvasReady={handleCanvasReady}
      />

      <div
        style={{
          marginTop: 10,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        {!isPlaying ? (
          <button onClick={loadAndPlay} disabled={isLoading}>
            {isLoading ? "Loading…" : "Load & Play"}
          </button>
        ) : (
          <button onClick={pause}>Pause</button>
        )}
        {metadata && (
          <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            {metadata.width}×{metadata.height} • {metadata.codec}
          </div>
        )}
        <div style={{ fontSize: "0.9rem", opacity: 0.6 }}>
          Decoded frames: {frameCount}
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginTop: 10, fontSize: "0.9rem" }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}
