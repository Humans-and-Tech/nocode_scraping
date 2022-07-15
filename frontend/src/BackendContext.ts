import React from 'react';
import { ISpiderBackend, IScrapingBackend, ScrapingServicesProvider, SpiderServicesProvider } from './BackendProvider';

export const ScrapingContext = React.createContext<IScrapingBackend>(ScrapingServicesProvider);
export const SpiderContext = React.createContext<ISpiderBackend>(SpiderServicesProvider);
