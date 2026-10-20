import React, { useEffect, useState } from "react";
import { Drawer, Spin, Button } from "antd";
import PDFHighlighter from "./PDFHighlighter";
import DocxHighlighter from "./DocxHighlighter";
import DocPreview from "./DocPreview";
import { DownloadOutlined } from "@ant-design/icons";
export default function ResumePreviewDrawer({
  open,
  onClose,
  fileUrl,
  highlightArray,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState("60%");

  useEffect(() => {
    if (!open || !fileUrl) return;

    setLoading(true);

    fetch(fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const filename = fileUrl.split("/").pop();
        setFile(new File([blob], filename));
        setLoading(false);
      });
  }, [open, fileUrl]);
  const updateWidth = () => {
    const width = window.innerWidth;

    if (width <= 1024) {
      setDrawerWidth("80%");
    } else if (width <= 1440) {
      setDrawerWidth("80%");
    } else {
      setDrawerWidth("60%");
    }
  };

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  const ext = file?.name?.split(".").pop().toLowerCase();
  const handleDownload = () => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;

    const extension = ext || "pdf";
    a.download = `resume.${extension}`;

    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Resume Viewer</span>

          {/* ⭐ Download Button */}
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>
      }
      placement="right"
      width={drawerWidth}
      open={open}
      onClose={onClose}
      bodyStyle={{ padding: 0 }}
    >
      {loading || !file ? (
        <div style={{ padding: 30, textAlign: "center" }}>
          <Spin />
        </div>
      ) : (
        <div style={{ height: "100vh", overflow: "auto" }}>
          {ext === "pdf" && (
            <PDFHighlighter file={file} keywords={highlightArray} />
          )}

          {ext === "docx" && (
            <DocxHighlighter file={file} keywords={highlightArray} />
          )}
          {ext === "doc" && <DocPreview fileUrl={fileUrl} />}
        </div>
      )}
    </Drawer>
  );
}

{
  /*import { Drawer, Button, Tag, Space, Spin } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import mammoth from "mammoth";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ResumePreviewDrawer = ({
  drawerVisible,
  handleCancel,
  selectedResume,
  keywords = [],
  resumeFileName = "resume",
}) => {
  const [fileType, setFileType] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchedSkills, setMatchedSkills] = useState([]);

  // Detect file type
  useEffect(() => {
    if (selectedResume) {
      const extension = selectedResume.split(".").pop().toLowerCase();
      setFileType(extension);
    }
  }, [selectedResume]);

  // DOCX / DOC text extraction + highlighting
  useEffect(() => {
    const loadDocx = async () => {
      try {
        setLoading(true);
        const response = await fetch(selectedResume);
        const arrayBuffer = await response.arrayBuffer();
        const { value } = await mammoth.convertToHtml({ arrayBuffer });

        // Highlight skills
        let highlightedHtml = value;
        let matched = [];
        keywords.forEach((kw) => {
          const regex = new RegExp(`(${kw})`, "gi");
          if (regex.test(value)) matched.push(kw);
          highlightedHtml = highlightedHtml.replace(
            regex,
            `<mark style="background-color: yellow;">$1</mark>`
          );
        });

        setMatchedSkills(matched);
        setHtmlContent(highlightedHtml);
      } catch (err) {
        console.error("DOCX Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (fileType === "docx" || fileType === "doc") loadDocx();
  }, [selectedResume, fileType, keywords]);

  // PDF handling
  const handlePdfLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const highlightText = (text) => {
    if (!keywords.length) return text;
    let result = text;
    let matched = [];
    keywords.forEach((kw) => {
      const regex = new RegExp(`(${kw})`, "gi");
      if (regex.test(text)) matched.push(kw);
      result = result.replace(
        regex,
        `<mark style="background-color: yellow;">$1</mark>`
      );
    });
    setMatchedSkills((prev) => Array.from(new Set([...prev, ...matched])));
    return result;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = selectedResume;
    link.download = resumeFileName;
    link.click();
  };

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Resume Preview</span>
          <Button
            icon={<DownloadOutlined />}
            type="primary"
            onClick={handleDownload}
            size="small"
          >
            Download
          </Button>
        </div>
      }
      placement="right"
      width={window.innerWidth > 1024 ? "60%" : "90%"}
      onClose={handleCancel}
      open={drawerVisible}
      bodyStyle={{ padding: 0, height: "100vh", overflow: "hidden" }}
      styles={{
        header: { borderBottom: "1px solid #f0f0f0" },
        body: { padding: 0, background: "#f9f9f9" },
      }}
    >

      <div
        style={{
          padding: "10px 16px",
          background: "#fff",
          borderBottom: "1px solid #eee",
        }}
      >
        <strong>Matched Skills ({matchedSkills.length}): </strong>
        <Space wrap>
          {matchedSkills.length > 0 ? (
            matchedSkills.map((skill) => (
              <Tag key={skill} color="green">
                {skill}
              </Tag>
            ))
          ) : (
            <Tag color="red">No matches found</Tag>
          )}
        </Space>
      </div>


      {loading && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Spin tip="Loading resume..." />
        </div>
      )}

     
      {!loading && (fileType === "docx" || fileType === "doc") && (
        <div
          style={{
            padding: 20,
            overflowY: "auto",
            height: "calc(100vh - 120px)",
            background: "#fff",
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}

  
      {!loading && fileType === "pdf" && (
        <div
          style={{
            overflowY: "scroll",
            height: "calc(100vh - 120px)",
            background: "#fff",
          }}
        >
          <Document
            file={{ url: selectedResume, withCredentials: false }}
            onLoadSuccess={handlePdfLoadSuccess}
            onLoadError={(err) => {
              console.error("PDF Load Error:", err);
              // Google Docs fallback
              setHtmlContent(
                `<iframe src="https://docs.google.com/gview?url=${selectedResume}&embedded=true" width='100%' height='100%'></iframe>`
              );
              setFileType("gview");
              setLoading(false);
            }}
            options={{
              cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
              cMapPacked: true,
              standardFontDataUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
            }}
            loading={<Spin tip="Loading PDF..." />}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                customTextRenderer={({ str }) => (
                  <span
                    dangerouslySetInnerHTML={{ __html: highlightText(str) }}
                  />
                )}
              />
            ))}
          </Document>
        </div>
      )}


      {!loading && fileType === "gview" && (
        <div
          style={{
            height: "calc(100vh - 120px)",
            background: "#fff",
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}
    </Drawer>
  );
};

export default ResumePreviewDrawer;*/
}
