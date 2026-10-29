import React, { useId, useState } from "react";
import Editor from "@monaco-editor/react";
import { Code2, ChevronDown, ChevronUp } from "lucide-react";
import "./MainInterviewCodeEditor.css";

// Main video interview only. Practice retains its existing editor.
export default function MainInterviewCodeEditor({ question, setCodingAnswer, setShowNextButton }) {
  const [expanded, setExpanded] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here...");
  const id = useId();
  const questionText = typeof question === "string" ? question : "";

  const changeCode = (value) => {
    const answer = value || "";
    setCode(answer);
    setCodingAnswer(answer);
    setShowNextButton(answer.trim().length > 0);
  };

  return <div className="ss-main-coding">
    <section className={`ss-main-coding-question ${expanded ? "is-expanded" : "is-collapsed"}`}>
      <button type="button" className="ss-main-coding-toggle"
        aria-expanded={expanded} aria-controls={`${id}-question`}
        onClick={() => setExpanded(!expanded)}>
        <span className="ss-main-coding-icon"><Code2 size={22} aria-hidden="true" /></span>
        <span className="ss-main-coding-title">{expanded ? "Coding question" : questionText}</span>
        <span className="ss-main-coding-view">{expanded ? "Close question to open editor" : "View full question"}</span>
        {expanded ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
      </button>
      <div id={`${id}-question`} hidden={!expanded} className="ss-main-coding-body">
        <p>{questionText}</p>
        <div className="ss-main-coding-question-action">
          <button type="button" onClick={() => setExpanded(false)}>
            <ChevronUp size={17} aria-hidden="true" /> Shorten question &amp; open editor
          </button>
        </div>
      </div>
    </section>
    {!expanded && <section className="ss-main-coding-workbench" aria-label="Code editor">
      <div className="ss-main-coding-toolbar">
        <strong>Your code</strong>
        <div className="ss-main-coding-language">
          <label htmlFor={`${id}-language`}>Language</label>
          <select id={`${id}-language`} value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      </div>
      <div className="ss-main-coding-surface">
        <Editor height="100%" language={language} theme="vs-dark" value={code}
          onChange={changeCode} options={{ fontSize: 14, minimap: { enabled: false },
            automaticLayout: true, scrollBeyondLastLine: false, padding: { top: 14, bottom: 14 },
            ariaLabel: "Coding answer", wordWrap: "on" }} />
      </div>
    </section>}
  </div>;
}
