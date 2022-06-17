import React from "react";
import { ScrapingConfig } from "./interfaces";

export interface ScrapingConfigProvider {
    getConfig: () => ScrapingConfig;
    setConfig: (config: ScrapingConfig | null) => void;
}

const createConfig = (): ScrapingConfig => {
    return {
        websiteConfig: {},
    };
};

/**
 * the website config is only stored locally
 * it is not savec by the backend 
 * 
 * @returns 
 */
function useConfig(): ScrapingConfigProvider {

    const getConfig = (): ScrapingConfig => {
        const stored = localStorage.getItem('config');
        if (stored !== null) {
            return JSON.parse(stored);
        }
        // create a void config
        return createConfig();
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