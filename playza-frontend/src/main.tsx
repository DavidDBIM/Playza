// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router";
import ScrollToTop from "./components/ScrollToTop";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ScrollToTop />
    <App />
  </BrowserRouter>,
);
