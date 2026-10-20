import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const INACTIVITY_LIMIT = 25 * 60 * 1000; // 25 minutes in milliseconds
// const INACTIVITY_LIMIT = 1 * 60 * 1000; // 1 minute in milliseconds

function useAutoLogout() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const lastActivityTimeRef = useRef(Date.now());
  const elapsedTimeRef = useRef(0);
  const intervalRef = useRef(null);

  const logout = () => {
    localStorage.clear();
    toast.error("Logged out due to inactivity!,Please login again! ", {
      duration: 4000,
    });
    navigate("/");
  };

  const resetActivityTimer = () => {
    lastActivityTimeRef.current = Date.now();
    elapsedTimeRef.current = 0; // reset elapsed time on any user activity
  };

  useEffect(() => {
    if (!token) return;

    const activityEvents = [
      "mousemove",
      "mousedown",
      "click",
      "scroll",
      "keypress",
    ];

    const handleActivity = () => {
      if (document.visibilityState === "visible") {
        resetActivityTimer();
      }
    };

    const startInactivityCheck = () => {
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible") {
          elapsedTimeRef.current += 1000;

          if (elapsedTimeRef.current >= INACTIVITY_LIMIT) {
            logout();
          }
        }
      }, 1000); // check every 1 second
    };

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );
    document.addEventListener("visibilitychange", resetActivityTimer);

    resetActivityTimer();
    startInactivityCheck();

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      document.removeEventListener("visibilitychange", resetActivityTimer);
      clearInterval(intervalRef.current);
    };
  }, [token, navigate]);
}

export default useAutoLogout;
// import { useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";

// // const INACTIVITY_LIMIT = 25 * 60 * 1000; // 25 minutes in milliseconds
// const INACTIVITY_LIMIT = 1 * 60 * 1000; // 1 minute in milliseconds
// function useAutoLogout() {
//   let token = localStorage.getItem("token");
//   const timeoutRef = useRef(null);
//   const navigate = useNavigate();

//   const resetTimer = () => {
//     if (token) {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//       timeoutRef.current = setTimeout(() => {
//         // logout user here
//         localStorage.removeItem("token");
//         localStorage.removeItem("Role");
//         localStorage.removeItem("Subscribed");
//         localStorage.removeItem("ProfileCompleted");
//         localStorage.removeItem("linkedinAccessToken");
//         localStorage.removeItem("UserId"); // or your auth token key
//         localStorage.removeItem("linkedinAccessToken");
//         localStorage.removeItem("captchaVerifiedTime");
//         localStorage.clear();
//         // alert("You have been logged out due to inactivity.");

//         navigate("/"); // redirect to login page
//       }, INACTIVITY_LIMIT);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       // List of events that reset the timer
//       const events = ["mousemove", "mousedown", "click", "scroll", "keypress"];
//       events.forEach((event) => window.addEventListener(event, resetTimer));

//       resetTimer(); // start timer on mount

//       return () => {
//         events.forEach((event) =>
//           window.removeEventListener(event, resetTimer)
//         );
//         clearTimeout(timeoutRef.current);
//       };
//     }
//   }, []);
// }

// export default useAutoLogout;
