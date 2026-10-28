const fs=require('fs');const p='server/controller/resumeParser.js';let s=fs.readFileSync(p,'utf8');s=s.replace('const path = require("path");','const { createInterviewSpeech } = require("../services/interviewSpeech");\nconst interviewSpeech = createInterviewSpeech(openai);\nconst path = require("path");');s=s.replace(/const AUDIO_MODEL[^;]+;\s*const TTS_MODEL[^;]+;/,'');let a=s.indexOf('async speechToText(req, res) {'),b=s.indexOf('\n};\nmodule.exports',a);if(b<0)b=s.indexOf('\r\n};\r\nmodule.exports',a);s=s.slice(0,a)+`async speechToText(req, res) {
    let uploadedFile;
    try {
      const form = formidable({ multiples: false, keepExtensions: true, maxFileSize: 25 * 1024 * 1024 });
      const files = await new Promise((resolve, reject) => form.parse(req, (error, fields, files) => error ? reject(error) : resolve(files)));
      uploadedFile = getUploadedFile(files.file);
      if (!uploadedFile?.filepath) return res.status(400).json({ message: "No file uploaded", status: false });
      const text = await interviewSpeech.transcribe(uploadedFile);
      return res.status(200).json({ text, status: true });
    } catch (error) {
      console.error("OpenAI transcription failed:", error.status || error.code || "request_failed");
      return res.status(error.httpCode === 413 ? 413 : 502).json({ message: "Unable to transcribe audio. Please try again.", status: false });
    } finally {
      if (uploadedFile?.filepath) await fs.promises.unlink(uploadedFile.filepath).catch(() => {});
    }
  },
  async textToSpeech(req, res) {
    const text = req.body?.textInput;
    if (typeof text !== "string" || !text.trim()) return res.status(400).json({ message: "textInput is required", status: false });
    if (text.length > 4096) return res.status(400).json({ message: "textInput must not exceed 4096 characters", status: false });
    try {
      const audio = await interviewSpeech.speak(text.trim());
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).send(audio);
    } catch (error) {
      console.error("OpenAI speech generation failed:", error.status || error.code || "request_failed");
      return res.status(502).json({ message: "Unable to generate speech. Please try again.", status: false });
    }
  },`+s.slice(b);fs.writeFileSync(p,s);
