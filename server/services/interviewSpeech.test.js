const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createInterviewSpeech } = require("./interviewSpeech");

test("transcription passes an audio stream and returns only text", async () => {
  const service = createInterviewSpeech({ audio: { transcriptions: { create: async request => {
    assert.equal(request.model, process.env.OPENAI_STT_MODEL || "gpt-transcribe");
    assert.equal(request.file.path, __filename);
    request.file.destroy();
    return { text: "My answer", languages: [{ code: "en" }] };
  } } } });
  assert.equal(await service.transcribe({ filepath: __filename }), "My answer");
});
test("speech requests MP3 and returns binary audio", async () => {
  const service = createInterviewSpeech({ audio: { speech: { create: async request => {
    assert.equal(request.input, "Interview question");
    assert.equal(request.response_format, "mp3");
    assert.equal(request.voice, process.env.OPENAI_TTS_VOICE || "coral");
    return { arrayBuffer: async () => Uint8Array.from([73, 68, 51]).buffer };
  } } } });
  assert.deepEqual(await service.speak("Interview question"), Buffer.from("ID3"));
});
test("provider failures remain failures for retry handling", async () => {
  const error = new Error("provider unavailable");
  const service = createInterviewSpeech({ audio: { speech: { create: async () => { throw error; } } } });
  await assert.rejects(service.speak("Question"), error);
});
