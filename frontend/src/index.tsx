import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from 'react-query';

import spiderStore from './store';
import { Provider } from 'react-redux';

import ProductSheet from './views/ProductSheet/ProductSheet';
import OnBoarding from './views/OnBoarding/OnBoarding';
import { ScrapingLayout, OnBoardingLayout } from './components/Layout/Layout';
import { ScrapingServicesProvider, SpiderServicesProvider } from './BackendProvider';
import { ScrapingContext, SpiderContext } from './BackendContext';
import { SpiderConfigSummary } from './components/Spider/SpiderConfigSummary';

import './i18n';

const rootElement = document.getElementById('root');
// to prevent TS compilation error
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

// Create a client
// const queryClient = new QueryClient();

/**
 * the default route is /applications
 * but if the user is not authed, he/she is redirected to /login
 *
 */
root.render(
  <StrictMode>
    {/* <QueryClientProvider client={queryClient}> */}
    <Router>
      <Routes>
        <Route
          path="/onboarding"
          element={
            <OnBoardingLayout>
              <OnBoarding />
            </OnBoardingLayout>
          }
        />

        <Route
          path="/spider/:name/product-sheet"
          element={
            /**
             * Several providers here for the time being
             * - Redux provider to refresh spider for some actions
             * - Scraping backend provider
             * - spider backend provider
             *
             * TODO: spider backend provider could be removed to use only the Redux provider
             */
            <Provider store={spiderStore}>
              <ScrapingLayout header={<SpiderConfigSummary />}>
                <SpiderContext.Provider value={SpiderServicesProvider}>
                  <ScrapingContext.Provider value={ScrapingServicesProvider}>
                    <ProductSheet />
                  </ScrapingContext.Provider>
                </SpiderContext.Provider>
              </ScrapingLayout>
            </Provider>
          }
        />

        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </Router>
    {/* </QueryClientProvider> */}
  </StrictMode>
);
