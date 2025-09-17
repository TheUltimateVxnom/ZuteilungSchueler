import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";  // ./App.jsx, NICHT /src/App.jsx
import "./index.css";          // falls du Tailwind nutzt

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
