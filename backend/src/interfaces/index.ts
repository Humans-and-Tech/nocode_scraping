export interface ScrapingElement {
    name: string | undefined;
    label?: string;
}

export interface Selector {
    url?: string;
    element: ScrapingElement;
    path?: string;
    language?: "css" | "xpath";
}