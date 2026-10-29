// NODE_PATH may point to an isolated React/Babel test installation.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const React = require("react");
const { create, act } = require("react-test-renderer");
const babel = require("@babel/core");
const hookPath = path.resolve(__dirname, "../../client/src/Components/VideoAssessment/useInterviewSpeech.js");

function setup(blocked = false) {
  const requests = [], audio = [];
  const axios = { post: (...args) => new Promise((resolve, reject) => requests.push({ args, resolve, reject })) };
  class Audio {
    constructor(src) { this.src = src; this.blocked = blocked; audio.push(this); }
    async play() { if (this.blocked) throw new Error("autoplay blocked"); }
    pause() { this.paused = true; }
  }
  const module = { exports: {} };
  const code = babel.transformSync(fs.readFileSync(hookPath, "utf8"), {
    configFile: false, babelrc: false, plugins: [require("@babel/plugin-transform-modules-commonjs")],
  }).code;
  vm.runInNewContext(code, { module, exports: module.exports, require: (name) => name === "react" ? React : axios,
    Audio, AbortController, Blob, URL: { createObjectURL: () => "blob:test", revokeObjectURL() {} } });
  const hook = module.exports.default;
  let state, completions = 0, root;
  function Probe({ text }) { state = hook(text, "/tts", () => completions++); return null; }
  return { requests, audio, get state() { return state; }, get completions() { return completions; },
    async render(text) { await act(async () => { root ? root.update(React.createElement(Probe, { text })) : root = create(React.createElement(Probe, { text })); }); },
    async unmount() { await act(async () => root.unmount()); } };
}

test("question stays pending until speech arrives; answering starts once at audio end", async () => {
  const s = setup(); await s.render("Question one");
  assert.equal(s.state.ready, false);
  await act(async () => s.requests[0].resolve({ data: new Uint8Array([1]) }));
  assert.equal(s.state.ready, true); assert.equal(s.completions, 0);
  await act(async () => { s.audio[0].onended(); s.audio[0].onended(); });
  assert.equal(s.completions, 1); await s.unmount();
});

test("failed TTS allows reading and explicitly continuing", async () => {
  const s = setup(); await s.render("Question");
  await act(async () => s.requests[0].reject(new Error("timeout")));
  assert.equal(s.state.status, "error"); assert.equal(s.state.ready, true);
  assert.equal(s.completions, 0);
  await act(async () => s.state.continueWithoutAudio());
  assert.equal(s.completions, 1); await s.unmount();
});

test("stale responses and audio events cannot restart a previous question", async () => {
  const s = setup(); await s.render("Old question"); await s.render("New question");
  assert.equal(s.requests[0].args[2].signal.aborted, true);
  await act(async () => s.requests[0].resolve({ data: new Uint8Array([1]) }));
  assert.equal(s.audio.length, 0);
  await act(async () => s.requests[1].resolve({ data: new Uint8Array([1]) }));
  await s.render("");
  await act(async () => s.audio[0].onended());
  assert.equal(s.completions, 0); assert.equal(s.audio[0].paused, true); await s.unmount();
});

test("blocked autoplay can be started by the explicit play control", async () => {
  const s = setup(true); await s.render("Question");
  await act(async () => s.requests[0].resolve({ data: new Uint8Array([1]) }));
  assert.equal(s.state.status, "blocked"); assert.equal(s.completions, 0);
  s.audio[0].blocked = false;
  await act(async () => s.state.retry());
  assert.equal(s.state.status, "ready"); assert.equal(s.requests.length, 1);
  await s.unmount();
});

test("completion screen renders the returned closing message", async () => {
  const filename = path.resolve(__dirname, "../../client/src/Components/VideoAssessment/AssessmentState.js");
  const code = babel.transformSync(fs.readFileSync(filename, "utf8"), { configFile: false, babelrc: false,
    plugins: [require("@babel/plugin-transform-react-jsx"), require("@babel/plugin-transform-modules-commonjs")] }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports,
    require: (name) => name === "react" ? React : { CheckCircle2: "span", Clock3: "span", Wrench: "span" } });
  let root;
  await act(async () => { root = create(React.createElement(module.exports.default, { message: "Thanks for your thoughtful answers.", processing: true })); });
  assert.match(JSON.stringify(root.toJSON()), /Thanks for your thoughtful answers/);
  assert.match(JSON.stringify(root.toJSON()), /processing in the background/);
  await act(async () => root.unmount());
});

test("main completion waits for confirmation and retry preserves the original payload", async () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../../client/src/Components/VideoAssessment/VideoAssessment.js"), "utf8");
  const body = source.slice(source.indexOf("  const closeFeedbackModal = async ("), source.indexOf("  const stopSpeaking = () =>"));
  const state = {}, requests = [];
  const context = { Blob, File, FormData, JSON, Error, Server: "https://test.invalid", params: {},
    resumeText: "", jobDescriptionText: "", allQuestions: ["Q1"], allAnswers: ["A1"],
    chunks: { current: ["video"] }, retrySubmission: {}, submissionPayload: {},
    candidateEmail: "", candidateName: "", companyName: "", jobTitle: "", interviewerEmail: "",
    screenStream: null, micStream: null, SpeechStream: null, webcamRef: {},
    generatePDF: () => ({ output: () => new Blob(["pdf"]) }),
    toast: { success() {}, error() {} }, localStorage: { removeItem() {} },
    axios: { post: (...args) => new Promise((resolve, reject) => requests.push({ args, resolve, reject })) },
  };
  for (const name of ["Spinner", "SubmissionError", "ThankYouMessage", "ShowThankYouMessage", "InterviewCompleted", "IsRecording", "Speech"]) context[`set${name}`] = (value) => state[name] = value;
  vm.createContext(context); vm.runInContext(body + "\nthis.submit = closeFeedbackModal;", context);
  const first = context.submit("Q2", "A2", { closingMessage: "Thank you, candidate." });
  assert.equal(state.ShowThankYouMessage, undefined);
  requests[0].reject(new Error("network")); await first;
  assert.equal(state.SubmissionError, true); assert.equal(state.ShowThankYouMessage, undefined);
  context.allQuestions.push("Q2"); context.allAnswers.push("A2");
  const retry = context.submit(...context.retrySubmission.current);
  assert.equal(requests[0].args[1], requests[1].args[1]);
  assert.equal(requests[1].args[1].get("question"), '["Q1","Q2"]');
  requests[1].resolve({ data: { status: true } }); await retry;
  assert.equal(state.ShowThankYouMessage, true);
  assert.equal(state.ThankYouMessage, "Thank you, candidate.");
  assert.equal(state.Spinner, false);
});
