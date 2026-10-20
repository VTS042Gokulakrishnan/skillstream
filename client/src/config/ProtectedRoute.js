// import React from "react";
// import { Route, Navigate } from "react-router-dom";
// import { isAuthenticated } from "./utils/auth";

// const ProtectedRoute = ({ element, ...rest }) => {
//   return (
//     <Route
//       {...rest}
//       element={isAuthenticated() ? element : <Navigate to="/login" replace />}
//     />
//   );
// };

// export default ProtectedRoute;
import { Navigate, Outlet } from "react-router-dom";

// Protected Route Component
const ProtectedRoute = ({ allowedRole }) => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("Role"); // "candidate" or "company"

  if (!token) {
    return <Navigate to="/" replace />; // Redirect if not logged in
  } else if (allowedRole && allowedRole !== userType) {
    // console.log(allowedRole);
    
    return <Navigate to="/not-found" replace />; // Restrict access based on role
  }

  return <Outlet />;
};
export default ProtectedRoute;
//
