const fs = require("fs");

// Dependency injection keeps provider requests testable without sending candidate audio.
function createInterviewSpeech(openai) {
  return {
    async transcribe(file) {
      const response = await openai.audio.transcriptions.create({
        model: process.env.OPENAI_STT_MODEL || "gpt-transcribe",
        file: fs.createReadStream(file.filepath),
      });
      return response.text || "";
    },
    async speak(text) {
      const response = await openai.audio.speech.create({
        model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
        voice: process.env.OPENAI_TTS_VOICE || "coral",
        input: text,
        response_format: "mp3",
      });
      return Buffer.from(await response.arrayBuffer());
    },
  };
}
module.exports = { createInterviewSpeech };
