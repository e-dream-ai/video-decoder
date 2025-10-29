import * as MP4Box from "mp4box";
import type { MP4File, MP4Info, MP4ArrayBuffer } from "mp4box";

const DataStream = (MP4Box as any).DataStream;

export class VideoDecoderEngine {
  private decoder: globalThis.VideoDecoder | null = null;
  private mp4boxFile: MP4File | null = null;
  private onFrame: (frame: VideoFrame) => void;
  private onMetadata?: (metadata: any) => void;
  private currentSampleIndex = 0;
  private samples: any[] = [];

  constructor(
    onFrame: (frame: VideoFrame) => void,
    onMetadata?: (metadata: any) => void
  ) {
    this.onFrame = onFrame;
    this.onMetadata = onMetadata;
  }

  async loadVideo(url: string) {
    if (!("VideoDecoder" in window)) {
      throw new Error("WebCodecs not supported in this browser");
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const mp4Buffer = arrayBuffer as MP4ArrayBuffer;
    mp4Buffer.fileStart = 0;

    this.mp4boxFile = MP4Box.createFile();

    this.mp4boxFile.onReady = (info: MP4Info) => {
      console.log("MP4 info:", info);

      const videoTrack = info.videoTracks[0];
      if (!videoTrack) {
        throw new Error("No video track found");
      }

      const trackId = videoTrack.id;

      const description = this.extractDescription(trackId);

      const config: VideoDecoderConfig = {
        codec: videoTrack.codec.startsWith("vp08") ? "vp8" : videoTrack.codec,
        codedWidth: videoTrack.video.width,
        codedHeight: videoTrack.video.height,
      };

      if (description) {
        config.description = description;
        console.log("Description extracted:", description.length, "bytes");
      }

      this.initDecoder(config);

      if (this.onMetadata) {
        this.onMetadata({
          duration: info.duration / info.timescale,
          width: videoTrack.video.width,
          height: videoTrack.video.height,
          fps: videoTrack.nb_samples / (info.duration / info.timescale),
          codec: videoTrack.codec,
        });
      }

      this.mp4boxFile!.setExtractionOptions(trackId, undefined, {
        nbSamples: Infinity,
      });
      this.mp4boxFile!.start();
    };

    this.mp4boxFile.onSamples = (
      _trackId: number,
      _ref: string,
      samples: any[]
    ) => {
      this.samples.push(...samples);
    };

    this.mp4boxFile.appendBuffer(mp4Buffer);
    this.mp4boxFile.flush();
  }

  private extractDescription(trackId: number): Uint8Array | undefined {
    if (!this.mp4boxFile) return undefined;

    try {
      const track = this.mp4boxFile.getTrackById(trackId);
      if (!track) return undefined;

      const entries = track.mdia?.minf?.stbl?.stsd?.entries;
      if (!entries || entries.length === 0) return undefined;

      for (const entry of entries) {
        const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;

        if (box) {
          const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
          box.write(stream);

          return new Uint8Array(stream.buffer, 8);
        }
      }

      return undefined;
    } catch (error) {
      console.error("Failed to extract description:", error);
      return undefined;
    }
  }

  private initDecoder(config: VideoDecoderConfig) {
    this.decoder = new globalThis.VideoDecoder({
      output: (frame) => {
        this.onFrame(frame);
      },
      error: (error) => {
        console.error("VideoDecoder error:", error);
      },
    });

    this.decoder.configure(config);
    console.log("VideoDecoder configured:", config);
  }

  private decode(chunk: EncodedVideoChunk) {
    if (this.decoder && this.decoder.state === "configured") {
      this.decoder.decode(chunk);
    }
  }

  decodeNextFrame(): boolean {
    if (this.currentSampleIndex >= this.samples.length) {
      return false;
    }

    const sample = this.samples[this.currentSampleIndex];
    const chunk = new EncodedVideoChunk({
      type: sample.is_sync ? "key" : "delta",
      timestamp: (sample.cts * 1_000_000) / sample.timescale,
      duration: (sample.duration * 1_000_000) / sample.timescale,
      data: sample.data,
    });

    this.currentSampleIndex++;
    this.decode(chunk);
    return true;
  }

  reset() {
    this.currentSampleIndex = 0;
  }

  close() {
    if (this.decoder) {
      this.decoder.close();
      this.decoder = null;
    }
    if (this.mp4boxFile) {
      this.mp4boxFile.flush();
      this.mp4boxFile = null;
    }
  }
}
