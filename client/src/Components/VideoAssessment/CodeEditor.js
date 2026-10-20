import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // ✅ icons
const CodeEditor = ({
  setShowEditor,
  setCollapsedQuestion,
  question,
  showEditor,
  setShowNextButton,
  setCodingAnswer,
}) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here...");
  const [expanded, setExpanded] = useState(true); // ✅ expanded initially
  const handleCodeChange = (value) => {
    const updatedCode = value || "";
    setCode(updatedCode);
    setCodingAnswer(updatedCode);

    // ✅ Enable Next button only if there’s actual code
    if (updatedCode.trim().length > 0) {
      setShowNextButton(true);
    } else {
      setShowNextButton(false);
    }
  };
  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "auto",
        background: "linear-gradient(to left, #000000, #1e90ff)",
      }}
    >
      {/* Coding Question */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          background: "linear-gradient(to left, #000000, #1e90ff)",
        }}
      >
        {/*<h2 style={{ margin: "0 0 10px 0" }}>Coding Question</h2>*/}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <p style={{ color: "#fff", margin: 0 }}>
            {expanded ? "Question" : question.slice(0, 60) + "..."}
          </p>
          {expanded ? (
            <FaChevronDown color="white" />
          ) : (
            <FaChevronUp color="white" />
          )}
        </div>
        {expanded && (
          <div
            style={{
              marginTop: "10px",
              maxHeight: "200px",
              overflowY: "auto",
              color: "white",
            }}
          >
            <p style={{ color: "#fff" }}>{question}</p>
          </div>
        )}
      </div>
      {expanded && (
        <p style={{ marginTop: "10px", fontStyle: "italic", color: "#fff" }}>
          🔒 Close the expanded question (click the arrow above) to continue
          coding.
        </p>
      )}
      {!expanded && (
        <>
          {/* Language Selector */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold", marginRight: "10px" }}>
              Choose Language:
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "4px",
                background: "linear-gradient(to left, #000000, #1e90ff)",
                color: "white",
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          {/* Code Editor */}
          <div style={{ height: "350px", border: "1px solid #ddd" }}>
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code} // ✅ keeps old code
              onChange={handleCodeChange}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CodeEditor;
{
  /*  <div className="flex justify-center gap-4 mt-4">
        {showEditor ? (
          <button
            onClick={() => {
              setShowEditor(false);
              setCollapsedQuestion(false);
            }}
            className="px-5 py-2 bg-black-600 hover:bg-black-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            View Question
          </button>
        ) : (
          <button
            onClick={() => {
              setShowEditor(true);
              setCollapsedQuestion(true);
            }}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            ✍️ Continue Editing
          </button>
        )}
      </div>*/
}
