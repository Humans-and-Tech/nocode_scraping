import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ProductPage from "./views/ProductPage/ProductPage";

const rootElement = document.getElementById("root");
// to prevent TS compilation error
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

/**
 * the default route is /applications
 * but if the user is not authed, he/she is redirected to /login
 */
root.render(
  <StrictMode>
    <ProductPage />
  </StrictMode>
);
