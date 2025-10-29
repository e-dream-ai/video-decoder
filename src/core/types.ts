export interface VideoPlayerProps {
  src: string;
  width?: number;
  height?: number;
  decodeFps?: number;
  onFrameDecoded?: (frame: VideoFrame) => void;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
}

export interface DecoderState {
  isInitialized: boolean;
  isDecoding: boolean;
  frameCount: number;
}
