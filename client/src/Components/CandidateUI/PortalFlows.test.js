import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { Modal } from "antd";
import moment from "moment";
import CandidateJobsTable from "./CandidateJobsTable";
import PortalTheme from "./PortalTheme";
import SetupForm from "../PracticalInterview/SetupForm";
import { PracticeResult } from "../PracticalInterview/PracticeStates";
import PracticeAssessment from "../../Pages/Candidates/Candidates-Dashboard/PracticeAssessment";
import practiceApi from "../PracticalInterview/practiceApi";

jest.mock("../../App", () => ({ Server: "https://api.example.test" }));
jest.mock("App", () => ({ Server: "https://api.example.test" }));
jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));
jest.mock("../PracticalInterview/practiceApi", () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));
jest.mock(
  "../PracticalInterview/PracticePlansModal",
  () =>
    ({ open }) =>
      open ? <div>Choose a practice plan</div> : null
);
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  toast: { success: jest.fn(), error: jest.fn() },
  Toaster: () => null,
}));
jest.mock("antd", () => ({
  Button: ({ children, onClick, disabled, loading, htmlType }) => (
    <button
      type={htmlType || "button"}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
    </button>
  ),
  Skeleton: () => <span>Loading</span>,
  Spin: () => <span>Loading</span>,
  Alert: ({ message }) => <div>{message}</div>,
  Upload: ({ children }) => <div data-testid="resume-upload">{children}</div>,
  Modal: { confirm: jest.fn() },
  message: { error: jest.fn() },
}));

const mount = (element, state) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/", state }]}>
      {element}
    </MemoryRouter>
  );
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("UserId", "candidate-1");
  localStorage.setItem("Role", "Candidate");
  window.scrollTo = jest.fn();
});
afterEach(cleanup);

test("applications paginate five at a time and date filtering resets the page", async () => {
  const jobs = Array.from({ length: 6 }, (_, i) => ({
    jobId: String(i),
    employerId: "employer",
    JobTitle: "Developer " + i,
    appliedTime: i === 5 ? "2001-01-01" : new Date().toISOString(),
  }));
  axios.get.mockResolvedValue({ data: { appliedJobs: { appliedJobs: jobs } } });
  mount(<CandidateJobsTable />);
  await screen.findByText("Developer 0");
  expect(screen.getAllByRole("link", { name: "View job" })).toHaveLength(5);
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getByText("Developer 5")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Filter by date"), {
    target: { value: "6" },
  });
  expect(screen.queryByText("Developer 5")).toBeNull();
  expect(screen.getByText("Page 1 of 1")).toBeTruthy();
});

test("alerts load the received-alert endpoint and show recoverable loading failures", async () => {
  axios.get
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ data: { jobAlerts: { jobAlerts: [] } } });
  mount(<CandidateJobsTable alerts />);
  await screen.findByRole("button", { name: "Try again" });
  expect(axios.get).toHaveBeenCalledWith(
    "https://api.example.test/api/v1/candidate/jobAlerts/get/candidate-1/Candidate"
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText("No alerts yet");
});

test("practice setup keeps the saved resume until Change is clicked", async () => {
  practiceApi.get.mockResolvedValue({ data: { access: { canVideo: true } } });
  axios.get.mockResolvedValue({
    data: {
      resume: "https://example.test/resume.pdf",
      appliedJobs: { appliedJobs: [] },
    },
  });
  mount(<SetupForm />, { round: "Video" });
  await screen.findByRole("link", { name: /Preview/ });
  expect(screen.queryByTestId("resume-upload")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Change resume" }));
  expect(screen.getByTestId("resume-upload")).toBeTruthy();
});

test("result screen only links to the report matching this session", async () => {
  practiceApi.get.mockResolvedValue({
    data: {
      practiceInterview: [
        { videoId: "other", video: "https://example.test/other" },
        {
          videoId: "current",
          video: "https://example.test/current",
          Date: "2026-10-24",
        },
      ],
    },
  });
  mount(
    <PracticeResult type="coding" sessionId="current" jobTitle="Developer" />
  );
  const link = await screen.findByRole("link", { name: "Open report ↗" });
  expect(link.getAttribute("href")).toBe("https://example.test/current");
});

test("missing reports show Check again rather than an unrelated report", async () => {
  practiceApi.get.mockResolvedValue({
    data: {
      practiceInterview: [
        { videoId: "other", video: "https://example.test/other" },
      ],
    },
  });
  mount(
    <PracticeResult type="video" sessionId="current" jobTitle="Developer" />
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Check again" }).disabled).toBe(
      false
    )
  );
  expect(screen.queryByRole("link", { name: "Open report ↗" })).toBeNull();
  expect(screen.getByRole("button", { name: "Check again" })).toBeTruthy();
});

test("unpaid practice opens the plans modal without showing an interview balance", async () => {
  practiceApi.get.mockImplementation((url) =>
    Promise.resolve({
      data:
        url === "/access"
          ? {
              access: { purchased: false, canVideo: false, canCoding: false },
              plans: [],
            }
          : { practiceInterview: [] },
    })
  );
  mount(<PracticeAssessment />);
  await screen.findByRole("button", { name: "Purchase video practice" });
  expect(screen.queryByText(/interviews remaining/)).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Purchase video practice" })
  );
  expect(screen.getByText("Choose a practice plan")).toBeTruthy();
});


test("saved jobs use their existing endpoint, dates, links and five-row pagination", async () => {
  axios.get.mockResolvedValue({ data: { shortlisted: Array.from({length: 6}, (_, i) => ({
    jobId: String(i), empId: "saved-employer", jobTitle: "Saved role " + i,
    companyName: "Example company",
    shortlistedTime: i === 5 ? "Jan 1st 2001" : moment().format("MMM Do YYYY"),
  })) } });
  mount(<CandidateJobsTable shortlisted />);
  await screen.findByText("Saved role 0");
  expect(axios.get).toHaveBeenCalledWith("https://api.example.test/api/v1/candidate/shortlistJob/view/candidate-1/Candidate");
  expect(screen.getAllByRole("link", {name: "View job"})).toHaveLength(5);
  expect(screen.getAllByRole("link", {name: "View job"})[0].getAttribute("href")).toBe("/job-detail/saved-employer/0");
  expect(screen.getByText("Saved on")).toBeTruthy();
  expect(screen.queryByText("Status")).toBeNull();
  fireEvent.click(screen.getByLabelText("Next page"));
  expect(screen.getByText("Saved role 5")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Filter by date"), {target: {value: "6"}});
  expect(screen.queryByText("Saved role 5")).toBeNull();
  expect(screen.getByText("Saved role 0")).toBeTruthy();
  expect(screen.getByText("Page 1 of 1")).toBeTruthy();
});

test("saved-job removal preserves rows on failure and uses the shortlist delete endpoint", async () => {
  axios.get.mockResolvedValue({data: {shortlisted: [{jobId: "job-1", empId: "emp-1", jobTitle: "Saved role"}]}});
  axios.delete.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({data: {}});
  mount(<CandidateJobsTable shortlisted />);
  await screen.findByText("Saved role");
  fireEvent.click(screen.getByLabelText("Remove Saved role"));
  await act(async () => { await Modal.confirm.mock.calls[0][0].onOk(); });
  expect(screen.getByText("Saved role")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Remove Saved role"));
  await act(async () => { await Modal.confirm.mock.calls[1][0].onOk(); });
  expect(axios.delete).toHaveBeenLastCalledWith("https://api.example.test/api/v1/candidate/shortlistJob/delete/candidate-1/job-1/Candidate");
  expect(screen.getByText("No saved jobs found")).toBeTruthy();
});


test.each([
  ["/shortlisted-jobs", true],
  ["/find-jobs", false],
  ["/", false],
  ["/job-detail/employer/job", false],
])("header theme is scoped correctly on %s and cleaned up", (pathname, workspace) => {
  const view = render(<MemoryRouter initialEntries={[pathname]}><PortalTheme /></MemoryRouter>);
  expect(document.body.classList.contains("ss-header")).toBe(true);
  expect(document.body.classList.contains("ss-workspace")).toBe(workspace);
  expect(document.body.classList.contains("ss-theme")).toBe(workspace);
  view.unmount();
  expect(document.body.classList.contains("ss-header")).toBe(false);
});
