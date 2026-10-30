/* eslint-env jest */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import EmployerAvatar, { initialsFor } from "./EmployerAvatar";
import EmployerAccess from "./EmployerAccess";
jest.mock("axios", () => ({ get: jest.fn(), interceptors: { request: { use: jest.fn() } } }));

beforeEach(() => { localStorage.clear(); axios.get.mockReset(); localStorage.setItem("Role", "Employer"); localStorage.setItem("token", "test-token"); localStorage.setItem("ProfileCompleted", "true"); });
function Guarded() {
  return <MemoryRouter initialEntries={["/manage-jobs"]}><EmployerAccess><Routes><Route path="/manage-jobs" element={<h1>Private jobs</h1>} /><Route path="/update-profile/:token" element={<h1>Initial setup</h1>} /></Routes></EmployerAccess></MemoryRouter>;
}
test("name initials use first and last name and handle missing names", () => {
  expect(initialsFor("Rahul", "Sharma")).toBe("RS");
  expect(initialsFor(" Neha  Rani Patel ")).toBe("NP");
  expect(initialsFor("Aisha")).toBe("A");
  expect(initialsFor("")).toBe("?");
});
test("broken photos fall back to initials and a changed photo can load", () => {
  const { rerender } = render(<EmployerAvatar src="/broken.png" name="Rahul Sharma" />);
  fireEvent.error(screen.getByRole("img"));
  expect(screen.getByText("RS")).toBeTruthy();
  rerender(<EmployerAvatar src="/new.png" name="Rahul Sharma" />);
  expect(screen.getByRole("img").getAttribute("src")).toBe("/new.png");
});
test("an incomplete server profile redirects even when local storage says complete", async () => {
  axios.get.mockResolvedValue({ data: { profileCompleted: false } });
  render(<Guarded />);
  expect(screen.queryByText("Private jobs")).toBeNull();
  await screen.findByText("Initial setup");
  expect(screen.queryByText("Private jobs")).toBeNull();
});
test("protected content waits for the server and opens after confirmation", async () => {
  let resolve;
  axios.get.mockReturnValue(new Promise(r => { resolve = r; }));
  render(<Guarded />);
  expect(screen.queryByText("Private jobs")).toBeNull();
  resolve({ data: { profileCompleted: true } });
  await screen.findByText("Private jobs");
});
test("failed verification stays closed and can be retried", async () => {
  axios.get.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ data: { profileCompleted: true } });
  render(<Guarded />);
  await screen.findByText("Unable to verify your profile");
  expect(screen.queryByText("Private jobs")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText("Private jobs");
  await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
});
import EmployerApplicantTable from "./EmployerApplicantTable";

beforeAll(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches:false,addListener:()=>{},removeListener:()=>{},addEventListener:()=>{},removeEventListener:()=>{} }));
});
test("candidate search filters rows and preserves the original job and candidate for actions", async () => {
  const action = jest.fn();
  const person={name:"Aisha Khan",userId:"c1",skills:["React"],applicationStatus:"pending"};
  const job={jobId:"j1",JobTitle:"Frontend Developer",applicants:[person,{name:"Rahul Sharma",userId:"c2",skills:["Python"]}]};
  render(<EmployerApplicantTable jobs={[job]} mode="applicants" renderDetails={(candidate, sourceJob)=><button onClick={()=>action(candidate,sourceJob)}>Original approve action</button>}/>);
  fireEvent.change(screen.getByPlaceholderText("Search name, skills, or keywords…"),{target:{value:"React"}});
  expect(screen.queryByText("Rahul Sharma")).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:"View applicant"}));
  fireEvent.click(await screen.findByText("Original approve action"));
  expect(action).toHaveBeenCalledWith(person,job);
});

test("newest applications appear first across jobs", () => {
  const jobs=[{jobId:"older",JobTitle:"Old role",applicants:[{id:"1",name:"Older applicant",appliedTime:"2026-10-01"}]},{jobId:"newer",JobTitle:"New role",applicants:[{id:"2",name:"Newest applicant",appliedTime:"2026-10-29"}]}];
  render(<EmployerApplicantTable jobs={jobs} mode="applicants" renderDetails={()=>null}/>);
  const rows=screen.getAllByRole("row");
  expect(rows.findIndex(row=>row.textContent.includes("Newest applicant"))).toBeLessThan(rows.findIndex(row=>row.textContent.includes("Older applicant")));
});
test("interview details open in a drawer with both round labels", async () => {
  render(<EmployerApplicantTable mode="interviews" jobs={[{jobId:"job",applicants:[{id:"person",name:"Dual round candidate",interviewStatus:"Completed",CodingInterviewStatus:"Sent"}]}]} renderDetails={()=> <div>Round details fixture</div>}/>);
  expect(screen.getByText("Video + Coding")).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:"View interview"}));
  expect(await screen.findByText("Round details fixture")).toBeTruthy();
  expect(screen.getByText("Interview details")).toBeTruthy();
});
