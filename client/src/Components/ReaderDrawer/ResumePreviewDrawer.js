import React, { useEffect, useState } from "react";
import { Drawer, Button, Alert } from "antd";
import PDFHighlighter from "./PDFHighlighter";
import DocxHighlighter from "./DocxHighlighter";
import DocPreview from "./DocPreview";
import BrandLoader from "../Loader/BrandLoader";
import { DownloadOutlined } from "@ant-design/icons";

export default function ResumePreviewDrawer({ open, onClose, fileUrl, highlightArray = [] }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => { const resize = () => setWidth(window.innerWidth); window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize); }, []);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setFile(null); setError("");
    if (!fileUrl) { setLoading(false); setError("No resume is available for this candidate."); return; }
    setLoading(true);
    (async () => {
      try {
        const response = await fetch(fileUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load this resume. Please try again.");
        const blob = await response.blob();
        const url = new URL(fileUrl, window.location.href);
        let filename = decodeURIComponent(url.pathname.split("/").pop() || "resume");
        if (!/\.(pdf|docx|doc)$/i.test(filename)) {
          const extension = blob.type.includes("pdf") ? "pdf" : blob.type.includes("wordprocessingml") ? "docx" : blob.type.includes("msword") ? "doc" : "";
          if (extension) filename += "." + extension;
        }
        if (!controller.signal.aborted) setFile(new File([blob], filename, { type: blob.type }));
      } catch (err) { if (!controller.signal.aborted) setError("Unable to load this resume. Please try again or download the original file."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [open, fileUrl, retry]);
  const ext = file?.name.split(".").pop().toLowerCase();
  const download = () => {
    if (!file) return;
    const url = URL.createObjectURL(file), link = document.createElement("a");
    link.href = url; link.download = file.name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <Drawer title="Resume preview" extra={<Button icon={<DownloadOutlined />} disabled={!file} onClick={download}>Download</Button>} placement="right" width={width < 768 ? "100%" : width <= 1440 ? "80%" : "60%"} open={open} onClose={onClose} bodyStyle={{padding:0,background:"#f4f7fb"}} destroyOnClose>
    {loading ? <BrandLoader label="Loading resume…" /> : error ? <div style={{padding:24}}><Alert type="error" showIcon message={error} /><Button style={{marginTop:16}} onClick={() => setRetry(value => value + 1)}>Try again</Button>{fileUrl && <Button href={fileUrl} target="_blank" rel="noreferrer" style={{marginLeft:8}}>Download original</Button>}</div> : file && <div style={{overflow:"auto",padding:16}}>
      {ext === "pdf" && <PDFHighlighter file={file} keywords={highlightArray} />}
      {ext === "docx" && <DocxHighlighter file={file} keywords={highlightArray} />}
      {ext === "doc" && <DocPreview fileUrl={fileUrl} />}
      {!["pdf","docx","doc"].includes(ext) && <Alert type="info" message="Preview is unavailable for this file type. Use Download to view the original." />}
    </div>}
  </Drawer>;
}
