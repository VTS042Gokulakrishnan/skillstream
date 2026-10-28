import EmployerWorkspace from "./Components/EmployerUI/EmployerWorkspace";
import EmployerAccess from "./Components/EmployerUI/EmployerAccess";
import BrowseAccess from "./Components/PublicSite/BrowseAccess";
import { AboutPage, ContactPage, CommunityPage, EmployerLanding, PracticeLanding, PolicyPage } from "./Pages/Public/PublicPages";
import { CandidatePricing, EmployerPricing, PricingChooser } from "./Pages/Public/PublicPricing";
import { BlogPage, BlogArticle, BlogEditor } from "./Pages/Public/PublicBlog";
import ResumeBuilder from "./Pages/ResumeBuilder/ResumeBuilder";
import PurchaseReturn from "./Components/PublicSite/PurchaseReturn";
import { useState, useEffect, useRef } from "react";
import "./App.css";
import PortalTheme from "./Components/CandidateUI/PortalTheme";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "./assets/images/SS_Pulse_animation.json";
import $ from "jquery";
import GlobalStyles from "styles/GlobalStyles";
// // import { css } from "styled-components/macro";  //eslint-disable-line
// Components & pages
import Header from "./Components/Header/Header";
// import Header3 from "./Components/Header/Header3";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Auth/Login";
import Footer from "./Components/Footer/Footer";
import Footer1 from "./Components/Footer1/Footer1";
import Header1 from "./Components/Header/Header1";
import Register from "./Pages/Auth/Register";
import JobList from "./Pages/Find-Job/JobList";
import JobSingle from "./Pages/Find-Job/JobSingle";
import Dashboard from "./Pages/Employers/Employers-Dashboard/Dashboard";
import EmployersList from "./Pages/Employers/EmployersList";
import EmployersSingle from "./Pages/Employers/EmployersSingle";
import CandidatesList from "./Pages/Candidates/CandidatesList";
import CandidatesSingle from "./Pages/Candidates/CandidatesSingle";
import EmployerSidebar from "./Components/Sidebar/EmployerSidebar";
import CandidatesSidebar from "./Components/Sidebar/CandidatesSidebar";
import CandidateDashboard from "./Pages/Candidates/Candidates-Dashboard/Dashboard";
import VideoAssessment from "Components/VideoAssessment/VideoAssessment";
import DemoVideoAssessment from "./Components/DemoVideoAssessment/DemoVideoAssessment";
import AiFitmentAnalysis from "Components/AiFitmentAnalysis/AiFitmentAnalysis";
import AiJobSearch from "./Pages/Candidates/AiJobSearch";
import GlobalSearch from "Pages/Employers/Employers-Dashboard/GlobalSearch";
//Candidates Dashboard
import AppliedJobs from "./Pages/Candidates/Candidates-Dashboard/AppliedJobs";
import ChangePassword from "./Pages/Candidates/Candidates-Dashboard/ChangePassword";
import CVManager from "./Pages/Candidates/Candidates-Dashboard/CVManager";
import JobAlerts from "./Pages/Candidates/Candidates-Dashboard/JobAlerts";
import Messages from "./Pages/Candidates/Candidates-Dashboard/Messages";
import MyResume from "./Pages/Candidates/Candidates-Dashboard/MyResume";
import Packages from "./Pages/Candidates/Candidates-Dashboard/Packages";
import CandidatesProfile from "./Pages/Candidates/Candidates-Dashboard/Profile";
import ShortlistedJobs from "./Pages/Candidates/Candidates-Dashboard/ShortlistedJobs";
import ViewProfileCandidates from "./Pages/Candidates/Candidates-Dashboard/ViewProfile";
import ProfileViewCandiates from "./Pages/Candidates/Candidates-Dashboard/ProfileView";
import PracticeAssessment from "./Pages/Candidates/Candidates-Dashboard/PracticeAssessment";
// import img from "./assets/favicon1.png";

//Employers Dashboard
import Applicants from "./Pages/Employers/Employers-Dashboard/Applicants";
import ManageJobs from "./Pages/Employers/Employers-Dashboard/ManageJobs";
import PostJob from "./Pages/Employers/Employers-Dashboard/PostJob";
import CompanyProfile from "./Pages/Employers/Employers-Dashboard/Profile";
import ResumeAlerts from "./Pages/Employers/Employers-Dashboard/ResumesAlerts";
import ShortlistedResumes from "./Pages/Employers/Employers-Dashboard/Shortlisted";
import ViewEmployerSProfile from "./Pages/Employers/Employers-Dashboard/ViewProfile";
import EmployerPackages from "./Pages/Employers/Employers-Dashboard/Packages";
import EmployersMessages from "./Pages/Employers/Employers-Dashboard/Messages";
import EmployersChangePassword from "./Pages/Employers/Employers-Dashboard/ChangePassword";
import EmployerProfileView from "./Pages/Employers/Employers-Dashboard/EmployerProfileView";
import EditPostJob from "./Pages/Employers/Employers-Dashboard/EditPostJob";
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import 'jquery/dist/jquery.min.js';
import useScript from "./Hooks/useScript";
import { useNavigate } from "react-router-dom";
import Success from "./Components/Success/Success";
import { isTokenExpired } from "./utils/auth";
import HomeNew from "./Pages/HomeNew/AgencyLandingPage";
import HeaderEmp from "Components/Header/HeaderEmp";
import PricingSuccess from "Pages/Pricing/PricingSuccess";
import Cancel from "Pages/Pricing/Cancel";
import NewHomeBlack from "Pages/NewHomeBlack/NewHomeBlack";
import SavedResumes from "Pages/Employers/SavedResumes";
import AiResumeSearch from "Pages/Employers/AiResumeSearch";
import SetupForm from "./Components/PracticalInterview/SetupForm";
import PracticalAssessment from "Components/PracticalInterview/PracticalInterview";
import Demo from "./Components/VideoAssessment/DemoModal";
import NotFound from "Pages/NotFound";
import { ScrollProvider } from "./Components/ScrollContext"; // Import the provider
import FeedbackPage from "Components/VideoAssessment/FeedbackPage";
import Billing from "Pages/Employers/Employers-Dashboard/Billing";
import CodeEditor from "Components/VideoAssessment/CodeEditor";
import ProtectedRoute from "config/ProtectedRoute";
import UpdateProfile from "Pages/Employers/Employers-Dashboard/UpdateProfile";
import HeaderDemo from "Components/Header/HeaderDemo";
import Allusers from "Pages/superAdmin/Allusers";
import CreateUsers from "Pages/superAdmin/CreateUsers";
import logo from "./assets/images/loader.png";
import useAutoLogout from "utils/jwtToken";
import { Toaster } from "react-hot-toast";
import VendorAppliedJobs from "Pages/Vendors/AppliedJobs";
import ManageCandidates from "Pages/Vendors/ManageCandidates";
import UploadCandidates from "Pages/Vendors/UploadCandidates";
import VendorDashboard from "Pages/Vendors/Dashboard";
import VendorSidebar from "Components/Sidebar/VendorSidebar";
import VendorShortlisted from "Pages/Vendors/ShortlistJobs";
import VendorJobalert from "Pages/Vendors/JobAlerts";
import CodingRound from "Components/VideoAssessment/CodingRound";
import axios from "axios";
import CodingPractice from "Components/PracticalInterview/PracticeInterviewLanding/CodingPractice";
import InterviewedCandidates from "Pages/Employers/Employers-Dashboard/InterviewedCandidates";
import ReportsPage from "Pages/Employers/ReportsPage";
import EmailStatus from "Pages/EmailStatus/EmailStatus";
export const Server = process.env.REACT_APP_SERVER;
function App() {
  const [isLoading, setLoading] = useState(true);
  const [userType, setUserType] = useState(""); // "candidate" or "company"
  const scrollToPricing = useRef();
  // console.log(Server);
  // Function to set user type
  const setUser = (type) => {
    setUserType(type);
  };
  function fakeRequest() {
    return new Promise((resolve) => setTimeout(() => resolve(), 1000));
  }

  useEffect(() => {
    let token = localStorage.getItem("token");
    isTokenExpired(token);
  }, []);
  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) {
      // window.location.href = "/";
    }
  }, []);
  useEffect(() => {
    fakeRequest().then(() => {
      setLoading(false); // Set loading to false when loading is complete.
    });
  }, []);

  if (isLoading) {
    return (
      // <div class="logo-container">
      //   <img src={logo} alt="S Logo Loader" />
      //   <div class="loading-text">Loading...</div>
      // </div>
      <div className="logo-container">
        <img src={logo} alt="S Logo Loader" className="heartbeat w-24 h-24" />
        <div className="loading-text">Loading...</div>
      </div>

      //   <div className="w-full max-w-md mx-auto">
      //   <Lottie animationData={animationData} loop={true} />
      // </div>
    );
  }

  // if (isLoading) {
  //   return (
  //     <div className="preloader">
  //     </div>
  //   );
  // }
  const candidatesRoutes = [
    {
      path: "/applied-jobs",
      element: <AppliedJobs />,
    },
    {
      path: "/change-password",
      element: <ChangePassword />,
    },
    {
      path: "/cv-manager",
      element: <CVManager />,
    },
    {
      path: "/practiceInterview",
      element: <PracticeAssessment />,
    },
    {
      path: "/job-alerts",
      element: <JobAlerts />,
    },
    {
      path: "/messages",
      element: <Messages />,
    },
    {
      path: "/my-resume",
      element: <MyResume />,
    },
    {
      path: "/packages",
      element: <Packages />,
    },
    {
      path: "/my-profile",
      element: <CandidatesProfile />,
    },
    {
      path: "/shortlisted-jobs",
      element: <ShortlistedJobs />,
    },
    {
      path: "/candidates-view-profile",
      element: <ViewProfileCandidates />,
    },
    {
      path: "/candidates-profile-view",
      element: <ProfileViewCandiates />,
    },
  ];

  const EmployersRoutes = [
    {
      path: "/applicants",
      element: <Applicants />,
    },
    {
      path: "/employer-change-password",
      element: <EmployersChangePassword />,
    },
    {
      path: "/manage-jobs",
      element: <ManageJobs />,
    },
    {
      path: "/resume-alerts",
      element: <ResumeAlerts />,
    },
    {
      path: "/employer-messages",
      element: <EmployersMessages />,
    },
    {
      path: "/employer-billing",
      element: <Billing />,
    },
    {
      path: "/post-Job",
      element: <PostJob />,
    },
    {
      path: "/employer-packages",
      element: <EmployerPackages />,
    },
    {
      path: "/company-profile",
      element: <CompanyProfile />,
    },
    {
      path: "/shortlisted-resumes",
      element: <ShortlistedResumes />,
    },
    {
      path: "/interview-candidates",
      element: <InterviewedCandidates />,
    },
    {
      path: "/employer-view-profile",
      element: <ViewEmployerSProfile />,
    },
    {
      path: "/employer-profile-view",
      element: <EmployerProfileView />,
    },
    {
      path: "/edit-post/:userId/:jobId",
      element: <EditPostJob />,
    },
    {
      path: "/savedResume",
      element: <SavedResumes />,
    },
    {
      path: "/allusers",
      element: <Allusers />,
    },
    {
      path: "/create-user",
      element: <CreateUsers />,
    },
    // {
    //   path: "/reports",
    //   element: <ReportsPage />,
    // },
  ];

  const VendorRoutes = [
    {
      path: "/vendor/dashboard",
      element: <VendorDashboard />,
    },
    {
      path: "/vendor/appliedJobs",
      element: <VendorAppliedJobs />,
    },
    {
      path: "/vendor/manage/candidates",
      element: <ManageCandidates />,
    },
    {
      path: "/vendor/upload/candidates",
      element: <UploadCandidates />,
    },
    {
      path: "/vendor/shortlisted-jobs",
      element: <VendorShortlisted />,
    },
    {
      path: "/vendor/jobAlerts",
      element: <VendorJobalert />,
    },
  ];
  // Empty dependency array ensures the effect runs only once on mount
  let token = localStorage.getItem("token");

  function AppLayout() {
    useAutoLogout();
    return (
      <Routes>
        <Route element={<ProtectedRoute allowedRole="Candidate" />}><Route path="/create-resume" element={<ResumeBuilder />} /></Route>
        <Route
          path="/"
          element={
            <div>
              {" "}
              <Header1 />
              <HomeNew />
            </div>
          }
        />
        <Route path="*" element={<NotFound />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route
          path="/black"
          element={
            <div>
              {" "}
              <Header />
              <NewHomeBlack />
              <Footer />
            </div>
          }
        />
        <Route
          path="/email-status"
          element={
            <div>
              <EmailStatus />
            </div>
          }
        />
        <Route path="/postBlog" element={<BlogEditor />} />
        <Route
          path="/codingRound/:userId/:id/:jobId"
          element={<CodingRound />}
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/demo" element={<Demo />} />
        <Route
          path="/videoAssessment/:userId/:id/:jobId"
          element={<VideoAssessment />}
        />
        <Route path="/codeEditor" element={<CodeEditor />} />
        <Route
          path="/update-profile/:token"
          element={
            <div>
              <UpdateProfile />
            </div>
          }
        />
        {/* <Route
              path="/demoVideoAssessment/:userId/:id/:jobId"
              element={<DemoVideoAssessment />}
            /> */}
        <Route path="/feedbackForm" element={<FeedbackPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog-details/:topic/:id" element={<BlogArticle />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route
          path="/reports"
          element={
            <div>
              {" "}
              <Header1 />
              <ReportsPage />
            </div>
          }
        />
        <Route path="/pricing" element={<PricingChooser />} />
        <Route path="/pricing/candidate" element={<CandidatePricing />} />
        <Route path="/pricing/employer" element={<EmployerPricing />} />
        {/**employer */}
        <Route path="/employers" element={<EmployerLanding />} />
        <Route element={<ProtectedRoute allowedRole="Employer" />}>
          <Route
            path="/aiFitment"
            element={
              <EmployerWorkspace><AiFitmentAnalysis /></EmployerWorkspace>
            }
          />
        </Route>
        {/**candidates */}
        <Route element={<ProtectedRoute allowedRole="Candidate" />}>
          <Route
            path="/aiJobSearch"
            element={
              <div>
                {" "}
                <Header1 />
                <AiJobSearch />
              </div>
            }
          />
        </Route>
        <Route path="/practiceInterviewLanding" element={<PracticeLanding />} />
        <Route element={<ProtectedRoute allowedRole="Candidate" />}>
          <Route
            path="/practicalAssessment"
            element={
              <div>
                <SetupForm />
              </div>
            }
          />
        </Route>
        <Route element={<ProtectedRoute allowedRole="Candidate" />}>
          {" "}
          <Route
            path="/practical-interview"
            element={<PracticalAssessment />}
          />
        </Route>
        <Route element={<ProtectedRoute allowedRole="Candidate" />}>
          {" "}
          <Route path="/coding-practice" element={<CodingPractice />} />
        </Route>
        <Route
          path="/pricing/success"
          element={
            <div>
              {" "}
              <Header1 />
              <PricingSuccess />
            </div>
          }
        />
        <Route
          path="/pricing/cancel"
          element={
            <div>
              {" "}
              <Header1 />
              <Cancel />
            </div>
          }
        />
        <Route path="/linkedIn/success" element={<Success />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/termsAndCondition" element={<PolicyPage kind="terms" />} />
        <Route path="/privacyCenter" element={<PolicyPage kind="privacy" />} />
        <Route path="/securityCenter" element={<PolicyPage kind="security" />} />
        <Route
          path="/find-jobs"
          element={
            <div>
              {" "}
              <Header1 />
              <JobList />
              <Footer />
            </div>
          }
        />
        <Route
          path="/job-detail/:userId/:jobId"
          element={
            <BrowseAccess><div>
              {" "}
              <Header1 />
              <JobSingle />
            </div></BrowseAccess>
          }
        />
        <Route element={<ProtectedRoute allowedRole="Employer" />}>
          {" "}
          <Route
            path="/employer-dashboard"
            element={
              <EmployerWorkspace><Dashboard /></EmployerWorkspace>
            }
          />
        </Route>
        <Route
          path="/employers-list"
          element={
            <BrowseAccess><div>
              {" "}
              <Header1 />
              <EmployersList />
            </div></BrowseAccess>
          }
        />
        <Route
          path="employers/:id"
          element={
            <BrowseAccess><div>
              {" "}
              <Header1 />
              <EmployersSingle />
            </div></BrowseAccess>
          }
        />
        <Route element={<ProtectedRoute allowedRole="Candidate" />}>
          {" "}
          <Route
            path="/candidate-dashboard"
            element={
              <div className="dashboard">
                {" "}
                <Header1 />
                <CandidatesSidebar />
                <CandidateDashboard />
              </div>
            }
          />
        </Route>{" "}
        <Route
          path="/candidates-list"
          element={
            localStorage.getItem("Role") === "Employer" ? <EmployerWorkspace><CandidatesList /></EmployerWorkspace> : <><Header1 /><CandidatesList /></>
          }
        />
        <Route
          path="/globalSearch"
          element={
            localStorage.getItem("Role") === "Employer" ? <EmployerWorkspace><GlobalSearch /></EmployerWorkspace> : <><Header1 /><GlobalSearch /></>
          }
        />
        <Route element={<ProtectedRoute allowedRole="Employer" />}>
          <Route
            path="/aiSearch"
            element={
              <EmployerWorkspace><AiResumeSearch /></EmployerWorkspace>
            }
          />
        </Route>
        <Route
          path="/candidates-single/:id"
          element={
            <div>
              {" "}
              <Header1 />
              <CandidatesSingle />
            </div>
          }
        />
        <Route element={<ProtectedRoute allowedRole="Candidate" />}>
          {candidatesRoutes.map((e) => (
            <Route
              key={e.path}
              path={e.path}
              element={
                <div className="dashboard">
                  <Header1 />
                  <CandidatesSidebar />
                  {e.element}
                </div>
              }
            />
          ))}
        </Route>
        <Route element={<ProtectedRoute allowedRole="Employer" />}>
          {EmployersRoutes.map((e) => (
            <Route
              key={e.path}
              path={e.path}
              element={
                <EmployerWorkspace>{e.element}</EmployerWorkspace>
              }
            />
          ))}
        </Route>
        {/*      <Route element={<ProtectedRoute allowedRole="Vendor" />}>*/}
        {VendorRoutes.map((e) => (
          <Route
            key={e.path}
            path={e.path}
            element={
              <div className="dashboard">
                <Header1 />
                <VendorSidebar />
                {e.element}
              </div>
            }
          />
        ))}
        {/*</Route>*/}
        {/*candidatesRoutes?.map((e) => (
              <Route
                key={e}
                path={e.path}
                element={
                  <div className="dashboard">
                    <Header1 />
                    <CandidatesSidebar />
                    {e.element}
                  </div>
                }
              />
            ))
            {EmployersRoutes?.map((e) => (
              <Route
                key={e}
                path={e.path}
                element={
                  <div className="dashboard">
                    <Header1 />
                    <EmployerSidebar />
                    {e.element}
                  </div>
                }
              />
            ))}*/}
      </Routes>
    );
  }
  return (
    <>
      <GlobalStyles />
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollProvider>
        {" "}
        <BrowserRouter><PortalTheme /><PurchaseReturn />
          <EmployerAccess><AppLayout /></EmployerAccess>
        </BrowserRouter>
      </ScrollProvider>
    </>
  );
}

export default App;





/* <Route
          path="/login"
          element={
            <div>
              {" "}
            
              <Login />
            </div>
          }
        />

        <Route
          path="/register"
          element={
            <div>
              {" "}
             
              <Register />
            </div>
          }
        /> */


  /* <Route
          path="*"
          element={
            <div>
              {" "}
              <Header />
              <Home />
              <Footer />
            </div>
          }
        /> */


  /*    <Route
              path="/savedResume"
              element={
                <div>
                  {" "}
                  <Header1 />
                  <SavedResumes />
                </div>
              }
            />*/

