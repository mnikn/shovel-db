import React from "react";
import { createRoot } from "react-dom/client";
import App from "./pages/app";
/* import "./electron/context_menu"; */

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);
root.render(<App />);
