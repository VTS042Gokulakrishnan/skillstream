import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublicShell from "./PublicShell";
import { PublicAuthDialogs, useSessionRole } from "./PublicHeader";

// Marketing and search stay public. Mount detail/directory views only after sign-in.
export default function BrowseAccess({ children }) {
  const role = useSessionRole();
  const [auth, setAuth] = useState("login");
  if (role) return children;
  return <PublicShell title="Sign in to continue">
    <section className="ss-center ss-section"><h1>Take the next step.</h1><p>Sign in to explore this page. You can keep searching for jobs without an account.</p><button className="ss-btn" onClick={() => setAuth("login")}>Candidate sign in</button><p style={{ marginTop:24 }}><Link to="/find-jobs">Back to job search →</Link></p></section>
    <PublicAuthDialogs auth={auth} setAuth={setAuth} />
  </PublicShell>;
}
