import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import axios from "axios";
import Login from "./Login";

jest.mock("../../App", () => ({ Server: "https://api.example.test" }));
jest.mock("axios", () => ({ post: jest.fn() }));
// Modal focus/keyboard behavior is covered by the browser checks; these tests
// exercise the auth requests and transitions independently of Ant Design.
jest.mock("antd", () => ({ Modal: ({ open, title, children }) => open ? <div role="dialog">{title}{children}</div> : null }));
jest.mock("./Googlelogin", () => () => null);
jest.mock("./MicrosoftLogin", () => () => null);
jest.mock("react-google-recaptcha", () => {
  const React = require("react");
  return React.forwardRef(({ onChange, onExpired }, ref) => {
    React.useImperativeHandle(ref, () => ({ reset: jest.fn() }));
    return <><button type="button" onClick={() => onChange("test-captcha")}>Complete security check</button><button type="button" onClick={onExpired}>Expire security check</button></>;
  });
});

function Location() { const location = useLocation(); return <output data-testid="destination">{location.pathname + location.search}</output>; }
const mount = (path, props = {}) => render(<MemoryRouter initialEntries={[path]}><Login setIsModalOpen={jest.fn()} setModalType={jest.fn()} {...props} /><Location /></MemoryRouter>);
const credentials = () => { fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.test" } }); fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ExamplePass123" } }); };

beforeAll(() => {
  window.matchMedia = () => ({ matches:false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
});
beforeEach(() => { localStorage.clear(); jest.clearAllMocks(); });

test.each([
  ["/employers", { isVendor:true }, "Vendor", "/vendor/dashboard"],
  ["/employers", {}, "Employer", "/employer-dashboard"],
  ["/find-jobs?job=Engineer", {}, "Candidate", "/find-jobs?job=Engineer"],
])("sign-in from %s retains the requested account role and destination", async (path, props, role, destination) => {
  axios.post.mockResolvedValue({ data:{ message:"Login Successfully", role, accessToken:"test-token", userId:"test-user", profileCompleted:true, isResumeUploaded:true, subscribed:true } });
  mount(path, props); credentials(); fireEvent.click(screen.getByText("Complete security check")); fireEvent.click(screen.getByRole("button", { name:"Sign in", exact:true }));
  await waitFor(() => expect(localStorage.getItem("Role")).toBe(role));
  await waitFor(() => expect(screen.getByTestId("destination").textContent).toBe(destination));
  expect(axios.post).toHaveBeenCalledWith("https://api.example.test/api/v1/auth/login", expect.objectContaining({ role, captcha:"test-captcha" }));
  expect(localStorage.getItem("Role")).toBe(role);
});

test("an expired captcha cannot submit credentials", () => {
  mount("/"); credentials(); fireEvent.click(screen.getByText("Complete security check")); fireEvent.click(screen.getByText("Expire security check")); fireEvent.click(screen.getByRole("button", { name:"Sign in", exact:true }));
  expect(axios.post).not.toHaveBeenCalled(); expect(screen.getByRole("alert").textContent).toMatch(/security check/);
});

test("failed authentication leaves the modal usable without creating a session", async () => {
  axios.post.mockRejectedValue({ response:{ data:{ message:"Invalid credentials" } } });
  mount("/employers", { isVendor:true }); credentials(); fireEvent.click(screen.getByText("Complete security check")); fireEvent.click(screen.getByRole("button", { name:"Sign in", exact:true }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Invalid credentials"));
  expect(localStorage.getItem("token")).toBeNull(); expect(screen.getByRole("button", { name:"Sign in", exact:true }).disabled).toBe(false);
});

test("unverified vendor can resend confirmation without switching role", async () => {
  axios.post.mockResolvedValueOnce({ data:{ message:"Email Verification Pending", userId:"vendor-id" } }).mockResolvedValueOnce({ data:{} });
  mount("/employers", { isVendor:true }); credentials(); fireEvent.click(screen.getByText("Complete security check")); fireEvent.click(screen.getByRole("button", { name:"Sign in", exact:true }));
  fireEvent.click(await screen.findByRole("button", { name:"Resend verification email" }));
  await waitFor(() => expect(axios.post).toHaveBeenLastCalledWith("https://api.example.test/api/v1/auth/register/confirmation/resend", { userId:"vendor-id", role:"Vendor", region:"United States" }));
  await screen.findByText(/Verification email sent/);
});
