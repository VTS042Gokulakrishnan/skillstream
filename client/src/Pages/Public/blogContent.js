import React from "react";
// Render a small semantic HTML allowlist as React nodes, never execute stored HTML.
export function plainText(value = "") {
  const doc = new DOMParser().parseFromString(String(value), "text/html");
  doc.querySelectorAll("script,style,iframe,object").forEach((n) => n.remove());
  return doc.body.textContent || "";
}
export function safeImage(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value)
    ? value
    : undefined;
}
export function ArticleContent({ content = "" }) {
  const doc = new DOMParser().parseFromString(content, "text/html");
  const allowed = new Set([
    "P",
    "BR",
    "STRONG",
    "B",
    "EM",
    "I",
    "UL",
    "OL",
    "LI",
    "H2",
    "H3",
    "H4",
    "BLOCKQUOTE",
    "PRE",
    "CODE",
    "A",
  ]);
  const blocked = new Set([
    "SCRIPT",
    "STYLE",
    "IFRAME",
    "OBJECT",
    "EMBED",
    "FORM",
    "SVG",
    "MATH",
  ]);
  function render(node, key) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1 || blocked.has(node.tagName)) return null;
    const children = Array.from(node.childNodes).map((n, i) =>
      render(n, key + "-" + i)
    );
    if (!allowed.has(node.tagName))
      return <React.Fragment key={key}>{children}</React.Fragment>;
    if (node.tagName === "BR") return <br key={key} />;
    const props = { key };
    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      if (/^(https?:\/\/|mailto:)/i.test(href)) {
        props.href = href;
        props.rel = "noopener noreferrer";
        props.target = "_blank";
      }
    }
    return React.createElement(node.tagName.toLowerCase(), props, ...children);
  }
  return (
    <div className="ss-article-text">
      {Array.from(doc.body.childNodes).map((n, i) => render(n, String(i)))}
    </div>
  );
}
