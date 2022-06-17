import React from "react";
import { ScrapingConfig } from "./interfaces";

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

export const ConfigProvider: ScrapingConfigProvider = useConfig();

/**
 * the scraping context will convey
 * the config accross all elements
 */
export const ScrapingContext = React.createContext<ScrapingConfigProvider>(ConfigProvider);