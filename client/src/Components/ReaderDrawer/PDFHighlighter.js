import React, { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFHighlighter({ file, keywords = [] }) {
  const [numPages, setNumPages] = useState(null);
  const pagesRef = useRef({});

  // Highlight function — ONLY modifies existing spans, no overlays
  const highlightText = (pageNumber) => {
    const container = pagesRef.current[pageNumber];
    if (!container) return;

    const spans = container.querySelectorAll(".react-pdf__Page__textContent span");

    keywords = keywords.map((k) => k.toLowerCase());

    spans.forEach((span) => {
      const text = span.textContent.toLowerCase();

      if (keywords.some((k) => text.includes(k))) {
        span.style.backgroundColor = "rgba(255,255,0,0.35)";
        span.style.borderRadius = "3px";
        span.style.mixBlendMode = "multiply";
      }
    });
  };

  const onPageRendered = (pageNumber) => {
    // delay to ensure TextLayer is ready
    setTimeout(() => highlightText(pageNumber), 40);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from({ length: numPages }, (_, i) => {
          const pageNumber = i + 1;
          return (
            <div
              key={pageNumber}
              ref={(el) => (pagesRef.current[pageNumber] = el)}
              style={{ position: "relative", marginBottom: 20 }}
            >
              <Page
                pageNumber={pageNumber}
                scale={1.4}
                renderAnnotationLayer={false}
                renderTextLayer={true}
                onRenderSuccess={() => onPageRendered(pageNumber)}
              />
            </div>
          );
        })}
      </Document>
    </div>
  );
}
