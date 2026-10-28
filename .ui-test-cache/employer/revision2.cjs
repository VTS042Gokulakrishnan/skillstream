const fs=require('fs');const p='client/src/Components/ReaderDrawer/ResumePreviewDrawer.js';fs.writeFileSync(p,`import React, { useEffect, useState } from "react";
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
        if (!/\\.(pdf|docx|doc)$/i.test(filename)) {
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
`);
function edit(p,f){fs.writeFileSync(p,f(fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n')))}
for(const [path,title,desc,sections] of [
 ['client/src/Pages/Employers/Employers-Dashboard/Profile.js','Edit company profile','Help candidates get to know your company. Keep your details, links and location up to date.',['Company details','Social links','Contact & location']],
 ['client/src/Pages/Candidates/Candidates-Dashboard/Profile.js','Edit candidate profile','Tell employers about your skills and experience. Keep your profile and contact details up to date.',['Personal details','Education','Work experience','Social links','Contact & location']]
]) edit(path,s=>{
 s='import "Components/EmployerUI/ProfileEditor.css";\n'+s;
 s=s.replace('<section class="user-dashboard">','<section className="user-dashboard ss-profile-editor">');
 s=s.replace(/<h3>(Company Profile!|My Profile)<\/h3>/,`<h3>${title}</h3>`).replace('Ready to jump back in?',desc);
 let i=0;s=s.replace(/<h4>[^<]*<\/h4>/g,()=>`<h4><span className="ss-profile-section-number">${String(++i).padStart(2,'0')}</span>${sections[i-1]}</h4>`);
 return s;
});
edit('client/src/Components/Sidebar/CandidatesSidebar.js',s=>{
 s='import logo from "../../assets/logo-twos.png";\nimport "./CandidatesSidebar.css";\n'+s;
 s=s.replace('<aside className="user-sidebar"','<aside className="user-sidebar ss-candidate-sidebar"');
 s=s.replace('<div className="sidebar-inner">','<div className="sidebar-inner"><Link to="/candidate-dashboard" className="ss-candidate-brand"><img src={logo} alt="SkillStream" /><span>CANDIDATE WORKSPACE</span></Link>');
 return s;
});
edit('client/src/Pages/Public/EmployerLanding.js',s=>s.replace('<section className="em-hero">','<section className="em-hero em-hero-team">'));
