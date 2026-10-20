import React, { createContext, useContext, useState, useEffect } from "react";

// Create the TotalTimeContext
const TotalTimeContext = createContext();

// TotalTimeProvider component
export const TotalTimeProvider = ({ children }) => {
  const [totalTime, setTotalTime] = useState(0); // Total time in seconds

  const addTime = (seconds) => {
    setTotalTime((prevTime) => prevTime + seconds);
  };

  return (
    <TotalTimeContext.Provider value={{ totalTime, addTime }}>
      {children}
    </TotalTimeContext.Provider>
  );
};

// Custom hook to use TotalTimeContext
export const useTotalTime = () => useContext(TotalTimeContext);
