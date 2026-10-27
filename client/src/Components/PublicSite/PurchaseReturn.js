import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Return to the selected pack after onboarding, without starting a payment.
export default function PurchaseReturn() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (
      pathname === "/candidate-dashboard" &&
      localStorage.getItem("Role") === "Candidate" &&
      localStorage.getItem("token") &&
      sessionStorage.getItem("practicePlanIntent")
    ) {
      navigate("/pricing/candidate", { replace: true });
    }
  }, [pathname, navigate]);
  return null;
}
