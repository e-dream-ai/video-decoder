import { VideoPlayer } from "../components/VideoPlayer";
import { useState } from "react";

const TEST_VIDEOS = [
  {
    name: "Test-2",
    url: "https://decoder.infinidream.ai/test-2.mp4",
  },
  {
    name: "Test-3",
    url: "https://decoder.infinidream.ai/test-3.mp4",
  },
  {
    name: "Test-4",
    url: "https://decoder.infinidream.ai/test-4.mp4",
  },
];

export function DemoApp() {
  const [selectedVideo, setSelectedVideo] = useState(TEST_VIDEOS[0].url);
  const [decodeFps, setDecodeFps] = useState(30);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1a1a",
        padding: "2rem",
        color: "white",
      }}
    >
      <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
        <label style={{ marginRight: "1rem" }}>Select video:</label>
        <select
          value={selectedVideo}
          onChange={(e) => setSelectedVideo(e.target.value)}
          style={{
            padding: "0.5rem",
            background: "#2a2a2a",
            color: "white",
            border: "1px solid #444",
            borderRadius: "4px",
          }}
        >
          {TEST_VIDEOS.map((video) => (
            <option key={video.url} value={video.url}>
              {video.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        <label htmlFor="decodeFpsInput" style={{ marginRight: "0.75rem" }}>
          Decoded FPS:
        </label>
        <input
          id="decodeFpsInput"
          type="number"
          value={decodeFps}
          min={1}
          max={240}
          step={1}
          onChange={(e) => setDecodeFps(Number(e.target.value))}
          style={{
            width: "80px",
            padding: "0.3rem",
            fontSize: "1rem",
            background: "#2a2a2a",
            color: "white",
            border: "1px solid #444",
            borderRadius: "4px",
            textAlign: "center",
          }}
        />
        <span style={{ marginLeft: "0.75rem", opacity: 0.7 }}>
          (default: 30 fps)
        </span>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <VideoPlayer
          key={`${selectedVideo}-${decodeFps}`}
          src={selectedVideo}
          width={640}
          height={360}
          decodeFps={decodeFps}
        />
      </div>
    </div>
  );
}
