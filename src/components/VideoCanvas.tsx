import { useRef, useEffect } from "react";

interface VideoCanvasProps {
  width: number;
  height: number;
  onCanvasReady?: (ctx: CanvasRenderingContext2D) => void;
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

    const ctx = canvas.getContext("2d");
    if (ctx && onCanvasReady) {
      onCanvasReady(ctx);
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
