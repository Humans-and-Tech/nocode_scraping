import React, { StrictMode, } from "react";
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
import { ScraperLayout, OnBoardingLayout } from './Layout'
import { ScrapingConfig } from "./interfaces";



const rootElement = document.getElementById("root");
// to prevent TS compilation error
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);


export interface ScrapingConfigProvider {
  getConfig: () => ScrapingConfig | null;
  setConfig: (config: ScrapingConfig | null) => void;
}

/**
 * the website config is only stored locally
 * it is not savec by the backend 
 * 
 * @returns 
 */
function useConfig(): ScrapingConfigProvider {

  // TODO
  // prevent errors by try/catch 
  const getConfig = (): ScrapingConfig | null => {
    const stored = localStorage.getItem('config');
    if (stored !== null) {
      return JSON.parse(stored);
    }
    return null;
  };

  const setConfig = (config: ScrapingConfig | null): void => {
    if (config == null) {
      localStorage.removeItem('config');
    } else {
      localStorage.setItem('config', JSON.stringify(config));
    }
  };

  return { getConfig, setConfig };
}

const configProvider: ScrapingConfigProvider = useConfig();

/**
 * the scraping context will convey
 * the config accross all elements
 */
export const ScrapingContext = React.createContext<ScrapingConfigProvider>(configProvider);


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
              <OnBoardingLayout>
                <ScrapingContext.Provider value={configProvider}>
                  <OnBoarding />
                </ScrapingContext.Provider>
              </OnBoardingLayout>
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
