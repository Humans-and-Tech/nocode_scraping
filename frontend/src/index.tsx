import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import './i18n';

import ProductSheet from './views/ProductSheet/ProductSheet';
import OnBoarding from './views/OnBoarding/OnBoarding';
import { ScrapingLayout, OnBoardingLayout } from './components/Layout/Layout';
import { BackendServicesProvider } from './BackendProvider';
import {BackendContext} from './BackendContext';
import { SpiderConfigSummary } from './components/Spider/SpiderConfigSummary';

const rootElement = document.getElementById('root');
// to prevent TS compilation error
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

// Create a client
const queryClient = new QueryClient();

/**
 * the default route is /applications
 * but if the user is not authed, he/she is redirected to /login
 *
 */
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BackendContext.Provider value={BackendServicesProvider}>
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
                <ScrapingLayout header={<SpiderConfigSummary />}>
                  <ProductSheet />
                </ScrapingLayout>
              }
            />

            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </Router>
      </BackendContext.Provider>
    </QueryClientProvider>
  </StrictMode>
);
