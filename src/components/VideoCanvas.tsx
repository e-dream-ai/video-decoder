import { useRef, useEffect } from "react";
import { WebGLRenderer } from "../core/webgl-renderer";

interface VideoCanvasProps {
  width: number;
  height: number;
  onCanvasReady?: (renderer: WebGLRenderer) => void;
}

export function VideoCanvas({
  width,
  height,
  onCanvasReady,
}: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const renderer = new WebGLRenderer(canvas);
      if (onCanvasReady) {
        onCanvasReady(renderer);
      }
    } catch (error) {
      console.error("Failed to initialize WebGL:", error);
    }
  }, [onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: "block", background: "#000" }}
    />
  );
}
