export interface ScrapingElement {
    name: string;
    selector: string;
    language?: "css" | "xpath";
}