declare module "mp4box" {
  export interface MP4ArrayBuffer extends ArrayBuffer {
    fileStart: number;
  }

  export interface MP4VideoTrack {
    id: number;
    codec: string;
    video: {
      width: number;
      height: number;
    };
    nb_samples: number;
  }

  export interface MP4Info {
    duration: number;
    timescale: number;
    videoTracks: MP4VideoTrack[];
    audioTracks: any[];
  }

  export interface MP4Sample {
    is_sync: boolean;
    cts: number;
    dts: number;
    duration: number;
    timescale: number;
    data: ArrayBuffer;
  }

  export interface MP4Track {
    mdia?: {
      minf?: {
        stbl?: {
          stsd?: {
            entries?: Array<{
              avcC?: any;
              hvcC?: any;
              vpcC?: any;
              av1C?: any;
            }>;
          };
        };
      };
    };
  }

  export interface MP4File {
    onReady?: (info: MP4Info) => void;
    onError?: (e: string) => void;
    onSamples?: (trackId: number, ref: string, samples: MP4Sample[]) => void;

    appendBuffer(data: MP4ArrayBuffer): number;
    start(): void;
    stop(): void;
    flush(): void;
    setExtractionOptions(
      trackId: number,
      user?: any,
      options?: { nbSamples: number }
    ): void;
    getTrackById(id: number): MP4Track | undefined;
  }

  export function createFile(): MP4File;

  export default {
    createFile,
  };
}
