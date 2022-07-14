import React from 'react';
import { IBackendServicesProvider, BackendServicesProvider } from './BackendProvider';

export const BackendContext = React.createContext<IBackendServicesProvider>(BackendServicesProvider);
