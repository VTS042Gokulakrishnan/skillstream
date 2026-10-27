import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import axios from "axios";
import CandidatePage from "./AgencyLandingPage";
jest.mock("../../App", () => ({ Server: "https://api.example.test" }));
jest.mock("axios", () => ({ get: jest.fn(), post: jest.fn() }));
function Location() { const location = useLocation(); return <output data-testid="route">{JSON.stringify({pathname:location.pathname,state:location.state})}</output>; }
function mount() { return render(<MemoryRouter><CandidatePage /><Location /></MemoryRouter>); }
beforeEach(() => { localStorage.clear(); jest.clearAllMocks(); });
afterEach(cleanup);
test("landing search passes the existing keyword and city navigation contract", () => {
  mount();
  fireEvent.change(screen.getByLabelText("Job title or keywords"), {target:{value:" React developer "}});
  fireEvent.change(screen.getByLabelText("City"), {target:{value:" Dallas "}});
  fireEvent.submit(screen.getByRole("form", {name:"Search jobs"}));
  expect(JSON.parse(screen.getByTestId("route").textContent)).toEqual({pathname:"/find-jobs",state:{job:"React developer",City:"Dallas",country:"United States"}});
});
test("advanced filters preserve state and industry and clear a stale city", async () => {
  axios.get.mockImplementation(url => Promise.resolve({data:url.includes("states") ? {states:["Texas"]} : url.includes("industries") ? {industries:["Software"]} : {cities:["Plano"]}}));
  mount(); fireEvent.click(screen.getByText("More filters +"));
  await screen.findByRole("option", {name:"Texas"});
  fireEvent.change(screen.getByLabelText("City"), {target:{value:"Old city"}});
  fireEvent.change(screen.getByLabelText("State"), {target:{value:"Texas"}});
  expect(screen.getByLabelText("City").value).toBe("");
  fireEvent.change(screen.getByLabelText("Industry"), {target:{value:"Software"}});
  fireEvent.submit(screen.getByRole("form", {name:"Search jobs"}));
  expect(JSON.parse(screen.getByTestId("route").textContent).state).toEqual({State:"Texas",Industry:"Software",country:"United States"});
});
test("landing restores footer resources and removes contact form", () => {
  mount();
  expect(screen.queryByRole("form", {name:"Contact support"})).toBeNull();
  expect(screen.getByText("info@skillstreamjobs.us")).toBeTruthy();
  expect(screen.getByText(/1827 Walden/)).toBeTruthy();
  expect(screen.getByRole("link", {name:"Security Center"}).getAttribute("href")).toBe("/securityCenter");
  expect(screen.getByRole("img", {name:"Professional working at her desk"})).toBeTruthy();
});
test.each([["Candidate","/candidate-dashboard"],["Employer","/employer-dashboard"],["Vendor","/vendor/dashboard"]])("signed-in %s keeps the existing redirect", async (role,path) => {
  localStorage.setItem("token","test"); localStorage.setItem("Role",role);
  mount();
  await waitFor(() => expect(JSON.parse(screen.getByTestId("route").textContent).pathname).toBe(path));
});
