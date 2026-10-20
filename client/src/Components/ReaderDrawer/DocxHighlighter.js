import React, { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

export default function DocxHighlighter({ file, ext, keywords }) {
  const docRef = useRef();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!file) return;
    if (ext === "doc") {
      setError(true);
      return;
    }
    loadDocx();
  }, [file]);

  const loadDocx = async () => {
    try {
      setError(false);
      const arrayBuffer = await file.arrayBuffer();

      docRef.current.innerHTML = "";

      await renderAsync(arrayBuffer, docRef.current);

      highlightKeywords();
    } catch (err) {
      console.error("DOCX render error", err);
      setError(true);
    }
  };

  const highlightKeywords = () => {
    if (!keywords || keywords.length === 0) return;

    const walker = document.createTreeWalker(
      docRef.current,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue;
      if (!text) continue;

      let replaced = text;
      keywords.forEach((kw) => {
        if (!kw) return;
        const regex = new RegExp(`(${kw})`, "gi");
        replaced = replaced.replace(
          regex,
          `<mark style="background:yellow;">$1</mark>`
        );
      });

      if (replaced !== text) {
        const span = document.createElement("span");
        span.innerHTML = replaced;
        node.parentNode.replaceChild(span, node);
      }
    }
  };

  if (error || ext === "doc") {
    return (
      <div style={{ padding: 20 }}>
        <h3>⚠ Unable to preview .doc file</h3>
        <p>
          This file is in <b>.doc</b> format which cannot be previewed in
          browser.
        </p>
        <p>
          Please download or convert to <b>.docx</b>.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={docRef}
      style={{
        padding: 20,
        background: "white",
        borderRadius: 8,
        border: "1px solid #ddd",
        lineHeight: "1.6",
      }}
    />
  );
}

{
  /*import React, { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";

export default function DocxHighlighter({ file, keywords }) {
    const docRef = useRef();

    useEffect(() => {
        loadDocx();
    }, [file]);

    const loadDocx = async () => {
        const arrayBuffer = await file.arrayBuffer();

        // Clear old content
        docRef.current.innerHTML = "";

        // Render DOCX visually
        await renderAsync(arrayBuffer, docRef.current);

        // Now highlight the rendered output
        highlightKeywordsInDocx();
    };

    const highlightKeywordsInDocx = () => {
        let html = docRef.current.innerHTML;

        keywords.forEach((kw) => {
            if (!kw) return;
            const regex = new RegExp(`(${kw})`, "gi");
            html = html.replace(
                regex,
                `<mark style="background: yellow; padding: 2px;">$1</mark>`
            );
        });

        docRef.current.innerHTML = html;
    };

    return (
        <div
            ref={docRef}
            style={{
                padding: 20,
                background: "white",
                borderRadius: 8,
                border: "1px solid #ddd"
            }}
        />
    );
}
*/
}
