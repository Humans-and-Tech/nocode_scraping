import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
// import { SpiderSocketContext, spiderSocket, ScrapingSocketContext, scrapingSocket } from './socket';
import ProductSheet from './views/ProductSheet/ProductSheet';
import OnBoarding from './views/OnBoarding/OnBoarding';
import { ScraperLayout, OnBoardingLayout } from './components/Layout/Layout';
import { BackendContext, BackendServicesProvider } from './ConfigurationContext';
import { SpiderConfigSummary } from './components/Spider/SpiderConfigSummary';

const rootElement = document.getElementById('root');
// to prevent TS compilation error
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

/**
 * the default route is /applications
 * but if the user is not authed, he/she is redirected to /login
 * 
 */
root.render(
  <StrictMode>
    <BackendContext.Provider value={BackendServicesProvider}>
      <Router>
        <Routes>
          
            <Route
              path="/onboarding"
              element={
                <OnBoardingLayout>
                  {/* <SpiderSocketContext.Provider value={spiderSocket}> */}
                    {/* <ScrapingContext.Provider value={SpiderProvider}> */}
                      <OnBoarding />
                    {/* </ScrapingContext.Provider> */}
                  {/* </SpiderSocketContext.Provider> */}
                </OnBoardingLayout>
              }
            />

            <Route
              path="/spider/:name/product-sheet"
              element={
                <ScraperLayout header={<SpiderConfigSummary />}>
                  {/* <SpiderSocketContext.Provider value={spiderSocket}> */}
                    {/* <ScrapingSocketContext.Provider value={scrapingSocket}> */}
                      <ProductSheet />
                    {/* </ScrapingSocketContext.Provider> */}
                  {/* </SpiderSocketContext.Provider> */}
                </ScraperLayout>
              }
            />

          <Route path="*" element={<Navigate to="/onboarding" replace />} />

        </Routes>
      </Router>
</BackendContext.Provider>
  </StrictMode>
);
