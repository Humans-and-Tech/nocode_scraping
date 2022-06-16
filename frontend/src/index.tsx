import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import "./i18n";
import { SocketContext, socket } from "./socket";
import ProductSheet from "./views/ProductPage/ProductSheet";
import OnBoarding from './views/OnBoarding/OnBoarding';
import { ScraperLayout } from './Layout'



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
    <SocketContext.Provider value={socket}>
      <Router>
        <Routes>

          <Route
            path="/onboarding"
            element={
              <OnBoarding />
            }
          />

          <Route
            path="/product-sheet"
            element={

              <ScraperLayout>
                <ProductSheet />
              </ScraperLayout>

            }
          />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </Router>
    </SocketContext.Provider>
  </StrictMode>
);
