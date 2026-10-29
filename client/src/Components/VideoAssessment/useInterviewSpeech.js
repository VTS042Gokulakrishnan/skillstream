import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

// Own playback outside the question panel so closing speech survives its unmount.
export default function useInterviewSpeech(text, endpoint, onFinished) {
  const [state, setState] = useState({ text: "", status: "idle" });
  const [attempt, setAttempt] = useState(0);
  const finished = useRef(onFinished);
  finished.current = onFinished;
  const current = useRef(null);
  const stop = useCallback(() => {
    const active = current.current;
    if (!active) return;
    active.cancelled = true;
    active.controller.abort();
    active.audio?.pause();
    if (active.audio) active.audio.src = "";
    if (active.url) URL.revokeObjectURL(active.url);
    current.current = null;
  }, []);

  useEffect(() => {
    stop();
    if (!text) return;
    const active = { controller: new AbortController(), cancelled: false, done: false };
    current.current = active;
    setState({ text, status: "loading" });
    const update = (status) => {
      if (!active.cancelled) setState({ text, status });
    };
    active.finish = () => {
      if (active.cancelled || active.done) return;
      active.done = true;
      update("finished");
      finished.current?.();
    };
    (async () => {
      try {
        const { data } = await axios.post(endpoint, { textInput: text }, {
          responseType: "arraybuffer", signal: active.controller.signal, timeout: 30000,
        });
        if (active.cancelled) return;
        active.url = URL.createObjectURL(new Blob([data], { type: "audio/mpeg" }));
        active.audio = new Audio(active.url);
        active.audio.onended = active.finish;
        active.audio.onerror = () => update("error");
        update("ready");
        try { await active.audio.play(); } catch { update("blocked"); }
      } catch {
        update("error");
      }
    })();
    return stop;
  }, [text, endpoint, attempt, stop]);

  const continueWithoutAudio = () => {
    const active = current.current;
    if (!active) return;
    active.audio?.pause();
    active.finish();
  };
  const retry = async () => {
    const active = current.current;
    if (state.status === "blocked" && active?.audio) {
      try {
        await active.audio.play();
        if (!active.cancelled) setState({ text, status: "ready" });
      } catch { /* Keep the explicit play/continue controls available. */ }
    } else setAttempt((value) => value + 1);
  };
  const status = state.text === text ? state.status : "loading";
  return { status, ready: ["ready", "finished", "blocked", "error"].includes(status),
    retry, continueWithoutAudio, stop };
}
