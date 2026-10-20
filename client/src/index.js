import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Modal from "react-modal";
import { CookiesProvider } from "react-cookie";
import "./styles/tailwind.css";

window.onerror = function (message, source, lineno, colno, error) {
  console.log("ERROR:", { message, source, lineno, colno, error });
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CookiesProvider defaultSetOptions={{ path: "/" }}>
      <App />
    </CookiesProvider>
  </React.StrictMode>
);
