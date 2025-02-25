import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx";
import { SecurityProvider } from './context/SecurityContext.jsx';
import "./styles/main.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SecurityProvider>
      <App />
    </SecurityProvider>
  </React.StrictMode>
);