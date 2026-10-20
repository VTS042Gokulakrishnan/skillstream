import React from "react";
import { TotalTimeProvider } from "./TotalTimeContext";
import QuestionPanel from "./QuestionPanel"; // Import your components

function App() {
  return (
    <TotalTimeProvider>
      <QuestionPanel question="Your Question Here" onAnswer={(answer) => { /* handle answer */ }} />
    </TotalTimeProvider>
  );
}

export default App;
