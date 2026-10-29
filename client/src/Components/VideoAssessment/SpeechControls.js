import React from "react";

export default function SpeechControls({ playback, closing = false }) {
  if (!["error", "blocked"].includes(playback.status)) return null;
  return <div className="ss-info" role="status">
    <p>{playback.status === "blocked" ? "Select Play audio to hear the message." : "Audio could not be loaded. You can retry or continue reading."}</p>
    <button type="button" className="ss-button ss-button-outline" onClick={playback.retry}>
      {playback.status === "blocked" ? "Play audio" : "Retry audio"}
    </button>
    {!closing && <button type="button" className="ss-button ss-button-outline" onClick={playback.continueWithoutAudio}>Continue without audio</button>}
  </div>;
}
