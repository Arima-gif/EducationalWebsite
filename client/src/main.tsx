import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handlers to prevent unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Silently prevent unhandled rejections from showing in console
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  // Silently handle global errors
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
