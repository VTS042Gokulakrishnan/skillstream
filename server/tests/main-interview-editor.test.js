const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const React = require("react");
const { create, act } = require("react-test-renderer");
const babel = require("@babel/core");

const filename = path.resolve(__dirname, "../../client/src/Components/VideoAssessment/MainInterviewCodeEditor.js");
const code = babel.transformSync(fs.readFileSync(filename, "utf8"), {
  configFile: false, babelrc: false,
  plugins: [require("@babel/plugin-transform-react-jsx"), require("@babel/plugin-transform-modules-commonjs")],
}).code;
const moduleStub = { exports: {} };
function Editor(props) { return React.createElement("textarea", { value: props.value, onChange: props.onChange, "data-language": props.language }); }
vm.runInNewContext(code, { module: moduleStub, exports: moduleStub.exports,
  require: (name) => name === "react" ? React : name === "@monaco-editor/react" ? Editor : name.endsWith(".css") ? {} : { Code2: "svg", ChevronUp: "svg", ChevronDown: "svg" } });
const Component = moduleStub.exports.default;

test("full question first; shortening opens editor; toggling preserves code and language", async () => {
  let root, answer, enabled;
  const props = { question: "Find the maximum contiguous subarray sum.", setCodingAnswer: (value) => answer = value, setShowNextButton: (value) => enabled = value };
  await act(async () => { root = create(React.createElement(Component, props)); });
  assert.equal(root.root.findAllByType("textarea").length, 0);
  assert.equal(root.root.findByType("p").children[0], props.question);
  const toggle = () => root.root.findAllByType("button")[0];
  assert.equal(toggle().props["aria-expanded"], true);
  await act(async () => root.root.findAllByType("button")[1].props.onClick());
  assert.equal(toggle().props["aria-expanded"], false);
  await act(async () => root.root.findByType("textarea").props.onChange("return 6;"));
  assert.equal(answer, "return 6;"); assert.equal(enabled, true);
  await act(async () => root.root.findByType("select").props.onChange({ target: { value: "python" } }));
  await act(async () => toggle().props.onClick());
  assert.equal(root.root.findAllByType("textarea").length, 0);
  await act(async () => toggle().props.onClick());
  assert.equal(root.root.findByType("textarea").props.value, "return 6;");
  assert.equal(root.root.findByType("textarea").props["data-language"], "python");
  assert.equal(root.root.findAllByType("option").length, 4);
  await act(async () => root.root.findByType("textarea").props.onChange(""));
  assert.equal(answer, ""); assert.equal(enabled, false);
  await act(async () => root.unmount());
});

test("next coding question starts expanded with a fresh answer", async () => {
  let root;
  const props = { question: "First", setCodingAnswer() {}, setShowNextButton() {} };
  await act(async () => { root = create(React.createElement(Component, { ...props, key: 1 })); });
  await act(async () => root.root.findAllByType("button")[1].props.onClick());
  await act(async () => root.update(React.createElement(Component, { ...props, question: "Second", key: 2 })));
  assert.equal(root.root.findByType("p").children[0], "Second");
  assert.equal(root.root.findAllByType("textarea").length, 0);
  await act(async () => root.unmount());
});
