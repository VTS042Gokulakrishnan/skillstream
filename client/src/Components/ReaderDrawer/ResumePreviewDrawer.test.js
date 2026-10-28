import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import ResumePreviewDrawer from "./ResumePreviewDrawer";
jest.mock("antd", () => ({ Drawer: ({open,children,extra}) => open ? <div>{extra}{children}</div> : null, Button: ({children,...props}) => <button {...props}>{children}</button>, Alert: ({message}) => <p>{message}</p> }));
jest.mock("@ant-design/icons", () => ({ DownloadOutlined: () => null }));
jest.mock("./PDFHighlighter", () => ({file}) => <p>PDF {file.name}</p>);
jest.mock("./DocxHighlighter", () => ({file}) => <p>DOCX {file.name}</p>);
jest.mock("./DocPreview", () => () => <p>Legacy document</p>);
beforeEach(() => { global.fetch = jest.fn(); });
test("signed DOCX URLs select the DOCX renderer", async () => {
  fetch.mockResolvedValue({ok:true,blob:async()=>new Blob(["docx"])});
  render(<ResumePreviewDrawer open fileUrl="https://example.test/resume.docx?signature=123" />);
  expect(await screen.findByText("DOCX resume.docx")).toBeTruthy();
});
test("failed requests can be retried", async () => {
  fetch.mockResolvedValueOnce({ok:false}).mockResolvedValueOnce({ok:true,blob:async()=>new Blob(["pdf"],{type:"application/pdf"})});
  render(<ResumePreviewDrawer open fileUrl="https://example.test/resume.pdf" />);
  fireEvent.click(await screen.findByText("Try again"));
  expect(await screen.findByText("PDF resume.pdf")).toBeTruthy();
});
test("closing or changing candidate cancels the old preview and ignores its late response", async () => {
  let finish;
  fetch.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve})).mockResolvedValueOnce({ok:true,blob:async()=>new Blob(["pdf"])});
  const {rerender}=render(<ResumePreviewDrawer open fileUrl="https://example.test/old.pdf" />);
  const signal=fetch.mock.calls[0][1].signal;
  rerender(<ResumePreviewDrawer open fileUrl="https://example.test/new.pdf" />);
  expect(signal.aborted).toBe(true);
  await screen.findByText("PDF new.pdf");
  await act(async()=>{finish({ok:true,blob:async()=>new Blob(["old"])});});
  await waitFor(()=>expect(screen.queryByText("PDF old.pdf")).toBeNull());
});
